# 기술 스택 규칙

## 프론트엔드

| 항목 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | 19.x |
| 언어 | TypeScript | 6.x |
| 스타일링 | Tailwind CSS | 4.x |
| 빌드 | Vite | 8.x |
| HTTP 클라이언트 | fetch (내장) | - |

### 프론트엔드 의존성 규칙
- UI 라이브러리는 Tailwind CSS만 사용 (MUI, Ant Design 금지)
- 상태 관리는 React 내장 (useState, useContext)만 사용 (Redux, Zustand 금지)
- HTTP 클라이언트는 fetch 사용 (axios 금지)

## 백엔드

| 항목 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Spring Boot | 3.x |
| 언어 | Java | 17 |
| ORM | JPA (Hibernate) | - |
| DB | H2 (파일 모드) | - |
| 빌드 | Gradle (Kotlin DSL) | 8.x |

### 백엔드 의존성 규칙
- spring-boot-starter-web 필수
- spring-boot-starter-data-jpa 필수
- spring-boot-starter-validation 필수
- h2 (runtime scope)
- Lombok 사용 가능

### 빌드 도구 강제 규칙
- **Gradle (Kotlin DSL) 만 사용** — `build.gradle.kts`, `settings.gradle.kts`
- **Maven (pom.xml) 사용 금지**
- **Gradle Groovy DSL (`build.gradle`) 금지** → 반드시 Kotlin DSL
- Spring Initializr 호출 시 `type=gradle-project-kotlin` 고정

### 설정 파일 강제 규칙
- **모든 설정 파일은 YAML(.yml) 사용**
- `application.properties` 사용 금지
- Spring Initializr가 자동 생성한 `application.properties` 는
  셋팅 직후 **반드시 삭제 후 `application.yml`로 교체**

### JPA 규칙
- Entity 클래스에 `@Entity`, `@Table(name = "snake_case")` 사용
- PK는 `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)`
- 연관관계는 필요한 경우만 사용, 양방향 지양
- Repository는 `JpaRepository<Entity, Long>` 상속

## DB

- H2 파일 모드 (영구 저장)
- 저장 경로: `./data/exampledb`
- 콘솔: http://localhost:8081/h2-console
- 테이블명: snake_case (예: notice)
- JPA ddl-auto: `update` (개발), `validate` (운영)

### application.yml 설정
```yaml
spring:
  datasource:
    url: jdbc:h2:file:./data/exampledb;AUTO_SERVER=TRUE
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
  port: 8081
```
