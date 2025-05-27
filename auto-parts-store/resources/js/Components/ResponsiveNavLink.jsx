import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-white bg-[#1e325a] text-white focus:bg-[#1e325a]'
                    : 'border-transparent text-gray-300 hover:border-gray-300 hover:bg-[#3a5195] hover:text-white focus:border-white focus:bg-[#3a5195] focus:text-white'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
