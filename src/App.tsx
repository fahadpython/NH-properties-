import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Properties } from "./pages/Properties";
import { PropertyDetail } from "./pages/PropertyDetail";
import { Estimator } from "./pages/Estimator";
import { WebhookDemo } from "./pages/WebhookDemo";
import { BuildingIcon } from "lucide-react";
import { Logo } from "./components/Logo";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans">
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full nav-glass">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="w-10 h-10 drop-shadow-[0_0_15px_rgba(211,161,87,0.3)] transition-transform group-hover:scale-105" dark={true} />
              <div className="flex flex-col justify-center">
                <span className="text-xl tracking-wide text-white leading-none" style={{ fontFamily: 'var(--font-logo)' }}>
                  NH PROPERTIES
                </span>
                <span className="text-[0.55rem] tracking-[0.2em] text-white/50 uppercase leading-none mt-1.5 ml-0.5 font-sans">
                  Real Estate Agency
                </span>
              </div>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/properties" className="text-sm font-medium text-white/60 hover:text-white transition-opacity">
                Buy/Rent
              </Link>
              <Link to="/estimator" className="text-sm font-medium text-white/60 hover:text-white transition-opacity">
                Estimate Price
              </Link>
              <a href={`https://wa.me/919999999999?text=${encodeURIComponent("Hi NH Properties, I am looking to buy/rent a property in Lokhandwala/Andheri. Can you help me?")}`} target="_blank" rel="noreferrer" className="text-sm px-5 py-2 btn-primary shadow-lg shadow-indigo-500/20">
                Enquire Now
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 shrink-0 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/estimator" element={<Estimator />} />
            <Route path="/webhook-demo" element={<WebhookDemo />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="h-10 px-10 flex items-center justify-between micro-label border-t border-white/10 shrink-0">
          <span>© 2026 NH PROPERTIES MUMBAI</span>
          <div className="flex gap-4">
            <span>Lokhandwala Complex</span><span>•</span><span>Andheri</span><span>•</span><span>Oshiwara</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
