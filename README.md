# URIM · 잔광 기록 단말

잔광(AFTERGLOW) 세계관의 설정을 검색하고, 자작 캐릭터 키워드를 뽑아 주는 챗봇 페이지입니다.

## 들어 있는 파일

| 파일 | 설명 |
|---|---|
| urim.html | 챗봇 페이지 본체. 맨 위에 Claude API 설정 자리가 있습니다. |
| icon.svg, apple-touch-icon.png | 탭 아이콘과 홈 화면 아이콘 |
| worker.js | API 키를 숨겨 주는 프록시 서버 코드 (방법 A에서 사용) |
| README.md | 이 안내문 |

GitHub Pages 저장소에 urim.html과 아이콘 두 개를 올리면 `https://아이디.github.io/저장소이름/urim.html`로 열립니다.
worker.js와 README.md는 올리지 않아도 됩니다.

## AI 없이 쓰기

설정을 비워 두면 그대로 동작합니다. 기록 검색, 느낌으로 자캐 뽑기, 명부 계산은 모두 브라우저 안에서 처리됩니다.

## Claude API 연결하기

urim.html을 열면 맨 위에 `window.URIM_CONFIG`가 있습니다. **proxyUrl과 apiKey 중 하나만** 채우세요.
연결되면 화면 오른쪽 위에 'AI 해설' 스위치가 나타나고, 다음 기능이 켜집니다.

- 질문에 Claude가 설정 자료를 근거로 답합니다.
- 원하는 캐릭터 느낌을 적으면 Claude가 그 느낌을 읽고 출신, 종족, 직업, 비밀을 고릅니다.
- 뽑힌 키워드로 캐릭터 콘셉트 초안(한 줄 소개, 배경, 성격, 갈등, 첫 장면)을 씁니다.

API 키는 https://console.anthropic.com 에서 발급합니다. 사용한 만큼 요금이 나오니, 콘솔에서 **월 사용 한도(spend limit)를 꼭 정해 두세요.**

### 방법 A · 프록시 (공개 사이트라면 이 방법)

1. https://dash.cloudflare.com 에서 Workers & Pages > Create > Worker를 만듭니다.
2. 편집기에 worker.js 내용을 붙여넣고 Deploy를 누릅니다.
3. 워커의 Settings > Variables and Secrets에서 두 값을 추가합니다.
   - `ANTHROPIC_API_KEY` : API 키 (Secret으로)
   - `ALLOWED_ORIGIN` : 사이트 주소, 예) `https://아이디.github.io`
4. 워커 주소(`https://....workers.dev`)를 urim.html의 `proxyUrl`에 넣고 다시 올립니다.

키는 Cloudflare 안에만 있어서 사이트 방문자에게 보이지 않습니다.
다만 누군가 워커 주소를 알아내 직접 호출할 수는 있으니, 사용 한도는 꼭 걸어 두세요.

### 방법 B · 키 직접 입력 (내 컴퓨터에서만)

urim.html의 `apiKey`에 키를 넣고, 파일을 더블클릭해 브라우저로 엽니다.
**이 상태로 GitHub에 올리면 누구나 키를 볼 수 있습니다.** 공개 저장소에는 절대 올리지 마세요.

### 모델 바꾸기

- `model` : 답변과 콘셉트 작성에 쓰는 모델 (기본 claude-sonnet-5-5)
- `quickModel` : 느낌 읽기처럼 짧은 작업에 쓰는 모델 (기본 claude-haiku-5-5)

프록시를 쓰는 경우 worker.js의 `MODELS` 목록에도 같은 이름이 있어야 합니다.
