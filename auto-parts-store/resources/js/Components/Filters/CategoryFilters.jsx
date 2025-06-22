import React, { useState, useEffect } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

export default function CategoryFilters({ filters, onFilterChange }) {
    const [selectedFilters, setSelectedFilters] = useState({});

    const handleFilterChange = (attributeId, value) => {
        const newFilters = {
            ...selectedFilters,
            [attributeId]: value
        };
        setSelectedFilters(newFilters);
        onFilterChange(newFilters);
    };

    const renderFilterInput = (filter) => {
        switch (filter.type) {
            case 'select':
                return (
                    <select
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={selectedFilters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    >
                        <option value="">Все</option>
                        {filter.values.map((value) => (
                            <option key={value} value={value}>
                                {value} {filter.unit ? filter.unit : ''}
                            </option>
                        ))}
                    </select>
                );
            case 'range':
                return (
                    <div className="mt-2 flex gap-2">
                        <input
                            type="number"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="От"
                            value={selectedFilters[filter.id]?.min || ''}
                            onChange={(e) => handleFilterChange(filter.id, {
                                ...selectedFilters[filter.id],
                                min: e.target.value
                            })}
                        />
                        <input
                            type="number"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="До"
                            value={selectedFilters[filter.id]?.max || ''}
                            onChange={(e) => handleFilterChange(filter.id, {
                                ...selectedFilters[filter.id],
                                max: e.target.value
                            })}
                        />
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="mt-2 space-y-2">
                        {filter.values.map((value) => (
                            <label key={value} className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={selectedFilters[filter.id]?.includes(value) || false}
                                    onChange={(e) => {
                                        const currentValues = selectedFilters[filter.id] || [];
                                        const newValues = e.target.checked
                                            ? [...currentValues, value]
                                            : currentValues.filter(v => v !== value);
                                        handleFilterChange(filter.id, newValues);
                                    }}
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    {value} {filter.unit ? filter.unit : ''}
                                </span>
                            </label>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
            {Object.entries(filters).map(([id, filter]) => (
                <Disclosure key={id} as="div" className="border rounded-lg" defaultOpen={true}>
                    {({ open }) => (
                        <>
                            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-white px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-50">
                                <span>{filter.name}</span>
                                <ChevronUpIcon
                                    className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
                                />
                            </Disclosure.Button>
                            <Disclosure.Panel className="px-4 pb-2 text-sm text-gray-500">
                                {renderFilterInput({ id, ...filter })}
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            ))}
            {Object.keys(selectedFilters).length > 0 && (
                <button
                    onClick={() => {
                        setSelectedFilters({});
                        onFilterChange({});
                    }}
                    className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Сбросить все фильтры
                </button>
            )}
        </div>
    );
} 