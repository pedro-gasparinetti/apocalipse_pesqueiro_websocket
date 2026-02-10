# CommonsFishingGame integration guide

This contract mirrors the multiplayer fishing game logic and adds on-chain deposits, commit/reveal rounds, and analytics-friendly events. Fish are **game points**, not ERC20 tokens. Payouts come from the prize pool (buy-ins + optional top-ups) and are distributed pro-rata to each player's final basket.

## Parameter mapping

- `sustainableCatch`: `limiteSustentavel`
- `maxCatchPerRound`: `limitePossivelRodada`
- `maxRounds`: `limiteRodadas`
- `growthRateBps`: `taxaCrescimento` in basis points (2% = 200)
- `inspectionCost`: `custoFiscalizacao`
- `initialLakePerPlayer`: `quantidadeInicialPeixesJogador`
- `commitPhaseSeconds` / `revealPhaseSeconds`: on-chain timeboxes per round
- `entryFee`: token amount each player deposits to join (token decimals apply)

Growth is applied on the lake size at the start of each round. Bank values are tracked for analytics only; payouts ignore bank to avoid deficits caused by lake growth.

## Lifecycle

1) `createGame(token, config, treasury)` (host)
2) Optional `fundPrizePool(gameId, amount)` before the game ends (anyone)
3) Players call `joinGame(gameId)` and deposit `entryFee`
4) Host calls `startGame(gameId)` → opens round 1 and emits `RoundOpened`
5) Per round
   - Players commit: `commitMove(gameId, commitment)`
   - Players reveal: `revealMove(gameId, requestedCatch, inspectTarget, salt)` after the commit window closes
   - Anyone finalizes: `finalizeRound(gameId)` after all reveals or reveal deadline; missing reveals count as 0
6) When `maxRounds` is reached or lake < 1, game ends
7) Players claim: `claim(gameId)` to withdraw their share of the prize pool (`basket / totalScore`)

Commitment pre-image: `keccak256(abi.encode(gameId, round, requestedCatch, inspectTarget, salt))`. Keep `salt` locally until reveal.

Cancel path: `cancelUnstartedGame` (host) refunds entry fees and sends any remaining prize pool to the host; use only if the game will not run.

## Round formula (matches current app)

- Catch allocation: proportional distribution with a base of `lake / players`. Requests <= base get what they asked (capped by remaining lake); the rest split the remaining equally. Unused fish stay in the lake.
- Net catch: `actualCatch - inspectionCost (if any, floored at 0)`.
- Overfishing: `netCatch > sustainableCatch`.
  - If overfished **and inspected by at least one player**:
    - Fine = 10% of `netCatch` → bank
    - 90% split equally among inspectors (rounding remainder → bank)
    - Cheater keeps 0 for the round
  - Otherwise: player keeps `netCatch`.
- Bank accumulation: inspection costs + fines + redistribution remainders.
- Lake update: `nextLake = (lake - totalCatch - bankDelta) + growth`, where `growth = lake * growthRateBps / 10_000`.

## Events to index (subgraph-ready)

- `GameCreated` – full config
- `PrizeFunded` – prize pool top-ups
- `PlayerJoined`
- `GameStarted` – initial start
- `RoundOpened` – per-round deadlines and lake start
- `MoveCommitted`
- `MoveRevealed`
- `MoveResolved` – actual/net catch, inspectors[], fines, basketAfter
- `RoundFinalized` – lake transition, growth, bankDelta, totalCatch, end flag
- `GameEnded` – totalScore and prizePool
- `Claimed`

These events contain enough data to reconstruct history, per-player stats, bank trajectory, and to compute meta-stats (overfishing rate, inspection success, etc.).

## Frontend/backend wiring plan

- **Wallet flow**: replace current socket-only actions with on-chain calls. Keep UI sliders/selector, but gate the "Submit" button to:
  1) Build commitment hash, call `commitMove`.
  2) After commit window, call `revealMove` with the clear values.
- **Socket bridge**: listen to contract events (or a subgraph) server-side and push updates via the existing Socket.IO server so clients stay in sync without polling.
- **Round timing**: pick `commitPhaseSeconds`/`revealPhaseSeconds` long enough for wallet confirmation; the UI can show server time vs. deadlines from `RoundOpened`.
- **Finalization**: host or a keeper bot calls `finalizeRound` once reveals are done or deadline passes. Missing reveals default to zero so one player cannot stall the game.
- **Claims**: after `GameEnded`, prompt players to call `claim`. Share = `(playerBasket / totalScore) * prizePool`. Bank is informational; prize pool is fixed.

## Safety notes

- Commit/reveal prevents copy-cat moves; reveals are rejected before the commit window closes.
- Deadlines prevent griefing; unrevealed moves become zero.
- Prize pool cannot be topped up after the game ends (avoids uneven rewards once claims start).
- `nonReentrant` on deposit/cancel/claim; SafeERC20 wrappers protect token transfers.
- Cancel refunds entry fees; any extra funding is returned to the host to avoid locked funds.

## Data model expectations

- Fish amounts are integers (no scaling). Growth precision is basis points.
- Token amounts follow the payment token's decimals. Keep `entryFee` small if transactions are frequent.
- `treasury` is stored for potential future use (e.g., routing the bank to research funding); currently informational.

With this contract live, you can deploy a subgraph on the events above, mirror them into your existing websocket layer, and run the economic experiment with on-chain verifiability.
