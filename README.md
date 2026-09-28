# JOAWORKS 공식 홈페이지

정적 웹사이트. **서버·데이터베이스·빌드 도구가 없다** — HTML/CSS 파일을
그대로 GitHub Pages 가 서빙한다.

> **이 저장소는 SELAH RTA 앱 저장소와 별개다**(지시서 §19).
> 앱 코드를 여기서 고치지 않는다.

## 구조

```
index.html          메인
selah-rta/          SELAH RTA 제품 소개
privacy/            개인정보처리방침  ← Google Play 개인정보처리방침 URL
terms/              서비스 이용약관
support/            고객지원
404.html            없는 주소
assets/css/site.css 공통 스타일(하나뿐이다)
.nojekyll           Jekyll 처리를 끈다
setup.mjs           도메인·이메일을 채워 넣는 도구
```

`assets/js/` 는 비어 있다. **자바스크립트를 쓰지 않는다** — 지금 페이지에
필요한 일이 없고, 없는 편이 빠르고 깨질 자리가 없다.

## 처음 한 번 — 도메인과 이메일 넣기

곳곳에 `joaworks.com` 와 `janghun@joaworks.com` 가 심어져 있다.
**손으로 고치지 말 것** — `canonical`·`og:url`·`mailto` 는 눈에 잘 띄지
않아 한두 군데를 빠뜨린다.

```bash
node setup.mjs joaworks.co.kr contact@joaworks.co.kr
```

이 한 줄이 하는 일:

- 모든 파일의 자리표를 바꾼다
- `CNAME` 을 만든다 — **없으면 배포할 때마다 사용자 지정 도메인이 풀린다**
- `sitemap.xml` · `robots.txt` 를 만든다
- 자리표가 남았으면 그 파일을 알려 주고 실패로 끝난다

## 눈으로 보기

빌드가 없으므로 파일을 바로 열면 된다. 다만 링크가 `/privacy/` 처럼
**절대 경로**라 `file://` 로 열면 링크가 안 걸린다. 작은 서버를 쓴다:

```bash
python -m http.server 8080
# http://localhost:8080
```

## GitHub Pages 배포

1. GitHub 에 `joaworks-website` 저장소를 만든다
2. 밀어 넣는다
3. **Settings → Pages** → Source: `Deploy from a branch` → `main` / `/ (root)`
4. 기본 주소(`https://<계정>.github.io/joaworks-website/`)에서 뜨는지 본다
5. **Settings → Pages → Custom domain** 에 도메인을 넣는다
6. DNS 를 설정한다 — **값은 추정하지 말고 GitHub 공식 문서에서 확인한다**
   (지시서 §15). A/AAAA 레코드 값은 바뀔 수 있다
7. DNS 가 붙은 뒤 **Enforce HTTPS** 를 켠다

> **링크는 모두 상대 경로다.** 그래서 도메인을 붙이기 전의
> `https://<계정>.github.io/joaworks-website/` 에서도, 도메인을 붙인
> 뒤의 뿌리에서도 **똑같이 동작한다.**
>
> 절대 경로(`/privacy/`)로 두면 하위 경로에서 전부 깨진다 — 한 번
> 그렇게 썼다가 고쳤다. 새 페이지를 더할 때도 상대 경로를 쓸 것.

## 고칠 때

- **개인정보처리방침과 이용약관은 앱의 실제 동작을 적은 것이다.**
  앱이 바뀌면(권한 추가, 인터넷 사용, 결제 도입 등) **먼저 여기를
  고친다.** 실제와 다른 방침을 두면 Google Play 정책 위반이다.
- 제품 페이지에 **아직 없는 기능을 적지 않는다**(지시서 §6).

### 지금 방침이 기대고 있는 사실 (2026-09-28 소스 확인)

| 확인한 것 | 결과 |
|---|---|
| 선언된 권한 | `RECORD_AUDIO` · `FOREGROUND_SERVICE` · `FOREGROUND_SERVICE_MICROPHONE` · `POST_NOTIFICATIONS` |
| 인터넷 권한 | **없음**(라이브러리를 합친 매니페스트에도 없음) |
| 네트워크 코드 | 없음 |
| Analytics · Crash 보고 | 없음 |
| 결제 · 구독 | 없음 |
| 제3자 SDK | 없음(AndroidX/Compose 와 자체 `dsp` 모듈뿐) |
| 저장 위치 | `filesDir` · `cacheDir` — 앱 전용, 삭제 시 함께 사라짐 |

**이 중 하나라도 바뀌면 `privacy/index.html` 을 고쳐야 한다.**
