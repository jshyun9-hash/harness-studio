# Prototype (Moyza) — 요구사항 v2

v1 기능 유지. 운영 중 발견된 스키마 매핑 이슈 한 건을 v2 에서 정정하고, 이후 추가 변경이 생기면 이 문서에 누적한다.

v1 원문: [prototype.v1.md](prototype.v1.md)

---

## 브레인스토밍 결정 사항 (확정)

v1 의 구조 / 모듈 / 전략 / UI 소스는 모두 그대로 유지. 변경점은 아래뿐.

### 수정 1 — `Title.synopsis` 매핑 (긴 텍스트 공유 엔티티)

- 증상: admin 백엔드 (ddl-auto=validate) 가 기동 시
  `Schema-validation: wrong column type encountered in column [synopsis] in table [title];
  found [character varying (Types#VARCHAR)], but expecting [text (Types#CLOB)]` 로 실패.
- 원인: user 백엔드 `Title` 엔티티가 `@Lob + @Column(columnDefinition = "TEXT")` 조합으로
  선언되어 있어 H2 v2 는 `VARCHAR` 로 스키마를 만든 반면, Hibernate 의 `@Lob(String)` 은
  validate 시점에 `Types#CLOB` 을 기대한다. 두 백엔드 엔티티가 완전히 동일해도
  "생성된 컬럼 타입 ↔ 기대 JDBC 타입" 이 어긋난다.
- 결정: 긴 텍스트 컬럼은 `@Lob` 만 사용하고 `columnDefinition` 은 지정하지 않는다.
  (H2 가 CLOB 으로 생성 → validate 통과.)
  v1 코드에는 임시로 동일 수정이 수동 반영되어 있으며, v2 재생성 시 하네스 규칙이
  자동으로 같은 결과를 만들어내야 한다.
- 하네스 반영:
  - [harness/coding.md](../../harness/coding.md) Entity 패턴 샘플의 `@Column(columnDefinition = "TEXT")`
    를 `@Lob @Column` 으로 변경 (CLOB 생성 보장).
  - [skills/lessons-learned.md](../../skills/lessons-learned.md) 에 교훈 신설.
- 영향 범위: `Title.synopsis` 한 필드. 다른 엔티티에는 `type: Text` 필드 없음.
