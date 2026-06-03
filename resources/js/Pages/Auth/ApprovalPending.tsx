import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router } from '@inertiajs/react';

type ApprovalPendingProps = {
    userInfo: {
        name?: string | null;
        email?: string | null;
        role?: string | null;
        email_verified_at?: string | null;
    };
};

export default function ApprovalPending({ userInfo }: ApprovalPendingProps) {
    const roleLabel = userInfo.role === 'Bendahara' ? 'Bendahara' : 'Ketua RT';

    return (
        <GuestLayout>
            <Head title="Menunggu Persetujuan Akun" />

            <div className="space-y-5">
                <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--ek-primary))]">
                        Akun Menunggu Persetujuan
                    </h1>
                    <p className="mt-2 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                        Email Anda sudah terverifikasi, tetapi akun belum bisa
                        mengakses modul utama sampai disetujui oleh Ketua RT.
                    </p>
                </div>

                <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-5 py-5 text-sm text-[rgb(var(--ek-text-muted))]">
                    <p>
                        <strong className="text-[rgb(var(--ek-primary))]">Nama:</strong>{' '}
                        {userInfo.name || '-'}
                    </p>
                    <p className="mt-2">
                        <strong className="text-[rgb(var(--ek-primary))]">Email:</strong>{' '}
                        {userInfo.email || '-'}
                    </p>
                    <p className="mt-2">
                        <strong className="text-[rgb(var(--ek-primary))]">Peran yang diminta:</strong>{' '}
                        {roleLabel}
                    </p>
                    <p className="mt-2">
                        <strong className="text-[rgb(var(--ek-primary))]">Verifikasi email:</strong>{' '}
                        {userInfo.email_verified_at || 'Sudah diverifikasi'}
                    </p>
                </div>

                <div className="rounded-2xl border border-[rgba(0,106,97,0.2)] bg-[rgba(134,242,228,0.18)] px-5 py-4 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                    Setelah disetujui, Anda bisa login ulang atau tekan tombol
                    cek status di bawah ini untuk mencoba masuk kembali.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        className="ek-btn-secondary w-full justify-center sm:w-auto"
                        onClick={() => router.visit(route('dashboard'))}
                    >
                        Cek Status
                    </button>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="ek-btn-primary w-full justify-center sm:w-auto"
                    >
                        Keluar
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
