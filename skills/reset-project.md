# 프로젝트 초기화 스킬

## 트리거
사용자가 "초기화 해줘", "리셋 해줘", "{projectId} 초기화 해줘" 등 요청 시.

## 동작 분기

| 요청 형태 | 동작 |
|----------|------|
| `{projectId} 초기화 해줘` (프로젝트명 명시) | **해당 프로젝트만** 삭제 |
| `초기화 해줘` (프로젝트명 미지정) | **모든 프로젝트 전체** 삭제 |

둘 다 **삭제 전 반드시 사용자 확인**을 받는다. 전체 초기화는 리스크가 크므로 더 명확하게 제시.

---

## 1) 단일 프로젝트 초기화

### 삭제 대상
- `example/projects/{projectId}/` **전체**
  - backend/
  - frontend/
  - data/
  - schema.md

### 보존 대상
- `example/CLAUDE.md`, `README.md`
- `example/harness/*.md`
- `example/skills/*.md`
- `example/spec-requests/{projectId}/` (버전별 요구사항)
- `example/specs/{projectId}/` (버전별 YML + log.md)
- `example/log/` (빌드 로그 이력)
- `example/projects/` 아래 **다른 projectId 폴더들**

### 실행 순서

1. 삭제 대상 폴더 존재 체크
   - `projects/{projectId}/` 없으면 "이미 초기화되어 있다" 안내 후 종료
2. **사용자 확인 받기**:
   ```
   프로젝트 '{projectId}' 를 초기화합니다.
   
   삭제 대상:
     - projects/{projectId}/backend
     - projects/{projectId}/frontend
     - projects/{projectId}/data         ← DB 데이터가 모두 삭제됩니다
     - projects/{projectId}/schema.md
   
   보존:
     - spec-requests/{projectId}/
     - specs/{projectId}/
     - log/ (해당 프로젝트의 빌드 로그 포함)
     - 다른 프로젝트 (건드리지 않음)
   
   계속하시겠습니까? (yes / no)
   ```
3. `yes` → 삭제 실행:
   ```bash
   rm -rf example/projects/{projectId}
   ```
4. 결과 보고 (지워진 경로 + 재생성 방법 안내)

---

## 2) 전체 프로젝트 초기화

### 삭제 대상
- `example/projects/` **전체 하위 폴더들** (존재하는 모든 projectId)

### 보존 대상
- `example/projects/` 디렉토리 자체는 유지 (빈 폴더로 남김)
- 나머지는 단일 초기화와 동일 (harness, skills, spec-requests, specs, log)

### 실행 순서

1. `example/projects/` 아래 존재하는 프로젝트 목록 파악
   - 하나도 없으면 "초기화할 프로젝트가 없다" 안내 후 종료
2. **사용자 확인 받기 (강한 확인)**:
   ```
   ⚠ 전체 프로젝트 초기화를 요청하셨습니다.
   
   삭제 대상 (아래 N개 프로젝트 전체):
     - projects/{projectId1}/  (backend, frontend, data, schema.md)
     - projects/{projectId2}/
     - projects/{projectId3}/
     ...
   
   모든 DB 데이터가 삭제되며, 각 프로젝트를 처음부터 재생성해야 합니다.
   
   보존:
     - spec-requests/ (요구사항 원문)
     - specs/ (YML 명세)
     - log/ (빌드 로그 이력)
   
   정말 전체를 초기화하시겠습니까? 확인하려면 'reset all' 을 입력해주세요.
   ```
3. 사용자가 정확히 `reset all` 을 입력해야 진행.
   - 단순 `yes` 는 수락하지 않음 (오타·오조작 방지)
4. 삭제 실행:
   ```bash
   rm -rf example/projects/*
   ```
5. 결과 보고 (지워진 프로젝트 목록 + 재생성 방법)

---

## 주의사항
- **다른 프로젝트에 영향 주지 않음** (단일 초기화)
- **전체 초기화는 되돌릴 수 없으므로** `reset all` 리터럴 확인 필수
- YML과 log는 보존되므로 동일 projectId 로 재생성 시 이전 명세/이력을 이어서 쓸 수 있다
- 재생성은 `specs/{id}/` 의 최신 YML을 사용자가 지정하면 신규 생성 흐름으로 진행
