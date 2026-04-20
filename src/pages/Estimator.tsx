import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { estimatePropertyPrice } from '../services/geminiService';

export function Estimator() {
  const [formData, setFormData] = useState({
    location: '',
    bhk: '2',
    propertyType: 'Apartment',
    purpose: 'sale'
  });
  
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEstimate(null);
    try {
      const data = await estimatePropertyPrice(
        formData.location, 
        formData.bhk, 
        "Unknown Sqft", 
        formData.purpose as 'buy'|'rent'
      );
      setEstimate(data);
    } catch (err) {
      console.error(err);
      setEstimate({
        estimateRange: "Error",
        explanation: "Unable to calculate AI estimation.",
        marketTrend: "Unknown",
        rentOrBuyAdvice: ""
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-medium text-sm mb-4">
            <Sparkles className="w-4 h-4" /> AI Powered Prediction
          </span>
          <h1 className="text-4xl font-heading font-bold text-white mb-4">Estimate Market Price</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Get instant, hyper-accurate price estimates for properties in Andheri and Lokhandwala based on recent market trends.
          </p>
        </div>

        <div className="glass shadow-sm overflow-hidden card-shadow">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="micro-label block mb-2 text-white/80">Location/Area</label>
                  <input 
                    required
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Lokhandwala Complex, Andheri W"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder-white/30"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="micro-label block mb-2 text-white/80">BHK</label>
                    <select 
                      value={formData.bhk}
                      onChange={e => setFormData({...formData, bhk: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white [&>option]:text-gray-900"
                    >
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5+</option>
                    </select>
                  </div>
                  <div>
                    <label className="micro-label block mb-2 text-white/80">Purpose</label>
                    <select 
                      value={formData.purpose}
                      onChange={e => setFormData({...formData, purpose: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white [&>option]:text-gray-900"
                    >
                      <option value="sale">Buy / Sell</option>
                      <option value="rent">Rent / Lease</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 btn-primary flex items-center justify-center gap-2 group disabled:opacity-70 text-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Estimate'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>

            {/* Results Section */}
            <div className="p-8 md:p-12 relative flex flex-col justify-center min-h-[400px]">
              <div className="absolute inset-0 bg-black/20 md:border-l border-white/5"></div>
              <div className="relative z-10 w-full">
                <AnimatePresence mode="wait">
                  {!estimate && !loading && (
                    <motion.div 
                      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      className="text-center text-white/40"
                    >
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Fill out the details to generate an AI property valuation.</p>
                    </motion.div>
                  )}

                  {loading && (
                    <motion.div 
                      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      className="text-center text-indigo-400"
                    >
                      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                      <p className="animate-pulse">Analyzing Mumbai real estate data...</p>
                    </motion.div>
                  )}

                  {estimate && !estimate.error && !loading && (
                    <motion.div 
                      initial={{opacity: 0, scale: 0.95}} 
                      animate={{opacity: 1, scale: 1}}
                      className="space-y-6"
                    >
                      <div>
                        <p className="micro-label mb-2 text-white/60 text-[10px]">Estimated Value</p>
                        <p className="text-5xl font-heading font-extrabold accent-text">{estimate.estimateRange}</p>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm">
                        <p className="micro-label mb-1 text-white/60">Market Trend</p>
                        <p className="text-white flex items-center font-medium">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                          {estimate.marketTrend}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-white/90 mb-1 text-sm border-b border-white/10 pb-2">Why this price?</p>
                        <p className="text-white/60 text-sm leading-relaxed mt-2">{estimate.explanation}</p>
                      </div>

                      <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 italic text-indigo-200 text-sm border-l-4 border-l-indigo-500">
                        <strong>AI Advice:</strong> {estimate.rentOrBuyAdvice}
                      </div>
                    </motion.div>
                  )}

                  {estimate?.error && !loading && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                      <p className="font-bold mb-2">Estimation Failed</p>
                      <p className="text-sm">We couldn't generate an estimate. Please ensure your API keys are valid or try again later.</p>
                      <p className="text-xs opacity-50 block mt-2">Error: {estimate.error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
