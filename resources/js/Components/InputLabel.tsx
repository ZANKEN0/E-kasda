import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={
                `mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))] ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
