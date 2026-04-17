# 빌드 로그 생성 스킬

## 트리거
프로젝트 생성/재생성/증분수정 흐름의 **마지막 단계**에서 반드시 실행.

## 목적
빌드 과정 전체를 기록하여 재현성과 개선 포인트를 추적한다.
YML 버전 + 생성 방식(신규/완전 재생성/증분 수정)을 명시적으로 남겨 나중에 추적 가능하게 한다.

## 저장 위치
```
example/log/{YYYY-MM-DD}_{projectId}_v{version}.md
```
예시:
- `log/2026-04-16_resort-reservation_v1.md` (신규 생성)
- `log/2026-04-17_resort-reservation_v2.md` (완전 재생성 또는 증분 수정)

## 로그 포맷

```markdown
# 빌드 로그 — {projectId} v{version}

- **일시**: {YYYY-MM-DD HH:mm} ~ {YYYY-MM-DD HH:mm}
- **명세 파일**: specs/{projectId}/{projectId}.v{version}.yml
- **생성 방식**: {신규 생성 | 완전 재생성 | 증분 수정}
- **이전 버전**: {v{n-1} (YYYY-MM-DD 생성) | 없음 (신규)}
- **총 소요시간**: {MM분 SS초}
- **총 토큰 사용량 (추정)**: 입력: ~{N}K / 출력: ~{N}K

---

## 단계별 실행 기록

### Step 0: 사전 환경 체크
- **사용 스킬**: skills/precheck.md
- **참조 하네스**: (없음)
- **판단/행동**: {체크 결과, 스킵 여부}
- **소요시간**: {시간}

### Step 1: 백엔드 초기 셋팅 / 스킵
- **사용 스킬**: skills/init-backend.md (신규·완전 재생성만) / 스킵 (증분 수정)
- **참조 하네스**: stack.md, structure.md, naming.md, coding.md, architecture.md
- **판단/행동**: {새로 생성 or 스킵, 생성된 파일 수}
- **생성 파일**: {목록}
- **소요시간**: {시간}

### Step 2: 프론트엔드 초기 셋팅 / 스킵
- **사용 스킬**: skills/init-frontend.md (신규·완전 재생성만) / 스킵 (증분 수정)
- **참조 하네스**: stack.md, structure.md, style-guide.md, ux.md, coding.md
- **판단/행동**: {새로 생성 or 스킵, 생성된 파일 수}
- **생성 파일**: {목록}
- **소요시간**: {시간}

### Step 3: 기능 구현 / 수정
- **사용 스킬**: skills/crud-page.md (신규·완전 재생성) / skills/update-incremental.md (증분 수정)
- **참조 하네스**: 전체 (naming.md, coding.md, architecture.md, ux.md, style-guide.md)
- **참조 교훈**: skills/lessons-learned.md — {적용한 교훈 번호}
- **판단/행동**: {도메인별 생성/수정 내역}
- **증분 수정 시 diff 요약**: {무엇이 추가/삭제/변경됐는지}
- **생성/수정 파일**: {백엔드 N개, 프론트엔드 N개}
- **소요시간**: {시간}

### Step 4: 검증
- **backend**: `./gradlew build` → {성공/실패}
- **frontend**: `npx tsc -b && npx vite build` → {성공/실패}
- **소요시간**: {시간}

### Step 5: 수정 → 하네스 피드백 (해당 시)
- **발견 문제**: {문제 설명}
- **수정 내용**: {수정 파일, 변경 사항}
- **하네스 반영**: {harness 파일에 추가한 규칙}
- **재검증**: {성공/실패}
- **소요시간**: {시간}

### Step 6: projects/{projectId}/schema.md 업데이트
- **추가/변경 테이블**: {테이블명 목록}
- **소요시간**: {시간}

### Step 7: specs/{projectId}/log.md 업데이트
- **추가된 changelog 엔트리**: v{version} ({generation})
- **소요시간**: {시간}

### Step 8: 완료 보고
- **생성/수정 파일 총 수**: 백엔드 {N}개 + 프론트엔드 {N}개 = 총 {N}개
- **실행 방법**:
  - 백엔드: `cd projects/{projectId}/backend && ./gradlew bootRun` → http://localhost:{ports.backend}
  - 프론트: `cd projects/{projectId}/frontend && npm run dev` → http://localhost:{ports.frontend}
- **소요시간**: {시간}

---

## 요약

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | {projectId} |
| 버전 | v{version} |
| 생성 방식 | {신규 생성 | 완전 재생성 | 증분 수정} |
| 총 소요시간 | {MM분 SS초} |
| 총 토큰 사용량 (추정) | 입력: ~{N}K / 출력: ~{N}K |
| 백엔드 파일 수 | {N}개 |
| 프론트엔드 파일 수 | {N}개 |
| 검증 재시도 횟수 | {N}회 |
| 하네스 피드백 | {추가된 규칙 수}건 |
| 사용 스킬 | {목록} |
| 참조 하네스 | {목록} |
```

## 작성 규칙

1. **파일명에 버전 포함**: `{date}_{projectId}_v{version}.md` 필수
2. **생성 방식 명시**: 상단 메타 정보 + 요약 테이블 양쪽에 모두 기록
3. **시간 기록**: 각 단계 시작/종료 시점을 기록하여 소요시간 산출
4. **토큰 추정**: 대화 시작~종료까지의 전체 토큰을 추정 기록
5. **판단 근거**: 각 단계에서 왜 그렇게 했는지 (스킵 이유, 적용한 교훈 등)
6. **스킵된 단계**도 기록 (스킵 사유 명시)
7. **증분 수정의 경우** Step 3에 diff 요약을 반드시 포함
8. **마지막에 반드시** 총 토큰과 총 시간을 사용자에게 텍스트로 출력
