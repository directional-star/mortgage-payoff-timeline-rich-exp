import React from 'react';
import { CalculationResults, LifeEvent, LoanDetails } from '../types';
import HouseIcon from './icons/HouseIcon';
import TrophyIcon from './icons/TrophyIcon';
import GraduationCapIcon from './icons/GraduationCapIcon';
import PiggyBankIcon from './icons/PiggyBankIcon';
import SparklesIcon from './icons/SparklesIcon';

interface TimelineProps {
    results: CalculationResults;
    lifeEvents: LifeEvent[];
    loanDetails: LoanDetails;
}

const Timeline: React.FC<TimelineProps> = ({ results, lifeEvents, loanDetails }) => {
    const { scenario } = results;
    const { age: startAge, principal } = loanDetails;
    const startDate = new Date(); // Timeline starts from today

    const events = [];

    // Add start event
    events.push({
        date: startDate,
        age: startAge,
        title: "Your Journey Starts Here",
        description: `Remaining Principal: $${principal.toLocaleString()}`,
        icon: <HouseIcon className="h-6 w-6 text-white" />,
        color: "bg-brand-primary"
    });

    const milestones = [
        { percent: 0.25, title: "25% Paid Off", achieved: false },
        { percent: 0.50, title: "50% Paid Off", achieved: false },
        { percent: 0.75, title: "75% Paid Off", achieved: false },
    ];

    const balanceMilestones = [
        { balance: 200000, title: "Under $200k Balance!", achieved: false },
        { balance: 100000, title: "Under $100k Balance!", achieved: false },
    ];


    for (const dataPoint of scenario.data) {
        for (const milestone of milestones) {
            if (!milestone.achieved && (dataPoint.totalPrincipalPaid / principal) >= milestone.percent) {
                const ageAtMilestone = startAge + (dataPoint.month / 12);
                events.push({
                    date: dataPoint.date,
                    age: Math.floor(ageAtMilestone),
                    title: milestone.title,
                    description: `You're making great progress!`,
                    icon: <PiggyBankIcon className="h-6 w-6 text-white" />,
                    color: "bg-brand-secondary"
                });
                milestone.achieved = true;
            }
        }
        for (const milestone of balanceMilestones) {
            if (!milestone.achieved && principal > milestone.balance && dataPoint.remainingBalance <= milestone.balance) {
                const ageAtMilestone = startAge + (dataPoint.month / 12);
                events.push({
                    date: dataPoint.date,
                    age: Math.floor(ageAtMilestone),
                    title: milestone.title,
                    description: `The finish line is getting closer!`,
                    icon: <SparklesIcon className="h-6 w-6 text-white" />,
                    color: "bg-blue-500"
                });
                milestone.achieved = true;
            }
        }
    }

    // Add life events
    lifeEvents.forEach(event => {
        const yearsFromStart = event.age - startAge;
        const eventDate = new Date(startDate);
        eventDate.setFullYear(startDate.getFullYear() + yearsFromStart);
        events.push({
            date: eventDate,
            age: event.age,
            title: event.name,
            description: `A personal milestone for you.`,
            icon: <GraduationCapIcon className="h-6 w-6 text-white" />,
            color: "bg-brand-accent"
        });
    });

    // Add payoff event
    const payoffAge = startAge + (scenario.data.length / 12);
    events.push({
        date: scenario.payoffDate,
        age: Math.floor(payoffAge),
        title: "Mortgage Free!",
        description: "Congratulations! You've paid off your loan.",
        icon: <TrophyIcon className="h-6 w-6 text-white" />,
        color: "bg-green-600"
    });
    
    const sortedEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
        <div className="mt-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Your Personalized Timeline</h2>
            <div className="relative border-l-2 border-brand-primary ml-6">
                {sortedEvents.map((event, index) => (
                    <div key={index} className="mb-10 ml-10">
                        <span className={`absolute -left-[1.35rem] flex items-center justify-center w-10 h-10 ${event.color} rounded-full ring-8 ring-white`}>
                            {event.icon}
                        </span>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-brand-dark">{event.title}</h3>
                                <time className="text-sm font-normal text-gray-500">{event.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</time>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <p className="text-xs text-brand-primary font-semibold mt-2">Your Age: {event.age}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;