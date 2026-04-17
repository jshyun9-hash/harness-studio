# 스타일 가이드 — 공통 디자인 토큰

> 이 문서는 **사용자용(user) / 어드민용(admin) 두 템플릿이 공유하는 토큰** 만 정의한다.
> 레이아웃·화면 패턴은 템플릿 파일을 참조:
>
> - [harness/template-user.md](template-user.md) — Header + Content + Footer (사용자용 클린 테마)
> - [harness/template-admin.md](template-admin.md) — Sidebar + Topbar + Content (어드민 테마)
>
> `ui_source` 로 특정 디자인 자료가 지정된 경우, 해당 디자인을 우선하고 이 토큰은 보조로 사용한다.

---

## 색상 체계

### Primary (user: Indigo, admin: Slate)

| 용도 | user (Indigo) | admin (Slate) |
|------|---------------|---------------|
| 기본 | `bg-indigo-600` | `bg-slate-900` |
| hover | `hover:bg-indigo-700` | `hover:bg-slate-800` |
| 밝은 배경 | `bg-indigo-50` | `bg-slate-100` |
| 강조 텍스트 | `text-indigo-600` | `text-slate-900` |
| 포커스 링 | `ring-indigo-500` | `ring-slate-500` |

> 두 템플릿의 **primary 색상이 다르다**. 그 외 상태/중립 토큰은 동일.

### 상태 색상 (공통)

| 상태 | 배경 | 텍스트 | 테두리 |
|------|------|--------|--------|
| 성공 | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| 에러 | `bg-red-50` | `text-red-700` | `border-red-200` |
| 경고 | `bg-amber-50` | `text-amber-700` | `border-amber-200` |
| 정보 | `bg-blue-50` | `text-blue-700` | `border-blue-200` |

### 중립 색상 (공통)

| 용도 | Tailwind |
|------|----------|
| 페이지 배경 (user) | `bg-white` (메인), `bg-gray-50` (섹션) |
| 페이지 배경 (admin) | `bg-slate-50` (메인 컨텐츠 영역) |
| 카드 배경 | `bg-white` |
| 테두리 | `border-gray-200` |
| 비활성 텍스트 | `text-gray-400` |
| 보조 텍스트 | `text-gray-500` |
| 본문 텍스트 | `text-gray-700` |
| 제목 텍스트 | `text-gray-900` |

---

## 타이포그래피 (공통)

| 용도 | 클래스 |
|------|--------|
| 페이지 제목 | `text-2xl font-bold text-gray-900 sm:text-3xl` |
| 섹션 제목 | `text-lg font-semibold text-gray-800 sm:text-xl` |
| 카드 제목 | `text-base font-semibold text-gray-900` |
| 라벨 | `text-sm font-medium text-gray-700` |
| 본문 | `text-sm text-gray-700 leading-relaxed sm:text-base` |
| 보조/안내 | `text-sm text-gray-500` |
| 에러 메시지 | `text-xs text-red-600` |

---

## 간격 시스템

| 용도 | 클래스 |
|------|--------|
| 컨텐츠 최대 너비 (user) | `max-w-6xl mx-auto` |
| 컨텐츠 최대 너비 (admin) | `max-w-full` (사이드바 레이아웃 기준) |
| 페이지 외부 패딩 | `px-4 py-6 sm:px-6 lg:px-8` |
| 카드 내부 패딩 | `p-4 sm:p-6` |
| 섹션 간 간격 | `space-y-8` |
| 버튼 그룹 간격 | `flex gap-3` |

---

## 버튼 스타일 (공통 베이스)

| 종류 | user (indigo) | admin (slate) |
|------|---------------|---------------|
| Primary | `bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors` | `bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md text-sm font-medium transition-colors` |
| Secondary | `border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors` | `border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors` |
| Danger | `bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors` | `bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors` |
| Ghost | `text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm transition-colors` | 동일 (`rounded-md` 권장) |

- user 템플릿: `rounded-lg` 기본 (부드러움)
- admin 템플릿: `rounded-md` 기본 (조밀함)

---

## 입력 필드 스타일 (공통)

### 기본 상태
```
className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700
           bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
           transition-colors"
```

> admin 템플릿은 `focus:border-slate-500 focus:ring-slate-500`, `rounded-md` 사용.

### 에러 상태
```
className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm text-gray-700
           bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
```

---

## 카드 스타일 (공통)

```
user:   bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow
admin:  bg-white border border-gray-200 rounded-md shadow-sm
```

- user 는 `rounded-xl` + hover 강조 (카드 그리드 전제)
- admin 은 `rounded-md` + hover 효과 최소 (테이블/패널 전제)

---

## 반응형 브레이크포인트 (공통)

| 기기 | 브레이크포인트 | 컨텐츠 패딩 |
|------|-------------|-----------|
| 모바일 | < 768px (기본) | `px-4` |
| 태블릿 | md (768px~) | `sm:px-6` |
| 데스크톱 | lg (1024px~) | `lg:px-8` |

---

## 공통 그리드 패턴

### user 카드 목록
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* 카드들 */}
</div>
```

### admin 테이블
- 기본 `<table>` + Tailwind. 행: `border-b border-gray-100 hover:bg-slate-50`
- 모바일(< md)에서는 카드 폴드백 — 자세한 패턴은 template-admin.md

---

## 주의

- 레이아웃(Header/Footer vs Sidebar/Topbar)은 이 파일 범위 밖.
- `ui_source` 로 첨부된 디자인이 있으면 이 토큰은 **백업 가이드** 로만 사용.
  첨부 디자인의 색상/폰트/간격을 우선하고, 누락된 부분만 이 토큰으로 채움.
