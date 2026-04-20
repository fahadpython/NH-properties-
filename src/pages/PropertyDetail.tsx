import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, BedDouble, Square, CheckCircle2, Sparkles, Navigation, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        setProperty(data);
        if (data.id) {
          fetchInsights(data);
        }
      });
  }, [id]);

  const fetchInsights = async (prop: any) => {
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: prop.title, location: prop.location, type: prop.type, bhk: prop.bhk })
      });
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingInsights(false);
  };

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySent(true);
    // Real app would POST to /api/enquiries here
    setTimeout(() => setEnquirySent(false), 3000);
  };

  if (!property) return <div className="p-24 text-center">Loading...</div>;

  return (
    <div className="min-h-screen">
      {/* Detail Header Hero */}
      <div className="w-full h-[50vh] relative">
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 text-white container mx-auto max-w-6xl">
          <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            For {property.type}
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">{property.title}</h1>
          <p className="text-lg flex items-center text-white/70">
            <MapPin className="w-5 h-5 mr-2 accent-text" /> {property.location}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Core Info */}
            <div className="flex flex-wrap gap-6 p-6 glass">
              <div>
                <p className="micro-label mb-1">Price</p>
                <p className="text-3xl font-heading font-bold accent-text">{property.price}</p>
              </div>
              <div className="w-px bg-white/10 hidden sm:block"></div>
              <div>
                <p className="micro-label mb-1">Configuration</p>
                <p className="text-xl font-bold flex items-center"><BedDouble className="w-5 h-5 mr-2 text-white/40" /> {property.bhk} BHK</p>
              </div>
              <div className="w-px bg-white/10 hidden sm:block"></div>
              <div>
                <p className="micro-label mb-1">Carpet Area</p>
                <p className="text-xl font-bold flex items-center"><Square className="w-5 h-5 mr-2 text-white/40" /> {property.area}</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold mb-4">About this Property</h2>
              <p className="text-white/70 leading-relaxed text-lg">{property.description}</p>
            </div>

            {property.amenities?.length > 0 && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-6">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((am: string, i: number) => (
                    <div key={i} className="flex items-center text-white/90 bg-white/5 border border-white/10 p-4 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 mr-3 accent-text" /> {am}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights Section */}
            <div className="glass p-8 relative overflow-hidden card-shadow">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Sparkles className="w-24 h-24 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-6 flex items-center text-white">
                <Sparkles className="w-6 h-6 mr-3 text-indigo-400" /> AI Location & Investment Insights
              </h2>
              
              {loadingInsights ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6"></div>
                </div>
              ) : insights ? (
                <div className="space-y-8 relative z-10">
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-white/90 border-b border-white/10 pb-2">Why Buy/Rent Here?</h3>
                    <ul className="space-y-3 mt-4">
                      {insights.whyBuyOrRent?.map((reason: string, i: number) => (
                        <motion.li initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: i*0.1}} key={i} className="flex items-start text-white/70">
                          <CheckCircle2 className="w-5 h-5 mr-3 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-white/90 border-b border-white/10 pb-2">The Vibe</h3>
                    <p className="text-white/70 italic border-l-4 border-indigo-500 pl-4 py-1 mt-4">{insights.areaVibe}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4 text-white/90 border-b border-white/10 pb-2">Nearest Discoveries</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {insights.distances?.map((dist: any, i: number) => (
                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center">
                          <div className="bg-indigo-500/20 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                            <Navigation className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{dist.place}</p>
                            <p className="text-white/50 text-xs">{dist.distance} away</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/50">Could not load insights.</p>
              )}
            </div>

          </div>

          {/* Sidebar / Enquiry Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass p-6 md:p-8 card-shadow">
              <h3 className="text-2xl font-heading font-bold mb-2">Interested?</h3>
              <p className="text-white/50 text-sm mb-6">Reach out to our experts directly on WhatsApp with a pre-filled message about this property.</p>
              
              <a 
                href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi NH Properties, I am interested in: \n*${property.title}*\nLocation: ${property.location}\nPrice: ${property.price}\nType: ${property.type}\nCan we schedule a viewing?`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 btn-primary flex items-center justify-center gap-2 mt-4 text-sm"
              >
                Send Enquiry on WhatsApp <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
