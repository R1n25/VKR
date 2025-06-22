import { Link } from '@inertiajs/react';

export default function NavLink({
    href,
    active = false,
    className = '',
    children,
    ...props
}) {
    // Определяем активность ссылки на основе текущего пути
    const isActive = active || (href && window.location.pathname === href);
    
    return (
        <Link
            href={href}
            {...props}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                isActive
                    ? 'bg-[#1e325a] text-white font-semibold'
                    : 'text-white hover:bg-[#3a5195]'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
