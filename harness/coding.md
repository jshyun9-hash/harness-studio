# 코딩 컨벤션

## 프론트엔드 (TypeScript/React)

### ESLint 규칙
```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "no-console": "warn",
  "no-var": "error",
  "prefer-const": "error",
  "eqeqeq": "error",
  "react-hooks/exhaustive-deps": "warn"
}
```

### TypeScript strict
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### React 패턴
- 컴포넌트는 function 선언 (arrow function 금지)
- Props는 반드시 interface로 정의
- 커스텀 훅으로 비즈니스 로직 분리
- API 호출은 api/ 레이어에서만
- **인증 보호 페이지**: `authLoading` 완료 후에만 `!member` 판단 → 리다이렉트 (세션 비동기 확인 중 오판 방지)

```typescript
// ✅ 올바른 예
interface Props {
  items: Notice[];
}

export default function NoticeCard({ items }: Props) { }

// ❌ 금지
const NoticeCard = ({ items }: any) => { }
```

### 반응형 규칙
- **모바일 퍼스트**: 기본 스타일은 모바일, `sm:` / `md:` / `lg:` 으로 확장
- 모든 페이지는 `Layout` 컴포넌트 안에서 렌더링
- 리스트는 카드 그리드 패턴 사용 (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)

## 백엔드 (Java/Spring Boot)

### 공통 규칙
- 모든 API 응답은 ApiResponse<T> 로 래핑
- Service 레이어에서 비즈니스 로직 처리
- Controller는 요청 검증 + Service 호출만
- Repository(JPA)는 데이터 접근만 담당

### Entity 패턴
```java
@Entity
@Table(name = "notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    // 긴 텍스트(YML: type: Text) 는 @Lob 단독. columnDefinition 지정 금지.
    // 이유: H2 v2 는 columnDefinition="TEXT" 를 VARCHAR 로 저장하지만
    //       @Lob(String) 은 validate 시 Types#CLOB 을 기대 → split backend 에서 mismatch.
    //       (lessons-learned #19)
    @Lob
    @Column(name = "content")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Controller 패턴
```java
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ApiResponse<PageResponse<NoticeResponse>> getList(
            NoticeSearchCondition condition) {
        return ApiResponse.success(noticeService.getList(condition));
    }

    @GetMapping("/{id}")
    public ApiResponse<NoticeResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.success(noticeService.getDetail(id));
    }

    @PostMapping
    public ApiResponse<Long> create(@Valid @RequestBody NoticeRequest request) {
        return ApiResponse.success(noticeService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id,
            @Valid @RequestBody NoticeRequest request) {
        noticeService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        noticeService.delete(id);
        return ApiResponse.success();
    }
}
```

### Service 패턴
```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public PageResponse<NoticeResponse> getList(NoticeSearchCondition condition) {
        Pageable pageable = PageRequest.of(
                condition.getPage() - 1, condition.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        // ...
    }

    @Transactional
    public Long create(NoticeRequest request) {
        Notice notice = request.toEntity();
        return noticeRepository.save(notice).getId();
    }
}
```
