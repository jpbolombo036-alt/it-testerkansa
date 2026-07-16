import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Loader2, Trash2, Sparkles, ChevronDown } from 'lucide-react'
import { sendAiMessage, sendAiMessageStream, getAiConversations, type AiMessage, type AiChatResponse } from '../../api/aiApi'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Bonjour ! Je suis l'assistant IA de **IT Access Manager**.

Je peux vous aider à :
- 📊 Consulter les **statistiques** du tableau de bord
- 👥 Trouver des informations sur les **utilisateurs**
- 🖥️ Explorer les **applications** et **comptes**
- ✅ Gérer vos **tâches** et **sessions de test**
- 📄 Rechercher dans l'**archive documentaire**

Que puis-je faire pour vous ?`,
  timestamp: new Date(),
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="ai-code-inline">$1</code>')
    .replace(/^### (.*$)/gim, '<h3 class="ai-h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="ai-h2">$2</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="ai-h1">$1</h1>')
    .replace(/^- (.*$)/gim, '<li class="ai-li">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="ai-ul">$&</ul>')
    .replace(/\n/g, '<br/>')
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  )
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, scrollToBottom])

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, scrollToBottom])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    const loadingMsg: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMsg, loadingMsg])
    setInput('')
    setIsLoading(true)

    try {
      const history: AiMessage[] = messages
        .filter((m) => m.id !== 'welcome' && !m.isLoading)
        .map((m) => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: trimmed })

      let response: AiChatResponse;
      try {
        response = await sendAiMessageStream(
          { conversationId, messages: history },
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === 'loading'
                  ? { ...m, content: chunk }
                  : m
              )
            )
          }
        )
      } catch (streamError) {
        console.warn('Streaming failed, falling back to non-streaming:', streamError)
        response = await sendAiMessage({ conversationId, messages: history })
      }

      if (response.conversationId && !conversationId) {
        setConversationId(String(response.conversationId))
      }

      const assistantMsg: ChatMessage = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: response.error
          ? `❌ ${response.errorMessage || 'Une erreur est survenue.'}`
          : response.reply,
        timestamp: new Date(),
      }

      setMessages((prev) => prev.filter((m) => m.id !== 'loading').concat(assistantMsg))

      if (!isOpen) setHasUnread(true)
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString() + '_err',
        role: 'assistant',
        content: '❌ Impossible de contacter l\'agent IA. Vérifiez votre connexion et la configuration du serveur.',
        timestamp: new Date(),
      }
      setMessages((prev) => prev.filter((m) => m.id !== 'loading').concat(errorMsg))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE])
    setConversationId(undefined)
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        id="ai-chat-fab"
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-violet-400/50"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ouvrir l'assistant IA"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <motion.span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
          />
        )}

        {/* Pulse ring */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid rgba(124,58,237,0.5)' }}
            animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-window"
            initial={{ opacity: 0, scale: 0.85, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[370px] max-h-[620px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(15, 10, 30, 0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124,58,237,0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b border-violet-900/30"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(79,70,229,0.15) 100%)' }}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0f0a1e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Assistant IA</p>
                <p className="text-xs text-violet-300/80">IT Access Manager · Gemini 2.5</p>
              </div>
              <button
                id="ai-chat-clear"
                onClick={handleClear}
                title="Effacer la conversation"
                className="p-1.5 rounded-lg text-violet-400 hover:text-white hover:bg-violet-800/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                id="ai-chat-close"
                onClick={() => setIsOpen(false)}
                title="Fermer"
                className="p-1.5 rounded-lg text-violet-400 hover:text-white hover:bg-violet-800/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-violet-800/50 scrollbar-track-transparent">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-0.5">
                    {msg.role === 'assistant' ? (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-600">
                        <User className="w-4 h-4 text-slate-200" />
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-tr-sm'
                        : 'text-slate-100 rounded-tl-sm'
                    }`}
                    style={
                      msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {msg.isLoading ? (
                      <TypingDots />
                    ) : (
                      <div
                        className="ai-message-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    )}
                    {!msg.isLoading && (
                      <p className="text-[10px] mt-1 opacity-40 text-right">
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2.5 flex flex-wrap gap-1.5 justify-center">
                <button
                  onClick={() => { setInput("Montre-moi les statistiques globales du dashboard 📊"); }}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-violet-950/40 hover:bg-violet-900/50 border border-violet-800/30 text-violet-200 transition-colors"
                >
                  Stats 📊
                </button>
                <button
                  onClick={() => { setInput("Quelles sont les tâches (todos) en attente ? 📝"); }}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-violet-950/40 hover:bg-violet-900/50 border border-violet-800/30 text-violet-200 transition-colors"
                >
                  Tâches 📝
                </button>
                <button
                  onClick={() => { setInput("Quels sont les derniers bugs déclarés ? 🐛"); }}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-violet-950/40 hover:bg-violet-900/50 border border-violet-800/30 text-violet-200 transition-colors"
                >
                  Bugs 🐛
                </button>
                <button
                  onClick={() => { setInput("Quelles sont les dernières versions APK ? 📱"); }}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-violet-950/40 hover:bg-violet-900/50 border border-violet-800/30 text-violet-200 transition-colors"
                >
                  APK 📱
                </button>
              </div>
            )}

            {/* Input */}
            <div
              className="px-4 py-3 border-t border-violet-900/30"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <input
                  id="ai-chat-input"
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question…"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-white placeholder-violet-400/60 outline-none"
                />
                <motion.button
                  id="ai-chat-send"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  whileHover={!input.trim() || isLoading ? {} : { scale: 1.1 }}
                  whileTap={!input.trim() || isLoading ? {} : { scale: 0.9 }}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                  style={{
                    background: input.trim() && !isLoading
                      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                      : 'transparent',
                  }}
                  aria-label="Envoyer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </motion.button>
              </div>
              <p className="text-[10px] text-center mt-2 text-violet-500/60">
                Propulsé par Gemini 2.5 · Les réponses peuvent contenir des erreurs
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global styles for markdown content */}
      <style>{`
        .ai-message-content strong { color: #c4b5fd; font-weight: 600; }
        .ai-message-content em { font-style: italic; color: #a78bfa; }
        .ai-code-inline { 
          background: rgba(124,58,237,0.25); 
          color: #e9d5ff; 
          padding: 0.1em 0.35em; 
          border-radius: 4px; 
          font-size: 0.85em;
          font-family: 'Fira Code', monospace;
        }
        .ai-ul { list-style: none; padding: 4px 0; margin: 2px 0; }
        .ai-li { padding: 1px 0; }
        .ai-li::before { content: "• "; color: #7c3aed; font-weight: bold; }
        .ai-h1, .ai-h2, .ai-h3 { color: #c4b5fd; font-weight: 600; margin: 6px 0 2px; }
        
        /* Table formatting */
        .ai-message-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 0.85em;
        }
        .ai-message-content th {
          border-bottom: 2px solid rgba(124,58,237,0.4);
          text-align: left;
          padding: 6px 4px;
          color: #c4b5fd;
          font-weight: 600;
        }
        .ai-message-content td {
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 6px 4px;
          color: #e2e8f0;
        }
        .ai-message-content tr:hover {
          background: rgba(255,255,255,0.03);
        }
      `}</style>
    </>
  )
}