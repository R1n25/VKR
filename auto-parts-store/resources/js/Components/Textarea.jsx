import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function Textarea(
    { className = '', isFocused = false, ...props },
    ref
) {
    const textareaRef = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            textareaRef.current.focus();
        }
    }, []);

    return (
        <textarea
            {...props}
            className={
                'border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm ' +
                className
            }
            ref={textareaRef}
        ></textarea>
    );
}); 