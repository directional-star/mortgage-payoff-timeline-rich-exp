
import { AmortizationSchedule, AmortizationDataPoint, LoanDetails, ExtraPayment } from '../types';

export function calculateAmortization(loanDetails: LoanDetails, extraPayment: ExtraPayment): AmortizationSchedule {
    const { principal, interestRate, remainingTermYears, remainingTermMonths } = loanDetails;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = remainingTermYears * 12 + remainingTermMonths;

    if (numberOfPayments <= 0) {
        return {
            data: [],
            totalInterest: 0,
            totalPaid: principal,
            payoffDate: new Date(),
        };
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    let remainingBalance = principal;
    let totalInterest = 0;
    let totalPrincipalPaid = 0;
    const data: AmortizationDataPoint[] = [];
    const startDate = new Date(); // Calculations start from today

    for (let i = 1; i <= numberOfPayments && remainingBalance > 0; i++) {
        const interest = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        const extra = extraPayment.monthly || 0;
        
        let actualPrincipalPaid = principalPayment + extra;
        if (remainingBalance - actualPrincipalPaid < 0) {
            actualPrincipalPaid = remainingBalance;
        }

        remainingBalance -= actualPrincipalPaid;
        totalInterest += interest;
        totalPrincipalPaid += actualPrincipalPaid;
        
        const currentDate = new Date(startDate);
        currentDate.setMonth(startDate.getMonth() + i - 1);

        data.push({
            month: i,
            date: currentDate,
            interest,
            principal: actualPrincipalPaid,
            remainingBalance,
            totalInterestPaid: totalInterest,
            totalPrincipalPaid: totalPrincipalPaid,
        });
    }

    const payoffDate = new Date(startDate);
    if(data.length > 0) {
        payoffDate.setMonth(startDate.getMonth() + data.length - 1);
    }
    
    return {
        data,
        totalInterest,
        totalPaid: principal + totalInterest,
        payoffDate,
    };
}
