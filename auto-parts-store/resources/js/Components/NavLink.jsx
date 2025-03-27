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
                    ? 'bg-[#2a4075] text-white shadow-lg shadow-[#2a4075]/30 font-semibold'
                    : 'text-white hover:bg-gray-800'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
