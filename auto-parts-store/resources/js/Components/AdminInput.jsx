import React, { forwardRef, useEffect, useRef } from 'react';

const AdminInput = forwardRef(function AdminInput(
    { type = 'text', name, id, value, className = '', autoComplete, required, isFocused, onChange, handleChange, placeholder, disabled = false },
    ref
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, [isFocused]);

    // Используем handleChange, если он предоставлен, иначе используем onChange
    const changeHandler = handleChange || onChange;

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
            onChange={changeHandler}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
})

export default AdminInput; 