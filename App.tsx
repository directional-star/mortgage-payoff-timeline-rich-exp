import React, { useState, useCallback, useEffect } from 'react';
import { LoanDetails, ExtraPayment, LifeEvent, CalculationResults, FinancialInsights } from './types';
import LoanForm from './components/LoanForm';
import ScenarioForm from './components/ScenarioForm';
import LifeEventsForm from './components/LifeEventsForm';
import Summary from './components/Summary';
import Timeline from './components/Timeline';
import FinancialCoach from './components/FinancialCoach';
import { calculateAmortization } from './services/amortizationCalculator';
import { getFinancialInsights } from './services/geminiService';
import HouseIcon from './components/icons/HouseIcon';

const LOCAL_STORAGE_KEY = 'mortgageVisualizerData';

const getInitialState = () => {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Basic validation to ensure saved data is not malformed
            if (parsed.loanDetails && parsed.extraPayment && Array.isArray(parsed.lifeEvents)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to parse state from localStorage", error);
    }
    
    // Return default state if nothing is saved or if data is corrupt
    return {
        loanDetails: {
            principal: 300000,
            interestRate: 6.5,
            remainingTermYears: 28,
            remainingTermMonths: 6,
            age: 35
        },
        extraPayment: { monthly: 0 },
        lifeEvents: []
    };
};


const App: React.FC = () => {
    const initialState = getInitialState();
    const [loanDetails, setLoanDetails] = useState<LoanDetails>(initialState.loanDetails);
    const [extraPayment, setExtraPayment] = useState<ExtraPayment>(initialState.extraPayment);
    const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(initialState.lifeEvents);
    
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [insights, setInsights] = useState<FinancialInsights | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const dataToSave = {
                loanDetails,
                extraPayment,
                lifeEvents,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [loanDetails, extraPayment, lifeEvents]);


    const handleCalculate = useCallback(() => {
        try {
            setError(null);
            setInsights(null); // Reset insights on new calculation
            const original = calculateAmortization(loanDetails, { monthly: 0 });
            const scenario = calculateAmortization(loanDetails, extraPayment);
            setResults({ original, scenario });
        } catch (err) {
            setError("Could not calculate the mortgage. Please check your inputs.");
            console.error(err);
        }
    }, [loanDetails, extraPayment]);

    const handleGetInsights = async () => {
        if (!results) return;
        setIsLoadingInsights(true);
        const fetchedInsights = await getFinancialInsights(loanDetails, extraPayment, lifeEvents, results);
        setInsights(fetchedInsights);
        setIsLoadingInsights(false);
    };

    return (
        <div className="bg-brand-light min-h-screen font-sans">
            <header className="bg-brand-dark shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
                    <HouseIcon className="h-8 w-8 text-brand-accent"/>
                    <h1 className="text-2xl font-bold text-white ml-3">Mortgage Milestone Visualizer</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <LoanForm loanDetails={loanDetails} setLoanDetails={setLoanDetails} />
                        <ScenarioForm extraPayment={extraPayment} setExtraPayment={setExtraPayment} />
                        <LifeEventsForm lifeEvents={lifeEvents} setLifeEvents={setLifeEvents} currentAge={loanDetails.age} />
                        <button
                            onClick={handleCalculate}
                            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition duration-300 text-lg shadow-lg"
                        >
                            Visualize My Journey
                        </button>
                    </div>

                    <div className="lg:col-span-2">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                        
                        {results ? (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <Summary results={results} loanDetails={loanDetails} />
                                <Timeline results={results} lifeEvents={lifeEvents} loanDetails={loanDetails} />
                                <FinancialCoach insights={insights} isLoading={isLoadingInsights} onGetInsights={handleGetInsights} hasResults={!!results} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center bg-white p-10 rounded-lg shadow-md text-center h-full">
                                 <svg className="w-16 h-16 text-brand-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6M9 7l2-2m0 0l2 2m-2-2v4" />
                                </svg>
                                <h2 className="text-xl font-semibold text-brand-dark">Welcome to your financial future.</h2>
                                <p className="text-gray-600 mt-2">Your details are saved automatically. Fill in or adjust your mortgage info and click "Visualize My Journey" to see your personalized payoff timeline.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <footer className="text-center py-4 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Mortgage Milestone Visualizer. Plan your future with clarity.</p>
            </footer>
        </div>
    );
};

export default App;
