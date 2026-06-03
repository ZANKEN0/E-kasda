import ConfirmActionModal from '@/Components/ConfirmActionModal';
import EkasdaIcon from '@/Components/EkasdaIcon';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChangeEventHandler, FormEventHandler, useMemo, useState } from 'react';

type StatCard = {
    label: string;
    value: string;
    note: string;
    noteTone: string;
    icon: 'users' | 'check' | 'notification' | 'map';
    iconTone: string;
};

type Resident = {
    id_warga: number;
    nama: string;
    no_rumah: string | null;
    no_telepon: string | null;
    status_hunian: 'Tetap' | 'Kontrak';
    status_iuran: 'Lunas' | 'Belum Lunas' | 'Belum Ada Tagihan';
};

type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type Filters = {
    search: string;
    blok: string;
    status_iuran: string;
};

type ResidentForm = {
    nama: string;
    no_rumah: string;
    no_telepon: string;
    status_hunian: 'Tetap' | 'Kontrak';
};

type ImportResidentRow = {
    nama: string;
    no_rumah: string;
    no_telepon: string;
    status_hunian: 'Tetap' | 'Kontrak' | '';
    row_number: number;
    errors: string[];
};

type ImportResidentForm = {
    rows: ResidentForm[];
};

function paginationNumbers(currentPage: number, lastPage: number): Array<number | string> {
    if (lastPage <= 5) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, '...', lastPage];
    }

    if (currentPage >= lastPage - 2) {
        return [1, '...', lastPage - 2, lastPage - 1, lastPage];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
}

function statusBadgeClass(status: Resident['status_iuran']): string {
    if (status === 'Lunas') {
        return 'ek-badge-success';
    }

    if (status === 'Belum Lunas') {
        return 'ek-badge-danger';
    }

    return 'ek-badge-info';
}

function normalizeImportHeader(header: string): string {
    return header
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .replace(/[\s.-]+/g, '_');
}

function normalizeHunianStatus(value: string): 'Tetap' | 'Kontrak' | '' {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'tetap') {
        return 'Tetap';
    }

    if (normalized === 'kontrak') {
        return 'Kontrak';
    }

    return '';
}

function detectDelimiter(csvText: string): ',' | ';' | '\t' {
    const firstLine = csvText
        .split(/\r?\n/)
        .find((line) => line.trim() !== '') ?? '';

    const candidates: Array<',' | ';' | '\t'> = [',', ';', '\t'];

    return candidates.reduce(
        (best, current) =>
            firstLine.split(current).length > firstLine.split(best).length ? current : best,
        ',',
    );
}

function parseCsvRows(csvText: string): string[][] {
    const delimiter = detectDelimiter(csvText);
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let index = 0; index < csvText.length; index += 1) {
        const char = csvText[index];
        const nextChar = csvText[index + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }

            continue;
        }

        if (!inQuotes && char === delimiter) {
            currentRow.push(currentField.trim());
            currentField = '';
            continue;
        }

        if (!inQuotes && (char === '\n' || char === '\r')) {
            if (char === '\r' && nextChar === '\n') {
                index += 1;
            }

            currentRow.push(currentField.trim());
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
            continue;
        }

        currentField += char;
    }

    if (currentField !== '' || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }

    return rows.filter((row) => row.some((cell) => cell.trim() !== ''));
}

function findImportHeaderRowIndex(
    rows: string[][],
    requiredHeaders: string[],
): number {
    return rows.findIndex((row) => {
        const normalizedRow = row.map((cell) => normalizeImportHeader(cell));

        return requiredHeaders.every((header) => normalizedRow.includes(header));
    });
}

export default function DataWarga({
    stats,
    residents,
    pagination,
    filters,
    blokOptions,
}: {
    stats: StatCard[];
    residents: Resident[];
    pagination: Pagination;
    filters: Filters;
    blokOptions: string[];
}) {
    const { flash, auth } = usePage<PageProps>().props;
    const canManageResidents = auth.user?.role === 'Ketua_RT';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingResident, setEditingResident] = useState<Resident | null>(null);
    const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);
    const [selectedImportFileName, setSelectedImportFileName] = useState('');
    const [importRowsPreview, setImportRowsPreview] = useState<ImportResidentRow[]>([]);
    const [importErrorMessages, setImportErrorMessages] = useState<string[]>([]);

    const residentForm = useForm<ResidentForm>({
        nama: '',
        no_rumah: '',
        no_telepon: '',
        status_hunian: 'Tetap',
    });
    const importForm = useForm<ImportResidentForm>({
        rows: [],
    });

    const filterForm = useForm<Filters>({
        search: filters.search ?? '',
        blok: filters.blok ?? '',
        status_iuran: filters.status_iuran ?? '',
    });

    const pages = useMemo(
        () => paginationNumbers(pagination.current_page, pagination.last_page),
        [pagination.current_page, pagination.last_page],
    );
    const exportUrl = route('data-warga.export', {
        search: filters.search || undefined,
        blok: filters.blok || undefined,
        status_iuran: filters.status_iuran || undefined,
    });
    const templateUrl = route('data-warga.template');

    const openCreateModal = () => {
        if (!canManageResidents) {
            return;
        }

        setEditingResident(null);
        residentForm.reset();
        residentForm.clearErrors();
        residentForm.setData({
            nama: '',
            no_rumah: '',
            no_telepon: '',
            status_hunian: 'Tetap',
        });
        setIsModalOpen(true);
    };

    const openImportModal = () => {
        if (!canManageResidents) {
            return;
        }

        setIsImportModalOpen(true);
        setSelectedImportFileName('');
        setImportRowsPreview([]);
        setImportErrorMessages([]);
        importForm.reset();
        importForm.clearErrors();
    };

    const openEditModal = (resident: Resident) => {
        if (!canManageResidents) {
            return;
        }

        setEditingResident(resident);
        residentForm.clearErrors();
        residentForm.setData({
            nama: resident.nama,
            no_rumah: resident.no_rumah ?? '',
            no_telepon: resident.no_telepon ?? '',
            status_hunian: resident.status_hunian,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingResident(null);
        residentForm.clearErrors();
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setSelectedImportFileName('');
        setImportRowsPreview([]);
        setImportErrorMessages([]);
        importForm.reset();
        importForm.clearErrors();
    };

    const submitResident: FormEventHandler = (event) => {
        event.preventDefault();

        if (!canManageResidents) {
            return;
        }

        if (editingResident) {
            residentForm.put(route('data-warga.update', editingResident.id_warga), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });

            return;
        }

        residentForm.post(route('data-warga.store'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const applyFilters: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(
            route('data-warga'),
            {
                search: filterForm.data.search || undefined,
                blok: filterForm.data.blok || undefined,
                status_iuran: filterForm.data.status_iuran || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        filterForm.setData({
            search: '',
            blok: '',
            status_iuran: '',
        });

        router.get(route('data-warga'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const goToPage = (page: number) => {
        router.get(
            route('data-warga'),
            {
                ...filters,
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const deleteResident = (resident: Resident) => {
        if (!canManageResidents) {
            return;
        }

        setResidentToDelete(resident);
    };

    const closeDeleteConfirmation = () => {
        setResidentToDelete(null);
    };

    const confirmDeleteResident = () => {
        if (!residentToDelete) {
            return;
        }

        router.delete(route('data-warga.destroy', residentToDelete.id_warga), {
            onSuccess: () => setResidentToDelete(null),
            preserveScroll: true,
        });
    };

    const handleImportFileChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
        const file = event.target.files?.[0];

        setImportErrorMessages([]);
        setImportRowsPreview([]);
        importForm.setData('rows', []);

        if (!file) {
            setSelectedImportFileName('');
            return;
        }

        setSelectedImportFileName(file.name);

        const csvText = await file.text();
        const parsedRows = parseCsvRows(csvText);

        if (parsedRows.length === 0) {
            setImportErrorMessages(['File CSV kosong atau tidak bisa dibaca.']);
            return;
        }

        const requiredHeaders = ['nama', 'no_rumah', 'no_telepon', 'status_hunian'];
        const headerRowIndex = findImportHeaderRowIndex(parsedRows, requiredHeaders);

        if (headerRowIndex === -1) {
            setImportErrorMessages([
                `Header CSV belum sesuai template. Header yang wajib: ${requiredHeaders.join(', ')}.`,
            ]);
            return;
        }

        const headerRow = parsedRows[headerRowIndex];
        const dataRows = parsedRows.slice(headerRowIndex + 1);
        const headerMap = headerRow.map((header) => normalizeImportHeader(header));
        const missingHeaders = requiredHeaders.filter((header) => !headerMap.includes(header));

        if (missingHeaders.length > 0) {
            setImportErrorMessages([
                `Header CSV belum sesuai template. Header yang wajib: ${requiredHeaders.join(', ')}.`,
            ]);
            return;
        }

        if (dataRows.length === 0) {
            setImportErrorMessages(['Belum ada baris data warga di dalam file CSV.']);
            return;
        }

        if (dataRows.length > 500) {
            setImportErrorMessages(['Jumlah data impor maksimal 500 baris per proses.']);
            return;
        }

        const importedRows = dataRows.map((row, index) => {
            const resident: ImportResidentRow = {
                row_number: headerRowIndex + index + 2,
                nama: row[headerMap.indexOf('nama')]?.trim() ?? '',
                no_rumah: row[headerMap.indexOf('no_rumah')]?.trim() ?? '',
                no_telepon: row[headerMap.indexOf('no_telepon')]?.trim() ?? '',
                status_hunian: normalizeHunianStatus(row[headerMap.indexOf('status_hunian')] ?? ''),
                errors: [],
            };

            if (resident.nama === '') {
                resident.errors.push('Nama wajib diisi.');
            }

            if (resident.no_rumah === '') {
                resident.errors.push('Nomor rumah wajib diisi.');
            }

            if (resident.status_hunian === '') {
                resident.errors.push('Status hunian harus Tetap atau Kontrak.');
            }

            if (resident.no_telepon.length > 20) {
                resident.errors.push('Nomor telepon maksimal 20 karakter.');
            }

            return resident;
        });

        const rowErrors = importedRows
            .filter((row) => row.errors.length > 0)
            .map((row) => `Baris ${row.row_number}: ${row.errors.join(' ')}`);

        setImportRowsPreview(importedRows);
        setImportErrorMessages(rowErrors);

        if (rowErrors.length === 0) {
            importForm.setData(
                'rows',
                importedRows.map(({ row_number, errors, ...row }) => ({
                    ...row,
                    status_hunian: row.status_hunian as 'Tetap' | 'Kontrak',
                })),
            );
        }
    };

    const submitImportResidents = () => {
        if (importErrorMessages.length > 0 || importForm.data.rows.length === 0) {
            return;
        }

        importForm.post(route('data-warga.import'), {
            preserveScroll: true,
            onSuccess: () => closeImportModal(),
        });
    };

    return (
        <AuthenticatedLayout
            title="Manajemen Data Warga"
            description="Kelola informasi kependudukan dan status iuran warga secara real-time."
            actions={
                <>
                    {canManageResidents ? (
                        <a
                            href={templateUrl}
                            className="ek-btn-secondary w-full justify-center px-5 sm:w-auto sm:min-w-[156px]"
                        >
                            <EkasdaIcon name="download" className="h-4 w-4" />
                            Unduh Template
                        </a>
                    ) : null}
                    <a
                        href={exportUrl}
                        className="ek-btn-secondary w-full justify-center px-5 sm:w-auto sm:min-w-[126px]"
                    >
                        <EkasdaIcon name="download" className="h-4 w-4" />
                        Unduh CSV
                    </a>
                    {canManageResidents ? (
                        <button
                            type="button"
                            className="ek-btn-secondary w-full justify-center px-5 sm:w-auto sm:min-w-[140px]"
                            onClick={openImportModal}
                        >
                            <EkasdaIcon name="document" className="h-4 w-4" />
                            Import CSV
                        </button>
                    ) : null}
                    {canManageResidents ? (
                        <button
                            type="button"
                            className="ek-btn-primary w-full justify-center px-5 sm:w-auto sm:min-w-[150px]"
                            onClick={openCreateModal}
                        >
                            <EkasdaIcon name="plus" className="h-4 w-4" />
                            Tambah Warga
                        </button>
                    ) : null}
                </>
            }
        >
            <Head title="Data Warga" />

            {flash.success ? (
                <div className="mb-6 rounded-2xl border border-[rgba(0,150,104,0.18)] bg-[rgb(var(--ek-success-bg))] px-5 py-4 text-sm font-semibold text-[rgb(var(--ek-success))]">
                    {flash.success}
                </div>
            ) : null}

            {flash.error ? (
                <div className="mb-6 rounded-2xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-5 py-4 text-sm font-semibold text-[rgb(var(--ek-danger))]">
                    {flash.error}
                </div>
            ) : null}

            {!canManageResidents ? (
                <div className="mb-6 rounded-2xl border border-[rgba(0,106,97,0.2)] bg-[rgba(134,242,228,0.18)] px-5 py-4 text-sm text-[rgb(var(--ek-text-muted))]">
                    Akun <strong>Bendahara</strong> hanya dapat melihat data warga. Penambahan, perubahan, dan penghapusan warga khusus untuk <strong>Ketua RT</strong>.
                </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((card) => (
                    <section key={card.label} className="ek-stat-card">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-[rgb(var(--ek-text-muted))]">
                                    {card.label}
                                </p>
                                <p className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-[rgb(var(--ek-primary))]">
                                    {card.value}
                                </p>
                                <p className={`mt-2 text-sm ${card.noteTone}`}>{card.note}</p>
                            </div>
                            <div className={`rounded-full p-2.5 ${card.iconTone}`}>
                                <EkasdaIcon name={card.icon} className="h-6 w-6" />
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            <section className="mt-6 ek-card overflow-hidden">
                <form
                    onSubmit={applyFilters}
                    className="flex flex-col gap-4 border-b border-[rgb(var(--ek-border))] px-6 py-5"
                >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative max-w-none flex-1 sm:max-w-[450px]">
                            <EkasdaIcon
                                name="search"
                                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--ek-text-muted))]"
                            />
                            <input
                                type="text"
                                className="ek-input pl-12"
                                placeholder="Cari warga (nama, rumah, telepon)..."
                                value={filterForm.data.search}
                                onChange={(event) => filterForm.setData('search', event.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-[rgb(var(--ek-text-muted))]">
                            <label className="font-semibold text-[rgb(var(--ek-primary))]">Blok:</label>
                            <select
                                className="ek-input h-10 w-full py-0 sm:w-[180px]"
                                value={filterForm.data.blok}
                                onChange={(event) => filterForm.setData('blok', event.target.value)}
                            >
                                <option value="">Semua Blok</option>
                                {blokOptions.map((blok) => (
                                    <option key={blok} value={blok}>
                                        {blok}
                                    </option>
                                ))}
                            </select>
                            <label className="font-semibold text-[rgb(var(--ek-primary))]">
                                Status Iuran:
                            </label>
                            <select
                                className="ek-input h-10 w-full py-0 sm:w-[180px]"
                                value={filterForm.data.status_iuran}
                                onChange={(event) =>
                                    filterForm.setData('status_iuran', event.target.value)
                                }
                            >
                                <option value="">Semua Status</option>
                                <option value="Lunas">Lunas</option>
                                <option value="Belum Lunas">Belum Lunas</option>
                                <option value="Belum Ada Tagihan">Belum Ada Tagihan</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="ek-btn-secondary w-full sm:w-auto"
                            onClick={resetFilters}
                        >
                            Reset Filter
                        </button>
                        <button type="submit" className="ek-btn-primary w-full sm:w-auto">
                            Terapkan Filter
                        </button>
                    </div>
                </form>

                <div className="space-y-4 md:hidden">
                    {residents.length > 0 ? (
                        residents.map((resident) => (
                            <article key={resident.id_warga} className="ek-mobile-card">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-base font-bold text-[rgb(var(--ek-primary))]">
                                            {resident.nama}
                                        </p>
                                        <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                            {resident.no_rumah || 'Rumah belum diisi'}
                                        </p>
                                    </div>
                                    <span className={statusBadgeClass(resident.status_iuran)}>
                                        {resident.status_iuran}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3">
                                    <div className="ek-mobile-field">
                                        <p className="ek-mobile-field-label">Status Hunian</p>
                                        <p className="ek-mobile-field-value">{resident.status_hunian}</p>
                                    </div>
                                    <div className="ek-mobile-field">
                                        <p className="ek-mobile-field-label">Nomor Telepon</p>
                                        <p className="ek-mobile-field-value">
                                            {resident.no_telepon || '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-2">
                                    {canManageResidents ? (
                                        <>
                                            <button
                                                type="button"
                                                className="ek-btn-secondary w-full justify-center"
                                                onClick={() => openEditModal(resident)}
                                            >
                                                Edit Data
                                            </button>
                                            <button
                                                type="button"
                                                className="ek-btn-secondary w-full justify-center"
                                                onClick={() => deleteResident(resident)}
                                            >
                                                Hapus Data
                                            </button>
                                        </>
                                    ) : (
                                        <div className="rounded-xl bg-[rgb(var(--ek-surface-soft))] px-4 py-3 text-sm text-[rgb(var(--ek-text-muted))]">
                                            Akses lihat saja untuk akun Bendahara.
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[rgb(var(--ek-border))] px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                            Belum ada data warga yang sesuai dengan filter saat ini.
                        </div>
                    )}
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left">
                        <thead className="ek-table-header">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Rumah</th>
                                <th className="px-6 py-4">Status Iuran</th>
                                <th className="px-6 py-4">No. HP</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {residents.length > 0 ? (
                                residents.map((resident) => (
                                    <tr key={resident.id_warga} className="ek-table-row">
                                        <td className="px-6 py-5 font-semibold text-[rgb(var(--ek-primary))]">
                                            <div>
                                                <p>{resident.nama}</p>
                                                <p className="mt-1 text-xs font-medium text-[rgb(var(--ek-text-muted))]">
                                                    Hunian {resident.status_hunian}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[rgb(var(--ek-text-muted))]">
                                            {resident.no_rumah || '-'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={statusBadgeClass(resident.status_iuran)}>
                                                {resident.status_iuran}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-[rgb(var(--ek-text-muted))]">
                                            {resident.no_telepon || '-'}
                                        </td>
                                        <td className="px-6 py-5">
                                            {canManageResidents ? (
                                                <div className="flex justify-end gap-3 text-[rgb(var(--ek-text-muted))]">
                                                    <button
                                                        type="button"
                                                        className="ek-btn-ghost h-9 w-9 rounded-full hover:bg-[rgb(var(--ek-surface-soft))]"
                                                        onClick={() => openEditModal(resident)}
                                                    >
                                                        <EkasdaIcon name="edit" className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="ek-btn-ghost h-9 w-9 rounded-full hover:bg-[rgb(var(--ek-surface-soft))]"
                                                        onClick={() => deleteResident(resident)}
                                                    >
                                                        <EkasdaIcon name="trash" className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="ek-btn-ghost h-9 w-9 rounded-full hover:bg-[rgb(var(--ek-surface-soft))]"
                                                        onClick={() => openEditModal(resident)}
                                                    >
                                                        <EkasdaIcon name="document" className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-right text-xs font-semibold text-[rgb(var(--ek-text-muted))]">
                                                    Akses lihat
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-sm text-[rgb(var(--ek-text-muted))]"
                                    >
                                        Belum ada data warga yang sesuai dengan filter saat ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[rgb(var(--ek-border))] px-4 py-4 text-sm text-[rgb(var(--ek-text-muted))] sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                    <p>
                        Menampilkan {pagination.from ?? 0} - {pagination.to ?? 0} dari{' '}
                        {pagination.total} warga
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--ek-border))] text-[rgb(var(--ek-text-muted))] disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => goToPage(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                        >
                            {'<'}
                        </button>
                        {pages.map((page, index) =>
                            typeof page === 'string' ? (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-1 text-[rgb(var(--ek-text-muted))]"
                                >
                                    {page}
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    type="button"
                                    className={
                                        page === pagination.current_page
                                            ? 'flex h-8 min-w-8 items-center justify-center rounded-lg bg-[rgb(var(--ek-accent))] px-3 text-sm font-bold text-white'
                                            : 'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold text-[rgb(var(--ek-primary))]'
                                    }
                                    onClick={() => goToPage(page)}
                                >
                                    {page}
                                </button>
                            ),
                        )}
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--ek-border))] text-[rgb(var(--ek-text-muted))] disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => goToPage(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                        >
                            {'>'}
                        </button>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[rgba(0,106,97,0.2)] bg-[rgba(134,242,228,0.18)] px-6 py-5">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--ek-accent))] text-white">
                        <EkasdaIcon name="info" className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-[rgb(var(--ek-primary))]">
                            Tips Manajemen Data
                        </p>
                        <p className="mt-1 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                            Gunakan format rumah seperti <strong>Blok A / No. 12</strong> agar filter blok dan rekap warga lebih konsisten. Data warga yang sudah memiliki tagihan tidak dapat dihapus langsung untuk menjaga integritas riwayat pembayaran.
                        </p>
                    </div>
                </div>
            </section>

            {isImportModalOpen ? (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(15,23,42,0.45)] px-4 py-4 sm:px-6 sm:py-6">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] sm:max-h-[calc(100vh-3rem)]">
                            <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--ek-border))] px-6 py-5">
                                <div>
                                    <h3 className="text-xl font-bold text-[rgb(var(--ek-primary))]">
                                        Import Data Warga dari CSV
                                    </h3>
                                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                        Siapkan data di Excel, lalu simpan sebagai CSV UTF-8. Sistem akan menampilkan preview sebelum data diimpor.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="ek-btn-ghost h-10 w-10 rounded-full hover:bg-[rgb(var(--ek-surface-soft))]"
                                    onClick={closeImportModal}
                                    aria-label="Tutup import warga"
                                >
                                    X
                                </button>
                            </div>

                            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-[rgb(var(--ek-surface-soft))] px-5 py-4 text-sm leading-7 text-[rgb(var(--ek-text-muted))]">
                                    Gunakan header CSV berikut: <strong>nama</strong>, <strong>no_rumah</strong>, <strong>no_telepon</strong>, <strong>status_hunian</strong>.
                                    Nilai <strong>status_hunian</strong> hanya boleh <strong>Tetap</strong> atau <strong>Kontrak</strong>.
                                </div>

                                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                            File CSV
                                        </label>
                                        <input
                                            type="file"
                                            accept=".csv,text/csv"
                                            className="ek-input"
                                            onChange={handleImportFileChange}
                                        />
                                        <p className="mt-2 text-sm text-[rgb(var(--ek-text-muted))]">
                                            {selectedImportFileName
                                                ? `File dipilih: ${selectedImportFileName}`
                                                : 'Belum ada file yang dipilih.'}
                                        </p>
                                        {importForm.errors.rows ? (
                                            <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">
                                                {importForm.errors.rows}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="rounded-2xl border border-[rgb(var(--ek-border))] bg-white px-5 py-4">
                                        <p className="text-sm font-bold text-[rgb(var(--ek-primary))]">
                                            Ringkasan Preview
                                        </p>
                                        <div className="mt-4 space-y-2 text-sm text-[rgb(var(--ek-text-muted))]">
                                            <p>Total baris terbaca: <strong>{importRowsPreview.length}</strong></p>
                                            <p>Baris siap impor: <strong>{importForm.data.rows.length}</strong></p>
                                            <p>Error ditemukan: <strong>{importErrorMessages.length}</strong></p>
                                        </div>
                                    </div>
                                </div>

                                {importErrorMessages.length > 0 ? (
                                    <div className="rounded-2xl border border-[rgba(186,26,26,0.18)] bg-[rgb(var(--ek-danger-bg))] px-5 py-4">
                                        <p className="text-sm font-bold text-[rgb(var(--ek-danger))]">
                                            Perbaiki data CSV terlebih dahulu
                                        </p>
                                        <ul className="mt-3 space-y-2 text-sm text-[rgb(var(--ek-danger))]">
                                            {importErrorMessages.slice(0, 8).map((errorMessage) => (
                                                <li key={errorMessage}>{errorMessage}</li>
                                            ))}
                                        </ul>
                                        {importErrorMessages.length > 8 ? (
                                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--ek-danger))]">
                                                Dan {importErrorMessages.length - 8} error lainnya
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}

                                <div className="overflow-hidden rounded-2xl border border-[rgb(var(--ek-border))]">
                                    <div className="border-b border-[rgb(var(--ek-border))] px-5 py-4">
                                        <p className="text-sm font-bold text-[rgb(var(--ek-primary))]">
                                            Preview Data
                                        </p>
                                    </div>
                                    <div className="max-h-[320px] overflow-auto">
                                        <table className="min-w-full text-left">
                                            <thead className="ek-table-header">
                                                <tr>
                                                    <th className="px-4 py-3">Baris</th>
                                                    <th className="px-4 py-3">Nama</th>
                                                    <th className="px-4 py-3">No Rumah</th>
                                                    <th className="px-4 py-3">No Telepon</th>
                                                    <th className="px-4 py-3">Status Hunian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importRowsPreview.length > 0 ? (
                                                    importRowsPreview.slice(0, 10).map((row) => (
                                                        <tr key={`${row.row_number}-${row.nama}-${row.no_rumah}`} className="ek-table-row">
                                                            <td className="px-4 py-3 text-sm text-[rgb(var(--ek-text-muted))]">
                                                                {row.row_number}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                                                {row.nama || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-[rgb(var(--ek-text-muted))]">
                                                                {row.no_rumah || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-[rgb(var(--ek-text-muted))]">
                                                                {row.no_telepon || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-[rgb(var(--ek-text-muted))]">
                                                                {row.status_hunian || '-'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-[rgb(var(--ek-text-muted))]">
                                                            Upload file CSV untuk melihat preview data warga.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {importRowsPreview.length > 10 ? (
                                        <div className="border-t border-[rgb(var(--ek-border))] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--ek-text-muted))]">
                                            Menampilkan 10 baris pertama dari {importRowsPreview.length} baris
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-[rgb(var(--ek-border))] px-6 py-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    className="ek-btn-secondary justify-center"
                                    onClick={closeImportModal}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    className="ek-btn-primary justify-center"
                                    disabled={importForm.processing || importForm.data.rows.length === 0 || importErrorMessages.length > 0}
                                    onClick={submitImportResidents}
                                >
                                    Import Data Warga
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <ConfirmActionModal
                show={residentToDelete !== null}
                title="Hapus data warga"
                description={
                    residentToDelete
                        ? `Data warga ${residentToDelete.nama} akan dihapus. Riwayat tagihan yang sudah terkait tetap dilindungi oleh sistem.`
                        : 'Data warga yang dipilih akan dihapus dari sistem.'
                }
                confirmLabel="Ya, hapus"
                confirmTone="danger"
                onClose={closeDeleteConfirmation}
                onConfirm={confirmDeleteResident}
            />

            {isModalOpen ? (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(15,23,42,0.45)] px-4 py-4 sm:px-6 sm:py-6">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] sm:max-h-[calc(100vh-3rem)]">
                            <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--ek-border))] px-6 py-5">
                                <div>
                                    <h3 className="text-xl font-bold text-[rgb(var(--ek-primary))]">
                                        {editingResident ? 'Edit Data Warga' : 'Tambah Warga Baru'}
                                    </h3>
                                    <p className="mt-1 text-sm text-[rgb(var(--ek-text-muted))]">
                                        Simpan informasi warga untuk digunakan pada modul tagihan dan pembayaran.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="ek-btn-ghost h-10 w-10 rounded-full hover:bg-[rgb(var(--ek-surface-soft))]"
                                    onClick={closeModal}
                                    aria-label="Tutup formulir"
                                >
                                    X
                                </button>
                            </div>

                            <form onSubmit={submitResident} className="flex min-h-0 flex-1 flex-col">
                                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                    <div>
                                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    className="ek-input"
                                    value={residentForm.data.nama}
                                    onChange={(event) => residentForm.setData('nama', event.target.value)}
                                    placeholder="Masukkan nama warga"
                                />
                                {residentForm.errors.nama ? (
                                    <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">
                                        {residentForm.errors.nama}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        Rumah / Blok
                                    </label>
                                    <input
                                        type="text"
                                        className="ek-input"
                                        value={residentForm.data.no_rumah}
                                        onChange={(event) => residentForm.setData('no_rumah', event.target.value)}
                                        placeholder="Blok A / No. 12"
                                    />
                                    {residentForm.errors.no_rumah ? (
                                        <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">
                                            {residentForm.errors.no_rumah}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                        No. Telepon
                                    </label>
                                    <input
                                        type="text"
                                        className="ek-input"
                                        value={residentForm.data.no_telepon}
                                        onChange={(event) => residentForm.setData('no_telepon', event.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                    {residentForm.errors.no_telepon ? (
                                        <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">
                                            {residentForm.errors.no_telepon}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[rgb(var(--ek-primary))]">
                                            Status Hunian
                                        </label>
                                        <select
                                            className="ek-input"
                                            value={residentForm.data.status_hunian}
                                            onChange={(event) =>
                                                residentForm.setData(
                                                    'status_hunian',
                                                    event.target.value as 'Tetap' | 'Kontrak',
                                                )
                                            }
                                        >
                                            <option value="Tetap">Tetap</option>
                                            <option value="Kontrak">Kontrak</option>
                                        </select>
                                        {residentForm.errors.status_hunian ? (
                                            <p className="mt-2 text-sm text-[rgb(var(--ek-danger))]">
                                                {residentForm.errors.status_hunian}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="border-t border-[rgb(var(--ek-border))] bg-white px-6 py-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            className="ek-btn-secondary w-full sm:w-auto"
                                            onClick={closeModal}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="ek-btn-primary w-full sm:w-auto"
                                            disabled={residentForm.processing}
                                        >
                                            {editingResident ? 'Simpan Perubahan' : 'Tambah Warga'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : null}
        </AuthenticatedLayout>
    );
}
