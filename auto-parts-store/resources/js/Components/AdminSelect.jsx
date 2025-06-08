import React, { forwardRef, useEffect, useRef } from 'react';

const AdminSelect = forwardRef(function AdminSelect(
    { name, id, value, className = '', required, isFocused, handleChange, children, disabled = false },
    ref
) {
    const select = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            select.current.focus();
        }
    }, [isFocused]);

    return (
        <select
            name={name}
            id={id || name}
            value={value}
            className={`admin-input ${className}`}
            ref={select}
            required={required}
            onChange={(e) => handleChange(e)}
            disabled={disabled}
        >
            {children}
        </select>
    );
})

export default AdminSelect; 