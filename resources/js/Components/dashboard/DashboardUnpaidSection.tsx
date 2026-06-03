type UnpaidRow = {
    nama_warga: string;
    blok: string;
    jenis_iuran: string;
    nominal: string;
};

type DashboardUnpaidSectionProps = {
    rows: UnpaidRow[];
};

export default function DashboardUnpaidSection({ rows }: DashboardUnpaidSectionProps) {
    return (
        <section className="ek-card overflow-hidden">
            <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4 sm:px-6">
                <h3 className="text-lg font-semibold text-[rgb(var(--ek-primary))] sm:text-[20px]">
                    Tunggakan Warga
                </h3>
                <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                    Warga dengan tagihan aktif yang perlu ditindaklanjuti.
                </p>
            </div>

            <div className="space-y-3 p-4 md:hidden">
                {rows.length > 0 ? (
                    rows.map((row) => (
                        <article
                            key={`${row.nama_warga}-${row.blok}-${row.jenis_iuran}`}
                            className="ek-mobile-card space-y-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-base font-bold text-[rgb(var(--ek-primary))]">
                                        {row.nama_warga}
                                    </p>
                                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                        Blok {row.blok}
                                    </p>
                                </div>
                                <span className="ek-badge-danger">Belum Lunas</span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="ek-mobile-field">
                                    <p className="ek-mobile-field-label">Jenis Iuran</p>
                                    <p className="ek-mobile-field-value">{row.jenis_iuran}</p>
                                </div>
                                <div className="ek-mobile-field">
                                    <p className="ek-mobile-field-label">Nominal</p>
                                    <p className="ek-mobile-field-value">{row.nominal}</p>
                                </div>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] bg-white px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                        Belum ada tunggakan warga yang perlu ditindaklanjuti.
                    </div>
                )}
            </div>

            <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left">
                    <thead className="ek-table-header">
                        <tr>
                            <th className="px-6 py-3">Nama Warga</th>
                            <th className="px-6 py-3">Blok</th>
                            <th className="px-6 py-3">Jenis Iuran</th>
                            <th className="px-6 py-3 text-right">Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => (
                                <tr key={`${row.nama_warga}-${row.blok}-${row.jenis_iuran}`} className="ek-table-row">
                                    <td className="px-6 py-4 font-semibold text-[rgb(var(--ek-primary))]">
                                        {row.nama_warga}
                                    </td>
                                    <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                        {row.blok}
                                    </td>
                                    <td className="px-6 py-4 text-[rgb(var(--ek-text-muted))]">
                                        {row.jenis_iuran}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold">{row.nominal}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                    Belum ada tunggakan warga yang perlu ditindaklanjuti.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
