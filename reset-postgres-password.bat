@echo off
echo ====================================
echo Redefinir Senha do PostgreSQL
echo ====================================
echo.
echo Este script vai redefinir a senha do usuario postgres
echo.
echo IMPORTANTE: Feche qualquer conexao ativa com PostgreSQL antes!
echo.
pause
echo.

REM Para a servico do PostgreSQL
echo Parando servico PostgreSQL...
net stop postgresql-x64-16

if %ERRORLEVEL% NEQ 0 (
    echo Tentando PostgreSQL 15...
    net stop postgresql-x64-15
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Nao foi possivel parar o servico.
    echo Execute este script como Administrador.
    pause
    exit /b 1
)

echo.
set /p NEW_PASSWORD="Digite a NOVA senha que voce deseja usar: "
echo.

REM Cria arquivo temporario de senha
echo %NEW_PASSWORD% > C:\temp_pg_pass.txt

REM Modifica arquivo pg_hba.conf para permitir acesso sem senha temporariamente
set PG_DATA=C:\Program Files\PostgreSQL\16\data
if not exist "%PG_DATA%" set PG_DATA=C:\Program Files\PostgreSQL\15\data

echo Configurando acesso temporario...
copy "%PG_DATA%\pg_hba.conf" "%PG_DATA%\pg_hba.conf.backup"

REM Altera metodo de autenticacao para trust
powershell -Command "(Get-Content '%PG_DATA%\pg_hba.conf') -replace 'md5', 'trust' -replace 'scram-sha-256', 'trust' | Set-Content '%PG_DATA%\pg_hba.conf'"

echo Iniciando servico...
net start postgresql-x64-16

if %ERRORLEVEL% NEQ 0 (
    net start postgresql-x64-15
)

timeout /t 3

echo Alterando senha...
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "ALTER USER postgres PASSWORD '%NEW_PASSWORD%';"

if %ERRORLEVEL% EQU 0 (
    echo [OK] Senha alterada com sucesso!
) else (
    echo [ERRO] Falha ao alterar senha.
)

echo.
echo Restaurando configuracao original...
copy "%PG_DATA%\pg_hba.conf.backup" "%PG_DATA%\pg_hba.conf"
del "%PG_DATA%\pg_hba.conf.backup"
del C:\temp_pg_pass.txt

echo.
echo Reiniciando servico...
net stop postgresql-x64-16
timeout /t 2
net start postgresql-x64-16

if %ERRORLEVEL% NEQ 0 (
    net stop postgresql-x64-15
    timeout /t 2
    net start postgresql-x64-15
)

echo.
echo ====================================
echo [SUCESSO] Senha redefinida!
echo.
echo Nova senha: %NEW_PASSWORD%
echo.
echo Anote esta senha e atualize o arquivo .env
echo ====================================
echo.
pause
