import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  ShieldCheck,
  Calendar,
  Award,
  BookOpen,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { askExamAssistant, ChatMessage } from '../../services/aiAssistantService';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const StudentAIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: '1',
        sender: 'assistant',
        text: `Hello ${user?.full_name || 'Student'}! I am your Examination Cell AI Academic Assistant.\n\nI have direct access to your verified academic records. Ask me anything about your upcoming exam schedules, hall venues, course scores, or SGPA standings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || !user?.student_id) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setIsTyping(true);

    try {
      const response = await askExamAssistant(user.student_id, textToSend);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: "I encountered an error querying your academic records. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const examplePrompts = [
    'When is my next exam?',
    'What is my DBMS score?',
    'Show my performance & SGPA',
    'Which subjects did I pass?',
    'How many exams do I have scheduled?'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Exam Cell AI Assistant
              <Badge variant="cyan" size="sm">Grounded Database Engine</Badge>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Strictly queries your live academic records — zero hallucination guarantee.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: '1',
                sender: 'assistant',
                text: `Conversation reset. How may I help you with your examination records today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }}
          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition flex items-center gap-1 text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] uppercase font-mono text-slate-500 shrink-0">Try asking:</span>
        {examplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-cyan-950/40 hover:border-cyan-700/60 text-slate-300 hover:text-cyan-300 whitespace-nowrap text-xs transition"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 backdrop-blur-md space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-teal-500/20 border border-teal-500/40 text-teal-400'
              }`}
            >
              {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-1 ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-50'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 whitespace-pre-line'
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-[9px] font-mono text-slate-500 text-right mt-1">{msg.timestamp}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-[11px]">Querying Examination Database Records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Ask a question about your exams, marks, or timetable..."
          className="flex-1 rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        />
        <Button
          type="submit"
          variant="cyan"
          size="md"
          icon={Send}
          disabled={!inputValue.trim() || isTyping}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
