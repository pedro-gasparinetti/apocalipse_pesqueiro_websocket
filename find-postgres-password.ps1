# Script para encontrar/resetar senha do PostgreSQL
# Execute: .\find-postgres-password.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  PostgreSQL - Finder de Senha" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Testa senhas comuns
$senhasComuns = @(
    "postgres",
    "admin", 
    "password",
    "123456",
    "postgres123",
    "admin123",
    "root",
    "12345678",
    "senha",
    "1234"
)

Write-Host "Testando senhas comuns...`n" -ForegroundColor Yellow

$pgPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $pgPath)) {
    $pgPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
}

if (-not (Test-Path $pgPath)) {
    Write-Host "[ERRO] PostgreSQL nao encontrado!" -ForegroundColor Red
    Write-Host "Instale o PostgreSQL primeiro.`n"
    pause
    exit
}

foreach ($senha in $senhasComuns) {
    $env:PGPASSWORD = $senha
    $result = & $pgPath -U postgres -d postgres -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ SENHA ENCONTRADA: '$senha'`n" -ForegroundColor Green
        
        # Atualiza .env automaticamente
        $envContent = @"
# Configuração do Servidor Socket.IO
SOCKET_PORT=3001

# Configuração do PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=$senha
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        
        Write-Host "Arquivo .env atualizado automaticamente!" -ForegroundColor Green
        Write-Host "`nAgora execute: npm run db:test`n" -ForegroundColor Cyan
        pause
        exit
    } else {
        Write-Host "❌ '$senha' - incorreta" -ForegroundColor Red
    }
}

Write-Host "`n⚠️  Nenhuma senha comum funcionou.`n" -ForegroundColor Yellow
Write-Host "Opcoes:" -ForegroundColor Cyan
Write-Host "1. Digite a senha manualmente para testar"
Write-Host "2. Resetar a senha do PostgreSQL (requer admin)"
Write-Host "3. Sair`n"

$opcao = Read-Host "Escolha (1, 2 ou 3)"

if ($opcao -eq "1") {
    $senhaTeste = Read-Host "Digite a senha para testar"
    $env:PGPASSWORD = $senhaTeste
    $result = & $pgPath -U postgres -d postgres -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ SENHA CORRETA!`n" -ForegroundColor Green
        
        $envContent = @"
# Configuração do Servidor Socket.IO
SOCKET_PORT=3001

# Configuração do PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apocalipse_pesqueiro
DB_USER=postgres
DB_PASSWORD=$senhaTeste
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "Arquivo .env atualizado!" -ForegroundColor Green
        Write-Host "`nAgora execute: npm run db:test`n" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Senha incorreta.`n" -ForegroundColor Red
    }
    pause
    
} elseif ($opcao -eq "2") {
    Write-Host "`nPara resetar a senha, execute como Administrador:`n" -ForegroundColor Yellow
    Write-Host "1. Feche este terminal"
    Write-Host "2. Abra PowerShell como Administrador (botao direito)"
    Write-Host "3. Execute: .\reset-postgres-password.bat`n"
    pause
    
} else {
    Write-Host "`nSaindo...`n"
}
