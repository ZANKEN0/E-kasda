type TransactionRow = {
    tanggal: string;
    jenis: string;
    keterangan: string;
    nominal: string;
};

type DashboardTransactionSectionProps = {
    rows: TransactionRow[];
};

export default function DashboardTransactionSection({
    rows,
}: DashboardTransactionSectionProps) {
    return (
        <section className="ek-card overflow-hidden">
            <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                <h3 className="text-lg font-semibold text-[rgb(var(--ek-primary))] sm:text-[20px]">
                    Aktivitas Transaksi
                </h3>
                <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                    Ringkasan transaksi kas terbaru yang masuk ke sistem.
                </p>
            </div>

            <div className="space-y-3 p-4 md:hidden">
                {rows.length > 0 ? (
                    rows.map((row) => (
                        <article
                            key={`${row.tanggal}-${row.keterangan}-${row.nominal}`}
                            className="ek-mobile-card space-y-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        {row.keterangan}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[rgb(var(--ek-text-muted))]">
                                        {row.tanggal}
                                    </p>
                                </div>
                                <span className={row.jenis === 'Kas Masuk' ? 'ek-badge-success' : 'ek-badge-danger'}>
                                    {row.jenis}
                                </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="ek-mobile-field">
                                    <p className="ek-mobile-field-label">Nominal</p>
                                    <p className="ek-mobile-field-value">{row.nominal}</p>
                                </div>
                                <div className="ek-mobile-field">
                                    <p className="ek-mobile-field-label">Jenis</p>
                                    <p className="ek-mobile-field-value">{row.jenis}</p>
                                </div>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] bg-white px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                        Belum ada transaksi terbaru di sistem.
                    </div>
                )}
            </div>

            <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left">
                    <thead className="ek-table-header">
                        <tr>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Jenis</th>
                            <th className="px-6 py-3">Keterangan</th>
                            <th className="px-6 py-3 text-right">Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => (
                                <tr key={`${row.tanggal}-${row.keterangan}-${row.nominal}`} className="ek-table-row">
                                    <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                        {row.tanggal}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={
                                                row.jenis === 'Kas Masuk'
                                                    ? 'ek-badge-success'
                                                    : 'ek-badge-danger'
                                            }
                                        >
                                            {row.jenis}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[rgb(var(--ek-primary))]">
                                        {row.keterangan}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold">{row.nominal}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                    Belum ada transaksi terbaru di sistem.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
