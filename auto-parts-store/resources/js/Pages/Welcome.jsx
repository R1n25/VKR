import { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    useEffect(() => {
        // Перенаправляем пользователя на главную страницу через обычное перенаправление
        window.location.href = '/home';
    }, []);

    return (
        <>
            <Head title="Автозапчасти" />
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p className="text-lg text-gray-600">Перенаправление на главную страницу...</p>
            </div>
        </>
    );
}
