
import { twMerge } from 'tailwind-merge';

export function Input({ className, label, error, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <input
                className={twMerge(
                    'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}

export function Select({ className, label, error, children, value, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <select
                className={twMerge(
                    'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                value={value || ''}
                {...props}
            >
                {children}
            </select>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
