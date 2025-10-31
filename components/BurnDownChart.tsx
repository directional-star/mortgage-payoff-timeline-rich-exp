import React, { useState, useMemo } from 'react';
import { CalculationResults, AmortizationDataPoint, LoanDetails, ExtraPayment } from '../types';

interface ForecastScenario {
    name: string;
    data: AmortizationDataPoint[];
    color: string;
    extraPayment: number;
}

interface BurnDownChartProps {
    results: CalculationResults;
    loanDetails: LoanDetails;
    forecasts: ForecastScenario[];
    extraPayment: ExtraPayment;
    monthlyPayment: number;
}

interface ChartSeries {
    name: string;
    data: AmortizationDataPoint[];
    color: string;
    strokeWidth: number;
    dashArray: string;
    extraPayment: number;
}

const BurnDownChart: React.FC<BurnDownChartProps> = ({ results, loanDetails, forecasts, extraPayment, monthlyPayment }) => {
    const { scenario } = results;
    const [tooltip, setTooltip] = useState<{ 
        x: number, 
        y: number, 
        date: string, 
        balance: number, 
        color: string,
        monthlyPayment: number,
        extraPayment: number,
        totalPayment: number
    } | null>(null);
    const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);

    const allSeries: ChartSeries[] = useMemo(() => [
        { name: 'Your Scenario', data: scenario.data, color: '#4ade80', strokeWidth: 3, dashArray: 'none', extraPayment: extraPayment.monthly },
        ...forecasts.map(f => ({ ...f, strokeWidth: 2, dashArray: '5,5' }))
    ], [scenario, forecasts, extraPayment]);

    if (!scenario.data.length) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-brand-dark mb-2">Loan Balance Over Time</h3>
                <p className="text-gray-500">Not enough data to display chart.</p>
            </div>
        );
    }
    
    const PADDING = 60;
    const SVG_WIDTH = 800;
    const SVG_HEIGHT = 400;
    const CHART_WIDTH = SVG_WIDTH - PADDING * 2;
    const CHART_HEIGHT = SVG_HEIGHT - PADDING * 1.5;

    const initialPrincipal = loanDetails.principal;
    const maxBalance = initialPrincipal;
    const maxMonths = Math.max(0, ...allSeries.map(s => s.data.length));

    const getPathData = (data: AmortizationDataPoint[]) => {
        if (!data.length || maxMonths === 0) return "";
        const points = [{ month: 0, remainingBalance: initialPrincipal, date: new Date() }, ...data];
        return points.map((point, i) => {
            const x = (point.month / maxMonths) * CHART_WIDTH + PADDING;
            const y = CHART_HEIGHT - (point.remainingBalance / maxBalance) * (CHART_HEIGHT - PADDING) + PADDING;
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(' ');
    };
    
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (selectedLineIndex === null) {
            setTooltip(null);
            return;
        }

        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        if (cursorPoint.x < PADDING || cursorPoint.x > PADDING + CHART_WIDTH || maxMonths === 0) {
            setTooltip(null);
            return;
        }

        const monthRatio = (cursorPoint.x - PADDING) / CHART_WIDTH;
        const monthIndex = Math.round(monthRatio * maxMonths);
        
        const selectedSeries = allSeries[selectedLineIndex];
        const dataPoint = selectedSeries.data[monthIndex - 1];
        
        if (dataPoint) {
            const y = CHART_HEIGHT - (dataPoint.remainingBalance / maxBalance) * (CHART_HEIGHT - PADDING) + PADDING;
            const extra = selectedSeries.extraPayment;
            const total = monthlyPayment + extra;
            setTooltip({
                x: cursorPoint.x,
                y,
                date: dataPoint.date.toLocaleDateString('en-us', {month: 'short', year: 'numeric'}),
                balance: dataPoint.remainingBalance,
                color: selectedSeries.color,
                monthlyPayment,
                extraPayment: extra,
                totalPayment: total,
            });
        } else {
             setTooltip(null);
        }
    };

    const yAxisLabels = Array.from({ length: 6 }, (_, i) => {
        const value = maxBalance * (i / 5);
        const y = CHART_HEIGHT - (value / maxBalance) * (CHART_HEIGHT - PADDING) + PADDING;
        return { value, y };
    });

    const totalYears = Math.ceil(maxMonths / 12);
    const numXLabels = Math.min(10, totalYears);
    const yearIncrement = totalYears > numXLabels ? Math.ceil(totalYears / numXLabels) : 1;
    const xAxisLabels = [];
    if (maxMonths > 0) {
        for (let year = 0; year <= totalYears; year += yearIncrement) {
            const month = year * 12;
            if (month > maxMonths && year > 0 && xAxisLabels.length > 1) continue;
            const x = (Math.min(month, maxMonths) / maxMonths) * CHART_WIDTH + PADDING;
            xAxisLabels.push({ label: `Year ${year}`, x });
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <h3 className="text-lg font-semibold text-brand-dark mb-2">Loan Balance Over Time</h3>
            <p className="text-sm text-gray-500 mb-4">Click on a line to select it and see details.</p>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="min-w-[600px]" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)} onClick={() => setSelectedLineIndex(null)}>
                    <text x={PADDING} y={PADDING - 35} fontSize="12" fill="#6b7280">Outstanding Balance ($)</text>
                    <text x={SVG_WIDTH - PADDING} y={SVG_HEIGHT - 5} textAnchor="end" fontSize="12" fill="#6b7280">Date</text>

                    {yAxisLabels.map(({ value, y }, i) => (
                        <g key={`y-axis-${i}`}>
                            <line x1={PADDING} y1={y} x2={CHART_WIDTH + PADDING} y2={y} stroke="#e5e7eb" />
                            <text x={PADDING - 10} y={y + 5} textAnchor="end" fill="#6b7280" fontSize="12">
                                ${Math.round(value / 1000)}k
                            </text>
                        </g>
                    ))}
                    {xAxisLabels.map(({ label, x }, i) => (
                        <g key={`x-axis-${i}`}>
                            <text x={x} y={CHART_HEIGHT + PADDING + 20} textAnchor="middle" fill="#6b7280" fontSize="12">{label}</text>
                        </g>
                    ))}
                    
                    <line x1={PADDING} y1={PADDING} x2={PADDING} y2={CHART_HEIGHT + PADDING} stroke="#9ca3af" />
                    <line x1={PADDING} y1={CHART_HEIGHT + PADDING} x2={CHART_WIDTH + PADDING} y2={CHART_HEIGHT + PADDING} stroke="#9ca3af" />

                    {allSeries.map((series, i) => (
                        <path
                            key={i}
                            d={getPathData(series.data)}
                            fill="none"
                            stroke={series.color}
                            strokeWidth={selectedLineIndex === i ? 5 : series.strokeWidth}
                            strokeDasharray={series.dashArray}
                            className="cursor-pointer transition-all duration-200"
                            opacity={selectedLineIndex !== null && selectedLineIndex !== i ? 0.3 : 1}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLineIndex(i);
                            }}
                        />
                    ))}

                    {tooltip && selectedLineIndex !== null && (
                        <g>
                            <line x1={tooltip.x} y1={PADDING} x2={tooltip.x} y2={CHART_HEIGHT + PADDING} stroke="#4b5563" strokeDasharray="3,3" />
                            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill={tooltip.color} stroke="white" strokeWidth="2" />
                            <foreignObject x={tooltip.x > SVG_WIDTH / 2 ? tooltip.x - 220 : tooltip.x + 15} y={tooltip.y - 45} width="210" height="75">
                                <div className="bg-gray-800 text-white p-2 rounded-md shadow-lg text-xs">
                                    <div><strong>{tooltip.date}</strong></div>
                                    <div>Balance: ${tooltip.balance.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                                    <div className="mt-1 pt-1 border-t border-gray-600">
                                        {tooltip.monthlyPayment.toLocaleString(undefined, {maximumFractionDigits: 0})} (mthly) + 
                                        {' '}{tooltip.extraPayment.toLocaleString(undefined, {maximumFractionDigits: 0})} (extra) = 
                                        {' '}{tooltip.totalPayment.toLocaleString(undefined, {maximumFractionDigits: 0})} (total)
                                    </div>
                                </div>
                            </foreignObject>
                        </g>
                    )}
                    
                    <g transform={`translate(${PADDING}, ${CHART_HEIGHT + PADDING + 40})`}>
                         {allSeries.map((s, i) => (
                            <g
                                key={i}
                                transform={`translate(${i * 120}, 0)`}
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLineIndex(i);
                                }}
                            >
                                {s.dashArray === 'none' ? (
                                    <rect x="0" y="0" width="10" height="10" fill={s.color} />
                                ) : (
                                    <line x1="0" y1="5" x2="10" y2="5" stroke={s.color} strokeWidth="2" strokeDasharray="2,2" />
                                )}
                               <text x="15" y="10" fill="#4b5563" fontSize="12" style={{fontWeight: selectedLineIndex === i ? 'bold' : 'normal'}}>{s.name}</text>
                            </g>
                        ))}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default BurnDownChart;