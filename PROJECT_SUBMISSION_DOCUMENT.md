# 🎙️ PROJECT SUBMISSION: VoxAction AI
### College Voice AI Hackathon (6-Hour Solo Sprint)
**Theme:** *Speak. Understand. Act.*  
**Project Name:** **VoxAction AI (v2.0)**  
**Developer / Participant:** Solo Participant  
**Tracks Addressed:** 
- **Track 1: Voice to Action** (Expense & Task Ledger, Meeting Recording to Action Items & Email MoM)
- **Track 2: Real World** (Campus & Citizen Grievance Auto-Ticketing, Emergency Medical Triage)
- **Track 4: Learning** (AI Viva & Oral Exam Trainer with Real-time Scoring)

---

## 🔗 Project Links

- **GitHub Repository:** https://github.com/Lakshay0306/Vocal-Lab-Hackathon
- **Live Demo URL:** `[Insert Live Deployed URL or run locally on http://localhost:3000]`
- **Google Drive Submission Folder:** `[Insert your Google Drive Folder Link]`
- **Source Code Archive:** `voxaction-ai-submission.zip` (included in this Drive folder)

---

## 📌 1. What We Built & How It Works

### The Core Problem:
Most modern voice assistants (Siri, Alexa, ChatGPT Voice) are merely **conversational chat interfaces**. When users think fast and speak compound ideas, executing real-world tasks requires manually switching across 4 separate apps: a financial expense tracker, a to-do calendar, a ticket helpdesk portal, and an email composer.

### The Solution:
**VoxAction AI** is an **Autonomous Voice-to-Action Operating System** that strictly implements the hackathon’s 4-step pipeline:
> **Voice In ➔ AI Understands ➔ Real Action ➔ Voice Out**

```
┌─────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐      ┌─────────────────┐
│   1. Voice In   │ ───► │    2. AI Understands     │ ───► │      3. Real Action      │ ───► │   4. Voice Out  │
│ Web Speech API  │      │ Gemini 1.5 Flash /       │      │  • Expenses Ledger & Chart│      │ SpeechSynthesis │
│ + Spacebar PTT  │      │ Smart Zero-Latency NLP   │      │  • Tasks & Reminders Board│      │ Spoken Result   │
│ + Canvas Waves  │      │ Multi-Intent Extraction  │      │  • Campus Grievance Desk │      │ Audio Chimes    │
└─────────────────┘      └──────────────────────────┘      │  • Meeting MoM Dispatcher│      └─────────────────┘
                                                           │  • AI Viva Exam Scoring  │
                                                           │  • Emergency Code Red SOS│
                                                           │  • Real Webhook & Sheets │
                                                           └──────────────────────────┘
```

### Detailed Pipeline Flow:
1. **Voice In (Speech-to-Text):**
   - Captures speech natively via the browser **Web Speech API** (`webkitSpeechRecognition`) with zero latency.
   - Includes **Spacebar Walkie-Talkie Push-to-Talk**: press and hold Spacebar to speak, release to execute.
   - Drives an interactive **HTML5 Canvas audio visualizer** that computes live frequency bars and pulsating waveform rings.
   - Full bilingual support for **English (India - `en-IN`)**, **English (US - `en-US`)**, and **Hindi (`hi-IN`) / Hinglish**.
2. **AI Understands (Intent Extraction & Planning):**
   - Parses **compound, multi-intent voice commands** (e.g., *"Spent 250 rupees on lunch and remind me to submit the form on Friday"*).
   - Powered by a dual-engine brain:
     - **Google Gemini 1.5 Flash API** for structured JSON function-calling.
     - **Smart Offline NLP Rule Engine** that guarantees 100% uptime even in flaky hackathon Wi-Fi!
3. **Real Action (Visible State Execution):**
   - Strictly satisfies **Ground Rule 02** (*"The app must do something: create, update, send, or control. Chat alone is not enough"*).
   - Generates persistent ledger entries, updates interactive HTML5 doughnut charts, schedules alarms, generates auto-numbered support tickets (`TK-1084`), scores viva answers out of 10, triggers emergency siren alerts, and dispatches HTTP POST payloads to external Webhooks (Google Sheets / Discord).
4. **Voice Out (Text-to-Speech):**
   - Browser-native **SpeechSynthesis** speaks back crisp, natural conversational confirmations.
   - Built-in Web Audio API sound synthesizers (mic start beep, action chimes, emergency siren, and celebratory fanfare).

---

## 🛠️ 2. Contribution & Work Done

This project was built **100% from scratch during the 6-hour hackathon** as a solo participant:
- **Full Architecture Design:** Engineered the modular client-server architecture with zero external runtime dependencies.
- **Voice In & Audio Synthesis:** Developed native Web Speech and Web Audio API integration with reactive canvas visualizations.
- **Dual-Engine Brain:** Handcrafted both the Google Gemini structured JSON prompt interface and the comprehensive regex/semantic offline NLP parser supporting Hindi and English.
- **State Management & Persistence:** Built an event-driven `ActionManager` using `localStorage` caching, real CSV file generation, and Webhook dispatching.
- **User Interface:** Designed a glassmorphic dark-theme dashboard with custom CSS, audio HUD, multi-track mode switchers, and 1-click test prompts for judges.
- **Documentation & Presentation Deck:** Formulated the timed 3-minute pitch script mapped directly to the hackathon judging rubric.

---

## ⚡ 3. Key Features

| Feature | Description | Problem Track |
| :--- | :--- | :--- |
| **Hero Slide 2 Execution** | *"Spent 250 rupees on lunch and remind me to submit form on Friday"* logs ₹250 under Food, schedules the task, and speaks confirmation back. | Voice to Action |
| **Compound Multi-Intent** | Splits compound clauses using conjunctions (`and`, `aur`, `then`) to trigger up to 3 distinct actions across multiple modules at once. | Voice to Action |
| **Meeting to Action Items & MoM** | Spoken team sync is distilled into structured tasks with assignees (e.g. Rahul, Priya), deadlines, and ready-to-dispatch Minutes of Meeting email. | Voice to Action |
| **AI Viva Exam Examiner** | AI speaks technical viva questions; student speaks answer into mic; AI calculates a real-time **Score (/10)** with strengths and improvement areas. | Learning |
| **Emergency SOS Medical Triage** | Spoken distress triggers a flashing **Code Red HUD**, plays synthesized emergency sirens, logs priority triage tickets, and speaks first-aid instructions. | Real World |
| **Live Webhook & Google Sheets Sync** | Sends real HTTP POST payloads to any external Webhook URL (Google Apps Script, Discord, Make) upon action execution. | Real Action |
| **Data Export (CSV & PDF)** | Real CSV file downloads for Expenses, Tasks, and Tickets, plus a 1-click printable Executive PDF Summary. | Real Action |
| **Spacebar Walkie-Talkie Mode** | Press and hold Spacebar to talk hands-free without clicking the microphone. | Accessibility |

---

## 💡 4. Technical Decisions & Challenges

### Technical Decision 1: Pure Native Node.js & Browser APIs (Zero NPM Overhead)
- **Challenge:** In a 6-hour hackathon, complex build pipelines (Webpack, Vite, heavy npm dependencies) frequently suffer from compile errors, missing packages, or port conflicts.
- **Solution:** Built the backend using Node's standard `http`, `fs`, `path`, and `url` modules, and client-side modern ES Modules with Tailwind CSS via CDN. The application starts in **0.1 seconds** and requires **zero `npm install`**.

### Technical Decision 2: Dual-Engine Brain Architecture (Cloud LLM + Offline Semantic NLP)
- **Challenge:** Hackathon venues notoriously suffer from congested Wi-Fi, which causes cloud LLM API calls to time out or hit rate limits during the high-stakes 3-minute live judge demo.
- **Solution:** Engineered a robust local semantic rule engine (`offline-nlp.js`) that operates in `<15ms` with zero internet connection. If a Gemini API key is present and internet is available, it queries Gemini Cloud; if offline, it seamlessly falls back to local NLP. **The live demo never crashes.**

### Technical Decision 3: Synthesized Web Audio API (Zero External Asset Dependency)
- **Challenge:** Loading external `.mp3` or `.wav` sound files can fail due to pathing or network issues.
- **Solution:** Programmed pure synthetic audio waveforms using the Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`) for mic activate beeps, harmonic action chimes, emergency sirens, and victory fanfare.

### Technical Decision 4: Spacebar Push-to-Talk with Input Safeguard
- **Challenge:** Listening continuously can pick up ambient noise and false triggers in a noisy college auditorium.
- **Solution:** Implemented walkie-talkie style Spacebar push-to-talk with listeners that ignore events when typing in standard input fields.

---

## 🏁 How to Verify & Run Locally

```bash
# 1. Unzip voxaction-ai-submission.zip
# 2. Run the application:
start.bat        # On Windows (Double-click or run from terminal)
# OR
node server.js   # On macOS / Linux

# 3. Open in Google Chrome / Edge:
http://localhost:3000
```
