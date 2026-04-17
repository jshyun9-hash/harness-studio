# 증분 수정 스킬 (옵션 2)

## 트리거
기존 `projects/{projectId}/` 이 존재하는 상태에서 사용자가 `[2] 증분 수정` 을 선택한 경우.

## 원칙
- 기존 코드·DB를 **보존**하고, 이전 버전과 최신 버전의 YML 차이만큼만 코드를 수정한다.
- **장점**: 빠름, DB 데이터 보존
- **단점**: 복잡한 변경(필드 삭제/타입 변경/엔티티 rename)은 불완전할 수 있음
  → 위험 변경 감지 시 **사용자에게 재확인**하고, 필요하면 완전 재생성을 권고

## 입력
- 프로젝트: `{projectId}`
- 이전 버전: `v{N}` — `specs/{projectId}/{projectId}.v{N}.yml`
- 새 버전: `v{N+1}` — `specs/{projectId}/{projectId}.v{N+1}.yml`

## 사전 체크
1. 두 YML 파일 모두 존재 확인
2. `project.version` 이 각각 N, N+1 인지 확인
3. `project.id`, `ports`, `database.name` 이 두 버전에서 동일한지 확인 (deterministic 유지)
4. `changelog` 최상단 엔트리의 `generation: 증분 수정` 확인

## 실행 순서

### Step 1: Diff 분석

v{N} 과 v{N+1} 의 차이를 엔티티/API/페이지 단위로 분류한다.

| 변경 유형 | 위험도 | 자동화 |
|----------|--------|--------|
| 엔티티 필드 **추가** | 🟢 낮음 | 자동 (JPA ddl-auto=update 반영) |
| 엔티티 필드 **라벨/검증 변경** | 🟢 낮음 | 자동 |
| 새 엔티티 추가 | 🟢 낮음 | 자동 (entity~controller 일괄 생성) |
| 새 API 추가 | 🟢 낮음 | 자동 |
| 새 페이지 추가 | 🟢 낮음 | 자동 |
| 비즈니스 로직 변경 | 🟡 중간 | 자동 (Service 수정) |
| UI 로직 변경 | 🟡 중간 | 자동 |
| 엔티티 필드 **삭제** | 🔴 높음 | **사용자 확인** (DB 데이터 손실 가능) |
| 엔티티 필드 **타입 변경** | 🔴 높음 | **사용자 확인** (마이그레이션 필요) |
| 필드/엔티티 **이름 변경** | 🔴 높음 | **사용자 확인** (전파 범위 넓음) |
| 엔티티 삭제 | 🔴 높음 | **사용자 확인** (테이블 drop) |

### Step 2: 🔴 변경 있으면 사용자 확인

🔴 변경이 감지되면 중단하고 표시:
```
증분 수정 중 위험한 변경이 감지되었습니다.

[필드 삭제] Member.email
[타입 변경] Room.price: Integer → Long
[엔티티 삭제] LegacyTable

이 변경들은 기존 DB 데이터와 충돌할 수 있습니다.
계속하려면 H2 파일의 기존 데이터를 직접 정리해야 할 수 있습니다.

선택:
  [A] 그래도 증분 수정 진행 (DB 정리는 사용자가 책임)
  [B] 완전 재생성으로 전환 (권장, data는 초기화됨)
  [C] 중단하고 YML 을 다시 검토
```

### Step 3: 🟢🟡 변경 적용

- **새 엔티티/API/페이지 추가**: crud-page.md 레시피로 해당 기능만 생성
- **기존 엔티티 필드 추가**: Entity, DTO(Request/Response), Service 매핑, Frontend 타입/폼/표시 필드 각각 업데이트
- **비즈니스/UI 로직 변경**: 해당 Service / Page 파일 수정

모든 수정은 `projects/{projectId}/` 내부로 한정.

### Step 4: 검증

```bash
cd projects/{projectId}/backend && ./gradlew build
cd projects/{projectId}/frontend && npx tsc -b && npx vite build
```

실패 시 수정 후 재검증. 반복 가능한 문제는 하네스/lessons-learned에 피드백.

### Step 5: projects/{projectId}/schema.md 업데이트

변경된 테이블 구조를 schema.md에 반영 (추가/수정/삭제).

### Step 6: specs/{projectId}/log.md 갱신

- "현재 최신 버전" 을 v{N+1} 로 업데이트
- changelog 엔트리 추가 (generation: 증분 수정)

### Step 7: 빌드 로그 작성

skills/build-log.md 실행:
- 파일명: `log/{YYYY-MM-DD}_{projectId}_v{N+1}.md`
- 생성 방식: **증분 수정** 명시
- Step 3 에 **diff 요약** 필수 기록 (어떤 필드/API/페이지가 추가/삭제/변경됐는지)
- 🔴 변경 발생 및 사용자 선택 기록

## 완료 보고 예시

```
증분 수정이 완료되었습니다.

- 프로젝트: {projectId}
- 버전: v{N} → v{N+1}
- 변경 요약:
  - [추가] Reservation.cancel_at 필드
  - [추가] POST /api/reservations/{id}/cancel
  - [추가] components/reservation/CancelDialog.tsx
- DB: 기존 데이터 유지, 신규 컬럼은 null 로 추가됨

기존 서버가 실행 중이면 재시작해야 변경이 반영됩니다.
```

## 주의사항
- **증분 수정은 누적되면 YML과 코드 간 드리프트 가능성이 있다**.
  의심스러울 때 `[1] 완전 재생성` 으로 리셋하여 검증 권장
- **하네스 규칙 변경은 이 스킬로 반영되지 않는다**. 규칙 변경 시에는 완전 재생성으로 전체 적용
- **수동 수정된 코드가 있다면** 증분 수정 과정에서 덮어써질 수 있음 (하네스 원칙: 수동 수정 금지)
