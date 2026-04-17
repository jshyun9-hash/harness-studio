# UX 패턴 규칙

## 필수 상태 처리

모든 데이터 페이지에 아래 3가지 상태를 반드시 처리한다.

### 1. 로딩 상태
```tsx
{loading && (
  <div className="flex justify-center py-12">
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
)}
```

### 2. 에러 상태
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
    {error.message}
  </div>
)}
```

### 3. 빈 상태
```tsx
{items.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500 text-sm">등록된 데이터가 없습니다.</p>
  </div>
)}
```

## 페이지 패턴

### 목록 페이지
- 카드 그리드 레이아웃 (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- 카드 클릭 → 상세 페이지 이동 (또는 모달)
- 페이지네이션 (10건 단위)
- 검색/필터 지원

### 상세 페이지
- 카드 형태로 내용 표시
- 목록으로 돌아가기 버튼
- 수정/삭제 액션

### 폼 페이지
- 필수 입력값 검증 (빈 값 제출 방지)
- 저장/취소 버튼
- 저장 성공 시 목록으로 이동

## 반응형 UX 규칙

| 패턴 | 모바일 (< md) | 데스크톱 (≥ md) |
|------|-------------|-------------|
| 네비게이션 | 햄버거 → 오른쪽 서랍(Drawer) | 가로 메뉴 바 + 현재 페이지 활성 표시 |
| 카드 그리드 | 1열 | 2~3열 |
| 폼 필드 | 1열 풀 너비 | 2열 그리드 가능 |
| 버튼 | 풀 너비 (`w-full`) | 자동 너비 (`w-auto`) |
| 테이블 | 카드로 변환 또는 가로 스크롤 | 기본 테이블 |
| 패딩 | `px-4 py-4` | `px-6 py-6 lg:px-8` |

### 네비게이션 필수 규칙

#### 현재 페이지 활성 표시
- `useLocation()`으로 현재 경로 판단
- 데스크톱: `text-indigo-600 border-b-2 border-indigo-600`
- 모바일 서랍: `bg-indigo-50 text-indigo-600`

#### 모바일 서랍(Drawer) 메뉴
- 아래로 펼치는 드롭다운 금지 → 전체 화면 서랍 사용
- `fixed inset-0 w-full` 풀스크린 패널 + `translate-x` 애니메이션
- 서랍 열린 상태에서 `body overflow: hidden` (배경 스크롤 방지)
- 페이지 이동 시(`location.pathname` 변경) 자동 닫힘
- 서랍 내부 구조 (flex flex-col):
  - 상단: 헤더 (메뉴 타이틀 + X 닫기 버튼)
  - 중간: 메뉴 항목 (`flex-1`, 활성 표시 포함)
  - 하단: 회원정보 + 로그아웃 버튼 (`border-t`로 하단 고정)
  - 비로그인 시: 하단 영역 없이 메뉴에 로그인/회원가입 표시

### 터치 타겟
- 모바일에서 터치 가능한 요소 최소 크기: `min-h-[44px] min-w-[44px]`
- 링크/버튼 간격 충분히 확보
