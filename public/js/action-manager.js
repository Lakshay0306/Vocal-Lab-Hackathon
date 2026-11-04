/**
 * Action Manager - Real State & Action Execution Controller
 * Implements Ground Rule 02: "The app must do something: create, update, send, or control."
 * Supports Executive OS, Meetings, Viva Scoring, Emergency Triage, and Live Webhook Sync.
 */
class ActionManager {
  constructor() {
    this.storageKey = 'voxaction_state_v2';
    this.webhookUrl = localStorage.getItem('voxaction_webhook_url') || '';
    this.state = this.loadState();
    this.listeners = [];
  }

  setWebhookUrl(url) {
    this.webhookUrl = url.trim();
    if (this.webhookUrl) {
      localStorage.setItem('voxaction_webhook_url', this.webhookUrl);
    } else {
      localStorage.removeItem('voxaction_webhook_url');
    }
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved state:', e);
      }
    }
    // Default initial seed state with realistic examples
    return {
      expenses: [
        {
          id: 'exp-1',
          amount: 250,
          currency: 'INR',
          currencySymbol: '₹',
          category: 'Food & Dining',
          note: 'Campus Canteen Lunch',
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now() - 3600000
        },
        {
          id: 'exp-2',
          amount: 120,
          currency: 'INR',
          currencySymbol: '₹',
          category: 'Travel & Transport',
          note: 'Metro Card Recharge',
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now() - 7200000
        }
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Submit Voice AI Hackathon submission form',
          dueDate: 'Friday',
          time: '05:00 PM',
          priority: 'High',
          completed: false,
          timestamp: Date.now() - 1800000
        },
        {
          id: 'task-2',
          title: 'Review project architecture slides',
          dueDate: 'Today',
          time: '02:00 PM',
          priority: 'Normal',
          completed: true,
          timestamp: Date.now() - 5400000
        }
      ],
      tickets: [
        {
          id: 'tkt-1',
          ticketNo: 'TK-1084',
          issue: 'Wi-Fi connectivity dropped in Computer Lab 3',
          department: 'IT & Technical Support',
          category: 'IT & Network',
          priority: 'High',
          status: 'In Progress',
          timestamp: Date.now() - 10800000
        }
      ],
      emails: [
        {
          id: 'em-1',
          recipient: 'mentor@campus.edu',
          subject: 'Voice AI Hackathon Project Progress',
          body: 'Hello Mentor,\n\nWe have successfully implemented the 4-step pipeline: Voice In -> AI Intent -> Real Action -> Voice Out.\n\nAll live tests are passing.\n\nBest regards,\nVoxAction Team',
          timestamp: Date.now() - 14400000
        }
      ],
      meetings: [
        {
          id: 'meet-1',
          title: 'Hackathon Sprint Sync',
          summary: 'Discussed project architecture and division of presentation tasks.',
          actionItems: [
            { id: 'm-1', task: 'Build voice visualizer and audio waveforms', owner: 'Rahul', deadline: 'Today', status: 'Completed' },
            { id: 'm-2', task: 'Finalize 3-minute pitch deck for judges', owner: 'Priya', deadline: 'Today', status: 'Pending' }
          ],
          date: new Date().toLocaleDateString(),
          timestamp: Date.now() - 9000000
        }
      ],
      vivaSessions: [
        {
          id: 'viva-1',
          topic: 'Data Structures & Algorithms',
          question: 'What is Dijkstra\'s shortest path algorithm and what is its time complexity?',
          studentAnswer: 'Dijkstra finds the shortest path in a weighted graph using a priority queue with time complexity O((V+E) log V).',
          score: 9.0,
          feedback: 'Accurate and concise! Mentioned priority queue and exact asymptotic complexity.',
          strengths: 'Concise complexity bounds and data structure choice.',
          areasToImprove: 'Mention handling of negative edge weights.',
          timestamp: Date.now() - 12000000
        }
      ],
      emergencies: [],
      logs: []
    };
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.notifyListeners();
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // Execute an action parsed by the AI
  executeAction(action) {
    const id = 'act-' + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    // Trigger Webhook if configured
    this.dispatchWebhook(action);

    switch (action.type) {
      case 'EXPENSE': {
        const item = {
          id: id,
          amount: Number(action.data.amount) || 0,
          currency: action.data.currency || 'INR',
          currencySymbol: action.data.currencySymbol || '₹',
          category: action.data.category || 'General',
          note: action.data.note || 'Expense',
          date: action.data.date || new Date().toISOString().split('T')[0],
          timestamp: now
        };
        this.state.expenses.unshift(item);
        if (window.soundEffects) window.soundEffects.playActionChime();
        this.saveState();
        return { type: 'EXPENSE', item };
      }

      case 'TASK': {
        const item = {
          id: id,
          title: action.data.title || 'Untitled Task',
          dueDate: action.data.dueDate || 'Today',
          time: action.data.time || '12:00 PM',
          priority: action.data.priority || 'Normal',
          completed: false,
          timestamp: now
        };
        this.state.tasks.unshift(item);
        if (window.soundEffects) window.soundEffects.playActionChime();
        this.saveState();
        return { type: 'TASK', item };
      }

      case 'TICKET': {
        const ticketCount = this.state.tickets.length + 101;
        const item = {
          id: id,
          ticketNo: `TK-${ticketCount}`,
          issue: action.data.issue || 'Reported Issue',
          department: action.data.department || 'Campus Maintenance',
          category: action.data.category || 'Infrastructure',
          priority: action.data.priority || 'Medium',
          status: 'Open',
          timestamp: now
        };
        this.state.tickets.unshift(item);
        if (window.soundEffects) window.soundEffects.playTicketAlert();
        this.saveState();
        return { type: 'TICKET', item };
      }

      case 'EMAIL': {
        const item = {
          id: id,
          recipient: action.data.recipient || 'team@campus.edu',
          subject: action.data.subject || 'Action Update',
          body: action.data.body || 'Auto-generated notification from VoxAction AI.',
          timestamp: now
        };
        this.state.emails.unshift(item);
        if (window.soundEffects) window.soundEffects.playActionChime();
        this.saveState();
        return { type: 'EMAIL', item };
      }

      case 'MEETING': {
        const item = {
          id: id,
          title: action.data.title || 'Meeting Minutes',
          summary: action.data.summary || 'Team discussion summary.',
          actionItems: action.data.actionItems || [],
          date: action.data.date || new Date().toLocaleDateString(),
          timestamp: now
        };
        if (!this.state.meetings) this.state.meetings = [];
        this.state.meetings.unshift(item);
        if (window.soundEffects) window.soundEffects.playActionChime();
        this.saveState();
        return { type: 'MEETING', item };
      }

      case 'VIVA_RESULT': {
        const item = {
          id: id,
          topic: action.data.topic || 'General Viva',
          question: action.data.question || 'Viva Question',
          studentAnswer: action.data.studentAnswer || '',
          score: action.data.score || 7.0,
          feedback: action.data.feedback || '',
          strengths: action.data.strengths || '',
          areasToImprove: action.data.areasToImprove || '',
          timestamp: now
        };
        if (!this.state.vivaSessions) this.state.vivaSessions = [];
        this.state.vivaSessions.unshift(item);
        if (window.soundEffects) window.soundEffects.playVivaScore();
        this.saveState();
        return { type: 'VIVA_RESULT', item };
      }

      case 'EMERGENCY': {
        const item = {
          id: id,
          condition: action.data.condition || 'Emergency Condition Reported',
          severity: action.data.severity || 'CRITICAL (Code Red)',
          firstAid: action.data.firstAid || 'Keep patient calm and call emergency helpline 108/112.',
          status: 'DISPATCHED',
          location: action.data.location || 'Campus (Detected from Voice)',
          timestamp: now
        };
        if (!this.state.emergencies) this.state.emergencies = [];
        this.state.emergencies.unshift(item);
        if (window.soundEffects) window.soundEffects.playEmergencySiren();
        this.saveState();
        return { type: 'EMERGENCY', item };
      }

      default:
        console.warn('Unknown action type:', action.type);
        return null;
    }
  }

  // Real Webhook Dispatcher (Google Sheets / Discord / Slack / Webhook.site)
  async dispatchWebhook(action) {
    if (!this.webhookUrl) return;
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'VoxAction AI',
          event: 'ACTION_EXECUTED',
          timestamp: new Date().toISOString(),
          action: action
        })
      });
      console.log('✓ Webhook successfully dispatched to:', this.webhookUrl);
    } catch (err) {
      console.warn('Webhook dispatch failed:', err.message);
    }
  }

  // Record an audit log entry
  logExecution(entry) {
    this.state.logs.unshift({
      id: 'log-' + Date.now(),
      timestamp: Date.now(),
      ...entry
    });
    if (this.state.logs.length > 50) {
      this.state.logs = this.state.logs.slice(0, 50);
    }
    this.saveState();
  }

  // Delete an item
  deleteItem(collection, id) {
    if (this.state[collection]) {
      this.state[collection] = this.state[collection].filter(x => x.id !== id);
      this.saveState();
    }
  }

  // Toggle Task Completion
  toggleTask(id) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        if (window.soundEffects) window.soundEffects.playSuccess();
        if (typeof confetti === 'function') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      }
      this.saveState();
    }
  }

  // Toggle Ticket Status
  cycleTicketStatus(id) {
    const ticket = this.state.tickets.find(t => t.id === id);
    if (ticket) {
      if (ticket.status === 'Open') ticket.status = 'In Progress';
      else if (ticket.status === 'In Progress') ticket.status = 'Resolved';
      else ticket.status = 'Open';
      this.saveState();
    }
  }

  // Open Real Mail Client
  openMailClient(id) {
    const email = this.state.emails.find(e => e.id === id);
    if (email) {
      const mailtoUrl = `mailto:${encodeURIComponent(email.recipient)}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
      window.location.href = mailtoUrl;
    }
  }

  // Export Expenses or Tasks to CSV (Real File Download)
  exportToCSV(type) {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `voxaction_${type}_${Date.now()}.csv`;

    if (type === 'expenses') {
      csvContent += 'ID,Category,Amount,Currency,Note,Date,Timestamp\n';
      this.state.expenses.forEach(e => {
        csvContent += `"${e.id}","${e.category}",${e.amount},"${e.currency}","${e.note.replace(/"/g, '""')}","${e.date}","${new Date(e.timestamp).toISOString()}"\n`;
      });
    } else if (type === 'tasks') {
      csvContent += 'ID,Title,Due Date,Time,Priority,Completed,Timestamp\n';
      this.state.tasks.forEach(t => {
        csvContent += `"${t.id}","${t.title.replace(/"/g, '""')}","${t.dueDate}","${t.time}","${t.priority}",${t.completed},"${new Date(t.timestamp).toISOString()}"\n`;
      });
    } else if (type === 'tickets') {
      csvContent += 'Ticket ID,Department,Category,Priority,Status,Issue,Timestamp\n';
      this.state.tickets.forEach(tk => {
        csvContent += `"${tk.ticketNo}","${tk.department}","${tk.category}","${tk.priority}","${tk.status}","${tk.issue.replace(/"/g, '""')}","${new Date(tk.timestamp).toISOString()}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export Full System State as JSON
  exportAllJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `voxaction_full_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Printable Executive PDF Summary
  printExecutiveReport() {
    const stats = this.getStats();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VoxAction AI — Executive Summary Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #111; }
          h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .stat-box { border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #f8fafc; }
          .stat-val { font-size: 24px; font-weight: bold; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
          th { background: #f1f5f9; }
          .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>VoxAction AI — Executive Summary Report</h1>
        <p>Generated on: ${new Date().toLocaleString()} • Voice AI Hackathon 2026</p>
        
        <div class="stats-grid">
          <div class="stat-box"><div>Total Spent</div><div class="stat-val">₹${stats.totalSpent}</div></div>
          <div class="stat-box"><div>Pending Tasks</div><div class="stat-val">${stats.pendingTasks}</div></div>
          <div class="stat-box"><div>Open Tickets</div><div class="stat-val">${stats.openTickets}</div></div>
          <div class="stat-box"><div>Total Actions</div><div class="stat-val">${stats.totalActions}</div></div>
        </div>

        <h2>Financial Expenses Ledger</h2>
        <table>
          <tr><th>Category</th><th>Amount</th><th>Note</th><th>Date</th></tr>
          ${this.state.expenses.map(e => `<tr><td>${e.category}</td><td>₹${e.amount}</td><td>${e.note}</td><td>${e.date}</td></tr>`).join('')}
        </table>

        <h2>Tasks & Reminders</h2>
        <table>
          <tr><th>Title</th><th>Due Date</th><th>Time</th><th>Priority</th><th>Status</th></tr>
          ${this.state.tasks.map(t => `<tr><td>${t.title}</td><td>${t.dueDate}</td><td>${t.time}</td><td>${t.priority}</td><td>${t.completed ? 'Done' : 'Pending'}</td></tr>`).join('')}
        </table>

        <h2>Campus & Grievance Tickets</h2>
        <table>
          <tr><th>Ticket No</th><th>Department</th><th>Issue</th><th>Priority</th><th>Status</th></tr>
          ${this.state.tickets.map(tk => `<tr><td>${tk.ticketNo}</td><td>${tk.department}</td><td>${tk.issue}</td><td>${tk.priority}</td><td>${tk.status}</td></tr>`).join('')}
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  }

  // Clear All
  clearAll() {
    this.state = {
      expenses: [],
      tasks: [],
      tickets: [],
      emails: [],
      meetings: [],
      vivaSessions: [],
      emergencies: [],
      logs: []
    };
    this.saveState();
  }

  getStats() {
    const totalSpent = this.state.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const pendingTasks = this.state.tasks.filter(t => !t.completed).length;
    const completedTasks = this.state.tasks.filter(t => t.completed).length;
    const openTickets = this.state.tickets.filter(t => t.status !== 'Resolved').length;

    const categories = {};
    this.state.expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
    });

    return {
      totalSpent,
      pendingTasks,
      completedTasks,
      openTickets,
      categories,
      totalActions: this.state.expenses.length + this.state.tasks.length + this.state.tickets.length + this.state.emails.length + (this.state.meetings ? this.state.meetings.length : 0) + (this.state.vivaSessions ? this.state.vivaSessions.length : 0) + (this.state.emergencies ? this.state.emergencies.length : 0)
    };
  }
}

window.actionManager = new ActionManager();
