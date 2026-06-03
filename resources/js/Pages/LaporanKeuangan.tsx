import EkasdaIcon from '@/Components/EkasdaIcon';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';

type ReportTransaction = {
    id_transaksi: number;
    tanggal: string;
    jenis_transaksi: 'Masuk' | 'Keluar';
    kategori: string;
    keterangan: string | null;
    debit: string;
    kredit: string;
    sumber: string;
};

type Pagination = {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type Filters = {
    bulan: string;
    tahun: string;
};

type Summary = {
    saldo_awal: string;
    total_masuk: string;
    total_keluar: string;
    saldo_akhir: string;
    jumlah_transaksi: number;
};

type CategoryBreakdown = {
    kategori: string;
    jenis_transaksi: 'Masuk' | 'Keluar';
    jumlah_transaksi: number;
    total: string;
};

function paginationNumbers(currentPage: number, lastPage: number): Array<number | string> {
    if (lastPage <= 5) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, '...', lastPage];
    }

    if (currentPage >= lastPage - 2) {
        return [1, '...', lastPage - 2, lastPage - 1, lastPage];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
}

export default function LaporanKeuangan({
    filters,
    monthOptions,
    yearOptions,
    periodLabel,
    summary,
    transactions,
    categoryBreakdown,
    pagination,
}: {
    filters: Filters;
    monthOptions: Array<{ value: number; label: string }>;
    yearOptions: number[];
    periodLabel: string;
    summary: Summary;
    transactions: ReportTransaction[];
    categoryBreakdown: CategoryBreakdown[];
    pagination: Pagination;
}) {
    const { flash } = usePage<PageProps>().props;

    const filterForm = useForm<Filters>({
        bulan: filters.bulan ?? '',
        tahun: filters.tahun ?? '',
    });

    const pages = useMemo(
        () => paginationNumbers(pagination.current_page, pagination.last_page),
        [pagination.current_page, pagination.last_page],
    );
    const exportUrl = route('laporan-keuangan.export', {
        bulan: filters.bulan || undefined,
        tahun: filters.tahun || undefined,
    });

    const submitFilters: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(
            route('laporan-keuangan'),
            {
                bulan: filterForm.data.bulan || undefined,
                tahun: filterForm.data.tahun || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const goToPage = (page: number) => {
        router.get(
            route('laporan-keuangan'),
            {
                ...filters,
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout
            title="Laporan Keuangan"
            description="Tinjau arus kas per periode, pahami komposisi transaksi, dan siapkan rekap yang siap dibawa ke rapat pengurus RT."
            actions={
                <a
                    href={exportUrl}
                    className="ek-btn-secondary w-full justify-center sm:w-auto"
                >
                    <EkasdaIcon name="download" className="h-4 w-4" />
                    Unduh CSV
                </a>
            }
        >
            <Head title="Laporan Keuangan" />

            {flash.success ? (
                <div className="mb-6 rounded-2xl border border-[rgba(0,150,104,0.18)] bg-[rgb(var(--ek-success-bg))] px-5 py-4 text-sm font-semibold text-[rgb(var(--ek-success))]">
                    {flash.success}
                </div>
            ) : null}

            {flash.error ? (
                <div className="mb-6 rounded-2xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-5 py-4 text-sm font-semibold text-[rgb(var(--ek-danger))]">
                    {flash.error}
                </div>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-xl border border-[rgb(var(--ek-primary))] bg-[rgb(var(--ek-primary))] px-6 py-6 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)]">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                        Saldo Akhir Periode
                    </p>
                    <p className="mt-4 text-[36px] font-extrabold tracking-[-0.03em]">
                        {summary.saldo_akhir}
                    </p>
                    <p className="mt-3 text-sm text-white/72">
                        Rekapitulasi keuangan untuk periode {periodLabel} dengan {summary.jumlah_transaksi} transaksi tercatat.
                    </p>
                </section>

                <section className="ek-card p-6">
                    <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                        Filter Laporan
                    </h3>
                    <form onSubmit={submitFilters} className="mt-5 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Bulan
                                </label>
                                <select
                                    className="ek-input"
                                    value={filterForm.data.bulan}
                                    onChange={(event) => filterForm.setData('bulan', event.target.value)}
                                >
                                    {monthOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Tahun
                                </label>
                                <select
                                    className="ek-input"
                                    value={filterForm.data.tahun}
                                    onChange={(event) => filterForm.setData('tahun', event.target.value)}
                                >
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="ek-btn-primary w-full justify-center">
                            Generate Laporan
                        </button>
                    </form>
                </section>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Saldo Awal
                    </p>
                    <p className="mt-4 text-[28px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {summary.saldo_awal}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Total Pemasukan
                    </p>
                    <p className="mt-4 text-[28px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-success))]">
                        {summary.total_masuk}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Total Pengeluaran
                    </p>
                    <p className="mt-4 text-[28px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-danger))]">
                        {summary.total_keluar}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Jumlah Transaksi
                    </p>
                    <p className="mt-4 text-[28px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {summary.jumlah_transaksi}
                    </p>
                </section>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <section className="ek-card overflow-hidden">
                    <div className="border-b border-[rgb(var(--ek-border))] px-6 py-4">
                        <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                            Riwayat Transaksi Periode {periodLabel}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="ek-table-header">
                                <tr>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">Jenis</th>
                                    <th className="px-6 py-3">Kategori</th>
                                    <th className="px-6 py-3">Keterangan</th>
                                    <th className="px-6 py-3 text-right">Debit</th>
                                    <th className="px-6 py-3 text-right">Kredit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.map((row) => (
                                        <tr key={row.id_transaksi} className="ek-table-row">
                                            <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                                {row.tanggal}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={
                                                        row.jenis_transaksi === 'Masuk'
                                                            ? 'ek-badge-success'
                                                            : 'ek-badge-danger'
                                                    }
                                                >
                                                    {row.jenis_transaksi}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                                {row.kategori}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-[rgb(var(--ek-primary))]">
                                                <div>
                                                    <p>{row.keterangan || '-'}</p>
                                                    <p className="mt-1 text-xs text-[rgb(var(--ek-text-muted))]">
                                                        {row.sumber}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-[rgb(var(--ek-success))]">
                                                {row.debit}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-[rgb(var(--ek-danger))]">
                                                {row.kredit}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                            Belum ada transaksi pada periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-[rgb(var(--ek-border))] px-6 py-5 text-sm text-[rgb(var(--ek-text-muted))] lg:flex-row lg:items-center lg:justify-between">
                        <p>
                            Menampilkan {pagination.from ?? 0} - {pagination.to ?? 0} dari {pagination.total} transaksi
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                            <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--ek-border))] text-[rgb(var(--ek-text-muted))] disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => goToPage(pagination.current_page - 1)}
                                disabled={pagination.current_page <= 1}
                            >
                                {'<'}
                            </button>
                            {pages.map((page, index) =>
                                typeof page === 'string' ? (
                                    <span key={`ellipsis-${index}`} className="px-1 text-[rgb(var(--ek-text-muted))]">
                                        {page}
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        className={
                                            page === pagination.current_page
                                                ? 'flex h-8 min-w-8 items-center justify-center rounded-lg bg-[rgb(var(--ek-accent))] px-3 text-sm font-bold text-white'
                                                : 'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold text-[rgb(var(--ek-primary))]'
                                        }
                                        onClick={() => goToPage(page)}
                                    >
                                        {page}
                                    </button>
                                ),
                            )}
                            <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--ek-border))] text-[rgb(var(--ek-text-muted))] disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => goToPage(pagination.current_page + 1)}
                                disabled={pagination.current_page >= pagination.last_page}
                            >
                                {'>'}
                            </button>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="ek-card p-6">
                        <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                            Ringkasan Periode
                        </h3>
                        <div className="mt-5 space-y-4 text-sm text-[rgb(var(--ek-text-muted))]">
                            <div className="flex items-center justify-between gap-4">
                                <span>Periode Laporan</span>
                                <span className="font-semibold text-[rgb(var(--ek-primary))]">{periodLabel}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span>Saldo Awal</span>
                                <span className="font-semibold text-[rgb(var(--ek-primary))]">{summary.saldo_awal}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span>Saldo Akhir</span>
                                <span className="font-semibold text-[rgb(var(--ek-primary))]">{summary.saldo_akhir}</span>
                            </div>
                            <div className="rounded-xl border border-dashed border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-4">
                                <p className="text-sm leading-6">
                                    Ekspor PDF belum diaktifkan pada tahap ini. Namun seluruh angka laporan sudah diambil langsung dari transaksi kas dan pembayaran iuran yang tercatat.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="ek-card overflow-hidden">
                        <div className="border-b border-[rgb(var(--ek-border))] px-6 py-4">
                            <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                                Komposisi Kategori
                            </h3>
                        </div>
                        <div className="divide-y divide-[rgb(var(--ek-border))]">
                            {categoryBreakdown.length > 0 ? (
                                categoryBreakdown.map((item) => (
                                    <div key={`${item.kategori}-${item.jenis_transaksi}`} className="flex items-start justify-between gap-4 px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-[rgb(var(--ek-primary))]">{item.kategori}</p>
                                            <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                                {item.jumlah_transaksi} transaksi {item.jenis_transaksi.toLowerCase()}
                                            </p>
                                        </div>
                                        <span className={item.jenis_transaksi === 'Masuk' ? 'ek-badge-success' : 'ek-badge-danger'}>
                                            {item.total}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-sm text-[rgb(var(--ek-text-muted))]">
                                    Belum ada komposisi kategori pada periode ini.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
