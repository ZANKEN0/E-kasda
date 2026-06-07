type ReportYearStepperProps = {
    label: string;
    maxYear: number;
    minYear: number;
    onChange: (value: string) => void;
    value: string;
};

export default function ReportYearStepper({
    label,
    maxYear,
    minYear,
    onChange,
    value,
}: ReportYearStepperProps) {
    const numericValue = Number.parseInt(value, 10);
    const safeValue = Number.isFinite(numericValue) ? numericValue : maxYear;

    const setYear = (nextYear: number) => {
        const boundedYear = Math.min(maxYear, Math.max(minYear, nextYear));
        onChange(String(boundedYear));
    };

    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                {label}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--ek-border))] bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(var(--ek-border))] text-xl font-bold text-[rgb(var(--ek-primary))] disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => setYear(safeValue - 1)}
                    disabled={safeValue <= minYear}
                >
                    -
                </button>
                <div className="flex-1 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--ek-text-muted))]">
                        Tahun
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                        {safeValue}
                    </p>
                </div>
                <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(var(--ek-border))] text-xl font-bold text-[rgb(var(--ek-primary))] disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => setYear(safeValue + 1)}
                    disabled={safeValue >= maxYear}
                >
                    +
                </button>
            </div>
        </div>
    );
}
