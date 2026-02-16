import React, { useState, useRef, useEffect, useContext } from 'react';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';
import { LanguageContext } from '../App'; // Assuming exported for consumption

const GeminiAssistant: React.FC = () => {
  const { t, language, dir } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting based on language
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', text: t.bot_greeting }]);
    }
  }, [t.bot_greeting]);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }

    try {
      const responseText = await sendMessageToGemini(chatSessionRef.current, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: language === 'ar' ? 'عذراً، أواجه مشكلة في الاتصال حالياً.' : "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50`}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 border border-purple-400/50"
        >
          <Bot size={24} className="animate-pulse" />
          <span className="font-semibold hidden md:inline">{t.bot_name}</span>
        </button>
      )}

      {isOpen && (
        <div className={`bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden h-[500px] animate-fade-in-up ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          {/* Header */}
          <div className={`bg-gradient-to-r from-purple-600 to-indigo-700 p-4 flex justify-between items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 text-white ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Bot size={20} />
              <h3 className="font-bold">{language === 'ar' ? 'بوت خدمة توكيو' : 'Tokyo Service Bot'}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-3 bg-slate-800 border-t border-slate-700 flex gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.bot_input_placeholder}
              className={`flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            >
              <Send size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant;