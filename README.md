# npm 패키지 발행 전략

## CI/CD 프로세스 (GitHub Actions 기반)

### 1. Publish 전략 비교

| 전략                     | 설명                                        | 자동화 정도 | 추천 |
| ------------------------ | ------------------------------------------- | ----------- | ---- |
| **수동 태그**            | 로컬에서 직접 태그 생성 및 푸시             | 하          | ❌   |
| **버전 스크립트**        | npm version 명령어로 버전 증가 및 태그 생성 | 하          | ❌   |
| **Manual Github Action** | GitHub UI에서 버전 입력하여 태그 생성       | 중          | ❌   |
| **PR Github action**     | PR merge 시 자동으로 태그 생성(label 사용)  | 상          | ✅   |

### 2. 통합 릴리스 워크플로우

```
개발 -> PR 생성 -> CI 검증 -> release label 추가 -> 머지 -> 태그 생성 -> npm publish
```

- npm publish는 **오직 태그가 생성될 때만** 실행됩니다.

---

## 티켓

### 📋 GitHub Issues

#### Mid Priority

- **#1** - NPM_TOKEN 시크릿 설정 및 0.0.3 tag 생성
- **#2** - publish 환경설정
  - `package.json`: `exports`를 통해 개별 컴포넌트 import 지원, `files`를 통해 npm에 업로드할 파일 지정
  - `tsconfig.build.json`: 배포용 TypeScript 설정 분리
  - `vite.config.ts`: React를 번들에 포함하지 않게 하고 ES 모듈 설정 등 수정
  - `src/index.ts`: 메인 진입점 생성
- **#3** - 태그 생성 워크플로우 구현
  - `npm version`을 사용하여 버전 업
  - `release label`이 있는 PR이 merge될 경우 태그 생성
- **#4** - 배포 워크플로우
  - 태그 생성 워크플로우가 완료될 경우 배포
  - 주의: 태그 생성을 트리거로 잡을 경우 GitHub Action 정책 때문에 동작하지 않음

#### Low Priority

- **#5** - CHANGELOG.md 템플릿 작성
  - CHANGELOG.md를 통해 변경 내역을 기록
- **#6** - 롤백 워크플로우 구현
  - manual로 구현, input으로 `tag`와 `deprecated 사유`를 받음
  - npm 배포된 패키지는 삭제 불가능하므로 deprecated만 가능
- **#7** - GitHub Release 생성 워크플로우
  - GitHub Release를 생성하여 GitHub 우측 메뉴에 표시
