import EkasdaIcon from '@/Components/EkasdaIcon';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

type Category = {
    id_kategori: number;
    nama_kategori: string;
    tipe: 'Masuk' | 'Keluar';
};

type Transaction = {
    id_transaksi: number;
    tgl_transaksi: string | null;
    tgl_transaksi_form: string | null;
    jenis_transaksi: 'Masuk' | 'Keluar';
    id_kategori: number;
    kategori: string;
    keterangan: string | null;
    jumlah: number;
    jumlah_formatted: string;
    is_generated: boolean;
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
    jenis: string;
    kategori: string;
    tanggal: string;
};

type TransactionForm = {
    tgl_transaksi: string;
    jenis_transaksi: 'Masuk' | 'Keluar';
    id_kategori: string;
    jumlah: string;
    keterangan: string;
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

export default function TransaksiKas({
    transactions,
    summary,
    pagination,
    filters,
    categories,
}: {
    transactions: Transaction[];
    summary: Array<{ label: string; value: string }>;
    pagination: Pagination;
    filters: Filters;
    categories: Category[];
}) {
    const { flash } = usePage<PageProps>().props;
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const filterForm = useForm<Filters>({
        search: filters.search ?? '',
        jenis: filters.jenis ?? '',
        kategori: filters.kategori ?? '',
        tanggal: filters.tanggal ?? '',
    });

    const transactionForm = useForm<TransactionForm>({
        tgl_transaksi: new Date().toISOString().slice(0, 10),
        jenis_transaksi: 'Masuk',
        id_kategori: '',
        jumlah: '',
        keterangan: '',
    });

    const pages = useMemo(
        () => paginationNumbers(pagination.current_page, pagination.last_page),
        [pagination.current_page, pagination.last_page],
    );

    const filteredCategories = useMemo(
        () => categories.filter((category) => category.tipe === transactionForm.data.jenis_transaksi),
        [categories, transactionForm.data.jenis_transaksi],
    );

    const openCreate = () => {
        setEditingTransaction(null);
        transactionForm.clearErrors();
        transactionForm.setData({
            tgl_transaksi: new Date().toISOString().slice(0, 10),
            jenis_transaksi: 'Masuk',
            id_kategori: '',
            jumlah: '',
            keterangan: '',
        });
        setIsFormOpen(true);
    };

    const openEdit = (transaction: Transaction) => {
        if (transaction.is_generated) {
            return;
        }

        setEditingTransaction(transaction);
        transactionForm.clearErrors();
        transactionForm.setData({
            tgl_transaksi: transaction.tgl_transaksi_form ?? new Date().toISOString().slice(0, 10),
            jenis_transaksi: transaction.jenis_transaksi,
            id_kategori: String(transaction.id_kategori),
            jumlah: String(transaction.jumlah),
            keterangan: transaction.keterangan ?? '',
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setEditingTransaction(null);
        transactionForm.clearErrors();
        setIsFormOpen(false);
    };

    const submitFilters: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(
            route('transaksi-kas'),
            {
                search: filterForm.data.search || undefined,
                jenis: filterForm.data.jenis || undefined,
                kategori: filterForm.data.kategori || undefined,
                tanggal: filterForm.data.tanggal || undefined,
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
            jenis: '',
            kategori: '',
            tanggal: '',
        });

        router.get(route('transaksi-kas'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const goToPage = (page: number) => {
        router.get(
            route('transaksi-kas'),
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

    const submitTransaction: FormEventHandler = (event) => {
        event.preventDefault();

        if (editingTransaction) {
            transactionForm.put(route('transaksi-kas.update', editingTransaction.id_transaksi), {
                preserveScroll: true,
                onSuccess: () => closeForm(),
            });
            return;
        }

        transactionForm.post(route('transaksi-kas.store'), {
            preserveScroll: true,
            onSuccess: () => closeForm(),
        });
    };

    return (
        <AuthenticatedLayout
            title="Transaksi Kas"
            description="Kelola pencatatan kas masuk dan kas keluar untuk mendukung transparansi keuangan RT."
            actions={
                <button type="button" className="ek-btn-primary w-full justify-center sm:w-auto" onClick={openCreate}>
                    <EkasdaIcon name="plus" className="h-4 w-4" />
                    Tambah Transaksi
                </button>
            }
        >
            <Head title="Transaksi Kas" />

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

            <div className="grid gap-5 md:grid-cols-3">
                {summary.map((item) => (
                    <section key={item.label} className="ek-stat-card">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">{item.label}</p>
                        <p className="mt-4 text-[28px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">{item.value}</p>
                    </section>
                ))}
            </div>

            {isFormOpen ? (
                <section className="ek-card mt-6 overflow-hidden">
                    <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--ek-border))] px-6 py-5">
                        <div>
                            <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                                {editingTransaction ? 'Edit Transaksi' : 'Form Transaksi Baru'}
                            </h3>
                            <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                Catat kas masuk atau kas keluar dengan informasi yang jelas agar laporan tetap rapi.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="rounded-full p-2 text-[rgb(var(--ek-text-muted))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                            onClick={closeForm}
                            aria-label="Tutup form transaksi"
                        >
                            <EkasdaIcon name="close" className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={submitTransaction} className="space-y-5 px-6 py-6">
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Tanggal Transaksi</label>
                                <input className="ek-input" type="date" value={transactionForm.data.tgl_transaksi} onChange={(event) => transactionForm.setData('tgl_transaksi', event.target.value)} />
                                {transactionForm.errors.tgl_transaksi ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{transactionForm.errors.tgl_transaksi}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Jenis Transaksi</label>
                                <select
                                    className="ek-input"
                                    value={transactionForm.data.jenis_transaksi}
                                    onChange={(event) => {
                                        transactionForm.setData('jenis_transaksi', event.target.value as 'Masuk' | 'Keluar');
                                        transactionForm.setData('id_kategori', '');
                                    }}
                                >
                                    <option value="Masuk">Masuk</option>
                                    <option value="Keluar">Keluar</option>
                                </select>
                                {transactionForm.errors.jenis_transaksi ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{transactionForm.errors.jenis_transaksi}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Kategori</label>
                                <select className="ek-input" value={transactionForm.data.id_kategori} onChange={(event) => transactionForm.setData('id_kategori', event.target.value)}>
                                    <option value="">Pilih kategori</option>
                                    {filteredCategories.map((category) => (
                                        <option key={category.id_kategori} value={category.id_kategori}>
                                            {category.nama_kategori}
                                        </option>
                                    ))}
                                </select>
                                {transactionForm.errors.id_kategori ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{transactionForm.errors.id_kategori}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Jumlah</label>
                                <input className="ek-input" placeholder="Masukkan jumlah" value={transactionForm.data.jumlah} onChange={(event) => transactionForm.setData('jumlah', event.target.value)} />
                                {transactionForm.errors.jumlah ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{transactionForm.errors.jumlah}</p> : null}
                            </div>
                        </div>

                        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">Keterangan</label>
                                <textarea className="ek-textarea" rows={5} placeholder="Masukkan keterangan transaksi" value={transactionForm.data.keterangan} onChange={(event) => transactionForm.setData('keterangan', event.target.value)} />
                                {transactionForm.errors.keterangan ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{transactionForm.errors.keterangan}</p> : null}
                            </div>

                            <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-5 py-5 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                                <p className="font-semibold text-[rgb(var(--ek-primary))]">
                                    Catatan Form
                                </p>
                                <p className="mt-2">
                                    Pilih kategori yang sesuai dengan jenis transaksi agar pencatatan kas tetap konsisten.
                                </p>
                                <p className="mt-2">
                                    Fokus modul ini pada pencatatan kas yang rapi, ringkas, dan mudah ditinjau kembali saat membuat laporan.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[rgb(var(--ek-border))] pt-5 sm:flex-row sm:justify-end">
                            <button type="button" className="ek-btn-secondary justify-center" onClick={closeForm}>
                                Batal
                            </button>
                            <button type="submit" className="ek-btn-primary justify-center" disabled={transactionForm.processing}>
                                {editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                            </button>
                        </div>
                    </form>
                </section>
            ) : null}

            <section className="ek-card mt-6 p-5">
                <form onSubmit={submitFilters} className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative max-w-none flex-1 sm:max-w-md">
                        <EkasdaIcon
                            name="search"
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--ek-text-muted))]"
                        />
                        <input
                            className="ek-input pl-12"
                            placeholder="Cari transaksi atau keterangan..."
                            value={filterForm.data.search}
                            onChange={(event) => filterForm.setData('search', event.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select className="ek-input w-full sm:w-[170px]" value={filterForm.data.jenis} onChange={(event) => filterForm.setData('jenis', event.target.value)}>
                            <option value="">Semua Jenis</option>
                            <option value="Masuk">Masuk</option>
                            <option value="Keluar">Keluar</option>
                        </select>
                        <select className="ek-input w-full sm:w-[220px]" value={filterForm.data.kategori} onChange={(event) => filterForm.setData('kategori', event.target.value)}>
                            <option value="">Semua Kategori</option>
                            {categories.map((category) => (
                                <option key={category.id_kategori} value={category.id_kategori}>
                                    {category.nama_kategori}
                                </option>
                            ))}
                        </select>
                        <input className="ek-input w-full sm:w-[190px]" type="date" value={filterForm.data.tanggal} onChange={(event) => filterForm.setData('tanggal', event.target.value)} />
                        <button type="button" className="ek-btn-secondary" onClick={resetFilters}>
                            Reset Filter
                        </button>
                        <button type="submit" className="ek-btn-primary">
                            Terapkan
                        </button>
                    </div>
                </form>
            </section>

            <section className="ek-card mt-6 overflow-hidden">
                <div className="border-b border-[rgb(var(--ek-border))] px-6 py-4">
                    <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                        Riwayat Transaksi
                    </h3>
                </div>
                <div className="space-y-4 p-4 md:hidden">
                    {transactions.length > 0 ? (
                        transactions.map((row) => (
                            <article key={row.id_transaksi} className="ek-mobile-card">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-base font-bold text-[rgb(var(--ek-primary))]">
                                            {row.kategori}
                                        </p>
                                        <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                            {row.tgl_transaksi || '-'}
                                        </p>
                                    </div>
                                    <span className={row.jenis_transaksi === 'Masuk' ? 'ek-badge-success' : 'ek-badge-danger'}>
                                        {row.jenis_transaksi}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3">
                                    <div className="ek-mobile-field">
                                        <p className="ek-mobile-field-label">Jumlah</p>
                                        <p className="ek-mobile-field-value">{row.jumlah_formatted}</p>
                                    </div>
                                    <div className="ek-mobile-field">
                                        <p className="ek-mobile-field-label">Keterangan</p>
                                        <p className="ek-mobile-field-value">{row.keterangan || '-'}</p>
                                    </div>
                                </div>

                                {row.is_generated ? (
                                    <p className="mt-3 text-xs text-[rgb(var(--ek-text-muted))]">
                                        Dibuat otomatis dari pembayaran iuran
                                    </p>
                                ) : null}

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        className="ek-btn-secondary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={() => openEdit(row)}
                                        disabled={row.is_generated}
                                    >
                                        Edit Transaksi
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                            Belum ada transaksi kas yang tercatat.
                        </div>
                    )}
                </div>
                <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left">
                        <thead className="ek-table-header">
                            <tr>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Jenis</th>
                                <th className="px-6 py-3">Kategori</th>
                                <th className="px-6 py-3">Keterangan</th>
                                <th className="px-6 py-3 text-right">Jumlah</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((row) => (
                                    <tr key={row.id_transaksi} className="ek-table-row">
                                        <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">{row.tgl_transaksi || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={row.jenis_transaksi === 'Masuk' ? 'ek-badge-success' : 'ek-badge-danger'}>
                                                {row.jenis_transaksi}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">{row.kategori}</td>
                                        <td className="px-6 py-4 font-medium text-[rgb(var(--ek-primary))]">
                                            <div>
                                                <p>{row.keterangan || '-'}</p>
                                                {row.is_generated ? (
                                                    <p className="mt-1 text-xs text-[rgb(var(--ek-text-muted))]">
                                                        Dibuat otomatis dari pembayaran iuran
                                                    </p>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">{row.jumlah_formatted}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    className="ek-btn-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                                                    onClick={() => openEdit(row)}
                                                    disabled={row.is_generated}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                        Belum ada transaksi kas yang tercatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-col gap-3 border-t border-[rgb(var(--ek-border))] px-4 py-4 text-sm text-[rgb(var(--ek-text-muted))] sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
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
        </AuthenticatedLayout>
    );
}
