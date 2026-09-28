# 구현 검증 — C01~C18

지시서 `JOAWORKS_개인정보처리방침_이용약관_검토_수정지시서.md` 6절의
체크리스트를 대조한 결과다.

- **검증일**: 2026-09-28
- **앱 기준 커밋**: `janghorse-boop/SELAH-RTA` `d869fdf`
  (`#34 fix(개인정보): 백업을 끈다` 병합 직후, main)
- **앱 식별**: `kr.joa.selahrta` · versionName `0.1.0` · versionCode `1` ·
  minSdk 26 · targetSdk 36
- **홈페이지 기준 커밋**: `janghorse-boop/joaworks-website` `288e499`
  에서 갈라진 `docs/policy-revision`
- **재현 명령**:
  `JAVA_HOME=<Android Studio>/jbr ./gradlew :app:processReleaseMainManifest --rerun-tasks`
  → `app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml`

## 이 검증이 하지 않은 것

**먼저 읽을 것.** 아래 표의 「확인됨」은 여기에 적은 방법으로 확인한
범위에 한한다.

- **실기기 시험을 하지 않았다.** 권한 거부 상태의 동작, 제조사 기기 이전,
  백업 복원, 공유 상대 앱에서의 실제 접근 범위는 코드로만 확인했다.
- **서명된 APK/AAB 를 만들어 열어 보지 않았다.** 확인한 것은 AGP 가 만든
  release 병합 매니페스트다.
- **Play Console 을 열람하지 못했다.** 데이터 보안(Data Safety) 신고
  내용, 타겟층 설정, 스토어 등록 정보는 모두 **미확인**이다.
- **앱은 아직 어떤 스토어에도 게시되지 않았다.** 따라서 「현재 배포 중인
  버전」이라는 것이 존재하지 않는다. 위 커밋에서 빌드한 결과가 방침의
  대상이다.

## 대조표

| ID | 대상 | 결과 | 근거 |
|---|---|---|---|
| C01 | 기준 배포본 | 확인됨 | 병합 매니페스트: `package="kr.joa.selahrta"` · `versionName="0.1.0"` · `versionCode="1"` · `minSdkVersion="26"` · `targetSdkVersion="36"`. 서명된 산출물과 스토어 트랙은 **해당 없음**(미게시) |
| C02 | 전체 권한 | **불일치 → 문서 고침** | 병합본의 `uses-permission` 은 다섯이다 — `RECORD_AUDIO`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MICROPHONE`, `POST_NOTIFICATIONS`, `kr.joa.selahrta.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. 앱 소스(`app/src/main/AndroidManifest.xml`)에 적힌 것은 넷이고, 다섯째는 AndroidX 가 병합 과정에서 넣는 **서명 수준 자기 권한**이라 사용자에게 묻지 않는다. 방침의 「네 가지가 전부」를 삭제하고 다섯 줄 표로 바꿨다 |
| C03 | 네트워크·외부 경로 | 확인됨 | 병합본에 `android.permission.INTERNET` 없음. 소스에 Retrofit·OkHttp·WebView·WorkManager·`java.net` 사용 없음. 외부로 나가는 경로는 **이용자가 실행하는 `ACTION_SEND` 하나**(C10) |
| C04 | 마이크 | 코드 확인 / **실기기 미확인** | `RECORD_AUDIO` 는 사용 시점 런타임 요청. 캡처는 `CaptureService`(전경 서비스)가 시작할 때만 연다. **권한 거부·철회 상태의 실제 화면 동작은 기기에서 확인하지 않았다** |
| C05 | 백그라운드 | 확인됨 | `<service android:name=".audio.CaptureService" android:exported="false" android:foregroundServiceType="microphone" />`. 진행 알림에 중지 동작이 있다(`CaptureService.kt` — `ACTION_STOP`, `addAction(..., capture_notice_stop, ...)`) |
| C06 | 녹음 선택 | 확인됨 | `ui/components/AudioAskDialog.kt` — 기록을 시작할 때마다 「소리도 함께 담을까요?」를 묻고, 단추는 **「소리도 담기」 / 「숫자만 기록」** 으로 결과가 갈린다. 고르지 않으면 오디오 파일을 만들지 않는다 |
| C07 | 오디오 저장 | 확인됨 | `recording/AudioFileFormat.kt` — m4a(`audio/mp4`) 또는 WAV(`audio/wav`), 이용자가 그 자리에서 고른다. 기록 폴더 `files/sessions/<id>/` 안에 둔다 |
| C08 | 측정 저장 | 확인됨 | 겉장 `recording/SessionMeta.kt`(시각·길이·기기 이름·샘플레이트·보정값·보정 이력·가중·응답 속도·Leq 구간·요약값·사건·메모), 타임라인 `.bin`. 내보내기 열은 `recording/SessionCsv.kt` 의 `FIXED_COLUMNS` + 1/3 옥타브 31밴드. 방침의 저장 표와 공유 설명을 이 목록에 맞췄다 |
| C09 | 보정 | 확인됨 | `calibration/ProfileStore.kt` → `files/profiles`, `calibration/CurveStore.kt` → `files/curves`. 응답 파일은 **URI 참조가 아니라 내용을 복사해** 저장하고 파일 이름을 함께 남긴다(`save(key, fileName, text)`) |
| C10 | CSV·공유 | 확인됨 | `res/xml/file_paths.xml` 이 여는 것은 `cache-path export/` 와 `files-path sessions/` 둘뿐. `ui/CaptureViewModel.kt exportSession()` 이 CSV 를 `cache/export/` 에 쓰고, **그 기록에 소리가 있으면 CSV 와 오디오를 함께** 공유에 올린다. 읽기 권한은 올린 파일에만 간다. 방침의 「내보내기 = CSV」 설명이 좁았으므로 오디오를 함께 적었다 |
| C11 | 삭제 | 확인됨 | `recording/SessionStore.delete(id)` 가 기록 폴더를 `deleteRecursively()` 한다 — 겉장·타임라인·오디오가 함께 사라진다. **`cache/export/` 의 CSV 와 보정·설정은 지워지지 않는다.** 방침에 그 구분과 각각의 삭제 방법을 적었다. 복구 불가능한 덮어쓰기는 제공하지 않으며, 그렇게 쓰지 않았다 |
| C12 | 백업 | **불일치 → 앱 고침** | 이전에는 `allowBackup` 선언이 없어 기본값 `true` 였고, 그 상태에서 앱은 「폰 안에만 두고, 기록을 지우면 함께 사라집니다」라고 말하고 있었다. `a307592`(PR #34)에서 `android:allowBackup="false"` 로 바꾸고 `ManifestPromisesTest` 로 고정했다. 병합본에 `dataExtractionRules`·`fullBackupContent`·`backupAgent` 없음 |
| C13 | 기기 이전 | **미확인** | `allowBackup="false"` 는 cloud-backup 과 device-transfer 를 함께 끈다는 것이 Android 문서의 설명이지만, **제조사 이전 도구(예: Smart Switch)에서의 실제 동작을 기기로 확인하지 않았다.** 방침에도 미확인으로 적었다 |
| C14 | SDK | 확인됨 | `releaseRuntimeClasspath` 에 AndroidX·Compose·Kotlin 표준 라이브러리와 `project :dsp` 만 있다. Firebase·Crashlytics·Analytics·Sentry·광고·AD_ID 없음 |
| C15 | 진단·로그 | 확인됨 | `android.util.Log` 만 쓴다(Logcat, 기기 안·휘발). 파일 로그·서버 로그·자동 전송 없음. `printStackTrace`·파일 기록 없음. **Play Console 의 플랫폼 진단은 게시 후에야 생기므로 미확인**이며, 방침에 그 구분을 적었다 |
| C16 | 현재 Billing | 확인됨 | Billing 라이브러리 의존 없음, `com.android.vending.BILLING` 권한 없음, 구매 UI·상품 정의 없음 |
| C17 | 향후 Billing | 해당 없음 | 미구현. 출시 전 조건은 [subscription-launch-checklist.md](subscription-launch-checklist.md) 로 분리했다 |
| C18 | 사용자 접근 | **없음 → 미해결** | 앱 안에 개인정보처리방침·이용약관 링크나 오프라인 문안이 **없다.** 이번 변경은 홈페이지에만 반영했다. 스토어 게시 전에 앱 안에도 링크를 넣어야 한다(아래 「남은 일」) |

## 문서에서 고친 단정과 그 까닭

| 고치기 전 | 고친 뒤 | 까닭 |
|---|---|---|
| 「앱은 어떤 데이터도 외부로 전송할 수 없습니다」 | 「JOAWORKS 서버로 자동 수집하지 않습니다 / 이용자가 보내기를 누르면 고른 앱으로 전달됩니다」 | 같은 페이지의 CSV 공유 설명과 모순이었다. 인터넷 권한이 없어도 Intent 로 나간다 |
| 「모든 데이터는 기기 안에만 저장됩니다」(meta description) | 「기기에서 처리하며 JOAWORKS 서버로 자동 전송하지 않습니다」 | 위와 같다 |
| 「위 네 가지가 권한의 전부」 | 다섯 줄 표 + 「버전이 바뀌면 함께 갱신」 | C02 |
| 「다른 앱이 읽을 수 없고, 앱을 삭제하면 함께 지워집니다」 | 앱별 접근 제한 + 공유 시 예외 + 내보낸 사본은 따로 | C10·C11 |
| 「클라우드 저장·백업」을 한 줄로 부정 | 자체 클라우드 없음 / `allowBackup="false"` / 제조사 이전은 미확인 | C12·C13 |
| 내보내기 = CSV | CSV + 오디오(있으면 함께) | C10 |
| 「캐시라 즉시 사라짐」 | 「앱이 스스로 지우지 않는다 — Android 가 정리하거나 이용자가 지운다」 | C10. 정리 코드가 없다 |
| 「개인정보를 수집하지 않습니다」 | 앱이 처리하는 것(마이크·녹음·메모)을 먼저 적고, 서버 자동 전송이 없다고 적음 | 녹음·메모에 개인정보가 들어갈 수 있다 |
| 「법적 판단·분쟁의 증거로 사용할 수 없습니다」 | 법정 측정 대체 불가(제4조 ①③)와 증거 판단(④)을 나눔 | 사적 약관이 증거 가치를 정할 수 없다 |
| 「사용·사용 불능의 모든 손해를 책임지지 않습니다」 | 귀책사유·고의중과실·법정 책임을 남기는 ⑤ | 약관법 제7조 |
| 「녹음의 적법성에 대한 책임은 사용자에게 있습니다」 | 이용자의 준수 의무(②③)와 사업자의 보호 의무(④)를 나눔 | 책임 전가 |
| 「역분석 금지」 | 권리 침해 금지 + 법령·오픈소스 허용 범위 보존 | 저작권법 제101조의4 |
| 「환불은 Google Play 정책을 따릅니다」 | 결제 플랫폼 경로 안내 + 국내 강행법규상 권리 보장 | 전자상거래법 |
| 고객지원·홈페이지 처리 없음 | 8·9항 신설(항목·목적·근거·보유·위탁·권리·안전조치) | 앱 미수집과 사업자 처리는 다른 문제다 |

## 남은 일 (미확인·미반영)

1. **C18 — 앱 안의 방침 링크.** 앱에 개인정보처리방침·이용약관 링크가
   없다. 스토어 게시 전에 넣어야 하며, 앱이 인터넷에 나가지 않으므로
   링크를 여는 방식(브라우저로 넘김)까지 정해야 한다.
2. **C13 — 제조사 기기 이전 실기기 시험.** 시험 기기와 시험 데이터로
   확인할 것. 사용자의 실제 기록으로 하지 않는다.
3. **C04 — 권한 거부 상태의 실기기 동작.**
4. **Play Console** — 데이터 보안 신고, 타겟층, 스토어 등록 정보.
   열람하지 못했다. [data-safety-mapping.md](data-safety-mapping.md) 의
   마지막 열이 비어 있다.
5. **고객지원 메일 보유기간(1년)** 은 이번에 사업자가 채택한 운영
   기준이다. 실제로 그렇게 지워야 문서가 참이 된다.
