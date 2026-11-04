/**
 * Offline Intelligent Semantic NLP & Multi-Intent Parsing Engine
 * Supports Executive OS, Meeting-to-Action-Items, Viva Trainer, and Emergency Triage.
 */
class OfflineNLPEngine {
  constructor() {
    this.currentVivaQuestion = null;
  }

  setVivaQuestion(q) {
    this.currentVivaQuestion = q;
  }

  // Parse natural language utterance into one or more structured actions
  parse(rawText, mode = 'executive') {
    const text = rawText.trim();
    if (!text) return { actions: [], voice_response: "I didn't catch that. Could you repeat?" };

    // Emergency Detection (Cross-cutting: applies in any mode for safety!)
    if (this.isEmergency(text)) {
      return this.parseEmergency(text);
    }

    // Viva Exam Mode
    if (mode === 'viva') {
      return this.evaluateVivaAnswer(text);
    }

    // Meeting-to-Action-Items Mode
    if (mode === 'meeting' || /^(meeting|scrum|standup|discussion)\s+/i.test(text)) {
      return this.parseMeeting(text);
    }

    // Standard Executive Mode
    const actions = [];
    const clauses = this.splitClauses(text);

    for (const clause of clauses) {
      const parsedAction = this.classifyClause(clause);
      if (parsedAction) {
        actions.push(parsedAction);
      }
    }

    if (actions.length === 0) {
      const singleAction = this.classifyClause(text);
      if (singleAction) {
        actions.push(singleAction);
      }
    }

    // Build natural conversational voice feedback
    if (actions.length > 0) {
      const parts = [];
      for (const act of actions) {
        if (act.type === 'EXPENSE') {
          parts.push(`logged ${act.data.currencySymbol || '₹'}${act.data.amount} for ${act.data.note || act.data.category}`);
        } else if (act.type === 'TASK') {
          const due = act.data.dueDate ? ` for ${act.data.dueDate}` : '';
          const time = act.data.time ? ` at ${act.data.time}` : '';
          parts.push(`reminder set: "${act.data.title}"${due}${time}`);
        } else if (act.type === 'TICKET') {
          parts.push(`created ${act.data.priority} priority ticket for ${act.data.category}`);
        } else if (act.type === 'EMAIL') {
          parts.push(`drafted email to ${act.data.recipient || 'recipient'}`);
        }
      }

      const voice_response = `Done! ${parts.join(', and ')}.`;
      return { actions, voice_response };
    }

    return {
      actions: [
        {
          type: 'TASK',
          data: {
            title: text,
            dueDate: 'Today',
            time: 'ASAP',
            priority: 'Normal'
          }
        }
      ],
      voice_response: `Noted: I created a reminder for "${text}".`
    };
  }

  // Detect Emergency / Health Crisis
  isEmergency(text) {
    const lower = text.toLowerCase();
    return /(emergency|fainted|unconscious|heart attack|chest pain|bleeding|severe pain|ambulance|shortness of breath|breathless|fire in|electric shock|asthma attack|choking)/i.test(lower);
  }

  parseEmergency(text) {
    const lower = text.toLowerCase();
    let severity = 'CRITICAL (Code Red)';
    let firstAid = 'Keep the patient calm, ensure open airway, do not give liquids if unconscious, and call 108/112 immediately.';

    if (/(chest pain|heart attack)/i.test(lower)) {
      firstAid = 'Loosen tight clothing, sit patient comfortably upright, keep calm, and dispatch medical team immediately.';
    } else if (/(fainted|unconscious)/i.test(lower)) {
      firstAid = 'Check breathing, elevate legs 12 inches if breathing, do not crowd the person.';
    } else if (/(bleeding|cut)/i.test(lower)) {
      firstAid = 'Apply firm direct pressure with a clean cloth, elevate injured area above heart level.';
    } else if (/(fire|burn)/i.test(lower)) {
      firstAid = 'Evacuate area immediately, activate campus fire alarm, cool minor burns with running cool water.';
    }

    return {
      actions: [
        {
          type: 'EMERGENCY',
          data: {
            condition: text,
            severity: severity,
            firstAid: firstAid,
            status: 'DISPATCHED',
            location: 'Campus Block (Detected from Voice)'
          }
        },
        {
          type: 'TICKET',
          data: {
            issue: `EMERGENCY ALERT: ${text}`,
            department: 'Medical & Campus Safety',
            category: 'Emergency SOS',
            priority: 'Critical',
            status: 'Open'
          }
        }
      ],
      voice_response: `Emergency alert initiated! Triage status Critical. ${firstAid} Medical staff notified.`
    };
  }

  // Meeting to Action Items & Minutes of Meeting (MoM)
  parseMeeting(text) {
    let cleaned = text.replace(/^(meeting|scrum|standup|discussion)\s*(with|regarding|about|on)?\s*:?/i, '').trim();

    // Extract Title
    let title = 'Project Sync Meeting';
    const titleMatch = cleaned.match(/^([A-Za-z0-9\s]+):/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      cleaned = cleaned.substring(titleMatch[0].length).trim();
    }

    // Split sentences into action items
    const segments = cleaned.split(/(?:\.|\band\b|\baur\b|,)\s*/i).map(s => s.trim()).filter(Boolean);
    const actionItems = [];

    segments.forEach((seg, idx) => {
      let owner = 'Team Member';
      let deadline = 'Next Sprint';

      // Detect Owner
      const nameMatch = seg.match(/(rahul|priya|aman|rohit|vikram|neha|frontend team|backend team|designer)/i);
      if (nameMatch) owner = nameMatch[0].charAt(0).toUpperCase() + nameMatch[0].slice(1);

      // Detect Deadline
      if (/friday/i.test(seg)) deadline = 'Friday';
      else if (/tomorrow|kal/i.test(seg)) deadline = 'Tomorrow';
      else if (/sunday/i.test(seg)) deadline = 'Sunday';
      else if (/wednesday/i.test(seg)) deadline = 'Wednesday';
      else if (/end of week|eow/i.test(seg)) deadline = 'End of Week';

      actionItems.push({
        id: `mom-${idx + 1}`,
        task: seg.charAt(0).toUpperCase() + seg.slice(1),
        owner: owner,
        deadline: deadline,
        status: 'Pending'
      });
    });

    const momEmailBody = `Dear Team,\n\nHere are the Minutes of Meeting (MoM) and Action Items from "${title}":\n\n` +
      actionItems.map(a => `• [${a.deadline}] ${a.owner}: ${a.task}`).join('\n') +
      `\n\nPlease reply if any clarifications are needed.\n\nGenerated by VoxAction AI`;

    return {
      actions: [
        {
          type: 'MEETING',
          data: {
            title: title,
            summary: cleaned,
            actionItems: actionItems,
            date: new Date().toLocaleDateString()
          }
        },
        {
          type: 'EMAIL',
          data: {
            recipient: 'all-team@campus.edu',
            subject: `Minutes of Meeting: ${title}`,
            body: momEmailBody
          }
        }
      ],
      voice_response: `Meeting recorded: extracted ${actionItems.length} action items and drafted Minutes of Meeting email.`
    };
  }

  // Viva & Oral Exam Response Evaluator
  evaluateVivaAnswer(answerText) {
    const q = this.currentVivaQuestion || {
      topic: 'Computer Science',
      question: 'Explain what is Dijkstra algorithm or Gradient Descent',
      keywords: ['graph', 'shortest path', 'algorithm', 'weights', 'loss', 'optimization', 'minimum', 'learning rate', 'step']
    };

    const lower = answerText.toLowerCase();
    let matchedKeywords = 0;
    const keywords = q.keywords || ['time', 'complexity', 'data', 'algorithm'];

    keywords.forEach(kw => {
      if (lower.includes(kw.toLowerCase())) matchedKeywords++;
    });

    // Scoring calculation (word count + keyword density)
    const wordCount = answerText.split(/\s+/).length;
    let score = 5.0;

    if (wordCount > 15) score += 2.0;
    if (wordCount > 35) score += 1.0;
    score += Math.min(3.0, matchedKeywords * 1.0);
    score = Math.min(10.0, Math.max(3.0, score));
    score = parseFloat(score.toFixed(1));

    let feedback = '';
    let strengths = '';
    let areasToImprove = '';

    if (score >= 8.5) {
      feedback = 'Outstanding answer! You clearly articulated the core concepts with relevant technical terminology.';
      strengths = 'Strong conceptual grasp, structured explanation, and precise keywords.';
      areasToImprove = 'Include practical edge cases or time complexity nuances.';
    } else if (score >= 6.5) {
      feedback = 'Good answer. You understand the foundational idea, but need a bit more depth on mechanics and algorithmic steps.';
      strengths = 'Good foundational understanding and relevant vocabulary.';
      areasToImprove = 'Elaborate on algorithmic steps and time/space complexity.';
    } else {
      feedback = 'Fair attempt, but your response was too brief. Try to explain step-by-step how the concept functions.';
      strengths = 'Attempted the core definition.';
      areasToImprove = 'Add technical definitions, examples, and explain real-world use cases.';
    }

    return {
      actions: [
        {
          type: 'VIVA_RESULT',
          data: {
            question: q.question,
            topic: q.topic,
            studentAnswer: answerText,
            score: score,
            feedback: feedback,
            strengths: strengths,
            areasToImprove: areasToImprove,
            timestamp: Date.now()
          }
        }
      ],
      voice_response: `You scored ${score} out of 10. ${feedback}`
    };
  }

  splitClauses(text) {
    const regex = /\s+(?:and|aur|then|also|plus|waise|tatha)\s+|;\s*/i;
    const parts = text.split(regex).map(p => p.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [text];
  }

  classifyClause(clause) {
    const lower = clause.toLowerCase();

    // 1. Expense
    if (/(spent|spend|paid|pay|kharcha|diye|rupees|rupaye|rs\.?|inr|\$|bought|cost|purchased|bill|recharge)/i.test(lower) && /\d+/.test(lower)) {
      return this.parseExpense(clause);
    }

    // 2. Ticket / Grievance
    if (/(ticket|grievance|complain|complaint|broken|damage|leak|leaking|leakage|not working|repair|shikayat|problem|kharab|fault)/i.test(lower)) {
      return this.parseTicket(clause);
    }

    // 3. Email
    if (/(email|mail|draft|send\s+an?\s+email|notify|message\s+to)/i.test(lower)) {
      return this.parseEmail(clause);
    }

    // 4. Task / Reminder
    if (/(remind|reminder|schedule|meeting|meet|call|submit|finish|assignment|exam|viva|to-?do|yaad|note down)/i.test(lower)) {
      return this.parseTask(clause);
    }

    if (/(call|visit|do|prepare|check|review|study|send)/i.test(lower)) {
      return this.parseTask(clause);
    }

    return null;
  }

  parseExpense(text) {
    const lower = text.toLowerCase();
    let amount = 0;
    const amountMatch = text.match(/(?:(?:rs\.?|inr|₹|\$|rupees|rupaye)\s*)?(\d+(?:\.\d{1,2})?)(?:\s*(?:rs\.?|inr|₹|\$|rupees|rupaye))?/i);
    if (amountMatch) amount = parseFloat(amountMatch[1]);

    let category = 'General';
    let note = 'Expense';

    if (/(lunch|dinner|breakfast|food|coffee|tea|snacks|burger|pizza|khana|chai|swiggy|zomato|canteen)/i.test(lower)) {
      category = 'Food & Dining';
      note = (lower.match(/(lunch|dinner|breakfast|coffee|tea|snacks|burger|pizza|swiggy|zomato|khana|chai)/i) || ['Food'])[0];
    } else if (/(uber|ola|auto|cab|metro|bus|petrol|fuel|ticket|travel|flight|train|ride)/i.test(lower)) {
      category = 'Travel & Transport';
      note = (lower.match(/(uber|ola|auto|cab|metro|bus|petrol|fuel|train|travel)/i) || ['Travel'])[0];
    } else if (/(book|books|notes|xerox|print|course|stationery|pen|pencil|kitab)/i.test(lower)) {
      category = 'Education & Books';
      note = (lower.match(/(books?|notes|xerox|course|stationery|printout)/i) || ['Books'])[0];
    } else if (/(bill|electricity|wifi|internet|recharge|mobile|rent)/i.test(lower)) {
      category = 'Bills & Utilities';
      note = (lower.match(/(electricity|wifi|internet|recharge|mobile|bill|rent)/i) || ['Bills'])[0];
    } else if (/(shopping|clothes|shoes|amazon|flipkart|dress)/i.test(lower)) {
      category = 'Shopping';
      note = (lower.match(/(clothes|shoes|amazon|flipkart|shopping)/i) || ['Shopping'])[0];
    } else if (/(medicine|doctor|pharmacy|hospital|tablet)/i.test(lower)) {
      category = 'Health & Medical';
      note = (lower.match(/(medicine|doctor|pharmacy|tablets?)/i) || ['Medical'])[0];
    }

    note = note.charAt(0).toUpperCase() + note.slice(1);

    return {
      type: 'EXPENSE',
      data: {
        amount: amount || 100,
        currency: 'INR',
        currencySymbol: '₹',
        category: category,
        note: note,
        date: new Date().toISOString().split('T')[0]
      }
    };
  }

  parseTask(text) {
    const lower = text.toLowerCase();
    let title = text
      .replace(/^(please\s+)?(remind\s+me\s+to|remind\s+to|schedule\s+a?\s*|set\s+a?\s*reminder\s+(for|to)|add\s+task\s+to|add\s+to\s+todo\s*:?)/i, '')
      .replace(/(kal\s+subah|yaad\s+dilana|reminder\s+laga\s+do)/gi, '')
      .trim();

    if (!title) title = text;

    let dueDate = 'Today';
    if (/(tomorrow|kal)/i.test(lower)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
    } else if (/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(lower)) {
      const dayMatch = lower.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      dueDate = dayMatch ? dayMatch[0].charAt(0).toUpperCase() + dayMatch[0].slice(1) : 'This Week';
    } else if (/(tonight|aaj)/i.test(lower)) {
      dueDate = 'Today';
    }

    let time = '12:00 PM';
    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))/i);
    if (timeMatch) {
      time = timeMatch[1].toUpperCase();
    } else if (/(morning|subah)/i.test(lower)) {
      time = '09:00 AM';
    } else if (/(afternoon|dopahar)/i.test(lower)) {
      time = '02:00 PM';
    } else if (/(evening|shaam)/i.test(lower)) {
      time = '06:00 PM';
    } else if (/(night|raat)/i.test(lower)) {
      time = '09:00 PM';
    }

    let priority = 'Normal';
    if (/(urgent|emergency|asap|critical|high priority|important|jaldi)/i.test(lower)) {
      priority = 'High';
    } else if (/(low priority|whenever|optional)/i.test(lower)) {
      priority = 'Low';
    }

    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {
      type: 'TASK',
      data: {
        title: title,
        dueDate: dueDate,
        time: time,
        priority: priority
      }
    };
  }

  parseTicket(text) {
    const lower = text.toLowerCase();
    let priority = 'Medium';
    if (/(critical|high|emergency|severe|urgent|danger|risk|jaldi)/i.test(lower)) {
      priority = 'Critical';
    } else if (/(leak|broken|fire|short circuit|flood)/i.test(lower)) {
      priority = 'High';
    } else if (/(minor|low|small)/i.test(lower)) {
      priority = 'Low';
    }

    let department = 'Campus Maintenance';
    let category = 'Infrastructure';

    if (/(wifi|internet|lan|server|pc|computer|projector|lab|network|software|login)/i.test(lower)) {
      department = 'IT & Technical Support';
      category = 'IT & Network';
    } else if (/(water|leak|tap|plumber|toilet|washroom|bathroom|pipe)/i.test(lower)) {
      department = 'Sanitation & Plumbing';
      category = 'Water / Plumbing';
    } else if (/(light|fan|ac|switch|power|electricity|generator|wire)/i.test(lower)) {
      department = 'Electrical Services';
      category = 'Electrical';
    } else if (/(hostel|mess|food|room|bed|warden|mess)/i.test(lower)) {
      department = 'Hostel Administration';
      category = 'Hostel Services';
    } else if (/(exam|attendance|marks|grade|class|faculty|timetable)/i.test(lower)) {
      department = 'Academic Affairs';
      category = 'Academic Inquiry';
    }

    return {
      type: 'TICKET',
      data: {
        issue: text.charAt(0).toUpperCase() + text.slice(1),
        department: department,
        category: category,
        priority: priority,
        status: 'Open'
      }
    };
  }

  parseEmail(text) {
    const lower = text.toLowerCase();
    let recipient = 'team@campus.edu';
    if (/(mentor|prof|professor|hod|faculty|teacher)/i.test(lower)) {
      recipient = 'faculty.advisor@campus.edu';
    } else if (/(boss|manager|client)/i.test(lower)) {
      recipient = 'manager@company.com';
    } else if (/(support|helpdesk|admin)/i.test(lower)) {
      recipient = 'support@campus.edu';
    } else if (/(rahul|priya|aman|rohit)/i.test(lower)) {
      const name = (lower.match(/(rahul|priya|aman|rohit)/i) || ['peer'])[0];
      recipient = `${name}@campus.edu`;
    }

    let subject = 'Update / Action Items';
    if (text.includes('about')) {
      subject = text.split('about')[1].trim().slice(0, 40);
    } else if (text.includes('regarding')) {
      subject = text.split('regarding')[1].trim().slice(0, 40);
    } else if (text.includes('subject')) {
      subject = text.split('subject')[1].trim().slice(0, 40);
    }

    return {
      type: 'EMAIL',
      data: {
        recipient: recipient,
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        body: `Hello,\n\nFollowing up on our recent update:\n"${text}"\n\nPlease let me know if any further details are required.\n\nBest regards,\nVoxAction AI Assistant`
      }
    };
  }
}

window.offlineNLPEngine = new OfflineNLPEngine();
