# Zip Script for cPanel Deployment
# This script creates a deployment-ready ZIP file excluding node_modules

$projectName = "UnioTechIT_Update"
$zipFile = "deployment_v2_otp.zip"

Write-Host "Creating deployment zip: $zipFile..." -ForegroundColor Cyan

# Remove old zip if exists
if (Test-Path $zipFile) { Remove-Item $zipFile }

# Create a temporary directory for staging
$stage = "temp_stage"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Path $stage

# Copy Backend (excluding node_modules)
Write-Host "Copying Backend..."
$backendDest = "$stage/backend"
New-Item -ItemType Directory -Path $backendDest
Copy-Item -Path "backend_s/*" -Destination $backendDest -Recurse -Exclude "node_modules", ".env", "dev_database.sqlite", "*.zip"

# Instructions for Frontend
Write-Host "NOTE: For Frontend, you should run 'npm run build' and upload the 'dist' folder contents." -ForegroundColor Yellow

# Copy Frontend Source (optional, but good to have)
Write-Host "Copying Frontend Source..."
$frontendDest = "$stage/frontend_src"
New-Item -ItemType Directory -Path $frontendDest
Copy-Item -Path "frontend_old/src/*" -Destination $frontendDest -Recurse -Exclude "node_modules"
Copy-Item -Path "frontend_old/package.json" -Destination $frontendDest

# Create the ZIP
Write-Host "Compressing files..."
Compress-Archive -Path "$stage/*" -DestinationPath $zipFile

# Cleanup
Remove-Item -Recurse -Force $stage

Write-Host "Successfully created $zipFile!" -ForegroundColor Green
Write-Host "You can now upload this zip to your cPanel."
