# 명명 규칙 (Naming Convention)

## 테이블

| 규칙 | 예시 |
|------|------|
| snake_case, 단수형 | `notice`, `comment`, `product` |
| 도메인 그대로 사용 (접미사 `_board`, `_table` 금지) | `notice` (O) / `notice_board` (X) |
| 조인 테이블: 두 테이블명 조합 | `post_tag`, `user_role` |

## PK (Primary Key)

| 규칙 | 예시 |
|------|------|
| `{테이블명}_id` | `notice_id`, `comment_id` |
| 타입: `BIGINT AUTO_INCREMENT` | — |

## FK (Foreign Key)

| 규칙 | 예시 |
|------|------|
| `{참조 테이블명}_id` | `notice_id` (comment 테이블에서 notice 참조) |
| JPA: `@JoinColumn(name = "{참조}_id")` | `@JoinColumn(name = "notice_id")` |

## 컬럼 (일반)

| 규칙 | 예시 |
|------|------|
| snake_case | `view_count`, `like_count` |
| 축약 금지, 풀네임 사용 | `description` (O) / `desc` (X) |
| Boolean: `is_` 접두사 | `is_pinned`, `is_published`, `is_deleted` |
| 수량/횟수: `_count` 접미사 | `view_count`, `like_count`, `comment_count` |
| 명칭: `_name` 접미사 | `category_name`, `author_name` |

## 감사 컬럼 (Audit)

모든 테이블에 자동 포함:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `created_at` | `TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP` | 생성일시 |
| `updated_at` | `TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP` | 수정일시 |

## Java Entity 매핑

| DB (snake_case) | Java (camelCase) | 비고 |
|-----------------|------------------|------|
| `notice_id` | `noticeId` | Hibernate 자동 변환 |
| `is_pinned` | `isPinned` | — |
| `created_at` | `createdAt` | `@Column(updatable = false)` |

## 프론트엔드 (TypeScript)

| 대상 | 규칙 | 예시 |
|------|------|------|
| 타입/인터페이스 필드 | camelCase | `viewCount`, `isPinned` |
| API 경로 | 소문자 | `/api/notices`, `/api/comments` |
| 파일명 | PascalCase (컴포넌트), camelCase (유틸) | `NoticeCard.tsx`, `noticeApi.ts` |
