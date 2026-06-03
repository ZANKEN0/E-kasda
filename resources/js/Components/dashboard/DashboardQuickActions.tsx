import EkasdaIcon from '@/Components/EkasdaIcon';
import { Link } from '@inertiajs/react';

type QuickAction = {
    label: string;
    href: string;
    icon: 'wallet' | 'swap' | 'report' | 'users';
    primary?: boolean;
};

const quickActions: QuickAction[] = [
    { label: 'Catat Pembayaran', href: 'pembayaran-iuran', icon: 'wallet', primary: true },
    { label: 'Tambah Transaksi', href: 'transaksi-kas', icon: 'swap' },
    { label: 'Lihat Laporan', href: 'laporan-keuangan', icon: 'report' },
    { label: 'Kelola Data Warga', href: 'data-warga', icon: 'users' },
];

export default function DashboardQuickActions() {
    return (
        <section className="mt-6">
            <div className="grid gap-3 sm:flex sm:flex-wrap">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        href={route(action.href)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition sm:min-w-[180px] sm:flex-1 ${
                            action.primary
                                ? 'border-[rgb(var(--ek-accent))] bg-[rgb(var(--ek-accent))] text-white shadow-[0_18px_30px_-20px_rgba(0,106,97,0.55)]'
                                : 'border-[rgb(var(--ek-border))] bg-white text-[rgb(var(--ek-primary))] hover:bg-[rgb(var(--ek-surface-soft))]'
                        }`}
                    >
                        <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                action.primary
                                    ? 'bg-white/14 text-white'
                                    : 'bg-[rgb(var(--ek-surface-soft))] text-[rgb(var(--ek-accent))]'
                            }`}
                        >
                            <EkasdaIcon name={action.icon} className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-bold">{action.label}</span>
                            <span
                                className={`mt-0.5 block text-xs ${
                                    action.primary ? 'text-white/75' : 'text-[rgb(var(--ek-text-muted))]'
                                }`}
                            >
                                Buka modul terkait
                            </span>
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
