import React, { useEffect, useState } from 'react';
import { Sun, Wind, MapPin, Eye, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export function PropertyTips() {
  const [tips, setTips] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/tips')
      .then(res => res.json())
      .then(data => setTips(data));
  }, []);

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sunlight': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'air quality': return <Wind className="w-5 h-5 text-blue-400" />;
      case 'location': return <MapPin className="w-5 h-5 text-indigo-400" />;
      case 'view': return <Eye className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5 text-indigo-400" />;
    }
  };

  if (!tips.length) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Expert Buying Tips</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tips.map((tip, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass p-5 card-shadow border border-white/5 hover:border-indigo-500/30 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
                {getIcon(tip.category)}
              </div>
              <span className="font-bold text-white text-sm uppercase tracking-tight">{tip.category}</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {tip.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
