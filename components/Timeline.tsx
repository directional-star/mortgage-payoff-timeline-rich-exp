import React, { useState, useRef } from 'react';
import { CalculationResults, LifeEvent, LoanDetails, AmortizationDataPoint } from '../types';
import GraduationCapIcon from './icons/GraduationCapIcon';
import PiggyBankIcon from './icons/PiggyBankIcon';
import TrophyIcon from './icons/TrophyIcon';
import HouseIcon from './icons/HouseIcon';
import TimelineTooltip from './TimelineTooltip';

interface TimelineEvent {
    position: number;
    label: string;
    subtitle: string;
    date: string;
    icon: React.ReactNode;
    color: string;
}

// FIX: Define TimelineProps interface
interface TimelineProps {
    results: CalculationResults;
    lifeEvents: LifeEvent[];
    loanDetails: LoanDetails;
}

const TimelineCard: React.FC<{ event: TimelineEvent; side: 'left' | 'right' }> = ({ event, side }) => {
  const isLeft = side === 'left';
  return (
    <div className={`p-4 bg-white rounded-lg shadow-md border-l-4 ${isLeft ? 'border-brand-primary' : 'border-brand-secondary'}`}>
      <p className="font-bold text-brand-dark">{event.label}</p>
      <p className="text-sm text-gray-500 mt-1">{event.subtitle}</p>
      <time className="text-xs font-semibold text-gray-400 mt-2 block">{event.date}</time>
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({ results, lifeEvents, loanDetails }) => {
    const { original, scenario } = results;
    const [tooltip, setTooltip] = useState<{ top: number; date: Date; balance: number } | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const startDate = new Date();
    const totalDurationMs = original.payoffDate.getTime() - startDate.getTime();

    if (totalDurationMs <= 0 || scenario.data.length === 0) return null;
    
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const getAgeAtDate = (date: Date) => loanDetails.age + (date.getFullYear() - startDate.getFullYear());

    const allEventsRaw = [
        { dateObj: startDate, label: "Your Journey Starts Here", subtitle: `Principal: $${loanDetails.principal.toLocaleString()}`, icon: <HouseIcon className="h-5 w-5 text-white" />, color: 'bg-gray-500' },
        ...[25, 50, 75].map(percent => {
            const target = loanDetails.principal * (percent / 100);
            const dp = scenario.data.find(d => d.totalPrincipalPaid >= target);
            if (!dp) return null;
            return { dateObj: dp.date, label: `${percent}% Paid Off`, subtitle: "You're making great progress!", icon: <PiggyBankIcon className="h-5 w-5 text-white" />, color: 'bg-green-500' };
        }),
        ...[200000, 100000].map(balance => {
            if (loanDetails.principal < balance) return null;
            const dp = scenario.data.find(d => d.remainingBalance <= balance);
            if (!dp) return null;
            return { dateObj: dp.date, label: `Under $${balance/1000}k Balance!`, subtitle: "The finish line is getting closer!", icon: <PiggyBankIcon className="h-5 w-5 text-white" />, color: 'bg-blue-500' };
        }),
        ...lifeEvents.map(event => {
            const yearsFromNow = event.age - loanDetails.age;
            if (yearsFromNow < 0) return null;
            const eventDate = new Date();
            eventDate.setFullYear(eventDate.getFullYear() + yearsFromNow);
            return { dateObj: eventDate, label: event.name, subtitle: `A personal milestone for you.`, icon: <GraduationCapIcon className="h-5 w-5 text-white" />, color: 'bg-purple-500', customAge: event.age };
        }),
        { dateObj: scenario.payoffDate, label: "Mortgage Free!", subtitle: "Congratulations! You've paid off your loan.", icon: <TrophyIcon className="h-5 w-5 text-white" />, color: 'bg-brand-accent' },
    ];

    const sortedEventsRaw = allEventsRaw
        .filter((e): e is NonNullable<typeof e> => e !== null)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const timelineEvents: TimelineEvent[] = sortedEventsRaw.map((event, index) => {
        const totalEvents = sortedEventsRaw.length;
        let position: number;

        if (totalEvents <= 1) {
            position = 50; // Center if only one event
        } else {
            // Distribute events evenly from 5% to 95% of the timeline height
            const positionRatio = index / (totalEvents - 1);
            position = 5 + positionRatio * 90;
        }

        return {
            ...event,
            position,
            date: `${formatDate(event.dateObj)} (Age: ${'customAge' in event ? event.customAge : getAgeAtDate(event.dateObj)})`,
        };
    });


    const containerHeight = Math.max(600, timelineEvents.length * 150);

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const clickRatio = Math.max(0, Math.min(1, clickY / timelineRef.current.offsetHeight));
        const clickedMs = startDate.getTime() + (totalDurationMs * clickRatio);
        
        let closestPoint: AmortizationDataPoint | null = scenario.data[0];
        let minDiff = Infinity;
        for (const point of scenario.data) {
            const diff = Math.abs(point.date.getTime() - clickedMs);
            if (diff < minDiff) {
                minDiff = diff;
                closestPoint = point;
            }
        }
        
        if (closestPoint) {
            setTooltip({ top: clickY, date: closestPoint.date, balance: closestPoint.remainingBalance });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in mt-8">
            <h3 className="text-xl font-semibold text-brand-dark mb-4 text-center">Your Personalized Timeline</h3>
            <p className="text-center text-gray-500 text-sm mb-12">Click on the timeline bar to see your outstanding balance at that point in time.</p>
            
            <div ref={timelineRef} className="relative cursor-pointer" style={{ height: `${containerHeight}px` }} onClick={handleTimelineClick}>
                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-200 -ml-0.5" />
                {tooltip && <TimelineTooltip top={tooltip.top} date={formatDate(tooltip.date)} balance={`$${tooltip.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} onClose={() => setTooltip(null)} />}
                
                {timelineEvents.map((event, index) => (
                    <div key={index} className="absolute w-full flex items-center" style={{ top: `${event.position}%`, transform: 'translateY(-50%)' }}>
                        <div className={`absolute left-1/2 -translate-x-1/2 w-10 h-10 ${event.color} rounded-full flex items-center justify-center ring-4 ring-white shadow-md z-10`}>
                            {event.icon}
                        </div>
                        <div className={`absolute w-full flex ${index % 2 !== 0 ? 'justify-start pl-[calc(50%+2.5rem)]' : 'justify-end pr-[calc(50%+2.5rem)]'}`}>
                            <div className="w-full max-w-xs">
                                <TimelineCard event={event} side={index % 2 !== 0 ? 'right' : 'left'} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;