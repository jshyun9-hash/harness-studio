# Discovery 스킬 — 요구사항 브레인스토밍 → 명세 확정

## 목적

`spec-requests/{projectId}/` 의 **원문/자료** 를 읽고, 사용자와 **브레인스토밍** 하여 다음을 확정한다.

1. 모듈 구성 (user only / user+admin / admin only)
2. 멀티 모듈이면 **백엔드 전략** (unified / split)
3. split 백엔드면 **DB 전략** (shared / split)
4. **UI 소스** (디자인 자료 첨부 / 템플릿 자동 / 템플릿 지정)
5. 핵심 엔티티 / API / 페이지 / 권한 규칙

이 스킬의 출력은 최종 `specs/{projectId}/{projectId}.v{n}.yml` 에 들어갈 내용이다.

## 트리거

- 사용자가 `spec-requests/{projectId}/` 에 새로운 자료를 넣고 "명세 만들자 / yml 뽑아줘" 등을 요청할 때
- 기존 프로젝트의 새 버전을 만들 때 (v{N+1}) — 기존 YML 을 diff 기반으로 브레인스토밍

## 선행 조건

- `spec-requests/{projectId}/{projectId}.v{n}.md` 존재 (원문)
- `spec-requests/{projectId}/assets/` 는 선택 (디자인/HTML/스크린샷)

---

## 실행 순서

### Step 1: 자료 수집

사용자에게 확인할 것 없이 자동으로 수집한다.

```
- spec-requests/{projectId}/{projectId}.v{n}.md 읽기
- spec-requests/{projectId}/assets/ 내 파일 목록 확인 (있으면 각 파일의 성격 파악)
- specs/ 아래 다른 프로젝트 YML 스캔 → 사용 중인 포트/DB 이름 파악
- 같은 프로젝트의 이전 버전(v{n-1}) YML 이 있으면 읽기
```

### Step 2: 자동 판단 시도

원문을 읽어 아래 신호를 탐색한다.

#### 2.1 모듈 구성 감지

| 신호 (원문 키워드) | 판단 |
|------|------|
| 관리자, 어드민, 운영자, 운영 화면, 백오피스, 관리 페이지 | admin 모듈 필요 |
| 등록 / 수정 / 삭제 권한이 운영자에게만 있음 | admin 모듈 필요 |
| 회원, 고객, 사용자, 소비자, 이용자 / 회원가입, 로그인, 조회, 구매 | user 모듈 필요 |
| 대시보드, 통계, 리포트 (운영자 맥락) | admin 모듈 필요 (운영자용) |
| "관리자는 … 한다", "운영자가 … 할 수 있다" 같은 문장 | admin 모듈 필요 |

조합:
- user 신호만 → **Case 1** 후보
- user + admin 신호 → **멀티 모듈** 후보
- admin 신호만 → **admin only 멀티 모듈** (frontend=[admin] 하나, backend=[admin])

#### 2.2 백엔드 전략 감지 (멀티 모듈일 때)

| 신호 | 판단 |
|------|------|
| "운영자 시스템 분리 배포", "관리용 서버", "백오피스 별도 앱" | split 후보 |
| 프로젝트 규모가 작고 운영 기능이 적음 | unified 후보 |
| 보안/네트워크 경계가 다름 (내부망 운영자) | split 후보 |
| 특별한 언급 없음 | 사용자에게 질문 필요 (기본 권고: **split + shared DB**) |

#### 2.3 DB 전략 감지 (split 백엔드일 때)

| 신호 | 판단 |
|------|------|
| 데이터가 한 덩어리 (같은 회원·같은 주문 공유) | shared |
| 관리자 전용 로그/감사 데이터만 별도 | shared (하나에 담아도 충분) |
| 완전히 다른 도메인 (운영자 DB 와 사용자 DB 가 분리 운영) | split |
| 특별한 언급 없음 | shared 권고 (대부분 shared 로 충분) |

#### 2.4 UI 소스 감지

| 상태 | 판단 |
|------|------|
| `spec-requests/{id}/assets/` 에 HTML / JSX / 스크린샷 존재 | `ui_source` 에 경로 지정, 해당 디자인 우선 구현 |
| 원문에 "화면은 첨부 참고", "디자인 A 대로" 등의 언급 | 자료 찾아보고 없으면 사용자에게 요청 |
| module=user 이고 자료 없음 | template: user 자동 |
| module=admin 이고 자료 없음 | template: admin 자동 |
| 원문에 특정 프레임워크/라이브러리 (MUI, Ant Design 등) 언급 | **사용자 확인** — 하네스는 Tailwind 전용, 변경 가능한지 |

### Step 3: 자동 판단 결과 요약 + 사용자 확인

자동 판단이 끝나면 사용자에게 **한 번에** 요약 제시. 확실한 것은 결정된 대로, 애매한 것은 질문으로.

#### 제시 포맷

```
=== 명세 초안 (자동 판단 결과) ===

프로젝트: {projectId}
버전: v{n}

[모듈 구성]
  ✓ user 모듈 — 근거: 회원가입/객실 조회/예약 등 사용자 플로우
  ✓ admin 모듈 — 근거: "관리자는 객실을 등록/수정" 문구

[백엔드 전략]
  ? unified vs split — 원문에 분리 언급 없음
    권고: split (실무 표준, 배포/장애 격리)
    대안: unified (백엔드 하나에서 path 로 분리, 배포 단순)
  → 어느 쪽으로 갈까요? (split / unified)

[DB 전략]
  ? shared vs split — 데이터 공유가 자연스러움
    권고: shared (회원·객실·예약을 운영자도 같이 봄)
  → 기본값 shared 로 진행할까요? (yes / 변경 원하면 split)

[UI 소스]
  ✓ user: template=user (자동, 자료 없음)
  ✓ admin: template=admin (자동, 자료 없음)
  ※ 디자인 자료가 있으면 spec-requests/{projectId}/assets/ 에 넣어주세요.
    지금 넣고 다시 시작하거나, 추후 증분으로 덮어써도 됩니다.

[핵심 엔티티 초안]
  - Member (login_id, password, member_name, phone, email, parcel_member_no, role)
  - Room (room_code, room_name, stock_count)
  - RoomPrice, RoomPermission
  - Reservation (reservation_no, member_id, room_id, check_in_date, ...)

[권한 초안]
  - roles: [USER, ADMIN]
  - user 모듈: public(/, /signup, /login, /rooms/:id) / protected(/reservation/:roomId, /my-reservations)
  - admin 모듈: 전부 protected, allowed_roles=[ADMIN]

[포트 할당 (다른 프로젝트와 충돌 없음)]
  - frontend.user: 5178
  - frontend.admin: 5179
  - backend.user: 8083
  - backend.admin: 8084
  - db: resortdb_v2

확정해도 될까요? 변경 사항 있으면 알려주세요.
```

### Step 4: 사용자 피드백 반영

- 사용자가 답변 → 반영해서 다시 요약 (큰 변경이면 1번만 재확인, 작은 변경은 바로 진행)
- 사용자가 "진행" / "yes" / "ok" → Step 5 로

### Step 5: 최종 산출물 생성

#### 5.1 spec-requests/{projectId}/{projectId}.v{n}.md 정리

원문을 그대로 두되, 브레인스토밍 결정이 원문에 없던 것이라면 **"## 브레인스토밍 결정 사항"** 섹션을 말미에 추가:

```markdown
## 브레인스토밍 결정 사항 (v{n}, {date})

- 모듈: user + admin
- 백엔드 전략: split (사용자 결정)
- DB 전략: shared, owner=user
- UI 소스: user=template:user, admin=template:admin (자료 없음)
```

> 원문 본문은 **수정하지 않는다**. 결정 사항은 섹션으로 분리.

#### 5.2 specs/{projectId}/{projectId}.v{n}.yml 생성

[harness/spec-format.md](../harness/spec-format.md) 포맷 완전 준수.

- `project.modules` 에 확정된 구성
- `entities`, `apis`, `pages`, `auth` 전부 채움
- 멀티 모듈이면 각 엔티티/API/페이지의 `module`, `role`, `ui_source` 빠짐없이 기록

#### 5.3 specs/{projectId}/log.md 생성/업데이트

현재 최신 버전 + changelog 기록.

### Step 6: 다음 단계 안내

```
명세가 확정되었습니다.

작성된 파일:
  - spec-requests/{projectId}/{projectId}.v{n}.md
  - specs/{projectId}/{projectId}.v{n}.yml
  - specs/{projectId}/log.md

다음 단계:
  - 신규 프로젝트면 → "만들어줘" 라고 말씀하시면 코드 생성 시작
  - 기존 프로젝트 업데이트면 → [1] 완전 재생성 / [2] 증분 수정 선택

진행할까요?
```

---

## 자동 판단 시 주의사항

### 보수적으로 판단

- 애매하면 **사용자 확인**. 잘못된 단정은 프로젝트 통째 재생성으로 이어짐.
- "관리자" 라는 단어가 **회원 분류** 로 나온 경우 (예: 일반회원/관리회원) 는 admin 모듈로 치환하지 말 것 — role 로만 분리.

### UI 자료가 상이한 프레임워크인 경우

- 첨부 파일이 React + Tailwind 가 아닌 경우 (예: Vue, Angular, Bootstrap, MUI 등)
  → 사용자에게 **레이아웃/디자인만 참고하고 Tailwind 로 재구성해도 되는지** 확인

### 확장

- 세 번째 모듈(예: `mobile`, `partner`) 이 필요하다는 신호가 있으면 → 사용자 확인 후 모듈 추가
- 허용 key: `user`, `admin` + 필요 시 확장

---

## 산출물 검증 체크리스트

- [ ] `spec-requests/{id}/{id}.v{n}.md` 가 브레인스토밍 결정 사항을 포함
- [ ] `specs/{id}/{id}.v{n}.yml` 이 [harness/spec-format.md](../harness/spec-format.md) 전체 검증 체크리스트를 통과
- [ ] 포트 / DB 이름이 다른 프로젝트와 충돌 없음
- [ ] 모듈/전략 결정이 원문 근거와 어긋나지 않음
- [ ] UI 자료가 있는 경우 `ui_source` 에 경로가 명시됨
- [ ] `log.md` 에 현재 최신 버전 + changelog 가 기록됨
