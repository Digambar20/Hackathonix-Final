#!/usr/bin/env pwsh
# Hackthonix 2.0 Registration System - Launch Verification Script

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "HACKTHONIX 2.0 REGISTRATION SYSTEM VERIFICATION" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$webDir = ".\web"
$srcDir = "$webDir\src"
$componentsDir = "$srcDir\components\registration"
$apiDir = "$srcDir\app\api"
$checks = @()

Write-Host "Running Verification Checks..." -ForegroundColor Yellow
Write-Host ""

# Check 1: Verify component files exist
Write-Host "1. Checking Component Files..." 
$componentFiles = @(
    "$componentsDir\CountdownTimer.tsx",
    "$componentsDir\RegistrationStats.tsx"
)

foreach ($file in $componentFiles) {
    if (Test-Path $file) {
        Write-Host "   [PASS] $(Split-Path $file -Leaf)" -ForegroundColor Green
        $checks += @{ Name = "Component: $(Split-Path $file -Leaf)"; Status = "PASS" }
    } else {
        Write-Host "   [FAIL] Missing: $(Split-Path $file -Leaf)" -ForegroundColor Red
        $checks += @{ Name = "Component: $(Split-Path $file -Leaf)"; Status = "FAIL" }
    }
}
Write-Host ""

# Check 2: Verify API files exist
Write-Host "2. Checking API Endpoints..."
$apiFiles = @(
    "$apiDir\teams\route.ts",
    "$apiDir\registration\stats\route.ts"
)

foreach ($file in $apiFiles) {
    if (Test-Path $file) {
        Write-Host "   [PASS] $(Split-Path (Split-Path $file) -Leaf)" -ForegroundColor Green
        $checks += @{ Name = "API: $(Split-Path (Split-Path $file) -Leaf)"; Status = "PASS" }
    } else {
        Write-Host "   [FAIL] Missing: $(Split-Path (Split-Path $file) -Leaf)" -ForegroundColor Red
        $checks += @{ Name = "API: $(Split-Path $file -Leaf)"; Status = "FAIL" }
    }
}
Write-Host ""

# Check 3: Verify Registration Form Updated
Write-Host "3. Checking RegisterForm Updates..."
$registerFormPath = "$srcDir\components\auth\RegisterForm.tsx"
if (Test-Path $registerFormPath) {
    $content = Get-Content $registerFormPath -Raw
    
    if ($content -match "CountdownTimer") {
        Write-Host "   [PASS] CountdownTimer imported" -ForegroundColor Green
        $checks += @{ Name = "RegisterForm: CountdownTimer"; Status = "PASS" }
    } else {
        Write-Host "   [FAIL] CountdownTimer not imported" -ForegroundColor Red
        $checks += @{ Name = "RegisterForm: CountdownTimer"; Status = "FAIL" }
    }
    
    if ($content -match "RegistrationStats") {
        Write-Host "   [PASS] RegistrationStats imported" -ForegroundColor Green
        $checks += @{ Name = "RegisterForm: RegistrationStats"; Status = "PASS" }
    } else {
        Write-Host "   [FAIL] RegistrationStats not imported" -ForegroundColor Red
        $checks += @{ Name = "RegisterForm: RegistrationStats"; Status = "FAIL" }
    }
} else {
    Write-Host "   [FAIL] RegisterForm.tsx not found" -ForegroundColor Red
}
Write-Host ""

# Check 4: Verify Database
Write-Host "4. Checking Database..."
if (Test-Path "$webDir\dev.db") {
    Write-Host "   [PASS] SQLite database exists at dev.db" -ForegroundColor Green
    $checks += @{ Name = "Database: SQLite"; Status = "PASS" }
    $dbSize = (Get-Item "$webDir\dev.db").Length
    Write-Host "   Database size: $([Math]::Round($dbSize / 1024, 2)) KB" -ForegroundColor Cyan
} else {
    Write-Host "   [WARN] Database not found - will be created on first run" -ForegroundColor Yellow
    $checks += @{ Name = "Database: SQLite"; Status = "WARN" }
}
Write-Host ""

# Check 5: Environment Variables
Write-Host "5. Checking Environment Configuration..."
if (Test-Path "$webDir\.env.local") {
    Write-Host "   [PASS] .env.local file exists" -ForegroundColor Green
    $checks += @{ Name = "Config: .env.local"; Status = "PASS" }
} else {
    Write-Host "   [FAIL] .env.local not found" -ForegroundColor Red
    $checks += @{ Name = "Config: .env.local"; Status = "FAIL" }
}
Write-Host ""

# Check 6: Node Modules
Write-Host "6. Checking Dependencies..."
if (Test-Path "$webDir\node_modules") {
    Write-Host "   [PASS] node_modules exists" -ForegroundColor Green
    $checks += @{ Name = "Dependencies: node_modules"; Status = "PASS" }
} else {
    Write-Host "   [WARN] node_modules not found - run 'npm install'" -ForegroundColor Yellow
    $checks += @{ Name = "Dependencies: node_modules"; Status = "WARN" }
}
Write-Host ""

# Summary
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($checks | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($checks | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($checks | Where-Object { $_.Status -eq "WARN" }).Count

Write-Host "[PASS] Passed: $passCount" -ForegroundColor Green
Write-Host "[FAIL] Failed: $failCount" -ForegroundColor Red
Write-Host "[WARN] Warnings: $warnCount" -ForegroundColor Yellow
Write-Host ""

if ($failCount -eq 0 -and $warnCount -eq 0) {
    Write-Host "SUCCESS! All checks passed - System ready for launch!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. cd web" -ForegroundColor White
    Write-Host "  2. npm run dev" -ForegroundColor White
    Write-Host "  3. Open http://localhost:3000/register" -ForegroundColor White
} elseif ($failCount -gt 0) {
    Write-Host "CRITICAL ISSUES FOUND - Please resolve before launch" -ForegroundColor Red
    Write-Host ""
    $checks | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  FAIL: $($_.Name)" -ForegroundColor Red
    }
} else {
    Write-Host "WARNINGS DETECTED - Please review" -ForegroundColor Yellow
    $checks | Where-Object { $_.Status -eq "WARN" } | ForEach-Object {
        Write-Host "  WARN: $($_.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "Verification completed - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
