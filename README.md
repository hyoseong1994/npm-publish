# npm 패키지 발행 전략

## CI/CD 프로세스 (GitHub Actions 기반)

### 1. 통합 릴리스 워크플로우

```
개발 -> PR 생성 -> CI 검증 -> release label 추가 -> 머지 -> 태그 생성 -> npm publish
```

- npm publish는 **오직 태그가 생성될 때만** 실행됩니다.

### 2. release label 선택 기준(신규 추가)

- `release/major`: **Breaking Changes** 발생시
  - API 변경, 호환성 깨짐
  - 예: `1.0.0` → `2.0.0`
- `release/minor`: **새로운 기능** 추가시
  - 하위 호환성 유지
  - 예: `1.0.0` → `1.1.0`
- `release/patch`: **버그 수정** 및 **보안 패치**
  - 기존 기능 개선
  - 예: `1.0.0` → `1.0.1`

### 3. Publish 전략 비교

| 전략                     | 설명                                        | 자동화 정도 | 추천 |
| ------------------------ | ------------------------------------------- | ----------- | ---- |
| **수동 태그**            | 로컬에서 직접 태그 생성 및 푸시             | 하          | ❌   |
| **버전 스크립트**        | npm version 명령어로 버전 증가 및 태그 생성 | 하          | ❌   |
| **Manual Github Action** | GitHub UI에서 버전 입력하여 태그 생성       | 중          | ✅   |
| **PR Github action**     | PR merge 시 자동으로 태그 생성(label 사용)  | 상          | ✅   |

### 4. 배포 기준

#### 4.1 배포 주기

- **정기 배포**: spring 2ea(한달) 가 끝날 때 마다 작업한 내용을 기준으로 major, minor, pacth를 선택하여 배포 (긴급 배포 제외)
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

---

## 티켓

#### Mid Priority

1. Github 설정 및 태그 생성 (1h)

   - NPM_TOKEN 시크릿 설정
   - 배포된 버전에 맞춰서 0.0.3 tag 생성
   - PAT 토큰 생성 및 설정 (신규 추가)

2. publish 환경설정 (5h)

   - `package.json`: `exports`를 통해 개별 컴포넌트 import 지원, `files`를 통해 npm에 업로드할 파일 지정
   - `tsconfig.build.json`: 배포용 TypeScript 설정 분리
   - `vite.config.ts`: React를 번들에 포함하지 않게 하고 ES 모듈 설정 등 수정
   - `src/index.ts`: 메인 진입점 생성

3. 태그 생성 워크플로우 구현 (3h)

   - `npm version`을 사용하여 버전 업
   - `release label`이 있는 PR이 merge될 경우 태그 생성
   - 주의: PAT 토큰으로 태그를 생성해야 배포 워크플로우가 동작 (GITHUB_TOKEN은 github 정책으로 workflow 트리거를 하지 못함)

4. 배포 워크플로우 (3h)
   - 태그 생성 워크플로우가 완료될 경우 배포
   - ~~주의: 태그 생성을 트리거로 잡을 경우 GitHub Action 정책 때문에 동작하지 않음~~

#### Low Priority

5. ~~CHANGELOG.md 템플릿 작성 (3h)~~

   - ~~CHANGELOG.md를 통해 변경 내역을 기록~~

6. 롤백 워크플로우 구현 (3h)

   - manual로 구현, input으로 `tag`와 `deprecated 사유`를 받음
   - npm 배포된 패키지는 삭제 불가능하므로 deprecated만 가능

7. GitHub Release 생성 워크플로우 (3h)

   - GitHub Release를 생성하여 GitHub 우측 메뉴에 표시
