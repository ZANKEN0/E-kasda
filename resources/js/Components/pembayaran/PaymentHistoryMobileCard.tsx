type PaymentHistory = {
    tanggal_bayar: string | null;
    nama_warga?: string;
    nama_iuran: string;
    periode: string;
    jumlah_bayar: string;
    status: string;
};

type PaymentHistoryMobileCardProps = {
    row: PaymentHistory;
    paymentScope: 'resident' | 'batch';
};

export default function PaymentHistoryMobileCard({
    row,
    paymentScope,
}: PaymentHistoryMobileCardProps) {
    return (
        <article className="ek-mobile-card space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-base font-bold text-[rgb(var(--ek-primary))]">{row.nama_iuran}</p>
                    {paymentScope === 'batch' && row.nama_warga ? (
                        <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">{row.nama_warga}</p>
                    ) : null}
                </div>
                <span className="ek-badge-success">{row.status}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Tanggal</p>
                    <p className="ek-mobile-field-value">{row.tanggal_bayar || '-'}</p>
                </div>
                <div className="ek-mobile-field">
                    <p className="ek-mobile-field-label">Periode</p>
                    <p className="ek-mobile-field-value">{row.periode}</p>
                </div>
                <div className="ek-mobile-field sm:col-span-2">
                    <p className="ek-mobile-field-label">Nominal</p>
                    <p className="ek-mobile-field-value">{row.jumlah_bayar}</p>
                </div>
            </div>
        </article>
    );
}
