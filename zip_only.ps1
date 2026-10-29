# PowerShell script to package frontend, backend, and full project inside a single parent folder using Windows-native Compress-Archive
$rootDir = (Get-Item .).FullName

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  UNiOTECH IT SOLUTIONS - FULL BACKUP     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$baseStage = Join-Path $rootDir "backup_stage"
if (Test-Path $baseStage) { Remove-Item -Recurse -Force $baseStage -ErrorAction SilentlyContinue }

$fullStage = Join-Path $baseStage "UnioTech_Project_Backup"
$feStage   = Join-Path $baseStage "UnioTech_Frontend"
$beStage   = Join-Path $baseStage "UnioTech_Backend"

New-Item -ItemType Directory -Path (Join-Path $fullStage "backend") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $fullStage "frontend") -Force | Out-Null
New-Item -ItemType Directory -Path $feStage -Force | Out-Null
New-Item -ItemType Directory -Path $beStage -Force | Out-Null

# 1. Staging Backend
Write-Host "[1/3] Preparing Backend files..." -ForegroundColor Yellow
robocopy "backend_s" (Join-Path $fullStage "backend") /E /XD "node_modules" ".git" /XF "*.zip" "dev_database.sqlite" | Out-Null
robocopy "backend_s" $beStage /E /XD "node_modules" ".git" /XF "*.zip" "dev_database.sqlite" | Out-Null

# 2. Staging Frontend Source
Write-Host "[2/3] Preparing Frontend files..." -ForegroundColor Yellow
robocopy "frontend_old" (Join-Path $fullStage "frontend") /E /XD "node_modules" "dist" ".git" /XF "*.zip" | Out-Null
robocopy "frontend_old" $feStage /E /XD "node_modules" "dist" ".git" /XF "*.zip" | Out-Null

# 3. Root Documentation & Configurations
Copy-Item "README.md" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item "UnioTech_Project_Documentation.md" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item "UnioTech_Project_Documentation.docx" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item "UnioTech_Project_Complete_Documentation.docx" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item "Unio_Project_Documentation_Updated.docx" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item "package.json" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item ".env.example" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item ".gitignore" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item "build_and_zip.ps1" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item "zip_only.ps1" "$fullStage\" -Force -ErrorAction SilentlyContinue
Copy-Item "zip_deployment.ps1" "$fullStage\" -Force -ErrorAction SilentlyContinue

# 4. Generate Windows Native ZIP Archives
Write-Host "[3/3] Compressing archives using native Compress-Archive..." -ForegroundColor Yellow

# Full Monorepo
$fullZip = "UnioTech_Full_Project_Backup.zip"
if (Test-Path $fullZip) { Remove-Item $fullZip -Force }
Compress-Archive -Path $fullStage -DestinationPath $fullZip -Force
Write-Host "  -> Full Project Backup: $fullZip" -ForegroundColor Green

# Frontend Only
$feZip = "UnioTech_Frontend_Backup.zip"
if (Test-Path $feZip) { Remove-Item $feZip -Force }
Compress-Archive -Path $feStage -DestinationPath $feZip -Force
Write-Host "  -> Frontend Backup: $feZip" -ForegroundColor Green

# Backend Only
$beZip = "UnioTech_Backend_Backup.zip"
if (Test-Path $beZip) { Remove-Item $beZip -Force }
Compress-Archive -Path $beStage -DestinationPath $beZip -Force
Write-Host "  -> Backend Backup: $beZip" -ForegroundColor Green

# Cleanup Staging
Remove-Item -Recurse -Force $baseStage -ErrorAction SilentlyContinue

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  All backups generated successfully!   " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green


