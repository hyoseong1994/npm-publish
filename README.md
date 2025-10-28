# npm 패키지 발행 전략

## CI/CD 프로세스 (GitHub Actions 기반)

### 1. 통합 릴리스 워크플로우

```
flowchart
    A[개발] --> B(PR 생성)
    B --> C(CI 검증)
    B --> D(머지)
    E[태그 생성]
    E --> F(pre release)
    E --> G(release)
```

- npm publish는 **오직 태그가 생성될 때만** 실행됩니다.

### 2. 버전 관리 정책

#### 2.1 major, minor, patch 선택 기준

- `major`: **Breaking Changes** 발생시
  - API 변경, 호환성 깨짐
  - 예: `1.0.0` → `2.0.0`
- `minor`: **새로운 기능** 추가시
  - 하위 호환성 유지
  - 예: `1.0.0` → `1.1.0`
- `patch`: **버그 수정** 및 **보안 패치**
  - 기존 기능 개선
  - 예: `1.0.0` → `1.0.1`

#### 2.2 Pre-release 전략

- `beta`: **기능 테스트** 단계
  - 새로운 기능의 안정성 검증
  - 내부 팀 및 베타 사용자 대상
  - 최소 1주일 테스트 기간 필요
- `rc` (Release Candidate): **출시 준비** 단계
  - 최종 출시 전 마지막 검증
  - 모든 기능이 완성되고 안정화된 상태
  - 최소 3일 테스트 기간 필요

#### 2.3 Pre-release → Release 승격 프로세스

1. **beta → rc 승격 조건**

   - 모든 기능이 완전히 구현됨
   - 베타 사용자 피드백 반영 완료
   - 치명적 버그 0개

2. **rc → release 승격 조건**
   - RC 버전에서 치명적 버그 0개
   - 성능 테스트 통과
   - 문서화 완료

#### 2.4 Deprecated 관리

- **오래된 버전 Deprecated 정책**:
  - 3개월 전 사전 공지
  - 마이그레이션 가이드 제공

### 3. Publish 전략 비교

| 전략                     | 설명                                        | 자동화 정도 | 추천 |
| ------------------------ | ------------------------------------------- | ----------- | ---- |
| **수동 태그**            | 로컬에서 직접 태그 생성 및 푸시             | 하          | ❌   |
| **버전 스크립트**        | npm version 명령어로 버전 증가 및 태그 생성 | 하          | ❌   |
| **Manual Github Action** | GitHub UI에서 버전 입력하여 태그 생성       | 중          | ✅   |
| **PR Github action**     | PR merge 시 자동으로 태그 생성(label 사용)  | 상          | ✅   |

- manual 하게 배포하는것이 안정성과 유연성에 유리하다고 판단됩니다.

### 4. 배포 기준

#### 4.1 배포 주기

- **정기 배포**: spring 2ea(한달) 가 끝날 때 마다 작업한 내용을 기준으로 major, minor, pacth를 선택하여 배포 (긴급 배포 제외)
- **비정기 배포**: milestone 기반으로 종료시 배포
- **긴급 배포**: 보안 패치나 치명적 버그 수정 시 즉시 배포

#### 4.2 배포 조건

1. **기능 완성도**

   - 모든 기능이 완전히 구현되어야 함
   - 모든 테스트 통과

2. **코드 품질**

   - ESLint 오류 0개
   - TypeScript 컴파일 오류 0개
   - 코드 리뷰 승인 2명 이상

3. **문서화**
   - story 사용법 예제 작성 (새 기능의 경우)

### 5. 롤백 전략

#### 5.1 롤백 기준

- **즉시 롤백**: 치명적 버그, 보안 취약점 발견 시
- **검토 후 롤백**: 기능 동작 불안정, 성능 저하 시

#### 5.2 롤백 프로세스

1. **문제 발견 및 보고**

   - Discode thread 생성하여 공유
   - 심각도 평가 (High, Medium, Low)

2. **롤백 결정**

   - High: 즉시 롤백
   - Medium: 팀 논의 후 24시간 내 결정
   - Low: 다음 정기 배포에서 수정

3. **롤백 실행**

   - GitHub Actions에서 수동 롤백 워크플로우 실행

### 5. 논의가 필요한 사항

- 정기 배포 vs 비정기 배포(main 브랜치 외 mileston 브랜치 필요)

---

## 티켓

#### Mid Priority

1. Github 설정 및 태그 생성 (1h)

   - NPM_TOKEN 시크릿 설정
   - 배포된 버전에 맞춰서 0.0.3 tag 생성
   - PAT 토큰 생성 및 설정

2. publish 환경설정 (5h)

   - `package.json`: `exports`를 통해 개별 컴포넌트 import 지원, `files`를 통해 npm에 업로드할 파일 지정
   - `tsconfig.build.json`: 배포용 TypeScript 설정 분리
   - `vite.config.ts`: React를 번들에 포함하지 않게 하고 ES 모듈 설정 등 수정
   - `src/index.ts`: 메인 진입점 생성

3. 태그 생성 워크플로우 구현 (3h)

   - `npm version`을 사용하여 버전 업
   - manual하게 사용가능하게 작성(major, minor, patch와 각각 pre-release 용 beta, rc 선택 가능해야함)
   - 주의: PAT 토큰으로 태그를 생성해야 배포 워크플로우가 동작 (GITHUB_TOKEN은 github 정책으로 workflow 트리거를 하지 못함)

4. 배포 워크플로우 (3h)
   - 태그 생성시 배포
   - 태그에서 pre-release인지 release인지 구분하여 배포 혹은 두개의 workflow로 구성

#### Low Priority

7. 롤백 워크플로우 구현 (3h)

   - manual로 구현, input으로 `tag`와 `deprecated 사유`를 받음
   - npm 배포된 패키지는 삭제 불가능하므로 deprecated만 가능

8. GitHub Release 생성 워크플로우 (3h)

   - GitHub Release를 생성하여 GitHub 우측 메뉴에 표시
   - pre-release인지 release인지 구분하여 배포 혹은 두개의 workflow로 구성
