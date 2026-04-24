---
title: "MedRecord — build plan (reference)"
date: 2026-04-21T10:00:00+05:30
draft: false
author: "Arockiaraj"
description: "Package-level plan, migrations, and engineering notes for MedRecord Phase 1—companion to the main project page."
tags: ["android", "kotlin", "medrecord", "architecture"]
categories: ["Projects"]
featuredImage: ""
build:
  list: never
---

# MedRecord — Android Build Plan

On-device, encrypted, family medical records app. Phase 1 is offline-first; Play Store deferred.

---

## 1. Project Metadata

| Key | Value |
|---|---|
| App name | MedRecord *(placeholder — rename in `strings.xml`)* |
| Package | `com.mindshift.medrecord` |
| Min SDK | 26 (Android 8.0) |
| Target SDK | Latest stable |
| Language | Kotlin |
| UI | Jetpack Compose |
| Build | Gradle KTS + `libs.versions.toml` |
| KMP | No |

---

## 2. Non-Negotiable Rules

Claude Code must uphold these without exception:

1. **Never auto-commit parsed data.** Every parsed document passes through a review screen where the user edits and approves each field before writing to Room.
2. `android:allowBackup="false"` + no `fullBackupContent`. Exclude from Auto Backup.
3. **No PII or PHI in logs — ever.** No `Log.d(TAG, person.name)`. No Crashlytics / Sentry / Firebase Analytics in v1.
4. **Auto-lock on background.** Re-auth required when app returns to foreground. Configurable: immediate / 30s / 1min. Default: immediate.
5. **Biometric first, PIN fallback.** 5 failed PIN attempts → 30s cooldown. 10 consecutive → option to wipe vault.
6. **Local parsing is default.** Cloud (Gemini) requires per-document opt-in with red-bordered consent dialog.
7. **Low-confidence fields (<0.7)** pre-flagged in review UI with warning badge.
8. **"Not a medical device" disclaimer** in About screen + first launch.
9. **User owns API keys.** Gemini key in `EncryptedSharedPreferences`. No backend. No hardcoded keys.
10. `FLAG_SECURE` on all activities containing PHI. Disable clipboard on sensitive fields.

---

## 3. Tech Stack

| Layer | Library |
|---|---|
| DI | Hilt |
| Database | Room + SQLCipher (`net.zetetic:sqlcipher-android`) |
| File encryption | Jetpack Security `EncryptedFile` + `MasterKey` *(note: library in maintenance mode; acceptable for v1, migrate to Tink later)* |
| Auth | AndroidX Biometric |
| Background | WorkManager + `AlarmManager.setExactAndAllowWhileIdle` for dose reminders |
| Camera | CameraX |
| OCR preprocess | ML Kit Text Recognition |
| Local LLM | LiteRT-LM 0.10.0 + Gemma 3n E2B |
| Cloud LLM | Retrofit + Gemini API (`gemini-2.5-flash`) |
| PDF | `PdfRenderer` (image) + text-layer extractor (e.g. PDFBox-Android) |
| Charts | Vico |
| Nav | Compose Navigation (type-safe with `kotlinx.serialization`) |
| Testing | JUnit5, MockK, Turbine, Compose UI Test, Robolectric |

Pin versions in `gradle/libs.versions.toml`. Use latest stable at project init.

---

## 4. Data Model

All tables in encrypted Room DB. Primary keys `Long` autoincrement unless noted.

### Person
`person_id`, `full_name`, `dob`, `gender`, `blood_group`, `allergies` (List<String>), `relation`, `avatar_path`, `created_at`, `updated_at`

### Condition
`condition_id`, `person_id` FK, `name`, `status` (ACTIVE / RESOLVED / MONITORING), `started_on`, `resolved_on?`, `notes`

### Encounter
`encounter_id`, `person_id` FK, `condition_id?` FK, `date`, `type` (CONSULT / LAB / FOLLOWUP / EMERGENCY), `doctor_name?`, `hospital_name?`, `notes`

### Document
`doc_id`, `encounter_id` FK, `type` (LAB / PRESCRIPTION / INVOICE / SUMMARY / OTHER), `file_path_encrypted`, `original_filename`, `mime_type`, `captured_at`, `parse_status` (UNPARSED / PARSING / PARSED / APPROVED / SKIPPED), `parser_used` (LOCAL / CLOUD / MANUAL / NONE), `raw_ocr_text?`, `parsed_json?`

### Medication
`med_id`, `person_id` FK, `condition_id?` FK, `source_doc_id?` FK, `name`, `generic_name?`, `dose`, `dose_unit`, `frequency` (e.g. "1-0-1"), `route` (ORAL / TOPICAL / …), `start_date`, `end_date?`, `pills_total`, `pills_left`, `refill_threshold_days`, `status` (ACTIVE / PAUSED / COMPLETED), `notes`

### LabResult
`lab_id`, `document_id` FK, `person_id` FK *(denormalized for trend queries)*, `canonical_test_id?` FK, `raw_test_name`, `value_numeric?`, `value_text?`, `unit`, `ref_range_low?`, `ref_range_high?`, `flag` (LOW / NORMAL / HIGH / CRITICAL), `test_date`

### LabTestCanonical *(seeded)*
`canonical_id`, `canonical_name`, `category`, `synonyms` (List<String>), `default_unit`

**Seed list:** HbA1c, FBS, PPBS, TSH, T3, T4, Creatinine, eGFR, Urea, LDL, HDL, Total Cholesterol, Triglycerides, Hemoglobin, WBC, RBC, Platelets, ESR, CRP, Vitamin D, Vitamin B12, ALT, AST, Bilirubin, Uric Acid, Calcium, Sodium, Potassium, PSA, Ferritin.

### Reminder
`reminder_id`, `person_id` FK, `type` (FOLLOWUP / MEDICINE_DOSE / MEDICINE_REFILL), `due_at`, `repeat_rule?` (RRULE), `med_id?` FK, `encounter_id?` FK, `status` (PENDING / DONE / MISSED / DISMISSED), `notification_id`

---

## 5. Package Structure

```
com.mindshift.medrecord
├── core
│   ├── security      (KeystoreManager, PinManager, VaultUnlocker, AutoLockObserver)
│   ├── database      (MedRecordDatabase, DAOs, migrations, type converters)
│   ├── storage       (DocumentStore — EncryptedFile wrapper)
│   └── ui            (theme, design tokens, common composables)
├── feature
│   ├── auth          (first-run setup, unlock screen)
│   ├── person        (family CRUD)
│   ├── dashboard     (today view, active meds, alerts)
│   ├── document
│   │   ├── capture
│   │   ├── parse
│   │   ├── review
│   │   └── viewer
│   ├── encounter
│   ├── condition
│   ├── medication
│   ├── lab
│   ├── reminder
│   └── backup        (export / import)
└── parsing
    ├── core          (DocumentParser interface, ParseResult, FieldConfidence)
    ├── local         (LocalParser — Gemma via LiteRT-LM)
    ├── cloud         (CloudParser — Gemini API client + consent gate)
    ├── preprocess    (ML Kit, deskew, enhance, PDF handling)
    └── extractors    (LabExtractor, PrescriptionExtractor, InvoiceExtractor, SummaryExtractor, DocumentClassifier)
```

---

## 6. Phases

### Phase 0 — Foundation

Goal: project skeleton, security primitives, auth flow. No feature UI yet.

| ID | Task | Acceptance |
|---|---|---|
| T0.1 | Project init — Hilt, version catalog, Compose BOM, detekt, lint baseline | `./gradlew assembleDebug` green |
| T0.2 | `KeystoreManager` — AES-256-GCM master key, `setUserAuthenticationRequired(true)`, `setInvalidatedByBiometricEnrollment(true)` | Unit test: key survives process death; invalidates on new fingerprint |
| T0.3 | `PinManager` — PBKDF2-HMAC-SHA256, 100k iters, per-install salt, stored in EncryptedSharedPreferences | Unit test: correct PIN passes, wrong fails, timing-safe compare |
| T0.4 | `VaultUnlocker` — combines biometric + PIN to produce session-scoped DB passphrase; wipes `CharArray` after use | Integration test: unlock → DB access; lock → access blocked |
| T0.5 | `MedRecordDatabase` — Room + SQLCipher driven by passphrase from VaultUnlocker | Instrumented test: DB unreadable without passphrase |
| T0.6 | `DocumentStore` — EncryptedFile wrapper, UUID filenames under `filesDir/docs/` | Unit test: round-trip encrypted file |
| T0.7 | `feature/auth` — first-run (biometric check, PIN create), unlock screen with biometric + PIN fallback | Manual QA |
| T0.8 | `AutoLockObserver` — ProcessLifecycleOwner observer clears session on background | Manual QA: background → return → unlock required |
| T0.9 | Manifest hardening — `allowBackup=false`, `FLAG_SECURE` utility applied to all activities/composables with PHI | Verify `adb backup` excludes app |

**Exit criteria:** App launches → PIN setup → creates encrypted DB → auto-locks on background → unlocks with biometric/PIN. Stop. Wait for QA.

---

### Phase 1 — Profiles, Manual Entry, Dashboard, Reminders

Goal: usable app without any parsing. Manual entry covers everything.

| ID | Task | Acceptance |
|---|---|---|
| T1.1 | All entities + DAOs + repositories per §4 | Room unit tests pass for all CRUD |
| T1.2 | Seed LabTestCanonical on first run (via Room `Callback.onCreate`) | DB contains seed rows |
| T1.3 | `feature/person` — add/edit/list family members, avatar picker | Manual QA |
| T1.4 | `feature/condition` — create, set status, link to person | Manual QA |
| T1.5 | `feature/encounter` — log visit, optionally link to condition | Manual QA |
| T1.6 | `feature/medication` — add med with dose, frequency ("1-0-1"), pill count, refill threshold | Works end-to-end |
| T1.7 | `feature/medication` daily WorkManager — decrements `pills_left` by daily dose, raises refill reminder when `days_left ≤ refill_threshold_days` | Instrumented test with `WorkManagerTestInitHelper` |
| T1.8 | `feature/lab` — manual entry, canonical-test picker with fuzzy search, value/unit/range, auto-flag LOW/HIGH | Saves with `person_id` denormalized |
| T1.9 | `feature/reminder` — dose reminders via `AlarmManager.setExactAndAllowWhileIdle`, follow-up / refill via WorkManager; single notification channel per type | Notifications fire on time with Doze |
| T1.10 | `feature/dashboard` — person chips, today's doses, active meds with "X days left" badge, upcoming reminders, alerts | Manual QA |
| T1.11 | `feature/lab` trend chart — per person per canonical test, with ref-range band, tap point → opens source doc *(stub OK until Phase 2)* | Manual QA |
| T1.12 | About screen with "Not a medical device" disclaimer; show once on first launch | Manual QA |

**Exit criteria:** Family member added, meds tracked with topup alerts, labs entered and charted, reminders fire reliably. Stop. Wait for QA.

---

### Phase 2 — Document Parsing

Goal: camera/file → parsed fields → user approves → committed.

| ID | Task | Acceptance |
|---|---|---|
| T2.1 | `feature/document/capture` — CameraX + file picker (image + PDF), saves to DocumentStore | File appears in encrypted store |
| T2.2 | `parsing/preprocess` — ML Kit text detection, deskew, contrast enhance. PDF: text-layer extract first, render-fallback to bitmap if no text | Fixture tests pass |
| T2.3 | `parsing/core/DocumentParser` interface + `ParseResult` + `FieldConfidence(score: Float, sourceBox: Rect?)` | Interface stable |
| T2.4 | `parsing/local/LocalParser` — Gemma 3n E2B via LiteRT-LM, model downloaded on first use (WiFi-preferred, SHA-256 verified), stored under `filesDir/models/` | Parses lab-report fixture end-to-end |
| T2.5 | `parsing/cloud/CloudParser` — Gemini API, user's own key, red-bordered consent dialog per call | Declining consent blocks call |
| T2.6 | `parsing/core/DocumentClassifier` — routes to LAB / PRESCRIPTION / INVOICE / SUMMARY / OTHER before extractor | ≥85% accuracy on test set |
| T2.7 | Extractors — `LabExtractor`, `PrescriptionExtractor`, `InvoiceExtractor`, `SummaryExtractor`. Each emits typed `ParseResult` with per-field confidence | Unit tests per extractor |
| T2.8 | `feature/document/review` — split-screen: image (zoomable, tap-field-highlights-box) + editable fields. Low-confidence badge. Approve / Reject / Skip actions | Approve writes to DB; Reject discards parse; Skip keeps raw doc only |
| T2.9 | Canonical test fuzzy matcher — Levenshtein + synonym list. Unknown → stored as-is with "Map later" chip | ≥20 synonym test cases pass |
| T2.10 | Settings screen — local/cloud toggle, Gemini key entry (masked), model download/delete, auto-lock timeout, vault wipe | Manual QA |
| T2.11 | Handwritten prescription path — if classifier flags `low_legibility`, skip LLM, save image + open manual entry form | Manual QA with handwritten fixture |

**Exit criteria:** Snap a lab report → review → approve → values appear on trend chart. Stop. Wait for QA.

---

### Phase 3 — Export / Import + Backfill

Goal: user can move data between devices manually.

| ID | Task | Acceptance |
|---|---|---|
| T3.1 | `Exporter` — Argon2id-derived key from user passphrase, AES-256-GCM zip of DB dump + docs folder. Output to Documents/ via SAF | Round-trip unit test preserves data |
| T3.2 | `Importer` — validate, decrypt, merge with conflict strategy (skip / overwrite / keep-both) | Manual QA |
| T3.3 | Backfill bulk upload — queue many docs for Phase 2 parsing in background via WorkManager; user reviews each when ready | Queue processes end-to-end |

**Exit criteria:** Export file from device A, import on device B, all data restored.

---

### Phase 4 — Polish & Play Store Prep *(deferred)*

Skip until publication is decided. When ready: condition timeline, global search, app icon + screenshots, public privacy policy URL, hardened disclaimer, Organization developer account, Health Apps Declaration form, Data Safety form.

---

## 7. Security Requirements (detailed)

- **Master key:** Android Keystore, AES-256-GCM, `setUserAuthenticationRequired(true)`, `setInvalidatedByBiometricEnrollment(true)`.
- **DB passphrase:** generated on first run, wrapped by master key, unwrapped only during session. Session = from unlock until auto-lock.
- **PIN:** PBKDF2-HMAC-SHA256, ≥100k iterations, per-install salt, stored in EncryptedSharedPreferences. Timing-safe compare.
- **Document files:** `EncryptedFile` under `filesDir/docs/`, filenames are UUIDs (never patient names).
- **Memory hygiene:** secrets as `CharArray` / `ByteArray`; zero after use. Avoid `String` for passphrases.
- **Screenshots:** `FLAG_SECURE` on every activity. Compose: apply in `onCreate`.
- **Clipboard:** disable on sensitive text fields via `TextFieldCustomization`.
- **Export zip:** AES-256-GCM, Argon2id KDF (memory ≥64MB, iterations ≥3, parallelism ≥1).
- **Model files:** SHA-256 verified on download and before every load.

---

## 8. Testing Strategy

- **Unit:** all repositories, parsers, extractors, KDF, fuzzy matcher.
- **Instrumented:** Room + SQLCipher, EncryptedFile, WorkManager, AlarmManager.
- **Compose UI:** unlock screen, review screen (approval flow **must never** silently commit), dashboard.
- **Fixtures:** redacted sample labs, Rx, invoices, summaries under `test/resources/fixtures/`. Include at least 3 per doc type.
- **Pre-commit:** `./gradlew check` (detekt + lint + unit tests).
- **Manual checklist per phase exit** — documented in `docs/qa-checklist.md`.

---

## 9. Known Gotchas

1. **LiteRT-LM 0.10.0 + Gemma 4 + Pixel 8 GPU → decode bug.** Use Gemma 3n E2B. CPU fallback required.
2. **SQLCipher + Room migrations** need passphrase during migration — test every migration on encrypted DB with realistic data.
3. **PdfRenderer** doesn't support password-protected or certain-encoded PDFs. Wrap in try/catch; fall back to "store as image, manual entry."
4. **Biometric key invalidation** — when user enrolls a new fingerprint, master key is invalidated. On detection, prompt for PIN, re-wrap passphrase under new master key.
5. **WorkManager + Doze mode** — not exact enough for medicine doses. Use `AlarmManager.setExactAndAllowWhileIdle` for dose reminders. Keep WorkManager for daily decrement and refill checks.
6. **Gemma model size (~2GB)** — download on first use, WiFi-preferred toggle, resumable download, SHA-256 verification.
7. **Room + SQLCipher** — use `OpenHelperFactory` supplied with `SupportFactory(passphrase.toByteArray())`. Zero the byte array after DB open.

---

## 10. How Claude Code Should Work

- **Implement one phase at a time.** Stop at each exit criteria. Wait for user QA before proceeding.
- **Commit per task ID** with message like `T1.3: person CRUD`.
- **Never skip tests.** If a task has no explicit test listed, add ≥1 happy-path + ≥1 error-path.
- **On platform gotchas, stop and ask** — do not invent workarounds.
- **Never log PHI.** If a log would contain PHI, mask it (`"name=***"`).
- **Follow package structure exactly.** Create new packages only if explicitly needed.
- **Prefer Kotlin idioms:** sealed interfaces for states, `Result<T>` for fallible ops, coroutine `Flow` for reactive data, `kotlinx.serialization` for all JSON.
- **Update this file** if architectural decisions change during implementation, with a dated changelog entry at the bottom.

---

## Changelog

- **1.0 — 2026-04-20** — Initial plan.