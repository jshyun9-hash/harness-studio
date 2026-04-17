# 파일 업로드 공통 규칙

모든 프로젝트는 파일 업로드/다운로드를 위한 공통 엔티티(`StoredFile`) 와 API 를 **자동으로 포함** 한다.
YML 에 명시하지 않아도 생성기는 이 규칙에 따라 파일 기능을 프로젝트에 주입한다.

---

## 1. 공통 엔티티 — `StoredFile`

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `file_id` | Long | PK, auto | 내부 식별자 |
| `file_key` | String | UNIQUE, NOT NULL, 36자 | 외부 노출용 UUID v4 |
| `original_name` | String | NOT NULL | 원본 파일명 (확장자 포함) |
| `ext` | String | NOT NULL | 확장자 (점 없이, 소문자. 예: `png`, `jpg`, `pdf`) |
| `size_bytes` | Long | NOT NULL | 파일 크기 |
| `mime_type` | String | NOT NULL | MIME 타입 (예: `image/png`) |
| `stored_path` | String | NOT NULL | 프로젝트 루트 기준 상대 경로 (디렉토리만, 파일명 제외) |
| `stored_name` | String | NOT NULL | 디스크에 저장된 파일명. 규칙: **`{file_key}`** (확장자 **없음**) |
| `uploaded_by_id` | Long | FK Member, nullable | 업로드한 사용자 (비인증 업로드 허용 시 null) |
| `created_at` | Timestamp | audit | |
| `updated_at` | Timestamp | audit | |

**`file_key` 생성**: 업로드 시 UUID v4 생성 (`java.util.UUID.randomUUID().toString()`).
**`stored_name`**: 원본 파일명 절대 사용 금지 (추측/충돌 방지). 항상 **`{file_key}` (확장자 없음)**.
→ 디스크에서 파일 타입을 추측하기 어렵게 하기 위함. MIME/확장자는 DB 에서만 유지.
→ 다운로드 응답 헤더에 `Content-Type` (DB 의 `mime_type`), `Content-Disposition` 의 `filename` (DB 의 `original_name`) 으로 노출.

---

## 2. 디스크 저장 경로

```
projects/{projectId}/storage/uploads/{yyyy}/{MM}/{file_key}
```

- 연/월 폴더로 분산 (파일 시스템 부담 최소화)
- `{yyyy}`: 4자리 연도 (업로드 시점)
- `{MM}`: 2자리 월 (zero-padded, 예: `04`)
- **확장자 없음** — 디스크 상 파일 타입 추측 방지
- 백엔드 실행 기준 상대경로:
  - 단일 backend (Case 1/2): `../storage/uploads/{yyyy}/{MM}/{file_key}`
  - split backend (Case 3/4): `../../storage/uploads/{yyyy}/{MM}/{file_key}`

**`StoredFile.stored_path` 저장 값**: 백엔드 실행 기준이 아닌 **프로젝트 루트 기준** 상대 경로.
예: `storage/uploads/2026/04` — 실제 읽기 시 backend 가 `../` 또는 `../../` 접두사를 붙여 해석.

---

## 3. 공통 API

모든 프로젝트의 backend 에 자동 포함. split backend 인 경우 **user 백엔드 / admin 백엔드 양쪽 모두** 제공 (두 쪽 다 업로드 가능해야 하기 때문).

### 업로드

```
POST /api/files
Content-Type: multipart/form-data
Authorization: 세션 필수 (기본). 비인증 업로드 허용 시 YML 에 명시

Request:
  - file: 바이너리 파일 (필수)

Response 200:
  {
    "success": true,
    "data": {
      "fileKey": "a4f9c2e8-1b3d-4c5e-8a9f-b3d4c5e8a9f0",
      "originalName": "logo.png",
      "ext": "png",
      "sizeBytes": 12345,
      "mimeType": "image/png",
      "url": "/api/files/a4f9c2e8-1b3d-4c5e-8a9f-b3d4c5e8a9f0"
    }
  }
```

### 다운로드

```
GET /api/files/{fileKey}

Response 200:
  Content-Type: (stored mime_type)
  Content-Disposition: inline; filename="{original_name}"
  Body: 바이너리

Response 404: 파일 없음
```

- 기본 **공개** (세션 불필요). 프로젝트별로 YML 에서 `files.download_auth: true` 지정 시 인증 요구.

### 기타 (선택, 기본 미생성)

- `DELETE /api/files/{fileKey}` — 관리자 전용. YML 에 `files.delete_api: true` 면 생성
- `GET /api/files/{fileKey}/meta` — 메타 조회. YML 에 `files.meta_api: true` 면 생성

---

## 4. 다른 엔티티가 파일을 참조하는 방법

파일을 참조하는 필드는 `fk: StoredFile` 로 명시.
컬럼명은 **용도 prefix + `_file_id`** 형태.

```yaml
SiteSetting:
  fields:
    - { name: logo_file_id, type: Long, fk: StoredFile, required: false, label: 로고 이미지 }

Banner:
  fields:
    - { name: image_file_id, type: Long, fk: StoredFile, required: true, label: 배너 이미지 }
```

### 프론트엔드에서 이미지 표시

- `StoredFile` 응답 DTO 는 `file_key` + `url` (계산: `/api/files/{file_key}`) 모두 포함
- 다른 엔티티의 상세 응답은 참조 파일에 대한 **FileRefDto** 를 포함:
  ```typescript
  interface FileRefDto {
    fileKey: string;
    url: string;          // /api/files/{fileKey}
    originalName: string;
    mimeType: string;
  }
  ```
- 목록 응답에서 썸네일만 필요한 경우 `url` 만 담아도 됨

---

## 5. 업로드 흐름 (프론트 패턴)

```
1. 사용자가 파일 선택
2. POST /api/files (multipart) → file_key 받음
3. 상위 엔티티 폼에 file_key 저장 (숨김 필드)
4. 상위 엔티티 저장 시 {용도}_file_id 를 file_key 로부터 조회해 설정
   (또는 업로드 응답에서 받은 file_id 를 그대로 사용)
```

- 업로드 API 응답은 `file_id` 도 함께 반환 (`data.fileId`) — 상위 엔티티가 FK 로 바로 사용 가능
- 상위 엔티티의 Request DTO 는 `{용도}_file_id` 를 직접 받음

### 공통 프론트 컴포넌트 — `FileUploader`

**생성 위치**: `src/components/common/form/FileUploader.tsx`
**대상**: **admin 템플릿 전용 사전 생성** (user 템플릿은 필요 시 페이지에서 직접 구성)
**기능**: 클릭/드래그 앤 드롭 업로드 + 썸네일 또는 아이콘 미리보기 + 교체 + 삭제 + 진행/에러 상태

```tsx
interface FileUploaderProps {
  /** 현재 선택된 file_id (등록 폼은 undefined, 수정 폼은 기존 값) */
  value?: number;

  /** 수정 폼 진입 시 기존 파일 프리뷰 정보 (수정용). value 와 함께 전달 */
  initialPreview?: {
    url: string;             // 보통 /api/files/{fileKey}
    originalName: string;
    mimeType?: string;
  };

  /** 업로드 완료 또는 삭제 시 호출 — 삭제는 undefined */
  onChange: (fileId: number | undefined) => void;

  /** MIME 필터. 기본: "image/*" (필요 시 "application/pdf" 등) */
  accept?: string;

  /** 클라이언트 사이드 크기 상한. 기본: files.md 전역값 (10MB) */
  maxSizeBytes?: number;

  /** 프리뷰 모양: 이미지(축소 썸네일) vs 아이콘(파일명 + 확장자 배지) */
  previewVariant?: 'image' | 'icon';

  /** 비활성 상태 (폼 제출 중 등) */
  disabled?: boolean;

  /** 업로드 실패 시 호출. 미지정이면 컴포넌트 내부에서 useToast 로 에러 표시 */
  onUploadError?: (error: Error) => void;
}
```

### 내부 동작

1. **파일 선택 / 드래그** — 사용자 선택 감지
2. **클라이언트 검증** — `accept` MIME 매치 + `maxSizeBytes` 크기 검사. 실패 시 업로드 전 차단 + 에러 표시 (Toast 또는 `onUploadError`)
3. **업로드** — `POST /api/files` multipart. 업로드 동안 내부 로딩 스피너 + 진행률(가능 시). 이 기간 input 은 disabled
4. **성공** — 응답의 `fileId` 로 `onChange(fileId)` 호출, 내부 state 에 `{ url, originalName, mimeType }` 저장하여 프리뷰 렌더
5. **실패** — `onUploadError` 또는 내부 Toast. 기존 프리뷰 복원 (교체 시도였던 경우 원상복귀)
6. **삭제 (X 버튼)** — `onChange(undefined)`. 내부 프리뷰 state 초기화. **원본 파일은 즉시 지우지 않음** (고아 파일 정리 정책에 위임)
7. **교체** — 삭제 없이 새 파일 선택 시 바로 재업로드. 성공 시 새 `fileId` 로 교체

### 프리뷰 소스 우선순위

- 업로드 직후: 응답에서 받은 `url` (로컬 state)
- 외부에서 `value` 만 바뀐 경우(부모가 값 주입): `initialPreview` 가 있으면 그것 사용
- `value` 도 `initialPreview` 도 없으면 빈 상태 (드롭 영역 UI)

### 사용 예

**등록 폼**
```tsx
<FormField label="배너 이미지" required>
  <FileUploader
    value={form.imageFileId}
    onChange={(id) => setForm({ ...form, imageFileId: id })}
    accept="image/*"
  />
</FormField>
```

**수정 폼** (기존 이미지 프리뷰 유지)
```tsx
<FormField label="배너 이미지" required>
  <FileUploader
    value={form.imageFileId}
    initialPreview={banner.imageFile ? {
      url: banner.imageFile.url,
      originalName: banner.imageFile.originalName,
      mimeType: banner.imageFile.mimeType,
    } : undefined}
    onChange={(id) => setForm({ ...form, imageFileId: id })}
    accept="image/*"
  />
</FormField>
```

### 백엔드 응답 DTO 연계

`GET /api/admin/banners/{id}` 같은 상세 조회는 FK 파일에 대해 `FileRefDto` (5번 "다른 엔티티가 파일을 참조하는 방법" 참조) 를 함께 내려준다. 프론트는 그 `FileRefDto` 를 `initialPreview` 로 매핑.

---

## 6. 제약 / 정책

| 항목 | 기본값 | 재정의 (YML) |
|------|--------|--------------|
| 최대 파일 크기 | 10 MB | `files.max_size_mb: 20` |
| 허용 MIME | 전체 | `files.allowed_mime: ["image/*", "application/pdf"]` |
| 업로드 인증 | 필수 | `files.upload_auth: false` (비인증 허용) |
| 다운로드 인증 | 불필요 | `files.download_auth: true` |
| 삭제 API | 없음 | `files.delete_api: true` |
| 썸네일 생성 | 없음 | 하네스 범위 밖 (별도 스킬) |

### YML 에 재정의 예

```yaml
files:
  max_size_mb: 20
  allowed_mime: ["image/png", "image/jpeg", "image/webp"]
  upload_auth: true
  download_auth: false
  delete_api: true
```

- YML 에 `files` 섹션이 없으면 **모두 기본값** 으로 해석.
- `StoredFile` 엔티티 자체는 YML 의 `entities` 에 명시할 필요 없음 (자동 주입).

---

## 7. 백엔드 구현 규칙

### 패키지 위치

- `domain/file/` — StoredFile 도메인 패키지
  - `entity/StoredFile.java`
  - `repository/StoredFileRepository.java`
  - `controller/FileController.java` — `/api/files` 담당
  - `service/FileService.java` — 저장/로드 로직
  - `dto/FileUploadResponse.java`, `FileRefDto.java`

### FileService 책임

- `upload(MultipartFile file, Long uploaderId)` → `StoredFile`
  - UUID 생성, 연월 폴더 생성(없으면 mkdir), 파일 기록, 엔티티 저장
- `loadResource(String fileKey)` → `Resource` + metadata
  - `stored_path` + `stored_name` 으로 파일 읽어 반환
- `delete(String fileKey)` — 선택 API 활성 시
  - 엔티티 삭제 후 디스크 파일 삭제 (순서 중요 — 엔티티 먼저 삭제 실패 시 파일은 그대로)

### 저장 루트 주입

`application.yml`:
```yaml
app:
  storage:
    root: ../storage/uploads        # Case 1/2
    # root: ../../storage/uploads   # Case 3/4 (split backend)
```

`FileService` 는 `@Value("${app.storage.root}")` 로 읽어 기준 경로 사용.

---

## 8. 보안

- **원본 파일명 저장 X** (디스크에는 `{file_key}.{ext}` 만)
- **Content-Disposition 의 filename** 은 RFC 5987 인코딩하여 한글/특수문자 지원
- 업로드 시 MIME 화이트리스트 (설정 있을 때) **검증**
- 경로 traversal 방지: `file_key` 는 UUID 패턴만 허용 (`^[0-9a-f-]{36}$`)
- 이미지 로딩은 직접 `<img src="/api/files/{key}">` — 별도 토큰 불필요 (공개 시)
- 디스크에 저장된 파일명은 **확장자 없음** — 직접 파일 시스템을 열람해도 타입을 즉시 알 수 없음 (보안 강화). 올바른 타입은 DB `mime_type` / `ext` 로만 복구 가능

---

## 9. 삭제 / 고아 파일 관리

- 기본적으로 **엔티티 삭제가 파일 삭제를 자동 트리거하지 않는다** (참조 엔티티가 여럿일 수 있기 때문)
- 주기적 정리 스크립트나 관리자 화면을 별도로 만든다 (하네스 범위 밖)
- 운영상 필요하면 각 프로젝트의 Service 에서 `@PreRemove` 로 수동 삭제

---

## 10. 적용 체크리스트

각 프로젝트 생성 시 자동으로 수행:

- [ ] `StoredFile` 엔티티 + Repository + Service + Controller 생성 (각 backend app)
- [ ] `FileRefDto`, `FileUploadResponse` 생성
- [ ] `application.yml` 에 `app.storage.root` 주입
- [ ] 프론트: `components/common/FileUploader.tsx`, `api/fileApi.ts`, `types/file.ts` 생성 (각 frontend app)
- [ ] `projects/{id}/storage/uploads/` 디렉토리 생성 (비어있어도 OK)
- [ ] `.gitignore` 에 `storage/` 가 있으면 무시되도록 (projects/ 자체가 ignore 되므로 자동 커버)
- [ ] split backend + shared DB 면 `StoredFile` 을 **양쪽 백엔드에 엔티티 복제** 생성
