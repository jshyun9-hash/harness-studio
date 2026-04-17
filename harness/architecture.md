# 아키텍처 규칙

## 레이어 구조

```
[프론트엔드]                    [백엔드]                         [DB]
Page → Hook → Api  ──HTTP──▶  Controller → Service → Repository  ──JPA──▶  H2
```

## 프론트엔드 경계

| 레이어 | 할 수 있는 것 | 금지 |
|--------|-------------|------|
| pages/ | 레이아웃, 훅 호출, 이벤트 핸들링 | 직접 fetch, 비즈니스 로직 |
| components/{기능명}/ | 기능별 UI (Card, Form 등) | 비즈니스 로직 |
| hooks/ | 상태 관리, api/ 호출 | 직접 fetch, DOM 조작 |
| api/ | fetch 호출, 요청/응답 변환 | 상태 관리, UI 로직 |

### API 호출 규칙
```typescript
// api/noticeApi.ts — 여기서만 fetch
const API_BASE = '/api/notices';

export async function fetchNoticeList(params: NoticeSearchParams): Promise<PageResponse<Notice>> {
  const res = await fetch(`${API_BASE}?${new URLSearchParams(...)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

// hooks/useNotice.ts — api를 호출
import { fetchNoticeList } from '../api/noticeApi';

// pages/NoticeListPage.tsx — 훅만 사용
const { items, loading } = useNotice();
```

## 백엔드 경계

| 레이어 | 할 수 있는 것 | 금지 |
|--------|-------------|------|
| Controller | 요청 검증, Service 호출 | SQL, 비즈니스 로직 |
| Service | 비즈니스 로직, Repository 호출 | HTTP 요청, SQL 직접 작성 |
| Repository | JpaRepository 상속, 쿼리 메서드 | 비즈니스 로직 |
| Entity | DB 매핑, 도메인 로직 | 외부 의존성 |
| DTO | 데이터 전달, 변환 | 로직 포함 금지 (toEntity, fromEntity만 허용) |

### Entity ↔ DTO 변환 규칙
```java
// Request DTO → Entity
public Notice toEntity() {
    return Notice.builder()
            .title(this.title)
            .content(this.content)
            .build();
}

// Entity → Response DTO
public static NoticeResponse fromEntity(Notice notice) {
    return NoticeResponse.builder()
            .id(notice.getId())
            .title(notice.getTitle())
            .build();
}
```

### API 응답 표준
```java
// 모든 응답은 이 형태로 래핑
{
  "success": true,
  "data": { ... },
  "message": null
}

// 목록 조회 시
{
  "success": true,
  "data": {
    "items": [ ... ],
    "totalCount": 42,
    "page": 1,
    "size": 10
  }
}

// 에러 시
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 항목입니다"
}
```

### REST API 경로 규칙
| 동작 | 메서드 | 경로 |
|------|--------|------|
| 목록 조회 | GET | /api/{기능명}s |
| 상세 조회 | GET | /api/{기능명}s/{id} |
| 생성 | POST | /api/{기능명}s |
| 수정 | PUT | /api/{기능명}s/{id} |
| 삭제 | DELETE | /api/{기능명}s/{id} |
