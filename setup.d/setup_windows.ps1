# Windows 개발 환경 설정 스크립트 (PowerShell)
# 실행 방법: PowerShell을 관리자 권한으로 실행한 후 .\setup_windows.ps1 실행

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Windows 개발 환경 설정을 시작합니다." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. winget 설치 확인 및 패키지 설치
function Install-Package-If-Missing {
    param (
        [string]$Name,
        [string]$WingetId,
        [string]$CommandCheck
    )

    $installed = $false
    try {
        Get-Command $CommandCheck -ErrorAction SilentlyContinue | Out-Null
        $installed = $true
    } catch {
        $installed = $false
    }

    if ($installed) {
        Write-Host "[✓] $Name 이(가) 이미 설치되어 있습니다." -ForegroundColor Green
    } else {
        Write-Host "[!] $Name 설치를 시작합니다..." -ForegroundColor Yellow
        winget install --id $WingetId --silent --accept-source-agreements --accept-package-agreements
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[✓] $Name 설치가 완료되었습니다." -ForegroundColor Green
        } else {
            Write-Host "[X] $Name 설치에 실패했습니다. 수동 설치가 필요할 수 있습니다." -ForegroundColor Red
        }
    }
}

# Python 3 설치 (winget id: Python.Python.3.11 또는 최신버전)
Install-Package-If-Missing -Name "Python 3" -WingetId "Python.Python.3.11" -CommandCheck "python"

# Node.js LTS 설치 (winget id: OpenJS.NodeJS.LTS)
Install-Package-If-Missing -Name "Node.js (LTS)" -WingetId "OpenJS.NodeJS.LTS" -CommandCheck "node"

# 환경변수 반영을 위해 현재 세션 경로 업데이트 (임시 반영)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 2. 백엔드 Python 가상환경 구성
Write-Host "`n[백엔드 설정]" -ForegroundColor Cyan
$BackendPath = "$PSScriptRoot\..\backend"
if (Test-Path $BackendPath) {
    Push-Location $BackendPath
    if (-not (Test-Path ".venv")) {
        Write-Host "Python 가상환경(.venv)을 생성합니다..." -ForegroundColor Yellow
        python -m venv .venv
    }
    
    Write-Host "가상환경 활성화 및 pip 업그레이드를 수행합니다..." -ForegroundColor Yellow
    & ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
    
    if (Test-Path "requirements.txt") {
        Write-Host "의존성 패키지를 설치합니다 (requirements.txt)..." -ForegroundColor Yellow
        & ".\.venv\Scripts\pip.exe" install -r requirements.txt
    } else {
        Write-Host "[!] requirements.txt 파일이 아직 존재하지 않습니다. 라이브러리 설치는 생략합니다." -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "[!] backend 디렉토리($BackendPath)를 찾을 수 없습니다." -ForegroundColor Red
}

# 3. 프론트엔드 Node.js 패키지 설정
Write-Host "`n[프론트엔드 설정]" -ForegroundColor Cyan
$FrontendPath = "$PSScriptRoot\..\frontend"
if (Test-Path $FrontendPath) {
    Push-Location $FrontendPath
    if (Test-Path "package.json") {
        Write-Host "Node 의존성 패키지를 설치합니다 (npm install)..." -ForegroundColor Yellow
        npm install
    } else {
        Write-Host "[!] package.json 파일이 아직 존재하지 않습니다. 의존성 설치를 건너뜁니다." -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "[!] frontend 디렉토리($FrontendPath)를 찾을 수 없습니다." -ForegroundColor Red
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Windows 환경 설정이 마무리되었습니다." -ForegroundColor Green
Write-Host " 새 터미널을 열어 설치된 프로그램을 확인하세요." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
