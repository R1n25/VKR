import React, { forwardRef, useEffect, useRef } from 'react';

const AdminTextarea = forwardRef(function AdminTextarea(
    { name, id, value, className = '', required, isFocused, handleChange, placeholder, rows = 4, disabled = false },
    ref
) {
    const textarea = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            textarea.current.focus();
        }
    }, [isFocused]);

    return (
        <textarea
            name={name}
            id={id || name}
            value={value}
            className={`admin-input ${className}`}
            ref={textarea}
            required={required}
            onChange={(e) => handleChange(e)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
        />
    );
})

export default AdminTextarea; 