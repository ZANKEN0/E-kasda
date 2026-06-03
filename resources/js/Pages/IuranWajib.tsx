import ConfirmActionModal from '@/Components/ConfirmActionModal';
import EkasdaIcon from '@/Components/EkasdaIcon';
import IuranRuleMobileCard from '@/Components/iuran/IuranRuleMobileCard';
import IuranSummaryCard from '@/Components/iuran/IuranSummaryCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type SummaryItem = {
    id_iuran_wajib: number;
    nama_iuran: string;
    nominal_default: string;
    periode: string;
    is_active: boolean;
};

type BillingRule = {
    id_iuran_wajib: number;
    nama_iuran: string;
    nominal_default: number;
    nominal_default_formatted: string;
    periode: 'Bulanan' | 'Tahunan' | 'Insidental';
    jadwal: string;
    keterangan: string;
    is_active: boolean;
    total_tagihan: number;
};

type IuranStats = {
    total_iuran: number;
    aktif: number;
    nonaktif: number;
    nominal_bulanan: string;
};

type IuranForm = {
    nama_iuran: string;
    nominal_default: string;
    periode: 'Bulanan' | 'Tahunan' | 'Insidental';
    is_active: boolean;
};

export default function IuranWajib({
    summary,
    billingRules,
    stats,
    periodOptions,
}: {
    summary: SummaryItem[];
    billingRules: BillingRule[];
    stats: IuranStats;
    periodOptions: Array<'Bulanan' | 'Tahunan' | 'Insidental'>;
}) {
    const { flash, auth } = usePage<PageProps>().props;
    const canManageIuran = auth.user?.role === 'Ketua_RT';
    const [editingRule, setEditingRule] = useState<BillingRule | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<BillingRule | null>(null);

    const form = useForm<IuranForm>({
        nama_iuran: '',
        nominal_default: '',
        periode: 'Bulanan',
        is_active: true,
    });

    const openCreate = () => {
        if (!canManageIuran) {
            return;
        }

        setEditingRule(null);
        form.clearErrors();
        form.setData({
            nama_iuran: '',
            nominal_default: '',
            periode: 'Bulanan',
            is_active: true,
        });
        setIsFormOpen(true);
    };

    const openEdit = (rule: BillingRule) => {
        if (!canManageIuran) {
            return;
        }

        setEditingRule(rule);
        form.clearErrors();
        form.setData({
            nama_iuran: rule.nama_iuran,
            nominal_default: String(rule.nominal_default),
            periode: rule.periode,
            is_active: rule.is_active,
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setEditingRule(null);
        form.clearErrors();
        setIsFormOpen(false);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (!canManageIuran) {
            return;
        }

        if (editingRule) {
            form.put(route('iuran-wajib.update', editingRule.id_iuran_wajib), {
                preserveScroll: true,
                onSuccess: () => closeForm(),
            });
            return;
        }

        form.post(route('iuran-wajib.store'), {
            preserveScroll: true,
            onSuccess: () => closeForm(),
        });
    };

    const deleteRule = (rule: BillingRule) => {
        if (!canManageIuran) {
            return;
        }

        setRuleToDelete(rule);
    };

    const closeDeleteConfirmation = () => {
        setRuleToDelete(null);
    };

    const confirmDeleteRule = () => {
        if (!ruleToDelete) {
            return;
        }

        router.delete(route('iuran-wajib.destroy', ruleToDelete.id_iuran_wajib), {
            onSuccess: () => setRuleToDelete(null),
            preserveScroll: true,
        });
    };

    const toggleStatus = (rule: BillingRule) => {
        if (!canManageIuran) {
            return;
        }

        router.patch(route('iuran-wajib.toggle-status', rule.id_iuran_wajib), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            title="Manajemen Iuran Wajib"
            description="Atur nominal iuran rutin, pola penagihan, dan komponen pendukung yang akan masuk ke sistem tagihan warga."
            actions={
                canManageIuran ? (
                    <button type="button" className="ek-btn-primary w-full sm:w-auto" onClick={openCreate}>
                        <EkasdaIcon name="plus" className="h-4 w-4" />
                        Tambah Komponen Iuran
                    </button>
                ) : null
            }
        >
            <Head title="Iuran Wajib" />

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

            {!canManageIuran ? (
                <div className="mb-6 rounded-2xl border border-[rgba(0,106,97,0.2)] bg-[rgba(134,242,228,0.18)] px-5 py-4 text-sm text-[rgb(var(--ek-text-muted))]">
                    Akun <strong>Bendahara</strong> dapat melihat komponen iuran, tetapi perubahan master iuran hanya dapat dilakukan oleh <strong>Ketua RT</strong>.
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summary.length > 0 ? (
                    summary.map((item, index) => (
                        <IuranSummaryCard
                            key={item.id_iuran_wajib}
                            title={item.nama_iuran}
                            value={item.nominal_default}
                            note={`Periode ${item.periode} - ${item.is_active ? 'Aktif' : 'Nonaktif'}`}
                            featured={index === 0}
                        />
                    ))
                ) : (
                    <section className="ek-card p-6 md:col-span-2 xl:col-span-4">
                        <p className="text-sm text-[rgb(var(--ek-text-muted))]">
                            Belum ada komponen iuran yang tersimpan.
                        </p>
                    </section>
                )}
            </div>

            <section className="mt-6 ek-card overflow-hidden">
                <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                    <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                        Detail Aturan Penagihan
                    </h3>
                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                        Komponen iuran aktif maupun nonaktif yang membentuk tagihan warga.
                    </p>
                </div>
                <div className="space-y-3 p-4 md:hidden">
                    {billingRules.length > 0 ? (
                        billingRules.map((rule) => (
                            <IuranRuleMobileCard
                                key={rule.id_iuran_wajib}
                                rule={rule}
                                canManage={canManageIuran}
                                onEdit={openEdit}
                                onToggle={toggleStatus}
                                onDelete={deleteRule}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] bg-white px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                            Belum ada komponen iuran yang terdaftar.
                        </div>
                    )}
                </div>
                <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left">
                        <thead className="ek-table-header">
                            <tr>
                                <th className="px-6 py-3">Nama Iuran</th>
                                <th className="px-6 py-3">Nominal</th>
                                <th className="px-6 py-3">Jadwal</th>
                                <th className="px-6 py-3">Keterangan</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billingRules.length > 0 ? (
                                billingRules.map((rule) => (
                                    <tr key={rule.id_iuran_wajib} className="ek-table-row">
                                        <td className="px-6 py-4 font-semibold text-[rgb(var(--ek-primary))]">
                                            <div>
                                                <p>{rule.nama_iuran}</p>
                                                <p className="mt-1 text-xs font-medium text-[rgb(var(--ek-text-muted))]">
                                                    Dipakai di {rule.total_tagihan} tagihan
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                            {rule.nominal_default_formatted}
                                        </td>
                                        <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                            {rule.jadwal}
                                        </td>
                                        <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                            {rule.keterangan}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={rule.is_active ? 'ek-badge-success' : 'ek-badge-info'}>
                                                {rule.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {canManageIuran ? (
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <button type="button" className="ek-btn-secondary px-4 py-2 text-xs" onClick={() => openEdit(rule)}>
                                                        Edit
                                                    </button>
                                                    <button type="button" className="ek-btn-secondary px-4 py-2 text-xs" onClick={() => toggleStatus(rule)}>
                                                        {rule.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </button>
                                                    <button type="button" className="ek-btn-secondary px-4 py-2 text-xs" onClick={() => deleteRule(rule)}>
                                                        Hapus
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-right text-xs font-semibold text-[rgb(var(--ek-text-muted))]">
                                                    Akses lihat
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                        Belum ada komponen iuran yang terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <section className="ek-card p-6">
                    <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                        Ringkasan Status
                    </h3>
                    <div className="mt-5 grid gap-3 text-sm text-[rgb(var(--ek-text-muted))] sm:grid-cols-2">
                        <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] p-4">
                            Total komponen iuran: <strong>{stats.total_iuran}</strong>
                        </div>
                        <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] p-4">
                            Iuran aktif: <strong>{stats.aktif}</strong>
                        </div>
                        <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] p-4">
                            Iuran nonaktif: <strong>{stats.nonaktif}</strong>
                        </div>
                        <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] p-4">
                            Total nominal bulanan aktif: <strong>{stats.nominal_bulanan}</strong>
                        </div>
                    </div>
                </section>

                <section className="ek-card p-6">
                    <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                        Catatan Penggunaan
                    </h3>
                    <div className="mt-5 space-y-3 text-sm text-[rgb(var(--ek-text-muted))]">
                        <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] p-4">
                            Komponen aktif akan dipakai sebagai acuan saat kita mulai membuat modul generate tagihan warga.
                        </div>
                        <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] p-4">
                            Komponen yang sudah pernah dipakai di tagihan tidak bisa dihapus langsung agar histori tetap aman.
                        </div>
                        <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] p-4">
                            Bila hanya ingin menghentikan pemakaian untuk periode baru, gunakan tombol aktif/nonaktif.
                        </div>
                    </div>
                </section>
            </div>

            <ConfirmActionModal
                show={ruleToDelete !== null}
                title="Hapus komponen iuran"
                description={
                    ruleToDelete
                        ? `Komponen iuran ${ruleToDelete.nama_iuran} akan dihapus dari master iuran. Gunakan aksi ini hanya jika komponen tersebut memang tidak dipakai lagi.`
                        : 'Komponen iuran yang dipilih akan dihapus dari sistem.'
                }
                confirmLabel="Ya, hapus"
                confirmTone="danger"
                onClose={closeDeleteConfirmation}
                onConfirm={confirmDeleteRule}
            />

            {isFormOpen ? (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(15,23,42,0.45)] px-4 py-4 sm:px-6 sm:py-6">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] sm:max-h-[calc(100vh-3rem)]">
                            <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--ek-border))] px-6 py-5">
                                <div>
                                    <h3 className="text-xl font-bold text-[rgb(var(--ek-primary))]">
                                        {editingRule ? 'Edit Komponen Iuran' : 'Tambah Komponen Iuran'}
                                    </h3>
                                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                        Atur nama, nominal, periode, dan status komponen iuran.
                                    </p>
                                </div>
                                <button type="button" className="ek-btn-ghost h-10 w-10 rounded-full hover:bg-[rgb(var(--ek-surface-soft))]" onClick={closeForm} aria-label="Tutup formulir">
                                    X
                                </button>
                            </div>

                            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                    <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Nama Iuran
                                </label>
                                <input
                                    className="ek-input"
                                    placeholder="Masukkan nama iuran"
                                    value={form.data.nama_iuran}
                                    onChange={(event) => form.setData('nama_iuran', event.target.value)}
                                />
                                {form.errors.nama_iuran ? (
                                    <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.nama_iuran}</p>
                                ) : null}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Nominal Default
                                    </label>
                                    <input
                                        className="ek-input"
                                        placeholder="Contoh: 150000"
                                        value={form.data.nominal_default}
                                        onChange={(event) => form.setData('nominal_default', event.target.value)}
                                    />
                                    {form.errors.nominal_default ? (
                                        <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.nominal_default}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Periode
                                    </label>
                                    <select
                                        className="ek-input"
                                        value={form.data.periode}
                                        onChange={(event) =>
                                            form.setData(
                                                'periode',
                                                event.target.value as 'Bulanan' | 'Tahunan' | 'Insidental',
                                            )
                                        }
                                    >
                                        {periodOptions.map((period) => (
                                            <option key={period} value={period}>
                                                {period}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.periode ? (
                                        <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{form.errors.periode}</p>
                                    ) : null}
                                </div>
                            </div>

                                    <label className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--ek-border))] px-4 py-4 text-sm text-[rgb(var(--ek-text-muted))]">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={(event) => form.setData('is_active', event.target.checked)}
                                        />
                                        Komponen iuran aktif dan siap dipakai pada periode tagihan berikutnya.
                                    </label>
                                </div>
                                <div className="border-t border-[rgb(var(--ek-border))] bg-white px-6 py-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <button type="button" className="ek-btn-secondary w-full sm:w-auto" onClick={closeForm}>
                                            Batal
                                        </button>
                                        <button type="submit" className="ek-btn-primary w-full sm:w-auto" disabled={form.processing}>
                                            {editingRule ? 'Simpan Perubahan' : 'Simpan Iuran'}
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
