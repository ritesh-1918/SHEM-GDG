import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../../context/ThemeContext.tsx';

const LivePowerChart = ({ liveData }) => {
    const { t } = useTranslation();
    const themeColors = useThemeColors();
    // Mock history for visual effect if real history is sparse
    const [data, setData] = useState([]);

    useEffect(() => {
        // Generate initial dummy data for "Live" look
        const initialData = Array.from({ length: 20 }, (_, i) => ({
            time: i,
            power: 400 + Math.random() * 200
        }));
        setData(initialData);
    }, []);

    useEffect(() => {
        if (liveData?.power) {
            setData(prev => {
                const newData = [...prev, { time: prev.length, power: liveData.power }];
                if (newData.length > 50) newData.shift();
                return newData;
            });
        }
    }, [liveData]);

    return (
        <div className="bg-dashboard-card rounded-xl p-6 border border-dashboard-textSecondary/10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-dashboard-text font-bold text-lg">{t('dashboard.realtimePowerMonitor')}</h3>
                    <QuestionMarkCircleIcon className="h-4 w-4 text-dashboard-textSecondary" />
                </div>

                <div className="flex gap-4 text-sm font-medium text-dashboard-textSecondary">
                    <button className="text-dashboard-text border-b-2 border-dashboard-text pb-1">{t('dashboard.liveView')}</button>
                    <button className="hover:text-dashboard-text transition-colors">1H</button>
                    <button className="hover:text-dashboard-text transition-colors">24H</button>
                </div>
            </div>

            <div className="flex items-center gap-8 mb-6">
                <div>
                    <span className="text-dashboard-textSecondary text-xs">{t('dashboard.currentLoad')}</span>
                    <p className="text-3xl font-bold text-dashboard-text">{liveData?.power?.toFixed(0) || '---'} <span className="text-sm font-normal text-dashboard-textSecondary">{t('units.watts')}</span></p>
                </div>
                <div className="h-8 w-[1px] bg-dashboard-textSecondary/10"></div>
                <div>
                    <span className="text-dashboard-textSecondary text-xs">{t('dashboard.predictionAccuracy')}</span>
                    <p className="text-xl font-bold text-dashboard-textSecondary">94%</p>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#bbbbbb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#bbbbbb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid || "#2d3142"} vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis
                            orientation="right"
                            tick={{ fill: themeColors.textSecondary || '#8a8d9c', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}`, borderRadius: '8px' }}
                            itemStyle={{ color: themeColors.text }}
                            labelStyle={{ display: 'none' }}
                            formatter={(value) => [`${value.toFixed(0)} W`, 'Power']}
                        />
                        <Area
                            type="monotone"
                            dataKey="power"
                            stroke="#777777"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPower)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-end gap-4 mt-4 text-xs text-dashboard-textSecondary">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-dashboard-text"></span> {t('dashboard.liveDraw')}
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-dashboard-textSecondary"></span> {t('dashboard.peakPrediction')}
                </div>
            </div>
        </div>
    );
};

export default LivePowerChart;
