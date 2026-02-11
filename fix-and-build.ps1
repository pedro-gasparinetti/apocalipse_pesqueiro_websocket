# Fix and Build Script for Dropbox Issues
Write-Host "🧹 Cleaning .next folder..." -ForegroundColor Yellow

# Remove .next if it exists
if (Test-Path .next) {
    # First, try normal removal
    Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
    
    # Wait for Dropbox to catch up
    Start-Sleep -Seconds 2
    
    # If still exists, use robocopy to delete
    if (Test-Path .next) {
        $emptyDir = Join-Path $env:TEMP "empty_folder"
        if (!(Test-Path $emptyDir)) { New-Item -ItemType Directory -Path $emptyDir | Out-Null }
        robocopy $emptyDir .next /MIR /R:0 /W:0 | Out-Null
        Remove-Item .next -Force -ErrorAction SilentlyContinue
        Remove-Item $emptyDir -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✓ Clean completed" -ForegroundColor Green

# Kill any stale Node processes
Write-Host "🛑 Stopping Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "✓ Processes stopped" -ForegroundColor Green

# Disable Webpack cache for this build
$env:NEXT_PRIVATE_DEBUG_CACHE = "false"

# Build
Write-Host "🏗️  Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host "Try pausing Dropbox sync and running again" -ForegroundColor Yellow
    exit 1
}
