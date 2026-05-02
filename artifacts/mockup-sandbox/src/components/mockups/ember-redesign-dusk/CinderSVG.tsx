import React from 'react';

export function CinderSVG() {
  return (
    <svg 
      className="dragon-image h-[280px] w-auto object-contain" 
      viewBox="0 0 240 280" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="wing-membrane-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4421A" />
          <stop offset="50%" stopColor="#8A2A0E" />
          <stop offset="100%" stopColor="#1A0F08" />
        </radialGradient>
        
        <linearGradient id="body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A0F08" />
          <stop offset="50%" stopColor="#0A0604" />
          <stop offset="100%" stopColor="#2C1A12" />
        </linearGradient>

        <linearGradient id="underbelly-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3A1F0E" />
          <stop offset="100%" stopColor="#1A0F08" />
        </linearGradient>
        
        <radialGradient id="eye-glow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD9A0" />
          <stop offset="40%" stopColor="#F0A04A" />
          <stop offset="100%" stopColor="#D4421A" />
        </radialGradient>

        <filter id="eye-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        <filter id="body-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0A0604" floodOpacity="0.6"/>
        </filter>
      </defs>

      {/* Tail */}
      <g id="cinder-tail">
        <path d="M130 220 Q 180 230 200 200 T 210 160 Q 200 170 190 190 T 140 210 Z" fill="url(#body-grad)" stroke="#0A0604" strokeWidth="1.5" />
      </g>

      {/* Left Wing */}
      <g id="cinder-wing-left">
        <path d="M100 130 Q 80 80 30 60 Q 50 100 60 140 Q 80 150 100 130 Z" fill="url(#wing-membrane-grad)" />
        <path d="M100 130 Q 80 80 30 60 M 30 60 Q 50 100 60 140" stroke="#1A0F08" strokeWidth="2" fill="none" />
      </g>

      {/* Right Wing */}
      <g id="cinder-wing-right">
        <path d="M140 130 Q 160 80 210 60 Q 190 100 180 140 Q 160 150 140 130 Z" fill="url(#wing-membrane-grad)" />
        <path d="M140 130 Q 160 80 210 60 M 210 60 Q 190 100 180 140" stroke="#1A0F08" strokeWidth="2" fill="none" />
      </g>

      {/* Body */}
      <g id="cinder-body" filter="url(#body-shadow)">
        <path d="M100 130 C 90 160 85 200 100 240 L 140 240 C 155 200 150 160 140 130 Z" fill="url(#body-grad)" stroke="#0A0604" strokeWidth="1.5" />
        <path d="M105 140 C 100 170 95 200 110 230 L 130 230 C 145 200 140 170 135 140 Z" fill="url(#underbelly-grad)" />
        {/* Front Legs */}
        <path d="M95 190 Q 80 230 85 265 Q 95 265 105 240 Z" fill="#1A0F08" />
        <path d="M145 190 Q 160 230 155 265 Q 145 265 135 240 Z" fill="#1A0F08" />
      </g>

      {/* Filigree overlay */}
      <g id="cinder-filigree">
        <path d="M110 150 Q 120 160 130 150 M 105 170 Q 120 185 135 170 M 105 190 Q 120 210 135 190" stroke="#F0C674" strokeWidth="1.5" fill="none" />
      </g>

      {/* Head */}
      <g id="cinder-head">
        {/* Jaw */}
        <g id="cinder-jaw">
          <path d="M118 122 Q 130 135 140 128 Q 130 120 118 122 Z" fill="#1A0F08" />
        </g>
        
        {/* Upper Head */}
        <path d="M105 125 C 100 100 120 80 135 90 C 145 100 145 115 135 125 Z" fill="url(#body-grad)" />
        
        {/* Horns */}
        <path d="M105 100 Q 90 80 95 70 Q 105 85 115 95 Z" fill="#2C1A12" />
        <path d="M130 90 Q 150 75 145 60 Q 140 80 125 90 Z" fill="#2C1A12" />

        {/* Eye */}
        <ellipse id="cinder-eye" cx="128" cy="105" rx="4" ry="3" fill="#F0A04A" filter="url(#eye-glow-filter)" />
        <ellipse cx="129" cy="105" rx="1.5" ry="2" fill="#1A0F08" />

        {/* Eyelid */}
        <path id="cinder-eyelid" d="M123 105 Q 128 100 133 105 Q 128 110 123 105 Z" fill="#1A0F08" />
      </g>

    </svg>
  );
}