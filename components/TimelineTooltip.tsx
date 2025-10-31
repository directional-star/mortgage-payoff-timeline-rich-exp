
import React from 'react';

interface TimelineTooltipProps {
    top: number;
    date: string;
    balance: string;
    onClose: () => void;
}

const TimelineTooltip: React.FC<TimelineTooltipProps> = ({ top, date, balance, onClose }) => {
    return (
        <div 
            className="absolute left-4 p-2 bg-gray-800 text-white rounded-md shadow-lg text-xs z-20" 
            style={{ top: `${top}px`, transform: 'translateY(-50%)' }}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold"
                aria-label="Close tooltip"
            >
                &times;
            </button>
            <div className="font-semibold">{date}</div>
            <div>Balance: {balance}</div>
        </div>
    );
};

export default TimelineTooltip;
