# Frontend 초기 셋팅 스킬

## 트리거
- `projects/{projectId}/frontend/` 또는 `projects/{projectId}/frontend/{moduleKey}/` 가 없을 때
- 또는 사용자가 "프론트 셋팅 해줘" 요청 시

## 입력 (YML 에서 읽어옴)
- `project.id` → `{projectId}`
- `project.modules.frontend` → 생성할 프론트 앱 목록 (key, port, template, ui_source)
- `project.modules.backend` → Vite 프록시 타깃 (proxy_target 또는 같은 key 의 backend app)

## 목적
YML 의 **frontend 모듈 목록** 에 따라 Vite 앱을 1개 또는 N개 초기화한다.
각 앱은 `template` 에 따라 user 템플릿 / admin 템플릿 / custom UI 를 적용한다.

## 기술 스택
[harness/stack.md](../harness/stack.md) 참조.

---

## 전략별 생성 위치

| 케이스 | 생성 경로 |
|--------|---------|
| Case 1 (단일) | `projects/{projectId}/frontend/` |
| Case 2/3/4 (멀티) | `projects/{projectId}/frontend/{moduleKey}/` — 각 모듈마다 |

---

## 공통 생성 순서 (각 frontend 모듈마다 반복)

### 1. Vite 프로젝트 스캐폴딩

```bash
cd projects/{projectId}
# 단일: <target>=frontend
# 멀티: <target>=frontend/{moduleKey}  → 먼저 frontend/ 디렉토리 만들어 둠

npm create vite@latest <target> -- --template react-ts
cd <target>
```

### 2. 의존성 설치

```bash
npm install
npm install -D @tailwindcss/vite tailwindcss prettier eslint
```

### 3. 데모 파일 정리

```bash
rm -rf src/assets src/App.css public
rm -f src/App.tsx
```

### 4. 설정 파일 작성

#### `<target>/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: {module.port},
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:{proxyTargetPort}',
      },
    },
  },
});
```

**`proxyTargetPort` 결정**:

| 케이스 | proxyTargetPort |
|--------|----------------|
| Case 1 (단일) | `ports.backend` |
| Case 2 (unified) | 유일한 backend app 의 port |
| Case 3/4 (split), proxy_target 명시 | 해당 backend app 의 port |
| Case 3/4 (split), proxy_target 생략 | **같은 key 의 backend app** port |

#### `<target>/src/index.css`
```css
@import 'tailwindcss';
```

#### `<target>/src/main.tsx`
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### 5. 레이아웃 컴포넌트 생성 (필수)

`template` 에 따라 분기:

#### template: user
- 파일: `src/components/layout/Layout.tsx`, `Header.tsx`, `Footer.tsx`
- 규칙: [harness/template-user.md](../harness/template-user.md)
- Primary 색상: **Indigo**
- 레이아웃: Header (sticky) + Content (max-w-6xl) + Footer

#### template: admin
- 레이아웃 파일: `src/components/layout/Layout.tsx`, `Sidebar.tsx`, `SidebarDrawer.tsx`, `Topbar.tsx`
- **공통 컴포넌트 세트 사전 생성 필수** — `src/components/common/` 아래 전체 트리 생성
  - `common/table/` — `DataTable`, `Pagination`, `Toolbar`
  - `common/form/` — `FormSection`, `FormField`, `TextInput`, `TextareaInput`, `NumberInput`, `SelectBox`, `MultiSelectBox`, `Checkbox`, `Switch`, `DatePicker`, `FileUploader`
  - `common/feedback/` — `Dialog`, `ConfirmDialog`, `Toast` (+ `ToastProvider` + `useToast`), `EmptyState`, `LoadingSpinner`, `ErrorAlert`
  - `common/search/` — `SearchFilter`
  - `common/code/` — `CodeSelect`, `CodeMultiSelect`
- 각 컴포넌트의 **Props 시그니처는 template-admin.md 의 정의 고정**. 내부 스타일/구현만 프로젝트 `ui_source` 에 맞춰 조정 가능
- `App.tsx` 최상위를 `<ToastProvider>` 로 감쌈
- 규칙: [harness/template-admin.md](../harness/template-admin.md) (공통 컴포넌트 섹션 참조)
- Primary 색상: **Slate**
- 레이아웃: Sidebar (w-60, 데스크톱) + Topbar (h-14) + Content (bg-slate-50)
- 모바일: Sidebar Drawer (햄버거 토글)

#### template: custom
- `ui_source` 경로의 자료를 읽고 분석
- 레이아웃 컴포넌트를 **해당 자료 구조대로** 생성
- 모바일 반응형은 자료에 없어도 **반드시 추가**
- 자료가 Tailwind 가 아니면 (예: Bootstrap, MUI) Tailwind 로 재구성
- 상세 규칙: [harness/template-user.md](../harness/template-user.md) 또는 [template-admin.md](../harness/template-admin.md) 의 "UI 자료 우선 처리" 섹션

### 6. 공통 타입

- `src/types/common.ts` — `ApiResponse<T>`, `PageResponse<T>` 등

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

export interface PageResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  size: number;
}
```

### 7. App.tsx (Layout 적용 — 빈 상태)

#### template: user
```tsx
import Layout from './components/layout/Layout';

export default function App() {
  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome</h1>
        <p className="mt-2 text-sm text-gray-500">기능이 추가되면 여기에 표시됩니다.</p>
      </div>
    </Layout>
  );
}
```

#### template: admin
```tsx
import Layout from './components/layout/Layout';

export default function App() {
  return (
    <Layout pageTitle="대시보드">
      <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Admin</h1>
        <p className="mt-2 text-sm text-gray-500">메뉴에서 항목을 선택하세요.</p>
      </div>
    </Layout>
  );
}
```

### 8. 검증

```bash
cd <target>
npx tsc -b
npx vite build
```

모두 통과하면 셋팅 완료. 멀티 모듈이면 앱마다 반복.

---

## 실행

### Case 1 (단일)
```bash
cd projects/{projectId}/frontend && npm run dev
# → http://localhost:{ports.frontend}
```

### Case 2/3/4 (멀티, 터미널 N개)
```bash
cd projects/{projectId}/frontend/user && npm run dev    # user 포트
cd projects/{projectId}/frontend/admin && npm run dev   # admin 포트
```

---

## 주의사항

- 레이아웃은 `template` 대로 생성 — user 와 admin 은 **레이아웃이 근본적으로 다름** (Header/Footer vs Sidebar/Topbar)
- `ui_source` 가 지정된 모듈/페이지는 해당 자료를 우선
- 모바일 반응형 **필수** (user: 햄버거 drawer, admin: Sidebar drawer)
- **공통 컴포넌트 정책 (중요)**
  - **admin 템플릿**: `src/components/common/` 세트를 **사전 생성 필수** (위 template: admin 섹션 참조). 페이지 생성기는 이 공통 컴포넌트를 통해서만 UI 조립
  - **user 템플릿**: 공통 컴포넌트 사전 생성 **하지 않음**. 기능 구현 시 페이지에서 직접 구성
- 프론트 코드에서 API 호출은 모듈 상관없이 `/api/...` (admin 모듈은 `/api/admin/...`). Vite 프록시가 자기 backend 로 라우팅
