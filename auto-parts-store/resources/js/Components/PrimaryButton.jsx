import { Link } from '@inertiajs/react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    href,
    ...props
}) {
    const buttonClasses = `inline-flex items-center justify-center rounded-md border border-transparent bg-[#3a5085] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-300 ease-in-out hover:bg-[#243969] focus:outline-none focus:ring-2 focus:ring-[#3a5085] focus:ring-offset-2 active:bg-[#1e2e4a] ${
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
            className={buttonClasses}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
