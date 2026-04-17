# 사용자용 템플릿 (user) — Header + Content + Footer

`modules.frontend[].template: user` 인 앱에 적용되는 레이아웃/UX 템플릿.

> **UI 자료 우선 원칙** — 페이지나 모듈에 `ui_source` 가 지정된 경우, 해당 자료를 우선 구현. 이 템플릿은 자료가 없을 때의 기본 레이아웃.

---

## 레이아웃 구조

```
┌─────────────────────────────────────────────────────┐
│  Header (h-16, sticky top)                           │
│  ┌──────────┬──────────────────────┬──────────┐     │
│  │  로고     │  메뉴1  메뉴2  메뉴3 │  액션    │     │
│  └──────────┴──────────────────────┴──────────┘     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Content (flex-1, max-w-6xl mx-auto)                │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Footer                                              │
│  © 2026 Example  |  이용약관  |  개인정보            │
└─────────────────────────────────────────────────────┘
```

### 모바일 (< 768px)

```
┌──────────────────────┐
│  로고     ☰         │  ← Header
├──────────────────────┤
│  메뉴1 / 메뉴2 ...    │  ← 오른쪽 서랍(Drawer)
├──────────────────────┤
│  페이지 컨텐츠        │  ← px-4
├──────────────────────┤
│  Footer              │
└──────────────────────┘
```

---

## 색상 토큰 (user)

- Primary: **Indigo** — `indigo-600 / indigo-700 / indigo-50`
- 기본 배경: `bg-white` (섹션 `bg-gray-50`)
- 둥근 모서리: `rounded-lg` (컴포넌트), `rounded-xl` (카드)

상세: [harness/style-guide.md](style-guide.md)

---

## 필수 레이아웃 컴포넌트

### Layout.tsx
```tsx
<div className="min-h-screen flex flex-col bg-white text-gray-900">
  <Header />
  <main className="flex-1">
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  </main>
  <Footer />
</div>
```

### Header.tsx
```tsx
<header className="sticky top-0 z-50 bg-white border-b border-gray-200">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* 로고 */}
      <div className="text-lg font-bold text-indigo-600">{사이트명}</div>

      {/* 데스크톱 네비게이션 */}
      <nav className="hidden md:flex items-center gap-8">
        {/* module: user 페이지 중 nav != false 를 nav_order 로 정렬 */}
        <a className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">메뉴1</a>
      </nav>

      {/* 모바일 햄버거 */}
      <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="메뉴 열기">
        {/* 햄버거 아이콘 */}
      </button>
    </div>
  </div>
</header>
```

#### 현재 페이지 활성 표시
- 데스크톱: `text-indigo-600 border-b-2 border-indigo-600`
- 모바일 서랍: `bg-indigo-50 text-indigo-600`

#### 모바일 서랍(Drawer)
- 아래로 펼치는 드롭다운 **금지** → 전체 화면 서랍
- `fixed inset-0 w-full` 풀스크린 + `translate-x` 애니메이션
- 서랍 열림 시 `body overflow: hidden` (배경 스크롤 차단)
- `location.pathname` 변경 시 자동 닫힘
- 서랍 내부 (flex flex-col):
  - 상단: 메뉴 타이틀 + X 닫기
  - 중간 (flex-1): 메뉴 항목 (활성 표시 포함)
  - 하단 (`border-t`): 로그인 시 회원정보 + 로그아웃 / 비로그인 시 로그인/회원가입

### Footer.tsx
```tsx
<footer className="bg-gray-50 border-t border-gray-200">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-500">© 2026 {사이트명}. All rights reserved.</p>
      <nav className="flex gap-6">
        <a className="text-sm text-gray-500 hover:text-gray-700">이용약관</a>
        <a className="text-sm text-gray-500 hover:text-gray-700">개인정보처리방침</a>
      </nav>
    </div>
  </div>
</footer>
```

---

## 페이지 패턴

### 목록 페이지 — 카드 그리드
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- 카드 클릭 → 상세 페이지 이동 (모달 금지)
- 페이지네이션: 10건 단위, 하단 가운데
- 검색/필터: 상단 sticky 영역 또는 페이지 상단 고정 블록

### 상세 페이지
- 카드(`rounded-xl`) 형태로 내용 표시
- 상단에 "목록으로 돌아가기" 버튼 (Secondary)
- 수정/삭제 액션 (해당 권한 있을 때만)

### 폼 페이지
- 필수 입력값 검증 (빈 값 제출 방지, 인라인 에러 메시지)
- 저장 / 취소 버튼
- 저장 성공 시 목록 또는 상세로 이동
- 모바일: 버튼 `w-full`, 데스크톱: `w-auto`

---

## 필수 상태 처리

### 로딩
```tsx
{loading && (
  <div className="flex justify-center py-12">
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
)}
```

### 에러
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
    {error.message}
  </div>
)}
```

### 빈 상태
```tsx
{items.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500 text-sm">등록된 데이터가 없습니다.</p>
  </div>
)}
```

---

## 반응형 UX 규칙

| 패턴 | 모바일 (< md) | 데스크톱 (≥ md) |
|------|-------------|-------------|
| 네비게이션 | 햄버거 → 오른쪽 서랍 | 가로 메뉴 + 활성 표시 |
| 카드 그리드 | 1열 | 2~3열 |
| 폼 필드 | 1열 풀 너비 | 2열 가능 |
| 버튼 | `w-full` | `w-auto` |
| 테이블 | 카드로 변환 또는 가로 스크롤 | 기본 테이블 |

### 터치 타겟
- 모바일 터치 가능 요소 최소: `min-h-[44px] min-w-[44px]`

---

## 인증 보호 페이지

- `authLoading` 완료 후에만 `!member` 판단하여 리다이렉트
- 세션 비동기 확인 중 오판으로 로그인 페이지가 깜빡이는 것 방지

```tsx
if (authLoading) return <LoadingSpinner />;
if (!member) { navigate('/login'); return null; }
```

---

## UI 자료 우선 처리

`ui_source` 가 지정된 페이지는:

1. 해당 자료(HTML/JSX/스크린샷)의 레이아웃 구조를 우선 구현
2. 색상/타이포/간격은 자료의 것을 따르되, 누락된 부분은 [style-guide.md](style-guide.md) 토큰 사용
3. 자료가 다른 프레임워크 (Bootstrap, MUI 등) 인 경우 → Tailwind 로 재구성
4. 반응형은 자료에 없어도 **반드시 추가** (모바일 햄버거 등은 필수)
