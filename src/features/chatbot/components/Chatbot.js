import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  sendMessage, clearChat,
  getSessions, createSession, getSessionMessages, deleteSession,
} from '../services/chatbot';
import './Chatbot.css';

function toText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value))
    return value.map(b => (typeof b === 'string' ? b : b?.text ?? JSON.stringify(b))).join(' ').trim();
  if (value && typeof value === 'object') return value.text ?? JSON.stringify(value);
  return String(value ?? '');
}

function Chatbot({ onSessionExpired }) {
  const [isOpen, setIsOpen] = useState(false);

  const [sessions, setSessions]                 = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages]                 = useState([]);
  const [input, setInput]                       = useState('');
  const [isLoading, setIsLoading]               = useState(false);

  const messagesEndRef = useRef(null);
  const tabsRef        = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  // Scroll the active tab into view whenever the active session changes
  useEffect(() => {
    if (!tabsRef.current || !currentSessionId) return;
    const active = tabsRef.current.querySelector('.chatbot-tab.active');
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [currentSessionId]);

  // Load sessions on open
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        let list = await getSessions();
        if (list.length === 0) {
          const s = await createSession();
          list = [s];
        }
        setSessions(list);
        await _switchSession(list[0].id);
      } catch (err) {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Session helpers ───────────────────────────────────────────────────────

  async function _switchSession(sessionId) {
    try {
      const msgs = await getSessionMessages(sessionId);
      setMessages(msgs.map(m => ({ role: m.role, text: m.text })));
      setCurrentSessionId(sessionId);
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
    }
  }

  const handleNewChat = async () => {
    try {
      const s = await createSession();
      // Append at end so tab order is chronological left → right
      setSessions(prev => [...prev, s]);
      setMessages([]);
      setCurrentSessionId(s.id);
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        if (remaining.length > 0) {
          await _switchSession(remaining[remaining.length - 1].id);
        } else {
          const s = await createSession();
          setSessions([s]);
          setMessages([]);
          setCurrentSessionId(s.id);
        }
      }
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || !currentSessionId) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await sendMessage(text, currentSessionId);
      const reply = toText(data.response);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      // Refresh list to pick up the auto-renamed tab title after the first message
      getSessions().then(list => setSessions(list)).catch(() => {});
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setMessages(prev => [...prev, { role: 'error', text: err.message }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentSessionId, onSessionExpired]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = async () => {
    if (!currentSessionId) return;
    try { await clearChat(currentSessionId); } catch { /* non-fatal */ }
    setMessages([]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(o => !o)}
        title={isOpen ? 'Close chat' : 'Open AI Assistant'}
        aria-label="Toggle AI chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="chatbot-panel" role="dialog" aria-label="AI Assistant">

          {/* Header */}
          <div className="chatbot-header">
            <span className="chatbot-header-icon">🤖</span>
            <div style={{ flex: 1 }}>
              <div className="chatbot-title">AI Assistant</div>
              <div className="chatbot-subtitle">Powered by Gemini · LangChain</div>
            </div>
            <div className="chatbot-header-actions">
              <button className="chatbot-header-btn" onClick={handleClear} title="Clear messages">🗑</button>
              <button className="chatbot-header-btn" onClick={() => setIsOpen(false)} title="Close">✕</button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="chatbot-tabs-wrapper">
            <div className="chatbot-tabs" ref={tabsRef}>
              {sessions.map(s => (
                <button
                  key={s.id}
                  className={`chatbot-tab ${s.id === currentSessionId ? 'active' : ''}`}
                  onClick={() => _switchSession(s.id)}
                  title={s.name}
                >
                  <span className="chatbot-tab-label">{s.name}</span>
                  <span
                    className="chatbot-tab-close"
                    role="button"
                    aria-label="Delete session"
                    onClick={(e) => handleDeleteSession(e, s.id)}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
            {/* + New chat — pinned to the right */}
            <button className="chatbot-tab-add" onClick={handleNewChat} title="New chat" aria-label="New chat">
              +
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && !isLoading && (
              <div className="chatbot-empty">
                <div className="chatbot-empty-icon">💬</div>
                Ask me anything!<br />
                I can do maths, tell the time,<br />
                and answer questions about your knowledge base.
              </div>
            )}

            {messages.map((msg, i) =>
              msg.role === 'assistant' ? (
                <div key={i} className="chatbot-bubble assistant">
                  <div className="chatbot-md">
                    <ReactMarkdown>{toText(msg.text)}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div key={i} className={`chatbot-bubble ${msg.role}`}>
                  {toText(msg.text)}
                </div>
              )
            )}

            {isLoading && (
              <div className="chatbot-typing" aria-label="Assistant is typing">
                <span /><span /><span />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div className="chatbot-input-row">
            <textarea
              className="chatbot-input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              disabled={isLoading}
              aria-label="Message input"
            />
            <button
              className="chatbot-send"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              title="Send"
              aria-label="Send message"
            >
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  );
}

export default Chatbot;
