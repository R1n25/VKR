import { Link } from '@inertiajs/react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    href,
    ...props
}) {
    const buttonClasses = `inline-flex items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#3a5085] shadow-sm transition duration-300 ease-in-out hover:bg-gray-50 hover:text-[#243969] focus:outline-none focus:ring-2 focus:ring-[#243969] focus:ring-offset-2 disabled:opacity-40 ${
        disabled && 'opacity-40'
    } ${className}`;

    if (href) {
        return (
            <Link
                href={href}
                className={buttonClasses}
                {...props}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            {...props}
            type={type}
            className={buttonClasses}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
