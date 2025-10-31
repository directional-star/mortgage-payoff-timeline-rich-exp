export interface LoanDetails {
  principal: number;
  interestRate: number;
  remainingTermYears: number;
  remainingTermMonths: number;
  age: number;
}

export interface ExtraPayment {
  monthly: number;
}

export interface LifeEvent {
  id: string;
  name: string;
  age: number;
}

export interface AmortizationDataPoint {
  month: number;
  date: Date;
  interest: number;
  principal: number;
  remainingBalance: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

export interface AmortizationSchedule {
  data: AmortizationDataPoint[];
  totalInterest: number;
  totalPaid: number;
  payoffDate: Date;
}

export interface CalculationResults {
  original: AmortizationSchedule;
  scenario: AmortizationSchedule;
}

export interface FinancialInsights {
  actionableAdvice: string[];
  futureConsiderations: string[];
}
