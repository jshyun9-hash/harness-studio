# Frontend 초기 셋팅 스킬

## 트리거
- `example/projects/{projectId}/frontend/` 가 **없을 때** 자동 실행
- 또는 사용자가 "프론트 셋팅 해줘" 요청 시 (projectId 확인 필수)

## 입력 (YML에서 읽어옴)
- `project.id` → `{projectId}`
- `project.ports.frontend` → Vite dev server 포트
- `project.ports.backend` → Vite proxy 타깃

## 목적
React 기반 사용자용 웹사이트 프론트엔드를 `projects/{projectId}/frontend/` 에 초기화하고,
**Header + Content + Footer** 반응형 레이아웃을 미리 만들어 둔다.

## 기술 스택
harness/stack.md 참조:
- React 19 + TypeScript 6
- Vite 8
- Tailwind CSS 4
- 포트: YML의 `project.ports.frontend`

## 생성 순서

### 1. Vite 프로젝트 스캐폴딩
```bash
cd example/projects/{projectId}
npm create vite@latest frontend -- --template react-ts
cd frontend
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

### 4. 설정 파일 덮어쓰기

> 포트는 YML의 값을 치환해서 쓴다.

#### frontend/vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: {ports.frontend},
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:{ports.backend}',
      },
    },
  },
});
```

#### frontend/src/index.css
```css
@import 'tailwindcss';
```

#### frontend/src/main.tsx
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

harness/structure.md, harness/style-guide.md 명세대로 생성한다.

- `src/components/layout/Layout.tsx` — Header + Content + Footer 컨테이너
- `src/components/layout/Header.tsx` — 상단 네비게이션 (데스크톱 메뉴 + 모바일 햄버거)
- `src/components/layout/Footer.tsx` — 하단 사이트 정보

> **핵심**: 모바일 반응형 필수. Header는 md 이하에서 햄버거 메뉴로 전환.

### 6. 공통 타입
- `src/types/common.ts` — `ApiResponse<T>`, `PageResponse<T>` 등

### 7. App.tsx (Layout 적용 — 빈 상태)
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

### 8. 검증
```bash
cd projects/{projectId}/frontend
npx tsc -b
npx vite build
```

모두 통과하면 셋팅 완료.

## 실행
```bash
cd projects/{projectId}/frontend
npm run dev
# → http://localhost:{ports.frontend}
```

## 주의사항
- 레이아웃은 harness/style-guide.md 사용자용 클린 테마 준수
- 모바일 반응형 필수 (햄버거 메뉴, 1열 그리드 등)
- studio와 달리 공통 컴포넌트(DataTable, Dialog 등)는 사전 생성하지 않음
  → 기능 구현 시 필요에 따라 페이지 내에서 직접 구성
