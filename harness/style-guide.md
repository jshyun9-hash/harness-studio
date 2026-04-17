# 스타일 가이드 — 사용자용 클린 테마

## 디자인 토큰

### 색상 체계

#### 주요 색상 (Primary — Indigo)
| 용도 | 색상 | Tailwind |
|------|------|----------|
| 기본 | indigo-600 | `bg-indigo-600` |
| hover | indigo-700 | `hover:bg-indigo-700` |
| 밝은 배경 | indigo-50 | `bg-indigo-50` |
| 텍스트 | indigo-600 | `text-indigo-600` |

#### 상태 색상
| 상태 | 배경 | 텍스트 | 테두리 |
|------|------|--------|--------|
| 성공 | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| 에러 | `bg-red-50` | `text-red-700` | `border-red-200` |
| 경고 | `bg-amber-50` | `text-amber-700` | `border-amber-200` |
| 정보 | `bg-blue-50` | `text-blue-700` | `border-blue-200` |

#### 중립 색상 (Gray 체계)
| 용도 | Tailwind |
|------|----------|
| 페이지 배경 | `bg-white` (메인), `bg-gray-50` (섹션) |
| 카드 배경 | `bg-white` |
| 테두리 | `border-gray-200` |
| 비활성 텍스트 | `text-gray-400` |
| 보조 텍스트 | `text-gray-500` |
| 본문 텍스트 | `text-gray-700` |
| 제목 텍스트 | `text-gray-900` |

---

### 타이포그래피

| 용도 | 클래스 |
|------|--------|
| 페이지 제목 | `text-2xl font-bold text-gray-900 sm:text-3xl` |
| 섹션 제목 | `text-lg font-semibold text-gray-800 sm:text-xl` |
| 카드 제목 | `text-base font-semibold text-gray-900` |
| 라벨 | `text-sm font-medium text-gray-700` |
| 본문 | `text-sm text-gray-700 leading-relaxed sm:text-base` |
| 보조/안내 | `text-sm text-gray-500` |
| 에러 메시지 | `text-xs text-red-600` |
| 네비게이션 | `text-sm font-medium text-gray-700 hover:text-indigo-600` |

---

### 간격 시스템

| 용도 | 클래스 |
|------|--------|
| 컨텐츠 최대 너비 | `max-w-6xl mx-auto` |
| 페이지 외부 패딩 | `px-4 py-6 sm:px-6 lg:px-8` |
| 카드 내부 패딩 | `p-4 sm:p-6` |
| 섹션 간 간격 | `space-y-8` |
| 버튼 그룹 간격 | `flex gap-3` |

---

### 버튼 스타일

| 종류 | 클래스 |
|------|--------|
| Primary | `bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors` |
| Secondary | `border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors` |
| Danger | `bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors` |
| Ghost | `text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm transition-colors` |

---

### 입력 필드 스타일

#### 기본 상태
```
className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700
           bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
           transition-colors"
```

#### 에러 상태
```
className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm text-gray-700
           bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
```

---

### 카드 스타일

```
className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
```

> studio(어드민)의 `rounded-lg`보다 **`rounded-xl`**로 더 부드럽게.

---

### Header 스타일

```tsx
{/* Header — 상단 고정 */}
<header className="sticky top-0 z-50 bg-white border-b border-gray-200">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* 좌: 로고 */}
      <div className="text-lg font-bold text-indigo-600">Example</div>

      {/* 중: 데스크톱 네비게이션 */}
      <nav className="hidden md:flex items-center gap-8">
        <a className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">메뉴1</a>
        <a className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">메뉴2</a>
      </nav>

      {/* 우: 액션 버튼 / 모바일 햄버거 */}
      <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
        {/* 햄버거 아이콘 */}
      </button>
    </div>
  </div>
</header>
```

### 모바일 메뉴 스타일

```tsx
{/* 모바일 드롭다운 메뉴 (md:hidden) */}
<div className="md:hidden border-b border-gray-200 bg-white">
  <nav className="max-w-6xl mx-auto px-4 py-3 space-y-1">
    <a className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
      메뉴1
    </a>
  </nav>
</div>
```

---

### Footer 스타일

```tsx
{/* Footer */}
<footer className="bg-gray-50 border-t border-gray-200">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-500">© 2026 Example. All rights reserved.</p>
      <nav className="flex gap-6">
        <a className="text-sm text-gray-500 hover:text-gray-700">이용약관</a>
        <a className="text-sm text-gray-500 hover:text-gray-700">개인정보처리방침</a>
      </nav>
    </div>
  </div>
</footer>
```

---

### 전체 페이지 레이아웃 (Layout)

```tsx
<div className="min-h-screen flex flex-col bg-white text-gray-900">
  {/* Header */}
  <Header />

  {/* Content */}
  <main className="flex-1">
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* 페이지 내용 */}
    </div>
  </main>

  {/* Footer */}
  <Footer />
</div>
```

### 반응형 브레이크포인트

| 기기 | 브레이크포인트 | 컨텐츠 패딩 | 비고 |
|------|-------------|-----------|------|
| 모바일 | < 768px (기본) | `px-4` | 햄버거 메뉴, 1열 그리드 |
| 태블릿 | md (768px~) | `sm:px-6` | 데스크톱 네비, 2열 그리드 |
| 데스크톱 | lg (1024px~) | `lg:px-8` | 최대 너비 제한 (max-w-6xl) |

### 그리드 패턴 (카드 목록)
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* 카드들 */}
</div>
```
