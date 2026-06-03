import InputError from '@/Components/InputError';
import EkasdaIcon from '@/Components/EkasdaIcon';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Ubah Kata Sandi
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Gunakan kata sandi yang kuat dan tidak mudah ditebak agar
                    akun Anda tetap aman.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Kata Sandi Saat Ini"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="block w-full pr-11"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                            onClick={() =>
                                setShowCurrentPassword((current) => ! current)
                            }
                            aria-label={
                                showCurrentPassword
                                    ? 'Sembunyikan kata sandi saat ini'
                                    : 'Tampilkan kata sandi saat ini'
                            }
                        >
                            <EkasdaIcon
                                name={showCurrentPassword ? 'eyeOff' : 'eye'}
                                className="h-5 w-5"
                            />
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showPassword ? 'text' : 'password'}
                            className="block w-full pr-11"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                            onClick={() => setShowPassword((current) => ! current)}
                            aria-label={
                                showPassword
                                    ? 'Sembunyikan kata sandi baru'
                                    : 'Tampilkan kata sandi baru'
                            }
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
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            className="block w-full pr-11"
                            autoComplete="new-password"
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
                                    showPasswordConfirmation ? 'eyeOff' : 'eye'
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
