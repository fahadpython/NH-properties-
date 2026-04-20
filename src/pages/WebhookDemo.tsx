import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Image as ImageIcon, Send, CheckCircle2, Loader2, Link as LinkIcon, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WebhookDemo() {
  const [whatsappMessage, setWhatsappMessage] = useState(
    "Hi, I have a new property for sale in Andheri West, Yari Road. It is a 2 BHK, around 850 carpet area. The price is ₹2.2 Cr. It's fully furnished with gym and pool in the building."
  );
  const [mediaUrl, setMediaUrl] = useState("https://picsum.photos/seed/whatsapp/800/600?blur=1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Body: whatsappMessage,
          MediaUrl0: mediaUrl
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/20 text-indigo-400 rounded-full mb-4 border border-indigo-500/30">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-white mb-4">Owner's AI Upload Demo</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            As the owner, you don't need a complex CMS. You simply forward property details or texts from other brokers straight to your dedicated AI WhatsApp number. The AI reads it, parses the key information, and magically publishes it directly to this website!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Phone Mockup */}
          <div className="glass border-8 border-white/5 p-6 shadow-2xl relative overflow-hidden rounded-[3rem]">
            <div className="absolute top-0 inset-x-0 h-6 bg-white/5 w-1/3 mx-auto rounded-b-3xl"></div>
            
            <div className="flex items-center bg-[#075e54] text-white p-4 -mx-6 -mt-6 mb-6">
              <MessageCircle className="w-6 h-6 mr-3" />
              <div className="font-bold flex-1">NH Bot (Business)</div>
            </div>

            <form onSubmit={handleSimulate} className="flex flex-col h-full pb-12">
              <div className="flex-1 space-y-4 mb-4">
                <div className="bg-[#dcf8c6] p-4 rounded-b-xl rounded-tl-xl text-gray-800 self-end ml-12 shadow-sm relative">
                  <p className="text-sm font-bold text-green-700 mb-1">Agent Forwarded:</p>
                  <textarea 
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    className="w-full bg-transparent resize-none focus:outline-none text-sm h-32"
                  />
                  <div className="mt-2 border-t border-green-200 pt-2 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2 text-green-700" />
                    <input 
                      type="text" 
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="Image URL"
                      className="bg-white/50 text-xs px-2 py-1 rounded w-full focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-auto"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simulate Incoming Message'}
                {!loading && <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Result View */}
          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center p-8 text-white/40">
                  <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Send the simulation to see the AI instantly create a database listing.</p>
                </motion.div>
              )}
              {loading && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center p-8 text-indigo-400">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                  <p>AI is parsing the WhatsApp message...</p>
                </motion.div>
              )}
              {result && !result.error && !loading && (
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="glass p-6 md:p-8 card-shadow">
                  <div className="flex items-center text-[#25D366] mb-6">
                    <CheckCircle2 className="w-8 h-8 mr-3" />
                    <h2 className="text-xl font-bold">Successfully Parsed!</h2>
                  </div>
                  
                  <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-white/50">Title</span>
                      <span className="font-bold text-white line-clamp-1 text-right">{result.property?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-white/50">Location</span>
                      <span className="font-bold text-white">{result.property?.location || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-white/50">Price</span>
                      <span className="font-bold accent-text text-lg">{result.property?.price || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-white/50">BHK / Type</span>
                      <span className="font-bold text-white">{result.property?.bhk} BHK • {result.property?.type}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block mb-1">Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {result.property?.amenities?.map((am: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-white/10 border border-white/5 rounded text-xs font-medium text-white">{am}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link to="/properties" className="w-full py-3 btn-primary text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    View in Properties <LinkIcon className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
              {result?.error && !loading && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                  <p className="font-bold mb-2">Simulation Failed</p>
                  <p className="text-sm">{result.error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
