# 단일 카페 서비스 디자인 시스템 가이드 (Naver Cafe Style)

이 문서는 웹 서비스의 일관되고 프리미엄한 비주얼을 유지하기 위한 디자인 가이드라인입니다. 네이버 카페 특유의 친근하고 신뢰감 주는 그린/민트 테마를 현대적이고 세련된 플랫/글래스모피즘 스타일로 재해석했습니다.

## 1. 컬러 팔레트 (Color Palette)

- **Primary (주요 색상)**:
  - `Forest Green`: `#03C75A` (네이버 고유의 신뢰성 있고 밝은 초록색)
  - `Deep Emerald`: `#0A8243` (버튼 호버 및 강조 텍스트용 깊은 에메랄드)
  - `Mint Accent`: `#D2F7E4` (태그 배경, 활성화 상태의 연한 민트 배경)
- **Secondary (보조 색상)**:
  - `Calendar Operator`: `#E74C3C` (관리자가 등록한 일정용 포인트 레드)
  - `Calendar Member`: `#3498DB` (일반 회원이 등록한 일정용 포인트 블루)
- **Backgrounds (배경 색상)**:
  - `Base Light`: `#F4F6F8` (메인 배경, 눈 피로를 덜어주는 연한 그레이/아이보리 조합)
  - `Card Background`: `#FFFFFF` (컨텐츠 영역, 그림자가 들어간 화이트 카드)
- **Typography Colors (텍스트 색상)**:
  - `Text Dark`: `#1E293B` (주요 제목 및 본문 텍스트)
  - `Text Muted`: `#64748B` (작성일자, 조회수, 서브 정보용 그레이)

## 2. 타이포그래피 (Typography)

- **글꼴 (Font-Family)**: `Pretendard`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, sans-serif
- **계층 구조 (Hierarchy)**:
  - `H1 (Page Title)`: 28px, SemiBold
  - `H2 (Section Header)`: 20px, Medium
  - `Body Text`: 15px, Regular (라인 높이: 1.6)
  - `Caption (Subtext)`: 12px, Regular

## 3. UI 컴포넌트 스타일 (Component Style)

- **카드 (Card)**:
  - `Border Radius`: `12px` (부드러운 라운딩 처리)
  - `Shadow`: `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)` (매우 자연스럽고 옅은 그림자)
- **버튼 (Button)**:
  - 기본값: Forest Green 배경 + 화이트 텍스트, 호버 시 Deep Emerald 색상으로 부드럽게 전환 (`transition: background-color 0.2s ease`)
- **캘린더 칩 (Calendar Chips)**:
  - 관리자 등록 일정: `[관리자]` 배지 표시와 함께 테두리가 둥근 Forest Green 또는 Red 포인트 보더 카드 형태
  - 일반 회원 일정: 연한 블루 포인트 컬러 카드 형태
