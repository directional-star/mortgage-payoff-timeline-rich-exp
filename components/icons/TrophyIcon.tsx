
import React from 'react';

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l1.293-1.293a1 1 0 011.414 0l.586.586a1 1 0 001.414 0l.586-.586a1 1 0 011.414 0L15 6v13m-6 0h6m-6 0a2 2 0 01-2-2v-3a2 2 0 012-2h6a2 2 0 012 2v3a2 2 0 01-2 2m-6 0V6" />
  </svg>
);

export default TrophyIcon;
