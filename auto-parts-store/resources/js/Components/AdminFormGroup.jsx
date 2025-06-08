import React from 'react';
import AdminLabel from './AdminLabel';
import InputError from './InputError';

export default function AdminFormGroup({
    label,
    name,
    children,
    className = '',
    error = null,
    required = false,
    helpText = null
}) {
    return (
        <div className={`admin-form-group ${className}`}>
            {label && (
                <AdminLabel forInput={name} required={required}>
                    {label}
                </AdminLabel>
            )}
            {children}
            {error && <InputError message={error} className="mt-1" />}
            {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
        </div>
    );
} 