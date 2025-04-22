import React, { useState } from 'react';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function PartSchemeViewer({ schemes }) {
    const [selectedPart, setSelectedPart] = useState(null);

    const handlePartClick = (part) => {
        setSelectedPart(part);
    };

    const handleClosePartDetails = () => {
        setSelectedPart(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-t-lg bg-gray-100 p-1">
                    {schemes.map((scheme) => (
                        <Tab
                            key={scheme.id}
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? 'bg-white text-blue-700 shadow'
                                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                                )
                            }
                        >
                            {scheme.name}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {schemes.map((scheme) => (
                        <Tab.Panel
                            key={scheme.id}
                            className="rounded-xl bg-white p-3"
                        >
                            <div className="relative">
                                {/* Изображение схемы */}
                                <img
                                    src={`/storage/${scheme.image}`}
                                    alt={scheme.name}
                                    className="w-full h-auto"
                                />

                                {/* Интерактивные точки на схеме */}
                                {scheme.parts.map((part) => (
                                    <button
                                        key={part.id}
                                        style={{
                                            position: 'absolute',
                                            left: `${part.pivot.position_x}%`,
                                            top: `${part.pivot.position_y}%`,
                                        }}
                                        className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        onClick={() => handlePartClick(part)}
                                        title={part.name}
                                    >
                                        {part.pivot.number}
                                    </button>
                                ))}
                            </div>

                            {/* Список деталей */}
                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-gray-900">Список деталей</h3>
                                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {scheme.parts.map((part) => (
                                        <button
                                            key={part.id}
                                            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            onClick={() => handlePartClick(part)}
                                        >
                                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                                                {part.pivot.number}
                                            </span>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-gray-900">{part.name}</p>
                                                <p className="text-sm text-gray-500">Артикул: {part.sku}</p>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {part.price} ₽
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>

            {/* Модальное окно с деталями запчасти */}
            {selectedPart && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClosePartDetails} />

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {selectedPart.name}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {selectedPart.description}
                                            </p>
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-900">
                                                    Артикул: {selectedPart.sku}
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Цена: {selectedPart.price} ₽
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    В наличии: {selectedPart.stock} шт.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleClosePartDetails}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 