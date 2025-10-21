# 달레UI v1.0 정식 릴리스 전략

## 📋 개요

달레UI v1.0 정식 릴리스를 위한 npm 패키지 발행 전략과 CI/CD 프로세스 정의 문서입니다.

### 현재 상황

- 현재 버전: `0.0.2` (package.json 기준)
- v0.0.3까지 수동 배포 완료

### 목표

- 자동화된 릴리스 프로세스 구축
- 코드 리뷰, 변경 이력 관리, 롤백, 사전 릴리스 검증 강화

---

## 🚀 npm 패키지 발행 전략

### 1. 패키지 구조 개선

#### 1.1 package.json 설정

```json
{
  "name": "daleui",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./components/*": {
      "import": "./dist/components/*/index.js",
      "types": "./dist/components/*/index.d.ts"
    },
    "./tokens": {
      "import": "./dist/tokens/index.js",
      "types": "./dist/tokens/index.d.ts"
    },
    "./styles": "./dist/styles/index.css"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build:package": "panda codegen && tsc -b -p tsconfig.build.json && vite build --mode package",
    "prepublishOnly": "npm run build:package"
    ...
  }
  ...
}
```

#### 1.2 빌드 설정

- **TypeScript**: `tsconfig.build.json`으로 패키지 전용 빌드 설정
- **Vite**: 라이브러리 모드로 빌드, React 외부 의존성으로 설정
- **Panda CSS**: 스타일 시스템 빌드 자동화

#### 1.3 진입점 구성

번들 크기 최적화를 위한 모듈별 export 전략:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./components/*": {
      "import": "./dist/components/*/index.js",
      "types": "./dist/components/*/index.d.ts"
    },
    "./tokens": {
      "import": "./dist/tokens/index.js",
      "types": "./dist/tokens/index.d.ts"
    },
    "./styles": "./dist/styles/index.css"
  }
}
```

**컴포넌트별 직접 import 지원:**

```typescript
// 번들 크기 최적화된 사용법
import { Button } from "daleui/components/Button";
import { Text } from "daleui/components/Text";

// 모든 컴포넌트가 필요한 경우에만
import { Button, Text, Icon } from "daleui";
```

- **개별 컴포넌트 export**: Tree-shaking 최적화
- **선택적 import**: 필요한 컴포넌트만 번들에 포함
- **타입과 구현 분리**: TypeScript 타입만 필요한 경우 별도 export

---

## 🔄 CI/CD 프로세스 (GitHub Actions 기반)

### 2. npm Publish 전략: Tag-Only 배포

**핵심 원칙**: npm 패키지는 **태그 생성 시에만** 자동으로 배포됩니다.

```yaml
# .github/workflows/release.yml - 유일한 배포 워크플로우
on:
  push:
    tags:
      - "v*"
```

### 2.1 태그 생성 전략 비교

다음은 태그를 생성하는 다양한 전략들의 비교표입니다:

| 전략                | 장점                                                                 | 단점                                         |
| ------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| **수동 태그**       | 완전한 수동 제어<br>실수 배포 최소화<br>버전 검토 시간 확보          | 수동 작업 필요<br>태그 생성 과정 이해 필요   |
| **버전 스크립트**   | npm 표준 워크플로우<br>버전 자동 증가<br>package.json 자동 업데이트  | 로컬 환경 의존<br>실수 push 가능성           |
| **Manual Dispatch** | GitHub UI에서 간편 실행<br>태그와 배포 자동화<br>버전 입력 검증 가능 | GitHub Actions 의존<br>네트워크 환경 필요    |
| **PR 훅**           | PR merge와 연동된 자동화<br>코드 리뷰 후 배포                        | 복잡한 조건 처리 필요<br>실수 자동 배포 위험 |

#### 2.2 상세 태그 생성 전략 분석

##### 🏷️ **수동 태그 생성** (가장 안전)

```bash
# 로컬에서 직접 태그 생성
git tag v1.0.0
git push origin v1.0.0
```

##### 📦 **버전 스크립트** (개발자 친화적)

```json
// package.json
{
  "scripts": {
    "release:patch": "npm version patch && git push --follow-tags",
    "release:minor": "npm version minor && git push --follow-tags",
    "release:major": "npm version major && git push --follow-tags"
  }
}
```

##### 🎯 **Manual Dispatch** (GitHub Actions 수동 실행)

GitHub Actions UI에서 수동으로 태그 생성 + 배포

```yaml
# .github/workflows/create-tag-and-release.yml
on:
  workflow_dispatch:
    inputs:
      version:
        description: "Version (e.g., 1.0.0)"
        required: true
        type: string

jobs:
  create-tag:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Create and push tag
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git tag "v${{ inputs.version }}"
          git push origin "v${{ inputs.version }}"
```

##### 🤖 **PR 훅 자동 태그** (조건부)

특정 PR이 merge될 때 자동으로 태그 생성

```yaml
# .github/workflows/create-tag-on-pr.yml
on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  create-tag:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check if version changed
        id: version-check
        run: |
          # package.json 버전 변경 검사 로직

      - name: Create tag if version changed
        if: steps.version-check.outputs.changed == 'true'
        run: |
          git tag "v${{ steps.version-check.outputs.new_version }}"
          git push origin "v${{ steps.version-check.outputs.new_version }}"
```

### 2.3 통합 릴리스 워크플로우

#### 🔄 Tag-Based 배포 흐름

```
개발 → Release PR → CI 검증 → 태그 생성 → 자동 npm publish
```

**핵심**: npm publish는 **오직 태그가 생성될 때만** 실행됩니다.

#### 🏷️ **유일한 배포 워크플로우** (Tag-triggered)

```yaml
# .github/workflows/release.yml - npm publish 전용
name: Release & Publish

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: bun run test

      - name: Build package
        run: bun run build:package

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: Release ${{ github.ref_name }}
          draft: false
          prerelease: false
```

### 2.4 보안 및 환경 설정

#### 🔐 필요한 Secrets 설정

```bash
# GitHub Repository Settings > Secrets and variables > Actions
NPM_TOKEN=npm_xxxxxxxxxxxxxxxx  # npm publish 권한을 가진 토큰
```

#### 📋 태그 생성 전략 선택 가이드

| 상황           | 추천 전략       | 태그 생성 방법                             | 이유                         |
| -------------- | --------------- | ------------------------------------------ | ---------------------------- |
| 초기 개발 단계 | 수동 태그 생성  | `git tag v1.0.0 && git push origin v1.0.0` | 최고 안전성, 완전 제어       |
| 정식 릴리스    | 버전 스크립트   | `npm run release:minor`                    | npm 표준, 자동화된 버전 관리 |
| GitHub 중심    | Manual Dispatch | GitHub Actions UI에서 버전 입력            | 브라우저에서 간편 실행       |
| 자동화 선호    | PR 훅 자동 태그 | PR merge 시 조건부 자동 태그               | 코드 리뷰 후 자동 배포       |

#### 🚀 실제 사용 예시

**1. 수동 태그 생성 (가장 안전)**

```bash
# 로컬에서 실행
git tag v1.0.0
git push origin v1.0.0
# → 자동으로 GitHub Actions가 npm publish 실행
```

**2. 버전 스크립트 사용**

```bash
# package.json에 스크립트 추가 후
npm run release:patch  # patch 버전 업그레이드 + 태그 생성 + push
```

**3. GitHub Actions UI 사용**

- GitHub Repository → Actions → "Create Release Tag" 워크플로우
- 버전 입력 (예: `1.0.0`)
- "Run workflow" 클릭

---

## 📝 릴리스 관리 체계

### 3. 릴리스 PR 템플릿

#### 3.1 PR 제목 규칙

```
Release v1.0.0 - Major release with API stabilization
```

#### 3.2 PR 체크리스트

- [ ] `package.json` 버전 업데이트
- [ ] `CHANGELOG.md` 업데이트
- [ ] 브레이킹 체인지 문서화
- [ ] 모든 테스트 통과 확인
- [ ] 스토리북 컴포넌트 동작 확인
- [ ] TypeScript 타입 검증
- [ ] 번들 크기 확인

### 4. 릴리스 노트 자동화

#### 4.1 Conventional Commits 기반

- `feat:` → 새로운 기능
- `fix:` → 버그 수정
- `BREAKING CHANGE:` → 주요 변경사항
- `docs:`, `style:`, `refactor:`, `test:`, `chore:` → 기타 변경사항

#### 4.2 자동 생성 템플릿

````markdown
## 변경 사항

- 새로운 기능: [기능 목록]
- 버그 수정: [수정 목록]
- 주요 변경사항: [브레이킹 체인지]

## 설치 방법

```bash
bun add daleui@1.0.0
npm install daleui@1.0.0
pnpm add daleui@1.0.0
```
````

```

---

## 🔒 안전장치 및 검증

### 5. 보안 및 품질 검증

#### 5.1 사전 릴리스 검증
- **타입 안정성**: TypeScript 컴파일 검증
- **코드 품질**: ESLint 규칙 준수
- **테스트 커버리지**: 단위 테스트 및 통합 테스트
- **시각적 회귀**: Chromatic을 통한 컴포넌트 테스트

#### 5.2 릴리스 시점 검증
- **의존성 검사**: 취약점 스캔
- **번들 분석**: 패키지 크기 최적화 확인
  - 개별 컴포넌트 번들 크기 측정
  - Tree-shaking 효과 검증
  - 번들 크기 제한 설정 (예: 개별 컴포넌트 50KB 이하)
- **호환성 테스트**: 다양한 React 버전 호환성

#### 5.3 롤백 전략
- **npm unpublish**: 24시간 내 롤백 가능
- **Git 태그**: 릴리스 이전 버전으로 빠른 복구
- **문서화**: 롤백 절차 명시

---

## 🛠️ 구현 체크리스트

### 6. 필요한 작업 항목

#### 6.1 즉시 구현 (High Priority)
- [x] package.json npm 패키지 설정 구성 (exports 필드 포함)
- [x] TypeScript 빌드 설정 (tsconfig.build.json)
- [x] Vite 라이브러리 빌드 설정
- [ ] **번들 크기 최적화**: 모듈별 exports 구성
  - [ ] 개별 컴포넌트 export 구조 설계
  - [ ] Tree-shaking 최적화를 위한 빌드 설정
- [ ] **Tag-Based 배포 워크플로우 구현**
  - [ ] Tag-triggered 배포 워크플로우 (`.github/workflows/release.yml`)
  - [ ] 태그 생성 도우미 워크플로우 (`.github/workflows/create-release-tag.yml`)
  - [ ] NPM_TOKEN 시크릿 설정
- [ ] **package.json 릴리스 스크립트 추가**
  - [ ] `release:patch`, `release:minor`, `release:major` 스크립트
- [ ] 릴리스 PR 템플릿 업데이트
- [ ] CHANGELOG.md 템플릿 작성

#### 6.2 단기 구현 (Medium Priority)
- [ ] **Tag 생성 전략 테스트 및 검증**
  - [ ] 수동 태그 생성 테스트 (로컬에서)
  - [ ] 버전 스크립트 테스트 (`npm run release:patch`)
  - [ ] Manual Dispatch 워크플로우 테스트
  - [ ] 에러 처리 및 롤백 시나리오 검증
- [ ] 릴리스 노트 자동 생성 개선
- [ ] Conventional Commits 가이드라인 작성
- [ ] 버전 관리 전략 문서화

#### 6.3 장기 개선 (Low Priority)
- [ ] 자동 버전 업그레이드 (Semantic Release 도입 검토)
- [ ] 패키지 번들 분석 자동화


```
