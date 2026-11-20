/**
 * Readout Multi-turn Gemini Chatbot
 * Supports gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite
 * with Role Personas and Firestore Conversation Persistence
 */

(function () {
  let conversationHistory = [];
  let currentModel = 'gemini-3.5-flash';
  let currentRole = 'clinical_explainer';
  let isSending = false;

  const ROLES = {
    clinical_explainer: {
      label: '🩺 Clinical Laboratory Explainer',
      badge: 'Analytical & Grounded',
      description: 'Explains test biomarkers, reference ranges, and patterns without diagnosing.'
    },
    patient_companion: {
      label: '🤝 Empathetic Patient Companion',
      badge: 'Reassuring & Gentle',
      description: 'Eases anxiety, explains lifestyle factors, and translates complex medical terms.'
    },
    clinician_prep: {
      label: '📋 Doctor Consultation Prep',
      badge: 'High-Yield Checklist',
      description: 'Formulates concise, prioritized questions for your next physician appointment.'
    },
    rapid_reader: {
      label: '⚡ Rapid Laboratory Reader',
      badge: 'Ultra-Fast Summary',
      description: 'Delivers bulleted highlights of critical flags, everyday causes, and next steps.'
    }
  };

  const MODELS = [
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', badge: 'Complex Reasoning', desc: 'Deep analytical review' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', badge: 'General Clinical', desc: 'Balanced everyday interpretation' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', badge: 'Fast Response', desc: 'Ultra-low latency' }
  ];

  function openGeminiChatModal(initialQuery = null) {
    const activeReport = (typeof window.REPORT !== 'undefined' && window.REPORT) ? window.REPORT : null;

    const modal = document.createElement('div');
    modal.className = 'gemini-chat-modal-wrapper';
    modal.style.cssText = 'display:flex;flex-direction:column;height:82vh;max-height:720px;width:100%;max-width:760px;';

    modal.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--line, #e2ded4)">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:8px;background:var(--pine, #194a43);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px">
            🤖
          </div>
          <div>
            <h3 style="margin:0;font-size:17px;font-weight:700;color:var(--ink-1, #1a1a1a)">Gemini Clinical Chatbot</h3>
            <p style="margin:0;font-size:11px;color:var(--ink-3, #777)">Multi-turn conversational assistant with role-based clinical personas</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button type="button" id="clear-chat-btn" class="btn btn-ghost btn-sm" style="font-size:11px;padding:4px 8px;border:1px solid var(--line)" title="Clear message history">🗑️ Clear Chat</button>
          <button type="button" class="btn btn-secondary btn-sm" data-close style="padding:4px 10px">✕</button>
        </div>
      </div>

      <!-- Controls: Role Selector & Model Selector -->
      <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--line, #e2ded4);flex-wrap:wrap;background:var(--surface-sunk, #faf9f6);border-radius:6px;margin:8px 0;padding:8px 12px">
        <div style="flex:1;min-width:240px">
          <label style="font-size:11px;font-weight:600;color:var(--ink-2);display:block;margin-bottom:4px">Select Chatbot Role Persona:</label>
          <select id="chat-role-select" style="width:100%;padding:6px 10px;font-size:12px;border-radius:6px;border:1px solid var(--line);background:var(--surface);cursor:pointer">
            ${Object.keys(ROLES).map(k => `<option value="${k}" ${k === currentRole ? 'selected' : ''}>${ROLES[k].label} (${ROLES[k].badge})</option>`).join('')}
          </select>
        </div>
        <div style="flex:1;min-width:260px">
          <label style="font-size:11px;font-weight:600;color:var(--ink-2);display:block;margin-bottom:4px">Gemini Model Routing:</label>
          <div style="display:flex;gap:4px" id="model-pill-group">
            ${MODELS.map(m => `
              <button type="button" data-model="${m.id}" class="model-pill ${m.id === currentModel ? 'active-model' : ''}" style="flex:1;padding:5px 6px;font-size:11px;font-weight:600;border-radius:5px;border:1px solid var(--line);background:${m.id === currentModel ? 'var(--pine, #194a43)' : 'var(--surface)'};color:${m.id === currentModel ? '#fff' : 'var(--ink-1)'};cursor:pointer;text-align:center" title="${m.desc}">
                ${m.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Role Description Bar -->
      <div id="role-info-bar" style="font-size:11px;color:var(--ink-2);padding:4px 8px;background:rgba(25,74,67,0.06);border-radius:4px;margin-bottom:8px">
        ℹ️ <strong>${ROLES[currentRole].label}:</strong> ${ROLES[currentRole].description}
      </div>

      <!-- Scrollable Message Thread -->
      <div id="gemini-chat-thread" style="flex:1;overflow-y:auto;background:var(--surface-sunk, #f4f3ef);padding:14px;border-radius:8px;border:1px solid var(--line, #e2ded4);display:flex;flex-direction:column;gap:12px;margin-bottom:8px">
        <!-- Welcome Message -->
        <div style="background:var(--surface, #fff);padding:12px 14px;border-radius:8px;border:1px solid var(--line);font-size:13px;line-height:1.5;max-width:92%;box-shadow:0 1px 3px rgba(0,0,0,0.03)">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-weight:700;color:var(--pine)">Gemini Clinical Assistant</span>
            <span class="chip chip--in" style="font-size:10px;padding:1px 6px" id="active-model-chip">${currentModel}</span>
            <span class="chip" style="font-size:10px;padding:1px 6px" id="active-role-chip">${ROLES[currentRole].badge}</span>
          </div>
          <div>Hello! I am your AI clinical discussion companion. You can ask me to explain any out-of-range lab result, compare historical trends, break down fasting factors, or prepare questions for your physician appointment.</div>
          <div style="margin-top:6px;font-size:11px;color:var(--ink-3)">🔒 Educational discussion tool only. Explanations do not constitute medical diagnosis or prescribe treatment.</div>
        </div>
      </div>

      <!-- Quick Suggested Prompts -->
      <div style="margin-bottom:8px">
        <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px" id="quick-chat-prompts">
          <button type="button" class="btn btn-ghost btn-sm" data-prompt="Why is my fasting blood glucose 113 mg/dL and how does fasting duration affect it?" style="font-size:11px;white-space:nowrap;background:var(--surface);border:1px solid var(--line)">🩸 Fasting Glucose Analysis</button>
          <button type="button" class="btn btn-ghost btn-sm" data-prompt="Explain my lipid ratios: total cholesterol 214 vs LDL 141 and HDL 44" style="font-size:11px;white-space:nowrap;background:var(--surface);border:1px solid var(--line)">🩺 Cholesterol & Lipid Ratios</button>
          <button type="button" class="btn btn-ghost btn-sm" data-prompt="Draft 3 high-priority questions I should ask my doctor about my results" style="font-size:11px;white-space:nowrap;background:var(--surface);border:1px solid var(--line)">📋 Questions for Doctor</button>
          <button type="button" class="btn btn-ghost btn-sm" data-prompt="Explain why Vitamin D at 17 ng/mL is insufficient and what foods or supplements help" style="font-size:11px;white-space:nowrap;background:var(--surface);border:1px solid var(--line)">☀️ Vitamin D Guidance</button>
        </div>
      </div>

      <!-- Input Form -->
      <form id="gemini-chat-form" style="display:flex;gap:8px">
        <input type="text" id="gemini-chat-input" placeholder="Type a message (e.g. 'Can you explain my kidney and liver markers?')..." style="flex:1;padding:10px 14px;border-radius:6px;border:1px solid var(--line);font-size:13px" required autocomplete="off">
        <button type="submit" id="gemini-chat-submit" class="btn btn-primary" style="padding:10px 18px;display:flex;align-items:center;gap:6px">
          <span>Send</span>
          <span>➤</span>
        </button>
      </form>
    `;

    const thread = modal.querySelector('#gemini-chat-thread');
    const input = modal.querySelector('#gemini-chat-input');
    const form = modal.querySelector('#gemini-chat-form');
    const submitBtn = modal.querySelector('#gemini-chat-submit');
    const roleSelect = modal.querySelector('#chat-role-select');
    const roleInfoBar = modal.querySelector('#role-info-bar');
    const clearBtn = modal.querySelector('#clear-chat-btn');
    const modelButtons = modal.querySelectorAll('[data-model]');

    // Render existing conversation history if any
    if (conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        appendMessageBubble(msg.role, msg.content, msg.model || currentModel, thread);
      });
    }

    // Role Change Listener
    roleSelect.addEventListener('change', (e) => {
      currentRole = e.target.value;
      roleInfoBar.innerHTML = `ℹ️ <strong>${ROLES[currentRole].label}:</strong> ${ROLES[currentRole].description}`;
      const roleChip = modal.querySelector('#active-role-chip');
      if (roleChip) roleChip.textContent = ROLES[currentRole].badge;
    });

    // Model Change Listener
    modelButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        currentModel = btn.getAttribute('data-model');
        modelButtons.forEach(b => {
          b.style.background = 'var(--surface)';
          b.style.color = 'var(--ink-1)';
        });
        btn.style.background = 'var(--pine, #194a43)';
        btn.style.color = '#fff';
        const modelChip = modal.querySelector('#active-model-chip');
        if (modelChip) modelChip.textContent = currentModel;
      });
    });

    // Clear Chat Listener
    clearBtn.addEventListener('click', () => {
      conversationHistory = [];
      thread.innerHTML = `
        <div style="background:var(--surface, #fff);padding:12px 14px;border-radius:8px;border:1px solid var(--line);font-size:13px;line-height:1.5;max-width:92%">
          <div style="font-weight:700;color:var(--pine);margin-bottom:4px">Conversation Cleared</div>
          <div>Chat history has been reset. How can I assist you with your laboratory reports?</div>
        </div>
      `;
    });

    // Quick Prompts
    modal.querySelectorAll('[data-prompt]').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.getAttribute('data-prompt');
        form.dispatchEvent(new Event('submit'));
      });
    });

    // Form Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || isSending) return;

      input.value = '';
      isSending = true;
      submitBtn.disabled = true;

      // Add user message to thread & history
      appendMessageBubble('user', text, null, thread);
      conversationHistory.push({ role: 'user', content: text });

      // Save user message to Firestore if logged in
      if (window.ReadoutFirebase && typeof window.ReadoutFirebase.saveChat === 'function') {
        window.ReadoutFirebase.saveChat({
          role: 'user',
          content: text,
          model: currentModel,
          rolePersona: currentRole
        });
      }

      // Add Thinking Indicator
      const thinkingBubble = document.createElement('div');
      thinkingBubble.style.cssText = 'background:var(--surface, #fff);padding:10px 14px;border-radius:8px;font-size:12px;color:var(--ink-3);align-self:flex-start;display:flex;align-items:center;gap:8px;box-shadow:0 1px 2px rgba(0,0,0,0.04)';
      thinkingBubble.innerHTML = `
        <span class="spinner" style="width:14px;height:14px;display:inline-block;border:2px solid var(--line);border-top-color:var(--pine);border-radius:50%;animation:spin 0.8s linear infinite"></span>
        <span>${currentModel} analyzing with ${ROLES[currentRole].badge}...</span>
      `;
      thread.appendChild(thinkingBubble);
      thread.scrollTop = thread.scrollHeight;

      try {
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationHistory,
            model: currentModel,
            rolePersona: currentRole,
            reportContext: activeReport
          })
        });

        thinkingBubble.remove();

        if (!response.ok) {
          throw new Error(`Server returned error ${response.status}`);
        }

        const resData = await response.json();
        const replyText = resData.data?.reply || 'I could not generate an answer at this time.';
        const modelUsed = resData.data?.modelUsed || currentModel;

        appendMessageBubble('model', replyText, modelUsed, thread);
        conversationHistory.push({ role: 'model', content: replyText, model: modelUsed });

        // Save bot response to Firestore if logged in
        if (window.ReadoutFirebase && typeof window.ReadoutFirebase.saveChat === 'function') {
          window.ReadoutFirebase.saveChat({
            role: 'model',
            content: replyText,
            model: modelUsed,
            rolePersona: currentRole
          });
        }

      } catch (err) {
        thinkingBubble.remove();
        const errBubble = document.createElement('div');
        errBubble.style.cssText = 'color:var(--clay, #b33939);font-size:12px;background:rgba(179,57,57,0.08);padding:8px 12px;border-radius:6px;align-self:flex-start';
        errBubble.textContent = `Error connecting to Gemini assistant: ${err.message}. Please retry.`;
        thread.appendChild(errBubble);
      } finally {
        isSending = false;
        submitBtn.disabled = false;
        thread.scrollTop = thread.scrollHeight;
        input.focus();
      }
    });

    if (typeof window.openModal === 'function') {
      window.openModal(modal);
    } else {
      document.body.appendChild(modal);
    }

    if (initialQuery) {
      input.value = initialQuery;
      form.dispatchEvent(new Event('submit'));
    }
  }

  function appendMessageBubble(role, content, model, container) {
    const bubble = document.createElement('div');

    if (role === 'user') {
      bubble.style.cssText = 'background:var(--pine, #194a43);color:#fff;padding:10px 14px;border-radius:8px 8px 2px 8px;font-size:13px;align-self:flex-end;max-width:85%;line-height:1.5;box-shadow:0 1px 3px rgba(0,0,0,0.06)';
      bubble.textContent = content;
    } else {
      bubble.style.cssText = 'background:var(--surface, #fff);padding:12px 14px;border-radius:8px 8px 8px 2px;border:1px solid var(--line, #e2ded4);font-size:13px;align-self:flex-start;max-width:92%;line-height:1.55;box-shadow:0 1px 3px rgba(0,0,0,0.04)';

      // Convert line breaks and markdown bullets
      const formatted = content.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<div style="height:6px"></div>';
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return `<div style="padding-left:14px;position:relative;margin:3px 0"><span style="position:absolute;left:0">•</span>${escapeHtml(trimmed.replace(/^[-•*]\s*/, ''))}</div>`;
        }
        if (/^\d+\./.test(trimmed)) {
          return `<div style="padding-left:16px;margin:4px 0"><strong>${escapeHtml(trimmed.match(/^\d+\./)[0])}</strong> ${escapeHtml(trimmed.replace(/^\d+\.\s*/, ''))}</div>`;
        }
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          return `<div style="font-weight:700;color:var(--pine);margin:8px 0 4px 0">${escapeHtml(trimmed.replace(/^#+\s*/, ''))}</div>`;
        }
        return `<div>${escapeHtml(trimmed)}</div>`;
      }).join('');

      bubble.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:11px;color:var(--ink-3)">
          <span style="font-weight:600;color:var(--pine)">Gemini Clinical Assistant (${escapeHtml(model || 'gemini-3.5-flash')})</span>
          <button type="button" class="copy-bubble-btn" style="border:0;background:none;cursor:pointer;color:var(--ink-3);font-size:11px" title="Copy response">📋 Copy</button>
        </div>
        <div style="color:var(--ink-1)">${formatted}</div>
      `;

      bubble.querySelector('.copy-bubble-btn')?.addEventListener('click', (e) => {
        navigator.clipboard.writeText(content);
        e.target.textContent = '✓ Copied!';
        setTimeout(() => { e.target.textContent = '📋 Copy'; }, 1500);
      });
    }

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Export to window
  window.GeminiChat = {
    open: openGeminiChatModal,
    getHistory: () => conversationHistory,
    clear: () => { conversationHistory = []; }
  };

})();
