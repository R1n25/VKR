import React, { forwardRef, useEffect, useRef } from 'react';

const AdminTextarea = forwardRef(function AdminTextarea(
    { name, id, value, className = '', required, isFocused, onChange, handleChange, placeholder, rows = 4, disabled = false },
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
        <textarea
            name={name}
            id={id || name}
            value={value}
            className={`admin-textarea ${className}`}
            ref={input}
            required={required}
            onChange={changeHandler}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
        ></textarea>
    );
});

export default AdminTextarea; 