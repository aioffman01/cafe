#!/bin/bash
# Rocky Linux 운영/개발 환경 설정 스크립트 (Rocky Linux 8, 9 호환)
# 실행 방법: chmod +x setup_rocky.sh && sudo ./setup_rocky.sh

# 에러 발생 시 즉시 중단
set -e

# ANSI 색상 코드 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # 색상 초기화

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN} Rocky Linux 개발 및 운영 환경 구성을 시작합니다.${NC}"
echo -e "${CYAN}==========================================${NC}"

# Root 권한 체크
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[Error] 이 스크립트는 sudo 권한(root)으로 실행해야 합니다.${NC}"
  exit 1
fi

# 1. 시스템 패키지 저장소 업데이트 및 기본 빌드 도구 설치
echo -e "\n${YELLOW}[1/4] 시스템 패키지 업데이트 및 개발 도구 설치...${NC}"
dnf update -y
dnf groupinstall "Development Tools" -y

# 2. Python 3 및 가상환경(venv) 지원 설치
echo -e "\n${YELLOW}[2/4] Python 3 및 관련 도구 설치...${NC}"
dnf install -y python3 python3-pip python3-devel

# 3. Node.js 설치 (NodeSource 저장소 연동하여 LTS 버전 설치)
echo -e "\n${YELLOW}[3/4] Node.js LTS(v20) 설치...${NC}"
# Node.js 20.x setup script 실행
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# 설치 확인
echo -e "\n${GREEN}[✓] 설치된 패키지 정보:${NC}"
echo -n "Python: " && python3 --version
echo -n "Pip: " && pip3 --version
echo -n "Node.js: " && node --version
echo -n "NPM: " && npm --version

# 4. 백엔드/프론트엔드 프로젝트 의존성 설정
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 백엔드 가상환경 설정
echo -e "\n${YELLOW}[4/4] 백엔드 가상환경 및 패키지 설정...${NC}"
BACKEND_DIR="${SCRIPT_DIR}/../backend"
if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    if [ ! -d ".venv" ]; then
        echo "Python 가상환경(.venv)을 생성합니다..."
        python3 -m venv .venv
    fi
    
    echo "가상환경 활성화 및 pip 업그레이드..."
    source .venv/bin/activate
    pip install --upgrade pip
    
    if [ -f "requirements.txt" ]; then
        echo "requirements.txt 기반 의존성 패키지를 설치합니다..."
        pip install -r requirements.txt
    else
        echo -e "${YELLOW}[!] requirements.txt 파일이 아직 존재하지 않아 파이썬 패키지 설치는 건너뜁니다.${NC}"
    fi
    deactivate
else
    echo -e "${RED}[!] backend 디렉토리를 찾을 수 없습니다.${NC}"
fi

# 프론트엔드 의존성 설정
echo -e "\n${YELLOW}프론트엔드 패키지 설정...${NC}"
FRONTEND_DIR="${SCRIPT_DIR}/../frontend"
if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    if [ -f "package.json" ]; then
        echo "Node 의존성 패키지를 설치합니다 (npm install)..."
        npm install
    else
        echo -e "${YELLOW}[!] package.json 파일이 존재하지 않아 프론트엔드 패키지 설치는 건너뜁니다.${NC}"
    fi
else
    echo -e "${RED}[!] frontend 디렉토리를 찾을 수 없습니다.${NC}"
fi

echo -e "\n${CYAN}==========================================${NC}"
echo -e "${GREEN} Rocky Linux 환경 설정이 완료되었습니다!${NC}"
echo -e "${CYAN}==========================================${NC}"
