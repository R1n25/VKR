import React, { useState } from 'react';
import axios from 'axios';

export default function VinSearchForm({ onResult }) {
    const [vin, setVin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Проверка длины VIN
            if (vin.length !== 17) {
                throw new Error('VIN должен состоять из 17 символов');
            }

            // Отправка запроса на декодирование VIN
            const decodeResponse = await axios.post('/api/vin/decode', { vin });
            
            // Получение схем для данного VIN
            const schemesResponse = await axios.get(`/api/vin/${vin}/schemes`);
            
            // Передача результатов родительскому компоненту
            onResult({
                vin_search: decodeResponse.data,
                schemes: schemesResponse.data
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Произошла ошибка при поиске');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Поиск по VIN-коду</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
                        VIN код автомобиля
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="vin"
                            id="vin"
                            value={vin}
                            onChange={(e) => setVin(e.target.value.toUpperCase())}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Введите 17-значный VIN код"
                            maxLength={17}
                            required
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        VIN-код состоит из 17 символов и может содержать цифры и буквы (кроме I, O, Q)
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Поиск...
                            </>
                        ) : (
                            'Найти запчасти'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
} 