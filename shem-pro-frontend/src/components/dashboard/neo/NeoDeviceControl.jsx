import React, { useState } from 'react';
import { LightBulbIcon, BoltIcon, ComputerDesktopIcon, EllipsisHorizontalIcon, SunIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

const DeviceCard = ({ name, icon: Icon, isOn, onToggle }) => {
    const { t } = useTranslation();
    return (
        <div className={`bg-dashboard-card rounded-xl p-4 border transition-all duration-300 ${isOn ? 'border-dashboard-text shadow-sm' : 'border-dashboard-textSecondary/10 opacity-80'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${isOn ? 'bg-dashboard-text text-dashboard-card' : 'bg-dashboard-text/5 text-dashboard-textSecondary'}`}>
                    <Icon className="h-6 w-6" />
                </div>

                <button
                    onClick={onToggle}
                    className={`${isOn ? 'bg-dashboard-text' : 'bg-dashboard-textSecondary/30'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                >
                    <span
                        className={`${isOn ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-dashboard-bg transition-transform`}
                    />
                </button>
            </div>

            <div>
                <h4 className="font-bold text-dashboard-text text-sm">{name}</h4>
                <p className="text-dashboard-textSecondary text-xs">{isOn ? t('dashboard.active') : t('control.off')}</p>
            </div>
        </div>
    );
};

const NeoDeviceControl = () => {
    const { t } = useTranslation();
    const [devices, setDevices] = useState([
        { id: 1, name: t('control.livingRoomLights'), icon: LightBulbIcon, isOn: true },
        { id: 2, name: t('control.acMasterBedroom'), icon: SunIcon, isOn: false },
        { id: 3, name: t('control.smartTV'), icon: ComputerDesktopIcon, isOn: true },
        { id: 4, name: t('control.workstation'), icon: BoltIcon, isOn: true },
    ]);

    const toggleDevice = (id) => {
        setDevices(devices.map(d => d.id === id ? { ...d, isOn: !d.isOn } : d));
    };

    return (
        <div className="bg-dashboard-card rounded-xl p-6 border border-dashboard-textSecondary/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-dashboard-text font-bold text-lg">{t('dashboard.quickControls')}</h3>
                <button className="p-1.5 hover:bg-dashboard-text/5 rounded-lg text-dashboard-textSecondary transition-colors">
                    <EllipsisHorizontalIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {devices.map(device => (
                    <DeviceCard
                        key={device.id}
                        {...device}
                        onToggle={() => toggleDevice(device.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default NeoDeviceControl;
