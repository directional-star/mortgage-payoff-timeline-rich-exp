import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LoanDetails, ExtraPayment, LifeEvent, CalculationResults, FinancialInsights } from './types';
import { calculateAmortization } from './services/amortizationCalculator';
import { getFinancialInsights } from './services/geminiService';
import LoanForm from './components/LoanForm';
import ScenarioForm from './components/ScenarioForm';
import LifeEventsForm from './components/LifeEventsForm';
import Summary from './components/Summary';
import BurnDownChart from './components/BurnDownChart';
import Timeline from './components/Timeline';
import FinancialCoach from './components/FinancialCoach';
import HouseIcon from './components/icons/HouseIcon';

const App: React.FC = () => {
    const [loanDetails, setLoanDetails] = useState<LoanDetails>(() => {
        const saved = localStorage.getItem('loanDetails');
        return saved ? JSON.parse(saved) : {
            principal: 807850,
            interestRate: 6.5,
            remainingTermYears: 28,
            remainingTermMonths: 0,
            age: 35,
        };
    });
    const [extraPayment, setExtraPayment] = useState<ExtraPayment>(() => {
        const saved = localStorage.getItem('extraPayment');
        return saved ? JSON.parse(saved) : { monthly: 6000 };
    });
    const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(() => {
        const saved = localStorage.getItem('lifeEvents');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [insights, setInsights] = useState<FinancialInsights | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    useEffect(() => {
        localStorage.setItem('loanDetails', JSON.stringify(loanDetails));
        localStorage.setItem('extraPayment', JSON.stringify(extraPayment));
        localStorage.setItem('lifeEvents', JSON.stringify(lifeEvents));
    }, [loanDetails, extraPayment, lifeEvents]);

    const calculationResults: CalculationResults | null = useMemo(() => {
        if (loanDetails.principal <= 0 || loanDetails.interestRate <= 0 || (loanDetails.remainingTermYears <= 0 && loanDetails.remainingTermMonths <= 0)) {
            return null;
        }
        const original = calculateAmortization(loanDetails, { monthly: 0 });
        const scenario = calculateAmortization(loanDetails, extraPayment);
        return { original, scenario };
    }, [loanDetails, extraPayment]);
    
    const monthlyPayment = useMemo(() => {
        const { principal, interestRate, remainingTermYears, remainingTermMonths } = loanDetails;
        if (principal <= 0 || interestRate <= 0 || (remainingTermYears <= 0 && remainingTermMonths <= 0)) {
            return 0;
        }
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = remainingTermYears * 12 + remainingTermMonths;
        if (numberOfPayments <= 0) return 0;

        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        return isNaN(payment) ? 0 : payment;
    }, [loanDetails]);

    const forecastScenarios = useMemo(() => {
        if (!calculationResults || monthlyPayment === 0) return [];
        
        const extra10Payment = extraPayment.monthly + monthlyPayment * 0.10;
        const extra20Payment = extraPayment.monthly + monthlyPayment * 0.20;
        const extra30Payment = extraPayment.monthly + monthlyPayment * 0.30;
        
        const extra10 = calculateAmortization(loanDetails, { monthly: extra10Payment });
        const extra20 = calculateAmortization(loanDetails, { monthly: extra20Payment });
        const extra30 = calculateAmortization(loanDetails, { monthly: extra30Payment });
        
        return [
            { name: '+10%', data: extra10.data, color: '#f59e0b', extraPayment: extra10Payment },
            { name: '+20%', data: extra20.data, color: '#ef4444', extraPayment: extra20Payment },
            { name: '+30%', data: extra30.data, color: '#8b5cf6', extraPayment: extra30Payment },
        ];
    }, [loanDetails, extraPayment, calculationResults, monthlyPayment]);


    const handleGetInsights = useCallback(async () => {
        if (!calculationResults) return;
        setIsLoadingInsights(true);
        setInsights(null);
        try {
            const result = await getFinancialInsights(loanDetails, extraPayment, lifeEvents, calculationResults);
            setInsights(result);
        } catch (error) {
            console.error("Failed to get financial insights:", error);
        } finally {
            setIsLoadingInsights(false);
        }
    }, [loanDetails, extraPayment, lifeEvents, calculationResults]);

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
                    <HouseIcon className="h-8 w-8 text-brand-primary" />
                    <h1 className="text-2xl font-bold text-brand-dark ml-3">Mortgage Payoff Accelerator</h1>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <LoanForm loanDetails={loanDetails} setLoanDetails={setLoanDetails} />
                        <ScenarioForm extraPayment={extraPayment} setExtraPayment={setExtraPayment} />
                        <LifeEventsForm lifeEvents={lifeEvents} setLifeEvents={setLifeEvents} currentAge={loanDetails.age} />
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        {calculationResults ? (
                            <>
                                <Summary results={calculationResults} loanDetails={loanDetails} />
                                <BurnDownChart 
                                    results={calculationResults} 
                                    loanDetails={loanDetails} 
                                    forecasts={forecastScenarios}
                                    extraPayment={extraPayment}
                                    monthlyPayment={monthlyPayment}
                                />
                                <Timeline results={calculationResults} lifeEvents={lifeEvents} loanDetails={loanDetails} />
                                <FinancialCoach
                                    insights={insights}
                                    isLoading={isLoadingInsights}
                                    onGetInsights={handleGetInsights}
                                    hasResults={!!calculationResults}
                                />
                            </>
                        ) : (
                            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                                <h2 className="text-xl font-semibold text-gray-700">Enter your loan details to get started.</h2>
                                <p className="text-gray-500 mt-2">Fill out the form on the left to see your mortgage payoff projections.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <footer className="text-center py-4 mt-8">
                <p className="text-sm text-gray-500">© {new Date().getFullYear()} Mortgage Milestone Visualizer. Plan your future with clarity.</p>
            </footer>
        </div>
    );
};

export default App;