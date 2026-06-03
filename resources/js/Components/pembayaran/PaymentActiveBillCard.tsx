type ActiveBill = {
    id_tagihan: number;
    nama_warga: string;
    no_rumah: string | null;
    nama_iuran: string;
    periode: string;
    nominal_formatted: string;
    status_bayar: 'Belum Lunas';
};

type PaymentActiveBillCardProps = {
    bill: ActiveBill;
    paymentScope: 'resident' | 'batch';
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export default function PaymentActiveBillCard({
    bill,
    paymentScope,
    checked,
    onChange,
}: PaymentActiveBillCardProps) {
    return (
        <label className="ek-mobile-card flex items-start gap-3">
            <input
                type="checkbox"
                className="mt-1 rounded border-[rgb(var(--ek-border))] text-[rgb(var(--ek-accent))]"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        {paymentScope === 'batch' ? (
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[rgb(var(--ek-text-muted))]">
                                {bill.nama_warga}
                                {bill.no_rumah ? ` - ${bill.no_rumah}` : ''}
                            </p>
                        ) : null}
                        <p className="mt-1 text-base font-bold text-[rgb(var(--ek-primary))]">
                            {bill.nama_iuran}
                        </p>
                    </div>
                    <span className="ek-badge-danger">{bill.status_bayar}</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="ek-mobile-field">
                        <p className="ek-mobile-field-label">Periode</p>
                        <p className="ek-mobile-field-value">{bill.periode}</p>
                    </div>
                    <div className="ek-mobile-field">
                        <p className="ek-mobile-field-label">Nominal</p>
                        <p className="ek-mobile-field-value">{bill.nominal_formatted}</p>
                    </div>
                </div>
            </div>
        </label>
    );
}
