import EkasdaIcon from '@/Components/EkasdaIcon';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type ToastKind = 'success' | 'error';

type ToastItem = {
    id: number;
    kind: ToastKind;
    message: string;
};

const TOAST_DURATION_MS = 4500;

export default function FlashToastStack() {
    const { flash } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const lastSeenRef = useRef<{
        success?: string | null;
        error?: string | null;
    }>({});
    const nextIdRef = useRef(1);

    useEffect(() => {
        const pendingToasts: ToastItem[] = [];

        if (flash.success && flash.success !== lastSeenRef.current.success) {
            pendingToasts.push({
                id: nextIdRef.current++,
                kind: 'success',
                message: flash.success,
            });
        }

        if (flash.error && flash.error !== lastSeenRef.current.error) {
            pendingToasts.push({
                id: nextIdRef.current++,
                kind: 'error',
                message: flash.error,
            });
        }

        if (pendingToasts.length > 0) {
            setToasts((current) => [...current, ...pendingToasts]);
        }

        lastSeenRef.current = {
            success: flash.success,
            error: flash.error,
        };
    }, [flash.error, flash.success]);

    useEffect(() => {
        if (toasts.length === 0) {
            return;
        }

        const timers = toasts.map((toast) =>
            window.setTimeout(() => {
                setToasts((current) =>
                    current.filter((item) => item.id !== toast.id),
                );
            }, TOAST_DURATION_MS),
        );

        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [toasts]);

    const dismissToast = (id: number) => {
        setToasts((current) => current.filter((item) => item.id !== id));
    };

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div
            className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
            aria-live="polite"
            aria-atomic="true"
        >
            {toasts.map((toast) => {
                const isSuccess = toast.kind === 'success';

                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto overflow-hidden rounded-2xl border px-4 py-4 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.4)] ${
                            isSuccess
                                ? 'border-[rgba(0,150,104,0.18)] bg-white'
                                : 'border-[rgba(186,26,26,0.18)] bg-white'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                    isSuccess
                                        ? 'bg-[rgb(var(--ek-success-bg))] text-[rgb(var(--ek-success))]'
                                        : 'bg-[rgb(var(--ek-danger-bg))] text-[rgb(var(--ek-danger))]'
                                }`}
                            >
                                <EkasdaIcon
                                    name={isSuccess ? 'check' : 'info'}
                                    className="h-4 w-4"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p
                                    className={`text-xs font-bold uppercase tracking-[0.14em] ${
                                        isSuccess
                                            ? 'text-[rgb(var(--ek-success))]'
                                            : 'text-[rgb(var(--ek-danger))]'
                                    }`}
                                >
                                    {isSuccess ? 'Berhasil' : 'Perhatian'}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-[rgb(var(--ek-primary))]">
                                    {toast.message}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="rounded-full p-1 text-[rgb(var(--ek-text-muted))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                                onClick={() => dismissToast(toast.id)}
                                aria-label="Tutup notifikasi"
                            >
                                <EkasdaIcon name="close" className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
