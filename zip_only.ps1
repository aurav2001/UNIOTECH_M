# PowerShell script to package frontend, backend, and full project using native tar
$rootDir = Get-Item .

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  UNiOTECH IT SOLUTIONS - FULL BACKUP     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Package Frontend Source Code
Write-Host "[1/5] Packaging Frontend Source..." -ForegroundColor Yellow
$feSourceZip = "UNi_Frontend_Source_Backup.zip"
if (Test-Path $feSourceZip) { Remove-Item $feSourceZip -Force }
tar -a -c -f $feSourceZip --exclude="node_modules" --exclude="dist" --exclude="*.zip" --exclude=".git" -C frontend_old .
Write-Host "  -> Frontend Source: $feSourceZip" -ForegroundColor Green

# 2. Package Frontend Production Build (Dist)
Write-Host "[2/5] Packaging Frontend Dist (cPanel / Static)..." -ForegroundColor Yellow
$frontendZip = "UNi_Frontend_Final_Verified.zip"
if (Test-Path $frontendZip) { Remove-Item $frontendZip -Force }
tar -a -c -f $frontendZip -C frontend_old/dist .
Write-Host "  -> Frontend Dist: $frontendZip" -ForegroundColor Green

# 3. Package Backend Source Code
Write-Host "[3/5] Packaging Backend Source..." -ForegroundColor Yellow
$beSourceZip = "UNi_Backend_Source_Backup.zip"
if (Test-Path $beSourceZip) { Remove-Item $beSourceZip -Force }
tar -a -c -f $beSourceZip --exclude="node_modules" --exclude="dev_database.sqlite" --exclude="*.zip" --exclude=".git" -C backend_s .
Write-Host "  -> Backend Source: $beSourceZip" -ForegroundColor Green

# 4. Package Backend Production Package (No .env)
Write-Host "[4/5] Packaging Backend Production Deployment Package..." -ForegroundColor Yellow
$backendZip = "UNi_Backend_Final_Verified.zip"
if (Test-Path $backendZip) { Remove-Item $backendZip -Force }
tar -a -c -f $backendZip --exclude="node_modules" --exclude="dev_database.sqlite" --exclude=".env" --exclude=".git" --exclude="*.zip" -C backend_s .
Write-Host "  -> Backend Deployment: $backendZip" -ForegroundColor Green

# 5. Package Full Monorepo (Frontend + Backend + Documentation)
Write-Host "[5/5] Packaging Complete Monorepo Project..." -ForegroundColor Yellow
$fullProjectZip = "UNi_Full_Project_Backup.zip"
if (Test-Path $fullProjectZip) { Remove-Item $fullProjectZip -Force }
tar -a -c -f $fullProjectZip --exclude="node_modules" --exclude="*/node_modules" --exclude="dist" --exclude="*/dist" --exclude="*.zip" --exclude="*/*.zip" --exclude=".git" --exclude="dev_database.sqlite" --exclude="*/dev_database.sqlite" .
Write-Host "  -> Full Monorepo: $fullProjectZip" -ForegroundColor Green

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  All 5 backups generated successfully!   " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

