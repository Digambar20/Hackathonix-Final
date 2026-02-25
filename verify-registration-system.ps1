#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Hackthonix 2.0 Registration System - Launch Verification Script
.DESCRIPTION
    Verifies all components are ready for registration launch
.NOTES
    Run this before launching registration on Feb 26, 2026
#>

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        HACKTHONIX 2.0 REGISTRATION SYSTEM VERIFICATION         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Variables
$webDir = ".\web"
$srcDir = "$webDir\src"
$componentsDir = "$srcDir\components\registration"
$apiDir = "$srcDir\app\api"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Track results
$checks = @()

Write-Host "🔍 Running Verification Checks..." -ForegroundColor Yellow
Write-Host ""

# Check 1: Verify component files exist
Write-Host "1️⃣  Checking Component Files..."
$componentFiles = @(
    "$componentsDir\CountdownTimer.tsx",
    "$componentsDir\RegistrationStats.tsx"
)

foreach ($file in $componentFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $(Split-Path $file -Leaf)" -ForegroundColor Green
        $checks += @{ Name = "Component: $(Split-Path $file -Leaf)"; Status = "PASS" }
    } else {
        Write-Host "   ❌ Missing: $(Split-Path $file -Leaf)" -ForegroundColor Red
        $checks += @{ Name = "Component: $(Split-Path $file -Leaf)"; Status = "FAIL" }
    }
}
Write-Host ""

# Check 2: Verify API files exist
Write-Host "2️⃣  Checking API Endpoints..."
$apiFiles = @(
    "$apiDir\teams\route.ts",
    "$apiDir\registration\stats\route.ts"
)

foreach ($file in $apiFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $(Split-Path $file -Leaf) at $(Split-Path (Split-Path $file) -Leaf)" -ForegroundColor Green
        $checks += @{ Name = "API: $(Split-Path (Split-Path $file) -Leaf)"; Status = "PASS" }
    } else {
        Write-Host "   ❌ Missing: $(Split-Path $file -Leaf)" -ForegroundColor Red
        $checks += @{ Name = "API: $(Split-Path $file -Leaf)"; Status = "FAIL" }
    }
}
Write-Host ""

# Check 3: Verify Registration Form Updated
Write-Host "3️⃣  Checking RegisterForm Updates..."
$registerFormPath = "$srcDir\components\auth\RegisterForm.tsx"
if (Test-Path $registerFormPath) {
    $content = Get-Content $registerFormPath -Raw
    
    if ($content -match "CountdownTimer") {
        Write-Host "   ✅ CountdownTimer imported" -ForegroundColor Green
        $checks += @{ Name = "RegisterForm: CountdownTimer import"; Status = "PASS" }
    } else {
        Write-Host "   ❌ CountdownTimer not imported" -ForegroundColor Red
        $checks += @{ Name = "RegisterForm: CountdownTimer import"; Status = "FAIL" }
    }
    
    if ($content -match "RegistrationStats") {
        Write-Host "   ✅ RegistrationStats imported" -ForegroundColor Green
        $checks += @{ Name = "RegisterForm: RegistrationStats import"; Status = "PASS" }
    } else {
        Write-Host "   ❌ RegistrationStats not imported" -ForegroundColor Red
        $checks += @{ Name = "RegisterForm: RegistrationStats import"; Status = "FAIL" }
    }
} else {
    Write-Host "   ❌ RegisterForm.tsx not found" -ForegroundColor Red
}
Write-Host ""

# Check 4: Verify Date Configuration
Write-Host "4️⃣  Checking Date Configuration..."
$teamsRoutePath = "$apiDir\teams\route.ts"
if (Test-Path $teamsRoutePath) {
    $content = Get-Content $teamsRoutePath -Raw
    
    $registrationStart = $content -match "new Date\(2026,\s*1,\s*26"
    $registrationEnd = $content -match "new Date\(2026,\s*2,\s*6"
    
    if ($registrationStart) {
        Write-Host "   ✅ Start date configured: Feb 26, 2026" -ForegroundColor Green
        $checks += @{ Name = "Date: Registration Start"; Status = "PASS" }
    } else {
        Write-Host "   ⚠️  Start date may not be configured" -ForegroundColor Yellow
    }
    
    if ($registrationEnd) {
        Write-Host "   ✅ End date configured: Mar 6, 2026" -ForegroundColor Green
        $checks += @{ Name = "Date: Registration End"; Status = "PASS" }
    } else {
        Write-Host "   ⚠️  End date may not be configured" -ForegroundColor Yellow
    }
    
    if ($content -match "const registrationLimit = 90") {
        Write-Host "   ✅ Registration limit: 90 teams" -ForegroundColor Green
        $checks += @{ Name = "Limit: 90 Teams"; Status = "PASS" }
    } else {
        Write-Host "   ⚠️  Registration limit set to 90" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ teams/route.ts not found" -ForegroundColor Red
}
Write-Host ""

# Check 5: Database Connection
Write-Host "5️⃣  Checking Database..."
if (Test-Path "$webDir\dev.db") {
    Write-Host "   ✅ SQLite database exists at dev.db" -ForegroundColor Green
    $checks += @{ Name = "Database: SQLite exists"; Status = "PASS" }
    
    $dbSize = (Get-Item "$webDir\dev.db").Length
    Write-Host "   📊 Database size: $([Math]::Round($dbSize / 1024, 2)) KB" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  Database not found - will be created on first run" -ForegroundColor Yellow
    $checks += @{ Name = "Database: SQLite exists"; Status = "WARN" }
}
Write-Host ""

# Check 6: Environment Variables
Write-Host "6️⃣  Checking Environment Configuration..."
if (Test-Path "$webDir\.env.local") {
    Write-Host "   ✅ .env.local file exists" -ForegroundColor Green
    $checks += @{ Name = "Config: .env.local exists"; Status = "PASS" }
    
    $envContent = Get-Content "$webDir\.env.local"
    if ($envContent -match "AUTH_SECRET") {
        Write-Host "   ✅ AUTH_SECRET configured" -ForegroundColor Green
        $checks += @{ Name = "Config: AUTH_SECRET"; Status = "PASS" }
    }
    if ($envContent -match "DATABASE_URL") {
        Write-Host "   ✅ DATABASE_URL configured" -ForegroundColor Green
        $checks += @{ Name = "Config: DATABASE_URL"; Status = "PASS" }
    }
} else {
    Write-Host "   ❌ .env.local not found - please run setup" -ForegroundColor Red
    $checks += @{ Name = "Config: .env.local exists"; Status = "FAIL" }
}
Write-Host ""

# Check 7: Node Modules
Write-Host "7️⃣  Checking Dependencies..."
if (Test-Path "$webDir\node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
    $checks += @{ Name = "Dependencies: node_modules"; Status = "PASS" }
} else {
    Write-Host "   ⚠️  node_modules not found - run 'npm install'" -ForegroundColor Yellow
    $checks += @{ Name = "Dependencies: node_modules"; Status = "WARN" }
}
Write-Host ""

# Summary
Write-Host "═════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "═════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$passCount = ($checks | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($checks | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($checks | Where-Object { $_.Status -eq "WARN" }).Count

Write-Host "✅ PASSED: $passCount" -ForegroundColor Green
Write-Host "❌ FAILED: $failCount" -ForegroundColor Red
Write-Host "⚠️  WARNINGS: $warnCount" -ForegroundColor Yellow
Write-Host ""

if ($failCount -eq 0 -and $warnCount -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED - SYSTEM READY FOR LAUNCH!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: cd web"
    Write-Host "  2. Run: npm run dev"
    Write-Host "  3. Open: http://localhost:3000/register"
    Write-Host "  4. Test registration page" -ForegroundColor Cyan
} elseif ($failCount -gt 0) {
    Write-Host "❌ CRITICAL ISSUES FOUND - PLEASE RESOLVE BEFORE LAUNCH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed Checks:" -ForegroundColor Yellow
    $checks | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  WARNINGS DETECTED - PLEASE REVIEW" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Warnings:" -ForegroundColor Yellow
    $checks | Where-Object { $_.Status -eq "WARN" } | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Verification completed at $timestamp" -ForegroundColor Cyan
Write-Host "═════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
