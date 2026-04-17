# Backend 초기 셋팅 스킬

## 트리거
- `example/projects/{projectId}/backend/` 가 **없을 때** 자동 실행
- 또는 사용자가 "백엔드 셋팅 해줘" 요청 시 (projectId 확인 필수)

## 입력 (YML에서 읽어옴)
- `project.id` → `{projectId}` (패키지명 / 폴더명)
- `project.ports.backend` → 서버 포트
- `project.ports.frontend` → CORS 허용 오리진, 프록시 타깃
- `project.database.name` → H2 파일명

## 목적
Spring Boot + JPA + H2 기반 백엔드 프로젝트를 `projects/{projectId}/backend/` 에 초기화한다.

## 기술 스택
harness/stack.md 참조:
- Spring Boot 3.x + Java 17
- JPA (Hibernate)
- H2 파일 모드 (영구 저장, 프로젝트별 분리)
- Gradle (Kotlin DSL)
- 포트: YML의 `project.ports.backend` 값

## 생성 순서

### 1. Spring Initializr로 스캐폴딩

```bash
cd example/projects/{projectId}
curl -s -o backend.zip "https://start.spring.io/starter.zip?\
dependencies=web,data-jpa,validation,h2,lombok&\
type=gradle-project-kotlin&\
language=java&\
javaVersion=17&\
groupId=com.harness&\
artifactId=backend&\
name=harness-{projectId}-backend&\
packageName=com.harness.{projectId의 camelCase}"
unzip -q backend.zip -d backend
rm backend.zip
```

> `bootVersion` 파라미터 생략 (서버 기본값 사용)
> `{projectId의 camelCase}`: kebab-case 의 하이픈 제거 후 lowerCamelCase. 예: `resort-reservation` → `resortReservation`

### 2. 스캐폴딩 직후 정리
```bash
rm backend/src/main/resources/application.properties
```

### 3. 최종 프로젝트 구조
```
projects/{projectId}/backend/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/
├── gradlew
├── gradlew.bat
└── src/main/
    ├── java/com/harness/{projectIdCamel}/
    │   ├── {ProjectIdPascal}Application.java
    │   ├── domain/                    # 기능별 도메인 (비어있음)
    │   └── global/
    │       ├── common/
    │       │   ├── ApiResponse.java
    │       │   └── PageResponse.java
    │       └── config/
    │           ├── CorsConfig.java
    │           └── GlobalExceptionHandler.java
    └── resources/
        └── application.yml
```

### 4. application.yml

> 포트/DB 이름은 반드시 YML의 값을 치환해서 쓴다.

```yaml
spring:
  application:
    name: {projectId}

  datasource:
    url: jdbc:h2:file:./data/{database.name};AUTO_SERVER=TRUE
    driver-class-name: org.h2.Driver
    username: sa
    password:

  h2:
    console:
      enabled: true
      path: /h2-console

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.H2Dialect

server:
  port: {ports.backend}

logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE
```

> `./data/` 는 backend 실행 기준 상대경로 → `projects/{projectId}/backend/data/` 가 아니라
> **`projects/{projectId}/data/`** 에 DB 파일이 생기도록 `../data/{database.name}` 를 사용한다.
>
> 즉 실제로는: `url: jdbc:h2:file:../data/{database.name};AUTO_SERVER=TRUE`

### 5. 공통 클래스

패키지는 `com.harness.{projectIdCamel}` 로 치환.

#### global/common/ApiResponse.java
```java
package com.harness.{projectIdCamel}.global.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ApiResponse<T> {
    private final boolean success;
    private final T data;
    private final String message;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static ApiResponse<Void> success() {
        return new ApiResponse<>(true, null, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
```

#### global/common/PageResponse.java
```java
package com.harness.{projectIdCamel}.global.common;

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

> allowedOrigins 는 YML의 `ports.frontend` 값을 치환해서 넣는다.

```java
package com.harness.{projectIdCamel}.global.config;

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
                        .allowedOrigins("http://localhost:{ports.frontend}")
                        .allowedMethods("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

#### global/config/GlobalExceptionHandler.java
```java
package com.harness.{projectIdCamel}.global.config;

import com.harness.{projectIdCamel}.global.common.ApiResponse;
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
cd projects/{projectId}/backend
./gradlew build
```

빌드 통과하면 셋팅 완료.

## 실행
```bash
cd projects/{projectId}/backend
./gradlew bootRun
# → http://localhost:{ports.backend}
# → H2 콘솔: http://localhost:{ports.backend}/h2-console
```
