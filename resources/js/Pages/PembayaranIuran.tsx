import EkasdaIcon from '@/Components/EkasdaIcon';
import PaymentActiveBillCard from '@/Components/pembayaran/PaymentActiveBillCard';
import PaymentHistoryMobileCard from '@/Components/pembayaran/PaymentHistoryMobileCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';

type ResidentOption = {
    id_warga: number;
    label: string;
};

type SelectedResident = {
    id_warga: number;
    nama: string;
    no_rumah: string | null;
    no_telepon: string | null;
    status_hunian: 'Tetap' | 'Kontrak' | null;
};

type ActiveBill = {
    id_tagihan: number;
    id_warga: number;
    nama_warga: string;
    no_rumah: string | null;
    nama_iuran: string;
    periode: string;
    nominal: number;
    nominal_formatted: string;
    status_bayar: 'Belum Lunas';
};

type PaymentHistory = {
    tanggal_bayar: string | null;
    nama_warga?: string;
    nama_iuran: string;
    periode: string;
    jumlah_bayar: string;
    status: string;
};

type IuranOption = {
    id_iuran_wajib: number;
    label: string;
};

type PaymentForm = {
    payment_scope: 'resident' | 'batch';
    id_warga: string;
    bulan: string;
    tahun: string;
    id_iuran_wajib: string;
    tagihan_ids: number[];
    metode_bayar: string;
    tanggal_bayar: string;
    jumlah_bayar: string;
    catatan: string;
};

export default function PembayaranIuran({
    filters,
    residentOptions,
    iuranOptions,
    selectedResident,
    activeBills,
    history,
    totalKas,
    paymentMethods,
    monthOptions,
    yearOptions,
}: {
    filters: {
        scope: string;
        search: string;
        id_warga: string;
        bulan: string;
        tahun: string;
        id_iuran_wajib: string;
    };
    residentOptions: ResidentOption[];
    iuranOptions: IuranOption[];
    selectedResident: SelectedResident | null;
    activeBills: ActiveBill[];
    history: PaymentHistory[];
    totalKas: string;
    paymentMethods: string[];
    monthOptions: Record<number, string>;
    yearOptions: number[];
}) {
    const { flash } = usePage<PageProps>().props;
    const paymentScope = filters.scope === 'batch' ? 'batch' : 'resident';

    const searchForm = useForm({
        scope: paymentScope,
        search: filters.search ?? '',
        id_warga: filters.id_warga ?? '',
        bulan: filters.bulan ?? '',
        tahun: filters.tahun ?? String(new Date().getFullYear()),
        id_iuran_wajib: filters.id_iuran_wajib ?? '',
    });

    const paymentForm = useForm<PaymentForm>({
        payment_scope: paymentScope,
        id_warga: selectedResident ? String(selectedResident.id_warga) : '',
        bulan: filters.bulan ?? '',
        tahun: filters.tahun ?? String(new Date().getFullYear()),
        id_iuran_wajib: filters.id_iuran_wajib ?? '',
        tagihan_ids: [],
        metode_bayar: 'Tunai',
        tanggal_bayar: new Date().toISOString().slice(0, 10),
        jumlah_bayar: '',
        catatan: '',
    });

    const selectedBills = useMemo(
        () => activeBills.filter((bill) => paymentForm.data.tagihan_ids.includes(bill.id_tagihan)),
        [activeBills, paymentForm.data.tagihan_ids],
    );

    const selectedTotal = useMemo(
        () => selectedBills.reduce((sum, bill) => sum + bill.nominal, 0),
        [selectedBills],
    );

    const selectedTotalFormatted = useMemo(() => {
        return `Rp ${selectedTotal.toLocaleString('id-ID')}`;
    }, [selectedTotal]);

    const allSelected = activeBills.length > 0 && selectedBills.length === activeBills.length;

    const syncSelection = (tagihanId: number, checked: boolean) => {
        const next = checked
            ? [...paymentForm.data.tagihan_ids, tagihanId]
            : paymentForm.data.tagihan_ids.filter((id) => id !== tagihanId);

        paymentForm.setData('tagihan_ids', next);
        paymentForm.setData('jumlah_bayar', String(
            activeBills
                .filter((bill) => next.includes(bill.id_tagihan))
                .reduce((sum, bill) => sum + bill.nominal, 0),
        ));
    };

    const syncAllSelection = (checked: boolean) => {
        const next = checked ? activeBills.map((bill) => bill.id_tagihan) : [];

        paymentForm.setData((current) => ({
            ...current,
            tagihan_ids: next,
            jumlah_bayar: checked
                ? String(activeBills.reduce((sum, bill) => sum + bill.nominal, 0))
                : '',
        }));
    };

    const submitSearch: FormEventHandler = (event) => {
        event.preventDefault();

        paymentForm.setData((current) => ({
            ...current,
            tagihan_ids: [],
            jumlah_bayar: '',
            catatan: '',
        }));

        router.get(
            route('pembayaran-iuran'),
            {
                scope: searchForm.data.scope,
                search: searchForm.data.search || undefined,
                id_warga:
                    searchForm.data.scope === 'resident'
                        ? searchForm.data.id_warga || undefined
                        : undefined,
                bulan:
                    searchForm.data.scope === 'batch'
                        ? searchForm.data.bulan || undefined
                        : undefined,
                tahun:
                    searchForm.data.scope === 'batch'
                        ? searchForm.data.tahun || undefined
                        : undefined,
                id_iuran_wajib:
                    searchForm.data.scope === 'batch'
                        ? searchForm.data.id_iuran_wajib || undefined
                        : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const submitPayment: FormEventHandler = (event) => {
        event.preventDefault();

        paymentForm.transform((data) => ({
            ...data,
            payment_scope: paymentScope,
            id_warga:
                paymentScope === 'resident' && selectedResident
                    ? String(selectedResident.id_warga)
                    : '',
            bulan: paymentScope === 'batch' ? searchForm.data.bulan : '',
            tahun: paymentScope === 'batch' ? searchForm.data.tahun : '',
            id_iuran_wajib: paymentScope === 'batch' ? searchForm.data.id_iuran_wajib : '',
        }));

        paymentForm.post(route('pembayaran-iuran.store'), {
            preserveScroll: true,
            onSuccess: () => {
                paymentForm.setData((current) => ({
                    ...current,
                    tagihan_ids: [],
                    jumlah_bayar: '',
                    catatan: '',
                }));
            },
        });
    };

    return (
        <AuthenticatedLayout
            title="Pembayaran Iuran"
            description="Catat pembayaran iuran warga, verifikasi tagihan aktif, dan pantau histori pembayaran dengan cepat."
            actions={
                <div className="w-full rounded-xl border border-[rgb(var(--ek-border))] bg-white px-5 py-4 text-left sm:w-auto sm:min-w-[260px] sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Total Kas Terkini
                    </p>
                    <p className="mt-2 text-[26px] font-extrabold text-[rgb(var(--ek-primary))]">
                        {totalKas}
                    </p>
                </div>
            }
        >
            <Head title="Pembayaran Iuran" />

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

            <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
                <div className="space-y-6">
                    <section className="ek-card p-4 sm:p-5">
                        <form onSubmit={submitSearch} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Mode Pembayaran
                                </label>
                                <select
                                    className="ek-input"
                                    value={searchForm.data.scope}
                                    onChange={(event) =>
                                        searchForm.setData((current) => ({
                                            ...current,
                                            scope: event.target.value as 'resident' | 'batch',
                                            id_warga:
                                                event.target.value === 'resident'
                                                    ? current.id_warga
                                                    : '',
                                        }))
                                    }
                                >
                                    <option value="resident">Per Warga</option>
                                    <option value="batch">Massal per Periode</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                    {searchForm.data.scope === 'resident'
                                        ? 'Cari Warga atau Nomor Rumah'
                                        : 'Cari Warga atau Jenis Iuran'}
                                </label>
                                <input
                                    className="ek-input"
                                    placeholder={
                                        searchForm.data.scope === 'resident'
                                            ? 'Contoh: Budi Santoso atau Blok A'
                                            : 'Contoh: Budi Santoso atau Iuran Kebersihan'
                                    }
                                    value={searchForm.data.search}
                                    onChange={(event) => searchForm.setData('search', event.target.value)}
                                />
                            </div>
                            {searchForm.data.scope === 'resident' ? (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Pilih Warga
                                    </label>
                                    <select
                                        className="ek-input"
                                        value={searchForm.data.id_warga}
                                        onChange={(event) => searchForm.setData('id_warga', event.target.value)}
                                    >
                                        <option value="">Pilih warga</option>
                                        {residentOptions.map((resident) => (
                                            <option key={resident.id_warga} value={resident.id_warga}>
                                                {resident.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                            Bulan
                                        </label>
                                        <select
                                            className="ek-input"
                                            value={searchForm.data.bulan}
                                            onChange={(event) => searchForm.setData('bulan', event.target.value)}
                                        >
                                            <option value="">Pilih bulan</option>
                                            {Object.entries(monthOptions).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
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
                                            value={searchForm.data.tahun}
                                            onChange={(event) => searchForm.setData('tahun', event.target.value)}
                                        >
                                            <option value="">Pilih tahun</option>
                                            {yearOptions.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                            Jenis Iuran
                                        </label>
                                        <select
                                            className="ek-input"
                                            value={searchForm.data.id_iuran_wajib}
                                            onChange={(event) => searchForm.setData('id_iuran_wajib', event.target.value)}
                                        >
                                            <option value="">Semua iuran</option>
                                            {iuranOptions.map((iuran) => (
                                                <option key={iuran.id_iuran_wajib} value={iuran.id_iuran_wajib}>
                                                    {iuran.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                            {searchForm.data.scope === 'batch' ? (
                                <p className="text-sm text-[rgb(var(--ek-text-muted))]">
                                    Mode ini digunakan untuk melunasi banyak tagihan lintas warga dalam satu batch berdasarkan periode.
                                </p>
                            ) : null}
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button type="submit" className="ek-btn-primary w-full sm:w-auto">
                                    Tampilkan Data
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="ek-card p-4 sm:p-6">
                        <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                            {paymentScope === 'resident' ? 'Informasi Warga' : 'Informasi Batch'}
                        </h3>
                        {paymentScope === 'resident' && selectedResident ? (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                        Nama
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        {selectedResident.nama}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                        No Rumah
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        {selectedResident.no_rumah || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                        No Telepon
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        {selectedResident.no_telepon || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                        Status Hunian
                                    </p>
                                    <div className="mt-2">
                                        <span className={selectedResident.status_hunian === 'Tetap' ? 'ek-badge-success' : 'ek-badge-info'}>
                                            {selectedResident.status_hunian === 'Tetap' ? 'Warga Tetap' : selectedResident.status_hunian === 'Kontrak' ? 'Warga Kontrak' : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : paymentScope === 'batch' ? (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                        Periode Batch
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        {searchForm.data.bulan && searchForm.data.tahun
                                            ? `${monthOptions[Number(searchForm.data.bulan)]} ${searchForm.data.tahun}`
                                            : 'Belum dipilih'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                        Tagihan Tersedia
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        {activeBills.length} tagihan belum lunas
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                        Filter Iuran
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        {searchForm.data.id_iuran_wajib
                                            ? iuranOptions.find((item) => String(item.id_iuran_wajib) === searchForm.data.id_iuran_wajib)?.label ?? 'Iuran terpilih'
                                            : 'Semua iuran'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-5 text-sm text-[rgb(var(--ek-text-muted))]">
                                {paymentScope === 'resident'
                                    ? 'Pilih warga terlebih dahulu untuk melihat tagihan aktif dan histori pembayarannya.'
                                    : 'Pilih bulan dan tahun terlebih dahulu untuk menampilkan tagihan yang akan dibayar massal.'}
                            </p>
                        )}
                    </section>

                    <section className="ek-card overflow-hidden">
                        <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                            <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                                Tagihan Aktif
                            </h3>
                        </div>
                        {activeBills.length > 0 ? (
                            <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                                <label className="inline-flex items-center gap-3 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    <input
                                        type="checkbox"
                                        className="rounded border-[rgb(var(--ek-border))] text-[rgb(var(--ek-accent))]"
                                        checked={allSelected}
                                        onChange={(event) => syncAllSelection(event.target.checked)}
                                    />
                                    Pilih semua tagihan yang tampil
                                </label>
                            </div>
                        ) : null}
                        <div className="space-y-3 p-4 md:hidden">
                            {activeBills.length > 0 ? (
                                activeBills.map((bill) => (
                                    <PaymentActiveBillCard
                                        key={bill.id_tagihan}
                                        bill={bill}
                                        paymentScope={paymentScope}
                                        checked={paymentForm.data.tagihan_ids.includes(bill.id_tagihan)}
                                        onChange={(checked: boolean) => syncSelection(bill.id_tagihan, checked)}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] bg-white px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                    Tidak ada tagihan aktif untuk warga ini.
                                </div>
                            )}
                        </div>
                        <div className="hidden space-y-0 md:block">
                            {activeBills.length > 0 ? (
                                activeBills.map((bill) => (
                                    <label
                                        key={bill.id_tagihan}
                                        className="flex items-start gap-3 border-t border-[rgb(var(--ek-border))] px-6 py-4 first:border-t-0"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 rounded border-[rgb(var(--ek-border))] text-[rgb(var(--ek-accent))]"
                                            checked={paymentForm.data.tagihan_ids.includes(bill.id_tagihan)}
                                            onChange={(event) => syncSelection(bill.id_tagihan, event.target.checked)}
                                        />
                                        <div className="flex-1">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    {paymentScope === 'batch' ? (
                                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                                            {bill.nama_warga}
                                                            {bill.no_rumah ? ` - ${bill.no_rumah}` : ''}
                                                        </p>
                                                    ) : null}
                                                    <p className="text-sm font-bold text-[rgb(var(--ek-primary))]">
                                                        {bill.nama_iuran}
                                                    </p>
                                                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                                        Periode: {bill.periode}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-[rgb(var(--ek-primary))]">
                                                        {bill.nominal_formatted}
                                                    </p>
                                                    <span className="mt-2 inline-flex text-xs font-bold text-[rgb(var(--ek-danger))]">
                                                        {bill.status_bayar}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <div className="px-6 py-6 text-sm text-[rgb(var(--ek-text-muted))]">
                                    Tidak ada tagihan aktif untuk warga ini.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="overflow-hidden rounded-xl border border-[rgb(var(--ek-border))] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)]">
                        <div className="border-b border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-6 py-5">
                            <h3 className="flex items-center gap-2 text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                                <EkasdaIcon name="wallet" className="h-5 w-5 text-[rgb(var(--ek-accent))]" />
                                Form Pembayaran
                            </h3>
                        </div>
                        <form onSubmit={submitPayment} className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
                            <div className="rounded-lg border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                            Tagihan Dipilih
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                            {selectedBills.length > 0
                                                ? `${selectedBills.length} Item${paymentScope === 'batch' ? ' Batch' : ''}`
                                                : 'Belum ada tagihan dipilih'}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                            Nominal Tagihan
                                        </p>
                                        <p className="mt-2 text-[24px] font-extrabold text-[rgb(var(--ek-accent))]">
                                            {selectedTotalFormatted}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <input type="hidden" value={paymentForm.data.id_warga} />
                            <input type="hidden" value={paymentForm.data.payment_scope} />
                            <input type="hidden" value={paymentForm.data.bulan} />
                            <input type="hidden" value={paymentForm.data.tahun} />
                            <input type="hidden" value={paymentForm.data.id_iuran_wajib} />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Metode Pembayaran
                                    </label>
                                    <select
                                        className="ek-input"
                                        value={paymentForm.data.metode_bayar}
                                        onChange={(event) => paymentForm.setData('metode_bayar', event.target.value)}
                                    >
                                        {paymentMethods.map((method) => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}
                                    </select>
                                    {paymentForm.errors.metode_bayar ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{paymentForm.errors.metode_bayar}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Tanggal Bayar
                                    </label>
                                    <input
                                        className="ek-input"
                                        type="date"
                                        value={paymentForm.data.tanggal_bayar}
                                        onChange={(event) => paymentForm.setData('tanggal_bayar', event.target.value)}
                                    />
                                    {paymentForm.errors.tanggal_bayar ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{paymentForm.errors.tanggal_bayar}</p> : null}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Nominal Bayar (Rp)
                                </label>
                                <input
                                    className="h-12 w-full rounded-lg border border-[rgb(var(--ek-border))] bg-white px-4 text-left text-[22px] font-semibold text-[rgb(var(--ek-primary))] outline-none sm:text-right sm:text-[24px]"
                                    value={selectedBills.length > 0 ? paymentForm.data.jumlah_bayar : ''}
                                    readOnly
                                />
                                {paymentForm.errors.jumlah_bayar ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{paymentForm.errors.jumlah_bayar}</p> : null}
                                <p className="mt-2 text-sm text-[rgb(var(--ek-text-muted))]">
                                    Sistem tidak mendukung cicilan, jadi nominal harus sama dengan total tagihan terpilih.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Keterangan (Opsional)
                                </label>
                                <textarea
                                    className="ek-textarea"
                                    rows={4}
                                    placeholder="Tambahkan catatan pembayaran..."
                                    value={paymentForm.data.catatan}
                                    onChange={(event) => paymentForm.setData('catatan', event.target.value)}
                                />
                                {paymentForm.errors.catatan ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{paymentForm.errors.catatan}</p> : null}
                            </div>

                            {paymentForm.errors.tagihan_ids ? <p className="text-sm text-[rgb(var(--ek-danger))]">{paymentForm.errors.tagihan_ids}</p> : null}
                            {paymentForm.errors.id_warga ? <p className="text-sm text-[rgb(var(--ek-danger))]">{paymentForm.errors.id_warga}</p> : null}
                            {paymentForm.errors.bulan ? <p className="text-sm text-[rgb(var(--ek-danger))]">{paymentForm.errors.bulan}</p> : null}
                            {paymentForm.errors.tahun ? <p className="text-sm text-[rgb(var(--ek-danger))]">{paymentForm.errors.tahun}</p> : null}

                            <div className="flex flex-col gap-3 border-t border-[rgb(var(--ek-border))] pt-6 sm:flex-row sm:justify-end">
                                <button type="button" className="ek-btn-secondary w-full sm:w-auto" disabled>
                                    <EkasdaIcon name="print" className="h-4 w-4" />
                                    Cetak Kwitansi
                                </button>
                                <button
                                    type="submit"
                                    className="ek-btn-primary w-full sm:w-auto"
                                    disabled={
                                        (paymentScope === 'resident' && !selectedResident)
                                        || selectedBills.length === 0
                                        || paymentForm.processing
                                    }
                                >
                                    {paymentScope === 'batch'
                                        ? 'Simpan Pembayaran Massal'
                                        : 'Simpan Pembayaran'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="ek-card overflow-hidden">
                        <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                            <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                                Histori Pembayaran Terakhir
                            </h3>
                        </div>
                        <div className="space-y-3 p-4 md:hidden">
                            {history.length > 0 ? (
                                history.map((row, index) => (
                                    <PaymentHistoryMobileCard
                                        key={`${row.tanggal_bayar}-${row.nama_iuran}-${index}`}
                                        row={row}
                                        paymentScope={paymentScope}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] bg-white px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                    Belum ada histori pembayaran untuk warga yang dipilih.
                                </div>
                            )}
                        </div>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full text-left">
                                <thead className="ek-table-header">
                                    <tr>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Jenis Iuran</th>
                                        <th className="px-6 py-3">Periode</th>
                                        <th className="px-6 py-3 text-right">Nominal</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? (
                                        history.map((row, index) => (
                                            <tr key={`${row.tanggal_bayar}-${row.nama_iuran}-${index}`} className="ek-table-row">
                                                <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">{row.tanggal_bayar || '-'}</td>
                                                <td className="px-6 py-4 font-semibold text-[rgb(var(--ek-primary))]">
                                                    <div>
                                                        <p>{row.nama_iuran}</p>
                                                        {paymentScope === 'batch' && row.nama_warga ? (
                                                            <p className="mt-1 text-xs font-medium text-[rgb(var(--ek-text-muted))]">
                                                                {row.nama_warga}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">{row.periode}</td>
                                                <td className="px-6 py-4 text-right font-bold">{row.jumlah_bayar}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="ek-badge-success">{row.status}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                                Belum ada histori pembayaran untuk warga yang dipilih.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
