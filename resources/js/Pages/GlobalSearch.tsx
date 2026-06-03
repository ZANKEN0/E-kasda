import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

type SearchItem = {
    id: number;
    title: string;
    subtitle: string;
    href: string | null;
};

type SearchSection = {
    label: string;
    items: SearchItem[];
    href: string | null;
};

export default function GlobalSearch({
    globalSearch,
    results,
    meta,
}: {
    globalSearch: {
        query: string;
    };
    results: {
        warga: SearchSection;
        tagihan: SearchSection;
        transaksi: SearchSection;
        akun: SearchSection;
    };
    meta: {
        can_search_accounts: boolean;
        total_results: number;
    };
}) {
    const sections = [
        results.warga,
        results.tagihan,
        results.transaksi,
        ...(meta.can_search_accounts ? [results.akun] : []),
    ];

    return (
        <AuthenticatedLayout
            title="Hasil Pencarian"
            description={
                globalSearch.query
                    ? `Menampilkan hasil pencarian untuk "${globalSearch.query}" dari beberapa modul utama.`
                    : 'Ketik kata kunci pada search bar atas untuk mencari data warga, tagihan, transaksi, atau akun.'
            }
        >
            <Head title="Hasil Pencarian" />

            <section className="ek-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                            Kata Kunci
                        </p>
                        <p className="mt-3 text-[28px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                            {globalSearch.query || 'Belum ada pencarian'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-5 py-4 text-sm text-[rgb(var(--ek-text-muted))]">
                        Total hasil cepat: <span className="font-bold text-[rgb(var(--ek-primary))]">{meta.total_results}</span>
                    </div>
                </div>
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                {sections.map((section) => (
                    <section key={section.label} className="ek-card overflow-hidden">
                        <div className="flex items-center justify-between gap-4 border-b border-[rgb(var(--ek-border))] px-6 py-4">
                            <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                                {section.label}
                            </h3>
                            {section.href ? (
                                <Link
                                    href={section.href}
                                    className="text-sm font-semibold text-[rgb(var(--ek-accent))]"
                                >
                                    Buka modul
                                </Link>
                            ) : null}
                        </div>

                        {section.items.length > 0 ? (
                            <div className="divide-y divide-[rgb(var(--ek-border))]">
                                {section.items.map((item) => (
                                    <Link
                                        key={`${section.label}-${item.id}`}
                                        href={item.href ?? '#'}
                                        className="block px-6 py-4 transition hover:bg-[rgb(var(--ek-surface-soft))]"
                                    >
                                        <p className="font-semibold text-[rgb(var(--ek-primary))]">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-[rgb(var(--ek-text-muted))]">
                                            {item.subtitle || '-'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-10 text-sm text-[rgb(var(--ek-text-muted))]">
                                {globalSearch.query
                                    ? `Belum ada hasil di bagian ${section.label.toLowerCase()}.`
                                    : `Belum ada kata kunci untuk mencari di bagian ${section.label.toLowerCase()}.`}
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
