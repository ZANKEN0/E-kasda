import EkasdaIcon from '@/Components/EkasdaIcon';
import Modal from '@/Components/Modal';

type ConfirmActionModalProps = {
    show: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmTone?: 'primary' | 'danger';
    processing?: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ConfirmActionModal({
    show,
    title,
    description,
    confirmLabel = 'Lanjutkan',
    cancelLabel = 'Batal',
    confirmTone = 'primary',
    processing = false,
    onClose,
    onConfirm,
}: ConfirmActionModalProps) {
    const confirmClassName =
        confirmTone === 'danger'
            ? 'inline-flex items-center justify-center rounded-xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-5 py-3 text-sm font-semibold text-[rgb(var(--ek-danger))] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60'
            : 'ek-btn-primary';

    return (
        <Modal show={show} maxWidth="md" closeable={!processing} onClose={onClose}>
            <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--ek-surface-soft))] text-[rgb(var(--ek-accent))]">
                        <EkasdaIcon
                            name={confirmTone === 'danger' ? 'notification' : 'info'}
                            className="h-5 w-5"
                        />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-[rgb(var(--ek-primary))]">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        className="ek-btn-secondary w-full justify-center sm:w-auto"
                        onClick={onClose}
                        disabled={processing}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={`${confirmClassName} w-full justify-center sm:w-auto`}
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
