import React, { forwardRef, useEffect, useRef } from 'react';

const AdminInput = forwardRef(function AdminInput(
    { type = 'text', name, id, value, className = '', autoComplete, required, isFocused, handleChange, placeholder, disabled = false },
    ref
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, [isFocused]);

    return (
        <input
            type={type}
            name={name}
            id={id || name}
            value={value}
            className={`admin-input ${className}`}
            ref={input}
            autoComplete={autoComplete}
            required={required}
            onChange={(e) => handleChange(e)}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
})

export default AdminInput; 