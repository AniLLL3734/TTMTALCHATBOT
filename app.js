// ============================================
// PENDIK TÜRK TELEKOM MTAL - AI CHATBOT
// Frontend App - Local Sunucu Bağlantısı v4
// ============================================

// Sunucu URL'si (Geliştirme için localhost, prod için gerçek URL)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? `http://${window.location.host}/api/chat`
  : '/api/chat';

// ── DOM Elements ──
const chatArea = document.getElementById('chat-area');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const welcomeCard = document.getElementById('welcome-card');
const quickQuestions = document.getElementById('quick-questions');
const btnClear = document.getElementById('btn-clear');
const btnInfo = document.getElementById('btn-info');
const errorToast = document.getElementById('error-toast');

// ── State ──
let conversationHistory = [];
let isProcessing = false;

// ── Initialize ──
function init() {
  // Quick question buttons
  if (quickQuestions) {
    quickQuestions.addEventListener('click', (e) => {
      const btn = e.target.closest('.quick-btn');
      if (btn) {
        const question = btn.dataset.question;
        sendMessage(question);
      }
    });
  }

  // Send button
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const msg = chatInput.value.trim();
      if (msg) sendMessage(msg);
    });
  }

  // Enter key (Shift+Enter for new line)
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (msg) sendMessage(msg);
      }
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
      chatInput.style.height = '44px';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
  }

  // Clear chat
  if (btnClear) btnClear.addEventListener('click', clearChat);

  // Info button
  if (btnInfo) btnInfo.addEventListener('click', showInfo);

  // Focus input
  if (chatInput) chatInput.focus();
}

// ── Send Message ──
async function sendMessage(text) {
  if (isProcessing || !text.trim()) return;
  isProcessing = true;
  if (sendBtn) sendBtn.disabled = true;

  // Hide welcome card
  if (welcomeCard) welcomeCard.style.display = 'none';

  // Add user message
  appendMessage('user', text);
  chatInput.value = '';
  chatInput.style.height = '44px';

  // Add to conversation history
  conversationHistory.push({ role: 'user', content: text });

  // Show typing indicator
  const typingEl = showTypingIndicator();

  try {
    // ⚠️ KRİTİK DEĞİŞİKLİK: Doğrudan Groq yerine KENDİ Sunucumuza istek atıyoruz.
    // Bu sayede API Key ifşası engelleniyor ve akıllı veritabanı taraması çalışıyor.
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: conversationHistory.slice(-6) // Son 6 mesaj bağlam için
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || \`API Hatası: \${response.status}\`);
    }

    const botReply = data.reply || 'Yanıt üretilemedi.';

    // Remove typing indicator
    removeTypingIndicator(typingEl);

    // Add bot message
    appendMessage('bot', botReply);

    // Add to conversation history
    conversationHistory.push({ role: 'assistant', content: botReply });

  } catch (error) {
    console.error('Chat Error:', error);
    removeTypingIndicator(typingEl);
    
    let errorMsg = 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.';
    if (error.message.includes('Çok hızlı')) {
      errorMsg = error.message; // Sunucudan gelen rate limit mesajını göster
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMsg = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    }
    
    appendMessage('bot', \`⚠️ \${errorMsg}\`);
    showError(errorMsg);
  } finally {
    isProcessing = false;
    if (sendBtn) sendBtn.disabled = false;
    chatInput.focus();
  }
}

// ── Append Message to Chat ──
function appendMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = \`message message-\${role}\`;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const avatarContent = role === 'bot' ? '🎓' : '👤'; // Bot emojisini şapka yaptık
  const formattedContent = role === 'bot' ? formatBotMessage(content) : escapeHtml(content);

  messageDiv.innerHTML = \`
    <div class="message-avatar">\${avatarContent}</div>
    <div>
      <div class="message-content">\${formattedContent}</div>
      <div class="message-time">\${timeStr}</div>
    </div>
  \`;

  chatArea.appendChild(messageDiv);
  scrollToBottom();
}

// ── Format Bot Message (Markdown-like) ──
function formatBotMessage(text) {
  let formatted = escapeHtml(text);

  // Bold: **text**
  formatted = formatted.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
  
  // Bullet points
  formatted = formatted.replace(/^[\\-•]\\s+(.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\\/li>\\n?)+/gs, (match) => \`<ul>\${match}</ul>\`);

  // Headers: ### text
  formatted = formatted.replace(/^###\\s+(.+)$/gm, '<strong style="font-size:1em;color:#a5b4fc;display:block;margin:8px 0 4px;">$1</strong>');
  formatted = formatted.replace(/^##\\s+(.+)$/gm, '<strong style="font-size:1.05em;color:#818cf8;display:block;margin:10px 0 4px;">$1</strong>');

  // Line breaks
  formatted = formatted.replace(/\\n\\n/g, '</p><p>');
  formatted = formatted.replace(/\\n/g, '<br>');

  formatted = \`<p>\${formatted}</p>\`;
  formatted = formatted.replace(/<p>\\s*<\\/p>/g, '');

  return formatted;
}

// ── Escape HTML ──
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Typing Indicator ──
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = \`
    <div class="message-avatar" style="background: linear-gradient(135deg, var(--primary-600), var(--accent-500)); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3);">🤖</div>
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
  \`;
  chatArea.appendChild(typingDiv);
  scrollToBottom();
  return typingDiv;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

// ── Scroll to Bottom ──
function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}

// ── Clear Chat ──
function clearChat() {
  conversationHistory = [];
  const messages = chatArea.querySelectorAll('.message, .typing-indicator');
  messages.forEach(m => m.remove());

  if (welcomeCard) welcomeCard.style.display = '';
  chatInput.value = '';
  chatInput.style.height = '44px';
  chatInput.focus();
}

// ── Show Info ──
function showInfo() {
  const infoExists = document.getElementById('info-message');
  if (infoExists) return;

  if (welcomeCard) welcomeCard.style.display = 'none';

  appendMessage('bot', \`ℹ️ **TT MTAL Chatbot Hakkında**

Bu chatbot, **Pendik Türk Telekom Şehit Murat Mertel Mesleki ve Teknik Anadolu Lisesi** hakkında bilgi sağlamak amacıyla geliştirilmiştir. Veriler arka planda okul sitesinden otomatik güncellenmektedir.

- 🤖 **Yapay Zeka:** Groq LLM API (Llama 3.3)
- 📊 **Veri Kaynağı:** turktelekomatl.meb.k12.tr
- 🔒 **Güvenlik:** Arka plan sunucu mimarisi korumalıdır.

Okulumuz hakkında her türlü sorunuzu sorabilirsiniz!\`);
}

// ── Show Error Toast ──
function showError(msg) {
  if (!errorToast) return;
  errorToast.textContent = msg;
  errorToast.classList.add('show');
  setTimeout(() => {
    errorToast.classList.remove('show');
  }, 4000);
}

// ── Start App ──
document.addEventListener('DOMContentLoaded', init);
