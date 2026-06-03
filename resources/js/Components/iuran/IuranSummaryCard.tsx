type IuranSummaryCardProps = {
    title: string;
    value: string;
    note: string;
    featured?: boolean;
};

export default function IuranSummaryCard({
    title,
    value,
    note,
    featured = false,
}: IuranSummaryCardProps) {
    return (
        <section
            className={`rounded-xl border shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] ${
                featured
                    ? 'border-[rgb(var(--ek-primary))] bg-[rgb(var(--ek-primary))] p-5 text-white sm:p-5'
                    : 'border-[rgb(var(--ek-border))] bg-white p-4 text-[rgb(var(--ek-text))] sm:p-5'
            }`}
        >
            <p
                className={`text-[11px] font-bold uppercase tracking-[0.16em] sm:text-xs ${
                    featured ? 'text-white/70' : 'text-[rgb(var(--ek-text-muted))]'
                }`}
            >
                {title}
            </p>
            <p className={`mt-3 font-extrabold tracking-[-0.03em] ${featured ? 'text-[30px]' : 'text-[24px] sm:text-[28px]'}`}>
                {value}
            </p>
            <p
                className={`mt-2 text-sm leading-6 ${
                    featured ? 'text-white/75' : 'text-[rgb(var(--ek-text-muted))]'
                }`}
            >
                {note}
            </p>
        </section>
    );
}
