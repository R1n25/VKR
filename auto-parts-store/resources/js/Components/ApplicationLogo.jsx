import React from 'react';

export default function ApplicationLogo({ className, variant = 'default' }) {
    // Определяем стили для разных вариантов отображения логотипа
    const variantStyles = {
        // Стандартный вариант без изменений
        default: {},
        // Белый вариант для темного фона
        white: {
            filter: 'brightness(0) invert(1)'
        },
        // Темный вариант для светлого фона
        dark: {
            filter: 'brightness(0.1)'
        },
        // Синий вариант
        blue: {
            filter: 'hue-rotate(210deg) saturate(70%)'
        },
        // Цвета вашего бренда (при необходимости настройте)
        brand: {
            filter: 'hue-rotate(240deg) saturate(80%)'
        }
    };

    // Выбираем стиль в зависимости от варианта
    const style = variantStyles[variant] || variantStyles.default;

    return (
        <img 
            src="/images/logo.png" 
            alt="ABZAP24.RU - Запчасти для иномарок" 
            className={`${className} max-w-full`}
            style={{
                ...style,
                maxHeight: '100%',
                objectFit: 'contain'
            }}
        />
    );
}
