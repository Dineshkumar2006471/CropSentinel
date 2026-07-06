import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

const AskCropSentinel = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: textToSend.trim() }]);
    setInput('');
    setIsProcessing(true);

    try {
      // Connect to the REAL backend running Pandas over historical_mandi_prices.csv
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: textToSend.trim(),
          history: messages.map(m => ({ role: m.sender === 'ai' ? 'model' : 'user', parts: [m.text] }))
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Connection Error: Failed to reach the live CropSentinel data engine.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <main className="flex-1 p-16 md:p-32 lg:p-48 max-w-[1400px] h-[calc(100vh-60px)] lg:h-screen flex flex-col">
        
        <div className="flex flex-col lg:flex-row justify-between items-start mb-24 shrink-0">
          <div className="flex flex-col gap-4 lg:gap-8">
            <h1 className="font-display font-bold text-[32px] lg:text-[40px] text-soil-ink leading-none tracking-tight">Ask CropSentinel</h1>
            <p className="text-[14px] lg:text-[16px] text-stone">Real-time conversational intelligence trained on your mandi data.</p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[12px] border border-stone/10 shadow-sm flex flex-col overflow-hidden">
          
          <div className="px-32 py-24 border-b border-stone/10 bg-[#F9F9F9] flex items-center gap-16 shrink-0">
            <div className="w-[40px] h-[40px] bg-turmeric-gold rounded-full flex items-center justify-center font-display font-bold text-soil-ink text-[20px]">
              F
            </div>
            <div>
              <h3 className="font-bold text-soil-ink text-[16px]">CropSentinel AI</h3>
              <p className="text-[12px] text-stone">Online • Processing live mandi data</p>
            </div>
          </div>

          {/* Chat History Area */}
          <div className="flex-1 overflow-y-auto p-32 flex flex-col gap-24 bg-white" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-[600px] mx-auto">
                <span className="material-symbols-outlined text-[48px] text-stone/30 mb-16">chat_bubble</span>
                <h2 className="font-display text-[24px] font-bold text-soil-ink mb-8">How can I help you today?</h2>
                <p className="text-stone text-[14px] mb-32">Ask me about specific crop prices, market volatility, or request a risk analysis for any region.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full">
                  <button onClick={() => handleSend('What is the price of Tomato?')} className="p-16 border border-stone/20 rounded-[8px] text-left hover:border-board-green hover:bg-board-green/5 transition-colors">
                    <span className="block font-bold text-[14px] text-soil-ink mb-4">Check Prices</span>
                    <span className="block text-[12px] text-stone">"What is the price of Tomato?"</span>
                  </button>
                  <button onClick={() => handleSend('Tell me about Onion in Maharashtra')} className="p-16 border border-stone/20 rounded-[8px] text-left hover:border-board-green hover:bg-board-green/5 transition-colors">
                    <span className="block font-bold text-[14px] text-soil-ink mb-4">Market Analysis</span>
                    <span className="block text-[12px] text-stone">"Tell me about Onion in Maharashtra"</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] lg:max-w-[70%] p-16 text-[15px] leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-kraft-paper text-soil-ink rounded-[12px] rounded-br-none border border-stone/10' 
                        : 'bg-board-green text-kraft-paper rounded-[12px] rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex w-full justify-start">
                    <div className="bg-board-green text-kraft-paper rounded-[12px] rounded-bl-none p-16 flex items-center gap-8 shadow-sm">
                      <span className="w-8 h-8 bg-kraft-paper rounded-full animate-bounce"></span>
                      <span className="w-8 h-8 bg-kraft-paper rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-8 h-8 bg-kraft-paper rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-24 border-t border-stone/10 bg-white shrink-0">
            <div className="relative max-w-[900px] mx-auto">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message CropSentinel AI..."
                className="w-full bg-[#F9F9F9] border border-stone/20 focus:border-board-green focus:bg-white focus:outline-none rounded-[12px] px-24 py-16 pr-[64px] text-[15px] text-soil-ink transition-colors shadow-inner"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isProcessing || !input.trim()}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-board-green text-kraft-paper rounded-[8px] flex items-center justify-center disabled:opacity-50 transition-opacity"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
            <div className="text-center mt-12">
              <span className="text-[11px] text-stone">CropSentinel AI can make mistakes. Consider verifying important market prices.</span>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AskCropSentinel;
