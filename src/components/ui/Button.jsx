
import { twMerge } from 'tailwind-merge';

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
        ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
        icon: 'p-2',
    };

    return (
        <button
            className={twMerge(
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}
