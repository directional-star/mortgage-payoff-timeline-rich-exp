
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L11 10m-2 2l-2.293 2.293a1 1 0 000 1.414L9 18m12-8l-2.293-2.293a1 1 0 00-1.414 0L15 10m2 2l2.293 2.293a1 1 0 010 1.414L17 18" />
  </svg>
);

export default SparklesIcon;
