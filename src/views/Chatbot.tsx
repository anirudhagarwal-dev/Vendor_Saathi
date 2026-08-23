import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatbotProps {
  apiService: {
    getChatHistory: () => Promise<Message[]>;
    sendChatMessage: (text: string) => Promise<Message[]>;
    clearChatHistory: () => Promise<void>;
  };
}

let messageCounter = 0;
const createMessage = (sender: 'user' | 'bot', text: string): Message => {
  return {
    id: `msg-${Date.now()}-${messageCounter++}`,
    sender,
    text,
    timestamp: new Date().toISOString()
  };
};

export const Chatbot: React.FC<ChatbotProps> = ({ apiService }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Quick preset questions for street vendors
  const quickQuestions = [
    'PM SVANidhi loan kya hai?',
    'Mujhe ₹10,000 ka loan chahiye',
    'Bima (Insurance) kaise milega?',
    'Pension scheme (PM-SYM) kya hai?',
    'Sarkari schemes ke liye kya documents chahiye?'
  ];

  const loadChatHistory = async () => {
    try {
      const history = await apiService.getChatHistory();
      setMessages(history);
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Scroll to bottom on messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setLoading(true);
    setInputText('');
    
    // Optimistically add user message first
    const userMsg = createMessage('user', textToSend);
    setMessages(prev => [...prev, userMsg]);

    try {
      const updatedHistory = await apiService.sendChatMessage(textToSend);
      setMessages(updatedHistory);
    } catch (err) {
      // Add error message as bot response
      setMessages(prev => [
        ...prev,
        {
          id: 'error',
          sender: 'bot',
          text: 'Maaf kijiye, network issue ki wajah se response nahi mil paya. Kripya fir se likhein.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Kya aap chat history saaf karna chahte hain?')) return;
    await apiService.clearChatHistory();
    loadChatHistory();
  };

  return (
    <div className="flex flex-col h-[70svh] md:h-[75svh] max-w-md md:max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden relative transition-colors duration-200">
      {/* Chat header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 px-4 py-3 flex items-center justify-between text-slate-850 dark:text-white shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="bg-emerald-50 dark:bg-emerald-950 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Bot size={18} className="stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold leading-none text-slate-800 dark:text-white uppercase tracking-wider">VendorSaathi AI</h2>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 inline-block">Online • Hinglish Assistant</span>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-xl transition-all"
          title="Clear Conversation"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          
          return (
            <div 
              key={msg.id} 
              className={`flex items-start space-x-2 ${!isBot ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Profile icon */}
              <div className={`p-1.5 rounded-xl shrink-0 ${isBot ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-450' : 'bg-blue-50 dark:bg-blue-950/80 text-blue-650 dark:text-blue-400'}`}>
                {isBot ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Chat Bubble */}
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs font-semibold shadow-sm leading-relaxed whitespace-pre-line border ${
                isBot 
                  ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/50 dark:border-slate-800 rounded-tl-none' 
                  : 'bg-emerald-500 text-white border-emerald-400 dark:border-emerald-700 rounded-tr-none'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Loading typing indicator */}
        {loading && (
          <div className="flex items-start space-x-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-450 shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1.5 items-center shadow-sm">
              <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions & Input Panel */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3.5 space-y-3 shrink-0">
        {/* Quick Questions row */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center space-x-1">
            <Sparkles size={10} className="text-amber-500" />
            <span>Tap to Ask / जल्दी पूछने के लिए दबाएं:</span>
          </span>
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold py-1.5 px-3 rounded-full text-[10px] whitespace-nowrap transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Apna sawal yahan likhein..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputText); }}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
            disabled={loading}
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={loading || !inputText.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-850 text-white p-3 rounded-xl shadow-sm active:scale-98 transition-all flex items-center justify-center shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
