import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-md border-[rgb(var(--ek-border))] text-[rgb(var(--ek-accent))] shadow-sm focus:ring-[rgb(var(--ek-accent))] ' +
                className
            }
        />
    );
}
