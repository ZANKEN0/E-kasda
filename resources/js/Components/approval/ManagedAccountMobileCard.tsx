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
    is_current_user?: boolean;
};

type ManagedAccountMobileCardProps = {
    account: ApprovalAccount;
    onToggleActive: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function ManagedAccountMobileCard({
    account,
    onToggleActive,
    onEdit,
    onDelete,
}: ManagedAccountMobileCardProps) {
    return (
        <article className="ek-mobile-card space-y-4">
            <div className="flex flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-[rgb(var(--ek-primary))]">{account.name}</p>
                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">{account.email}</p>
                </div>
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

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Username</p>
                    <p className="ek-mobile-field-value">{account.username || '-'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Role</p>
                    <p className="ek-mobile-field-value">{account.role === 'Ketua_RT' ? 'Ketua RT' : 'Bendahara'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Telepon</p>
                    <p className="ek-mobile-field-value">{account.no_telepon || '-'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Verifikasi</p>
                    <p className="ek-mobile-field-value">{account.email_verified_at || 'Belum verifikasi'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Disetujui</p>
                    <p className="ek-mobile-field-value">{account.approved_at || '-'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Dibuat</p>
                    <p className="ek-mobile-field-value">{account.created_at || '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                    type="button"
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold ${
                        account.is_active
                            ? 'border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] text-[rgb(var(--ek-danger))]'
                            : 'border border-[rgba(0,106,97,0.16)] bg-[rgba(0,106,97,0.08)] text-[rgb(var(--ek-accent))]'
                    }`}
                    onClick={onToggleActive}
                >
                    {account.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button type="button" className="ek-btn-secondary w-full justify-center" onClick={onEdit}>
                    Edit
                </button>
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-4 py-3 text-sm font-semibold text-[rgb(var(--ek-danger))]"
                    onClick={onDelete}
                >
                    Hapus
                </button>
            </div>
        </article>
    );
}
