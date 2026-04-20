import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { askMatchmaker } from '../services/geminiService';

export default function Chatbot({ properties }: { properties: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'agent', text: string}[]>([
    { role: 'agent', text: "Hi! I'm the NH Properties AI Matchmaker. Tell me what kind of property you're looking for! (e.g. 'I want a 3BHK near Lokhandwala in a quiet area')" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    setInput('');
    const newChatHistory = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newChatHistory);
    setIsLoading(true);

    try {
      const responseText = await askMatchmaker(userText, properties, messages);
      setMessages([...newChatHistory, { role: 'agent', text: responseText }]);
    } catch (error) {
      setMessages([...newChatHistory, { role: 'agent', text: 'Oops, something went wrong connecting to my brain. Please call us!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-black/80 backdrop-blur-md text-white p-4 rounded-full shadow-2xl border border-white/10"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] max-h-[80vh] z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/20">
              <div className="flex justify-center items-center gap-2">
                 <Bot className="text-white" size={20} />
                 <h3 className="text-white font-semibold flex items-center gap-2">AI Matchmaker</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-black/40 text-white border border-white/10 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-black/40 text-white border border-white/10 rounded-bl-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-.3s]" />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-.5s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your request here..."
                  className="flex-1 bg-black/30 border border-white/20 rounded-full px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-white text-black p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
