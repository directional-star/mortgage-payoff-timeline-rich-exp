import { GoogleGenAI, Type } from "@google/genai";
import { LoanDetails, ExtraPayment, LifeEvent, CalculationResults, FinancialInsights } from '../types';

export const getFinancialInsights = async (
    loanDetails: LoanDetails,
    extraPayment: ExtraPayment,
    lifeEvents: LifeEvent[],
    results: CalculationResults
): Promise<FinancialInsights> => {
    const defaultErrorResponse: FinancialInsights = {
        actionableAdvice: [
            "Could not fetch AI-powered insights at this time. Please check your API key and network connection.",
            "Remember that making extra payments is a powerful way to build equity and save on interest.",
            "Keep up the great work on your financial journey!"
        ],
        futureConsiderations: []
    };

    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return {
            actionableAdvice: ["API Key not configured. Please set the API_KEY environment variable to get AI insights."],
            futureConsiderations: []
        };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const originalMonths = loanDetails.remainingTermYears * 12 + loanDetails.remainingTermMonths;
    const yearsSaved = (originalMonths - results.scenario.data.length) / 12;
    const interestSaved = results.original.totalInterest - results.scenario.totalInterest;
    const payoffAge = Math.floor(loanDetails.age + (results.scenario.data.length / 12));

    const lifeEventsString = lifeEvents.length > 0
        ? `
        Here are some of their planned life events for context:
        ${lifeEvents.map(e => `- ${e.name} at age ${e.age}`).join('\n')}
        `
        : "They have not specified any custom life events.";

    const prompt = `
        Act as a savvy financial coach and long-term planner. Your tone should be positive, empowering, and jargon-free.
        The user is already making extra payments.

        **Part 1: Actionable Advice**
        Based on these mortgage details for a person aged ${loanDetails.age}:
        - Remaining Principal: $${loanDetails.principal.toLocaleString()}
        - Interest Rate: ${loanDetails.interestRate}%
        - Extra Monthly Payment: $${extraPayment.monthly.toLocaleString()}
        - With this, they'll pay off the loan ${yearsSaved.toFixed(1)} years early, save $${interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })} in interest, and be mortgage-free at age ${payoffAge}.

        Provide 3 concise, actionable strategies on how they could accelerate their mortgage payoff even further. Offer specific ideas like the pros/cons of bi-weekly payments, loan recasting, or lifestyle tweaks.

        **Part 2: Future Considerations**
        Looking at their journey from age ${loanDetails.age} to payoff at age ${payoffAge}, predict 2-3 major financial or economic events a typical family might encounter. Base these on common life stages and economic cycles. Examples:
        - Financial impact of children's education costs.
        - Mid-career salary growth or job changes.
        - The importance of ramping up retirement savings.
        - General economic factors like inflation or interest rate shifts.
        ${lifeEventsString}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        actionableAdvice: {
                            type: Type.ARRAY,
                            description: "A list of practical strategies to accelerate mortgage payoff.",
                            items: { type: Type.STRING }
                        },
                        futureConsiderations: {
                            type: Type.ARRAY,
                            description: "A list of predicted financial or economic events to be aware of during the loan term.",
                            items: { type: Type.STRING }
                        }
                    }
                },
            },
        });
        
        const responseText = response.text.trim();
        // The API can sometimes wrap the JSON in markdown code fences (```json ... ```).
        // This regex robustly extracts the JSON content.
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : responseText;

        const parsedResponse = JSON.parse(jsonText);

        // Stricter check to ensure the response has the correct shape.
        if (parsedResponse && Array.isArray(parsedResponse.actionableAdvice) && Array.isArray(parsedResponse.futureConsiderations)) {
            return parsedResponse;
        }

        throw new Error("Invalid response format from API");

    } catch (error) {
        console.error("Error fetching financial insights:", error);
        return defaultErrorResponse;
    }
};