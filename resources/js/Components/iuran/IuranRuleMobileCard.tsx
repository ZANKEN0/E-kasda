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

type IuranRuleMobileCardProps = {
    rule: BillingRule;
    canManage: boolean;
    onEdit: (rule: BillingRule) => void;
    onToggle: (rule: BillingRule) => void;
    onDelete: (rule: BillingRule) => void;
};

export default function IuranRuleMobileCard({
    rule,
    canManage,
    onEdit,
    onToggle,
    onDelete,
}: IuranRuleMobileCardProps) {
    return (
        <article className="ek-mobile-card space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-base font-bold text-[rgb(var(--ek-primary))]">{rule.nama_iuran}</p>
                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                        Dipakai di {rule.total_tagihan} tagihan
                    </p>
                </div>
                <span className={rule.is_active ? 'ek-badge-success' : 'ek-badge-info'}>
                    {rule.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Nominal</p>
                    <p className="ek-mobile-field-value">{rule.nominal_default_formatted}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Jadwal</p>
                    <p className="ek-mobile-field-value">{rule.jadwal}</p>
                </div>
            </div>

            <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] px-3 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[rgb(var(--ek-text-muted))]">
                    Keterangan
                </p>
                <p className="mt-1 text-sm leading-6 text-[rgb(var(--ek-primary))]">{rule.keterangan}</p>
            </div>

            {canManage ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button type="button" className="ek-btn-secondary w-full px-4 py-2.5 text-xs" onClick={() => onEdit(rule)}>
                        Edit
                    </button>
                    <button type="button" className="ek-btn-secondary w-full px-4 py-2.5 text-xs" onClick={() => onToggle(rule)}>
                        {rule.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button type="button" className="ek-btn-secondary w-full px-4 py-2.5 text-xs" onClick={() => onDelete(rule)}>
                        Hapus
                    </button>
                </div>
            ) : (
                <p className="text-sm font-semibold text-[rgb(var(--ek-text-muted))]">Akses lihat</p>
            )}
        </article>
    );
}
