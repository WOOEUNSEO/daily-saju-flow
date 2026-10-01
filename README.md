# DAILY FLOW

은서와 하나의 확정 사주를 바탕으로 오늘의 개인 흐름, 함께 만났을 때의 관계, 날짜별 일진과 월운을 간결하게 확인하는 개인용 정적 웹사이트입니다. 해석은 전통 명리의 상징을 참고하는 문장이며 실제 감정이나 미래를 확정하지 않습니다.

## 기술과 실행

Vite + Vanilla JavaScript, lunar-javascript 1.7.7, Vitest, Playwright를 사용합니다. Node.js 24 LTS를 권장합니다. 백엔드·DB·로그인·AI API·외부 폰트 없이 브라우저에서 계산과 해석이 모두 실행됩니다.

```sh
npm install
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

`dist/`가 최종 정적 파일입니다. Windows PowerShell 실행 정책이 npm을 막는 환경에서는 같은 명령에 `npm.cmd`를 사용합니다.

브라우저 검증:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

Windows 로컬 테스트는 설치된 Google Chrome을 사용하며, CI와 다른 OS는 Playwright Chromium을 사용합니다. PC 1280px·모바일 390px에서 실제 클릭, 해시 경로 새로고침, 날짜 선택, 월 범위, 가로 넘침을 검사합니다. 브라우저 시간대를 미국으로 바꿔도 한국 날짜를 사용하는지 확인합니다.

## 계산 기준

- 모든 날짜 표시는 `Asia/Seoul`입니다. 열린 화면도 KST 자정·절입 전환을 30초 이내에 갱신하며, 다시 창으로 돌아오면 즉시 확인합니다.
- **일진은 KST 00:00에 바뀌는 민간일 기준**입니다. 23시에 다음 일주로 넘기는 방식은 사용하지 않습니다.
- TODAY의 년주는 입춘, 월주는 12개 절입의 **현재 시각** 기준입니다. 라이브러리의 절기 시각은 UTC+8이므로 동일한 순간을 KST로 변환합니다.
- 달력에서 날짜만 선택하면 그날 **정오 KST**를 기준으로 년·월주를 표시합니다. 절입일에는 이 기준을 화면에 안내합니다.
- 달력은 오늘이 속한 양력 월의 이전·현재·다음 월, 총 3개월로 제한합니다.
- 월운은 이번 양력 월과 다음 3개월, 총 4개 **월 이름**을 사용합니다. 실제 적용 기간은 각 월에 들어오는 절입부터 다음 절입 직전까지입니다. 예를 들어 2026.10의 戊戌은 10월 8일 한로부터 시작하므로 10월 1일 TODAY의 丁酉와 다릅니다. 각 항목에 시작·종료 절입 시각과 진행 상태를 표시합니다.
- `2026-09-30 = 丁未`, `2026-10-01 = 戊申`, 한국천문연구원의 2026년 12개 절입 자료와 년·월주 전환을 테스트합니다. 라이브러리의 초 단위 계산과 발표 자료의 분 단위 표시에 작은 차이가 있을 수 있습니다.
- UI 범위와 별개로 날짜 모듈은 1900–2099년을 지원합니다.

## 데이터와 해석 수정

- `src/data.js`: `PEOPLE`의 확정 사주, 인물 설명, 기본 관계와 용어.
- 은서: 년주 丙戌, 월주 辛卯, 일주 壬子, 시주 辛丑.
- 하나: 년주 辛未, 월주 庚子, 일주 庚午, `hour: null`, `hourUnknown: true`.
- **하나 시주를 알게 되면** `PEOPLE`에서 하나의 `pillars.hour`에 확정된 두 글자를 넣고 `hourUnknown`을 `false`로 바꿉니다. 미상 상태에서는 값이 실수로 들어가 있어도 시주를 제외합니다.
- 다른 사주로 바꾸면 `dayMaster`와 `pillars.day`의 첫 글자도 일치시킵니다. 기본 관계 설명은 현재 두 사람에 맞춰 작성되어 있으므로 함께 수정합니다.
- `src/calendar.js`: KST·절기·년월일 간지와 조회 범위.
- `src/rules.js`: 오행·음양 기반 십성, 천간 생극합, 지지 관계, 원국 자리별 가중치.
- `src/interpretation.js`: 신호를 선택하고 한국어 문장을 만드는 함수. 날짜 기반 결정적 선택으로 같은 날짜는 항상 같은 해석을 만듭니다.
- `src/main.js`, `src/styles.css`: 네 메뉴와 화면.

해석은 십성과 원국의 주요 지지 신호를 포함한 2–3개 근거를 선택합니다. 일지·월지의 비중을 높이며 천간 합과 생극도 비교합니다. 원국의 모든 신호는 접을 수 있는 근거 목록에서 확인합니다. 합이 충을 지운다거나 합화가 반드시 일어난다고 판단하지 않습니다. 삼합·삼회·삼형은 서로 다른 세 글자가 모두 있을 때만 완성으로 표시하고, 두 글자 삼합은 연결로 표시합니다. 破는 유파 차이를 고려해 낮게 반영합니다.

## GitHub Pages 배포

저장소: https://github.com/WOOEUNSEO/daily-saju-flow

배포 주소: https://wooeunseo.github.io/daily-saju-flow/

1. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
2. `main`에 push하면 `.github/workflows/deploy.yml`이 `npm ci`, 단위 테스트, 빌드, PC·모바일 브라우저 테스트를 순서대로 실행합니다.
3. 모든 검증이 성공하면 `dist/`를 Pages에 배포합니다. Actions 탭에서 성공 여부와 배포 주소를 확인합니다.

Vite `base: './'`와 해시 탐색을 사용하므로 저장소 하위 경로에서도 에셋과 새로고침이 동작합니다. PR에서는 검증만 하며 배포하지 않습니다.

## 참고 자료

- [lunar-javascript 공식 간지 API](https://6tail.cn/calendar/lunar.ganzhi.html)
- [lunar-javascript 1.7.7 원본과 MIT 라이선스](https://github.com/6tail/lunar-javascript/tree/v1.7.7)
- [한국천문연구원 2026년 달력 자료](https://astro.kasi.re.kr/kor/life/post/calendarData?search_year=2026)
- [Vite 정적 배포 안내](https://vite.dev/guide/static-deploy.html)
- [GitHub Pages 워크플로 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
