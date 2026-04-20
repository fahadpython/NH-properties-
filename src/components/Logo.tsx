import React from 'react';

export function Logo({ className = "w-10 h-10", dark = false }: { className?: string, dark?: boolean }) {
  // Brand Colors exactly matching the user's uploaded logo
  const gold = "#D3A157";
  const darkGrey = dark ? "#FFFFFF" : "#333739"; // Invert the dark parts to white for dark mode if needed
  const whitePart = dark ? "rgba(255,255,255,0.9)" : "#FFFFFF"; // Make white slightly translucent on dark bg, or keep solid

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Left Gold Tower */}
      <polygon points="0,100 0,15 35,28 35,100" fill={gold} />
      
      {/* Middle Chimney (Dark) */}
      <polygon points="35,100 35,23 50,29 50,100" fill={darkGrey} />
      
      {/* Left White House */}
      <polygon points="10,100 10,50 50,35 50,100" fill={whitePart} />
      
      {/* Right Dark Roof */}
      <polygon points="50,35 95,52 95,58 50,41" fill={darkGrey} />
      
      {/* Right Gold House */}
      <polygon points="50,41 95,58 95,100 50,100" fill={gold} />
      
      {/* Dark Door (Aligned with Chimney on the X axis) */}
      <rect x="35" y="65" width="15" height="35" fill={darkGrey} />
      
      {/* White Window */}
      <rect x="65" y="55" width="20" height="16" fill={whitePart} />
      {/* Window frames (matching gold house background) */}
      <rect x="74" y="55" width="2" height="16" fill={gold} />
      <rect x="65" y="62" width="20" height="2" fill={gold} />
    </svg>
  );
}
