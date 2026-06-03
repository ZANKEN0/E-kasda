import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import EkasdaIcon from '@/Components/EkasdaIcon';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Daftar Akun" />

            <div className="min-h-screen bg-[rgb(var(--ek-background))] p-2 sm:p-4">
                <div className="mx-auto max-w-[820px] rounded-[28px] border border-[rgb(var(--ek-border))] bg-white px-6 py-8 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.35)] sm:px-10">
                    <div className="mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--ek-accent-soft))] text-[rgb(var(--ek-accent))]">
                            <EkasdaIcon name="office" className="h-6 w-6" />
                        </div>
                        <h1 className="mt-5 text-[32px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                            Daftar Akun E-KASDA
                        </h1>
                        <p className="mt-2 text-lg text-[rgb(var(--ek-text-muted))]">
                            Lengkapi data berikut untuk membuat akun akses sistem.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-3 block text-sm font-medium text-[rgb(var(--ek-primary))]"
                            >
                                Nama Lengkap
                            </label>
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="block w-full"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-3 block text-sm font-medium text-[rgb(var(--ek-primary))]"
                                >
                                    Username
                                </label>
                                <TextInput
                                    id="username"
                                    name="username"
                                    value={data.username}
                                    className="block w-full"
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Masukkan username"
                                />
                                <InputError message={errors.username} className="mt-2" />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-3 block text-sm font-medium text-[rgb(var(--ek-primary))]"
                                >
                                    Email
                                </label>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full"
                                    autoComplete="email"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-3 block text-sm font-medium text-[rgb(var(--ek-primary))]"
                                >
                                    Kata Sandi
                                </label>
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block w-full pr-11"
                                        autoComplete="new-password"
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

                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="mb-3 block text-sm font-medium text-[rgb(var(--ek-primary))]"
                                >
                                    Konfirmasi Kata Sandi
                                </label>
                                <div className="relative">
                                    <TextInput
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="block w-full pr-11"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        placeholder="Ulangi password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                                        onClick={() =>
                                            setShowPasswordConfirmation(
                                                (current) => ! current,
                                            )
                                        }
                                        aria-label={
                                            showPasswordConfirmation
                                                ? 'Sembunyikan konfirmasi kata sandi'
                                                : 'Tampilkan konfirmasi kata sandi'
                                        }
                                    >
                                        <EkasdaIcon
                                            name={
                                                showPasswordConfirmation
                                                    ? 'eyeOff'
                                                    : 'eye'
                                            }
                                            className="h-5 w-5"
                                        />
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-background))] px-4 py-4 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                            <div className="flex items-start gap-3">
                                <EkasdaIcon
                                    name="info"
                                    className="mt-0.5 h-5 w-5 shrink-0 text-[rgb(var(--ek-accent))]"
                                />
                                <p>
                                    Pendaftaran ditujukan untuk pengurus RT yang membutuhkan
                                    akses sistem. Peran akun akan ditentukan saat proses
                                    persetujuan oleh Ketua RT setelah email Anda diverifikasi.
                                </p>
                            </div>
                        </div>

                        <PrimaryButton
                            className="h-[48px] w-full justify-center rounded-xl"
                            disabled={processing}
                        >
                            Daftar Akun
                        </PrimaryButton>
                    </form>

                    <p className="mt-6 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                        Sudah punya akun?{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-[rgb(var(--ek-accent))]"
                        >
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
