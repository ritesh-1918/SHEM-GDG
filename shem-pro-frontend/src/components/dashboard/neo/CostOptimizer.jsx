import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ChartBarIcon,
    CalculatorIcon,
    ClipboardDocumentCheckIcon,
    BoltIcon,
    PrinterIcon,
    CogIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    XMarkIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

// API base URL - uses Render production or localhost for development
const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/peakHours`
    : 'http://localhost:5000/api/peakHours';

// Cache key for localStorage
const CACHE_KEY = 'costOptimizerData';
const CACHE_EXPIRY_KEY = 'costOptimizerExpiry';


// Effort badge component
const EffortBadge = ({ effort }) => {
    const colors = {
        easy: 'bg-dashboard-textSecondary/10 text-dashboard-textSecondary border-dashboard-textSecondary/20',
        medium: 'bg-dashboard-textSecondary/30 text-dashboard-text border-dashboard-textSecondary/50',
        hard: 'bg-dashboard-text text-dashboard-card border-transparent'
    };

    return (
        <span className={`px-2 py-0.5 text-xs rounded-full border ${colors[effort]}`}>
            {effort.charAt(0).toUpperCase() + effort.slice(1)}
        </span>
    );
};

// Simple bar chart component
const BarChart = ({ peakUnits, offPeakUnits, peakCost, offPeakCost }) => {
    const { t } = useTranslation();
    const maxUnits = Math.max(peakUnits, offPeakUnits);
    const peakHeight = (peakUnits / maxUnits) * 100;
    const offPeakHeight = (offPeakUnits / maxUnits) * 100;

    return (
        <div className="flex items-end justify-center gap-8 h-48 mt-4">
            {/* Peak bar */}
            <div className="flex flex-col items-center">
                <div className="text-sm text-dashboard-textSecondary mb-2">₹{peakCost}</div>
                <div
                    className="w-20 bg-dashboard-textSecondary rounded-t-lg transition-all duration-500"
                    style={{ height: `${peakHeight}%`, minHeight: '20px' }}
                />
                <div className="mt-2 text-center">
                    <p className="text-dashboard-text font-bold">{peakUnits} {t('common.units')}</p>
                    <p className="text-xs text-dashboard-textSecondary">{t('peakHours.peakHours')}</p>
                </div>
            </div>

            {/* Off-peak bar */}
            <div className="flex flex-col items-center">
                <div className="text-sm text-dashboard-textSecondary mb-2">₹{offPeakCost}</div>
                <div
                    className="w-20 bg-dashboard-text rounded-t-lg transition-all duration-500"
                    style={{ height: `${offPeakHeight}%`, minHeight: '20px' }}
                />
                <div className="mt-2 text-center">
                    <p className="text-dashboard-text font-bold">{offPeakUnits} {t('common.units')}</p>
                    <p className="text-xs text-dashboard-textSecondary">{t('peakHours.offPeakHours')}</p>
                </div>
            </div>
        </div>
    );
};

// Tab 1: Current Costs
const CurrentCostsTab = ({ data }) => {
    const { t } = useTranslation();
    const totalUnits = data.totalUnits || 120;
    const peakUnits = data.peakUnits || 60;
    const offPeakUnits = data.offPeakUnits || 60;
    const peakRate = data.peakRate || 8;
    const offPeakRate = data.offPeakRate || 4;
    const peakCost = peakUnits * peakRate;
    const offPeakCost = offPeakUnits * offPeakRate;
    const totalCost = peakCost + offPeakCost;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-dashboard-textSecondary/10 rounded-xl p-4">
                    <p className="text-sm text-dashboard-textSecondary">{t('costOptimizer.totalConsumption')}</p>
                    <p className="text-2xl font-bold text-dashboard-text">{totalUnits} <span className="text-sm font-normal">{t('common.units')}</span></p>
                </div>
                <div className="bg-dashboard-card rounded-xl p-4 border border-dashboard-textSecondary/20">
                    <p className="text-sm text-dashboard-textSecondary">{t('costOptimizer.totalCost')}</p>
                    <p className="text-2xl font-bold text-dashboard-text">₹{totalCost}</p>
                </div>
            </div>

            {/* Breakdown */}
            <div className="bg-dashboard-textSecondary/10 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-medium text-dashboard-text mb-3">{t('costOptimizer.costBreakdown')}</h4>

                <div className="flex justify-between items-center py-2 border-b border-dashboard-textSecondary/20">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-dashboard-textSecondary rounded-full" />
                        <span className="text-dashboard-textSecondary">{t('peakHours.peakHours')} ({peakUnits} {t('common.units')} @ ₹{peakRate})</span>
                    </div>
                    <span className="text-dashboard-text font-bold">₹{peakCost}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-dashboard-textSecondary/20">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-dashboard-text rounded-full" />
                        <span className="text-dashboard-textSecondary">{t('peakHours.offPeakHours')} ({offPeakUnits} {t('common.units')} @ ₹{offPeakRate})</span>
                    </div>
                    <span className="text-dashboard-text font-bold">₹{offPeakCost}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <span className="text-dashboard-text font-medium">{t('analytics.totalThisWeek')}</span>
                    <span className="text-dashboard-text font-bold text-lg">₹{totalCost}</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-dashboard-textSecondary/10 rounded-xl p-4">
                <h4 className="text-sm font-medium text-dashboard-text mb-2">{t('costOptimizer.peakVsOffPeak')}</h4>
                <BarChart
                    peakUnits={peakUnits}
                    offPeakUnits={offPeakUnits}
                    peakCost={peakCost}
                    offPeakCost={offPeakCost}
                />
            </div>
        </div>
    );
};

// Tab 2: What-If Calculator
const WhatIfTab = ({ data }) => {
    const { t } = useTranslation();
    const [peakReduction, setPeakReduction] = useState(20);

    const peakUnits = data.peakUnits || 60;
    const peakRate = data.peakRate || 8;
    const offPeakRate = data.offPeakRate || 4;

    // Calculate savings based on reduction
    const unitsShifted = peakUnits * (peakReduction / 100);
    const currentPeakCost = peakUnits * peakRate;
    const newPeakCost = (peakUnits - unitsShifted) * peakRate;
    const additionalOffPeakCost = unitsShifted * offPeakRate;
    const monthlySavings = currentPeakCost - newPeakCost - additionalOffPeakCost + (unitsShifted * offPeakRate);
    const actualSavings = unitsShifted * (peakRate - offPeakRate);
    const annualSavings = actualSavings * 12;

    // Scenario cards
    const scenarios = [
        { appliance: t('common.ac'), percent: 20, savings: 156 },
        { appliance: t('common.waterHeater'), percent: 100, savings: 80 },
        { appliance: t('common.washingMachine'), percent: 100, savings: 40 }
    ];

    return (
        <div className="space-y-6">
            {/* Interactive Slider */}
            <div className="bg-dashboard-card rounded-xl p-6 border border-dashboard-textSecondary/20">
                <h4 className="text-dashboard-text font-medium mb-4 flex items-center gap-2">
                    <CalculatorIcon className="w-5 h-5 text-dashboard-text" />
                    {t('costOptimizer.adjustPeakReduction')}
                </h4>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-dashboard-textSecondary">{t('costOptimizer.reducePeakBy')}</span>
                        <span className="text-dashboard-text font-bold">{peakReduction}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={peakReduction}
                        onChange={(e) => setPeakReduction(parseInt(e.target.value))}
                        className="w-full h-2 bg-dashboard-textSecondary/20 rounded-lg appearance-none cursor-pointer accent-dashboard-text"
                    />
                    <div className="flex justify-between text-xs text-dashboard-textSecondary mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Real-time savings display */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-dashboard-textSecondary/15 rounded-lg p-4 text-center">
                        <p className="text-sm text-dashboard-textSecondary">{t('costOptimizer.monthlySavings')}</p>
                        <p className="text-2xl font-bold text-dashboard-text">₹{actualSavings.toFixed(0)}</p>
                    </div>
                    <div className="bg-dashboard-textSecondary/15 rounded-lg p-4 text-center">
                        <p className="text-sm text-dashboard-textSecondary">{t('costOptimizer.annualSavings')}</p>
                        <p className="text-2xl font-bold text-dashboard-text">₹{annualSavings.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            {/* Scenario Cards */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-dashboard-text">{t('costOptimizer.quickScenarios')}</h4>

                {scenarios.map((scenario, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between bg-dashboard-textSecondary/10 rounded-xl p-4 hover:bg-dashboard-textSecondary/20 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-dashboard-textSecondary/10 rounded-lg">
                                <BoltIcon className="w-5 h-5 text-dashboard-text" />
                            </div>
                            <div>
                                <p className="text-dashboard-text font-medium">{t('costOptimizer.shiftAppliance', { percent: scenario.percent, appliance: scenario.appliance })}</p>
                                <p className="text-xs text-dashboard-textSecondary">{t('costOptimizer.moveToOffPeak')}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-dashboard-text font-bold">{t('peakHours.shiftToSave')} ₹{scenario.savings}/mo</p>
                            <p className="text-xs text-dashboard-textSecondary">₹{scenario.savings * 12}/yr</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Potential */}
            <div className="bg-dashboard-card rounded-xl p-6 border border-dashboard-textSecondary/20">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-dashboard-textSecondary text-sm">{t('costOptimizer.totalPotential')}</p>
                        <p className="text-3xl font-bold text-dashboard-text">₹{scenarios.reduce((sum, s) => sum + s.savings, 0)}/mo</p>
                    </div>
                    <div className="text-right">
                        <p className="text-dashboard-textSecondary text-sm">{t('costOptimizer.annual')}</p>
                        <p className="text-xl font-bold text-dashboard-text">₹{scenarios.reduce((sum, s) => sum + s.savings * 12, 0)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tab 3: Action Plan
const ActionPlanTab = ({ completedActions, onToggleAction, actionItems }) => {
    const { t } = useTranslation();
    const totalSavings = actionItems.reduce((sum, item) => sum + item.annualSavings, 0);
    const completedSavings = actionItems
        .filter(item => completedActions.includes(item.id))
        .reduce((sum, item) => sum + item.annualSavings, 0);

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="bg-dashboard-textSecondary/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-dashboard-textSecondary text-sm">{t('costOptimizer.yourProgress')}</span>
                    <span className="text-dashboard-text font-medium">
                        {completedActions.length}/{actionItems.length} {t('costOptimizer.actionsCompleted')}
                    </span>
                </div>
                <div className="h-2 bg-dashboard-textSecondary/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-dashboard-text transition-all duration-500"
                        style={{ width: `${(completedActions.length / actionItems.length) * 100}%` }}
                    />
                </div>
                <div className="mt-2 text-center text-sm">
                    <span className="text-dashboard-text">₹{completedSavings}</span>
                    <span className="text-dashboard-textSecondary"> of ₹{totalSavings} {t('costOptimizer.annualSavingsUnlocked')}</span>
                </div>
            </div>

            {/* Action Items */}
            <div className="space-y-3">
                {actionItems.map((item) => {
                    const isCompleted = completedActions.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            className={`relative rounded-xl p-4 transition-all duration-300 ${isCompleted
                                ? 'bg-dashboard-textSecondary/10 border border-dashboard-textSecondary/30'
                                : 'bg-dashboard-textSecondary/5 hover:bg-dashboard-textSecondary/10'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">{item.icon}</span>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-medium ${isCompleted ? 'text-dashboard-textSecondary line-through' : 'text-dashboard-text'}`}>
                                            {item.title}
                                        </h4>
                                        <EffortBadge effort={item.effort} />
                                    </div>
                                    <p className="text-sm text-dashboard-textSecondary mb-2">{item.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-dashboard-text">Save ₹{item.monthlySavings}/month</span>
                                        <span className="text-dashboard-textSecondary">•</span>
                                        <span className="text-dashboard-textSecondary">₹{item.annualSavings}/year</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onToggleAction(item.id)}
                                    className={`p-2 rounded-lg transition-colors ${isCompleted
                                        ? 'bg-dashboard-textSecondary/20 text-dashboard-text'
                                        : 'bg-dashboard-textSecondary/10 text-dashboard-textSecondary hover:text-dashboard-text'
                                        }`}
                                >
                                    <CheckCircleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Main CostOptimizer Component
const CostOptimizer = ({ userId = 'user123', onNavigateToControl }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalUnits: 120,
        peakUnits: 60,
        offPeakUnits: 60,
        peakRate: 8,
        offPeakRate: 4
    });
    const [completedActions, setCompletedActions] = useState(() => {
        const saved = localStorage.getItem('completedActions');
        return saved ? JSON.parse(saved) : [];
    });

    const tabs = [
        { name: t('costOptimizer.yourCurrentCosts'), icon: ChartBarIcon },
        { name: t('costOptimizer.whatIfScenarios'), icon: CalculatorIcon },
        { name: t('costOptimizer.actionPlan'), icon: ClipboardDocumentCheckIcon }
    ];

    // Action items with details - Using useMemo for translation
    const actionItems = useMemo(() => [
        {
            id: 1,
            icon: '🥇',
            title: t('costOptimizer.shiftAC'),
            monthlySavings: 167,
            annualSavings: 2000,
            effort: 'easy',
            description: 'Use timer or smart plug to run AC during off-peak hours'
        },
        {
            id: 2,
            icon: '🥈',
            title: t('costOptimizer.runWaterHeater'),
            monthlySavings: 80,
            annualSavings: 960,
            effort: 'easy',
            description: 'Heat water during off-peak and use stored hot water'
        },
        {
            id: 3,
            icon: '🥉',
            title: t('costOptimizer.scheduleWashing'),
            monthlySavings: 40,
            annualSavings: 480,
            effort: 'medium',
            description: 'Use delay start feature on washing machine'
        },
        {
            id: 4,
            icon: '🏅',
            title: t('costOptimizer.chargeEV'),
            monthlySavings: 125,
            annualSavings: 1500,
            effort: 'easy',
            description: 'Schedule EV charging for 12 AM - 5 AM'
        },
        {
            id: 5,
            icon: '🏅',
            title: t('costOptimizer.runDishwasher'),
            monthlySavings: 25,
            annualSavings: 300,
            effort: 'easy',
            description: 'Use delay start or run before bed'
        }
    ], [t]);

    // Fetch data with caching
    const fetchData = useCallback(async () => {
        // Check cache first
        const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (cachedExpiry && cachedData) {
            const expiry = new Date(cachedExpiry);
            if (new Date() < expiry) {
                setData(JSON.parse(cachedData));
                setLoading(false);
                return;
            }
        }

        try {
            const response = await fetch(`${API_BASE}/monthlyForecast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, dailyAverageConsumption: 4 })
            });

            if (response.ok) {
                const result = await response.json();

                // Parse the data
                const newData = {
                    totalUnits: parseInt(result.monthlyConsumption) || 120,
                    peakUnits: Math.round((parseInt(result.monthlyConsumption) || 120) * 0.5),
                    offPeakUnits: Math.round((parseInt(result.monthlyConsumption) || 120) * 0.5),
                    peakRate: 8,
                    offPeakRate: 4,
                    currentCost: result.currentMonthCost,
                    reducedCosts: {
                        by20: result.ifReducePeakBy20,
                        by40: result.ifReducePeakBy40,
                        by60: result.ifReducePeakBy60
                    }
                };

                setData(newData);

                // Cache until midnight
                const midnight = new Date();
                midnight.setHours(24, 0, 0, 0);
                localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
                localStorage.setItem(CACHE_EXPIRY_KEY, midnight.toISOString());
            }
        } catch (err) {
            console.error('Failed to fetch forecast data:', err);
        }
        setLoading(false);
    }, [userId]);

    // Toggle action completion
    const toggleAction = (actionId) => {
        setCompletedActions(prev => {
            const newCompleted = prev.includes(actionId)
                ? prev.filter(id => id !== actionId)
                : [...prev, actionId];

            localStorage.setItem('completedActions', JSON.stringify(newCompleted));
            return newCompleted;
        });
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Initialize
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="bg-dashboard-card rounded-2xl border border-dashboard-textSecondary/20 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-dashboard-textSecondary/20">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-dashboard-textSecondary/10 rounded-xl">
                            <CalculatorIcon className="w-6 h-6 text-dashboard-text" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-dashboard-text">{t('costOptimizer.title')}</h2>
                            <p className="text-sm text-dashboard-textSecondary">{t('costOptimizer.subtitle')}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 hover:bg-dashboard-textSecondary/20 rounded-full transition-colors"
                    >
                        <ArrowPathIcon className={`w-5 h-5 text-dashboard-textSecondary ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-dashboard-textSecondary/20">
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === idx
                            ? 'text-dashboard-text border-b-2 border-dashboard-text bg-dashboard-textSecondary/10'
                            : 'text-dashboard-textSecondary hover:text-dashboard-text hover:bg-dashboard-textSecondary/10'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <ArrowPathIcon className="w-8 h-8 text-accent animate-spin" />
                    </div>
                ) : (
                    <>
                        {activeTab === 0 && <CurrentCostsTab data={data} />}
                        {activeTab === 1 && <WhatIfTab data={data} />}
                        {activeTab === 2 && (
                            <ActionPlanTab
                                completedActions={completedActions}
                                onToggleAction={toggleAction}
                                actionItems={actionItems}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="p-6 border-t border-dashboard-textSecondary/20 bg-dashboard-textSecondary/10">
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onNavigateToControl}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-dashboard-text hover:bg-dashboard-text/90 rounded-xl transition-colors text-dashboard-card font-medium"
                    >
                        <CogIcon className="w-5 h-5" />
                        {t('costOptimizer.enableSmartScheduling')}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-dashboard-textSecondary/15 hover:bg-dashboard-textSecondary/25 rounded-xl transition-colors text-dashboard-text font-medium"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        {t('costOptimizer.printPlan')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CostOptimizer;
