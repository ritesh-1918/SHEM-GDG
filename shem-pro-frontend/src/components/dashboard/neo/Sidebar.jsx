import React from 'react';
import { useTranslation } from 'react-i18next';
import { BoltIcon, ChartBarIcon, CpuChipIcon, Cog6ToothIcon, Squares2X2Icon } from '@heroicons/react/24/solid';

const Sidebar = ({ activeTab = 'dashboard', setActiveTab }) => {
    const { t } = useTranslation();

    const menuItems = [
        { id: 'dashboard', icon: Squares2X2Icon, label: t('dashboard.title') },
        { id: 'analytics', icon: ChartBarIcon, label: t('analytics.title') },
        { id: 'control', icon: CpuChipIcon, label: t('control.title') },
        { id: 'settings', icon: Cog6ToothIcon, label: t('settings.title') },
    ];

    return (
        <div className="w-20 h-screen bg-dashboard-bg fixed left-0 top-0 flex flex-col items-center py-6 border-r border-dashboard-textSecondary/20 z-50">
            {/* Logo */}
            <div className="mb-10">
                <img
                    src="/favicon.png"
                    alt="SHEM Logo"
                    className="h-10 w-10 object-contain rounded-lg"
                />
            </div>

            {/* Nav Items */}
            <nav className="flex flex-col gap-8">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`p-3 rounded-xl transition-all duration-300 group relative ${activeTab === item.id
                            ? 'bg-accent/10 text-accent'
                            : 'text-dashboard-textSecondary hover:text-dashboard-text hover:bg-dashboard-text/5'
                            }`}
                    >
                        <item.icon className="h-6 w-6" />

                        {/* Tooltip */}
                        <span className="absolute left-14 bg-dashboard-card text-dashboard-text text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-dashboard-textSecondary/20 z-50">
                            {item.label}
                        </span>

                        {/* Active Indicator */}
                        {activeTab === item.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-[2px] w-1 h-8 bg-accent rounded-r-full" />
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
