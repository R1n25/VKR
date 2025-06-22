/**
 * Format a date string to a human-readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    return date.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

/**
 * Format a price to a human-readable format
 * @param {number|string} price - The price to format
 * @returns {string} - The formatted price string
 */
export const formatPrice = (price) => {
    if (!price) return '0 руб.';
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    return `${numPrice.toFixed(2)} руб.`;
};

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length of the string
 * @returns {string} - The truncated string
 */
export const truncateString = (str, maxLength = 100) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    
    return str.substring(0, maxLength) + '...';
}; 