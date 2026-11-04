/**
 * AI Brain - LLM Intent Parser & Action Planner
 * Supports Google Gemini API with seamless fallback to Offline NLP Engine.
 */
class AIBrain {
  constructor() {
    this.apiKey = localStorage.getItem('voxaction_gemini_api_key') || '';
    this.model = localStorage.getItem('voxaction_gemini_model') || 'gemini-1.5-flash';
    this.useCloudLLM = !!this.apiKey;
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem('voxaction_gemini_api_key', this.apiKey);
      this.useCloudLLM = true;
    } else {
      localStorage.removeItem('voxaction_gemini_api_key');
      this.useCloudLLM = false;
    }
  }

  setModel(model) {
    this.model = model;
    localStorage.setItem('voxaction_gemini_model', model);
  }

  async processIntent(transcript, language = 'en-IN', mode = 'executive') {
    const startTime = performance.now();

    // If cloud LLM is active and API key exists, call Gemini
    if (this.useCloudLLM && this.apiKey) {
      try {
        const result = await this.callGeminiAPI(transcript, language, mode);
        const latency = Math.round(performance.now() - startTime);
        return {
          ...result,
          engine: `Google Gemini (${this.model})`,
          latencyMs: latency
        };
      } catch (err) {
        console.warn('Gemini API call failed, falling back to Offline NLP:', err);
      }
    }

    // High-speed Offline Intelligent Rule Parser
    const fallbackResult = window.offlineNLPEngine.parse(transcript, mode);
    const latency = Math.round(performance.now() - startTime);
    return {
      ...fallbackResult,
      engine: 'Smart Offline NLP Engine',
      latencyMs: latency
    };
  }

  async callGeminiAPI(transcript, language, mode = 'executive') {
    const systemPrompt = `You are the brain of VoxAction AI, an autonomous Voice-to-Action operating system.
Your job is to analyze the user's spoken voice command in mode: "${mode}".
Extract the REAL ACTIONS to execute.

Available action types:
1. "EXPENSE": amount, currency, currencySymbol, category, note, date
2. "TASK": title, dueDate, time, priority
3. "TICKET": issue, department, category, priority ("Critical"|"High"|"Medium"|"Low"), status ("Open")
4. "EMAIL": recipient, subject, body
5. "MEETING": title, summary, actionItems: [ { task, owner, deadline } ]
6. "VIVA_RESULT": question, topic, studentAnswer, score (out of 10), feedback, strengths, areasToImprove
7. "EMERGENCY": condition, severity, firstAid, status ("DISPATCHED"), location

Output MUST be strictly valid JSON matching this schema:
{
  "actions": [
    {
      "type": "EXPENSE" | "TASK" | "TICKET" | "EMAIL" | "MEETING" | "VIVA_RESULT" | "EMERGENCY",
      "data": { ... }
    }
  ],
  "voice_response": string // Natural, concise one-sentence spoken confirmation
}

Respond ONLY with valid JSON. Do not enclose in markdown code fences.`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nCurrent Mode: ${mode}\nSpoken language: ${language}\nSpoken command: "${transcript}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    };

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('No candidate content returned by Gemini');
    }

    let cleaned = candidate.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

    return JSON.parse(cleaned.trim());
  }
}

window.aiBrain = new AIBrain();
