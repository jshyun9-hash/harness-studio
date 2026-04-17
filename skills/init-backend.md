# Backend 초기 셋팅 스킬

## 트리거
- `projects/{projectId}/backend/` 가 비어있거나, 멀티 모듈 시 특정 `backend/{appKey}/` 가 없을 때
- 또는 사용자가 "백엔드 셋팅 해줘" 요청 시

## 입력 (YML 에서 읽어옴)
- `project.id` → `{projectId}`
- `project.modules.backend` → strategy + apps
- `project.modules.database` → strategy + shared_owner / dbs
- `project.database.name` (shared) 또는 각 app 별 DB 이름 (split)
- `project.modules.frontend` → CORS 허용 오리진

## 목적
Spring Boot + JPA + H2 백엔드 앱을 YML 의 **전략에 맞게** 1개 또는 N개 초기화한다.

## 기술 스택
[harness/stack.md](../harness/stack.md) 참조.

---

## 전략별 실행 흐름

### Case 1: 단일 모듈 (modules 미선언 또는 backend.apps 1개)

- 생성 위치: `projects/{projectId}/backend/`
- 패키지: `com.harness.{projectIdCamel}`
- Application: `{ProjectIdPascal}Application.java`
- DB URL: `jdbc:h2:file:../data/{dbName};AUTO_SERVER=TRUE` (실행 기준 `backend/` 이므로 `../data/`)
- ddl-auto: `update`

### Case 2: unified backend (modules.backend.strategy = unified)

- 생성 위치: `projects/{projectId}/backend/`
- 패키지: `com.harness.{projectIdCamel}`
- 나머지 Case 1 과 동일
- 추가: `SessionRoleFilter` 를 `/api/admin/**` 에만 적용하도록 설정

### Case 3/4: split backend (modules.backend.strategy = split)

- 생성 위치: 각 `app` 마다 `projects/{projectId}/backend/{app.key}/`
- 패키지: `com.harness.{projectIdCamel}.{app.key}`
- Application: `{ProjectIdPascal}{AppKeyPascal}Application.java`
- DB URL:
  - shared DB: `jdbc:h2:file:../../data/{dbName};AUTO_SERVER=TRUE`
  - split DB: `jdbc:h2:file:../../data/{dbs[app.key].name};AUTO_SERVER=FALSE`
- ddl-auto:
  - shared + app.key == `database.shared_owner` → `update`
  - shared + 아니면 → `validate`
  - split → `update` (각자 독립이므로)
- `admin` 앱은 `SessionRoleFilter` 를 **전 요청에 적용** (앱 자체가 ADMIN 전용)

---

## 공통 생성 순서 (각 앱마다 반복)

### 1. Spring Initializr 로 스캐폴딩

```bash
cd projects/{projectId}
# 단일/unified: <target>=backend
# split: <target>=backend/{appKey}  → 먼저 backend/ 디렉토리 만들어 둠

curl -s -o <target>.zip "https://start.spring.io/starter.zip?\
dependencies=web,data-jpa,validation,h2,lombok&\
type=gradle-project-kotlin&\
language=java&\
javaVersion=17&\
groupId=com.harness&\
artifactId=backend&\
name=harness-{projectId}-{appKey?}-backend&\
packageName={packageName}"

unzip -q <target>.zip -d <target>
rm <target>.zip
```

- `{packageName}`:
  - 단일/unified: `com.harness.{projectIdCamel}`
  - split: `com.harness.{projectIdCamel}.{appKey}`
- `{projectIdCamel}`: kebab-case → lowerCamelCase (예: `resort-reservation` → `resortReservation`)
- `{appKeyPascal}`: 첫 글자 대문자 (예: `user` → `User`)

### 2. 스캐폴딩 직후 정리

```bash
rm <target>/src/main/resources/application.properties
```

### 3. 최종 프로젝트 구조 (앱 내부)

```
<target>/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/ gradlew gradlew.bat
└── src/main/
    ├── java/{packagePath}/
    │   ├── {ProjectIdPascal}{AppKeyPascal?}Application.java
    │   ├── domain/                               # 기능별 도메인 (초기엔 비어있음)
    │   └── global/
    │       ├── common/
    │       │   ├── ApiResponse.java
    │       │   └── PageResponse.java
    │       └── config/
    │           ├── CorsConfig.java
    │           ├── SessionRoleFilter.java        # admin 앱 또는 unified 에서만 필요
    │           └── GlobalExceptionHandler.java
    └── resources/
        └── application.yml
```

### 4. application.yml

YML 의 값을 치환해서 작성.

```yaml
spring:
  application:
    name: {projectId}{-appKey?}

  datasource:
    url: jdbc:h2:file:{dbPath};AUTO_SERVER={true_if_shared}
    driver-class-name: org.h2.Driver
    username: sa
    password:

  h2:
    console:
      enabled: true
      path: /h2-console

  jpa:
    hibernate:
      ddl-auto: {update_or_validate}
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.H2Dialect

server:
  port: {app.port}

logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE
```

**`dbPath` 결정 규칙**:

| 케이스 | dbPath |
|--------|--------|
| Case 1 (단일) | `../data/{database.name}` |
| Case 2 (unified) | `../data/{database.name}` |
| Case 3 (split + shared) | `../../data/{database.name}` |
| Case 4 (split + split) | `../../data/{database.dbs[app.key].name}` |

**`ddl-auto` 결정 규칙**:

| 케이스 | 값 |
|--------|-----|
| Case 1 | `update` |
| Case 2 | `update` |
| Case 3, app.key == shared_owner | `update` |
| Case 3, app.key != shared_owner | `validate` |
| Case 4 | `update` (각자 독립) |

### 5. 공통 클래스

#### global/common/ApiResponse.java
```java
package {packageName}.global.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ApiResponse<T> {
    private final boolean success;
    private final T data;
    private final String message;

    public static <T> ApiResponse<T> success(T data) { return new ApiResponse<>(true, data, null); }
    public static ApiResponse<Void> success() { return new ApiResponse<>(true, null, null); }
    public static <T> ApiResponse<T> error(String message) { return new ApiResponse<>(false, null, message); }
}
```

#### global/common/PageResponse.java
```java
package {packageName}.global.common;

import java.util.List;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

@Getter
@Builder
public class PageResponse<T> {
    private final List<T> items;
    private final long totalCount;
    private final int page;
    private final int size;

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .items(page.getContent())
                .totalCount(page.getTotalElements())
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .build();
    }
}
```

#### global/config/CorsConfig.java

허용 오리진 규칙:

| 케이스 | allowedOrigins |
|--------|---------------|
| Case 1 | `http://localhost:{ports.frontend}` |
| Case 2 (unified) | 모든 frontend 모듈 포트 (`user`, `admin`) |
| Case 3/4 (split) | **같은 key 의 frontend 모듈 포트만** |

```java
package {packageName}.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins({allowedOriginsList})
                        .allowedMethods("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

#### global/config/SessionRoleFilter.java (필요한 경우만)

**생성 조건**:
- Case 2 (unified, admin 모듈 존재) → 필터가 `/api/admin/**` 만 체크
- Case 3/4 의 admin 앱 → 필터가 **전 요청** 체크
- Case 1 또는 admin 모듈 없는 Case 2 → 생성 불필요

```java
package {packageName}.global.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SessionRoleFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws java.io.IOException, jakarta.servlet.ServletException {

        String path = req.getRequestURI();
        boolean mustBeAdmin = {checkCondition};   // "path.startsWith(\"/api/admin/\")" or "true"

        if (mustBeAdmin) {
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

#### global/config/GlobalExceptionHandler.java
```java
package {packageName}.global.config;

import {packageName}.global.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleIllegalArgument(IllegalArgumentException e) {
        return ApiResponse.error(e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .orElse("유효성 검증 실패");
        return ApiResponse.error(message);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception e) {
        return ApiResponse.error("서버 오류가 발생했습니다.");
    }
}
```

### 6. 검증

```bash
cd <target>
./gradlew build
```

빌드 통과 시 완료. split 전략이면 앱마다 반복.

---

## 실행

### Case 1 / Case 2
```bash
cd projects/{projectId}/backend && ./gradlew bootRun
# → http://localhost:{ports.backend}
```

### Case 3 / Case 4 (터미널 2개)
```bash
# Terminal 1 — user
cd projects/{projectId}/backend/user && ./gradlew bootRun

# Terminal 2 — admin
cd projects/{projectId}/backend/admin && ./gradlew bootRun
```

**Case 3 기동 순서**: shared_owner 앱을 먼저 시작해서 스키마를 만들고, 나머지 앱(validate)을 시작한다.

---

## 주의사항

- split 전략 시 **양쪽 앱이 같은 YML 에서 일괄 생성** 됨. 한쪽만 생성 후 멈추면 스키마 불일치 가능.
- shared DB 일 때 두 앱 모두 `AUTO_SERVER=TRUE` 필수 (없으면 두 번째 기동 시 lock 에러)
- `application.properties` 는 **생성 즉시 삭제** — 반드시 `application.yml` 만 사용 ([harness/stack.md](../harness/stack.md))
- Gradle **Kotlin DSL** (`.kts`) 만 사용. Groovy DSL 금지
