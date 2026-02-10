@echo off
echo ================================
echo PostgreSQL Setup para Windows
echo ================================
echo.
echo Este script vai ajudar voce a configurar o PostgreSQL
echo.
echo Passo 1: INSTALAR PostgreSQL
echo ----------------------------
echo 1. Baixe o instalador do PostgreSQL em:
echo    https://www.postgresql.org/download/windows/
echo.
echo 2. Execute o instalador baixado (postgresql-xx-windows-x64.exe)
echo.
echo 3. Durante a instalacao:
echo    - Componentes: Deixe todos marcados
echo    - Diretorio: C:\Program Files\PostgreSQL\16 (padrao)
echo    - SENHA: Escolha uma senha e ANOTE! (ex: postgres123)
echo    - Porta: 5432 (padrao)
echo    - Locale: Portuguese, Brazil (ou padrao)
echo.
echo 4. Aguarde a instalacao concluir
echo.
echo ================================
pause
echo.
echo Passo 2: TESTAR se PostgreSQL foi instalado
echo -------------------------------------------
echo.
echo Pressione qualquer tecla para testar...
pause > nul

"C:\Program Files\PostgreSQL\16\bin\psql.exe" --version

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] PostgreSQL nao encontrado!
    echo Verifique se a instalacao foi concluida.
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] PostgreSQL instalado com sucesso!
echo.
echo ================================
pause
echo.
echo Passo 3: CONFIGURAR Banco de Dados
echo ----------------------------------
echo.
echo Agora vamos criar o banco de dados do jogo.
echo.
set /p DB_PASSWORD="Digite a senha que voce escolheu para o usuario 'postgres': "
echo.

echo Criando banco de dados...
echo.

"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE apocalipse_pesqueiro;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo [OK] Banco criado com sucesso!
) else (
    echo [INFO] Banco pode ja existir, continuando...
)

echo.
echo Criando tabelas...
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d apocalipse_pesqueiro -f db\schema.sql

if %ERRORLEVEL% EQU 0 (
    echo [OK] Tabelas criadas com sucesso!
) else (
    echo [ERRO] Erro ao criar tabelas. Verifique o arquivo db\schema.sql
    pause
    exit /b 1
)

echo.
echo ================================
echo.
echo Passo 4: CONFIGURAR arquivo .env
echo --------------------------------
echo.
echo Atualizando arquivo .env com suas configuracoes...

(
echo # Configuracao do Servidor Socket.IO
echo SOCKET_PORT=3001
echo.
echo # Configuracao do PostgreSQL
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=apocalipse_pesqueiro
echo DB_USER=postgres
echo DB_PASSWORD=%DB_PASSWORD%
) > .env

echo [OK] Arquivo .env configurado!
echo.
echo ================================
echo.
echo [SUCESSO] Setup completo!
echo.
echo Agora voce pode iniciar o jogo com:
echo    npm run dev
echo.
echo O jogo vai salvar automaticamente os resultados no PostgreSQL!
echo.
pause
