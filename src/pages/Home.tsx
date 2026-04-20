import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Search, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> Mumbai's Premier Agent Network
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-white mb-6">
              Find Your Perfect Home in <span className="accent-text">Andheri & Lokhandwala</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Get AI-powered price estimations, deep locality insights, and seamless WhatsApp property uploads instantly. 
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/properties" className="w-full sm:w-auto px-8 py-4 btn-primary transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                <Search className="w-5 h-5" /> Browse Properties
              </Link>
              <Link to="/estimator" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-lg transition-all backdrop-blur-md flex items-center justify-center gap-2 border border-white/10">
                Estimate Property Value
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">Why use NH Properties?</h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">We combine hyper-local expertise in Lokhandwala with cutting-edge AI technology.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageCircle className="w-6 h-6 text-indigo-400" />}
              title="WhatsApp AI Integration"
              desc="Just forward property details via WhatsApp. Our AI converts messages into beautiful, formatted website listings automatically."
              linkTo="/webhook-demo"
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6 text-indigo-400" />}
              title="Smart Price Estimation"
              desc="Don't guess market prices. Our AI examines Andheri and Lokhandwala trends to give you highly accurate buy/rent estimates."
              linkTo="/estimator"
            />
            <FeatureCard 
              icon={<MapPin className="w-6 h-6 text-indigo-400" />}
              title="Deep Locality Insights"
              desc="Every listing tells you exactly *why* you should live there. Distances to malls, metros, and the true lifestyle vibe."
              linkTo="/properties"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, linkTo }: { icon: React.ReactNode, title: string, desc: string, linkTo: string }) {
  return (
    <Link to={linkTo} className="group p-8 glass hover:bg-white/10 transition-all block">
      <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-heading font-bold text-white mb-3">{title}</h3>
      <p className="text-white/70 leading-relaxed mb-6 text-sm">{desc}</p>
      <div className="flex items-center text-indigo-400 font-medium pb-1 border-b border-transparent group-hover:border-indigo-400 w-fit transition-all text-sm">
        Try it now <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </Link>
  );
}
