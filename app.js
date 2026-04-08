// ============================================
// PENDIK TÜRK TELEKOM MTAL - AI CHATBOT
// Groq API Integration + Chat Engine
// ============================================

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

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

// ── System Prompt ──
const SYSTEM_PROMPT = `Sen, Pendik Türk Telekom Şehit Murat Mertel Mesleki ve Teknik Anadolu Lisesi'nin resmi yapay zeka asistanısın. Adın "TT MTAL Asistanı".

GÖREV:
- Okul hakkında sorulan her türlü soruyu aşağıdaki bilgi tabanını kullanarak doğru ve detaylı şekilde yanıtla.
- Yanıtlarını Türkçe ver.
- Kibar, samimi ve profesyonel bir dil kullan.
- Bilgi tabanında bulunmayan konularda "Bu konuda elimde bilgi bulunmuyor, daha fazla bilgi için okul idaresi ile iletişime geçmenizi öneriyorum. Telefon: (216) 379 0410" şeklinde yönlendir.
- Yanıtlarını düzenli ve okunabilir şekilde formatla (madde işaretleri, başlıklar vb. kullan).
- Okul dışı konularda (siyaset, din tartışmaları vb.) yanıt verme, nazikçe konuyu okula yönlendir.

BİLGİ TABANI:
${getSchoolContext()}

ÖNEMLİ KURALLAR:
1. Sadece yukarıdaki bilgi tabanındaki verilere dayanarak cevap ver.
2. Bilmediğin bir şey sorulursa "Bu konuda elimde detaylı bilgi yok" de ve okul yönetimini yönlendir.
3. Her zaman yardımsever ve pozitif ol.
4. Cevaplarını çok uzun tutma, öz ve anlaşılır ol.
5. Gerektiğinde emoji kullanarak cevaplarını zenginleştir.`;

// ── Initialize ──
function init() {
  // Quick question buttons
  quickQuestions.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-btn');
    if (btn) {
      const question = btn.dataset.question;
      sendMessage(question);
    }
  });

  // Send button
  sendBtn.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) sendMessage(msg);
  });

  // Enter key (Shift+Enter for new line)
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

  // Clear chat
  btnClear.addEventListener('click', clearChat);

  // Info button
  btnInfo.addEventListener('click', showInfo);

  // Focus input
  chatInput.focus();
}

// ── Send Message ──
async function sendMessage(text) {
  if (isProcessing || !text.trim()) return;
  isProcessing = true;
  sendBtn.disabled = true;

  // Hide welcome card
  if (welcomeCard) {
    welcomeCard.style.display = 'none';
  }

  // Add user message
  appendMessage('user', text);
  chatInput.value = '';
  chatInput.style.height = '44px';

  // Add to conversation history
  conversationHistory.push({ role: 'user', content: text });

  // Show typing indicator
  const typingEl = showTypingIndicator();

  try {
    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10) // Last 10 messages for context
    ];

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API hatası: ${response.status}`);
    }

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content || 'Üzgünüm, yanıt üretilirken bir sorun oluştu.';

    // Remove typing indicator
    removeTypingIndicator(typingEl);

    // Add bot message
    appendMessage('bot', botReply);

    // Add to conversation history
    conversationHistory.push({ role: 'assistant', content: botReply });

  } catch (error) {
    console.error('Groq API Error:', error);
    removeTypingIndicator(typingEl);
    
    let errorMsg = 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.';
    if (error.message.includes('401')) {
      errorMsg = 'API anahtarı geçersiz. Lütfen yönetici ile iletişime geçin.';
    } else if (error.message.includes('429')) {
      errorMsg = 'Çok fazla istek gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin.';
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMsg = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    }
    
    appendMessage('bot', `⚠️ ${errorMsg}`);
    showError(errorMsg);
  } finally {
    isProcessing = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// ── Append Message to Chat ──
function appendMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${role}`;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const avatarContent = role === 'bot' ? '🤖' : '👤';
  const formattedContent = role === 'bot' ? formatBotMessage(content) : escapeHtml(content);

  messageDiv.innerHTML = `
    <div class="message-avatar">${avatarContent}</div>
    <div>
      <div class="message-content">${formattedContent}</div>
      <div class="message-time">${timeStr}</div>
    </div>
  `;

  chatArea.appendChild(messageDiv);
  scrollToBottom();
}

// ── Format Bot Message (Markdown-like) ──
function formatBotMessage(text) {
  // Escape HTML first
  let formatted = escapeHtml(text);

  // Bold: **text** or __text__
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Bullet points: lines starting with - or •
  formatted = formatted.replace(/^[\-•]\s+(.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);

  // Numbered lists: lines starting with 1. 2. etc
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Headers: ### text
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<strong style="font-size:1em;color:#a5b4fc;display:block;margin:8px 0 4px;">$1</strong>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<strong style="font-size:1.05em;color:#818cf8;display:block;margin:10px 0 4px;">$1</strong>');

  // Code inline: `text`
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Line breaks
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = formatted.replace(/\n/g, '<br>');

  // Wrap in paragraph
  formatted = `<p>${formatted}</p>`;

  // Clean up empty paragraphs
  formatted = formatted.replace(/<p>\s*<\/p>/g, '');

  // Emojis: ensure they render properly
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
  typingDiv.innerHTML = `
    <div class="message-avatar" style="background: linear-gradient(135deg, var(--primary-600), var(--accent-500)); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3);">🤖</div>
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
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
  
  // Remove all messages and typing indicators
  const messages = chatArea.querySelectorAll('.message, .typing-indicator');
  messages.forEach(m => m.remove());

  // Show welcome card
  if (welcomeCard) {
    welcomeCard.style.display = '';
  }

  chatInput.value = '';
  chatInput.style.height = '44px';
  chatInput.focus();
}

// ── Show Info ──
function showInfo() {
  const infoExists = document.getElementById('info-message');
  if (infoExists) return;

  if (welcomeCard) {
    welcomeCard.style.display = 'none';
  }

  appendMessage('bot', `ℹ️ **TT MTAL Chatbot Hakkında**

Bu chatbot, **Pendik Türk Telekom Şehit Murat Mertel Mesleki ve Teknik Anadolu Lisesi** hakkında bilgi sağlamak amacıyla geliştirilmiştir.

- 🤖 **Yapay Zeka:** Groq LLM API (Llama 3.3)
- 📊 **Veri Kaynağı:** turktelekomatl.meb.k12.tr
- 🔄 **Son Güncelleme:** Nisan 2026

Okulumuz hakkında her türlü sorunuzu sorabilirsiniz!`);
}

// ── Show Error Toast ──
function showError(msg) {
  errorToast.textContent = msg;
  errorToast.classList.add('show');
  setTimeout(() => {
    errorToast.classList.remove('show');
  }, 4000);
}

// ── Start App ──
document.addEventListener('DOMContentLoaded', init);
