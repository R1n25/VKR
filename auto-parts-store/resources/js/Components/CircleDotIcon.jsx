import React from "react";

export default function CircleDotIcon({ className = 'w-6 h-6' }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" strokeWidth="0" fill="currentColor" />
    </svg>
  );
} 