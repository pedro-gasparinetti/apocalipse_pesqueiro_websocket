// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CommonsFishingGame
 * @notice On-chain coordination game inspired by the "tragedy of the commons" fishing exercise.
 *         Players join a room, lock a buy-in, and play synchronized rounds where they choose
 *         how many "fish" to harvest and optionally inspect another player. The contract
 *         applies the same economics as the current websocket game, adds commit/reveal to stop
 *         copy-cat moves, and exposes rich events to drive a subgraph or analytics pipeline.
 *
 *         Fish counts are game points (not ERC20 tokens). Payouts come from the prize pool
 *         (buy-ins + optional funding) and are distributed pro-rata to each player's final
 *         basket. This avoids token shortfalls even when lake growth mints virtual fish.
 */
contract CommonsFishingGame is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant VERSION = 1;
    uint256 private constant BPS_DENOMINATOR = 10_000; // basis points = 0.01%

    struct GameConfig {
        uint256 sustainableCatch;       // limiteSustentavel per round
        uint256 maxCatchPerRound;       // limitePossivelRodada
        uint256 maxRounds;              // limiteRodadas
        uint256 growthRateBps;          // taxaCrescimento (e.g. 200 = 2%)
        uint256 inspectionCost;         // custoFiscalizacao (fish points)
        uint256 initialLakePerPlayer;   // quantidadeInicialPeixesJogador
        uint256 commitPhaseSeconds;     // commit window per round
        uint256 revealPhaseSeconds;     // reveal window per round
        uint256 entryFee;               // token amount each player deposits to join
    }

    struct PlayerState {
        bool joined;
        bool active;
        bool claimed;
        uint256 basket;            // accumulated fish points
        uint256 totalCaught;
        uint256 totalFinesPaid;
        uint256 totalFinesReceived;
        uint256 totalInspections;
    }

    struct Move {
        bytes32 commitment;
        bool committed;
        bool revealed;
        uint256 requestedCatch;
        address inspectTarget;
        uint256 actualCatch;
        uint256 netCatch;
        bool cheated;
        uint256 fine;
        uint256 rewardPerInspector;
    }

    struct RoundMeta {
        uint256 number;
        uint256 lakeAtStart;
        uint256 lakeAtEnd;
        uint256 bankDelta;
        uint256 growth;
        uint256 commitDeadline;
        uint256 revealDeadline;
        bool finalized;
        uint256 revealedCount;
    }

    struct Game {
        address host;
        IERC20 paymentToken;
        address treasury;
        GameConfig config;
        bool started;
        bool ended;
        uint256 createdAt;
        uint256 prizePool;
        uint256 bank;
        uint256 lake;
        uint256 currentRound;
        uint256 totalScore; // sum of all baskets
        address[] players;
        mapping(address => PlayerState) playerState;
        mapping(uint256 => RoundMeta) rounds;
        mapping(uint256 => mapping(address => Move)) moves;
    }

    uint256 public nextGameId = 1;
    mapping(uint256 => Game) private games;

    // --- Events for subgraph/analytics ---
    event GameCreated(
        uint256 indexed gameId,
        address indexed host,
        address paymentToken,
        address treasury,
        uint256 sustainableCatch,
        uint256 maxCatchPerRound,
        uint256 maxRounds,
        uint256 growthRateBps,
        uint256 inspectionCost,
        uint256 initialLakePerPlayer,
        uint256 commitPhaseSeconds,
        uint256 revealPhaseSeconds,
        uint256 entryFee,
        uint256 timestamp
    );

    event PrizeFunded(uint256 indexed gameId, address indexed funder, uint256 amount);
    event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 deposit);
    event GameStarted(uint256 indexed gameId, uint256 initialLake, uint256 commitDeadline, uint256 revealDeadline);
    event RoundOpened(
        uint256 indexed gameId,
        uint256 indexed round,
        uint256 lakeAtStart,
        uint256 commitDeadline,
        uint256 revealDeadline
    );
    event MoveCommitted(uint256 indexed gameId, uint256 indexed round, address indexed player, bytes32 commitment);
    event MoveRevealed(
        uint256 indexed gameId,
        uint256 indexed round,
        address indexed player,
        uint256 requestedCatch,
        address inspectTarget
    );
    event MoveResolved(
        uint256 indexed gameId,
        uint256 indexed round,
        address indexed player,
        uint256 actualCatch,
        uint256 netCatch,
        bool cheated,
        address[] inspectors,
        uint256 fine,
        uint256 rewardPerInspector,
        uint256 basketAfter
    );
    event RoundFinalized(
        uint256 indexed gameId,
        uint256 indexed round,
        uint256 lakeAtStart,
        uint256 lakeAtEnd,
        uint256 growth,
        uint256 bankDelta,
        uint256 totalCatch,
        bool gameEnded
    );
    event Claimed(uint256 indexed gameId, address indexed player, uint256 amount);
    event GameEnded(uint256 indexed gameId, uint256 totalScore, uint256 prizePool);

    // --- Errors ---
    error NotHost();
    error InvalidGame();
    error AlreadyStarted();
    error NotStarted();
    error GameEndedAlready();
    error InvalidConfig();
    error PlayerExists();
    error NotAPlayer();
    error WrongRound();
    error CommitWindowClosed();
    error RevealNotOpen();
    error RevealWindowClosed();
    error AlreadyRevealed();
    error InvalidMove();
    error NothingToClaim();
    error GameNotFinished();

    // --- Modifiers ---
    modifier onlyHost(uint256 gameId) {
        Game storage g = games[gameId];
        if (g.host == address(0)) revert InvalidGame();
        if (msg.sender != g.host) revert NotHost();
        _;
    }

    modifier gameExists(uint256 gameId) {
        if (games[gameId].host == address(0)) revert InvalidGame();
        _;
    }

    // --- External API ---

    function createGame(
        IERC20 paymentToken,
        GameConfig calldata config,
        address treasury
    ) external returns (uint256 gameId) {
        _validateConfig(config);

        gameId = nextGameId++;
        Game storage g = games[gameId];
        g.host = msg.sender;
        g.paymentToken = paymentToken;
        g.treasury = treasury;
        g.config = config;
        g.createdAt = block.timestamp;

        emit GameCreated(
            gameId,
            msg.sender,
            address(paymentToken),
            treasury,
            config.sustainableCatch,
            config.maxCatchPerRound,
            config.maxRounds,
            config.growthRateBps,
            config.inspectionCost,
            config.initialLakePerPlayer,
            config.commitPhaseSeconds,
            config.revealPhaseSeconds,
            config.entryFee,
            block.timestamp
        );
    }

    function fundPrizePool(uint256 gameId, uint256 amount) external gameExists(gameId) {
        Game storage g = games[gameId];
        if (g.ended) revert GameEndedAlready();
        if (amount == 0) return;
        g.prizePool += amount;
        g.paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        emit PrizeFunded(gameId, msg.sender, amount);
    }

    function joinGame(uint256 gameId) external nonReentrant gameExists(gameId) {
        Game storage g = games[gameId];
        if (g.started) revert AlreadyStarted();
        PlayerState storage p = g.playerState[msg.sender];
        if (p.joined) revert PlayerExists();

        p.joined = true;
        p.active = true;
        g.players.push(msg.sender);

        if (g.config.entryFee > 0) {
            g.prizePool += g.config.entryFee;
            g.paymentToken.safeTransferFrom(msg.sender, address(this), g.config.entryFee);
        }

        emit PlayerJoined(gameId, msg.sender, g.config.entryFee);
    }

    function cancelUnstartedGame(uint256 gameId) external nonReentrant onlyHost(gameId) {
        Game storage g = games[gameId];
        if (g.started) revert AlreadyStarted();

        uint256 pool = g.prizePool;
        uint256 fee = g.config.entryFee;
        if (fee > 0) {
            for (uint256 i = 0; i < g.players.length; i++) {
                address player = g.players[i];
                g.paymentToken.safeTransfer(player, fee);
            }
            uint256 refundTotal = fee * g.players.length;
            if (refundTotal <= pool) {
                pool -= refundTotal;
            } else {
                pool = 0;
            }
        }

        if (pool > 0) {
            g.paymentToken.safeTransfer(msg.sender, pool);
        }

        // Prevent reuse
        delete games[gameId];
    }

    function startGame(uint256 gameId) external onlyHost(gameId) {
        Game storage g = games[gameId];
        if (g.started) revert AlreadyStarted();
        if (g.players.length == 0) revert InvalidConfig();

        g.started = true;
        g.currentRound = 1;
        g.lake = g.players.length * g.config.initialLakePerPlayer;

        RoundMeta storage r = g.rounds[g.currentRound];
        r.number = 1;
        r.lakeAtStart = g.lake;
        r.commitDeadline = block.timestamp + g.config.commitPhaseSeconds;
        r.revealDeadline = r.commitDeadline + g.config.revealPhaseSeconds;

        emit GameStarted(gameId, r.lakeAtStart, r.commitDeadline, r.revealDeadline);
        emit RoundOpened(gameId, r.number, r.lakeAtStart, r.commitDeadline, r.revealDeadline);
    }

    function commitMove(uint256 gameId, bytes32 commitment) external gameExists(gameId) {
        Game storage g = games[gameId];
        if (!g.started) revert NotStarted();
        if (g.ended) revert GameEndedAlready();

        RoundMeta storage r = g.rounds[g.currentRound];
        if (block.timestamp > r.commitDeadline) revert CommitWindowClosed();

        PlayerState storage p = g.playerState[msg.sender];
        if (!p.joined || !p.active) revert NotAPlayer();

        Move storage m = g.moves[g.currentRound][msg.sender];
        m.commitment = commitment;
        if (!m.committed) {
            m.committed = true;
        }

        emit MoveCommitted(gameId, g.currentRound, msg.sender, commitment);
    }

    function revealMove(
        uint256 gameId,
        uint256 requestedCatch,
        address inspectTarget,
        bytes32 salt
    ) external gameExists(gameId) {
        Game storage g = games[gameId];
        if (!g.started) revert NotStarted();
        if (g.ended) revert GameEndedAlready();

        RoundMeta storage r = g.rounds[g.currentRound];
        if (block.timestamp < r.commitDeadline) revert RevealNotOpen();
        if (block.timestamp > r.revealDeadline) revert RevealWindowClosed();
        if (requestedCatch > g.config.maxCatchPerRound) revert InvalidMove();
        if (inspectTarget != address(0)) {
            if (requestedCatch > g.config.sustainableCatch) revert InvalidMove();
            if (!g.playerState[inspectTarget].joined) revert InvalidMove();
            if (inspectTarget == msg.sender) revert InvalidMove();
        }

        PlayerState storage p = g.playerState[msg.sender];
        if (!p.joined || !p.active) revert NotAPlayer();

        Move storage m = g.moves[g.currentRound][msg.sender];
        if (!m.committed) revert InvalidMove();
        if (m.revealed) revert AlreadyRevealed();
        if (keccak256(abi.encode(gameId, g.currentRound, requestedCatch, inspectTarget, salt)) != m.commitment) {
            revert InvalidMove();
        }

        m.revealed = true;
        m.requestedCatch = requestedCatch;
        m.inspectTarget = inspectTarget;

        r.revealedCount += 1;

        emit MoveRevealed(gameId, g.currentRound, msg.sender, requestedCatch, inspectTarget);
    }

    function finalizeRound(uint256 gameId) external gameExists(gameId) {
        Game storage g = games[gameId];
        if (!g.started) revert NotStarted();
        if (g.ended) revert GameEndedAlready();

        RoundMeta storage r = g.rounds[g.currentRound];
        if (r.finalized) revert WrongRound();
        bool everyoneRevealed = r.revealedCount == g.players.length;
        if (!everyoneRevealed && block.timestamp <= r.revealDeadline) {
            revert RevealWindowClosed();
        }

        uint256 playerCount = g.players.length;
        uint256[] memory requested = new uint256[](playerCount);

        for (uint256 i = 0; i < playerCount; i++) {
            address player = g.players[i];
            Move storage m = g.moves[g.currentRound][player];
            if (m.revealed) {
                requested[i] = m.requestedCatch;
            }
        }

        (uint256[] memory actual, uint256 leftover) = _distribute(requested, r.lakeAtStart);

        uint256 totalCatch;
        uint256 bankDelta;
        for (uint256 i = 0; i < playerCount; i++) {
            address player = g.players[i];
            Move storage m = g.moves[g.currentRound][player];

            m.actualCatch = actual[i];

            uint256 netCatch = actual[i];
            if (m.inspectTarget != address(0)) {
                if (netCatch > g.config.inspectionCost) {
                    netCatch -= g.config.inspectionCost;
                } else {
                    netCatch = 0;
                }
                bankDelta += g.config.inspectionCost;
                g.bank += g.config.inspectionCost;
                g.playerState[player].totalInspections += 1;
            }

            address[] memory inspectors = _inspectorsFor(g, g.currentRound, player);
            bool cheated = netCatch > g.config.sustainableCatch;
            m.cheated = cheated;

            if (cheated && inspectors.length > 0) {
                uint256 fine = (netCatch * 1_000) / BPS_DENOMINATOR; // 10%
                uint256 poolForInspectors = netCatch - fine;
                uint256 share = inspectors.length > 0 ? poolForInspectors / inspectors.length : 0;
                uint256 remainder = inspectors.length > 0 ? poolForInspectors % inspectors.length : 0;

                m.fine = fine;
                m.rewardPerInspector = share;
                netCatch = 0;
                bankDelta += fine + remainder;
                g.bank += fine + remainder;
                g.playerState[player].totalFinesPaid += fine;

                for (uint256 j = 0; j < inspectors.length; j++) {
                    address inspector = inspectors[j];
                    g.playerState[inspector].basket += share;
                    g.playerState[inspector].totalFinesReceived += share;
                    g.totalScore += share;
                }
            } else {
                g.playerState[player].basket += netCatch;
                g.playerState[player].totalCaught += netCatch;
                g.totalScore += netCatch;
            }

            m.netCatch = netCatch;
            totalCatch += actual[i];

            emit MoveResolved(
                gameId,
                g.currentRound,
                player,
                actual[i],
                netCatch,
                m.cheated,
                inspectors,
                m.fine,
                m.rewardPerInspector,
                g.playerState[player].basket
            );
        }

        r.bankDelta = bankDelta;
        r.growth = (r.lakeAtStart * g.config.growthRateBps) / BPS_DENOMINATOR;
        uint256 lakeAfterCatch = leftover; // leftover == lakeAtStart - totalCatch
        if (bankDelta >= lakeAfterCatch) {
            lakeAfterCatch = 0;
        } else {
            lakeAfterCatch -= bankDelta;
        }
        r.lakeAtEnd = lakeAfterCatch + r.growth;
        r.finalized = true;
        g.lake = r.lakeAtEnd;

        bool gameEnded = g.currentRound >= g.config.maxRounds || r.lakeAtEnd < 1;
        if (gameEnded) {
            g.ended = true;
            emit GameEnded(gameId, g.totalScore, g.prizePool);
        } else {
            // Prepare next round deadlines based on now to avoid inherited lag
            g.currentRound += 1;
            RoundMeta storage next = g.rounds[g.currentRound];
            next.number = g.currentRound;
            next.lakeAtStart = r.lakeAtEnd;
            next.commitDeadline = block.timestamp + g.config.commitPhaseSeconds;
            next.revealDeadline = next.commitDeadline + g.config.revealPhaseSeconds;

            emit RoundOpened(gameId, next.number, next.lakeAtStart, next.commitDeadline, next.revealDeadline);
        }

        emit RoundFinalized(
            gameId,
            r.number,
            r.lakeAtStart,
            r.lakeAtEnd,
            r.growth,
            bankDelta,
            totalCatch,
            gameEnded
        );
    }

    function claim(uint256 gameId) external nonReentrant gameExists(gameId) {
        Game storage g = games[gameId];
        PlayerState storage p = g.playerState[msg.sender];
        if (!p.joined) revert NotAPlayer();
        if (!g.ended) revert GameNotFinished();
        if (p.claimed) revert NothingToClaim();
        if (g.totalScore == 0) revert NothingToClaim();

        uint256 payout = (g.prizePool * p.basket) / g.totalScore;
        p.claimed = true;

        if (p.basket > 0) {
            g.paymentToken.safeTransfer(msg.sender, payout);
        }

        emit Claimed(gameId, msg.sender, payout);
    }

    // --- Views ---

    function getPlayers(uint256 gameId) external view gameExists(gameId) returns (address[] memory) {
        Game storage g = games[gameId];
        address[] memory list = new address[](g.players.length);
        for (uint256 i = 0; i < g.players.length; i++) {
            list[i] = g.players[i];
        }
        return list;
    }

    function getRound(uint256 gameId, uint256 round) external view gameExists(gameId) returns (RoundMeta memory) {
        return games[gameId].rounds[round];
    }

    function getMove(uint256 gameId, uint256 round, address player) external view gameExists(gameId) returns (Move memory) {
        return games[gameId].moves[round][player];
    }

    function getPlayerState(uint256 gameId, address player) external view gameExists(gameId) returns (PlayerState memory) {
        return games[gameId].playerState[player];
    }

    function getConfig(uint256 gameId) external view gameExists(gameId) returns (GameConfig memory) {
        return games[gameId].config;
    }

    // --- Helpers ---

    function computeCommitment(
        uint256 gameId,
        uint256 round,
        uint256 requestedCatch,
        address inspectTarget,
        bytes32 salt
    ) external pure returns (bytes32) {
        return keccak256(abi.encode(gameId, round, requestedCatch, inspectTarget, salt));
    }

    function _validateConfig(GameConfig calldata config) private pure {
        if (
            config.sustainableCatch == 0 ||
            config.maxCatchPerRound == 0 ||
            config.maxRounds == 0 ||
            config.commitPhaseSeconds == 0 ||
            config.revealPhaseSeconds == 0 ||
            config.initialLakePerPlayer == 0
        ) {
            revert InvalidConfig();
        }
        if (config.sustainableCatch > config.maxCatchPerRound) revert InvalidConfig();
    }

    function _distribute(
        uint256[] memory requested,
        uint256 available
    ) private pure returns (uint256[] memory actual, uint256 remainder) {
        uint256 len = requested.length;
        actual = new uint256[](len);
        if (len == 0) {
            return (actual, available);
        }

        uint256 base = available / len;
        uint256 remaining = available;
        uint256 aboveCount;

        for (uint256 i = 0; i < len; i++) {
            if (requested[i] <= base) {
                uint256 catchable = requested[i] <= remaining ? requested[i] : remaining;
                actual[i] = catchable;
                remaining -= catchable;
            } else {
                aboveCount += 1;
            }
        }

        if (aboveCount > 0 && remaining > 0) {
            uint256 perPlayer = remaining / aboveCount;
            for (uint256 i = 0; i < len; i++) {
                if (requested[i] > base) {
                    uint256 catchable = requested[i] < perPlayer ? requested[i] : perPlayer;
                    actual[i] = catchable;
                    remaining -= catchable;
                }
            }
        }

        remainder = remaining;
    }

    function _inspectorsFor(
        Game storage g,
        uint256 round,
        address suspect
    ) private view returns (address[] memory inspectors) {
        uint256 count;
        for (uint256 i = 0; i < g.players.length; i++) {
            address candidate = g.players[i];
            Move storage mv = g.moves[round][candidate];
            if (mv.revealed && mv.inspectTarget == suspect) {
                count += 1;
            }
        }

        inspectors = new address[](count);
        uint256 idx;
        for (uint256 i = 0; i < g.players.length; i++) {
            address candidate = g.players[i];
            Move storage mv = g.moves[round][candidate];
            if (mv.revealed && mv.inspectTarget == suspect) {
                inspectors[idx] = candidate;
                idx += 1;
            }
        }
    }
}

// --- Lightweight libs (no external dependencies) ---

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        (bool success, bytes memory returndata) = address(token).call(data);
        if (!success) revert("ERC20 call failed");
        if (returndata.length > 0) {
            require(abi.decode(returndata, (bool)), "ERC20 operation did not succeed");
        }
    }
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}
