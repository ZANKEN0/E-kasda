export interface User {
    id?: number;
    id_user: number;
    username: string;
    nama_lengkap: string;
    name: string;
    email: string;
    no_telepon?: string | null;
    email_verified_at?: string | null;
    role?: string;
    is_approved?: boolean;
    approved_at?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    globalSearch?: {
        query?: string | null;
    };
};
