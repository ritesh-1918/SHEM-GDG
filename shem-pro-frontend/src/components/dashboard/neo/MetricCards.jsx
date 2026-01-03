import React from 'react';
import { useTranslation } from 'react-i18next';
import { BoltIcon, CurrencyRupeeIcon, FireIcon } from '@heroicons/react/24/solid';

const Card = ({ label, value, unit, icon: Icon, color }) => (
    <div className="bg-dashboard-card rounded-xl p-6 border border-dashboard-textSecondary/10 flex items-center justify-between hover:border-accent/30 transition-all duration-300 group">
        <div>
            <p className="text-dashboard-textSecondary text-sm mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-dashboard-text group-hover:text-accent transition-colors">
                {value} <span className="text-sm font-normal text-dashboard-textSecondary">{unit}</span>
            </h3>
        </div>
        <div className={`p-3 rounded-xl bg-dashboard-text/5 ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

const MetricCards = ({ data }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
                label={t('dashboard.currentLoad')}
                value={data?.power?.toFixed(0) || '0'}
                unit={t('units.watts')}
                icon={FireIcon}
                color="text-dashboard-text"
            />
            <Card
                label={t('dashboard.dailyUsage')}
                value={data?.energy_kWh?.toFixed(2) || '0.00'}
                unit={t('units.kilowattHours')}
                icon={BoltIcon}
                color="text-dashboard-text"
            />
            <Card
                label={t('dashboard.estimatedCost')}
                value={data?.cost_rs?.toFixed(0) || '0'}
                unit={t('units.rupees')}
                icon={CurrencyRupeeIcon}
                color="text-dashboard-text"
            />
        </div>
    );
};

export default MetricCards;

