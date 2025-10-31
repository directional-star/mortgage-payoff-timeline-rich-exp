import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import CalendarIcon from './icons/CalendarIcon';
import { FinancialInsights } from '../types';

interface FinancialCoachProps {
    insights: FinancialInsights | null;
    isLoading: boolean;
    onGetInsights: () => void;
    hasResults: boolean;
}

const FinancialCoach: React.FC<FinancialCoachProps> = ({ insights, isLoading, onGetInsights, hasResults }) => {
    return (
        <div className="mt-8 animate-fade-in">
            <div className="bg-gradient-to-br from-brand-primary to-blue-800 p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center mb-4">
                    <SparklesIcon className="h-8 w-8 text-brand-accent mr-3" />
                    <h3 className="text-2xl font-bold">AI Financial Coach</h3>
                </div>
                {!hasResults ? (
                    <p className="text-blue-100">Calculate your mortgage scenario first to unlock personalized AI insights.</p>
                ) : isLoading ? (
                    <p className="text-center text-blue-100">Analyzing your data and generating insights...</p>
                ) : !insights ? (
                    <div className="text-center">
                        <p className="mb-4 text-blue-100">Ready for personalized tips and future predictions based on your plan?</p>
                        <button
                            onClick={onGetInsights}
                            className="bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition duration-300 transform hover:scale-105"
                        >
                            Get My Insights
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {insights.actionableAdvice.length > 0 && (
                            <div>
                                <div className="flex items-center mb-2">
                                    <SparklesIcon className="h-5 w-5 text-yellow-300 mr-2" />
                                    <h4 className="font-semibold text-lg">Actionable Advice</h4>
                                </div>
                                <ul className="space-y-2 list-disc list-inside text-blue-100 pl-2">
                                    {insights.actionableAdvice.map((insight, index) => <li key={`advice-${index}`}>{insight}</li>)}
                                </ul>
                            </div>
                        )}
                        {insights.futureConsiderations.length > 0 && (
                             <div>
                                <div className="flex items-center mb-2">
                                    <CalendarIcon className="h-5 w-5 text-yellow-300 mr-2" />
                                    <h4 className="font-semibold text-lg">Future Considerations</h4>
                                </div>
                                <ul className="space-y-2 list-disc list-inside text-blue-100 pl-2">
                                    {insights.futureConsiderations.map((insight, index) => <li key={`future-${index}`}>{insight}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialCoach;
