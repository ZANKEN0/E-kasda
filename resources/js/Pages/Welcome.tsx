import ApplicationLogo from '@/Components/ApplicationLogo';
import EkasdaIcon from '@/Components/EkasdaIcon';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

const features = [
    {
        title: 'Data Warga',
        description: 'Kelola informasi warga dan status hunian dengan lebih rapi.',
        icon: 'users' as const,
    },
    {
        title: 'Tagihan Warga',
        description: 'Pantau status iuran dan tunggakan per periode.',
        icon: 'receipt' as const,
    },
    {
        title: 'Pembayaran Iuran',
        description: 'Catat pembayaran dengan cepat dan akurat.',
        icon: 'wallet' as const,
    },
    {
        title: 'Laporan Keuangan',
        description: 'Lihat ringkasan pemasukan, pengeluaran, dan saldo kas RT.',
        icon: 'report' as const,
    },
];

const values = [
    { label: 'Tertib', icon: 'document' as const },
    { label: 'Transparan', icon: 'check' as const },
    { label: 'Mudah Dipantau', icon: 'chart' as const },
    { label: 'Siap untuk Pelaporan', icon: 'shield' as const },
];

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Beranda" />

            <div className="min-h-screen bg-[rgb(var(--ek-background))]">
                <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
                    <header className="ek-card flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <ApplicationLogo className="h-11 w-11" />
                            <div>
                                <h1 className="text-lg font-bold text-[rgb(var(--ek-primary))]">
                                    E-KASDA
                                </h1>
                                <p className="text-sm text-[rgb(var(--ek-text-muted))]">
                                    Sistem Administrasi Kas RT
                                </p>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-8 text-sm font-semibold text-[rgb(var(--ek-text-muted))] lg:flex">
                            <a href="#fitur" className="hover:text-[rgb(var(--ek-primary))]">
                                Fitur
                            </a>
                            <a href="#tentang" className="hover:text-[rgb(var(--ek-primary))]">
                                Tentang Kami
                            </a>
                            <a href="#bantuan" className="hover:text-[rgb(var(--ek-primary))]">
                                Bantuan
                            </a>
                        </nav>

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="ek-btn-primary w-full justify-center sm:w-auto">
                                    Masuk ke Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="ek-btn-secondary w-full justify-center sm:w-auto">
                                        Masuk
                                    </Link>
                                    <Link href={route('register')} className="ek-btn-primary w-full justify-center sm:w-auto">
                                        Daftar Akun
                                    </Link>
                                </>
                            )}
                        </div>
                    </header>

                    <main className="flex flex-1 flex-col justify-center py-14 lg:py-20">
                        <section className="mx-auto max-w-[920px] text-center">
                            <h2 className="text-4xl font-bold tracking-[-0.02em] text-[rgb(var(--ek-primary))] md:text-[56px] md:leading-[64px]">
                                Kelola Kas RT Lebih Rapi dan Transparan
                            </h2>
                            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[rgb(var(--ek-text-muted))] md:text-lg">
                                E-KASDA membantu pengurus RT mengelola data warga, iuran,
                                transaksi kas, dan laporan keuangan dalam satu sistem yang
                                terstruktur dan mudah dipantau.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Link href={route('login')} className="ek-btn-primary px-6">
                                    Masuk ke Sistem
                                </Link>
                                <Link href={route('register')} className="ek-btn-secondary px-6">
                                    Daftar Akun
                                </Link>
                            </div>

                            <p className="mt-4 text-sm text-[rgb(var(--ek-text-muted))]">
                                Untuk pengurus RT yang membutuhkan akses sistem.
                            </p>
                        </section>

                        <section
                            id="fitur"
                            className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
                        >
                            {features.map((feature) => (
                                <article key={feature.title} className="ek-card p-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--ek-surface-soft))] text-[rgb(var(--ek-accent))]">
                                        <EkasdaIcon name={feature.icon} className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-[rgb(var(--ek-primary))]">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                                        {feature.description}
                                    </p>
                                </article>
                            ))}
                        </section>

                        <section
                            id="tentang"
                            className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                        >
                            {values.map((value) => (
                                <div
                                    key={value.label}
                                    className="ek-card flex items-center gap-4 px-5 py-4"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(19,27,46,0.08)] text-[rgb(var(--ek-primary))]">
                                        <EkasdaIcon name={value.icon} className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-bold text-[rgb(var(--ek-primary))]">
                                        {value.label}
                                    </span>
                                </div>
                            ))}
                        </section>
                    </main>

                    <footer
                        id="bantuan"
                        className="mt-6 rounded-2xl bg-[rgb(var(--ek-primary))] px-6 py-5 text-white"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <p className="max-w-3xl text-sm leading-7 text-white/72">
                                Portal resmi administrasi kas RT untuk pengelolaan yang lebih
                                tertib, efisien, dan mudah dipahami.
                            </p>
                            <div className="flex gap-5 text-sm font-semibold text-white/78">
                                <a href="#fitur" className="hover:text-white">
                                    Fitur
                                </a>
                                <a href="#tentang" className="hover:text-white">
                                    Tentang Kami
                                </a>
                                <a href="#bantuan" className="hover:text-white">
                                    Bantuan
                                </a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}

