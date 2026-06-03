type ApprovalAccount = {
    id_user: number;
    name: string;
    username?: string;
    email: string;
    no_telepon?: string | null;
    created_at?: string | null;
    email_verified_at?: string | null;
};

type PendingAccountMobileCardProps = {
    account: ApprovalAccount;
    selectedRole: 'Ketua_RT' | 'Bendahara';
    onRoleChange: (role: 'Ketua_RT' | 'Bendahara') => void;
    onApprove: () => void;
    onReject: () => void;
};

export default function PendingAccountMobileCard({
    account,
    selectedRole,
    onRoleChange,
    onApprove,
    onReject,
}: PendingAccountMobileCardProps) {
    return (
        <article className="ek-mobile-card space-y-4">
            <div>
                <p className="text-base font-bold text-[rgb(var(--ek-primary))]">{account.name}</p>
                <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">{account.email}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Username</p>
                    <p className="ek-mobile-field-value">{account.username || '-'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Telepon</p>
                    <p className="ek-mobile-field-value">{account.no_telepon || '-'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Daftar</p>
                    <p className="ek-mobile-field-value">{account.created_at || '-'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Verifikasi</p>
                    <p className="ek-mobile-field-value">{account.email_verified_at || '-'}</p>
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                    Role Final Saat Disetujui
                </label>
                <select
                    className="ek-input"
                    value={selectedRole}
                    onChange={(event) => onRoleChange(event.target.value as 'Ketua_RT' | 'Bendahara')}
                >
                    <option value="Bendahara">Bendahara</option>
                    <option value="Ketua_RT">Ketua RT</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" className="ek-btn-secondary w-full justify-center" onClick={onReject}>
                    Tolak
                </button>
                <button type="button" className="ek-btn-primary w-full justify-center" onClick={onApprove}>
                    Setujui
                </button>
            </div>
        </article>
    );
}
