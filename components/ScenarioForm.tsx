
import React from 'react';
import { ExtraPayment } from '../types';

interface ScenarioFormProps {
    extraPayment: ExtraPayment;
    setExtraPayment: React.Dispatch<React.SetStateAction<ExtraPayment>>;
}

const ScenarioForm: React.FC<ScenarioFormProps> = ({ extraPayment, setExtraPayment }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setExtraPayment(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">"What If" Scenario</h3>
            <p className="text-sm text-gray-600 mb-4">See how extra payments can accelerate your payoff date and save you money.</p>
            <div>
                <label htmlFor="monthly" className="block text-sm font-medium text-gray-700">Extra Monthly Payment</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                        type="number"
                        name="monthly"
                        id="monthly"
                        value={extraPayment.monthly}
                        onChange={handleChange}
                        min="0"
                        className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                        placeholder="e.g., 250"
                    />
                </div>
            </div>
        </div>
    );
};

export default ScenarioForm;
