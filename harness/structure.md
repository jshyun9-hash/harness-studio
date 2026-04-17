# 폴더 구조 규칙

## 전체 구조

하나의 `example/` 안에 여러 프로젝트가 `projects/{projectId}/` 하위에 격리되어 공존한다.

```
example/
├── harness/                           # 하네스 규칙 (공용)
├── skills/                            # 스킬 레시피 (공용)
├── spec-requests/{projectId}/*.v{n}.md
├── specs/{projectId}/
│   ├── {projectId}.v{n}.yml           # YML 명세 (source of truth)
│   └── log.md                         # 현재 최신 버전 + changelog
├── log/{date}_{projectId}_v{n}.md     # 빌드 로그
└── projects/
    └── {projectId}/                   # 프로젝트 단위 격리
        ├── frontend/                  # React 프론트엔드
        ├── backend/                   # Spring Boot 백엔드
        ├── data/                      # H2 파일 DB (프로젝트별 분리)
        │   └── {dbName}.mv.db
        └── schema.md                  # 이 프로젝트의 DB 스키마
```

## 프로젝트 내부 구조

### frontend

```
projects/{projectId}/frontend/
├── src/
│   ├── components/
│   │   ├── layout/                    # Header + Footer 레이아웃
│   │   │   ├── Layout.tsx             # Header + Content + Footer 컨테이너
│   │   │   ├── Header.tsx             # 상단 네비게이션 (반응형 햄버거 메뉴)
│   │   │   └── Footer.tsx             # 하단 사이트 정보
│   │   └── {기능명}/                  # 기능별 컴포넌트
│   │       ├── {기능명}Card.tsx
│   │       └── {기능명}Form.tsx
│   ├── pages/
│   │   └── {기능명}/
│   │       ├── {기능명}ListPage.tsx
│   │       ├── {기능명}DetailPage.tsx
│   │       └── {기능명}FormPage.tsx
│   ├── hooks/use{기능명}.ts
│   ├── types/{기능명}.ts
│   ├── api/{기능명}Api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── vite.config.ts                     # 포트는 YML의 ports.frontend 사용
```

### backend

```
projects/{projectId}/backend/
└── src/main/
    ├── java/com/harness/{projectId 의 camelCase}/
    │   ├── {ProjectId Pascal}Application.java
    │   ├── domain/
    │   │   └── {기능명}/
    │   │       ├── entity/{기능명}.java
    │   │       ├── repository/{기능명}Repository.java
    │   │       ├── controller/{기능명}Controller.java
    │   │       ├── service/{기능명}Service.java
    │   │       └── dto/
    │   │           ├── {기능명}Request.java
    │   │           ├── {기능명}Response.java
    │   │           └── {기능명}SearchCondition.java
    │   └── global/
    │       ├── common/
    │       │   ├── ApiResponse.java
    │       │   └── PageResponse.java
    │       └── config/
    │           ├── CorsConfig.java
    │           └── GlobalExceptionHandler.java
    └── resources/
        └── application.yml            # 포트/DB는 YML의 ports.backend / database.name 사용
```

## 프로젝트 격리 원칙

- **각 프로젝트는 독립된 폴더에 위치**하며 서로 간섭하지 않는다
- **포트**: `specs/{id}/*.yml` 의 `ports` 값 사용 (다른 프로젝트와 충돌 금지)
- **DB**: `projects/{id}/data/{dbName}.mv.db` 로 파일 단위 격리 (H2 embedded)
- **패키지명**: `com.harness.{projectId의 camelCase}` 로 프로젝트마다 다름
- 프로젝트 통째로 복사·삭제해도 다른 프로젝트에 영향 없음

## 레이아웃 구조 (studio와 다른 점)

studio는 **사이드바 + 토픽바** 어드민 레이아웃이지만,
example은 **Header + Content + Footer** 사용자 웹사이트 레이아웃이다.

```
┌─────────────────────────────────────────────────────┐
│  Header (h-16, 고정)                                 │
│  ┌──────────┬──────────────────────┬──────────┐     │
│  │  로고     │  메뉴1  메뉴2  메뉴3 │  액션    │     │
│  └──────────┴──────────────────────┴──────────┘     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Content (flex-1, max-w-6xl mx-auto)                │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │     페이지 컨텐츠 (가운데 정렬)               │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Footer (사이트 정보, 카피라이트)                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  © 2026 Example  |  이용약관  |  개인정보    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 모바일 (< 768px)

```
┌──────────────────────┐
│  로고     ☰ (햄버거)  │  ← Header
├──────────────────────┤
│  메뉴1               │  ← 모바일 메뉴 (펼침 시)
│  메뉴2               │
│  메뉴3               │
├──────────────────────┤
│                      │
│  페이지 컨텐츠        │  ← Content (px-4)
│  (풀 너비)            │
│                      │
├──────────────────────┤
│  © 2026 Example      │  ← Footer (세로 쌓임)
│  이용약관 | 개인정보   │
└──────────────────────┘
```

## 네이밍 규칙

### 프론트엔드
| 대상 | 규칙 | 예시 |
|------|------|------|
| 페이지 | {기능명}{역할}Page.tsx | NoticeListPage.tsx |
| 컴포넌트 | {기능명}{역할}.tsx | NoticeCard.tsx |
| 훅 | use{기능명}.ts | useNotice.ts |
| API | {기능명}Api.ts | noticeApi.ts |
| 타입 | {기능명}.ts | Notice.ts |

### 백엔드
| 대상 | 규칙 | 예시 |
|------|------|------|
| Entity | {기능명}.java | Notice.java |
| Repository | {기능명}Repository.java | NoticeRepository.java |
| Controller | {기능명}Controller.java | NoticeController.java |
| Service | {기능명}Service.java | NoticeService.java |
| DTO | {기능명}Request/Response.java | NoticeRequest.java |

### DB (JPA 자동 생성)
| 대상 | 규칙 | 예시 |
|------|------|------|
| 테이블명 | snake_case (@Table) | notice |
| 컬럼명 | snake_case (@Column) | created_at |
| PK | {테이블}_id | notice_id |
