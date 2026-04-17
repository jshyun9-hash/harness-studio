# 셋팅 경험 기록 (Lessons Learned)

> studio 프로젝트에서 얻은 교훈을 example에도 적용한다.
> 새로운 이슈 발생 시 이 파일에 추가한다.

## studio에서 가져온 교훈

1. **사전 환경 체크 필수** — Java/Node 미설치 시 빌드 실패
2. **Spring Boot 버전 고정 금지** — Initializr `bootVersion` 생략이 안전
3. **Vite 데모 파일 정리** — 스캐폴딩 직후 assets/App.css/public 삭제
4. **application.properties → yml 교체** — Initializr 기본 파일 즉시 삭제
5. **GlobalExceptionHandler 필수** — 없으면 프론트 파싱 실패
6. **프록시 target은 127.0.0.1** — localhost의 IPv6 문제 방지
7. **Gradle 8.x 고정** — Spring Boot 3.x는 Gradle 9와 비호환
8. **TypeScript 제네릭은 느슨하게** — `<T>` 또는 `<T extends object>` 권장

## example에서 발견한 교훈

9. **인증 보호 페이지에서 authLoading 체크 필수** — `useAuth()`의 `member`가 null인 이유가 "비로그인"인지 "세션 확인 중"인지 구분해야 함. `authLoading`이 끝나기 전에 `!member`로 리다이렉트하면 로그인 상태여도 로그인 페이지로 튕김.
   ```tsx
   // ❌ 잘못된 패턴
   useEffect(() => {
     if (!member) navigate('/login');
   }, [member]);

   // ✅ 올바른 패턴
   useEffect(() => {
     if (authLoading) return;          // 세션 확인 완료 대기
     if (!member) navigate('/login');   // 진짜 비로그인일 때만
   }, [member, authLoading]);
   ```

10. **모바일 메뉴는 풀스크린 서랍(Drawer) 패턴 사용** — Header 아래로 펼치는 드롭다운은 컨텐츠를 밀어내서 UX가 나쁨. 화면 전체를 덮는 서랍이 표준.
    - `fixed inset-0 w-full` 풀스크린 + `translate-x` 애니메이션
    - 서랍 열린 상태에서 `body overflow: hidden` (배경 스크롤 방지)
    - 페이지 이동 시(`location.pathname` 변경) 자동 닫힘
    - 회원정보/로그아웃은 메뉴 항목과 분리하여 하단 고정 (`flex-col` + `border-t`)

11. **네비게이션 현재 페이지 활성 표시 필수** — 메뉴에 활성 상태 스타일이 없으면 사용자가 현재 위치를 인지할 수 없음. `useLocation()`으로 현재 경로를 판단하고 활성 메뉴에 차별 스타일 적용.
    - 데스크톱: `text-indigo-600 border-b-2 border-indigo-600`
    - 모바일 서랍: `bg-indigo-50 text-indigo-600`

12. **Gradle toolchain 버전은 로컬 JDK와 일치시키기** — Spring Initializr에서 `javaVersion=17` 로 받아도, 환경에 Java 17이 없고 21만 있으면 `toolchain {languageVersion = 17}` 이 컴파일 실패를 일으킨다. 해결:
    - build.gradle.kts 의 `JavaLanguageVersion.of(17)` → 로컬 JDK 버전에 맞춰 수정 (e.g. 21)
    - 또는 auto-provisioning 활성화 (`gradle.properties`)
    - 재생성 시 Claude가 `java --version` 결과를 보고 toolchain 값을 동적으로 설정해야 함

13. **Java record 의 static factory method 이름은 component 이름과 겹치면 안 된다** — record `CheckIdResponse(boolean available, ...)` 에 `public static CheckIdResponse available()` 를 만들면 컴파일 에러 ("Illegal return type of accessor"). record component accessor 와 이름이 같으면 충돌. 접두사(`of`, `as`)를 붙여 회피.
    ```java
    // ❌
    public static CheckIdResponse available() { ... }
    // ✅
    public static CheckIdResponse ofAvailable() { ... }
    ```

14. **Spring Initializr 가 Spring Boot 4.0 Milestone 을 기본값으로 내려줄 수 있다** — `bootVersion` 생략 시 Initializr 가 4.0.x (Milestone/RC) 를 내려주는 경우가 있고, 이 버전의 starter 네이밍은 기존(3.x)과 달라 표준 문서/예제와 불일치. 예: `spring-boot-starter-web` 대신 `spring-boot-starter-webmvc`, `spring-boot-starter-test` 대신 `spring-boot-starter-{module}-test` 등. 또한 `spring-boot-h2console` 같이 starter 가 아닌 모듈도 포함됨.
    - 해결: 생성 직후 `build.gradle.kts` 의 `id("org.springframework.boot") version` 을 **안정 버전 (3.5.x)** 으로 고정 + 의존성 이름을 표준 starter 로 교체 (`spring-boot-starter-web`, `spring-boot-starter-test`)
    - init-backend 스킬에서 Initializr 호출 직후 build.gradle.kts 버전 고정을 루틴화 권장

15. **SQL 예약어 테이블명 회피** — `cast` 는 H2/MySQL/PostgreSQL 등에서 CAST(x AS y) 함수의 예약어. `@Table(name = "cast")` 는 DDL 생성 시 실패하거나 런타임에 문제. 해결:
    - 엔티티 클래스명 유지, `@Table(name = "cast_member")` 처럼 테이블명만 회피
    - YML 명세의 `table` 값도 동일하게 수정 (문서와 코드 일치)
    - 기타 주의 예약어: `order`, `user`, `group`, `check`, `cast`, `schema`, `table`

16. **공통 코드 엔티티(CodeItem) 참조 시 컬럼명 관례는 `{의미}_code_id`** — 예: `country_code_id`, `genre_code_id`. 공통 코드 그룹별 enum 스타일 FK. Service 에서 `code_group` 힌트로 그룹 소속 검증 (`CodeService.assertBelongsTo`).

17. **StoredFile 공통 엔티티는 자동 주입** — 모든 프로젝트의 양쪽 백엔드(split) 에 `StoredFile` 엔티티 + Repository + FileService 생성. 디스크 저장 파일명은 확장자 없이 `{file_key}` (UUID v4) 만 사용. DB `ext`/`mime_type` 으로만 원본 타입 복구.

18. **HTML 프로토타입은 screen visibility state machine 을 React Router 로 분할한다** — 단일 HTML 파일의 모바일 mockup(예: `prototype_claude.html`)은 보통 "app container + 여러 `<section class="screen">` + JS 로 `.active` 토글" 구조다. 이를 React 에 포팅할 때 **show/hide state machine 을 그대로 복제하지 말고** 각 screen 을 독립 라우트 페이지로 분할한다:
    - `PhoneFrame` (desktop 프레임 + StatusBar) = 공통 shell
    - 각 screen = 자신의 스크롤/sticky bottom bar 를 책임지는 페이지
    - 화면 간 이동 = `useNavigate()` / `<Link>`, 뒤로가기 = `navigate(-1)`
    - 같은 원본 HTML 을 여러 페이지에서 재사용하는 요소 (예: 하단 Survey 배너, BottomNav) 는 별도 컴포넌트로 추출
    ```tsx
    // ❌ HTML 상태 기계 복제
    const [screen, setScreen] = useState<'home'|'search'|'detail'>('home');
    return <div>{screen === 'home' && <Home/>}{screen === 'search' && <Search/>}...</div>;

    // ✅ Router 로 분할
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/search" element={<SearchPage/>} />
        <Route path="/titles/:id" element={<TitleDetailPage/>} />
      </Routes>
    </PhoneFrame>
    ```
    이유: 딥링크 가능, 뒤로가기 버튼 자연 지원, 각 화면이 자기 상태/스크롤/API 호출을 독립 관리. 비노출 요소(원본 HTML 의 공유/하트 아이콘 등)는 포팅 단계에서 **데이터는 살려두고 DOM 만 제거** — v2 토글 가능하도록 설계.
