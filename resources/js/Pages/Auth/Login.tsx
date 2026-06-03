import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import EkasdaIcon from '@/Components/EkasdaIcon';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk" />

            <div className="min-h-screen bg-[rgb(var(--ek-background))] px-4 py-10">
                <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col items-center justify-center">
                    <div className="mb-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--ek-primary))] text-white shadow-[0_12px_30px_-18px_rgba(19,27,46,0.8)]">
                            <EkasdaIcon name="office" className="h-8 w-8" />
                        </div>
                        <h1 className="mt-5 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                            E-KASDA
                        </h1>
                        <p className="mt-2 text-base text-[rgb(var(--ek-text-muted))]">
                            Sistem Administrasi Kas RT
                        </p>
                    </div>

                    <div className="w-full max-w-[450px] rounded-3xl border border-[rgb(var(--ek-border))] bg-white px-8 py-8 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.35)]">
                        {status ? (
                            <div className="mb-5 rounded-2xl bg-[rgb(var(--ek-success-bg))] px-4 py-3 text-sm font-semibold text-[rgb(var(--ek-success))]">
                                {status}
                            </div>
                        ) : null}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="login"
                                    className="mb-2 block text-[12px] font-extrabold uppercase tracking-[0.14em] text-[rgb(var(--ek-primary))]"
                                >
                                    Email atau Username
                                </label>
                                <div className="relative">
                                    <EkasdaIcon
                                        name="user"
                                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--ek-text-muted))]"
                                    />
                                    <TextInput
                                        id="login"
                                        type="text"
                                        name="login"
                                        value={data.login}
                                        className="block w-full pl-11"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('login', e.target.value)}
                                        placeholder="Masukkan email atau username"
                                    />
                                </div>
                                <InputError message={errors.login} className="mt-2" />
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <label
                                        htmlFor="password"
                                        className="block text-[12px] font-extrabold uppercase tracking-[0.14em] text-[rgb(var(--ek-primary))]"
                                    >
                                        Kata Sandi
                                    </label>
                                    {canResetPassword ? (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-semibold text-[rgb(var(--ek-accent))]"
                                        >
                                            Lupa Kata Sandi?
                                        </Link>
                                    ) : null}
                                </div>
                                <div className="relative">
                                    <EkasdaIcon
                                        name="lock"
                                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--ek-text-muted))]"
                                    />
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block w-full pl-11 pr-11"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan kata sandi"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                                        onClick={() => setShowPassword((current) => ! current)}
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    >
                                        <EkasdaIcon
                                            name={showPassword ? 'eyeOff' : 'eye'}
                                            className="h-5 w-5"
                                        />
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <PrimaryButton
                                className="h-[58px] w-full justify-center rounded-xl text-[16px]"
                                disabled={processing}
                            >
                                Masuk
                                <span aria-hidden="true" className="text-lg leading-none">
                                    {'->'}
                                </span>
                            </PrimaryButton>
                        </form>

                        <div className="my-8 border-t border-[rgb(var(--ek-border))]" />

                        <div className="text-center">
                            <p className="text-sm text-[rgb(var(--ek-text-muted))]">
                                Butuh bantuan akses?
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-2 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                <EkasdaIcon name="headset" className="h-4 w-4" />
                                Pengurus RT
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-[rgb(var(--ek-text-muted))]">
                        Sistem terenkripsi &amp; aman
                    </p>
                </div>
            </div>
        </>
    );
}
