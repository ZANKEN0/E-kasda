import { HTMLAttributes } from 'react';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={'text-sm font-medium text-[rgb(var(--ek-danger))] ' + className}
        >
            {message}
        </p>
    ) : null;
}
