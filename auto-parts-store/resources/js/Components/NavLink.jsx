import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                active
                    ? 'bg-[#1e325a] text-white font-semibold'
                    : 'text-white hover:bg-[#3a5195]'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
