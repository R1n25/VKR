import React, { forwardRef, useEffect, useRef } from 'react';

const AdminSelect = forwardRef(function AdminSelect(
    { name, id, value, className = '', required, isFocused, onChange, handleChange, children, disabled = false },
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
        <select
            name={name}
            id={id || name}
            value={value}
            className={`admin-select ${className}`}
            ref={input}
            required={required}
            onChange={changeHandler}
            disabled={disabled}
        >
            {children}
        </select>
    );
})

export default AdminSelect; 