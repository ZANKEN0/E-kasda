import ApplicationLogo from '@/Components/ApplicationLogo';
import ConfirmActionModal from '@/Components/ConfirmActionModal';
import EkasdaIcon from '@/Components/EkasdaIcon';
import FlashToastStack from '@/Components/FlashToastStack';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';

type AuthenticatedLayoutProps = PropsWithChildren<{
    title?: string;
    description?: string;
    actions?: ReactNode;
    header?: ReactNode;
}>;

const baseNavigation = [
    { label: 'Dashboard', href: 'dashboard', icon: 'dashboard' as const },
    { label: 'Data Warga', href: 'data-warga', icon: 'users' as const },
    { label: 'Iuran Wajib', href: 'iuran-wajib', icon: 'payments' as const },
    { label: 'Tagihan Warga', href: 'tagihan-warga', icon: 'receipt' as const },
    { label: 'Pembayaran Iuran', href: 'pembayaran-iuran', icon: 'wallet' as const },
    { label: 'Transaksi Kas', href: 'transaksi-kas', icon: 'swap' as const },
    { label: 'Laporan Keuangan', href: 'laporan-keuangan', icon: 'report' as const },
];

type NavigationItem = (typeof baseNavigation)[number];
type MobileNavigationItem = NavigationItem & {
    mobileLabel?: string;
};

type SettingsMenuProps = {
    isKetuaRt: boolean;
    roleLabel: string;
    userName: string;
    buttonClassName?: string;
    menuClassName?: string;
    placement?: 'top' | 'bottom';
};

function SettingsMenu({
    isKetuaRt,
    roleLabel,
    userName,
    buttonClassName = '',
    menuClassName = '',
    placement = 'bottom',
}: SettingsMenuProps) {
    const [open, setOpen] = useState(false);
    const [confirmingLogout, setConfirmingLogout] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (! open) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (! containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    const openLogoutConfirmation = () => {
        setOpen(false);
        setConfirmingLogout(true);
    };

    const closeLogoutConfirmation = () => {
        setConfirmingLogout(false);
    };

    const submitLogout = () => {
        setConfirmingLogout(false);
        router.post(route('logout'));
    };

    return (
        <div ref={containerRef} className={`relative ${menuClassName}`}>
            <button
                type="button"
                className={buttonClassName}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Buka menu pengaturan"
                onClick={() => setOpen((current) => ! current)}
            >
                <EkasdaIcon name="settings" className="h-5 w-5" />
            </button>

            {open ? (
                <div
                    className={`absolute right-0 z-30 w-[240px] overflow-hidden rounded-2xl border border-[rgb(var(--ek-border))] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] ${
                        placement === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'
                    }`}
                >
                    <div className="border-b border-[rgb(var(--ek-border))] px-4 py-4">
                        <p className="text-sm font-bold text-[rgb(var(--ek-primary))]">{userName}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--ek-text-muted))]">
                            {roleLabel}
                        </p>
                    </div>

                    <div className="px-2 py-2">
                        <Link
                            href={route('profile.edit')}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[rgb(var(--ek-primary))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                            onClick={() => setOpen(false)}
                        >
                            <EkasdaIcon name="users" className="h-4 w-4 text-[rgb(var(--ek-accent))]" />
                            <span>Profil Saya</span>
                        </Link>

                        {isKetuaRt ? (
                            <Link
                                href={route('approval.index')}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[rgb(var(--ek-primary))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                                onClick={() => setOpen(false)}
                            >
                                <EkasdaIcon name="users" className="h-4 w-4 text-[rgb(var(--ek-accent))]" />
                                <span>Kelola Akun</span>
                            </Link>
                        ) : null}

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[rgb(var(--ek-danger))] transition hover:bg-[rgb(var(--ek-danger-bg))]"
                            onClick={openLogoutConfirmation}
                        >
                            <EkasdaIcon name="swap" className="h-4 w-4" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            ) : null}

            <ConfirmActionModal
                show={confirmingLogout}
                title="Keluar dari akun"
                description="Anda akan keluar dari sesi saat ini dan perlu masuk lagi untuk melanjutkan pekerjaan."
                confirmLabel="Ya, keluar"
                cancelLabel="Tetap di sini"
                onClose={closeLogoutConfirmation}
                onConfirm={submitLogout}
            />
        </div>
    );
}

function NavLink({
    label,
    href,
    icon,
}: {
    label: string;
    href: string;
    icon: NavigationItem['icon'];
}) {
    const active = route().current(href);

    return (
        <Link
            href={route(href)}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                active
                    ? 'border-l-4 border-[rgb(var(--ek-accent-soft))] bg-[rgba(255,255,255,0.12)] font-bold text-white'
                    : 'border-l-4 border-transparent text-[rgba(255,255,255,0.84)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white'
            }`}
        >
            <EkasdaIcon
                name={icon}
                className={`h-5 w-5 ${active ? 'text-white' : 'text-[rgba(255,255,255,0.78)]'}`}
            />
            <span>{label}</span>
        </Link>
    );
}

function MobileNavLink({
    label,
    href,
    icon,
    onNavigate,
}: {
    label: string;
    href: string;
    icon: NavigationItem['icon'];
    onNavigate?: () => void;
}) {
    const active = route().current(href);

    return (
        <Link
            href={route(href)}
            onClick={onNavigate}
            className={`flex min-h-[76px] flex-col items-start justify-between rounded-2xl border px-3.5 py-3 text-left transition ${
                active
                    ? 'border-[rgb(var(--ek-accent))] bg-[rgba(0,106,97,0.08)] font-bold text-[rgb(var(--ek-accent))] shadow-[0_12px_24px_-20px_rgba(0,106,97,0.55)]'
                    : 'border-[rgb(var(--ek-border))] bg-white text-[rgb(var(--ek-text-muted))]'
            }`}
        >
            <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    active
                        ? 'bg-[rgba(0,106,97,0.12)] text-[rgb(var(--ek-accent))]'
                        : 'bg-[rgb(var(--ek-surface-soft))] text-[rgb(var(--ek-text-muted))]'
                }`}
            >
                <EkasdaIcon name={icon} className="h-4 w-4" />
            </span>
            <span className="line-clamp-2 text-xs font-semibold leading-5">{label}</span>
        </Link>
    );
}

export default function AuthenticatedLayout({
    title = 'Dashboard',
    description = 'Ringkasan sistem administrasi kas RT.',
    actions,
    header,
    children,
}: AuthenticatedLayoutProps) {
    const page = usePage<
        PageProps & {
            globalSearch?: {
                query?: string | null;
            };
        }
    >();
    const { auth, globalSearch } = page.props;
    const userName = auth.user?.nama_lengkap ?? auth.user?.name ?? 'Pengurus RT';
    const isKetuaRt = auth.user?.role === 'Ketua_RT';
    const roleLabel = auth.user?.role === 'Bendahara' ? 'Bendahara RT' : 'Ketua RT';
    const [searchQuery, setSearchQuery] = useState(globalSearch?.query ?? '');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigation: MobileNavigationItem[] = isKetuaRt
        ? [
            ...baseNavigation.map((item) => ({
                ...item,
                mobileLabel:
                    item.href === 'pembayaran-iuran'
                        ? 'Pembayaran'
                        : item.href === 'transaksi-kas'
                          ? 'Transaksi'
                          : item.href === 'laporan-keuangan'
                            ? 'Laporan'
                            : item.label,
            })),
            { label: 'Persetujuan Akun', mobileLabel: 'Akun', href: 'approval.index', icon: 'users' as const },
        ]
        : baseNavigation.map((item) => ({
            ...item,
            mobileLabel:
                item.href === 'pembayaran-iuran'
                    ? 'Pembayaran'
                    : item.href === 'transaksi-kas'
                      ? 'Transaksi'
                      : item.href === 'laporan-keuangan'
                        ? 'Laporan'
                        : item.label,
        }));

    useEffect(() => {
        setSearchQuery(globalSearch?.query ?? '');
    }, [globalSearch?.query]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [page.url]);

    const submitGlobalSearch: FormEventHandler = (event) => {
        event.preventDefault();

        const trimmedQuery = searchQuery.trim();

        router.get(
            route('global-search'),
            trimmedQuery ? { q: trimmedQuery } : {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="flex min-h-screen overflow-x-hidden bg-[rgb(var(--ek-background))] text-[rgb(var(--ek-text))]">
            <FlashToastStack />
            <aside className="hidden w-[280px] flex-col bg-[rgb(var(--ek-primary))] py-6 lg:flex">
                <div className="mb-8 flex items-center gap-4 px-6">
                    <ApplicationLogo className="h-10 w-10" />
                    <div>
                        <h1 className="text-[24px] font-bold text-white">E-KASDA</h1>
                        <p className="text-xs text-[rgba(255,255,255,0.62)]">RT Governance System</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 text-sm">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.href}
                            label={item.label}
                            href={item.href}
                            icon={item.icon}
                        />
                    ))}
                </nav>

                <div className="mx-4 mt-6 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-5 py-4 text-white">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold">{userName}</p>
                            <p className="mt-1 text-xs text-[rgba(255,255,255,0.62)]">{roleLabel}</p>
                        </div>
                        <SettingsMenu
                            isKetuaRt={isKetuaRt}
                            roleLabel={roleLabel}
                            userName={userName}
                            buttonClassName="flex h-8 w-8 items-center justify-center rounded-lg text-[rgba(255,255,255,0.72)] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
                            menuClassName="shrink-0"
                            placement="top"
                        />
                    </div>
                </div>
            </aside>

            <div className="flex min-h-screen flex-1 flex-col">
                <header className="sticky top-0 z-10 border-b border-[rgb(var(--ek-border))] bg-white px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex items-center justify-between lg:hidden">
                            <div className="flex min-w-0 items-center gap-3">
                                <ApplicationLogo className="h-9 w-9 sm:h-10 sm:w-10" />
                                <div>
                                    <p className="text-sm font-bold text-[rgb(var(--ek-primary))] sm:text-base">E-KASDA</p>
                                    <p className="text-xs text-[rgb(var(--ek-text-muted))]">Panel RT</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-[rgb(var(--ek-text-muted))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                                    aria-label="Buka menu utama"
                                    onClick={() => setMobileMenuOpen(true)}
                                >
                                    <EkasdaIcon name="menu" className="h-5 w-5" />
                                </button>
                                <SettingsMenu
                                    isKetuaRt={isKetuaRt}
                                    roleLabel={roleLabel}
                                    userName={userName}
                                    buttonClassName="flex h-10 w-10 items-center justify-center rounded-full text-[rgb(var(--ek-text-muted))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <form
                                onSubmit={submitGlobalSearch}
                                className="relative w-full max-w-none sm:max-w-[480px]"
                            >
                                <EkasdaIcon
                                    name="search"
                                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--ek-text-muted))]"
                                />
                                <input
                                    type="text"
                                    className="h-10 w-full rounded-full border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] pl-11 pr-4 text-sm text-[rgb(var(--ek-text))] outline-none sm:h-11 sm:pl-12"
                                    placeholder="Cari warga, tagihan, transaksi, atau akun..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />
                            </form>

                            <div className="hidden lg:block">
                                <SettingsMenu
                                    isKetuaRt={isKetuaRt}
                                    roleLabel={roleLabel}
                                    userName={userName}
                                    buttonClassName="flex h-10 w-10 items-center justify-center rounded-full text-[rgb(var(--ek-text-muted))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            {header ?? (
                                <>
                                    <h2 className="text-[22px] font-bold tracking-[-0.01em] text-[rgb(var(--ek-primary))] sm:text-[28px]">
                                        {title}
                                    </h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[rgb(var(--ek-text-muted))] sm:leading-7">
                                        {description}
                                    </p>
                                </>
                            )}
                        </div>
                        {actions ? (
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                                {actions}
                            </div>
                        ) : null}
                    </div>

                    {children}
                </main>
            </div>

            {mobileMenuOpen ? (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-[rgba(15,23,42,0.42)]"
                        aria-label="Tutup menu utama"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 flex h-full w-[min(86vw,320px)] flex-col border-r border-[rgb(var(--ek-border))] bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.4)]">
                        <div className="flex items-center justify-between border-b border-[rgb(var(--ek-border))] px-4 py-4">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-9 w-9" />
                                <div>
                                    <p className="text-sm font-bold text-[rgb(var(--ek-primary))]">E-KASDA</p>
                                    <p className="text-xs text-[rgb(var(--ek-text-muted))]">Menu utama</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full text-[rgb(var(--ek-text-muted))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                                aria-label="Tutup menu utama"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <EkasdaIcon name="close" className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            <nav className="grid grid-cols-2 gap-2.5">
                                {navigation.map((item) => (
                                    <MobileNavLink
                                        key={item.href}
                                        label={item.mobileLabel ?? item.label}
                                        href={item.href}
                                        icon={item.icon}
                                        onNavigate={() => setMobileMenuOpen(false)}
                                    />
                                ))}
                            </nav>
                        </div>
                    </aside>
                </div>
            ) : null}
        </div>
    );
}
