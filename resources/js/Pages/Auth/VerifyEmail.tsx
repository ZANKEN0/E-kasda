import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

type VerifyEmailProps = {
    status?: string;
    email?: string;
    cooldownSeconds?: number;
};

function formatCooldown(seconds: number): string {
    if (seconds <= 0) {
        return '0 detik';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes <= 0) {
        return `${remainingSeconds} detik`;
    }

    if (remainingSeconds === 0) {
        return `${minutes} menit`;
    }

    return `${minutes} menit ${remainingSeconds} detik`;
}

export default function VerifyEmail({ status, email, cooldownSeconds = 0 }: VerifyEmailProps) {
    const { post, processing } = useForm({});
    const [remainingSeconds, setRemainingSeconds] = useState(cooldownSeconds);

    useEffect(() => {
        setRemainingSeconds(cooldownSeconds);
    }, [cooldownSeconds]);

    useEffect(() => {
        if (remainingSeconds <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setRemainingSeconds((current) => Math.max(current - 1, 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [remainingSeconds]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (remainingSeconds > 0) {
            return;
        }

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="mb-4 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                Akun Anda berhasil dibuat. Sebelum masuk ke sistem, silakan
                verifikasi alamat email dengan membuka tautan yang baru saja
                kami kirimkan. Jika email belum masuk, Anda bisa meminta kirim
                ulang dari halaman ini.
            </div>

            {status === 'verification-link-sent-initial' && (
                <div className="mb-4 rounded-2xl border border-[rgba(0,150,104,0.18)] bg-[rgb(var(--ek-success-bg))] px-4 py-3 text-sm font-semibold text-[rgb(var(--ek-success))]">
                    Email verifikasi berhasil dikirim
                    {email ? ` ke ${email}` : ''}. Silakan cek inbox atau
                    folder spam Anda.
                </div>
            )}

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-2xl border border-[rgba(0,150,104,0.18)] bg-[rgb(var(--ek-success-bg))] px-4 py-3 text-sm font-semibold text-[rgb(var(--ek-success))]">
                    Tautan verifikasi baru berhasil dikirim
                    {email ? ` ke ${email}` : ''}. Silakan cek inbox atau
                    folder spam Anda.
                </div>
            )}

            {status === 'verification-link-throttled' && (
                <div className="mb-4 rounded-2xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-4 py-3 text-sm font-semibold text-[rgb(var(--ek-danger))]">
                    Permintaan kirim ulang terlalu cepat. Tunggu {formatCooldown(remainingSeconds)} sebelum mencoba lagi.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <PrimaryButton disabled={processing || remainingSeconds > 0}>
                            {remainingSeconds > 0
                                ? `Kirim Ulang Dalam ${formatCooldown(remainingSeconds)}`
                                : 'Kirim Ulang Email Verifikasi'}
                        </PrimaryButton>
                        <p className="mt-2 text-sm text-[rgb(var(--ek-text-muted))]">
                            Cooldown anti-spam memakai jeda bertahap model Fibonacci, dimulai dari 30 detik.
                        </p>
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-[rgb(var(--ek-text-muted))] underline hover:text-[rgb(var(--ek-primary))] focus:outline-none"
                    >
                        Keluar
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
