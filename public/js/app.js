/**
 * Main Application Orchestrator v2.0
 * Connects Voice In -> AI Intent -> Real Action -> Voice Out
 * Across Executive OS, Meeting-to-Action-Items, Viva Trainer, and Emergency Triage.
 */
document.addEventListener('DOMContentLoaded', () => {
  let activeMode = 'executive';

  // Elements
  const micBtn = document.getElementById('micBtn');
  const micStatusText = document.getElementById('micStatusText');
  const orbContainer = document.getElementById('orbContainer');
  const transcriptDisplay = document.getElementById('transcriptDisplay');
  const textInput = document.getElementById('textInput');
  const sendTextBtn = document.getElementById('sendTextBtn');
  const langSelect = document.getElementById('langSelect');
  const speakBanner = document.getElementById('speakBanner');
  const speakBannerText = document.getElementById('speakBannerText');
  const stopSpeakBtn = document.getElementById('stopSpeakBtn');
  const emergencyBanner = document.getElementById('emergencyAlertBanner');
  const emergencyText = document.getElementById('emergencyText');
  const emergencyGuidance = document.getElementById('emergencyGuidance');

  // Mode Buttons
  const modeButtons = document.querySelectorAll('.mode-btn');

  // Nav tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Stats
  const statExpenses = document.getElementById('statExpenses');
  const statTasks = document.getElementById('statTasks');
  const statTickets = document.getElementById('statTickets');
  const statActions = document.getElementById('statActions');
  const brainModeBadge = document.getElementById('brainModeBadge');
  const webhookBadge = document.getElementById('webhookBadge');

  // Settings
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const geminiKeyInput = document.getElementById('geminiKeyInput');
  const geminiModelSelect = document.getElementById('geminiModelSelect');
  const webhookInput = document.getElementById('webhookInput');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const testKeyBtn = document.getElementById('testKeyBtn');
  const testWebhookBtn = document.getElementById('testWebhookBtn');
  const keyStatusMsg = document.getElementById('keyStatusMsg');
  const webhookStatusMsg = document.getElementById('webhookStatusMsg');
  const printReportBtn = document.getElementById('printReportBtn');

  // Viva Elements
  const askNewVivaQuestionBtn = document.getElementById('askNewVivaQuestionBtn');
  const currentVivaQuestionText = document.getElementById('currentVivaQuestionText');
  const vivaTopicTag = document.getElementById('vivaTopicTag');
  const quickMeetingDemoBtn = document.getElementById('quickMeetingDemoBtn');

  // Sample Viva Questions Bank
  const vivaQuestions = [
    {
      topic: 'Data Structures & Algorithms',
      question: 'What is Dijkstra\'s shortest path algorithm, how does it work with priority queues, and what is its time complexity?',
      keywords: ['shortest path', 'graph', 'priority queue', 'weights', 'dijkstra', 'log v', 'complexity', 'distance']
    },
    {
      topic: 'Database Management (DBMS)',
      question: 'Explain ACID properties in relational database management systems and why isolation is critical.',
      keywords: ['atomicity', 'consistency', 'isolation', 'durability', 'transaction', 'rollback', 'concurrency']
    },
    {
      topic: 'Machine Learning & AI',
      question: 'What is Gradient Descent, how does learning rate affect optimization, and what happens if learning rate is too large?',
      keywords: ['gradient', 'descent', 'learning rate', 'loss', 'minimum', 'overshoot', 'converge', 'optimization']
    },
    {
      topic: 'Operating Systems',
      question: 'Explain what is a Deadlock and the four Coffman conditions required for deadlock to occur.',
      keywords: ['deadlock', 'mutual exclusion', 'hold and wait', 'no preemption', 'circular wait', 'process', 'resource']
    }
  ];

  let currentVivaIndex = 0;

  // Mode Switcher
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => {
        b.classList.remove('active', 'border-white/10', 'text-gray-200');
        b.classList.add('border-white/5', 'text-gray-400');
      });
      btn.classList.add('active', 'border-white/10', 'text-gray-200');
      btn.classList.remove('border-white/5', 'text-gray-400');

      activeMode = btn.getAttribute('data-mode');

      // Auto-switch to relevant tab for best visual impact
      if (activeMode === 'meeting') switchTab('tab-meetings');
      else if (activeMode === 'viva') switchTab('tab-viva');
      else if (activeMode === 'executive') switchTab('tab-overview');
    });
  });

  // Switch Tab Helper
  function switchTab(tabId) {
    tabButtons.forEach(b => {
      b.classList.remove('active');
      if (b.getAttribute('data-tab') === tabId) b.classList.add('active');
    });
    tabPanels.forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');
    if (tabId === 'tab-expenses') renderExpenseChart();
  }

  // Language Init
  if (langSelect) {
    window.voiceEngine.setLanguage(langSelect.value);
    langSelect.addEventListener('change', (e) => {
      window.voiceEngine.setLanguage(e.target.value);
    });
  }

  // Update Brain Badge & Webhook Badge
  function updateBadges() {
    if (window.aiBrain.useCloudLLM && window.aiBrain.apiKey) {
      brainModeBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Cloud LLM (${window.aiBrain.model})`;
      brainModeBadge.className = 'badge-emerald px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer';
    } else {
      brainModeBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-cyan-400"></span> Offline Smart NLP (Zero Latency)`;
      brainModeBadge.className = 'badge-cyan px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer';
    }

    if (window.actionManager.webhookUrl) {
      webhookBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Webhook Active`;
      webhookBadge.className = 'badge-emerald px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer';
    } else {
      webhookBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Webhook Sync`;
      webhookBadge.className = 'badge-purple px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer';
    }
  }
  updateBadges();

  brainModeBadge.addEventListener('click', () => settingsModal.classList.remove('hidden'));
  webhookBadge.addEventListener('click', () => settingsModal.classList.remove('hidden'));

  // Settings Handlers
  openSettingsBtn.addEventListener('click', () => {
    geminiKeyInput.value = window.aiBrain.apiKey || '';
    geminiModelSelect.value = window.aiBrain.model || 'gemini-1.5-flash';
    webhookInput.value = window.actionManager.webhookUrl || '';
    settingsModal.classList.remove('hidden');
  });

  closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

  saveSettingsBtn.addEventListener('click', () => {
    window.aiBrain.setApiKey(geminiKeyInput.value.trim());
    window.aiBrain.setModel(geminiModelSelect.value);
    window.actionManager.setWebhookUrl(webhookInput.value.trim());
    updateBadges();
    settingsModal.classList.add('hidden');
  });

  clearDataBtn.addEventListener('click', () => {
    if (confirm('Clear all stored data?')) {
      window.actionManager.clearAll();
      emergencyBanner.classList.add('hidden');
      settingsModal.classList.add('hidden');
    }
  });

  // Print Executive Report
  if (printReportBtn) {
    printReportBtn.addEventListener('click', () => window.actionManager.printExecutiveReport());
  }

  // Test Gemini Key
  if (testKeyBtn) {
    testKeyBtn.addEventListener('click', async () => {
      const key = geminiKeyInput.value.trim();
      if (!key) {
        keyStatusMsg.textContent = 'Please enter an API key first.';
        keyStatusMsg.className = 'text-xs text-rose-400 mt-1';
        return;
      }
      keyStatusMsg.textContent = 'Testing connection...';
      keyStatusMsg.className = 'text-xs text-amber-400 mt-1';
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
        });
        if (res.ok) {
          keyStatusMsg.textContent = '✓ API Key is valid and active!';
          keyStatusMsg.className = 'text-xs text-emerald-400 mt-1';
        } else {
          keyStatusMsg.textContent = `✗ Failed: HTTP ${res.status}`;
          keyStatusMsg.className = 'text-xs text-rose-400 mt-1';
        }
      } catch (e) {
        keyStatusMsg.textContent = `✗ Connection error: ${e.message}`;
        keyStatusMsg.className = 'text-xs text-rose-400 mt-1';
      }
    });
  }

  // Test Webhook
  if (testWebhookBtn) {
    testWebhookBtn.addEventListener('click', async () => {
      const url = webhookInput.value.trim();
      if (!url) {
        webhookStatusMsg.textContent = 'Please enter a webhook URL.';
        webhookStatusMsg.className = 'text-xs text-rose-400 mt-1';
        return;
      }
      webhookStatusMsg.textContent = 'Sending ping...';
      webhookStatusMsg.className = 'text-xs text-amber-400 mt-1';
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'PING_TEST', source: 'VoxAction AI', time: new Date().toISOString() }),
          mode: 'no-cors' // Allows test pings to third party webhooks without CORS failure
        });
        webhookStatusMsg.textContent = '✓ Webhook ping sent!';
        webhookStatusMsg.className = 'text-xs text-emerald-400 mt-1';
      } catch (e) {
        webhookStatusMsg.textContent = `✗ Webhook error: ${e.message}`;
        webhookStatusMsg.className = 'text-xs text-rose-400 mt-1';
      }
    });
  }

  // Voice Engine State Listener
  window.voiceEngine.onStateChange = (state) => {
    orbContainer.classList.remove('orb-listening', 'orb-processing', 'orb-speaking');
    if (state === 'listening') {
      orbContainer.classList.add('orb-listening');
      micStatusText.textContent = 'Listening... Speak now!';
      micBtn.classList.add('bg-rose-600', 'border-rose-400');
      micBtn.classList.remove('bg-cyan-600', 'border-cyan-400');
    } else if (state === 'processing') {
      orbContainer.classList.add('orb-processing');
      micStatusText.textContent = 'Understanding intent with AI...';
    } else if (state === 'speaking') {
      orbContainer.classList.add('orb-speaking');
      micStatusText.textContent = 'Speaking response...';
    } else {
      micStatusText.textContent = 'Tap Mic or Hold Spacebar to Speak';
      micBtn.classList.remove('bg-rose-600', 'border-rose-400');
      micBtn.classList.add('bg-cyan-600', 'border-cyan-400');
    }
  };

  // Live Transcript Stream
  window.voiceEngine.onTranscriptUpdate = (finalText, interimText) => {
    transcriptDisplay.innerHTML = `
      <span class="text-white">${finalText}</span>
      <span class="text-cyan-400 italic">${interimText}</span>
    `;
  };

  // Final Speech Result Dispatcher
  window.voiceEngine.onFinalResult = (transcript) => {
    processSpokenInput(transcript);
  };

  // Mic Button Click
  micBtn.addEventListener('click', () => {
    window.voiceEngine.toggleListening();
  });

  // Text Fallback Submit
  function handleTextSubmit() {
    const text = textInput.value.trim();
    if (!text) return;
    textInput.value = '';
    processSpokenInput(text);
  }
  sendTextBtn.addEventListener('click', handleTextSubmit);
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleTextSubmit();
  });

  // Quick Demo Pills
  document.querySelectorAll('.demo-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const prompt = pill.getAttribute('data-prompt');
      const targetMode = pill.getAttribute('data-mode') || 'executive';

      // Set mode
      activeMode = targetMode;
      modeButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-mode') === targetMode);
      });

      transcriptDisplay.innerHTML = `<span class="text-cyan-300">"${prompt}"</span>`;
      processSpokenInput(prompt);
    });
  });

  // Viva AI Question Button
  function setupCurrentVivaQuestion(idx) {
    const q = vivaQuestions[idx];
    currentVivaQuestionText.textContent = `"${q.question}"`;
    vivaTopicTag.textContent = q.topic;
    window.offlineNLPEngine.setVivaQuestion(q);
  }
  setupCurrentVivaQuestion(currentVivaIndex);

  if (askNewVivaQuestionBtn) {
    askNewVivaQuestionBtn.addEventListener('click', () => {
      currentVivaIndex = (currentVivaIndex + 1) % vivaQuestions.length;
      setupCurrentVivaQuestion(currentVivaIndex);
      const q = vivaQuestions[currentVivaIndex];

      activeMode = 'viva';
      modeButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'viva'));
      switchTab('tab-viva');

      // AI speaks the viva question!
      window.speechSynthesizer.speak(`Here is your viva question on ${q.topic}: ${q.question}`);
    });
  }

  // Quick Meeting Simulation
  if (quickMeetingDemoBtn) {
    quickMeetingDemoBtn.addEventListener('click', () => {
      const sample = 'Meeting with Hackathon Team: Rahul will finish the voice engine by 4 PM, Priya will test live demo prompts by 5 PM, and notify faculty advisor.';
      activeMode = 'meeting';
      modeButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'meeting'));
      switchTab('tab-meetings');
      processSpokenInput(sample);
    });
  }

  // Speech Synthesizer UI Callbacks
  window.speechSynthesizer.onStartCallback = (spokenText) => {
    speakBanner.classList.remove('hidden');
    speakBannerText.textContent = spokenText;
    orbContainer.classList.remove('orb-listening', 'orb-processing');
    orbContainer.classList.add('orb-speaking');
  };

  window.speechSynthesizer.onEndCallback = () => {
    speakBanner.classList.add('hidden');
    orbContainer.classList.remove('orb-speaking');
    micStatusText.textContent = 'Tap Mic or Hold Spacebar to Speak';
  };

  stopSpeakBtn.addEventListener('click', () => {
    window.speechSynthesizer.stop();
  });

  // Core Processing Pipeline
  async function processSpokenInput(transcript) {
    if (!transcript) return;

    window.voiceEngine.onStateChange('processing');
    transcriptDisplay.innerHTML = `<span class="text-white font-medium">"${transcript}"</span>`;

    try {
      const selectedLang = langSelect ? langSelect.value : 'en-IN';
      const parsedResult = await window.aiBrain.processIntent(transcript, selectedLang, activeMode);

      console.log('AI Processed Result:', parsedResult);

      const executedItems = [];
      let hasEmergency = false;

      if (parsedResult.actions && parsedResult.actions.length > 0) {
        for (const action of parsedResult.actions) {
          if (action.type === 'EMERGENCY') {
            hasEmergency = true;
            emergencyBanner.classList.remove('hidden');
            emergencyText.textContent = `Condition: ${action.data.condition}`;
            emergencyGuidance.textContent = action.data.firstAid;
            switchTab('tab-tickets');
          }
          const executed = window.actionManager.executeAction(action);
          if (executed) executedItems.push(executed);
        }
      }

      // If viva result, switch to viva tab
      if (parsedResult.actions?.some(a => a.type === 'VIVA_RESULT')) {
        switchTab('tab-viva');
      }

      // If meeting result, switch to meeting tab
      if (parsedResult.actions?.some(a => a.type === 'MEETING')) {
        switchTab('tab-meetings');
      }

      // Log to Audit History
      window.actionManager.logExecution({
        transcript: transcript,
        actions: parsedResult.actions || [],
        voice_response: parsedResult.voice_response || 'Actions processed.',
        engine: parsedResult.engine || 'Smart NLP',
        latencyMs: parsedResult.latencyMs || 20
      });

      // Voice Out: Speak confirmation back
      if (parsedResult.voice_response) {
        window.voiceEngine.onStateChange('speaking');
        window.speechSynthesizer.speak(parsedResult.voice_response, selectedLang);
      } else {
        window.voiceEngine.onStateChange('idle');
      }

    } catch (err) {
      console.error('Processing error:', err);
      window.voiceEngine.onStateChange('idle');
      alert('Could not parse voice command: ' + err.message);
    }
  }

  // Tab Navigation
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      switchTab(tabTarget);
    });
  });

  // Render All UI Views from State
  function renderUI(state) {
    const stats = window.actionManager.getStats();

    statExpenses.textContent = `₹${stats.totalSpent.toLocaleString()}`;
    statTasks.textContent = `${stats.pendingTasks} Pending`;
    statTickets.textContent = `${stats.openTickets} Open`;
    statActions.textContent = `${stats.totalActions} Executed`;

    renderOverviewFeed(state);
    renderExpenses(state);
    renderTasks(state);
    renderTickets(state);
    renderMeetings(state);
    renderViva(state);
    renderEmails(state);
    renderLogs(state);
  }

  // 1. Overview Feed
  function renderOverviewFeed(state) {
    const feedContainer = document.getElementById('overviewFeed');
    if (!feedContainer) return;

    const allItems = [
      ...state.expenses.map(x => ({ ...x, _type: 'EXPENSE' })),
      ...state.tasks.map(x => ({ ...x, _type: 'TASK' })),
      ...state.tickets.map(x => ({ ...x, _type: 'TICKET' })),
      ...(state.meetings || []).map(x => ({ ...x, _type: 'MEETING' })),
      ...(state.vivaSessions || []).map(x => ({ ...x, _type: 'VIVA_RESULT' })),
      ...state.emails.map(x => ({ ...x, _type: 'EMAIL' }))
    ].sort((a, b) => b.timestamp - a.timestamp);

    if (allItems.length === 0) {
      feedContainer.innerHTML = `<div class="p-8 text-center text-gray-500">No actions executed yet. Speak or tap a demo prompt above!</div>`;
      return;
    }

    feedContainer.innerHTML = allItems.slice(0, 10).map(item => {
      if (item._type === 'EXPENSE') {
        return `
          <div class="glass-panel p-4 flex items-center justify-between border-l-4 border-emerald-500 action-card-enter">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">₹</div>
              <div>
                <div class="font-semibold text-gray-100">${item.note}</div>
                <div class="text-xs text-gray-400">${item.category} • ${item.date}</div>
              </div>
            </div>
            <div class="text-right">
              <span class="font-bold text-emerald-400 text-lg">₹${item.amount}</span>
              <span class="block text-[10px] text-gray-500 uppercase tracking-wider">Logged</span>
            </div>
          </div>
        `;
      } else if (item._type === 'TASK') {
        return `
          <div class="glass-panel p-4 flex items-center justify-between border-l-4 ${item.completed ? 'border-gray-500 opacity-60' : 'border-cyan-500'} action-card-enter">
            <div class="flex items-center gap-3">
              <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="window.actionManager.toggleTask('${item.id}')" class="w-5 h-5 rounded accent-cyan-500 cursor-pointer">
              <div>
                <div class="font-semibold text-gray-100 ${item.completed ? 'line-through text-gray-400' : ''}">${item.title}</div>
                <div class="text-xs text-gray-400">Due: <span class="text-cyan-300">${item.dueDate} at ${item.time}</span></div>
              </div>
            </div>
            <div>
              <span class="badge-${item.priority === 'High' ? 'rose' : 'cyan'} px-2 py-0.5 rounded text-xs font-medium">${item.priority}</span>
            </div>
          </div>
        `;
      } else if (item._type === 'TICKET') {
        return `
          <div class="glass-panel p-4 flex items-center justify-between border-l-4 border-rose-500 action-card-enter">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">🎫</div>
              <div>
                <div class="font-semibold text-gray-100">${item.issue}</div>
                <div class="text-xs text-gray-400">${item.ticketNo} • ${item.department}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge-rose px-2 py-0.5 rounded text-xs">${item.priority}</span>
              <button onclick="window.actionManager.cycleTicketStatus('${item.id}')" class="badge-amber px-2 py-0.5 rounded text-xs hover:opacity-80">${item.status}</button>
            </div>
          </div>
        `;
      } else if (item._type === 'MEETING') {
        return `
          <div class="glass-panel p-4 flex items-center justify-between border-l-4 border-blue-500 action-card-enter">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">🎙️</div>
              <div>
                <div class="font-semibold text-gray-100">${item.title}</div>
                <div class="text-xs text-gray-400">${item.actionItems.length} Action Items Extracted</div>
              </div>
            </div>
            <button onclick="window.actionManager.openMailClient('em-1')" class="px-3 py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-xs transition">View MoM</button>
          </div>
        `;
      } else if (item._type === 'VIVA_RESULT') {
        return `
          <div class="glass-panel p-4 flex items-center justify-between border-l-4 border-amber-500 action-card-enter">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">🎓</div>
              <div>
                <div class="font-semibold text-gray-100">Oral Viva Evaluated: ${item.topic}</div>
                <div class="text-xs text-gray-400">${item.feedback}</div>
              </div>
            </div>
            <div class="text-right">
              <span class="font-bold text-amber-400 text-lg">${item.score}/10</span>
              <span class="block text-[10px] text-gray-500 uppercase tracking-wider">Score</span>
            </div>
          </div>
        `;
      } else if (item._type === 'EMAIL') {
        return `
          <div class="glass-panel p-4 flex items-center justify-between border-l-4 border-purple-500 action-card-enter">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">✉️</div>
              <div>
                <div class="font-semibold text-gray-100">${item.subject}</div>
                <div class="text-xs text-gray-400">To: ${item.recipient}</div>
              </div>
            </div>
            <button onclick="window.actionManager.openMailClient('${item.id}')" class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded text-xs transition">Open Mail</button>
          </div>
        `;
      }
    }).join('');
  }

  // 2. Expenses View & Chart
  function renderExpenses(state) {
    const list = document.getElementById('expenseList');
    if (!list) return;

    if (state.expenses.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-gray-500">No expenses recorded yet.</div>`;
      return;
    }

    list.innerHTML = state.expenses.map(e => `
      <div class="glass-panel p-3.5 flex items-center justify-between glass-panel-hover">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-semibold text-sm">₹</div>
          <div>
            <div class="font-medium text-gray-100">${e.note}</div>
            <div class="text-xs text-gray-400">${e.category} • ${e.date}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-bold text-emerald-400 text-base">₹${e.amount}</span>
          <button onclick="window.actionManager.deleteItem('expenses', '${e.id}')" class="text-gray-500 hover:text-rose-400 text-sm transition">✕</button>
        </div>
      </div>
    `).join('');

    renderExpenseChart();
  }

  function renderExpenseChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stats = window.actionManager.getStats();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const categories = Object.keys(stats.categories);
    if (categories.length === 0 || stats.totalSpent === 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No expense data yet', canvas.width / 2, canvas.height / 2);
      return;
    }

    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 15;
    const innerRadius = radius * 0.58;

    let startAngle = -0.5 * Math.PI;

    categories.forEach((cat, idx) => {
      const sliceAngle = (stats.categories[cat] / stats.totalSpent) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = colors[idx % colors.length];
      ctx.fill();

      startAngle = endAngle;
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`₹${stats.totalSpent}`, centerX, centerY - 8);
    ctx.font = '10px Inter';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('TOTAL SPENT', centerX, centerY + 12);
  }

  // 3. Tasks View
  function renderTasks(state) {
    const list = document.getElementById('taskList');
    if (!list) return;

    if (state.tasks.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-gray-500">No active tasks or reminders.</div>`;
      return;
    }

    list.innerHTML = state.tasks.map(t => `
      <div class="glass-panel p-3.5 flex items-center justify-between glass-panel-hover ${t.completed ? 'opacity-50' : ''}">
        <div class="flex items-center gap-3">
          <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="window.actionManager.toggleTask('${t.id}')" class="w-5 h-5 rounded accent-cyan-500 cursor-pointer">
          <div>
            <div class="font-medium text-gray-100 ${t.completed ? 'line-through text-gray-400' : ''}">${t.title}</div>
            <div class="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
              <span>📅 ${t.dueDate}</span>
              <span>⏰ ${t.time}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge-${t.priority === 'High' ? 'rose' : 'cyan'} px-2 py-0.5 rounded text-xs font-semibold">${t.priority}</span>
          <button onclick="window.actionManager.deleteItem('tasks', '${t.id}')" class="text-gray-500 hover:text-rose-400 text-sm transition">✕</button>
        </div>
      </div>
    `).join('');
  }

  // 4. Tickets View
  function renderTickets(state) {
    const list = document.getElementById('ticketList');
    if (!list) return;

    if (state.tickets.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-gray-500">No grievance or support tickets filed.</div>`;
      return;
    }

    list.innerHTML = state.tickets.map(tk => `
      <div class="glass-panel p-4 glass-panel-hover">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-cyan-400 font-bold text-sm">${tk.ticketNo}</span>
              <span class="badge-${tk.priority === 'Critical' ? 'rose' : 'amber'} px-2 py-0.2 rounded text-[11px] font-semibold">${tk.priority}</span>
              <span class="text-xs text-gray-400">• ${tk.department}</span>
            </div>
            <div class="font-medium text-gray-100 mt-1">${tk.issue}</div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.actionManager.cycleTicketStatus('${tk.id}')" class="px-2.5 py-1 text-xs rounded font-medium ${tk.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'} transition">
              ${tk.status} ▾
            </button>
            <button onclick="window.actionManager.deleteItem('tickets', '${tk.id}')" class="text-gray-500 hover:text-rose-400 text-sm ml-2">✕</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 5. Meetings View
  function renderMeetings(state) {
    const list = document.getElementById('meetingList');
    if (!list) return;

    const meetings = state.meetings || [];
    if (meetings.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-gray-500">No meetings recorded yet. Click 'Simulate Meeting Recording' above!</div>`;
      return;
    }

    list.innerHTML = meetings.map(m => `
      <div class="glass-panel p-5 space-y-3 border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-white text-base">${m.title}</h4>
            <div class="text-xs text-gray-400">${m.date}</div>
          </div>
          <button onclick="window.actionManager.deleteItem('meetings', '${m.id}')" class="text-gray-500 hover:text-rose-400 text-sm">✕</button>
        </div>
        <p class="text-xs text-gray-300">${m.summary}</p>
        <div class="space-y-1.5 pt-2 border-t border-white/5">
          <div class="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Extracted Action Items:</div>
          ${m.actionItems.map(a => `
            <div class="flex items-center justify-between p-2 rounded bg-slate-900/50 text-xs">
              <span class="text-gray-200">📌 <strong>${a.owner}:</strong> ${a.task}</span>
              <span class="badge-cyan px-2 py-0.5 rounded text-[10px]">${a.deadline}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // 6. Viva View
  function renderViva(state) {
    const list = document.getElementById('vivaList');
    if (!list) return;

    const sessions = state.vivaSessions || [];
    if (sessions.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-gray-500">No viva exam attempts recorded yet. Click 'AI Ask Question' above!</div>`;
      return;
    }

    list.innerHTML = sessions.map(s => `
      <div class="glass-panel p-5 space-y-3 border-l-4 border-amber-500">
        <div class="flex items-center justify-between">
          <div>
            <span class="badge-amber px-2 py-0.5 rounded text-[11px] font-semibold">${s.topic}</span>
            <h4 class="font-bold text-white text-sm mt-1">${s.question}</h4>
          </div>
          <div class="text-right">
            <span class="text-2xl font-black text-amber-400">${s.score}</span>
            <span class="text-xs text-gray-400">/10</span>
          </div>
        </div>
        <div class="bg-black/30 p-3 rounded text-xs text-gray-300 italic border border-white/5">
          <strong>Student Spoken Answer:</strong> "${s.studentAnswer}"
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
            <strong>✓ Strengths:</strong> ${s.strengths || s.feedback}
          </div>
          <div class="p-2.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-300">
            <strong>⚠ To Improve:</strong> ${s.areasToImprove || 'Add depth and time complexity.'}
          </div>
        </div>
      </div>
    `).join('');
  }

  // 7. Emails View
  function renderEmails(state) {
    const list = document.getElementById('emailList');
    if (!list) return;

    if (state.emails.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-gray-500">No emails or memos drafted.</div>`;
      return;
    }

    list.innerHTML = state.emails.map(em => `
      <div class="glass-panel p-4 glass-panel-hover space-y-2">
        <div class="flex items-center justify-between">
          <div class="font-semibold text-gray-100">${em.subject}</div>
          <div class="flex items-center gap-2">
            <button onclick="window.actionManager.openMailClient('${em.id}')" class="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition flex items-center gap-1">
              📤 Open in Mail Client
            </button>
            <button onclick="window.actionManager.deleteItem('emails', '${em.id}')" class="text-gray-500 hover:text-rose-400 text-sm">✕</button>
          </div>
        </div>
        <div class="text-xs text-gray-400">To: <span class="text-purple-300 font-mono">${em.recipient}</span></div>
        <div class="bg-black/30 p-3 rounded text-xs text-gray-300 whitespace-pre-line font-mono border border-white/5">${em.body}</div>
      </div>
    `).join('');
  }

  // 8. Audit Logs View
  function renderLogs(state) {
    const list = document.getElementById('logList');
    if (!list) return;

    if (state.logs.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-gray-500">Audit trail is empty. Execute a command to see JSON payloads!</div>`;
      return;
    }

    list.innerHTML = state.logs.map(log => `
      <div class="glass-panel p-4 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="badge-cyan px-2 py-0.5 rounded font-mono">${log.engine}</span>
            <span class="text-emerald-400 font-mono">${log.latencyMs}ms</span>
          </div>
          <div class="text-gray-500">${new Date(log.timestamp).toLocaleTimeString()}</div>
        </div>
        <div class="text-sm font-medium text-white">Voice In: <span class="text-cyan-300">"${log.transcript}"</span></div>
        <div class="text-xs text-gray-300">Voice Out: <span class="text-emerald-300">"${log.voice_response}"</span></div>
        <details class="text-xs text-gray-400">
          <summary class="cursor-pointer text-cyan-400 hover:underline">View Raw Structured Actions JSON</summary>
          <pre class="bg-black/50 p-2.5 rounded mt-1.5 text-[11px] overflow-x-auto text-cyan-200 font-mono border border-white/5">${JSON.stringify(log.actions, null, 2)}</pre>
        </details>
      </div>
    `).join('');
  }

  // Subscribe to actionManager updates
  window.actionManager.onChange(renderUI);

  // Initial draw
  renderUI(window.actionManager.state);
  window.voiceEngine.drawIdleWaveform();

  // Export Buttons
  document.getElementById('exportExpensesCsvBtn')?.addEventListener('click', () => window.actionManager.exportToCSV('expenses'));
  document.getElementById('exportTasksCsvBtn')?.addEventListener('click', () => window.actionManager.exportToCSV('tasks'));
  document.getElementById('exportTicketsCsvBtn')?.addEventListener('click', () => window.actionManager.exportToCSV('tickets'));
  document.getElementById('exportFullJsonBtn')?.addEventListener('click', () => window.actionManager.exportAllJSON());
});
