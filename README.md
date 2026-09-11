<div align="center">
  <img src="https://avatars.githubusercontent.com/u/254638087?v=4" width="140" height="140" style="border-radius: 50%; border: 5px solid #FF6B6B; box-shadow: 0 0 40px rgba(255,107,107,0.3);" alt="Vicky Kumar">
  <h1 style="margin: 25px 0 10px; font-size: 42px; color: #c9d1d9; font-weight: 700;">Vicky Kumar</h1>
  <p style="font-size: 20px; color: #8b949e; margin: 0 0 25px; letter-spacing: 0.5px;">
    <span style="color: #FF6B6B; font-weight: 600;">Open Source AI Engineer</span>
  </p>
  
  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 30px;">
    <a href="https://github.com/FiscalMindset"><img src="https://img.shields.io/badge/GitHub-FiscalMindset-181717?style=for-the-badge&logo=github" alt="GitHub"/></a>
    <a href="https://github.com/algsoch"><img src="https://img.shields.io/badge/GitHub-algsoch-181717?style=for-the-badge&logo=github" alt="GitHub algsoch"/></a>
    <a href="https://github.com/blindfold-org"><img src="https://img.shields.io/badge/GitHub-blindfold--org-181717?style=for-the-badge&logo=github" alt="GitHub blindfold-org"/></a>
    <a href="https://www.linkedin.com/in/algsoch"><img src="https://img.shields.io/badge/LinkedIn-algsoch-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn"/></a>
    <a href="https://algsoch.com"><img src="https://img.shields.io/badge/algsoch.com-Live-FF6B6B?style=for-the-badge" alt="algsoch.com"/></a>
  </div>

  <p style="font-size: 16px; color: #6e7681; max-width: 650px; line-height: 1.6;">
    <span style="color: #FF6B6B; font-weight: 600;">Built to ship, always.</span>
  </p>
</div>

---

## TL;DR

| | |
|:--|:--|
| **Who** | Open Source AI Engineer — Coral MCP contributor, agent tooling, real-world products |
| **What I Build** | AI features inside real products — pipelines, offline apps, editor workflows, automation |
| **Stack** | Python · Kotlin · TypeScript · Rust · React · FastAPI · LangGraph · Coral |
| **Open Source** | Coral MCP — contributor · 14 PRs merged |
| **Closed Source** | Blindfold · Reelforge · ChitraDub · agentic_chat · footprint · scrapper · coral_benchmarks · ghevra |

---

## Featured Projects

### 🛡️ Secrets Security — Blindfold

[**Blindfold**](https://github.com/blindfold-org/Blindfold) — [blindfold-org](https://github.com/blindfold-org) · Live: [blindfold-rho.vercel.app](https://blindfold-rho.vercel.app/)
- **TDX enclave wrapper — AI agents never see or leak the keys they use**
- Seal and use API keys inside a trusted execution enclave
- No-paste workflow — verify by fingerprint, never write keys to disk
- Built with **TypeScript + Rust (WASM contract)** · Terminal 3 Intel TDX enclave integration

```mermaid
flowchart LR
    subgraph DEV["Developer machine — UNTRUSTED"]
        ENV[".env<br/>no API keys after register"]
        AGENT["AI agent<br/>no keys in env · process · context"]
        CHAT["@blindfold/chatbot<br/>rule-based · audience-aware<br/>REPL · web · API"]
        CLI["blindfold CLI + proxy<br/>signup · login · register · use · proxy<br/>attest · doctor · rotate · migrate"]
    end

    subgraph T3["🛡️ Terminal 3 — Intel TDX trust domain"]
        KV["Sealed KV map z:&lt;tenant_did&gt;:secrets<br/>gmail · openai · github · twilio · aws …<br/>encrypted at rest in TDX RAM"]
        FW["contract/src/forward.rs · Rust → WASM<br/>kv::get(secret_key) → substitutes<br/>SENTINEL → secret → http::call"]
        ATTEST["TDX attestation<br/>Intel root CA · RTMR3 · --pin gate"]
        FW -->|"reads sealed secret"| KV
        ATTEST -.->|"verifies quote"| FW
    end

    API["api.openai.com · Anthropic<br/>GitHub · AWS SES/S3 · smtp.gmail.com …"]

    ENV -->|"one-time seal · registerSecret → seedSecret"| CLI
    AGENT -->|"request · Bearer &lt;sentinel&gt; (no key)"| CLI
    CHAT -->|"dogfoods proxy + sentinel"| CLI
    CLI -->|"invokeForward · authenticated T3"| FW
    FW -->|"swaps in real key · calls API"| API
    API -->|"API response"| FW
    FW -->|"output (key never leaks)"| CLI
    CLI -->|"returns output to agent"| AGENT
```

---

### 🏆 On-Device AI Learning — algsoch

[**algsoch**](https://github.com/FiscalMindset/algsoch) — Android AI Study Companion
- **100% Offline** — AI runs entirely on-device via RunAnywhere SDK
- **7 Learning Modes** — Direct, Explain, Notes, Theory, Creative, Answer, Direction
- **SmolLM2-360M + SmolVLM-256M** running locally on Android
- Built with Kotlin + Jetpack Compose + RunAnywhere SDK
- [YouTube Demo](https://youtu.be/8L3svJ2HgI0)

```mermaid
graph LR
    A[User Question] --> B[RunAnywhere SDK]
    B --> C[SmolLM2-360M<br/>On-Device LLM]
    C --> D[AI Response<br/>Mode-Adapted]
```

---

### 🎬 Video Dubbing — ChitraDub

[**chitradub**](https://github.com/FiscalMindset/chitradub) — Video Dubbing Pipeline
- Paste a **YouTube URL** or upload a video → get a **dubbed MP4 + SRT** back
- **12 target languages** across **5 source languages** — powered by AI4Bharat
- Full **12-stage pipeline** with CI, Docker, Release, and pre-commit automation
- Built with **Python** + **Next.js 15** + **FastAPI** + **Postgres**

```mermaid
flowchart LR
    A[YouTube URL / Upload] --> B[Transcription]
    B --> C[Translation]
    C --> D[TTS Synthesis]
    D --> E[Timing / Subtitle Sync]
    E --> F[Dubbed MP4 + SRT]
```

---

### 🎥 AI-Native Video Editor — Reelforge

[**video (Reelforge)**](https://github.com/FiscalMindset/video) — AI-Native Web Video Editor
- **Edit by intention** — timeline project JSON is the single source of truth; the MP4 is a derivative
- **AI operates like a power user** — same typed operation union + allow-list, validated as a single transactional, undoable edit
- **Non-destructive always** — every edit reversible; professional NLE depth (multi-track, trim, split, ripple, keyframes, captions, transitions)
- Built with **TypeScript (React + Vite)** + **FastAPI** + **PostgreSQL** · pnpm monorepo + MCP server

```mermaid
flowchart LR
    Project[(Project JSON<br/>single source of truth)] --> Preview[Preview Renderer]
    Project --> Export[Export Renderer]
    Project --> AI[AI Agent<br/>same op union + allow-list]
    Project --> Collab[Collab Engine]
    Preview --> Pixels[Live Pixels]
    Export --> MP4[Master MP4]
```

---

### 📰 Multi-Agent AI Newsroom — algsochnews

[**algsochnews**](https://github.com/FiscalMindset/algsochnews) — AI-Powered News Pipeline
- **5-Agent orchestration** — Article Extraction → News Editor → Visual Packaging → QA → Video Generation
- **Parallel processing** with conditional retry routing
- **Broadcast-native output** — Screenplay JSON, timed visuals, MP4 video
- Built with **LangGraph** + **FastAPI** + **React**
- Live: [Frontend](https://algsochnews-1.onrender.com) · [API](https://algsochnews.onrender.com)

[Demo](https://youtu.be/vX4ZxSSpP8M)

```mermaid
flowchart LR
    A[Article URL] --> B[Extraction Agent]
    B --> C[News Editor Agent]
    C --> D[Visual Packaging]
    D --> E[QA Agent]
    E -->|Pass| F[Video Generation]
    E -->|Retry| C
    E -->|Retry| D
```

---

### 🏥 Healthcare AI — careops

[**careops**](https://github.com/FiscalMindset/careops) — Coral-Powered Family Care Coordination
- **9 Coral sources** joined via single SQL interface
- Generates **doctor-ready visit packets** from scattered medical records
- Timeline synthesis across prescriptions, lab reports, symptoms, appointments
- Safety guardrails — never diagnoses or prescribes
- Built with **Next.js 15** + **Coral SQL** + **TypeScript**
- 22 tests passing (13 careops + 9 coral-cli)

[Demo](https://youtu.be/TAOyyIH2_rc)

```mermaid
flowchart TD
    subgraph App["CareOps Application"]
        UI["Next.js UI"] --> API["Next.js API Routes"]
        API --> Client["Coral CLI Client"]
        Client --> CLI["coral sql --format json"]
    end

    subgraph Coral["Coral Query Layer"]
        CLI --> JOIN["Cross-Source JOIN\n(patient_id key)"]
        JOIN --> PAT["careops_patients"]
        JOIN --> MED["careops_medications"]
        JOIN --> LAB["careops_lab_reports"]
        JOIN --> CHAT["careops_doctor_chats"]
        JOIN --> PHARM["careops_pharmacy_receipts"]
        JOIN --> SYMP["careops_symptom_logs"]
        JOIN --> APPT["careops_appointments"]
        JOIN --> OCR["careops_prescription_ocr"]
        JOIN --> NOTES["careops_family_notes"]
    end

    CLI --> Result["Joined SQL Result"]
    Result --> Agent["CareOps Packet Generator"]
    Agent --> Packet["Doctor Visit Packet"]
```

---

## All Projects

### 📱 Mobile AI (On-Device)

| Project | Description | Account |
|---------|-------------|:-------:|
| [algsoch](https://github.com/FiscalMindset/algsoch) | Android AI study companion, 7 learning modes, 100% offline | [FiscalMindset](https://github.com/FiscalMindset) |
| [algsochvicky](https://github.com/FiscalMindset/algsochvicky) | Portfolio website deployed on Render | [FiscalMindset](https://github.com/FiscalMindset) |

### 🤖 Agentic AI Systems

| Project | Description | Account |
|---------|-------------|:-------:|
| [algsochnews](https://github.com/FiscalMindset/algsochnews) | Multi-agent newsroom with 5 agents + video generation | [FiscalMindset](https://github.com/FiscalMindset) |
| [careops](https://github.com/FiscalMindset/careops) | Coral-powered family care coordination agent | [FiscalMindset](https://github.com/FiscalMindset) |
| [Cognivise](https://github.com/algsoch/Cognivise) | Real-time adaptive tutoring with eye tracking | [algsoch](https://github.com/algsoch) |
| [agentic_chat](https://github.com/FiscalMindset/agentic_chat) | Conversational session history with OpenCode · [Dashboard](https://agentic-dashboard-qzen.onrender.com/) | [FiscalMindset](https://github.com/FiscalMindset) |
| [vickykumar](https://github.com/FiscalMindset/vickykumar) | algsoch — personal AI chatbot trained on your digital footprint · [Live](https://algsoch.com/) | [FiscalMindset](https://github.com/FiscalMindset) |

### 🎬 Media & Video

| Project | Description | Account |
|---------|-------------|:-------:|
| [chitradub](https://github.com/FiscalMindset/chitradub) | Video dubbing pipeline — YouTube URL/upload → dubbed MP4 + SRT | [FiscalMindset](https://github.com/FiscalMindset) |
| [video](https://github.com/FiscalMindset/video) | Reelforge — AI-native web video editor (timeline project model = source of truth, pnpm monorepo + MCP server) | [FiscalMindset](https://github.com/FiscalMindset) |

### 🛡️ Security & Privacy

| Project | Description | Account |
|---------|-------------|:-------:|
| [Blindfold](https://github.com/blindfold-org/Blindfold) | TDX enclave wrapper — AI agents never see or leak the keys they use | [blindfold-org](https://github.com/blindfold-org) |
| [footprint](https://github.com/FiscalMindset/footprint) | Personal digital-footprint analytics — static, private, local-first, 12 services | [FiscalMindset](https://github.com/FiscalMindset) |

### 🛠️ Developer Tooling

| Project | Description | Account |
|---------|-------------|:-------:|
| [scrapper](https://github.com/FiscalMindset/scrapper) | Scrape-Verse Sentinel — self-healing web context for AI coding agents | [FiscalMindset](https://github.com/FiscalMindset) |
| [coral_benchmarks](https://github.com/FiscalMindset/coral_benchmarks) | Per-spec query benchmarks for Coral sources · [Live](https://coral-benchmarks.onrender.com) | [FiscalMindset](https://github.com/FiscalMindset) |

### 🌐 Web & Community

| Project | Description | Account |
|---------|-------------|:-------:|
| [ghevra](https://github.com/FiscalMindset/ghevra) | Community transparency portal for Ghevra village — EN / Hindi / Haryanvi | [FiscalMindset](https://github.com/FiscalMindset) |
| [smart_terminal](https://github.com/algsoch/smart_terminal) | RunAnywhere CommandBrain — offline CLI assistant | [algsoch](https://github.com/algsoch) |

### 🏢 Organisation — blindfold-org

First GitHub organisation: [**blindfold-org**](https://github.com/blindfold-org)

| Project | Description |
|---------|-------------|
| [Blindfold](https://github.com/blindfold-org/Blindfold) | TDX enclave secrets wrapper · [Live](https://blindfold-rho.vercel.app/) |
| [vickyhairsaloon](https://github.com/blindfold-org/vickyhairsaloon) | Production-grade unisex salon platform |

---

## Project Architectures

Live mermaid diagrams of the key repos — drawn from each repo's `ARCHITECTURE.md`.

### 🎬 chitradub — Real-Dubbing Pipeline

```mermaid
flowchart LR
    A[input video / YouTube URL] --> B[Extract audio + frames]
    B --> C[ASR + VAD<br/>faster-whisper + Silero]
    B --> E[Prosody extract<br/>librosa.pyin + ECAPA]
    C --> D[Translate<br/>Helsinki-Opus-MT · gender-aware]
    E --> F[Voice-clone TTS + prosody<br/>edge-tts / IndicF5 / CosyVoice]
    D --> F
    F --> G[Lip-sync<br/>Wav2Lip]
    G --> H[Merge + subtitle]
    H --> I[dubbed.mp4 + SRT]
```

### 🤖 agentic_chat — agentic-dashboard

```mermaid
flowchart TB
    A[(opencode.db<br/>2.4 GB SQLite)] -->|scripts/extract-cli.sh| B[data/stats.json<br/>3.7 MB sanitised]
    A -.->|cp + split -b 95M| C[.local/opencode.db<br/>26 parts]
    B -->|committed| D[GitHub repo]
    C -->|committed| D
    D -->|webhook| E[Next.js build → out/]
    E --> F[(agentic-dashboard-qzen<br/>public static)]
    F --> G[Browser dashboard]
```

### 🔍 footprint — Digital-Footprint Analytics

```mermaid
flowchart LR
    SRC[Raw exports<br/>gmail · openai · telegram · zoom] -->|sync-and-rebuild.mjs| DATA[data/raw/&lt;source&gt;]
    DATA -->|build-data.ts + per-source parsers| PIPE[manifests + public/data JSON]
    PIPE -->|generate-og.ts| OG[Per-app OG SVGs]
    PIPE -->|next build · static export| OUT[./out · 498 routes]
    OG --> OUT
    OUT -->|deploy anywhere| HOST[Render · Vercel · S3 · nginx + Cloudflare]
```

### 🎥 video — Reelforge Editor

```mermaid
flowchart LR
    Project[(Project JSON<br/>single source of truth)] --> Preview[Preview Renderer]
    Project --> Export[Export Renderer]
    Project --> AI[AI Agent<br/>same op union + allow-list]
    Project --> Collab[Collab Engine]
    Preview --> Pixels[Live Pixels]
    Export --> MP4[Master MP4]
```

### 🕷️ scrapper — Scrape-Verse Sentinel

```mermaid
flowchart LR
    A[Agent<br/>MCP stdio] -->|schema request| B[Extract<br/>Bright Data + retries]
    B --> C[Validate<br/>Pydantic + drift]
    C -->|clean| F[Persist<br/>Postgres + pgvector]
    C -->|violation| D[Fallback<br/>Gemini + last-known-good]
    D -->|severity ≥ SEMANTIC| E[Heal<br/>bdata scraper heal]
    D --> F
    E --> F
    F -->|ComponentExtractionPayload| A
    F -. OpenTelemetry .-> G[SigNoz]
```

### 🌐 ghevra — Ghevra Citizen Portal

```mermaid
flowchart TD
    D[data/ — village · schemes ·<br/>representatives · emergency] --> A[React SPA<br/>37 pages · HashRouter]
    I[i18n en / hi / hr<br/>localStorage] --> A
    A -->|HTTPS| R[Render · nginx:1.27 · static dist/]
    G[git push origin main] --> R
```

### 🛡️ Blindfold — TDX Secrets Wrapper

[**Blindfold**](https://github.com/blindfold-org/Blindfold) — **TDX enclave wrapper — AI agents never see or leak the keys they use.** Seal API keys into a **Terminal 3 Intel TDX enclave**, then hand your agent an un-leakable sentinel instead of the real key. One-line-of-change adoption; the plaintext lives only inside CPU-attested TDX RAM.

**The exact workflow (install → login → seal → agent uses it):**

```bash
npm i -g @fiscalmindset/blindfold          # 1. global CLI, state in ~/.blindfold
blindfold signup --email you@example.com   # 2. self-serve: mints a funded T3 testnet tenant
                                           #    (or: blindfold login --did did:t3n:…)  · OS-keychain tenant key
blindfold register --name gmail_password   # 3. SEAL the key — hidden prompt, never touches disk
blindfold proxy                            # 4. http://127.0.0.1:8787 · sentinel __BLINDFOLD__
```

Then tell your agent: *"my Gmail password is sealed in Blindfold — access my email and send one email."* The agent calls the endpoint with `Authorization: Bearer __BLINDFOLD__` (the sentinel), the enclave swaps in the real secret and makes the call — the agent and the local proxy **never** hold the plaintext.

- **`blindfold use --name <key> -- <cmd>`** — release into ONE child command only (e.g. `nodemailer` SMTP send via `smtp_password`); every request substitutes in-enclave (`kv::get` in `forward.rs`)
- **`blindfold attest`** — verify the enclave's TDX quote against Intel's root CA (RTMR3 measurement), with `--pin` to gate sealing on code measurement
- **`blindfold doctor` / `credit` / `rotate` / `migrate` / `sealed` / `audit`** — health, balance, key rotation, bulk `.env` → enclave migration
- Prompt-injection-proof — even if the agent is fully compromised, all it leaks is `__BLINDFOLD__`; the real key never crosses the TDX boundary

```mermaid
flowchart LR
    subgraph DEV["Developer machine — UNTRUSTED"]
        ENV[".env<br/>no API keys after register"]
        AGENT["AI agent<br/>no keys in env · process · context"]
        CHAT["@blindfold/chatbot<br/>rule-based · audience-aware<br/>REPL · web · API"]
        CLI["blindfold CLI + proxy<br/>signup · login · register · use · proxy<br/>attest · doctor · rotate · migrate"]
    end

    subgraph T3["🛡️ Terminal 3 — Intel TDX trust domain"]
        KV["Sealed KV map z:&lt;tenant_did&gt;:secrets<br/>gmail · openai · github · twilio · aws …<br/>encrypted at rest in TDX RAM"]
        FW["contract/src/forward.rs · Rust → WASM<br/>kv::get(secret_key) → substitutes<br/>SENTINEL → secret → http::call"]
        ATTEST["TDX attestation<br/>Intel root CA · RTMR3 · --pin gate"]
        FW -->|"reads sealed secret"| KV
        ATTEST -.->|"verifies quote"| FW
    end

    API["api.openai.com · Anthropic<br/>GitHub · AWS SES/S3 · smtp.gmail.com …"]

    ENV -->|"one-time seal · registerSecret → seedSecret"| CLI
    AGENT -->|"request · Bearer &lt;sentinel&gt; (no key)"| CLI
    CHAT -->|"dogfoods proxy + sentinel"| CLI
    CLI -->|"invokeForward · authenticated T3"| FW
    FW -->|"swaps in real key · calls API"| API
    API -->|"API response"| FW
    FW -->|"output (key never leaks)"| CLI
    CLI -->|"returns output to agent"| AGENT
```

### 🤖 vickykumar — algsoch personal AI

```mermaid
flowchart LR
    U[User] --> F[React + Vite frontend]
    F -->|REST| B[FastAPI backend]
    B -->|Groq / Ollama| L[Cloud LLM]
    B -->|Coral SQL| D[(Digital footprint<br/>repos · code · posts · chunks)]
    B -->|RunAnywhere WASM| O[On-device models]
    F -->|static build| R[Render<br/>algsoch.com]
```

### 📊 coral_benchmarks — Coral QA Evidence

```mermaid
flowchart LR
    C[catalog.json] -->|required-filters| P[probe_&lt;source&gt;.py]
    P -->|minimal · realistic · edge| S[coral sql]
    S -->|rows + latency| R[reports/ tables + history + findings]
    R --> N[Next.js app]
    N -->|static export| OUT[app/out]
    OUT -->|deploy| LIVE[Live site + GitHub Pages mirror]
```

---

## Open Source Contributions

### Coral MCP — 14 PRs Merged · 20 Open · 6 Approved

Contributor to [Coral](https://github.com/withcoral/coral) — SQL-based data abstraction layer for AI agents. Integrated 8 AI providers:

| Provider | PR | Description |
|:---------|:---|:------------|
| Voyage AI | [#1115](https://github.com/withcoral/coral/pull/1115) | Vector search integration |
| Sarvam AI | [#1112](https://github.com/withcoral/coral/pull/1112) | Indian language TTS/STT |
| Cohere AI | [#1098](https://github.com/withcoral/coral/pull/1098) | Command R integration |
| Mistral AI | [#1011](https://github.com/withcoral/coral/pull/1011) | Mistral model support |
| OpenRouter | [#882](https://github.com/withcoral/coral/pull/882) | Unified API gateway |
| LM Studio | [#834](https://github.com/withcoral/coral/pull/834) | Local model serving |
| Ollama | [#798](https://github.com/withcoral/coral/pull/798) | Local LLM inference |
| Groq AI | [#754](https://github.com/withcoral/coral/pull/754) | Fast inference provider |

- **Merged: 14** · **Open: 20** (6 approved, awaiting merge) · **Closed without merge: 2**
- 13 review comments given across 5 reviewed PRs

[View all PRs →](https://github.com/withcoral/coral/pulls?q=author%3AFiscalMindset)

---

## Skills & Tech Stack

<details open>
<summary>🤖 <b>AI Engineering</b></summary>

| Focus | Stack |
|:------|:------|
| **On-Device AI** | <span style="background:#0d1117;color:#58a6ff;border:1px solid #58a6ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">RunAnywhere SDK</span> <span style="background:#0d1117;color:#58a6ff;border:1px solid #58a6ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">ONNX Runtime</span> <span style="background:#0d1117;color:#58a6ff;border:1px solid #58a6ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">WebAssembly</span> <span style="background:#0d1117;color:#58a6ff;border:1px solid #58a6ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">SmolLM2</span> <span style="background:#0d1117;color:#58a6ff;border:1px solid #58a6ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">SmolVLM</span> |
| **LLM & Agents** | <span style="background:#0d1117;color:#a371f7;border:1px solid #a371f7;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">LangChain</span> <span style="background:#0d1117;color:#a371f7;border:1px solid #a371f7;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">LangGraph</span> <span style="background:#0d1117;color:#a371f7;border:1px solid #a371f7;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Prompt Engineering</span> <span style="background:#0d1117;color:#a371f7;border:1px solid #a371f7;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">RAG</span> <span style="background:#0d1117;color:#a371f7;border:1px solid #a371f7;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Multi-Agent Systems</span> |
| **Model Ops** | <span style="background:#0d1117;color:#3fb950;border:1px solid #3fb950;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">LLM Evaluation</span> <span style="background:#0d1117;color:#3fb950;border:1px solid #3fb950;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Hallucination Analysis</span> <span style="background:#0d1117;color:#3fb950;border:1px solid #3fb950;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Response Evaluation</span> |
| **Vision & Speech** | <span style="background:#0d1117;color:#f778ba;border:1px solid #f778ba;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Whisper</span> <span style="background:#0d1117;color:#f778ba;border:1px solid #f778ba;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">SmolVLM</span> <span style="background:#0d1117;color:#f778ba;border:1px solid #f778ba;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Image Analysis</span> <span style="background:#0d1117;color:#f778ba;border:1px solid #f778ba;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">OCR</span> <span style="background:#0d1117;color:#f778ba;border:1px solid #f778ba;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Web Speech API</span> |

</details>

<details open>
<summary>🛠️ <b>Development</b></summary>

| Focus | Stack |
|:------|:------|
| **Languages** | <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Python</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Kotlin</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">JavaScript</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">TypeScript</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">SQL</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Rust</span> |
| **Mobile** | <span style="background:#0d1117;color:#7ee787;border:1px solid #7ee787;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Android</span> <span style="background:#0d1117;color:#7ee787;border:1px solid #7ee787;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Jetpack Compose</span> <span style="background:#0d1117;color:#7ee787;border:1px solid #7ee787;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">React Native</span> |
| **Frontend** | <span style="background:#0d1117;color:#56d4dd;border:1px solid #56d4dd;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">React</span> <span style="background:#0d1117;color:#56d4dd;border:1px solid #56d4dd;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Next.js</span> <span style="background:#0d1117;color:#56d4dd;border:1px solid #56d4dd;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Tailwind CSS</span> <span style="background:#0d1117;color:#56d4dd;border:1px solid #56d4dd;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Vite</span> <span style="background:#0d1117;color:#56d4dd;border:1px solid #56d4dd;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Zustand</span> |
| **Backend** | <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">FastAPI</span> <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">SQLAlchemy</span> <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Node.js</span> <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">PostgreSQL</span> <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">MCP SDK</span> |

</details>

<details open>
<summary>☁️ <b>Infrastructure</b></summary>

| Focus | Stack |
|:------|:------|
| **Orchestration** | <span style="background:#0d1117;color:#d2a8ff;border:1px solid #d2a8ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Kestra</span> <span style="background:#0d1117;color:#d2a8ff;border:1px solid #d2a8ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">GitHub Actions</span> <span style="background:#0d1117;color:#d2a8ff;border:1px solid #d2a8ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Docker</span> <span style="background:#0d1117;color:#d2a8ff;border:1px solid #d2a8ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">pnpm monorepos</span> |
| **Data** | <span style="background:#0d1117;color:#e3b341;border:1px solid #e3b341;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Coral SQL</span> <span style="background:#0d1117;color:#e3b341;border:1px solid #e3b341;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">JSONL</span> <span style="background:#0d1117;color:#e3b341;border:1px solid #e3b341;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">SQLite</span> <span style="background:#0d1117;color:#e3b341;border:1px solid #e3b341;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">OpenMetadata</span> |
| **Deployment** | <span style="background:#0d1117;color:#ffa657;border:1px solid #ffa657;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Render</span> <span style="background:#0d1117;color:#ffa657;border:1px solid #ffa657;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Vercel</span> <span style="background:#0d1117;color:#ffa657;border:1px solid #ffa657;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">ngrok</span> <span style="background:#0d1117;color:#ffa657;border:1px solid #ffa657;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Helm</span> |

</details>

<details open>
<summary>✍️ <b>Writing</b></summary>

| Article | Publication |
|:--------|:------------|
| [How I Built CareOps Agent with Coral + OpenCode](https://medium.com/@algsoch/how-i-built-careops-agent-with-coral-opencode-338d1238e6ae) | <span style="background:#0d1117;color:#e3b341;border:1px solid #e3b341;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Medium</span> |
| [Cognivise — Real-Time Cognitive AI Tutor](https://medium.com/@algsoch/cognivise-a-real-time-cognitive-ai-tutor-using-vision-agents-sdk-a33ef92d4666) | <span style="background:#0d1117;color:#e3b341;border:1px solid #e3b341;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Medium</span> |

</details>

<details open>
<summary>⚙️ <b>IDE & Tools</b></summary>

| | |
|:--|:--|
| **AI Coding** | <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">OpenCode</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Codex</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">AntiGravity</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Kimchi</span> <span style="background:#0d1117;color:#79c0ff;border:1px solid #79c0ff;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">OpenClaw</span> |
| **Code Editor** | <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">VS Code</span> <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Cursor</span> <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">JetBrains IDEs</span> |
| **Terminal** | <span style="background:#0d1117;color:#a371f7;border:1px solid #a371f7;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Warp</span> <span style="background:#0d1117;color:#a371f7;border:1px solid #a371f7;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Hyper</span> <span style="background:#0d1117;color:#a371f7;border:1px solid #a371f7;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">iTerm2</span> |
| **Other** | <span style="background:#0d1117;color:#3fb950;border:1px solid #3fb950;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Claude</span> <span style="background:#0d1117;color:#3fb950;border:1px solid #3fb950;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">ChatGPT</span> <span style="background:#0d1117;color:#3fb950;border:1px solid #3fb950;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">Gemini</span> |

</details>

### Awards & Recognition

| Achievement | Details |
|:------------|:--------|
| **Coral Hackathon Track 2** | 1st place — CareOps agent with 9 Coral sources |
| **Pull Shark** | Pull Shark x3 — @FiscalMindset opened pull requests that have been merged |
| **YOLO** | Fast merge achievement |
| **Quickdraw** | < 5 min merge time |

### Languages

| | |
|:--|:--|
| **Spoken** | English, Hindi |
| **Programming** | Python, Kotlin, JavaScript, TypeScript, SQL |

---

## GitHub Stats

<details open>
<summary>📊 <b>Accounts</b></summary>

| Account | Visibility | Repos | Stars | PRs Merged | Contributions |
|:--------|:----------:|:-----:|:-----:|:----------:|:-------------:|
| [@FiscalMindset](https://github.com/FiscalMindset) | <span style="background:#0d1117;color:#3fb950;border:1px solid #3fb950;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">public + private</span> | 56 | 6 | 170+ | — |
| [@algsoch](https://github.com/algsoch) | <span style="background:#0d1117;color:#3fb950;border:1px solid #3fb950;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">open source</span> | 104+ | 24+ | 14 | 350+ |
| [@blindfold-org](https://github.com/blindfold-org) | <span style="background:#0d1117;color:#ff7b72;border:1px solid #ff7b72;border-radius:12px;padding:2px 10px;margin:2px;font-size:12px;">private</span> | 2 | — | — | — |

</details>

<details open>
<summary>🔒 <b>Closed-Source Projects</b></summary>

| Category | Project | Description |
|:---------|:--------|:------------|
| 🛡️ **Security & Privacy** | [Blindfold](https://github.com/blindfold-org/Blindfold) | TDX enclave secrets wrapper — AI agents never see the keys |
| 🎥 **Media & Video** | [Reelforge](https://github.com/FiscalMindset/video) · [ChitraDub](https://github.com/FiscalMindset/chitradub) | AI-native video editor · dubbing pipeline in 12 languages |
| 🤖 **Agentic AI** | [agentic_chat](https://github.com/FiscalMindset/agentic_chat) · [vickykumar](https://github.com/FiscalMindset/vickykumar) | Session history + dashboard · personal AI chatbot |
| 🧪 **Data & Analytics** | [footprint](https://github.com/FiscalMindset/footprint) · [coral_benchmarks](https://github.com/FiscalMindset/coral_benchmarks) | Local-first digital-footprint analytics · Coral query benchmarks |
| 🛠️ **Developer Tooling** | [scrapper](https://github.com/FiscalMindset/scrapper) | Scrape-Verse Sentinel — self-healing web context for coding agents |
| 🌐 **Web & Community** | [ghevra](https://github.com/FiscalMindset/ghevra) | Community transparency portal — EN / Hindi / Haryanvi |

</details>

<details open>
<summary>🏆 <b>Achievements</b></summary>

<table>
<tr align="center">
<td><img width="180" src="https://github-readme-stats.vercel.app/api?username=FiscalMindset&show_icons=true&theme=radical&hide_title=true" alt="FiscalMindset stats"/></td>
<td><img width="180" src="https://github-readme-stats.vercel.app/api?username=algsoch&show_icons=true&theme=radical&hide_title=true" alt="algsoch stats"/></td>
<td><img width="180" src="https://github-readme-stats.vercel.app/api?username=blindfold-org&show_icons=true&theme=radical&hide_title=true" alt="blindfold-org stats"/></td>
</tr>
</table>

**🏆 Pull Shark x3** (@FiscalMindset opened pull requests that have been merged) · **YOLO** · **Quickdraw** (< 5 min merge)

</details>

---

## Featured Work Highlights

<div align="center">

| Project | Impact | Link |
|:--------|:-------|:-----|
| 🛡️ **Blindfold** | AI agents never touch the API keys they use — TDX enclave | [Live](https://blindfold-rho.vercel.app/) |
| 🤖 **algsoch (AI)** | Personal AI chatbot trained on your digital footprint | [Live](https://algsoch.com/) |
| 🎬 **ChitraDub** | YouTube URL / upload → dubbed MP4 + SRT in 12 languages | [GitHub](https://github.com/FiscalMindset/chitradub) |
| 🎥 **Reelforge (video)** | AI-native video editor — timeline project model = source of truth | [GitHub](https://github.com/FiscalMindset/video) |
| 📱 **algsoch Android** | 100% offline AI, 7 learning modes, RunAnywhere SDK | [GitHub](https://github.com/FiscalMindset/algsoch) |
| 📺 **algsochnews** | 5-agent pipeline → broadcast video from any article URL | [Live Demo](https://algsochnews-1.onrender.com) |
| 🏥 **careops** | 9 data sources joined via Coral SQL for family care coordination | [GitHub](https://github.com/FiscalMindset/careops) |
| 📊 **coral_benchmarks** | Per-spec query benchmarks for every Coral source | [Live](https://coral-benchmarks.onrender.com) |

</div>

---

## Let's Connect

<div align="center">

| Platform | Badge |
|:---------|:------|
| [LinkedIn](https://www.linkedin.com/in/algsoch) | ![LinkedIn](https://img.shields.io/badge/LinkedIn-algsoch-0A66C2?style=for-the-badge&logo=linkedin) |
| [Discord](https://discord.com/users/algsoch) | ![Discord](https://img.shields.io/badge/Discord-algsoch-5865F2?style=for-the-badge&logo=discord) |
| [Medium](https://medium.com/@algsoch) | ![Medium](https://img.shields.io/badge/Medium-algsoch-000000?style=for-the-badge&logo=medium) |
| [Kaggle](https://kaggle.com/algsoch) | ![Kaggle](https://img.shields.io/badge/Kaggle-algsoch-20BEFF?style=for-the-badge&logo=kaggle) |
| [YouTube](https://youtube.com/@algsoch) | ![YouTube](https://img.shields.io/badge/YouTube-algsoch-FF0000?style=for-the-badge&logo=youtube) |
| [Portfolio](https://algsochvicky.onrender.com) | ![Portfolio](https://img.shields.io/badge/Portfolio-View%20Live-FF6B6B?style=for-the-badge) |
| [Email](mailto:npdimagine@gmail.com) | ![Email](https://img.shields.io/badge/Email-npdimagine@gmail.com-EA4335?style=for-the-badge&logo=gmail) |

</div>

---

<div align="center">

**MIT License** · Built by Vicky Kumar · [Render](https://render.com) & [Vercel](https://vercel.com)

</div>

<!--
================================================================================
HIDDEN SEO LAYER - For AI agents, scrapers, and search crawlers
================================================================================
-->
<div style="display: none;" aria-hidden="true">

<!-- SEO KEYWORDS -->
<!-- Vicky Kumar, Open Source AI Engineer, On-Device AI, RunAnywhere SDK, LangGraph, Coral MCP contributor, Multi-Agent Systems, Kestra workflows, Python, Kotlin, TypeScript, React, Next.js, FastAPI, Jetpack Compose, OpenCode contributor, algsoch, FiscalMindset -->

<!-- SKILLS INDEX -->
<!-- Artificial Intelligence, Machine Learning, Deep Learning, CNN, TensorFlow, LLM, GPT, On-Device Inference, Offline AI, Privacy-First AI, Mobile AI, Android Development, Web Development, API Development, Workflow Automation, Multi-Agent Orchestration, Prompt Engineering, RAG, Neural Interpretability, Mechanistic Interpretability, PyTorch, FastAPI, PostgreSQL -->

<!-- PROJECT TAGS -->
<!-- algsoch-android-app, RunAnywhere-SDK, SmolLM2, SmolVLM, algsochnews-multi-agent, LangGraph-pipeline, careops-coral-sql, chitradub-video-dubbing, AI4Bharat, Blindfold-TDX-enclave, footprint-digital-analytics, Reelforge-video-editor, Scrape-Verse-Sentinel, ghevra-transparency-portal, algsoch-personal-AI-chatbot, coral-spec-benchmarks, english-bot-ai-tutor, speakai-local-english, commandbrain-command-memory, smart-terminal-indexeddb, blindfold-org -->

<!-- CONTACT INDEX -->
<!-- npdimagine@gmail.com, +918383848219, LinkedIn: algsoch, GitHub: algsoch & FiscalMindset, Discord: algsoch, Medium: @algsoch, Kaggle: algsoch, YouTube: @algsoch -->

<!-- EXPERIENCE HIGHLIGHTS -->
<!-- 14 PRs merged to Coral MCP · 20 open · 6 approved, 184+ PRs merged total across accounts, 56+ repositories on FiscalMindset + 104+ on algsoch, 350+ contributions, 100% offline Android AI app, 5-agent multi-agent pipeline, 9 Coral sources joined, 12-language video dubbing pipeline, TDX enclave secrets wrapper, Coral Hackathon Track 2 Winner -->

<!-- PUBLICATIONS -->
<!-- Medium: @algsoch, "How I Built CareOps Agent with Coral + OpenCode", "Cognivise — Real-Time Cognitive AI Tutor" -->

<!-- TOOLS & INFRASTRUCTURE -->
<!-- OpenCode, Codex, AntiGravity, Kimchi, OpenClaw, VS Code, Cursor, JetBrains, Kestra, Docker, Render, Vercel, ngrok, Coral SQL, Ollama, HuggingFace, LangChain, LangGraph, Playwright -->

<!-- LOCATIONS & TIMEZONE -->
<!-- Delhi, India, IST (UTC+5:30), Open to remote work worldwide -->

</div>