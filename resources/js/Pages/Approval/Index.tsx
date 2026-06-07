import ConfirmActionModal from '@/Components/ConfirmActionModal';
import ManagedAccountMobileCard from '@/Components/approval/ManagedAccountMobileCard';
import PendingAccountMobileCard from '@/Components/approval/PendingAccountMobileCard';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import EkasdaIcon from '@/Components/EkasdaIcon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useRef, useState } from 'react';

type ApprovalAccount = {
    id_user: number;
    name: string;
    username?: string;
    email: string;
    no_telepon?: string | null;
    role: string;
    is_active?: boolean;
    created_at?: string | null;
    email_verified_at?: string | null;
    approved_at?: string | null;
    is_approved?: boolean;
    is_current_user?: boolean;
};

type ApprovalStats = {
    total: number;
    pending: number;
    approved: number;
    active: number;
    inactive: number;
    ketua_rt: number;
    bendahara: number;
    stale_unverified: number;
};

type CreateAccountForm = {
    nama_lengkap: string;
    username: string;
    email: string;
    no_telepon: string;
    role: 'Ketua_RT' | 'Bendahara';
    password: string;
    password_confirmation: string;
};

type EditAccountForm = {
    nama_lengkap: string;
    username: string;
    email: string;
    no_telepon: string;
    role: 'Ketua_RT' | 'Bendahara';
    password: string;
    password_confirmation: string;
};

export default function ApprovalIndex({
    stats,
    pendingAccounts,
    managedAccounts,
    staleUnverifiedAccounts,
    cleanupPolicy,
    filters,
}: {
    stats: ApprovalStats;
    pendingAccounts: ApprovalAccount[];
    managedAccounts: ApprovalAccount[];
    staleUnverifiedAccounts: ApprovalAccount[];
    cleanupPolicy: {
        days: number;
    };
    filters: {
        search: string;
    };
}) {
    const { flash } = usePage<PageProps>().props;
    const [roleSelections, setRoleSelections] = useState<Record<number, 'Ketua_RT' | 'Bendahara'>>(
        () =>
            Object.fromEntries(
                pendingAccounts.map((account) => [
                    account.id_user,
                    account.role === 'Ketua_RT' ? 'Ketua_RT' : 'Bendahara',
                ]),
            ),
    );
    const [editingAccount, setEditingAccount] = useState<ApprovalAccount | null>(null);
    const [accountToDelete, setAccountToDelete] = useState<ApprovalAccount | null>(null);
    const [accountToToggleActive, setAccountToToggleActive] = useState<ApprovalAccount | null>(null);
    const [showCleanupConfirmation, setShowCleanupConfirmation] = useState(false);
    const [showStaleAccountsModal, setShowStaleAccountsModal] = useState(false);
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showCreatePasswordConfirmation, setShowCreatePasswordConfirmation] =
        useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [showEditPasswordConfirmation, setShowEditPasswordConfirmation] =
        useState(false);
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState(filters.search);
    const passwordInput = useRef<HTMLInputElement | null>(null);

    const createForm = useForm<CreateAccountForm>({
        nama_lengkap: '',
        username: '',
        email: '',
        no_telepon: '',
        role: 'Bendahara',
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm<EditAccountForm>({
        nama_lengkap: '',
        username: '',
        email: '',
        no_telepon: '',
        role: 'Bendahara',
        password: '',
        password_confirmation: '',
    });
    const deleteForm = useForm({
        password: '',
    });

    const approvedAccounts = useMemo(
        () => managedAccounts.filter((account) => account.is_approved),
        [managedAccounts],
    );

    useEffect(() => {
        setSearchKeyword(filters.search);
    }, [filters.search]);

    const submitSearch: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(
            route('approval.index'),
            {
                search: searchKeyword.trim() || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetSearch = () => {
        setSearchKeyword('');
        router.get(route('approval.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const submitCreate = () => {
        createForm.post(route('approval.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreatePassword(false);
                setShowCreatePasswordConfirmation(false);
            },
        });
    };

    const approveAccount = (account: ApprovalAccount) => {
        router.patch(
            route('approval.approve', account.id_user),
            {
                role: roleSelections[account.id_user] ?? 'Bendahara',
            },
            {
                preserveScroll: true,
            },
        );
    };

    const openEditModal = (account: ApprovalAccount) => {
        setEditingAccount(account);
        editForm.setData({
            nama_lengkap: account.name,
            username: account.username ?? '',
            email: account.email,
            no_telepon: account.no_telepon ?? '',
            role: account.role === 'Ketua_RT' ? 'Ketua_RT' : 'Bendahara',
            password: '',
            password_confirmation: '',
        });
        editForm.clearErrors();
        setShowEditPassword(false);
        setShowEditPasswordConfirmation(false);
    };

    const closeEditModal = () => {
        setEditingAccount(null);
        editForm.reset();
        editForm.clearErrors();
        setShowEditPassword(false);
        setShowEditPasswordConfirmation(false);
    };

    const submitEdit = () => {
        if (! editingAccount) {
            return;
        }

        editForm.put(route('approval.update', editingAccount.id_user), {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const openDeleteModal = (account: ApprovalAccount) => {
        setAccountToDelete(account);
        deleteForm.reset();
        deleteForm.clearErrors();
    };

    const closeDeleteModal = () => {
        setAccountToDelete(null);
        deleteForm.reset();
        deleteForm.clearErrors();
        setShowDeletePassword(false);
    };

    const submitDelete: FormEventHandler = (event) => {
        event.preventDefault();

        if (! accountToDelete) {
            return;
        }

        deleteForm.post(route('approval.destroy', accountToDelete.id_user), {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => deleteForm.reset('password'),
        });
    };

    const cleanupUnverifiedAccounts = () => {
        setShowCleanupConfirmation(false);
        router.post(
            route('approval.cleanup-unverified'),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const submitToggleActive = () => {
        if (! accountToToggleActive) {
            return;
        }

        router.patch(
            route('approval.toggle-active', accountToToggleActive.id_user),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setAccountToToggleActive(null),
            },
        );
    };

    return (
        <AuthenticatedLayout
            title="Kelola Akun"
            description="Kelola akun pengurus dari satu tempat: tambah akun manual, setujui akun pending, ubah role, dan hapus akun yang tidak dipakai."
        >
            <Head title="Kelola Akun" />

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

            <section className="ek-card mb-6 overflow-hidden">
                <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                            Pencarian Akun
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[rgb(var(--ek-primary))]">
                            Cari akun berdasarkan nama, username, email, role, atau nomor telepon
                        </h3>
                    </div>

                    <form onSubmit={submitSearch} className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-3xl">
                        <input
                            className="ek-input flex-1"
                            value={searchKeyword}
                            onChange={(event) => setSearchKeyword(event.target.value)}
                            placeholder="Contoh: wiwaw, bendahara, 0812, atau email akun"
                        />
                        <button type="submit" className="ek-btn-primary justify-center">
                            Cari
                        </button>
                        <button
                            type="button"
                            className="ek-btn-secondary justify-center"
                            onClick={resetSearch}
                            disabled={searchKeyword.trim() === '' && filters.search === ''}
                        >
                            Reset
                        </button>
                    </form>
                </div>

                {filters.search !== '' ? (
                    <div className="border-t border-[rgb(var(--ek-border))] bg-[rgba(var(--ek-primary-soft),0.08)] px-4 py-4 text-sm text-[rgb(var(--ek-primary))] sm:px-6">
                        Menampilkan hasil untuk kata kunci <strong>{filters.search}</strong>.
                    </div>
                ) : null}
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Total Akun
                    </p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {stats.total}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Menunggu Persetujuan
                    </p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {stats.pending}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Sudah Disetujui
                    </p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {stats.approved}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Akun Aktif
                    </p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {stats.active}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Nonaktif
                    </p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {stats.inactive}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Ketua RT
                    </p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {stats.ketua_rt}
                    </p>
                </section>
                <section className="ek-stat-card">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                        Bendahara
                    </p>
                    <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {stats.bendahara}
                    </p>
                </section>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="ek-card overflow-hidden">
                    <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                        <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                            Tambah Akun Manual
                        </h3>
                    </div>

                    <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Nama Lengkap
                                </label>
                                <input
                                    className="ek-input"
                                    value={createForm.data.nama_lengkap}
                                    onChange={(event) => createForm.setData('nama_lengkap', event.target.value)}
                                />
                                {createForm.errors.nama_lengkap ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{createForm.errors.nama_lengkap}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Username
                                </label>
                                <input
                                    className="ek-input"
                                    value={createForm.data.username}
                                    onChange={(event) => createForm.setData('username', event.target.value)}
                                />
                                {createForm.errors.username ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{createForm.errors.username}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Email
                                </label>
                                <input
                                    className="ek-input"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(event) => createForm.setData('email', event.target.value)}
                                />
                                {createForm.errors.email ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{createForm.errors.email}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Nomor Telepon
                                </label>
                                <input
                                    className="ek-input"
                                    type="text"
                                    value={createForm.data.no_telepon}
                                    onChange={(event) => createForm.setData('no_telepon', event.target.value)}
                                    placeholder="Contoh: 081234567890"
                                />
                                {createForm.errors.no_telepon ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{createForm.errors.no_telepon}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Role
                                </label>
                                <select
                                    className="ek-input"
                                    value={createForm.data.role}
                                    onChange={(event) => createForm.setData('role', event.target.value as 'Ketua_RT' | 'Bendahara')}
                                >
                                    <option value="Bendahara">Bendahara</option>
                                    <option value="Ketua_RT">Ketua RT</option>
                                </select>
                                {createForm.errors.role ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{createForm.errors.role}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Kata Sandi Awal
                                </label>
                                <div className="relative">
                                    <input
                                        className="ek-input pr-11"
                                        type={showCreatePassword ? 'text' : 'password'}
                                        value={createForm.data.password}
                                        onChange={(event) => createForm.setData('password', event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                                        onClick={() => setShowCreatePassword((current) => ! current)}
                                        aria-label={showCreatePassword ? 'Sembunyikan kata sandi awal' : 'Tampilkan kata sandi awal'}
                                    >
                                        <EkasdaIcon
                                            name={showCreatePassword ? 'eyeOff' : 'eye'}
                                            className="h-5 w-5"
                                        />
                                    </button>
                                </div>
                                {createForm.errors.password ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{createForm.errors.password}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Konfirmasi Kata Sandi
                                </label>
                                <div className="relative">
                                    <input
                                        className="ek-input pr-11"
                                        type={showCreatePasswordConfirmation ? 'text' : 'password'}
                                        value={createForm.data.password_confirmation}
                                        onChange={(event) => createForm.setData('password_confirmation', event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                                        onClick={() =>
                                            setShowCreatePasswordConfirmation(
                                                (current) => ! current,
                                            )
                                        }
                                        aria-label={
                                            showCreatePasswordConfirmation
                                                ? 'Sembunyikan konfirmasi kata sandi'
                                                : 'Tampilkan konfirmasi kata sandi'
                                        }
                                    >
                                        <EkasdaIcon
                                            name={
                                                showCreatePasswordConfirmation
                                                    ? 'eyeOff'
                                                    : 'eye'
                                            }
                                            className="h-5 w-5"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-4 text-sm text-[rgb(var(--ek-text-muted))]">
                            Akun yang dibuat manual akan langsung disetujui dan langsung aktif. User bisa segera masuk tanpa verifikasi email tambahan.
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="ek-btn-primary w-full justify-center sm:w-auto"
                                disabled={createForm.processing}
                                onClick={submitCreate}
                            >
                                Tambah Akun
                            </button>
                        </div>
                    </div>
                </section>

                <section className="ek-card overflow-hidden">
                    <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                        <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                            Akun Menunggu Persetujuan
                        </h3>
                    </div>

                    {pendingAccounts.length > 0 ? (
                        <>
                            <div className="space-y-3 p-4 md:hidden">
                                {pendingAccounts.map((account) => (
                                    <PendingAccountMobileCard
                                        key={account.id_user}
                                        account={account}
                                        selectedRole={roleSelections[account.id_user] ?? 'Bendahara'}
                                        onRoleChange={(role) =>
                                            setRoleSelections((current) => ({
                                                ...current,
                                                [account.id_user]: role,
                                            }))
                                        }
                                        onApprove={() => approveAccount(account)}
                                        onReject={() => openDeleteModal(account)}
                                    />
                                ))}
                            </div>
                            <div className="hidden divide-y divide-[rgb(var(--ek-border))] md:block">
                            {pendingAccounts.map((account) => (
                                <div key={account.id_user} className="px-6 py-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <p className="text-base font-bold text-[rgb(var(--ek-primary))]">
                                                {account.name}
                                            </p>
                                            <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                                {account.email}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[rgb(var(--ek-text-muted))]">
                                                <span>Username: {account.username}</span>
                                                <span>Telepon: {account.no_telepon || '-'}</span>
                                                <span>Daftar: {account.created_at || '-'}</span>
                                                <span>Verify: {account.email_verified_at || '-'}</span>
                                            </div>

                                            <div className="mt-4 max-w-xs">
                                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                                    Role Final Saat Disetujui
                                                </label>
                                                <select
                                                    className="ek-input"
                                                    value={roleSelections[account.id_user] ?? 'Bendahara'}
                                                    onChange={(event) =>
                                                        setRoleSelections((current) => ({
                                                            ...current,
                                                            [account.id_user]: event.target.value as 'Ketua_RT' | 'Bendahara',
                                                        }))
                                                    }
                                                >
                                                    <option value="Bendahara">Bendahara</option>
                                                    <option value="Ketua_RT">Ketua RT</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <button
                                                type="button"
                                                className="ek-btn-secondary w-full justify-center sm:w-auto"
                                                onClick={() => openDeleteModal(account)}
                                            >
                                                Tolak
                                            </button>
                                            <button
                                                type="button"
                                                className="ek-btn-primary w-full justify-center sm:w-auto"
                                                onClick={() => approveAccount(account)}
                                            >
                                                Setujui
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </>
                    ) : (
                        <div className="px-5 py-10 text-sm text-[rgb(var(--ek-text-muted))] sm:px-6">
                            Tidak ada akun yang menunggu persetujuan saat ini.
                        </div>
                    )}
                </section>
            </div>

            <section className="ek-card mt-6 overflow-hidden">
                <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                    <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                        Bersihkan Akun Belum Verifikasi
                    </h3>
                </div>

                <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
                    <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-5 py-4 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                        Gunakan fitur ini untuk merapikan akun yang dibuat tetapi tidak pernah menyelesaikan verifikasi email.
                        Sistem hanya akan menghapus akun yang <strong>belum verifikasi</strong> dan sudah lebih dari <strong>{cleanupPolicy.days} hari</strong>.
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                        <div className="ek-stat-card">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                Siap Dibersihkan
                            </p>
                            <p className="mt-4 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                                {stats.stale_unverified}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[rgb(var(--ek-text-muted))]">
                                Akun belum verifikasi lebih dari {cleanupPolicy.days} hari
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-white px-4 py-4 sm:px-5">
                            <p className="text-sm font-bold text-[rgb(var(--ek-primary))]">
                                Ringkasan Cepat
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                                Daftar akun belum terverifikasi disembunyikan dari halaman utama agar area persetujuan tetap ringkas.
                                Jika perlu mengecek siapa saja yang akan terdampak, buka detail lewat tombol di bawah ini.
                            </p>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <button
                                    type="button"
                                    className="ek-btn-secondary justify-center"
                                    disabled={stats.stale_unverified === 0}
                                    onClick={() => setShowStaleAccountsModal(true)}
                                >
                                    Lihat Daftar Akun Lama
                                </button>
                                <div className="rounded-xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-3 text-sm font-semibold text-[rgb(var(--ek-text-muted))]">
                                    {stats.stale_unverified > 0
                                        ? `${stats.stale_unverified} akun siap ditinjau`
                                        : 'Belum ada akun yang melewati batas pembersihan'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="inline-flex w-full items-center justify-center rounded-xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-5 py-3 text-sm font-semibold text-[rgb(var(--ek-danger))] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            disabled={stats.stale_unverified === 0}
                            onClick={() => setShowCleanupConfirmation(true)}
                        >
                            Bersihkan Akun Lama
                        </button>
                    </div>
                </div>
            </section>

            <section className="ek-card mt-6 overflow-hidden">
                <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                    <h3 className="text-[20px] font-semibold text-[rgb(var(--ek-primary))]">
                        Semua Akun
                    </h3>
                </div>

                {approvedAccounts.length > 0 ? (
                    <>
                        <div className="space-y-3 p-4 md:hidden">
                            {approvedAccounts.map((account) => (
                                <ManagedAccountMobileCard
                                    key={account.id_user}
                                    account={account}
                                    onToggleActive={() => setAccountToToggleActive(account)}
                                    onEdit={() => openEditModal(account)}
                                    onDelete={() => openDeleteModal(account)}
                                />
                            ))}
                        </div>
                        <div className="hidden divide-y divide-[rgb(var(--ek-border))] md:block">
                        {approvedAccounts.map((account) => (
                            <div key={account.id_user} className="px-6 py-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-base font-bold text-[rgb(var(--ek-primary))]">
                                                {account.name}
                                            </p>
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                    account.is_active
                                                        ? 'bg-[rgba(0,150,104,0.14)] text-[rgb(var(--ek-success))]'
                                                        : 'bg-[rgb(var(--ek-danger-bg))] text-[rgb(var(--ek-danger))]'
                                                }`}
                                            >
                                                {account.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                            {account.is_current_user ? (
                                                <span className="inline-flex rounded-full bg-[rgba(0,106,97,0.12)] px-3 py-1 text-xs font-bold text-[rgb(var(--ek-accent))]">
                                                    Akun Saat Ini
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                            {account.email}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[rgb(var(--ek-text-muted))]">
                                            <span>Username: {account.username}</span>
                                            <span>Role: {account.role === 'Ketua_RT' ? 'Ketua RT' : 'Bendahara'}</span>
                                            <span>Telepon: {account.no_telepon || '-'}</span>
                                            <span>Verify: {account.email_verified_at || 'Belum verifikasi'}</span>
                                            <span>Disetujui: {account.approved_at || '-'}</span>
                                            <span>Dibuat: {account.created_at || '-'}</span>
                                        </div>
                                    </div>

                                        <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold ${
                                                account.is_active
                                                    ? 'border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] text-[rgb(var(--ek-danger))]'
                                                    : 'border border-[rgba(0,106,97,0.16)] bg-[rgba(0,106,97,0.08)] text-[rgb(var(--ek-accent))]'
                                            }`}
                                            onClick={() => setAccountToToggleActive(account)}
                                        >
                                            {account.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button
                                            type="button"
                                            className="ek-btn-secondary w-full justify-center sm:w-auto"
                                            onClick={() => openEditModal(account)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-center rounded-xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-4 py-3 text-sm font-semibold text-[rgb(var(--ek-danger))]"
                                            onClick={() => openDeleteModal(account)}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </>
                ) : (
                    <div className="px-5 py-10 text-sm text-[rgb(var(--ek-text-muted))] sm:px-6">
                        Belum ada akun yang disetujui.
                    </div>
                )}
            </section>

            <ConfirmActionModal
                show={showCleanupConfirmation}
                title="Bersihkan akun lama"
                description={`Semua akun yang belum verifikasi email lebih dari ${cleanupPolicy.days} hari akan dihapus dari sistem. Tindakan ini membantu menjaga daftar akun tetap rapi.`}
                confirmLabel="Ya, bersihkan"
                confirmTone="danger"
                onClose={() => setShowCleanupConfirmation(false)}
                onConfirm={cleanupUnverifiedAccounts}
            />

            <Modal show={showStaleAccountsModal} onClose={() => setShowStaleAccountsModal(false)}>
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">
                                Akun Belum Verifikasi
                            </h2>
                            <p className="mt-2 text-sm leading-7 text-gray-600">
                                Daftar ini berisi akun yang belum memverifikasi email dan sudah melewati batas {cleanupPolicy.days} hari.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="rounded-full p-2 text-[rgb(var(--ek-text-muted))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                            onClick={() => setShowStaleAccountsModal(false)}
                            aria-label="Tutup daftar akun belum verifikasi"
                        >
                            <EkasdaIcon name="close" className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-5 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                        {staleUnverifiedAccounts.length > 0 ? (
                            staleUnverifiedAccounts.map((account) => (
                                <div
                                    key={account.id_user}
                                    className="rounded-xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-3"
                                >
                                    <p className="font-semibold text-[rgb(var(--ek-primary))]">
                                        {account.name}
                                    </p>
                                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                        {account.email}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--ek-text-muted))]">
                                        {account.username ? <span>Username: {account.username}</span> : null}
                                        <span>Dibuat {account.created_at || '-'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                Belum ada akun yang melewati batas pembersihan.
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <SecondaryButton type="button" onClick={() => setShowStaleAccountsModal(false)}>
                            Tutup
                        </SecondaryButton>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-5 py-3 text-sm font-semibold text-[rgb(var(--ek-danger))] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={stats.stale_unverified === 0}
                            onClick={() => {
                                setShowStaleAccountsModal(false);
                                setShowCleanupConfirmation(true);
                            }}
                        >
                            Bersihkan Akun Lama
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmActionModal
                show={accountToToggleActive !== null}
                title={accountToToggleActive?.is_active ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                description={
                    accountToToggleActive?.is_active
                        ? `Akun ${accountToToggleActive?.name ?? '-'} akan dinonaktifkan dan tidak bisa login sampai diaktifkan kembali.`
                        : `Akun ${accountToToggleActive?.name ?? '-'} akan diaktifkan kembali dan bisa login sesuai role yang dimiliki.`
                }
                confirmLabel={accountToToggleActive?.is_active ? 'Ya, nonaktifkan' : 'Ya, aktifkan'}
                confirmTone={accountToToggleActive?.is_active ? 'danger' : 'primary'}
                onClose={() => setAccountToToggleActive(null)}
                onConfirm={submitToggleActive}
            />

            {editingAccount ? (
                <div className="fixed inset-0 z-40 overflow-y-auto bg-[rgba(15,23,42,0.45)] px-4 py-8">
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                        <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--ek-border))] px-6 py-5">
                            <div>
                                <h3 className="text-[22px] font-bold text-[rgb(var(--ek-primary))]">
                                    Edit Akun
                                </h3>
                                <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                    Perbarui data akun, role, atau password awal jika memang perlu diganti.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded-full p-2 text-[rgb(var(--ek-text-muted))] transition hover:bg-[rgb(var(--ek-surface-soft))]"
                                onClick={closeEditModal}
                                aria-label="Tutup form edit akun"
                            >
                                <EkasdaIcon name="close" className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 px-6 py-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        className="ek-input"
                                        value={editForm.data.nama_lengkap}
                                        onChange={(event) => editForm.setData('nama_lengkap', event.target.value)}
                                    />
                                    {editForm.errors.nama_lengkap ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{editForm.errors.nama_lengkap}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Username
                                    </label>
                                    <input
                                        className="ek-input"
                                        value={editForm.data.username}
                                        onChange={(event) => editForm.setData('username', event.target.value)}
                                    />
                                    {editForm.errors.username ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{editForm.errors.username}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Email
                                    </label>
                                    <input
                                        className="ek-input"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(event) => editForm.setData('email', event.target.value)}
                                    />
                                    {editForm.errors.email ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{editForm.errors.email}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        className="ek-input"
                                        type="text"
                                        value={editForm.data.no_telepon}
                                        onChange={(event) => editForm.setData('no_telepon', event.target.value)}
                                        placeholder="Contoh: 081234567890"
                                    />
                                    {editForm.errors.no_telepon ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{editForm.errors.no_telepon}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Role
                                    </label>
                                    <select
                                        className="ek-input"
                                        value={editForm.data.role}
                                        onChange={(event) => editForm.setData('role', event.target.value as 'Ketua_RT' | 'Bendahara')}
                                    >
                                        <option value="Bendahara">Bendahara</option>
                                        <option value="Ketua_RT">Ketua RT</option>
                                    </select>
                                    {editForm.errors.role ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{editForm.errors.role}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Kata Sandi Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="ek-input pr-11"
                                            type={showEditPassword ? 'text' : 'password'}
                                            value={editForm.data.password}
                                            onChange={(event) => editForm.setData('password', event.target.value)}
                                            placeholder="Kosongkan jika tidak diubah"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                                            onClick={() => setShowEditPassword((current) => ! current)}
                                            aria-label={showEditPassword ? 'Sembunyikan kata sandi baru' : 'Tampilkan kata sandi baru'}
                                        >
                                            <EkasdaIcon
                                                name={showEditPassword ? 'eyeOff' : 'eye'}
                                                className="h-5 w-5"
                                            />
                                        </button>
                                    </div>
                                    {editForm.errors.password ? <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">{editForm.errors.password}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Konfirmasi Kata Sandi Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="ek-input pr-11"
                                            type={showEditPasswordConfirmation ? 'text' : 'password'}
                                            value={editForm.data.password_confirmation}
                                            onChange={(event) => editForm.setData('password_confirmation', event.target.value)}
                                            placeholder="Kosongkan jika tidak diubah"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                                            onClick={() =>
                                                setShowEditPasswordConfirmation(
                                                    (current) => ! current,
                                                )
                                            }
                                            aria-label={
                                                showEditPasswordConfirmation
                                                    ? 'Sembunyikan konfirmasi kata sandi baru'
                                                    : 'Tampilkan konfirmasi kata sandi baru'
                                            }
                                        >
                                            <EkasdaIcon
                                                name={
                                                    showEditPasswordConfirmation
                                                        ? 'eyeOff'
                                                        : 'eye'
                                                }
                                                className="h-5 w-5"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[rgb(var(--ek-border))] px-6 py-5 sm:flex-row sm:justify-end">
                            <button type="button" className="ek-btn-secondary justify-center" onClick={closeEditModal}>
                                Batal
                            </button>
                            <button
                                type="button"
                                className="ek-btn-primary justify-center"
                                disabled={editForm.processing}
                                onClick={submitEdit}
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <Modal show={accountToDelete !== null} onClose={closeDeleteModal}>
                <form onSubmit={submitDelete} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Konfirmasi Hapus Akun
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-gray-600">
                        Untuk keamanan, masukkan kata sandi akun Ketua RT yang sedang login sebelum
                        menghapus akun
                        {' '}
                        <strong>{accountToDelete?.name ?? '-'}</strong>.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="delete_account_password" value="Kata Sandi Ketua RT" />
                        <div className="relative mt-1">
                            <TextInput
                                id="delete_account_password"
                                type={showDeletePassword ? 'text' : 'password'}
                                name="password"
                                ref={passwordInput}
                                value={deleteForm.data.password}
                                className="block w-full pr-11"
                                isFocused
                                onChange={(event) => deleteForm.setData('password', event.target.value)}
                                placeholder="Masukkan kata sandi Anda"
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                                onClick={() =>
                                    setShowDeletePassword((current) => ! current)
                                }
                                aria-label={
                                    showDeletePassword
                                        ? 'Sembunyikan kata sandi Ketua RT'
                                        : 'Tampilkan kata sandi Ketua RT'
                                }
                            >
                                <EkasdaIcon
                                    name={showDeletePassword ? 'eyeOff' : 'eye'}
                                    className="h-5 w-5"
                                />
                            </button>
                        </div>
                        <InputError message={deleteForm.errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={closeDeleteModal}>
                            Batal
                        </SecondaryButton>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-5 py-3 text-sm font-semibold text-[rgb(var(--ek-danger))] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={deleteForm.processing}
                        >
                            Hapus Akun
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
