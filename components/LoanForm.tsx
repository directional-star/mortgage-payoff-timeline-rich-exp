
import React from 'react';
import { LoanDetails } from '../types';

interface LoanFormProps {
    loanDetails: LoanDetails;
    setLoanDetails: React.Dispatch<React.SetStateAction<LoanDetails>>;
}

const InputField: React.FC<{ id: string; label: string; type: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; step?: string; min?: string; max?: string; adornment?: string; }> = 
({ id, label, type, value, onChange, step, min, max, adornment }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            {adornment && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center"><span className="text-gray-500 sm:text-sm">{adornment}</span></div>}
            <input
                type={type}
                name={id}
                id={id}
                value={value}
                onChange={onChange}
                step={step}
                min={min}
                max={max}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm ${adornment ? 'pl-7' : ''}`}
            />
        </div>
    </div>
);

const LoanForm: React.FC<LoanFormProps> = ({ loanDetails, setLoanDetails }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoanDetails(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Mortgage Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="principal" label="Remaining Principal" type="number" value={loanDetails.principal} onChange={handleChange} min="0" adornment="$"/>
                <InputField id="interestRate" label="Interest Rate (%)" type="number" value={loanDetails.interestRate} onChange={handleChange} step="0.01" min="0" max="25" adornment="%"/>
                
                <div className="md:col-span-2">
                    <p className="block text-sm font-medium text-gray-700 mb-1">Remaining Term</p>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField id="remainingTermYears" label="Years" type="number" value={loanDetails.remainingTermYears} onChange={handleChange} min="0" max="50"/>
                        <InputField id="remainingTermMonths" label="Months" type="number" value={loanDetails.remainingTermMonths} onChange={handleChange} min="0" max="11"/>
                    </div>
                </div>

                <InputField id="age" label="Your Current Age" type="number" value={loanDetails.age} onChange={handleChange} min="18" max="100"/>
            </div>
        </div>
    );
};

export default LoanForm;
