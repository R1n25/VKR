import React, { useState } from 'react';

export default function AdminTabs({ tabs, defaultActive = 0, className = '' }) {
    const [activeTab, setActiveTab] = useState(defaultActive);

    return (
        <div className={className}>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                                activeTab === index
                                    ? 'border-[#243969] text-[#243969]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab(index)}
                        >
                            {tab.icon && <span className="mr-2">{tab.icon}</span>}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-4">
                {tabs[activeTab]?.content}
            </div>
        </div>
    );
} 