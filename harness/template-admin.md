# 어드민용 템플릿 (admin) — Sidebar + Topbar + Content

`modules.frontend[].template: admin` 인 앱에 적용되는 레이아웃/UX 템플릿.

> **UI 자료 우선 원칙** — 페이지나 모듈에 `ui_source` 가 지정된 경우, 해당 자료를 우선 구현. 이 템플릿은 자료가 없을 때의 기본 레이아웃.

---

## 레이아웃 구조

```
┌────────────┬────────────────────────────────────────┐
│            │  Topbar (h-14)                          │
│            │  ┌──────────────────┬──────────────┐    │
│            │  │ 페이지 타이틀      │ 검색/알림/me │    │
│            │  └──────────────────┴──────────────┘    │
│  Sidebar   ├────────────────────────────────────────┤
│  (w-60)    │                                         │
│            │  Content (overflow-auto, bg-slate-50)   │
│  - 로고     │                                         │
│  - 그룹 A   │   페이지 본문                            │
│    └ 메뉴1  │                                         │
│    └ 메뉴2  │                                         │
│  - 그룹 B   │                                         │
│    └ 메뉴3  │                                         │
│            │                                         │
└────────────┴────────────────────────────────────────┘
```

### 모바일 (< 768px)

```
┌──────────────────────┐
│ ☰  타이틀    me      │  ← Topbar (Sidebar 토글 햄버거)
├──────────────────────┤
│                      │
│  Content             │  ← 풀 너비
│                      │
└──────────────────────┘

[Sidebar Drawer] — 햄버거 클릭 시 좌측 슬라이드인
```

---

## 색상 토큰 (admin)

- Primary: **Slate** — `slate-900 / slate-800 / slate-100`
- 사이드바 배경: `bg-slate-900 text-slate-200` (어두운 사이드바)
- 컨텐츠 배경: `bg-slate-50` (연한 회색)
- 테이블 행 hover: `hover:bg-slate-50`
- 둥근 모서리: `rounded-md` (조밀한 느낌)

상세: [harness/style-guide.md](style-guide.md)

---

## 필수 레이아웃 컴포넌트

### Layout.tsx
```tsx
<div className="min-h-screen flex bg-slate-50 text-gray-900">
  {/* 데스크톱 Sidebar */}
  <Sidebar className="hidden md:flex md:w-60" />

  {/* 모바일 Sidebar Drawer */}
  <SidebarDrawer open={drawerOpen} onClose={...} />

  <div className="flex-1 flex flex-col min-w-0">
    <Topbar onMenuClick={() => setDrawerOpen(true)} />
    <main className="flex-1 overflow-auto">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  </div>
</div>
```

### Sidebar.tsx
```tsx
<aside className="w-60 bg-slate-900 text-slate-200 flex flex-col">
  {/* 로고 */}
  <div className="h-14 flex items-center px-4 border-b border-slate-800">
    <span className="text-lg font-bold text-white">{사이트명} Admin</span>
  </div>

  {/* 메뉴 */}
  <nav className="flex-1 overflow-y-auto py-4">
    {groups.map(group => (
      <div key={group.name} className="mb-4">
        {/* nav_group 헤더 */}
        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {group.name}
        </div>
        {group.items.map(item => (
          <Link
            to={item.path}
            className={`
              flex items-center px-4 py-2 text-sm
              ${isActive ? 'bg-slate-800 text-white border-l-2 border-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
            `}
          >
            {item.label}
          </Link>
        ))}
      </div>
    ))}
  </nav>

  {/* 하단 사용자 정보 — 로그인한 관리자 표시만 (로그아웃 버튼은 Topbar 에) */}
  <div className="border-t border-slate-800 p-4">
    <div className="text-sm text-slate-300">{member?.name}</div>
    <div className="text-xs text-slate-500">{member?.loginId}</div>
  </div>
</aside>
```

#### 메뉴 구성 규칙
- YML 의 `module: admin` + `nav != false` 페이지 수집
- `nav_group` 으로 그룹핑, 각 그룹 내 `nav_order` 순
- 그룹이 없는 항목은 그룹 상단 / 없으면 일반 리스트
- 활성 표시: 왼쪽 흰색 보더 + `bg-slate-800`
- 하단 카드에는 **이름 + 로그인 ID 만** 노출. 로그아웃 버튼/링크는 두지 않는다 (중복 방지).

### Topbar.tsx
```tsx
<header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6">
  {/* 모바일 햄버거 */}
  <button onClick={onMenuClick} className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-100">
    {/* 햄버거 아이콘 */}
  </button>

  {/* 좌: 페이지 타이틀 (breadcrumb 가능) */}
  <h1 className="text-base font-semibold text-gray-900">{pageTitle}</h1>

  {/* 우: 액션 — 관리자 이름은 Sidebar 하단에만. Topbar 에는 로그아웃 아이콘만 둔다. */}
  <div className="ml-auto flex items-center gap-3">
    {/* 검색/알림 (옵션) */}
    {/* 로그아웃 — 아이콘만, 텍스트 라벨 없음 (aria-label 로 접근성 확보) */}
    <button
      type="button"
      onClick={() => { void logout(); }}
      aria-label="로그아웃"
      title="로그아웃"
      className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    >
      {/* logout 아이콘 (문+화살표). 20x20, stroke=currentColor */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  </div>
</header>
```

#### Topbar 로그아웃 규칙
- **로그아웃 액션은 Topbar 우측에만** 둔다. Sidebar 하단 카드에는 절대 중복으로 두지 않는다.
- 버튼은 **아이콘만** (텍스트 라벨 금지). 접근성은 `aria-label` + `title` 로 확보.
- 아이콘: "문 밖으로 나가는 화살표" (lucide-style logout 아이콘) stroke=currentColor, 20×20.
- `useSession().logout()` 호출. 세션 삭제 후 `/login` 으로 이동은 `SessionProvider` 책임.
- **관리자 이름은 Topbar 에 표시하지 않는다** — Sidebar 하단 카드에만 노출 (이중 표기 금지).

---

## 페이지 패턴

### 목록 페이지 — 테이블 (admin 기본)
- `<table>` + Tailwind (MUI/AntD 금지)
- 헤더: `bg-slate-100 text-xs font-semibold text-slate-600 uppercase`
- 행: `border-b border-gray-100 hover:bg-slate-50`
- 페이지네이션: 하단 오른쪽, 10~20건 단위
- 검색/필터: 테이블 위 섹션, `bg-white border rounded-md p-4`
- 행 액션: 마지막 열에 "수정 / 삭제" 링크 버튼

#### 모바일 (< md) 테이블 폴드백
- 가로 스크롤 (`overflow-x-auto`) 또는
- 카드 형태 변환 (각 행 → 카드, 라벨:값 수직 스택)

### 상세 / 작성 / 수정 페이지
- 페이지 상단: 페이지 타이틀 + 돌아가기 / 저장 / 삭제 버튼 그룹
- 폼: 2열 그리드 가능 (데스크톱), 1열 (모바일)
- 섹션별 카드로 묶기 (`bg-white border rounded-md p-6`)

### 대시보드 페이지 (있을 경우)
- 상단: 통계 카드 그리드 (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
- 하단: 최근 활동 테이블 / 차트 자리 (차트 라이브러리는 별도 결정, 기본 제공 없음)

---

## 필수 상태 처리

### 로딩
```tsx
{loading && (
  <div className="flex justify-center py-12">
    <div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
  </div>
)}
```

### 에러
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">
    {error.message}
  </div>
)}
```

### 빈 상태
```tsx
{items.length === 0 && (
  <div className="text-center py-12 bg-white border border-gray-200 rounded-md">
    <p className="text-gray-500 text-sm">데이터가 없습니다.</p>
  </div>
)}
```

---

## 반응형 UX

| 패턴 | 모바일 (< md) | 데스크톱 (≥ md) |
|------|-------------|-------------|
| Sidebar | Drawer (햄버거) | 고정 240px |
| 테이블 | 카드 변환 또는 가로 스크롤 | 풀 너비 테이블 |
| 폼 | 1열 풀 너비 | 2열 그리드 |
| 액션 버튼 | `w-full` (주요), inline (보조) | inline |

### Sidebar Drawer (모바일)
- `fixed inset-y-0 left-0 w-60 bg-slate-900` + `translate-x` 애니메이션
- 배경 오버레이 `bg-black/50` 클릭 시 닫힘
- 내부 구조는 데스크톱 Sidebar 와 동일

---

## 권한 / 리다이렉트

- 모든 admin 페이지는 **기본 보호**. 로그인 + role=ADMIN 체크
- 비로그인 / 비 ADMIN → `auth.admin.login_path` 로 리다이렉트
- `authLoading` 완료 전에 리다이렉트 금지 (플래시 방지)

```tsx
if (authLoading) return <Spinner />;
if (!member || member.role !== 'ADMIN') {
  navigate(AUTH_ADMIN_LOGIN_PATH);
  return null;
}
```

---

## UI 자료 우선 처리

`ui_source` 가 지정된 페이지는:

1. 해당 자료의 레이아웃(사이드바 구성, 테이블 모양 등)을 우선
2. 색상/타이포는 자료 것, 누락분은 style-guide.md 토큰
3. 자료가 다른 프레임워크(React-Admin, AntD, MUI 등) 인 경우 → Tailwind 로 재구성
4. 반응형은 자료에 없어도 **반드시 추가** (Sidebar Drawer 등)
5. **자료에 명시되지 않은 상태(로딩/에러/빈상태)** 는 이 템플릿 패턴 그대로 적용

---

## 공통 컴포넌트 세트 (admin 전용, 사전 생성 필수)

admin 템플릿의 모든 페이지는 아래 공통 컴포넌트를 **반드시 사용** 해야 한다.
페이지별로 직접 `<table>`, `<input>`, `<button>` 을 구성하지 말고 공통 컴포넌트를 통해서만 UI 를 조립.

> user 템플릿은 공통 컴포넌트를 **사전 생성하지 않음** (페이지별 자체 구성).
> admin 템플릿에서만 아래 세트를 `skills/init-frontend.md` 단계에서 사전 생성한다.

### 생성 위치

```
src/components/common/
├── layout/                # Sidebar / Topbar / SidebarDrawer / Layout (기 정의)
├── table/
│   ├── DataTable.tsx      # 리스트 표준 (컬럼 정의 + 데이터 + 정렬 + 페이지네이션 + 행 액션 + 상태 통합)
│   ├── Pagination.tsx
│   ├── RowActionChip.tsx  # 수정/삭제 등 행 액션 chip (variant: default | danger)
│   └── Toolbar.tsx        # 테이블 상단 툴바 (검색/필터/신규 버튼 묶음)
├── form/
│   ├── FormSection.tsx    # 카드형 폼 섹션 (제목 + children)
│   ├── FormField.tsx      # label + helpText + error + children 슬롯
│   ├── TextInput.tsx
│   ├── TextareaInput.tsx
│   ├── NumberInput.tsx
│   ├── SelectBox.tsx
│   ├── MultiSelectBox.tsx
│   ├── Checkbox.tsx
│   ├── Switch.tsx
│   ├── DatePicker.tsx
│   └── FileUploader.tsx   # harness/files.md 5번 섹션 — Props/동작 규약 기 정의
├── feedback/
│   ├── Dialog.tsx         # 모달 (title, body, footer 슬롯)
│   ├── ConfirmDialog.tsx  # 예/아니오
│   ├── Toast.tsx          # useToast() 훅 연계
│   ├── EmptyState.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorAlert.tsx
├── search/
│   └── SearchFilter.tsx   # 여러 필터 조합 + URL 쿼리 동기화 + 적용/초기화 버튼
└── code/
    ├── CodeSelect.tsx      # CodeItem 드롭다운 (groupKey)
    └── CodeMultiSelect.tsx
```

### 사용 규칙 (CRUD 페이지에서)

| 페이지 역할 | 반드시 사용해야 하는 컴포넌트 |
|-----------|------------------------------|
| 리스트 (목록) | `DataTable`, `Toolbar`, `SearchFilter`, `Pagination` |
| 상세/읽기 | `FormSection` (읽기 전용 표시), `EmptyState`/`ErrorAlert`/`LoadingSpinner` |
| 등록/수정 | `FormSection`, `FormField`, 해당 입력(`TextInput` 등), `FileUploader`(이미지), `CodeSelect`/`CodeMultiSelect`(공통 코드), `Dialog`(필요 시 보조 입력) |
| 삭제/위험 액션 | `ConfirmDialog` (반드시) |
| 성공/실패 피드백 | `Toast` (페이지별 alert 금지) |

### 컴포넌트 인터페이스 (핵심만)

#### DataTable
```typescript
interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;       // 마지막 열 액션 버튼들
  sort?: { key: string; direction: 'asc' | 'desc' };
  onSortChange?: (sort: { key: string; direction: 'asc' | 'desc' }) => void;
}
```

#### SearchFilter
```typescript
interface SearchFilterProps {
  fields: FilterField[];                // { key, label, type: 'text'|'select'|'multi_select'|'date', options? }
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onApply: () => void;
  onReset: () => void;
}
```

#### FormField
```typescript
interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}
```

#### Dialog / ConfirmDialog
```typescript
interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;     // 기본 "확인"
  cancelText?: string;      // 기본 "취소"
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}
```

#### Toast (훅)
```typescript
const toast = useToast();
toast.success('저장되었습니다');
toast.error('저장 실패');
```

`<ToastProvider>` 는 `App.tsx` 에 최상위로 감싼다.

### 생성 규칙

- 위 파일 트리의 **모든 파일이 비어있더라도 먼저 생성** 한다 (빈 스켈레톤 + TypeScript 타입 export 필수).
- 구현은 skills/init-frontend.md 의 admin 분기에서 일괄 작성.
- 프로젝트마다 이 컴포넌트들은 **동일한 인터페이스** 를 가져야 한다 (페이지 생성기가 일관되게 사용 가능).
- 내부 스타일/구현은 프로젝트별 `ui_source` 자료가 있으면 그에 맞춰 조정 가능. 단 **Props 시그니처는 고정**.

### 페이지 생성기 (skills/crud-page.md) 에서

admin 모듈 페이지를 만들 때는 위 공통 컴포넌트의 **import + 사용** 만으로 페이지가 구성돼야 한다.
직접 `<table>`, `<input type="text">`, `window.confirm`, `alert` 등 원시 요소 사용 금지.

### 리스트 페이지 표준 구성 (필수)

admin 모듈의 **모든 list 페이지는 아래 3종 세트로 구성**한다. 하나라도 누락되면 하네스 위반.

1. **SearchFilter** — 테이블 위에 항상 검색 카드 배치. 필터 키가 없어도 최소 1개 텍스트 검색 필드는 둔다.
   - 값 상태: `filterDraft` (입력 중) + `filterApplied` (실제 적용). "검색" 클릭 시에만 `filterApplied` 갱신 + `page = 1` 리셋.
   - 초기화: `filterDraft` 와 `filterApplied` 모두 초기값으로, `page = 1`.
2. **DataTable** — 리스트 본체. `<table>` 직접 사용 금지.
3. **Pagination** — DataTable 하단. 고정 seed 데이터(예: Section 3건) 처럼 건수가 원천적으로 적은 경우만 생략 가능. 기본 `PAGE_SIZE = 20`.
4. **RowActionChip** — DataTable 의 `rowActions` 슬롯 안에서 수정/삭제 등 행 액션은 raw `<button>` 이 아니라 이 chip 공통 컴포넌트를 사용한다. `variant="default"` (수정/보기) / `variant="danger"` (삭제) 두 톤만 허용. pill 테두리(`rounded-full border`) + 흰 배경 + hover 톤 변화로 통일.

백엔드 시그니처도 동시에:
- Controller: `@RequestParam` 으로 필터 키 + `page` (기본 1) + `size` (기본 20)
- Repository: `JpaSpecificationExecutor<T>` 를 구현 (검색 Specification 조합)
- Service: `list(...filters, int page, int size) → PageResponse<T>` 반환. `PageRequest.of(page - 1, size, Sort...)`.

예외 허용:
- **인증 페이지** (`Login`, `Signup`) — 단독 풀스크린 카드 UI, `Layout` / `FormSection` 생략 가능.
- **Seed 고정 리스트** (예: Section 3건) — SearchFilter / Pagination 생략 가능하지만 **DataTable 은 반드시 사용**.

---

## 테이블 컴포넌트 가이드

admin 리스트 페이지의 기본 테이블 예:

```tsx
<div className="bg-white border border-gray-200 rounded-md overflow-hidden">
  {/* 상단 툴바 (검색/필터/신규 버튼) */}
  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
    <input type="text" placeholder="검색..." className="..." />
    <button className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm">신규</button>
  </div>

  {/* 테이블 */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-slate-100 text-xs font-semibold text-slate-600 uppercase">
        <tr>
          <th className="text-left px-4 py-3">컬럼1</th>
          <th className="text-left px-4 py-3">컬럼2</th>
          <th className="text-right px-4 py-3">액션</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50">
            <td className="px-4 py-3 text-gray-700">{item.field1}</td>
            <td className="px-4 py-3 text-gray-700">{item.field2}</td>
            <td className="px-4 py-3 text-right">
              <button className="text-slate-600 hover:text-slate-900 text-xs">수정</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* 페이지네이션 */}
  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
    {/* ... */}
  </div>
</div>
```
