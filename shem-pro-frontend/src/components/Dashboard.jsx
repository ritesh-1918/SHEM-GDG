import { useNavigate } from 'react-router-dom';
import { useEnergyDataFetcher } from '../hooks/useEnergyDataFetcher';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'react-hot-toast'; // Import toast for dismiss logic if needed
import { getEsp32LatestData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Neo Components (Eager Load Layout)
import Sidebar from './dashboard/neo/Sidebar';
import DashboardHeader from './dashboard/neo/DashboardHeader';
import MetricCards from './dashboard/neo/MetricCards';
import SHEMChatWidget from './SHEMChatWidget';
import AiInsights from './dashboard/neo/AiInsights';

// Lazy Load Heavy Widgets
const LivePowerChart = lazy(() => import('./dashboard/neo/LivePowerChart'));
const SensorTicker = lazy(() => import('./dashboard/neo/SensorTicker'));
const EnergyDistributionWidget = lazy(() => import('./dashboard/neo/EnergyDistributionWidget'));
const CostAnalysisWidget = lazy(() => import('./dashboard/neo/CostAnalysisWidget'));
const NeoDeviceControl = lazy(() => import('./dashboard/neo/NeoDeviceControl'));
const ProfileSettings = lazy(() => import('./dashboard/neo/ProfileSettings'));
const PeakHoursCard = lazy(() => import('./dashboard/neo/PeakHoursCard'));
const CostOptimizer = lazy(() => import('./dashboard/neo/CostOptimizer'));
const AnomalyAlerts = lazy(() => import('./dashboard/neo/AnomalyAlerts'));
const ApplianceBreakdown = lazy(() => import('./dashboard/neo/ApplianceBreakdown'));
const EnergyForecast = lazy(() => import('./dashboard/neo/EnergyForecast'));

import {
  ChartBarIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-1">
      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
        <Icon className="w-5 h-5 text-dashboard-text" />
      </div>
      <h2 className="text-xl font-bold text-dashboard-text tracking-tight">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-dashboard-textSecondary ml-11">{subtitle}</p>}
  </div>
);

// Simple widget loader
const WidgetLoader = () => (
  <div className="h-full w-full min-h-[200px] flex items-center justify-center bg-white/5 rounded-xl animate-pulse">
    <div className="text-gray-500 text-sm">Loading Widget...</div>
  </div>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const { liveData } = useEnergyDataFetcher();
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardSubTab, setDashboardSubTab] = useState('monitoring');
  const [esp32Data, setEsp32Data] = useState(null);

  // Fetch ESP32 Data
  useEffect(() => {
    const fetchEsp32Data = async () => {
      try {
        const data = await getEsp32LatestData();
        setEsp32Data(data);
      } catch (err) {
        console.error('Error fetching ESP32 data:', err);
      }
    };

    fetchEsp32Data();
    const interval = setInterval(fetchEsp32Data, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Force Dark Mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Render Content specific to Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="fade-in space-y-8">
            {/* Sub-section Navigation */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit mx-auto sticky top-4 z-40 backdrop-blur-md">
              {[
                { id: 'monitoring', label: 'Monitoring', icon: BoltIcon },
                { id: 'savings', label: 'Savings', icon: AdjustmentsVerticalIcon },
                { id: 'forecasting', label: 'Forecasting', icon: ArrowTrendingUpIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDashboardSubTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${dashboardSubTab === tab.id
                      ? 'bg-white text-black shadow-lg scale-[1.02]'
                      : 'text-dashboard-textSecondary hover:text-white hover:bg-white/5'
                    }`}
                >
                  <tab.icon className={`w-4 h-4 ${dashboardSubTab === tab.id ? 'text-black' : 'text-dashboard-textSecondary'}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="fade-in">
              {dashboardSubTab === 'monitoring' && (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Energy Overview Sub-section */}
                  <section>
                    <SectionHeader
                      icon={ChartBarIcon}
                      title="Energy Overview"
                      subtitle="Real-time performance and AI-driven insights"
                    />
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                      <div className="xl:col-span-3">
                        <MetricCards data={esp32Data || liveData} />
                      </div>
                      <div className="xl:col-span-1">
                        <AiInsights data={esp32Data || liveData} />
                      </div>
                    </div>
                  </section>

                  {/* Live Monitoring & Controls Sub-section */}
                  <section>
                    <SectionHeader
                      icon={BoltIcon}
                      title="Live Monitoring & Controls"
                      subtitle="Track consumption as it happens and manage devices"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <LivePowerChart liveData={esp32Data || liveData} />
                      </div>
                      <div className="flex flex-col">
                        <NeoDeviceControl />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {dashboardSubTab === 'savings' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionHeader
                    icon={AdjustmentsVerticalIcon}
                    title="Smart Savings & Optimization"
                    subtitle="Avoid peak rates and optimize your energy budget"
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <PeakHoursCard data={esp32Data || liveData} userId={user?.id || 'user123'} />
                    <CostOptimizer userId={user?.id || 'user123'} onNavigateToControl={() => setActiveTab('control')} />
                  </div>
                </section>
              )}

              {dashboardSubTab === 'forecasting' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionHeader
                    icon={ArrowTrendingUpIcon}
                    title="Forecasting & Simulation"
                    subtitle="Future-ready insights and cost projections"
                  />
                  <div className="space-y-8">
                    <EnergyForecast userId={user?.id || 'user123'} />
                  </div>
                </section>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-xl font-bold text-dashboard-text mb-4">{t('analytics.detailedAnalytics')}</h2>

            {/* Anomaly Detection Alerts - Collapsible */}
            <div className="w-full overflow-hidden">
              <AnomalyAlerts userId={user?.id || 'user123'} />
            </div>

            {/* Appliance Breakdown - Full width */}
            <div className="w-full overflow-hidden">
              <ApplianceBreakdown userId={user?.id || 'user123'} />
            </div>

            {/* Scrolling Ticker */}
            <div className="w-full overflow-hidden">
              <SensorTicker data={esp32Data || liveData} />
            </div>

            {/* Energy Distribution and Cost Analysis - Responsive Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="min-h-[300px] max-h-[400px] overflow-hidden">
                <EnergyDistributionWidget />
              </div>
              <div className="min-h-[300px] max-h-[400px] overflow-hidden">
                <CostAnalysisWidget />
              </div>
            </div>
          </div>
        );

      case 'control':
        return (
          <div className="max-w-4xl mx-auto mt-10 fade-in">
            <h2 className="text-xl font-bold text-dashboard-text mb-6">{t('control.deviceManagement')}</h2>
            <NeoDeviceControl />
            {/* Add more controls/scheduling here later */}
            <div className="mt-8 p-6 bg-dashboard-card rounded-xl border border-white/5 text-center text-dashboard-textSecondary">
              <p>{t('control.automation')} - {t('common.loading')}</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8 fade-in pb-10">
            <ProfileSettings />
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg text-white font-sans selection:bg-accent/30 selection:text-accent flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#252836', color: '#fff', border: '1px solid #2d3142', padding: '16px' },
          success: {
            iconTheme: { primary: '#f7b529', secondary: '#1a1d29' },
          },
          // Custom render for close button ability (react-hot-toast standard doesn't always have X)
          // Extending duration to give users time to read or close
          duration: 5000,
        }}
      >
        {(t) => (
          <div className={`
              ${t.type === 'loading' ? 'bg-blue-900/80' : ''}
              ${t.type === 'success' ? 'bg-green-900/80' : ''}
              ${t.type === 'error' ? 'bg-red-900/80' : 'bg-[#252836]'}
              border border-white/10 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] backdrop-blur-md transition-all
              ${t.visible ? 'animate-enter' : 'animate-leave'}
`}>
            <div className="flex-1">{t.message}</div>
            {t.type !== 'loading' && (
              <button onClick={() => toast.dismiss(t.id)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <XMarkIcon className="w-5 h-5 opacity-70 hover:opacity-100" />
              </button>
            )}
          </div>
        )}
      </Toaster>

      {/* Sidebar (Fixed) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 ml-20 flex flex-col min-h-screen">
        <DashboardHeader
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          onProfileClick={() => setActiveTab('settings')}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden w-full max-w-[1600px] mx-auto">
          <Suspense fallback={<WidgetLoader />}>
            {renderContent()}
          </Suspense>
        </main>

        {/* Floating Chat */}
        <SHEMChatWidget userId={user?.id || 'user123'} contextData={esp32Data || liveData} pageContext={activeTab} />
      </div>
    </div>
  );
};

export default Dashboard;