# 아키텍처 규칙

## 레이어 구조

```
[프론트엔드 모듈]              [백엔드 앱]                      [DB]
Page → Hook → Api ──HTTP──▶ Controller → Service → Repository ──JPA──▶ H2
```

모듈/전략(unified/split, shared/split)은 [harness/structure.md](structure.md) 의 4가지 케이스 참조.

---

## 프론트엔드 경계

| 레이어 | 할 수 있는 것 | 금지 |
|--------|-------------|------|
| pages/ | 레이아웃, 훅 호출, 이벤트 핸들링 | 직접 fetch, 비즈니스 로직 |
| components/{기능명}/ | 기능별 UI (Card / Row / Form 등) | 비즈니스 로직 |
| hooks/ | 상태 관리, api/ 호출 | 직접 fetch, DOM 조작 |
| api/ | fetch 호출, 요청/응답 변환 | 상태 관리, UI 로직 |

### API 호출 규칙

**프론트는 모듈 종류와 무관하게 `/api/...` 그대로 호출한다.** Vite 프록시가 자신의 backend 로 라우팅한다.

- user 프론트: `/api/...` → 자기 user backend
- admin 프론트: `/api/...` → 자기 admin backend (unified 면 단일 backend)

```typescript
// api/noticeApi.ts — fetch 는 여기서만
const API_BASE = '/api/notices';   // user 모듈의 경우
// admin 모듈 컴포넌트에서는 '/api/admin/notices' 사용

export async function fetchNoticeList(params: NoticeSearchParams): Promise<PageResponse<Notice>> {
  const res = await fetch(`${API_BASE}?${new URLSearchParams(...)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}
```

- hooks/ 는 api/ 호출만
- pages/ 는 hooks/ 만 사용

---

## 백엔드 경계

| 레이어 | 할 수 있는 것 | 금지 |
|--------|-------------|------|
| Controller | 요청 검증, Service 호출 | SQL, 비즈니스 로직 |
| Service | 비즈니스 로직, Repository 호출 | HTTP 요청, SQL 직접 작성 |
| Repository | JpaRepository 상속, 쿼리 메서드 | 비즈니스 로직 |
| Entity | DB 매핑, 도메인 로직 | 외부 의존성 |
| DTO | 데이터 전달, 변환 | 로직 (toEntity, fromEntity 만 허용) |

### Entity ↔ DTO 변환

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
// 성공
{ "success": true, "data": { ... }, "message": null }

// 목록
{
  "success": true,
  "data": {
    "items": [ ... ],
    "totalCount": 42,
    "page": 1,
    "size": 10
  }
}

// 에러
{ "success": false, "data": null, "message": "존재하지 않는 항목입니다" }
```

### REST API 경로 규칙

#### user 모듈 (module: user)
| 동작 | 메서드 | 경로 |
|------|--------|------|
| 목록 조회 | GET | /api/{리소스}s |
| 상세 조회 | GET | /api/{리소스}s/{id} |
| 생성 | POST | /api/{리소스}s |
| 수정 | PUT | /api/{리소스}s/{id} |
| 삭제 | DELETE | /api/{리소스}s/{id} |

#### admin 모듈 (module: admin)
| 동작 | 메서드 | 경로 |
|------|--------|------|
| 목록 조회 | GET | /api/admin/{리소스}s |
| 상세 조회 | GET | /api/admin/{리소스}s/{id} |
| 생성 | POST | /api/admin/{리소스}s |
| 수정 | PUT | /api/admin/{리소스}s/{id} |
| 삭제 | DELETE | /api/admin/{리소스}s/{id} |

---

## 멀티 모듈 아키텍처 규칙

### Case 2: unified backend (단일 앱에 user + admin)

- **한 Spring Boot 앱** 이 `/api/...` 와 `/api/admin/...` 를 모두 서빙
- 컨트롤러 파일을 역할별로 분리: `NoticeController.java` (user), `NoticeAdminController.java` (admin)
- 서비스는 공유 가능 (`NoticeService`) 또는 분리 가능 (`NoticeAdminService`)
- **role 체크**: `/api/admin/**` 에 대해 `SessionRoleFilter` 로 `role=ADMIN` 확인
- CORS: `user 포트` 와 `admin 포트` 모두 허용

### Case 3: split backend + shared DB (실무 표준)

- **두 Spring Boot 앱** 이 동일 H2 DB 파일을 공유 (`AUTO_SERVER=TRUE`)
- 엔티티 클래스는 각 앱이 **자기 복제본** 을 보유. 내용 동일
- **스키마 주도권**: `database.shared_owner` 가 지정한 앱만 `ddl-auto: update`, 나머지는 `validate`
- user 앱: `/api/...` 만 담당. CORS 는 user 프론트 포트만 허용
- admin 앱: `/api/admin/...` 만 담당. CORS 는 admin 프론트 포트만 허용. 모든 요청에 role=ADMIN 강제
- 패키지: `com.harness.{camel}.user`, `com.harness.{camel}.admin`

### Case 4: split backend + split DB

- 두 앱이 완전 독립. 각자 자기 DB
- 엔티티에 `owned_by` 명시 → 그 앱의 Entity 로만 생성
- 크로스 DB 조회가 필요하면 **API 호출** 로 해결 (FK 금지)

---

## role 및 인증

### 세션 기반 (기본)

- 로그인 성공 시 세션에 `memberId`, `role` 저장
- 매 요청마다 세션 확인
- 로그아웃 시 세션 무효화

### role 체크 구현

```java
@Component
public class SessionRoleFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        String path = req.getRequestURI();

        // admin path 이면 role 확인
        if (path.startsWith("/api/admin/")) {
            HttpSession session = req.getSession(false);
            String role = session != null ? (String) session.getAttribute("role") : null;
            if (!"ADMIN".equals(role)) {
                res.setStatus(403);
                return;
            }
        }

        chain.doFilter(req, res);
    }
}
```

- Case 2 (unified): 이 필터가 `/api/admin/**` 만 체크
- Case 3/4 (split admin 앱): 이 필터가 **모든 요청** 체크 (admin 앱은 기본이 ADMIN 전용)

### 로그인 API

- user/admin 모두 같은 Member 엔티티 + 같은 로그인 API 사용 가능
- Case 3 (split): 로그인 API 를 양쪽 다 제공하거나, user 앱에만 제공하고 admin 앱은 같은 세션 저장소를 공유 (Redis 등은 하네스 범위 밖 — 기본은 **각 앱이 각자 로그인 API 제공**)

---

## CORS 규칙

각 backend 앱은 자기 frontend 모듈의 포트만 허용:

```java
// Case 3 user backend
registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:" + userFrontendPort)
        .allowedMethods("*")
        .allowCredentials(true);

// Case 3 admin backend
registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:" + adminFrontendPort)
        .allowedMethods("*")
        .allowCredentials(true);
```

Case 2 (unified): 양쪽 포트 모두 허용.

---

## DB 설정 (H2)

### shared DB (Case 1/2/3)

```yaml
# owner 앱
spring:
  datasource:
    url: jdbc:h2:file:../data/{database.name};AUTO_SERVER=TRUE   # Case 1: ../data/, Case 3: ../../data/
  jpa:
    hibernate:
      ddl-auto: update

# 비 owner 앱 (Case 3 admin)
spring:
  datasource:
    url: jdbc:h2:file:../../data/{database.name};AUTO_SERVER=TRUE
  jpa:
    hibernate:
      ddl-auto: validate
```

### split DB (Case 4)

```yaml
# user 앱
spring:
  datasource:
    url: jdbc:h2:file:../../data/{database.dbs[user].name};AUTO_SERVER=FALSE
  jpa:
    hibernate:
      ddl-auto: update
```

각 앱이 독립 DB. AUTO_SERVER 불필요.

---

## 엔티티 공유 (Case 3 특수 규칙)

- 하나의 엔티티를 두 백엔드가 각자 보유
- YML 에서 `entities` 아래 정의된 엔티티는, `module` 구분 없이 양쪽 모두 생성
- 패키지만 다름: `com.harness.{camel}.user.domain.member.entity.Member`, `com.harness.{camel}.admin.domain.member.entity.Member`
- **필드/어노테이션은 동일해야 함** — 한쪽만 수정하는 행위 금지 (하네스는 YML 에서 양쪽 일괄 재생성)
- 증분 수정 시에도 엔티티 변경은 양쪽 동기 적용
