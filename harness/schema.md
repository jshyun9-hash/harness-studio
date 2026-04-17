# DB 스키마 기록 규칙

## 목적

각 프로젝트의 DB 테이블 구조를 **프로젝트별로** 기록한다.
하나의 `example/` 안에 여러 프로젝트가 존재하므로, schema는 프로젝트 단위로 분리된다.

## 저장 위치

```
example/projects/{projectId}/schema.md
```

**예시**:
- `projects/resort-reservation/schema.md` — 리조트 예약 시스템 DB
- `projects/cafe-order/schema.md` — 카페 주문 시스템 DB

## 생성/갱신 시점

- **신규 생성**: `skills/crud-page.md` 실행 후, 모든 엔티티가 생성된 뒤 작성
- **완전 재생성**: 기존 schema.md 덮어쓰기 (최신 YML 기준)
- **증분 수정**: 변경된 테이블만 update (추가/수정/삭제)

> `projects/{projectId}/` 가 삭제되면 schema.md도 함께 사라진다.
> 다음 생성 시 YML 기준으로 다시 작성된다.

## 기록 포맷 (템플릿)

```markdown
# {projectId} DB 스키마

## 테이블 목록

### {table_name}

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| {column_1} | BIGINT | PK, AUTO_INCREMENT | {설명} |
| {column_2} | VARCHAR(N) | NOT NULL, UNIQUE | {설명} |
| {column_3} | INT | NOT NULL | {설명} |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

### ...

## 테이블 관계도

\```
{table_a} (1) ──< {table_b} (N) >── (1) {table_c}
                                        │
                                {table_c} (1) ──< {table_d} (N)
\```
```

## 타입 매핑 (YML → DB)

| YML type | DB 타입 (H2) |
|----------|--------------|
| Long | BIGINT |
| Integer | INT |
| String | VARCHAR(N) (기본 255, min/max 고려) |
| Boolean | BOOLEAN |
| Enum | VARCHAR(N) (값 길이 기준) |
| LocalDate | DATE |
| Timestamp | TIMESTAMP |

## 제약 표기 규칙

| YML 속성 | DB 제약 표기 |
|---------|--------------|
| pk: true | PK |
| auto: true (PK) | AUTO_INCREMENT |
| unique: true | UNIQUE |
| required: true | NOT NULL |
| fk: {Entity} | FK → {table_name} |

## 관계도 표기 규칙

- `(1) ──< (N)`: 1:N 관계
- `(1) ──── (1)`: 1:1 관계
- 중앙 테이블 기준으로 가지치기
- 5개 이하 테이블은 1단 관계도, 그 이상이면 그룹별로 나눔

## 주의

- 이 파일(`harness/schema.md`)은 **기록 규칙**만 정의한다
- 실제 스키마는 각 프로젝트의 `projects/{projectId}/schema.md` 에 존재
- YML이 진실의 원천이므로, schema.md는 YML 에서 자동 도출되는 요약 문서의 성격
