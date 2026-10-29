# PowerShell script to build and zip frontend & backend for cPanel deployment
$ErrorActionPreference = "Stop"

$rootDir = Get-Item .
Write-Host "Starting build and packaging process..." -ForegroundColor Cyan

# 1. Run Frontend Build
Write-Host "Running frontend build..." -ForegroundColor Yellow
Set-Location "frontend_old"
npm run build
Set-Location $rootDir

# Clean up any background Node.js processes running Vite preview or postbuild prerendering to release file locks
Write-Host "Cleaning up background Node/Vite preview servers..." -ForegroundColor Cyan
$processes = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue
if ($processes) {
    $killedCount = 0
    foreach ($p in $processes) {
        if ($p.CommandLine -and (($p.CommandLine -match "vite" -and $p.CommandLine -match "preview") -or $p.CommandLine -match "prerender.js")) {
            Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
            $killedCount++
        }
    }
    if ($killedCount -gt 0) {
        Write-Host "Stopped $killedCount background preview/prerender processes." -ForegroundColor Cyan
        Start-Sleep -Seconds 3
    }
}

# 2. Package Frontend
Write-Host "Packaging Frontend..." -ForegroundColor Yellow
$frontendZip = "UNi_Frontend_Final_Verified.zip"

$feStage = "temp_fe_stage"
$successFE = $false
$retryFE = 0
$maxRetries = 5

while (-not $successFE -and $retryFE -lt $maxRetries) {
    try {
        $retryFE++
        if (Test-Path $feStage) { Remove-Item -Recurse -Force $feStage }
        New-Item -ItemType Directory -Path $feStage > $null
        
        Copy-Item -Path "frontend_old/dist/*" -Destination $feStage -Recurse
        
        if (Test-Path $frontendZip) { Remove-Item $frontendZip -Force }
        Compress-Archive -Path "$feStage/*" -DestinationPath $frontendZip -Force
        
        Remove-Item -Recurse -Force $feStage -ErrorAction SilentlyContinue
        $successFE = $true
    } catch {
        Write-Host "Warning: File lock detected during frontend packaging. Retrying in 4 seconds... (Attempt $retryFE of $maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 4
    }
}

if (-not $successFE) {
    throw "Failed to package Frontend due to persistent file locks."
}
Write-Host "Frontend package created successfully: $frontendZip" -ForegroundColor Green

# 3. Package Backend
Write-Host "Packaging Backend..." -ForegroundColor Yellow
$backendZip = "UNi_Backend_Final_Verified.zip"

$beStage = "temp_be_stage"
$successBE = $false
$retryBE = 0

while (-not $successBE -and $retryBE -lt $maxRetries) {
    try {
        $retryBE++
        if (Test-Path $beStage) { Remove-Item -Recurse -Force $beStage }
        New-Item -ItemType Directory -Path $beStage > $null
        
        Copy-Item -Path "backend_s/*" -Destination $beStage -Recurse -Exclude "node_modules", "dev_database.sqlite", ".env", "*.zip", ".git"
        
        if (Test-Path $backendZip) { Remove-Item $backendZip -Force }
        Compress-Archive -Path "$beStage/*" -DestinationPath $backendZip -Force
        
        Remove-Item -Recurse -Force $beStage -ErrorAction SilentlyContinue
        $successBE = $true
    } catch {
        Write-Host "Warning: File lock detected during backend packaging. Retrying in 4 seconds... (Attempt $retryBE of $maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 4
    }
}

if (-not $successBE) {
    throw "Failed to package Backend due to persistent file locks."
}
Write-Host "Backend package created successfully: $backendZip" -ForegroundColor Green

Write-Host "All set! Packages are ready in workspace root for cPanel upload." -ForegroundColor Green
