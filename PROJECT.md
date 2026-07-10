# 🚀 Project Boilerplate Setup & Coding Rules Prompt Template

이 문서는 "카페 모임" 프로젝트 개발 과정에서 확립된 **플랫폼 설정 규칙**, **디렉토리 아키텍처**, **백엔드/프론트엔드 코딩 규칙** 및 **트러블슈팅 가이드**를 모아둔 개발 표준 템플릿입니다. 다음 프로젝트 진행 시 이 가이드라인을 AI 코딩 어시스턴트의 시스템 프로필(Rules/Skills) 또는 최초 프롬프트로 활용하십시오.

---

## 📂 1. 디렉토리 구조 표준 (Directory Structure)

모노레포 형태로 구성하며 기능별(도메인별)로 디렉토리를 완전히 격리하여 유지보수성을 극대화합니다.

```
📁 [project-root]
├── 📁 docs/openapi/       # API 설계 명세 영역 (OpenAPI v3.0)
│   ├── 📁 components/     # 공통 스키마 명세
│   ├── 📁 paths/          # 기능별 API 엔드포인트 명세 분할
│   └── main.yaml          # 메인 수집 파일 (Assembly)
├── 📁 backend/            # Python FastAPI 백엔드 영역
│   ├── 📁 app/
│   │   ├── 📁 api/        # 라우터 엔드포인트 (deps.py 공통 가드 포함)
│   │   ├── 📁 core/       # 설정(config), DB 세션(database), 보안(security)
│   │   ├── 📁 crud/       # DB 질의 클래스 (CRUDBase 상속 및 도메인 분산)
│   │   ├── 📁 models/     # SQLAlchemy 테이블 객체 선언
│   │   └── 📁 schemas/    # Pydantic 입출력 데이터 유효성 검증 클래스
│   └── requirements.txt   # 백엔드 의존성 설정
└── 📁 frontend/           # Vite + React + TypeScript 프론트엔드 영역
    ├── 📁 src/
    │   ├── 📁 api/        # Axios 인스턴스 공통 설정 (client.ts)
    │   ├── 📁 features/   # 도메인(기능)별 컴포넌트 및 React Query Hooks
    │   │   ├── 📁 [feature_name]/
    │   │   │   ├── 📁 components/  # 화면 마크업 및 이벤트 핸들링
    │   │   │   └── 📁 hooks/       # API 통신 로직 캡슐화 (Custom Hooks)
    │   └── App.tsx        # 통합 레이아웃 및 탭/라우팅 처리
```

---

## 🐍 2. 백엔드 설정 & 코딩 규칙 (FastAPI & SQLAlchemy)

### 1) 데이터베이스 모델 순환 참조 차단 규칙
SQLAlchemy 모델을 여러 파일로 분산 선언할 때, 테이블 간의 관계(relationship)를 매핑하는 과정에서 발생하는 파이썬 임포트 순환 참조(Circular Import)를 예방합니다.
* **규칙:** 관계 설정 시 실제 클래스를 Import 하지 말고, **문자열**로 테이블 클래스명을 바인딩하십시오.
* **올바른 예:**
  ```python
  # app/models/post.py
  # User 클래스를 직접 임포트하지 않고 문자열 "User"로 관계 설정
  author = relationship("User", back_populates="posts")
  ```

### 2) FastAPI 204 No Content 응답 규칙
FastAPI에서 `status_code=204` 응답(예: 리소스 삭제 성공) 시 본문(Body) 데이터가 응답되면 프레임워크 최신 버전에서 `AssertionError`를 유발합니다.
* **규칙:** 204 응답 리턴 시 Dict나 Pydantic 객체를 반환하지 말고, `fastapi.Response(status_code=status.HTTP_204_NO_CONTENT)`를 직접 빌드하여 반환하십시오.
* **올바른 예:**
  ```python
  from fastapi import Response, status

  @router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
  def delete_item(id: int):
      # ... 삭제 로직 수행 ...
      return Response(status_code=status.HTTP_204_NO_CONTENT)
  ```

### 3) Bcrypt 암호화 및 Passlib 버그 회피 규칙
Python 3.10 이상 및 최신 `bcrypt` 패키지 환경에서 `passlib` 암호화 엔진 검증 시 내부 패딩 체크 오류(`ValueError: password cannot be longer than 72 bytes`)가 발생할 수 있습니다.
* **규칙:** `passlib` 라이브러리를 경유하지 않고, **`bcrypt` 모듈을 직접 임포트하여 인코딩 및 디코딩 처리**를 수행하십시오.
* **올바른 예:**
  ```python
  import bcrypt

  def get_password_hash(password: str) -> str:
      salt = bcrypt.gensalt()
      hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
      return hashed.decode("utf-8")

  def verify_password(plain_password: str, hashed_password: str) -> bool:
      try:
          return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
      except Exception:
          return False
  ```

---

## ⚛️ 3. 프론트엔드 설정 & 코딩 규칙 (Vite + React + TS)

### 1) TypeScript Verbatim Module Syntax 엄격 모드 준수
`tsconfig.json` 파일에 `"verbatimModuleSyntax": true`가 선언되어 있는 경우, 컴파일 시 순수 타입(Type) 정보는 명시적으로 `type` 키워드를 사용하여 임포트해야 정적 빌드가 성공합니다.
* **규칙:** 데이터 규격 Interface나 Type 변수 등을 다른 폴더에서 가져올 때는 반드시 `import type` 구문을 사용하십시오.
* **올바른 예:**
  ```typescript
  // 올바른 임포트 구분 (일반 객체/함수와 타입을 명확히 분리)
  import { useAuth } from '../hooks/useAuth';
  import type { UserProfile } from '../hooks/useAuth';
  ```

### 2) 미사용 변수 컴파일 경고 우회 규칙
TypeScript 컴파일 오류(`error TS6133: 'data' is declared but its value is never read.`)를 예방합니다.
* **규칙:** React Query의 `onSuccess: (data, variables) => {}` 등에서 `data`를 참조하지 않고 `variables`만 사용할 경우, 미사용 인자를 `_` 기호로 표시하여 컴파일러의 에러 판단을 차단하십시오.
* **올바른 예:**
  ```typescript
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
  }
  ```

---

## 🎨 4. 디자인 시스템 & UX 구현 표준

### 1) HSL/Variables 기반 모던 CSS 테마 토큰화
* **규칙:** ad-hoc 형태의 임의 컬러 코드를 지양하고, `:root`에 명시적인 테마 색상을 선언해 사용하십시오.
* **색상 팔레트 가이드 (네이버 Forest Green 테마):**
  - 메인 테마 그린: `var(--primary: #03C75A)`
  - 마우스 호버 그린: `var(--primary-hover: #02b34f)`
  - 민트 악센트 (포커스용): `var(--accent-mint: #E8F8F0)`
  - 관리자 전용 일정 (Red): `var(--event-admin: #e74c3c)`
  - 일반 회원 일정 (Blue): `var(--event-member: #3498db)`

### 2) 일정 관리(Calendar) 시각 표현 가이드
* **종일 일정(All-day Event) 스타일:**
  - 글자로 `[종일]` 마커를 표시하지 마십시오.
  - 달력 일정 칩 영역을 **투명한 배경 대신 단색(Solid Color) 배경**으로 꽉 채우고, 텍스트 색상을 **흰색(#ffffff)**으로 변경하여 입체감 있게 구현하십시오.
* **시간제 일정(Timed Event) 스타일:**
  - 옅은 틴트 배경색(`rgba(...)`)을 유지하고, 왼쪽에 해당 등급의 세로 테두리(`border-left: 3px solid [color]`)를 장착하며, 글자 앞에 시작 시간(예: `09:00`)을 작게 표기하십시오.
