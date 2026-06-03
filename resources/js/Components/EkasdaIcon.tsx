import { SVGAttributes } from 'react';

type IconName =
    | 'dashboard'
    | 'users'
    | 'payments'
    | 'receipt'
    | 'wallet'
    | 'swap'
    | 'report'
    | 'logout'
    | 'search'
    | 'settings'
    | 'notification'
    | 'download'
    | 'plus'
    | 'filter'
    | 'money'
    | 'home'
    | 'shield'
    | 'chart'
    | 'check'
    | 'document'
    | 'print'
    | 'office'
    | 'user'
    | 'lock'
    | 'eye'
    | 'eyeOff'
    | 'headset'
    | 'edit'
    | 'trash'
    | 'map'
    | 'info'
    | 'close'
    | 'menu';

type EkasdaIconProps = SVGAttributes<SVGElement> & {
    name: IconName;
};

export default function EkasdaIcon({
    name,
    className,
    ...props
}: EkasdaIconProps) {
    const common = {
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        strokeWidth: 1.8,
    };

    const icons: Record<IconName, JSX.Element> = {
        dashboard: (
            <>
                <rect x="3" y="3" width="8" height="8" rx="2" {...common} />
                <rect x="13" y="3" width="8" height="5" rx="2" {...common} />
                <rect x="13" y="10" width="8" height="11" rx="2" {...common} />
                <rect x="3" y="13" width="8" height="8" rx="2" {...common} />
            </>
        ),
        users: (
            <>
                <circle cx="9" cy="9" r="3" {...common} />
                <circle cx="16.5" cy="8" r="2.5" {...common} />
                <path d="M4 19c.9-2.7 3-4 5-4s4.1 1.3 5 4" {...common} />
                <path d="M14.5 18c.5-1.7 1.9-2.8 3.8-3" {...common} />
            </>
        ),
        payments: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="3" {...common} />
                <path d="M3 10h18" {...common} />
                <path d="M7 15h4" {...common} />
            </>
        ),
        receipt: (
            <>
                <path d="M7 3h10l4 4v14l-2-1.5L17 21l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5a2 2 0 0 1 2-2Z" {...common} />
                <path d="M9 9h6" {...common} />
                <path d="M9 13h8" {...common} />
                <path d="M9 17h5" {...common} />
            </>
        ),
        wallet: (
            <>
                <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5Z" {...common} />
                <path d="M16 12h5v4h-5a2 2 0 1 1 0-4Z" {...common} />
                <path d="M6.5 8h11" {...common} />
            </>
        ),
        swap: (
            <>
                <path d="M7 7h11l-2.5-2.5" {...common} />
                <path d="M18 7l-2.5 2.5" {...common} />
                <path d="M17 17H6l2.5 2.5" {...common} />
                <path d="M6 17l2.5-2.5" {...common} />
            </>
        ),
        report: (
            <>
                <path d="M6 20V8" {...common} />
                <path d="M12 20V4" {...common} />
                <path d="M18 20v-9" {...common} />
            </>
        ),
        logout: (
            <>
                <path d="M10 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" {...common} />
                <path d="M14 16l4-4-4-4" {...common} />
                <path d="M9 12h9" {...common} />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="6" {...common} />
                <path d="m20 20-3.5-3.5" {...common} />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="2.75" {...common} />
                <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7.3 7.3 0 0 0-2-.9L14 3h-4l-.5 3a7.3 7.3 0 0 0-2 .9l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7.3 7.3 0 0 0 2 .9l.5 3h4l.5-3a7.3 7.3 0 0 0 2-.9l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" {...common} />
            </>
        ),
        notification: (
            <>
                <path d="M8 18h8" {...common} />
                <path d="M10 21h4" {...common} />
                <path d="M6 18V11a6 6 0 1 1 12 0v7l-1.5-1.5H7.5Z" {...common} />
            </>
        ),
        download: (
            <>
                <path d="M12 4v10" {...common} />
                <path d="m8 10 4 4 4-4" {...common} />
                <path d="M4 19h16" {...common} />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" {...common} />
                <path d="M5 12h14" {...common} />
            </>
        ),
        filter: (
            <>
                <path d="M4 6h16" {...common} />
                <path d="M7 12h10" {...common} />
                <path d="M10 18h4" {...common} />
            </>
        ),
        money: (
            <>
                <rect x="3" y="6" width="18" height="12" rx="3" {...common} />
                <circle cx="12" cy="12" r="2.5" {...common} />
                <path d="M7 9h.01M17 15h.01" {...common} />
            </>
        ),
        home: (
            <>
                <path d="M4 10 12 4l8 6v10a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" {...common} />
            </>
        ),
        shield: (
            <>
                <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" {...common} />
                <path d="m9.5 12 1.7 1.7 3.3-3.7" {...common} />
            </>
        ),
        chart: (
            <>
                <path d="M5 19V9" {...common} />
                <path d="M10 19V5" {...common} />
                <path d="M15 19v-7" {...common} />
                <path d="M20 19v-10" {...common} />
            </>
        ),
        check: (
            <>
                <circle cx="12" cy="12" r="9" {...common} />
                <path d="m8.5 12.5 2.3 2.3 4.7-5.1" {...common} />
            </>
        ),
        document: (
            <>
                <path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" {...common} />
                <path d="M15 3v5h5" {...common} />
                <path d="M9 12h6" {...common} />
                <path d="M9 16h6" {...common} />
            </>
        ),
        print: (
            <>
                <path d="M7 8V4h10v4" {...common} />
                <rect x="5" y="10" width="14" height="7" rx="2" {...common} />
                <path d="M7 17h10v3H7z" {...common} />
            </>
        ),
        office: (
            <>
                <path d="M4 10 12 4l8 6" {...common} />
                <path d="M6 10v10h12V10" {...common} />
                <path d="M9 20v-5h6v5" {...common} />
                <path d="M8 12h.01M12 12h.01M16 12h.01" {...common} />
            </>
        ),
        user: (
            <>
                <circle cx="12" cy="8" r="3.2" {...common} />
                <path d="M5.5 19c1.4-3 3.8-4.5 6.5-4.5S17.1 16 18.5 19" {...common} />
            </>
        ),
        lock: (
            <>
                <rect x="5" y="11" width="14" height="10" rx="2" {...common} />
                <path d="M8 11V8a4 4 0 1 1 8 0v3" {...common} />
            </>
        ),
        eye: (
            <>
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" {...common} />
                <circle cx="12" cy="12" r="2.5" {...common} />
            </>
        ),
        eyeOff: (
            <>
                <path d="M3 3l18 18" {...common} />
                <path d="M10.6 5.3A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a16.8 16.8 0 0 1-3.1 4.1" {...common} />
                <path d="M8.2 8.2A4 4 0 0 0 12 16a4 4 0 0 0 2-.5" {...common} />
                <path d="M6 6.2C3.9 7.7 2.5 10 2.5 12c0 0 3.5 7 9.5 7 1.6 0 3-.3 4.3-1" {...common} />
            </>
        ),
        headset: (
            <>
                <path d="M4 13a8 8 0 1 1 16 0" {...common} />
                <rect x="4" y="12.5" width="3.5" height="5.5" rx="1.5" {...common} />
                <rect x="16.5" y="12.5" width="3.5" height="5.5" rx="1.5" {...common} />
                <path d="M7.5 18c.7 1.2 2.1 2 4.5 2h1" {...common} />
            </>
        ),
        edit: (
            <>
                <path d="m4 20 4.2-1 8.6-8.6a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z" {...common} />
                <path d="m12.8 7.2 4 4" {...common} />
            </>
        ),
        trash: (
            <>
                <path d="M4 7h16" {...common} />
                <path d="M9 7V4h6v3" {...common} />
                <path d="M7 7l1 13h8l1-13" {...common} />
                <path d="M10 11v5M14 11v5" {...common} />
            </>
        ),
        map: (
            <>
                <path d="M4 6.5 9 4l6 2 5-2v13.5L15 20l-6-2-5 2V6.5Z" {...common} />
                <path d="M9 4v14M15 6v14" {...common} />
            </>
        ),
        info: (
            <>
                <circle cx="12" cy="12" r="9" {...common} />
                <path d="M12 10v5" {...common} />
                <path d="M12 7.5h.01" {...common} />
            </>
        ),
        close: (
            <>
                <path d="M6 6l12 12" {...common} />
                <path d="M18 6 6 18" {...common} />
            </>
        ),
        menu: (
            <>
                <path d="M4 7h16" {...common} />
                <path d="M4 12h16" {...common} />
                <path d="M4 17h16" {...common} />
            </>
        ),
    };

    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {icons[name]}
        </svg>
    );
}
