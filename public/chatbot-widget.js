// ============================================
// TT MTAL CHATBOT WİDGET
// Okul sitesine gömülecek tek dosya
// Sol alt köşede floating buton + chat penceresi
// ============================================
(function() {
  'use strict';

  // ── Config ──
  // Kendi yüklendiği adresi (Örn: Koyeb sunucu adresi) otomatik bulur
  const scriptTag = document.currentScript || document.querySelector('script[src*="chatbot-widget.js"]');
  const serverUrl = scriptTag ? new URL(scriptTag.src).origin : 'http://localhost:3000';
  const API_BASE = window.TTMTAL_CHATBOT_API || serverUrl;

  // ── Styles ──
  const WIDGET_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    #ttmtal-chatbot-widget * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* ── Floating Button ── */
    #ttmtal-chat-toggle {
      position: fixed;
      bottom: 24px;
      left: 24px;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #4f46e5, #0ea5e9);
      color: white;
      font-size: 28px;
      cursor: pointer;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 24px rgba(79, 70, 229, 0.45), 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: ttmtal-pulse-ring 3s ease-out infinite;
    }

    #ttmtal-chat-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 32px rgba(79, 70, 229, 0.55), 0 4px 12px rgba(0,0,0,0.3);
    }

    #ttmtal-chat-toggle.open {
      transform: rotate(180deg) scale(1);
      background: linear-gradient(135deg, #ef4444, #f97316);
      animation: none;
    }

    @keyframes ttmtal-pulse-ring {
      0% { box-shadow: 0 6px 24px rgba(79, 70, 229, 0.45), 0 0 0 0 rgba(79, 70, 229, 0.3); }
      50% { box-shadow: 0 6px 24px rgba(79, 70, 229, 0.45), 0 0 0 12px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 6px 24px rgba(79, 70, 229, 0.45), 0 0 0 0 rgba(79, 70, 229, 0); }
    }

    /* Notification badge */
    #ttmtal-chat-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      animation: ttmtal-badge-pop 0.3s ease-out;
    }

    @keyframes ttmtal-badge-pop {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    /* ── Chat Window ── */
    #ttmtal-chat-window {
      position: fixed;
      bottom: 100px;
      left: 24px;
      width: 380px;
      height: 550px;
      max-height: calc(100vh - 140px);
      border-radius: 20px;
      overflow: hidden;
      z-index: 99998;
      display: flex;
      flex-direction: column;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
      transform: scale(0.8) translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: bottom left;
    }

    #ttmtal-chat-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Header ── */
    .ttmtal-header {
      padding: 16px 18px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(14, 165, 233, 0.2));
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .ttmtal-header-logo {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5, #0ea5e9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
    }

    .ttmtal-header-info {
      flex: 1;
      min-width: 0;
    }

    .ttmtal-header-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ttmtal-header-status {
      font-size: 0.72rem;
      color: #a5b4fc;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }

    .ttmtal-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      animation: ttmtal-dot-pulse 2s infinite;
    }

    @keyframes ttmtal-dot-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .ttmtal-header-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      color: #94a3b8;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .ttmtal-header-close:hover {
      background: rgba(239,68,68,0.2);
      color: #fca5a5;
      border-color: rgba(239,68,68,0.3);
    }

    /* ── Messages ── */
    .ttmtal-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      scrollbar-width: thin;
      scrollbar-color: rgba(99,102,241,0.25) transparent;
    }

    .ttmtal-messages::-webkit-scrollbar { width: 5px; }
    .ttmtal-messages::-webkit-scrollbar-track { background: transparent; }
    .ttmtal-messages::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 3px; }

    /* Welcome */
    .ttmtal-welcome {
      text-align: center;
      padding: 20px 12px;
    }

    .ttmtal-welcome-emoji { font-size: 44px; margin-bottom: 10px; display: inline-block; }

    .ttmtal-welcome h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 6px;
    }

    .ttmtal-welcome p {
      font-size: 0.8rem;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .ttmtal-quick-btns {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ttmtal-quick-btn {
      padding: 10px 14px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      color: #e2e8f0;
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: inherit;
    }

    .ttmtal-quick-btn:hover {
      background: rgba(99,102,241,0.15);
      border-color: rgba(99,102,241,0.3);
      transform: translateX(4px);
    }

    .ttmtal-quick-btn .qicon { font-size: 16px; flex-shrink: 0; }

    /* Message bubbles */
    .ttmtal-msg {
      display: flex;
      gap: 10px;
      max-width: 90%;
      animation: ttmtal-msg-in 0.3s ease-out;
    }

    @keyframes ttmtal-msg-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ttmtal-msg-bot { align-self: flex-start; }
    .ttmtal-msg-user { align-self: flex-end; flex-direction: row-reverse; }

    .ttmtal-msg-avatar {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .ttmtal-msg-bot .ttmtal-msg-avatar {
      background: linear-gradient(135deg, #4f46e5, #0ea5e9);
      color: white;
    }

    .ttmtal-msg-user .ttmtal-msg-avatar {
      background: #334155;
      color: #a5b4fc;
    }

    .ttmtal-msg-bubble {
      padding: 11px 15px;
      border-radius: 14px;
      font-size: 0.82rem;
      line-height: 1.65;
    }

    .ttmtal-msg-bot .ttmtal-msg-bubble {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      color: #e2e8f0;
      border-top-left-radius: 4px;
    }

    .ttmtal-msg-user .ttmtal-msg-bubble {
      background: linear-gradient(135deg, #4f46e5, #4338ca);
      color: white;
      border-top-right-radius: 4px;
      border: none;
    }

    .ttmtal-msg-bubble p { margin-bottom: 6px; }
    .ttmtal-msg-bubble p:last-child { margin-bottom: 0; }
    .ttmtal-msg-bubble strong { color: #a5b4fc; font-weight: 600; }
    .ttmtal-msg-user .ttmtal-msg-bubble strong { color: rgba(255,255,255,0.9); }
    .ttmtal-msg-bubble ul, .ttmtal-msg-bubble ol { margin: 6px 0; padding-left: 18px; }
    .ttmtal-msg-bubble li { margin-bottom: 3px; }

    /* Typing dots */
    .ttmtal-typing {
      display: flex;
      gap: 10px;
      align-self: flex-start;
    }

    .ttmtal-typing-dots {
      padding: 14px 18px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      border-top-left-radius: 4px;
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .ttmtal-typing-dots span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #818cf8;
      animation: ttmtal-bounce 1.4s infinite ease-in-out;
    }

    .ttmtal-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .ttmtal-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes ttmtal-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* ── Input ── */
    .ttmtal-input-area {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
      background: rgba(0,0,0,0.2);
    }

    .ttmtal-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .ttmtal-input-row textarea {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 10px 14px;
      color: #f1f5f9;
      font-size: 0.85rem;
      font-family: inherit;
      resize: none;
      height: 42px;
      max-height: 100px;
      outline: none;
      transition: border-color 0.2s;
      line-height: 1.4;
    }

    .ttmtal-input-row textarea:focus {
      border-color: #6366f1;
    }

    .ttmtal-input-row textarea::placeholder {
      color: #64748b;
    }

    .ttmtal-send-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .ttmtal-send-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #6366f1, #818cf8);
      transform: scale(1.05);
    }

    .ttmtal-send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .ttmtal-footer {
      text-align: center;
      padding: 6px 0;
      font-size: 0.65rem;
      color: #475569;
    }

    .ttmtal-footer a { color: #6366f1; text-decoration: none; }

    /* ── Mobile ── */
    @media (max-width: 480px) {
      #ttmtal-chat-window {
        width: calc(100vw - 16px);
        height: calc(100vh - 100px);
        max-height: calc(100vh - 100px);
        left: 8px;
        right: 8px;
        bottom: 90px;
        border-radius: 16px;
      }

      #ttmtal-chat-toggle {
        bottom: 16px;
        left: 16px;
        width: 56px;
        height: 56px;
      }
    }
  `;

  // ── Create Widget ──
  function createWidget() {
    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.id = 'ttmtal-chatbot-styles';
    styleEl.textContent = WIDGET_CSS;
    document.head.appendChild(styleEl);

    // Container
    const container = document.createElement('div');
    container.id = 'ttmtal-chatbot-widget';

    // Toggle Button
    container.innerHTML = `
      <button id="ttmtal-chat-toggle" title="Okul Chatbot">
        <span id="ttmtal-toggle-icon">💬</span>
        <span id="ttmtal-chat-badge" style="display:none">1</span>
      </button>

      <div id="ttmtal-chat-window">
        <div class="ttmtal-header">
          <div class="ttmtal-header-logo">TT</div>
          <div class="ttmtal-header-info">
            <div class="ttmtal-header-title">TT MTAL Asistanı</div>
            <div class="ttmtal-header-status">
              <span class="ttmtal-status-dot"></span>
              <span>AI Asistan • Çevrimiçi</span>
            </div>
          </div>
          <button class="ttmtal-header-close" id="ttmtal-close-btn" title="Kapat">✕</button>
        </div>

        <div class="ttmtal-messages" id="ttmtal-messages">
          <div class="ttmtal-welcome" id="ttmtal-welcome">
            <div class="ttmtal-welcome-emoji">🎓</div>
            <h3>Merhaba!</h3>
            <p>Pendik TT MTAL hakkında her şeyi sorun. Size yardımcı olmak için buradayım!</p>
            <div class="ttmtal-quick-btns" id="ttmtal-quick-btns">
              <button class="ttmtal-quick-btn" data-q="Okul hakkında genel bilgi verir misin?">
                <span class="qicon">🏫</span> Okul Hakkında
              </button>
              <button class="ttmtal-quick-btn" data-q="Hangi bölümler var ve taban puanları nedir?">
                <span class="qicon">📚</span> Bölümler & Puanlar
              </button>
              <button class="ttmtal-quick-btn" data-q="Okulun iletişim bilgileri ve adresi nedir?">
                <span class="qicon">📍</span> İletişim Bilgileri
              </button>
              <button class="ttmtal-quick-btn" data-q="Son haberler ve etkinlikler nelerdir?">
                <span class="qicon">📰</span> Haberler & Etkinlikler
              </button>
            </div>
          </div>
        </div>

        <div class="ttmtal-input-area">
          <div class="ttmtal-input-row">
            <textarea id="ttmtal-input" placeholder="Sorunuzu yazın..." rows="1"></textarea>
            <button class="ttmtal-send-btn" id="ttmtal-send" title="Gönder">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="ttmtal-footer">
            Yapay zeka destekli · <a href="https://turktelekomatl.meb.k12.tr" target="_blank">turktelekomatl.meb.k12.tr</a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // ── Event Listeners ──
    const toggle = document.getElementById('ttmtal-chat-toggle');
    const chatWindow = document.getElementById('ttmtal-chat-window');
    const closeBtn = document.getElementById('ttmtal-close-btn');
    const input = document.getElementById('ttmtal-input');
    const sendBtn = document.getElementById('ttmtal-send');
    const messages = document.getElementById('ttmtal-messages');
    const welcome = document.getElementById('ttmtal-welcome');
    const quickBtns = document.getElementById('ttmtal-quick-btns');
    const toggleIcon = document.getElementById('ttmtal-toggle-icon');
    const badge = document.getElementById('ttmtal-chat-badge');

    let isOpen = false;
    let isProcessing = false;
    let history = [];

    // Toggle chat
    function toggleChat() {
      isOpen = !isOpen;
      chatWindow.classList.toggle('open', isOpen);
      toggle.classList.toggle('open', isOpen);
      toggleIcon.textContent = isOpen ? '✕' : '💬';
      if (isOpen) {
        badge.style.display = 'none';
        input.focus();
      }
    }

    toggle.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Quick buttons
    quickBtns.addEventListener('click', (e) => {
      const btn = e.target.closest('.ttmtal-quick-btn');
      if (btn) sendMessage(btn.dataset.q);
    });

    // Send button
    sendBtn.addEventListener('click', () => {
      const msg = input.value.trim();
      if (msg) sendMessage(msg);
    });

    // Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const msg = input.value.trim();
        if (msg) sendMessage(msg);
      }
    });

    // Auto-resize
    input.addEventListener('input', () => {
      input.style.height = '42px';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });

    // ── Send Message ──
    async function sendMessage(text) {
      if (isProcessing || !text.trim()) return;
      isProcessing = true;
      sendBtn.disabled = true;

      // Hide welcome
      if (welcome) welcome.style.display = 'none';

      // Add user message
      addMsg('user', text);
      input.value = '';
      input.style.height = '42px';

      // Typing indicator
      const typing = showTyping();

      try {
        const res = await fetch(API_BASE + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: history.slice(-10)
          })
        });

        const data = await res.json();

        removeTyping(typing);

        if (res.ok && data.reply) {
          addMsg('bot', data.reply);
          history.push({ role: 'user', content: text });
          history.push({ role: 'assistant', content: data.reply });
        } else {
          addMsg('bot', '⚠️ ' + (data.error || 'Bir hata oluştu, tekrar deneyin.'));
        }
      } catch (err) {
        console.error('TT MTAL Chatbot Error:', err);
        removeTyping(typing);
        addMsg('bot', '⚠️ Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
      } finally {
        isProcessing = false;
        sendBtn.disabled = false;
        input.focus();
      }
    }

    // ── Add Message ──
    function addMsg(role, content) {
      const div = document.createElement('div');
      div.className = `ttmtal-msg ttmtal-msg-${role}`;

      const avatar = role === 'bot' ? '🤖' : '👤';
      const formatted = role === 'bot' ? formatMsg(content) : escHtml(content);

      div.innerHTML = `
        <div class="ttmtal-msg-avatar">${avatar}</div>
        <div class="ttmtal-msg-bubble">${formatted}</div>
      `;

      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;

      // If chat is closed, show badge
      if (!isOpen && role === 'bot') {
        badge.style.display = 'flex';
      }
    }

    // ── Format Message ──
    function formatMsg(text) {
      let f = escHtml(text);
      f = f.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      f = f.replace(/^[\-•]\s+(.+)$/gm, '<li>$1</li>');
      f = f.replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`);
      f = f.replace(/\n\n/g, '</p><p>');
      f = f.replace(/\n/g, '<br>');
      return `<p>${f}</p>`.replace(/<p>\s*<\/p>/g, '');
    }

    function escHtml(t) {
      const d = document.createElement('div');
      d.textContent = t;
      return d.innerHTML;
    }

    // ── Typing ──
    function showTyping() {
      const div = document.createElement('div');
      div.className = 'ttmtal-typing';
      div.innerHTML = `
        <div class="ttmtal-msg-avatar" style="background:linear-gradient(135deg,#4f46e5,#0ea5e9);color:white;">🤖</div>
        <div class="ttmtal-typing-dots"><span></span><span></span><span></span></div>
      `;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function removeTyping(el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
