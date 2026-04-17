# CRUD 페이지 풀스택 생성

## 입력
- 프로젝트: `{projectId}`
- 기능명: `{기능명}` (예: Notice, Product, Member)
- 대상 YML 섹션: entities / apis / pages
- 케이스: Case 1~4 (YML 의 `project.modules` 로 결정)

모든 경로는 `projects/{projectId}/` 기준.

---

## 전략별 생성 위치 (요약)

### Case 1: 단일
- backend: `backend/src/main/java/com/harness/{camel}/domain/{기능명}/...`
- frontend: `frontend/src/...`

### Case 2: unified backend, 2 frontend
- backend: `backend/src/main/java/com/harness/{camel}/domain/{기능명}/...`
  - user API 컨트롤러 + admin API 컨트롤러 공존
- frontend/user: `module: user` 페이지만
- frontend/admin: `module: admin` 페이지만

### Case 3/4: split backend, 2 frontend
- backend/user: `module: user` 인 API + `owned_by: user` 인 엔티티 (shared DB 일 때는 모든 엔티티)
- backend/admin: `module: admin` 인 API + (shared DB 면 모든 엔티티, split DB 면 `owned_by: admin`)
- frontend/user, frontend/admin: 동일

---

## 생성 순서

YML 의 `apis[]` 와 `pages[]` 를 순회하며 각 항목의 `module` 에 따라 배치.
엔티티는 strategy 에 따라 한 곳 또는 양쪽 백엔드에 생성.

### Phase 1: 백엔드

대상 앱(들): 위 "전략별 생성 위치" 참조.

각 앱에 대해 (`packagePath = java/com/harness/{camel}[.{appKey}]/`):

1. `domain/{기능명}/entity/{기능명}.java` — JPA Entity
2. `domain/{기능명}/repository/{기능명}Repository.java` — JpaRepository
3. `domain/{기능명}/dto/{기능명}Request.java` — 요청 DTO
4. `domain/{기능명}/dto/{기능명}Response.java` — 응답 DTO
5. `domain/{기능명}/dto/{기능명}SearchCondition.java` — 검색 조건
6. `domain/{기능명}/service/{기능명}Service.java` — 비즈니스 로직
7. `domain/{기능명}/controller/{기능명}Controller.java` — REST API
   - user API (`module: user`): `@RequestMapping("/api/{리소스}s")`
   - admin API (`module: admin`): `@RequestMapping("/api/admin/{리소스}s")`
   - Case 2 에서 한 기능에 양쪽 API 가 모두 있으면 파일 2개: `NoticeController.java` + `NoticeAdminController.java`

**엔티티 배치 규칙**:

| 케이스 | 엔티티 생성 위치 |
|--------|-----------------|
| Case 1 | backend 하나 |
| Case 2 | backend 하나 |
| Case 3 | 양쪽 backend 에 **동일 내용 복제** |
| Case 4 | `owned_by` 가 가리키는 backend 하나 |

### Phase 2: 프론트엔드

대상 앱(들): `pages[].module` 로 분기.

각 frontend 앱 에 대해 (`<frontend 루트>/src/`):

8. `types/{기능명}.ts` — TypeScript 타입
9. `api/{기능명}Api.ts` — API 호출 함수
   - user 모듈: `/api/{리소스}s`
   - admin 모듈: `/api/admin/{리소스}s`
10. `hooks/use{기능명}.ts` — 커스텀 훅
11. `components/{기능명}/{기능명}Card.tsx` (user) / `{기능명}Row.tsx` (admin) / `{기능명}Form.tsx`
12. `pages/{기능명}/{기능명}ListPage.tsx` — 목록 페이지
13. `pages/{기능명}/{기능명}DetailPage.tsx` — 상세 페이지 (user) / 또는 admin 상세 편집 페이지
14. `pages/{기능명}/{기능명}FormPage.tsx` — 작성/수정 페이지

### 템플릿별 목록 페이지 차이

| module | 레이아웃 | 컴포넌트 이름 |
|--------|---------|-------------|
| user | 카드 그리드 (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) | `{기능명}Card.tsx` |
| admin | 공통 `DataTable` 사용 | (행 렌더는 `columns[].render` 로 인라인, 별도 Row 컴포넌트 불필요) |

- user: 상세/작성은 별도 페이지로 이동 (다이얼로그 금지)
- admin: 리스트 위 `Toolbar` + `SearchFilter`, 테이블은 `DataTable`, 삭제는 `ConfirmDialog`, 피드백은 `Toast`

### admin 모듈 필수 공통 컴포넌트 사용 규칙

admin 페이지는 [harness/template-admin.md](../harness/template-admin.md) 의 공통 컴포넌트 세트를 **반드시 사용**.
페이지에서 직접 `<table>`, `<input>`, `window.confirm`, `alert`, 페이지 자체 모달 구현 **금지**.

| 역할 | 사용 컴포넌트 |
|------|--------------|
| 리스트 | `DataTable`, `Toolbar`, `SearchFilter`, `Pagination` |
| 등록/수정 폼 | `FormSection`, `FormField` + 입력(`TextInput`/`TextareaInput`/`NumberInput`/`SelectBox`/`MultiSelectBox`/`Checkbox`/`Switch`/`DatePicker`/`FileUploader`) |
| 공통 코드 선택 | `CodeSelect`, `CodeMultiSelect` (groupKey 전달) |
| 삭제 확인 | `ConfirmDialog` (variant: danger) |
| 보조 입력 | `Dialog` |
| 피드백 | `Toast` (useToast) |
| 상태 | `LoadingSpinner`, `EmptyState`, `ErrorAlert` |

user 모듈 페이지는 공통 컴포넌트 없이 자체 구성.

---

## 각 파일 생성 시 참조

- [harness/spec-format.md](../harness/spec-format.md) — YML 포맷
- [harness/structure.md](../harness/structure.md) — 파일 위치, 네이밍, 4가지 케이스
- [harness/architecture.md](../harness/architecture.md) — 레이어 경계, API path, role 체크
- [harness/coding.md](../harness/coding.md) — 코딩 규칙
- [harness/template-user.md](../harness/template-user.md) — user 페이지 패턴
- [harness/template-admin.md](../harness/template-admin.md) — admin 페이지 패턴
- [harness/style-guide.md](../harness/style-guide.md) — 디자인 토큰 (공통)

---

## ui_source 가 지정된 페이지

페이지 YML 의 `ui_source` 가 있으면:

1. 해당 파일 (HTML/JSX/이미지) 읽고 레이아웃 파악
2. 레이아웃 구조(그리드/섹션/컴포넌트 배치)는 자료를 우선
3. 색상/타이포는 자료의 것 + 누락분은 style-guide.md 토큰
4. 상태 처리(로딩/에러/빈상태), 반응형, role 체크는 **템플릿 규칙 적용**
5. 자료가 Tailwind 가 아니면 Tailwind 로 재구성

---

## 검증 체크리스트

### 백엔드 (각 앱마다)
- [ ] 패키지가 `com.harness.{camel}[.{appKey}]` 로 일관
- [ ] Entity 에 `@Table(name="snake_case")`, `@Column(name="snake_case")` 매핑
- [ ] API 응답이 `ApiResponse<T>` 로 래핑됨
- [ ] Service 에 `@Transactional` 적용
- [ ] admin API path 가 `/api/admin/` 으로 시작
- [ ] admin 앱은 role 체크 (필터 또는 전 path admin 앱)
- [ ] split DB 면 엔티티가 `owned_by` 가리키는 앱에만 있음
- [ ] shared DB + split backend 면 양쪽 엔티티 내용 일치

### 프론트엔드 (각 앱마다)
- [ ] `npx tsc -b` 통과
- [ ] 로딩/에러/빈상태 처리 있음
- [ ] 모바일 반응형 적용 (user: 햄버거, admin: Sidebar drawer)
- [ ] user 리스트는 카드 그리드, admin 리스트는 `DataTable`
- [ ] API 호출 path 가 모듈 prefix 맞춤 (user=`/api/`, admin=`/api/admin/`)
- [ ] 인증 보호 페이지에서 `authLoading` 완료 후에만 리다이렉트
- [ ] **admin 페이지: 공통 컴포넌트 사용 준수** — 페이지 내 원시 요소(`<table>`/`<input>`/`alert`/`window.confirm`) 금지
- [ ] admin 페이지의 삭제 액션은 `ConfirmDialog` 사용
- [ ] admin 페이지의 성공/실패 알림은 `Toast` (useToast) 사용

### 양 앱 연동 (split)
- [ ] 프론트 Vite 프록시가 자기 backend 포트로 연결됨
- [ ] CORS 가 자기 frontend 포트만 허용
- [ ] shared DB 면 `AUTO_SERVER=TRUE` 양쪽 모두 설정
