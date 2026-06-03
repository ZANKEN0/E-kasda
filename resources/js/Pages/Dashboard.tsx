import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DashboardQuickActions from '@/Components/dashboard/DashboardQuickActions';
import DashboardSummaryCard from '@/Components/dashboard/DashboardSummaryCard';
import DashboardTransactionSection from '@/Components/dashboard/DashboardTransactionSection';
import DashboardUnpaidSection from '@/Components/dashboard/DashboardUnpaidSection';
import { Head, Link } from '@inertiajs/react';

type DashboardProps = {
    summaryCards: Array<{
        title: string;
        value: string;
        note: string;
    }>;
    alertRows: string[];
    unpaidRows: Array<{
        nama_warga: string;
        blok: string;
        jenis_iuran: string;
        nominal: string;
    }>;
    transactionRows: Array<{
        tanggal: string;
        jenis: string;
        keterangan: string;
        nominal: string;
    }>;
};

export default function Dashboard({ summaryCards, alertRows, unpaidRows, transactionRows }: DashboardProps) {
    return (
        <AuthenticatedLayout
            title="Ringkasan Dashboard"
            description="Pantau posisi kas, aktivitas pembayaran warga, dan status operasional RT 01 / RW 06 Ciledug."
        >
            <Head title="Dashboard" />

            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_1fr]">
                {summaryCards.map((card, index) => (
                    <div
                        key={card.title}
                        className={index === 0 ? 'md:col-span-2 xl:col-span-1' : ''}
                    >
                        <DashboardSummaryCard
                            title={card.title}
                            value={card.value}
                            note={card.note}
                            featured={index === 0}
                        />
                    </div>
                ))}
            </div>

            <section className="mt-6 rounded-xl border border-[rgb(var(--ek-danger-bg))] bg-[rgb(var(--ek-danger-bg))] px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-bold text-[rgb(var(--ek-danger))]">
                            Tagihan Belum Lunas
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-[rgb(var(--ek-danger))]">
                            {alertRows.map((row) => (
                                <p key={row}>{row}</p>
                            ))}
                        </div>
                    </div>
                    <Link href={route('tagihan-warga')} className="ek-btn-secondary w-full border-[rgb(var(--ek-danger))] text-[rgb(var(--ek-danger))] sm:w-auto">
                        Lihat Tagihan
                    </Link>
                </div>
            </section>

            <DashboardQuickActions />

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <DashboardUnpaidSection rows={unpaidRows} />
                <DashboardTransactionSection rows={transactionRows} />
            </div>
        </AuthenticatedLayout>
    );
}
