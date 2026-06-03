import ConfirmActionModal from '@/Components/ConfirmActionModal';
import EkasdaIcon from '@/Components/EkasdaIcon';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

type TagihanRow = {
    id_tagihan: number;
    id_warga: number;
    id_iuran_wajib: number;
    nama_warga: string;
    no_rumah: string;
    nama_iuran: string;
    bulan: number;
    tahun: number;
    periode_label: string;
    nominal: number;
    nominal_formatted: string;
    status_bayar: 'Lunas' | 'Belum Lunas';
    tanggal_jatuh_tempo: string | null;
    catatan: string | null;
};

type Pagination = {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type Filters = {
    search: string;
    bulan: string;
    tahun: string;
    status: string;
};

type Option = {
    id_warga?: number;
    id_iuran_wajib?: number;
    label?: string;
    nama_iuran?: string;
    nominal_default?: number;
    nominal_default_formatted?: string;
    periode?: string;
};

type TagihanForm = {
    target_scope: 'single' | 'all';
    id_warga: string;
    id_iuran_wajib: string;
    bulan: string;
    tahun: string;
    nominal: string;
    tanggal_jatuh_tempo: string;
    catatan: string;
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

export default function TagihanWarga({
    rows,
    stats,
    pagination,
    filters,
    wargaOptions,
    iuranOptions,
    monthOptions,
    yearOptions,
}: {
    rows: TagihanRow[];
    stats: {
        period_label: string;
        total_tagihan: string;
        belum_lunas: string;
        lunas: string;
    };
    pagination: Pagination;
    filters: Filters;
    wargaOptions: Array<{ id_warga: number; label: string }>;
    iuranOptions: Array<{
        id_iuran_wajib: number;
        nama_iuran: string;
        nominal_default: number;
        nominal_default_formatted: string;
        periode: string;
    }>;
    monthOptions: Record<number, string>;
    yearOptions: number[];
}) {
    const { flash } = usePage<PageProps>().props;
    const [editingRow, setEditingRow] = useState<TagihanRow | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<TagihanRow | null>(null);

    const filterForm = useForm<Filters>({
        search: filters.search ?? '',
        bulan: filters.bulan ?? '',
        tahun: filters.tahun ?? '',
        status: filters.status ?? '',
    });

    const form = useForm<TagihanForm>({
        target_scope: 'single',
        id_warga: '',
        id_iuran_wajib: '',
        bulan: '',
        tahun: String(new Date().getFullYear()),
        nominal: '',
        tanggal_jatuh_tempo: '',
        catatan: '',
    });

    const pages = useMemo(
        () => paginationNumbers(pagination.current_page, pagination.last_page),
        [pagination.current_page, pagination.last_page],
    );
    const exportUrl = route('tagihan-warga.export', {
        search: filters.search || undefined,
        bulan: filters.bulan || undefined,
        tahun: filters.tahun || undefined,
        status: filters.status || undefined,
    });

    const hasMasterData = wargaOptions.length > 0 && iuranOptions.length > 0;

    const syncNominal = (iuranId: string) => {
        const selected = iuranOptions.find(
            (option) => String(option.id_iuran_wajib) === iuranId,
        );

        if (selected) {
            form.setData('nominal', String(selected.nominal_default));
        }
    };

    const openCreate = () => {
        setEditingRow(null);
        form.clearErrors();
        form.setData({
            target_scope: 'single',
            id_warga: '',
            id_iuran_wajib: '',
            bulan: '',
            tahun: String(new Date().getFullYear()),
            nominal: '',
            tanggal_jatuh_tempo: '',
            catatan: '',
        });
        setIsModalOpen(true);
    };

    const openEdit = (row: TagihanRow) => {
        setEditingRow(row);
        form.clearErrors();
        form.setData({
            target_scope: 'single',
            id_warga: String(row.id_warga),
            id_iuran_wajib: String(row.id_iuran_wajib),
            bulan: String(row.bulan),
            tahun: String(row.tahun),
            nominal: String(row.nominal),
            tanggal_jatuh_tempo: row.tanggal_jatuh_tempo ?? '',
            catatan: row.catatan ?? '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingRow(null);
        form.clearErrors();
        setIsModalOpen(false);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (editingRow) {
            form.put(route('tagihan-warga.update', editingRow.id_tagihan), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
            return;
        }

        form.post(route('tagihan-warga.store'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const applyFilters: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(
            route('tagihan-warga'),
            {
                search: filterForm.data.search || undefined,
                bulan: filterForm.data.bulan || undefined,
                tahun: filterForm.data.tahun || undefined,
                status: filterForm.data.status || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        filterForm.setData({
            search: '',
            bulan: '',
            tahun: '',
            status: '',
        });

        router.get(route('tagihan-warga'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const goToPage = (page: number) => {
        router.get(
            route('tagihan-warga'),
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

    const deleteRow = (row: TagihanRow) => {
        setRowToDelete(row);
    };

    const closeDeleteConfirmation = () => {
        setRowToDelete(null);
    };

    const confirmDeleteRow = () => {
        if (!rowToDelete) {
            return;
        }

        router.delete(route('tagihan-warga.destroy', rowToDelete.id_tagihan), {
            onSuccess: () => setRowToDelete(null),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            title="Tagihan Warga"
            description="Pantau status penagihan warga berdasarkan periode aktif dan tindak lanjuti pembayaran yang masih tertunda."
            actions={
                <>
                    <a
                        href={exportUrl}
                        className="ek-btn-secondary w-full justify-center sm:w-auto"
                    >
                        <EkasdaIcon name="download" className="h-4 w-4" />
                        Unduh CSV
                    </a>
                    <button
                        type="button"
                        className="ek-btn-primary w-full justify-center sm:w-auto"
                        onClick={openCreate}
                        disabled={!hasMasterData}
                    >
                        <EkasdaIcon name="plus" className="h-4 w-4" />
                        Buat Tagihan Baru
                    </button>
                </>
            }
        >
            <Head title="Tagihan Warga" />

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

            {!hasMasterData ? (
                <div className="mb-6 rounded-2xl border border-[rgba(0,106,97,0.2)] bg-[rgba(134,242,228,0.18)] px-5 py-4 text-sm text-[rgb(var(--ek-text-muted))]">
                    Tambahkan data <strong>Warga</strong> dan minimal satu <strong>Iuran Wajib</strong> aktif terlebih dahulu agar tagihan bisa dibuat.
                </div>
            ) : null}

            <section className="ek-card p-5">
                <form onSubmit={applyFilters} className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative max-w-none flex-1 sm:max-w-md">
                        <EkasdaIcon
                            name="search"
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--ek-text-muted))]"
                        />
                        <input
                            className="ek-input pl-12"
                            placeholder="Cari warga atau iuran..."
                            value={filterForm.data.search}
                            onChange={(event) => filterForm.setData('search', event.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            className="ek-input w-full sm:w-[160px]"
                            value={filterForm.data.bulan}
                            onChange={(event) => filterForm.setData('bulan', event.target.value)}
                        >
                            <option value="">Semua Bulan</option>
                            {Object.entries(monthOptions).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <select
                            className="ek-input w-full sm:w-[140px]"
                            value={filterForm.data.tahun}
                            onChange={(event) => filterForm.setData('tahun', event.target.value)}
                        >
                            <option value="">Semua Tahun</option>
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <select
                            className="ek-input w-full sm:w-[190px]"
                            value={filterForm.data.status}
                            onChange={(event) => filterForm.setData('status', event.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="Lunas">Lunas</option>
                            <option value="Belum Lunas">Belum Lunas</option>
                        </select>
                        <button type="button" className="ek-btn-secondary" onClick={resetFilters}>
                            Reset Filter
                        </button>
                        <button type="submit" className="ek-btn-primary">
                            Terapkan
                        </button>
                    </div>
                </form>
            </section>

            <section className="mt-6 ek-card overflow-hidden">
                <div className="space-y-4 p-4 md:hidden">
                    {rows.length > 0 ? (
                        rows.map((row) => (
                            <article key={row.id_tagihan} className="ek-mobile-card">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-base font-bold text-[rgb(var(--ek-primary))]">
                                            {row.nama_warga}
                                        </p>
                                        <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                            {row.no_rumah}
                                        </p>
                                    </div>
                                    <span className={row.status_bayar === 'Lunas' ? 'ek-badge-success' : 'ek-badge-danger'}>
                                        {row.status_bayar}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3">
                                    <div className="ek-mobile-field">
                                        <p className="ek-mobile-field-label">Iuran</p>
                                        <p className="ek-mobile-field-value">{row.nama_iuran}</p>
                                    </div>
                                    <div className="ek-mobile-field">
                                        <p className="ek-mobile-field-label">Periode</p>
                                        <p className="ek-mobile-field-value">{row.periode_label}</p>
                                    </div>
                                    <div className="ek-mobile-field">
                                        <p className="ek-mobile-field-label">Nominal</p>
                                        <p className="ek-mobile-field-value">{row.nominal_formatted}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-2">
                                    <button
                                        type="button"
                                        className="ek-btn-secondary w-full justify-center"
                                        onClick={() => openEdit(row)}
                                    >
                                        Edit Tagihan
                                    </button>
                                    <button
                                        type="button"
                                        className="ek-btn-secondary w-full justify-center"
                                        onClick={() => deleteRow(row)}
                                    >
                                        Hapus Tagihan
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                            Belum ada tagihan warga yang tersimpan.
                        </div>
                    )}
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left">
                        <thead className="ek-table-header">
                            <tr>
                                <th className="px-6 py-3">Nama Warga</th>
                                <th className="px-6 py-3">No Rumah</th>
                                <th className="px-6 py-3">Iuran</th>
                                <th className="px-6 py-3">Periode</th>
                                <th className="px-6 py-3 text-right">Nominal</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((row) => (
                                    <tr key={row.id_tagihan} className="ek-table-row">
                                        <td className="px-6 py-4 font-semibold text-[rgb(var(--ek-primary))]">
                                            {row.nama_warga}
                                        </td>
                                        <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                            {row.no_rumah}
                                        </td>
                                        <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                            {row.nama_iuran}
                                        </td>
                                        <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                            {row.periode_label}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">
                                            {row.nominal_formatted}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={row.status_bayar === 'Lunas' ? 'ek-badge-success' : 'ek-badge-danger'}>
                                                {row.status_bayar}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button type="button" className="ek-btn-secondary px-4 py-2 text-xs" onClick={() => openEdit(row)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="ek-btn-secondary px-4 py-2 text-xs" onClick={() => deleteRow(row)}>
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                        Belum ada tagihan warga yang tersimpan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[rgb(var(--ek-border))] px-4 py-4 text-sm text-[rgb(var(--ek-text-muted))] sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                    <p>
                        Menampilkan {pagination.from ?? 0} - {pagination.to ?? 0} dari {pagination.total} tagihan
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

            <div className="mt-6 grid gap-5 md:grid-cols-3">
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">Total Tagihan</p>
                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-text-muted))]">{stats.period_label}</p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">{stats.total_tagihan}</p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">Belum Lunas</p>
                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-text-muted))]">{stats.period_label}</p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">{stats.belum_lunas}</p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">Lunas</p>
                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-text-muted))]">{stats.period_label}</p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">{stats.lunas}</p>
                </section>
            </div>

            <ConfirmActionModal
                show={rowToDelete !== null}
                title="Hapus tagihan warga"
                description={
                    rowToDelete
                        ? `Tagihan ${rowToDelete.nama_warga} untuk iuran ${rowToDelete.nama_iuran} periode ${rowToDelete.periode_label} akan dihapus dari daftar tagihan.`
                        : 'Tagihan yang dipilih akan dihapus dari sistem.'
                }
                confirmLabel="Ya, hapus"
                confirmTone="danger"
                onClose={closeDeleteConfirmation}
                onConfirm={confirmDeleteRow}
            />

            {isModalOpen ? (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(15,23,42,0.45)] px-4 py-4 sm:px-6 sm:py-6">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] sm:max-h-[calc(100vh-3rem)]">
                            <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--ek-border))] px-6 py-5">
                                <div>
                                    <h3 className="text-xl font-bold text-[rgb(var(--ek-primary))]">
                                    {editingRow ? 'Edit Tagihan Warga' : 'Buat Tagihan Warga'}
                                </h3>
                                <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                        {editingRow
                                            ? 'Perbarui detail tagihan warga yang sudah tercatat.'
                                            : 'Pilih target, komponen iuran, dan periode tagihan yang akan dicatat.'}
                                    </p>
                                </div>
                                <button type="button" className="ek-btn-ghost h-10 w-10 rounded-full hover:bg-[rgb(var(--ek-surface-soft))]" onClick={closeModal} aria-label="Tutup formulir">
                                    X
                                </button>
                            </div>

                            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                    {!editingRow ? (
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                                Target Pembuatan
                                            </label>
                                            <select
                                                className="ek-input"
                                                value={form.data.target_scope}
                                                onChange={(event) => {
                                                    const nextScope = event.target.value as 'single' | 'all';
                                                    form.setData((current) => ({
                                                        ...current,
                                                        target_scope: nextScope,
                                                        id_warga: nextScope === 'all' ? '' : current.id_warga,
                                                    }));
                                                }}
                                            >
                                                <option value="single">Satu warga</option>
                                                <option value="all">Semua warga</option>
                                            </select>
                                            <p className="mt-2 text-sm text-[rgb(var(--ek-text-muted))]">
                                                {form.data.target_scope === 'all'
                                                    ? `Sistem akan membuat tagihan untuk semua warga yang belum punya tagihan di periode ini. Saat ini ada ${wargaOptions.length} warga terdaftar.`
                                                    : 'Gunakan mode ini untuk membuat tagihan hanya untuk satu warga tertentu.'}
                                            </p>
                                        </div>
                                    ) : null}

                                    <div className="grid gap-5 md:grid-cols-2">
                                        {form.data.target_scope === 'single' || editingRow ? (
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Warga</label>
                                                <select
                                                    className="ek-input"
                                                    value={form.data.id_warga}
                                                    onChange={(event) => form.setData('id_warga', event.target.value)}
                                                >
                                                    <option value="">Pilih warga</option>
                                                    {wargaOptions.map((option) => (
                                                        <option key={option.id_warga} value={option.id_warga}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {form.errors.id_warga ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.id_warga}</p> : null}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-4 text-sm text-[rgb(var(--ek-text-muted))]">
                                                Mode <strong>Semua warga</strong> aktif. Pilihan warga individual tidak diperlukan.
                                            </div>
                                        )}

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Komponen Iuran</label>
                                            <select
                                                className="ek-input"
                                                value={form.data.id_iuran_wajib}
                                                onChange={(event) => {
                                                    form.setData('id_iuran_wajib', event.target.value);
                                                    syncNominal(event.target.value);
                                                }}
                                            >
                                                <option value="">Pilih iuran</option>
                                                {iuranOptions.map((option) => (
                                                    <option key={option.id_iuran_wajib} value={option.id_iuran_wajib}>
                                                        {option.nama_iuran} - {option.nominal_default_formatted}
                                                    </option>
                                                ))}
                                            </select>
                                            {form.errors.id_iuran_wajib ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.id_iuran_wajib}</p> : null}
                                        </div>
                                    </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Bulan</label>
                                    <select className="ek-input" value={form.data.bulan} onChange={(event) => form.setData('bulan', event.target.value)}>
                                        <option value="">Pilih bulan</option>
                                        {Object.entries(monthOptions).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.bulan ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.bulan}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Tahun</label>
                                    <select className="ek-input" value={form.data.tahun} onChange={(event) => form.setData('tahun', event.target.value)}>
                                        <option value="">Pilih tahun</option>
                                        {yearOptions.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.tahun ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.tahun}</p> : null}
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Nominal</label>
                                    <input
                                        className="ek-input"
                                        placeholder="Contoh: 150000"
                                        value={form.data.nominal}
                                        onChange={(event) => form.setData('nominal', event.target.value)}
                                    />
                                    {form.errors.nominal ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.nominal}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Jatuh Tempo</label>
                                    <input
                                        type="date"
                                        className="ek-input"
                                        value={form.data.tanggal_jatuh_tempo}
                                        onChange={(event) => form.setData('tanggal_jatuh_tempo', event.target.value)}
                                    />
                                    {form.errors.tanggal_jatuh_tempo ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.tanggal_jatuh_tempo}</p> : null}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Catatan</label>
                                <textarea
                                    className="ek-textarea"
                                    rows={4}
                                    value={form.data.catatan}
                                    onChange={(event) => form.setData('catatan', event.target.value)}
                                    placeholder="Catatan tambahan untuk tagihan ini"
                                />
                                {form.errors.catatan ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.catatan}</p> : null}
                            </div>

                                    <div className="rounded-xl border border-dashed border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-4 text-sm text-[rgb(var(--ek-text-muted))]">
                                        Status tagihan akan selalu dibuat sebagai <strong>Belum Lunas</strong>. Pelunasan hanya dapat dilakukan lewat modul <strong>Pembayaran Iuran</strong> agar histori pembayaran dan kas tetap sinkron.
                                    </div>
                                </div>
                                <div className="border-t border-[rgb(var(--ek-border))] bg-white px-6 py-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <button type="button" className="ek-btn-secondary w-full sm:w-auto" onClick={closeModal}>
                                            Batal
                                        </button>
                                        <button type="submit" className="ek-btn-primary w-full sm:w-auto" disabled={form.processing}>
                                            {editingRow
                                                ? 'Simpan Perubahan'
                                                : form.data.target_scope === 'all'
                                                  ? 'Buat Tagihan Massal'
                                                  : 'Simpan Tagihan'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : null}
        </AuthenticatedLayout>
    );
}
