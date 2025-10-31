
import React from 'react';
import { CalculationResults, LoanDetails } from '../types';

interface SummaryProps {
    results: CalculationResults;
    loanDetails: LoanDetails;
}

const StatCard: React.FC<{ title: string; value: string; isHighlighted?: boolean }> = ({ title, value, isHighlighted }) => (
    <div className={`p-4 rounded-lg ${isHighlighted ? 'bg-green-100' : 'bg-blue-50'}`}>
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${isHighlighted ? 'text-green-700' : 'text-brand-primary'}`}>{value}</p>
    </div>
);

const Summary: React.FC<SummaryProps> = ({ results, loanDetails }) => {
    const { original, scenario } = results;

    const originalPayoff = original.payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const scenarioPayoff = scenario.payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const originalMonths = loanDetails.remainingTermYears * 12 + loanDetails.remainingTermMonths;
    const scenarioMonths = scenario.data.length;
    const yearsSaved = (originalMonths - scenarioMonths) / 12;
    const interestSaved = original.totalInterest - scenario.totalInterest;

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Your Mortgage Outlook</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Original Payoff" value={originalPayoff} />
                <StatCard title="New Payoff" value={scenarioPayoff} isHighlighted />
                <StatCard title="Interest Saved" value={`$${interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} isHighlighted />
                <StatCard title="Time Saved" value={`${yearsSaved.toFixed(1)} years`} isHighlighted />
            </div>
        </div>
    );
};

export default Summary;
