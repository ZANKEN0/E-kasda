import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
            no_telepon: user?.no_telepon ?? '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Informasi Profil
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Perbarui nama lengkap, email, dan nomor telepon akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-4 py-4">
                    <p className="text-sm font-semibold text-[rgb(var(--ek-primary))]">
                        Status Verifikasi Akun
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span
                            className={
                                user?.email_verified_at
                                    ? 'inline-flex rounded-full bg-[rgb(var(--ek-success-bg))] px-3 py-1 text-xs font-bold text-[rgb(var(--ek-success))]'
                                    : 'inline-flex rounded-full bg-[rgb(var(--ek-danger-bg))] px-3 py-1 text-xs font-bold text-[rgb(var(--ek-danger))]'
                            }
                        >
                            {user?.email_verified_at
                                ? 'Akun telah terverifikasi'
                                : 'Akun belum terverifikasi'}
                        </span>
                        {user?.email_verified_at ? (
                            <span className="text-sm text-[rgb(var(--ek-text-muted))]">
                                Email akun Anda sudah terverifikasi dan siap dipakai untuk akses sistem.
                            </span>
                        ) : (
                            <span className="text-sm text-[rgb(var(--ek-text-muted))]">
                                Silakan verifikasi email agar akses akun tetap aman dan pemulihan kata sandi berjalan lancar.
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="no_telepon" value="Nomor Telepon" />

                    <TextInput
                        id="no_telepon"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.no_telepon}
                        onChange={(e) => setData('no_telepon', e.target.value)}
                        autoComplete="tel"
                        placeholder="Contoh: 081234567890"
                    />

                    <InputError className="mt-2" message={errors.no_telepon} />
                </div>

                {mustVerifyEmail && user?.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Email Anda belum diverifikasi.
                            {' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Link verifikasi baru sudah dikirim ke email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
