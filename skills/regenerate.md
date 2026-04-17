# 완전 재생성 스킬 (옵션 1)

## 트리거
기존 `projects/{projectId}/` 이 존재하는 상태에서 사용자가 `[1] 완전 재생성` 을 선택한 경우.

## 원칙
- **YML = Source of Truth**. 최신 v{n} YML을 처음부터 해석해서 전체 코드를 새로 만든다.
- 기존 코드·DB는 **전부 삭제**. 단, `seed_data` 섹션이 있으면 DB 초기 데이터로 복원.
- `spec-requests/`, `specs/`, `log/` 는 보존.

## 입력
- 프로젝트: `{projectId}`
- 새 버전: `v{N+1}` (업데이트할 버전)
- 새 YML: `specs/{projectId}/{projectId}.v{N+1}.yml` (이미 사용자/Claude 대화로 생성되어 있어야 함)

## 사전 체크
1. `specs/{projectId}/{projectId}.v{N+1}.yml` 파일 존재 확인
2. YML 의 `project.version` 이 `N+1` 과 일치 확인
3. `changelog` 최상단 엔트리의 `version` 도 `N+1` 인지 확인 + `generation: 완전 재생성` 으로 기록됐는지 확인
4. 포트/DB 이름이 이전 버전과 동일한지 확인 (deterministic 보장)

## 실행 순서

### Step 1: 기존 프로젝트 삭제 (사용자 확인 필수)

삭제 전 반드시 사용자에게 표시:
```
완전 재생성을 진행합니다.
아래 경로가 삭제됩니다:
  - projects/{projectId}/backend
  - projects/{projectId}/frontend
  - projects/{projectId}/data       ← DB 데이터가 모두 삭제됩니다
  - projects/{projectId}/schema.md

보존되는 것:
  - spec-requests/{projectId}/
  - specs/{projectId}/
  - log/

계속하시겠습니까? (yes / no)
```

`yes` 응답 시:
```bash
rm -rf example/projects/{projectId}
```

### Step 2: 신규 생성과 동일한 흐름 실행

`example/CLAUDE.md` 의 "신규 생성 흐름" 을 그대로 진행.

1. skills/init-backend.md → `projects/{projectId}/backend/` 재생성
2. skills/init-frontend.md → `projects/{projectId}/frontend/` 재생성
3. skills/crud-page.md → 모든 엔티티·기능 재생성 (v{N+1} YML 기준)
4. 검증 (`./gradlew build`, `npx tsc -b && npx vite build`)

### Step 3: seed_data 복원 (있는 경우)

YML에 `seed_data` 섹션이 있으면, 해당 데이터를 DB에 insert 한다.
- 백엔드 첫 실행 시 `CommandLineRunner` 또는 `@PostConstruct` 로 데이터 투입
- 또는 `data.sql` 로 작성하여 JPA가 초기화하도록 구성

### Step 4: projects/{projectId}/schema.md 생성
최신 YML 엔티티 기준으로 스키마 테이블 + 관계도 작성.

### Step 5: specs/{projectId}/log.md 갱신
- "현재 최신 버전" 을 v{N+1} 로 업데이트
- changelog 엔트리 추가 (generation: 완전 재생성)

### Step 6: 빌드 로그 작성
skills/build-log.md 실행:
- 파일명: `log/{YYYY-MM-DD}_{projectId}_v{N+1}.md`
- 생성 방식: **완전 재생성** 명시
- 이전 버전 생성 일자 언급

## 완료 보고 예시
```
완전 재생성이 완료되었습니다.

- 프로젝트: {projectId}
- 버전: v{N} → v{N+1}
- 생성된 파일: 백엔드 N개, 프론트엔드 N개
- DB: 초기화됨 (seed_data 있으면 복원됨)

실행:
  cd projects/{projectId}/backend && ./gradlew bootRun
  cd projects/{projectId}/frontend && npm run dev
```

## 주의사항
- **하네스 규칙이 바뀌었다면** 이번 재생성부터 새 규칙이 반영된다 (의도된 동작)
- **수동 수정된 코드는 모두 소실**. 필요했다면 YML 또는 하네스에 반영했어야 한다
- seed_data 없으면 DB는 완전히 비어서 시작
