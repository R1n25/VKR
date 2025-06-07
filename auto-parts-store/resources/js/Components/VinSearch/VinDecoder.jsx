import React, { useState } from 'react';
import axios from 'axios';

const VinDecoder = ({ vin }) => {
    const [decodedInfo, setDecodedInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const decodeVin = async () => {
        if (!vin || vin.length !== 17) {
            setError('VIN-код должен состоять из 17 символов');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/vin/decode', { vin });
            setDecodedInfo(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при дешифровке VIN-кода');
        } finally {
            setLoading(false);
        }
    };
    
    // Вызываем декодирование при изменении VIN
    React.useEffect(() => {
        if (vin && vin.length === 17) {
            decodeVin();
        } else {
            setDecodedInfo(null);
        }
    }, [vin]);
    
    // Форматированное отображение информации о VIN
    const renderVinInfo = () => {
        if (!decodedInfo) return null;
        
        return (
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Информация о автомобиле</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Марка</dt>
                                <dd className="text-sm text-gray-900">{decodedInfo.make || 'Нет данных'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Модель</dt>
                                <dd className="text-sm text-gray-900">{decodedInfo.model || 'Нет данных'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Год выпуска</dt>
                                <dd className="text-sm text-gray-900">{decodedInfo.year || 'Нет данных'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Тип кузова</dt>
                                <dd className="text-sm text-gray-900">{decodedInfo.body_type || 'Нет данных'}</dd>
                            </div>
                        </dl>
                    </div>
                    <div>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Двигатель</dt>
                                <dd className="text-sm text-gray-900">{decodedInfo.engine || 'Нет данных'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Трансмиссия</dt>
                                <dd className="text-sm text-gray-900">{decodedInfo.transmission || 'Нет данных'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Страна производства</dt>
                                <dd className="text-sm text-gray-900">{decodedInfo.country || 'Нет данных'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Завод-изготовитель</dt>
                                <dd className="text-sm text-gray-900">{decodedInfo.plant || 'Нет данных'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                
                {decodedInfo.vin_breakdown && (
                    <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Расшифровка VIN-кода</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Позиция</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Символ</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Значение</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.entries(decodedInfo.vin_breakdown).map(([position, info]) => (
                                        <tr key={position}>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{position}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{info.char}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{info.meaning}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    return (
        <div className="vin-decoder">
            {loading && (
                <div className="flex justify-center my-4">
                    <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            
            {error && !loading && (
                <div className="rounded-md bg-red-50 p-4 my-4">
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
            
            {!loading && decodedInfo && renderVinInfo()}
        </div>
    );
};

export default VinDecoder; 