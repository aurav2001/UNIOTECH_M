# PowerShell script to package frontend dist and backend folder using native tar
$rootDir = Get-Item .

# Clean up any leftover test zips
if (Test-Path test.zip) { Remove-Item test.zip -Force }
if (Test-Path test_backend.zip) { Remove-Item test_backend.zip -Force }

# 1. Package Frontend Dist
Write-Host "Packaging Frontend..." -ForegroundColor Yellow
$frontendZip = "UNi_Frontend_Final_Verified.zip"
if (Test-Path $frontendZip) { Remove-Item $frontendZip -Force }
tar -a -c -f $frontendZip -C frontend_old/dist .
Write-Host "Frontend package created successfully: $frontendZip" -ForegroundColor Green

# 2. Package Backend
Write-Host "Packaging Backend..." -ForegroundColor Yellow
$backendZip = "UNi_Backend_Final_Verified.zip"
if (Test-Path $backendZip) { Remove-Item $backendZip -Force }
tar -a -c -f $backendZip --exclude="node_modules" --exclude="dev_database.sqlite" --exclude=".env" --exclude=".git" --exclude="*.zip" -C backend_s .
Write-Host "Backend package created successfully: $backendZip" -ForegroundColor Green

Write-Host "Zipping completed successfully!" -ForegroundColor Green
