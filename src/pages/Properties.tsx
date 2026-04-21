import React, { useEffect, useState, useRef } from 'react';
import { Heart, Share2, MessageCircle, MapPin, BedDouble, Square, Info, ChevronRight, ChevronLeft, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyTips } from '../components/PropertyTips';
import Chatbot from '../components/Chatbot';

export function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/properties')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error('Server returned ' + res.status + ': ' + text);
        }
        return res.json();
      })
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setErrorMsg(err.message);
        setProperties([]); // fallback to empty
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-black p-8 text-center text-white">
        <h2 className="text-red-500 text-2xl mb-4">Connection Error</h2>
        <p className="text-white/70 mb-4">{errorMsg}</p>
        <p className="text-white/50 text-sm">Please check Vercel logs or ensure the Google Service Account is configured perfectly as one single line of JSON.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-black relative">
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative">
        {properties.map((prop, i) => (
          <ReelItem key={prop.id} prop={prop} />
        ))}
        {properties.length === 0 && (
          <div className="h-full w-full flex items-center justify-center snap-start">
            <p className="text-white/50 text-lg">No properties available yet.</p>
          </div>
        )}
      </div>

      {/* Chatbot Overlay */}
      <Chatbot properties={properties} />

      {/* Floating Tips Button */}
      <button 
        onClick={() => setShowTips(true)}
        className="fixed top-20 left-4 z-40 bg-black/40 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        Buying Tips
      </button>

      {/* Tips Overlay */}
      <AnimatePresence>
        {showTips && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#0A0C10] border-t border-white/10 p-6 rounded-t-3xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-heading">Expert Guide</h2>
              <button onClick={() => setShowTips(false)} className="p-2 bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <PropertyTips />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReelItem({ prop }: { prop: any; key?: React.Key }) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Parse mediaUrls from string (Google Sheets) or fallback array
  let mediaArray: string[] = [];
  if (prop.mediaurls || prop.mediaUrls) {
    const raw = prop.mediaurls || prop.mediaUrls;
    mediaArray = typeof raw === 'string' ? raw.split(',').map(s => s.trim()) : raw;
  } else if (prop.imageUrl) {
    mediaArray = [prop.imageUrl];
  } else {
    mediaArray = ["https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=800&q=80"];
  }

  const currentMedia = mediaArray[mediaIndex];
  const isVideo = currentMedia?.toLowerCase().endsWith('.mp4') || currentMedia?.includes('video');

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaIndex < mediaArray.length - 1) setMediaIndex(prev => prev + 1);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaIndex > 0) setMediaIndex(prev => prev - 1);
  };

  const shareProperty = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: prop.title,
          text: `Check out this property: ${prop.title} in ${prop.location} for ${prop.price}!`,
          url: window.location.href,
        });
      } catch (err) {
         console.log(err);
      }
    }
  };

  return (
    <div className="h-full w-full snap-start snap-always relative overflow-hidden flex justify-center bg-[#050505]">
      {/* Media Layer (Constrained to max-width to look like a mobile app even on desktop) */}
      <div className="h-full w-full max-w-md relative bg-black">
        {/* Media elements */}
        {isVideo ? (
          <video 
            src={currentMedia} 
            className="w-full h-full object-cover" 
            autoPlay 
            loop 
            muted 
            playsInline 
          />
        ) : (
          <img 
            src={currentMedia} 
            alt={prop.title} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        )}

        {/* Carousel Indicators */}
        {mediaArray.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-20 px-4">
            {mediaArray.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 flex-1 rounded-full bg-white transition-opacity duration-300 ${idx === mediaIndex ? 'opacity-100' : 'opacity-30'}`}
              />
            ))}
          </div>
        )}

        {/* Carousel Click Zones */}
        <div className="absolute inset-0 z-10 flex">
          <div className="flex-1" onClick={prevMedia}></div>
          <div className="flex-1" onClick={nextMedia}></div>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24 pb-6 px-4 z-20 pointer-events-none">
          <div className="pointer-events-auto w-4/5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                FOR {prop.type}
              </span>
              <span className="flex items-center text-xs font-medium text-white/80">
                <MapPin className="w-3 h-3 mr-1" /> {prop.location}
              </span>
            </div>
            
            <h2 className="text-xl font-heading font-bold leading-tight mb-1">{prop.title}</h2>
            <p className="text-2xl font-bold accent-text mb-3">{prop.price}</p>
            
            <div className="flex gap-4 text-sm font-medium mb-3">
              <span className="flex items-center"><BedDouble className="w-4 h-4 mr-1 text-white/50" /> {prop.bhk} BHK</span>
              {prop.area && <span className="flex items-center"><Square className="w-4 h-4 mr-1 text-white/50" /> {prop.area}</span>}
            </div>

            <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
              <p className={`text-sm text-white/80 leading-snug transition-all ${expanded ? '' : 'line-clamp-2'}`}>
                {prop.description}
              </p>
              {!expanded && <span className="text-white/50 text-xs font-bold mt-1 block">more</span>}
            </div>
          </div>
        </div>

        {/* Right Floating Actions */}
        <div className="absolute bottom-8 right-3 z-30 flex flex-col items-center gap-5 pointer-events-auto">
          {/* Like */}
          <button onClick={() => setLiked(!liked)} className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-black/20 backdrop-blur rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
              <Heart className={`w-6 h-6 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </div>
            <span className="text-[10px] font-medium text-white mt-1 shadow-sm">{liked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share */}
          <button onClick={shareProperty} className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-black/20 backdrop-blur rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white mt-1 shadow-sm">Share</span>
          </button>

          {/* Enquire (WhatsApp) */}
          <a 
            href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi NH Properties, I came across the *${prop.title}* on your reels. Price: ${prop.price}. Can we schedule a viewing?`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center group mt-2"
          >
            <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1">Enquire</span>
          </a>
        </div>
      </div>
    </div>
  );
}
