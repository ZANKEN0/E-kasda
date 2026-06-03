import InputError from '@/Components/InputError';
import EkasdaIcon from '@/Components/EkasdaIcon';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Kata Sandi" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pr-11"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--ek-text-muted))] transition hover:text-[rgb(var(--ek-primary))]"
                            onClick={() => setShowPassword((current) => ! current)}
                            aria-label={showPassword ? 'Sembunyikan kata sandi baru' : 'Tampilkan kata sandi baru'}
                        >
                            <EkasdaIcon
                                name={showPassword ? 'eyeOff' : 'eye'}
                                className="h-5 w-5"
                            />
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pr-11"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
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

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Simpan Kata Sandi Baru
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
