import React from 'react';

/**
 * Хук для форматирования цены
 * @param {number|string} price - Цена для форматирования
 * @returns {string} Отформатированная цена
 */
export const useFormatPrice = (price) => {
    const formatPrice = React.useCallback((value) => {
        if (!value) return '0.00';
        
        // Проверяем, является ли цена строкой или числом
        const numericPrice = typeof value === 'string' ? parseFloat(value) : value;
        
        // Форматируем число с разделителями тысяч и двумя знаками после запятой
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericPrice);
    }, []);

    return formatPrice(price);
};

/**
 * Компонент для отображения отформатированной цены
 */
export const FormattedPrice = React.memo(({ value, className }) => {
    const formattedPrice = useFormatPrice(value);
    
    return (
        <span className={className}>
            {formattedPrice} ₽
        </span>
    );
});

FormattedPrice.displayName = 'FormattedPrice';

/**
 * Простая функция форматирования для случаев, когда не нужен React-компонент
 */
export const formatPrice = (price) => {
    if (!price) return '0.00';
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numericPrice);
}; 