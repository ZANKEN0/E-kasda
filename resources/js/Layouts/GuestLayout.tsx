import ApplicationLogo from '@/Components/ApplicationLogo';
import FlashToastStack from '@/Components/FlashToastStack';
import { PropsWithChildren, ReactNode } from 'react';

type GuestLayoutProps = PropsWithChildren<{
    mode?: 'login' | 'register';
    title?: string;
    subtitle?: string;
    bottom?: ReactNode;
}>;

export default function GuestLayout({
    mode = 'login',
    title = 'E-KASDA',
    subtitle = 'Sistem Administrasi Kas RT',
    bottom,
    children,
}: GuestLayoutProps) {
    const isRegister = mode === 'register';

    return (
        <div className="min-h-screen bg-[rgb(var(--ek-background))] px-4 py-10 sm:px-6 lg:px-8">
            <FlashToastStack />
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
                <div
                    className={`ek-card w-full ${
                        isRegister ? 'max-w-2xl px-8 py-8 sm:px-10' : 'max-w-xl px-8 py-10'
                    }`}
                >
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--ek-accent-soft))]">
                            <ApplicationLogo className="h-10 w-10" />
                        </div>
                        <h1 className="mt-5 text-[30px] font-bold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                            {title}
                        </h1>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                            {subtitle}
                        </p>
                    </div>

                    <div className="mt-8">{children}</div>

                    {bottom ? <div className="mt-6 text-center">{bottom}</div> : null}
                </div>
            </div>
        </div>
    );
}
