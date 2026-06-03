<?php

namespace Tests\Feature;

use App\Models\IuranWajib;
use App\Models\Kategori;
use App\Models\PembayaranIuran;
use App\Models\TagihanWarga;
use App\Models\TransaksiKas;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BackendWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_cleanup_unverified_only_deletes_unapproved_accounts(): void
    {
        $ketua = $this->createKetuaRt();

        $approvedButUnverified = User::factory()->create([
            'role' => 'Bendahara',
            'email_verified_at' => null,
            'is_approved' => true,
            'is_active' => true,
            'approved_at' => now()->subDay(),
            'created_at' => now()->subDays(5),
        ]);

        $pendingUnverified = User::factory()->create([
            'role' => 'Bendahara',
            'email_verified_at' => null,
            'is_approved' => false,
            'is_active' => true,
            'approved_at' => null,
            'created_at' => now()->subDays(5),
        ]);

        $this->actingAs($ketua)
            ->post(route('approval.cleanup-unverified'))
            ->assertRedirect(route('approval.index'));

        $this->assertDatabaseHas('users', [
            'id_user' => $approvedButUnverified->getKey(),
        ]);

        $this->assertDatabaseMissing('users', [
            'id_user' => $pendingUnverified->getKey(),
        ]);
    }

    public function test_ketua_rt_can_deactivate_and_reactivate_account(): void
    {
        $ketua = $this->createKetuaRt();
        $bendahara = $this->createBendahara();

        $this->actingAs($ketua)
            ->patch(route('approval.toggle-active', $bendahara))
            ->assertRedirect(route('approval.index'));

        $this->assertDatabaseHas('users', [
            'id_user' => $bendahara->getKey(),
            'is_active' => false,
        ]);

        $this->actingAs($ketua)
            ->patch(route('approval.toggle-active', $bendahara))
            ->assertRedirect(route('approval.index'));

        $this->assertDatabaseHas('users', [
            'id_user' => $bendahara->getKey(),
            'is_active' => true,
        ]);
    }

    public function test_nonactive_account_cannot_login(): void
    {
        $user = User::factory()->create([
            'username' => 'bendahara_nonaktif',
            'email' => 'bendahara-nonaktif@example.com',
            'password' => Hash::make('password123'),
            'role' => 'Bendahara',
            'email_verified_at' => now(),
            'is_approved' => true,
            'is_active' => false,
            'approved_at' => now(),
        ]);

        $this->post(route('login'), [
            'login' => $user->email,
            'password' => 'password123',
        ])
            ->assertSessionHasErrors([
                'login' => 'Akun Anda sedang dinonaktifkan. Hubungi Ketua RT untuk mengaktifkannya kembali.',
            ]);

        $this->assertGuest();
    }

    public function test_import_warga_skips_existing_and_in_file_duplicates(): void
    {
        $ketua = $this->createKetuaRt();

        Warga::create([
            'nama' => 'Budi Santoso',
            'no_rumah' => 'Blok A / No. 12',
            'no_telepon' => '081111111111',
            'status_hunian' => 'Tetap',
        ]);

        $rows = [
            [
                'nama' => 'Budi Santoso',
                'no_rumah' => 'Blok A / No. 12',
                'no_telepon' => '081111111111',
                'status_hunian' => 'Tetap',
            ],
            [
                'nama' => 'Siti Rahma',
                'no_rumah' => 'Blok B / No. 03',
                'no_telepon' => '082222222222',
                'status_hunian' => 'Kontrak',
            ],
            [
                'nama' => 'Siti   Rahma',
                'no_rumah' => 'Blok B / No. 03',
                'no_telepon' => '082222222223',
                'status_hunian' => 'Kontrak',
            ],
            [
                'nama' => 'Andi Wijaya',
                'no_rumah' => 'Blok C / No. 05',
                'no_telepon' => '',
                'status_hunian' => 'Tetap',
            ],
        ];

        $this->actingAs($ketua)
            ->post(route('data-warga.import'), [
                'rows' => $rows,
            ])
            ->assertRedirect(route('data-warga'));

        $this->assertDatabaseCount('warga', 3);
        $this->assertDatabaseHas('warga', [
            'nama' => 'Siti Rahma',
            'no_rumah' => 'Blok B / No. 03',
        ]);
        $this->assertDatabaseHas('warga', [
            'nama' => 'Andi Wijaya',
            'no_rumah' => 'Blok C / No. 05',
        ]);
    }

    public function test_bulk_tagihan_for_all_warga_is_safe_to_repeat(): void
    {
        $ketua = $this->createKetuaRt();
        $iuran = $this->createIuran();
        $this->createWarga('Budi', 'Blok A / No. 01');
        $this->createWarga('Siti', 'Blok A / No. 02');

        $payload = [
            'target_scope' => 'all',
            'id_iuran_wajib' => $iuran->getKey(),
            'bulan' => 5,
            'tahun' => 2026,
            'nominal' => '50000',
            'tanggal_jatuh_tempo' => '2026-05-31',
            'catatan' => '',
        ];

        $this->actingAs($ketua)
            ->post(route('tagihan-warga.store'), $payload)
            ->assertRedirect(route('tagihan-warga'));

        $this->assertDatabaseCount('tagihan_warga', 2);

        $this->actingAs($ketua)
            ->post(route('tagihan-warga.store'), $payload)
            ->assertRedirect(route('tagihan-warga'));

        $this->assertDatabaseCount('tagihan_warga', 2);
    }

    public function test_batch_payment_rejects_tagihan_outside_selected_period(): void
    {
        $bendahara = $this->createBendahara();
        $iuran = $this->createIuran();
        $wargaA = $this->createWarga('Budi', 'Blok A / No. 01');
        $wargaB = $this->createWarga('Siti', 'Blok A / No. 02');

        $tagihanMei = TagihanWarga::create([
            'id_warga' => $wargaA->getKey(),
            'id_iuran_wajib' => $iuran->getKey(),
            'bulan' => 5,
            'tahun' => 2026,
            'status_bayar' => 'Belum Lunas',
            'nominal' => 50000,
            'tanggal_jatuh_tempo' => '2026-05-31',
        ]);

        $tagihanJuni = TagihanWarga::create([
            'id_warga' => $wargaB->getKey(),
            'id_iuran_wajib' => $iuran->getKey(),
            'bulan' => 6,
            'tahun' => 2026,
            'status_bayar' => 'Belum Lunas',
            'nominal' => 50000,
            'tanggal_jatuh_tempo' => '2026-06-30',
        ]);

        $this->actingAs($bendahara)
            ->post(route('pembayaran-iuran.store'), [
                'payment_scope' => 'batch',
                'bulan' => 5,
                'tahun' => 2026,
                'id_iuran_wajib' => $iuran->getKey(),
                'tagihan_ids' => [$tagihanMei->getKey(), $tagihanJuni->getKey()],
                'metode_bayar' => 'Tunai',
                'tanggal_bayar' => '2026-05-20',
                'jumlah_bayar' => '100000',
                'catatan' => '',
            ])
            ->assertRedirect(route('pembayaran-iuran', [
                'scope' => 'batch',
                'bulan' => 5,
                'tahun' => 2026,
                'id_iuran_wajib' => $iuran->getKey(),
            ]))
            ->assertSessionHas('error', 'Semua tagihan yang dibayar massal harus sesuai dengan bulan dan tahun filter yang dipilih.');

        $this->assertDatabaseCount('pembayaran_iuran', 0);
        $this->assertDatabaseCount('transaksi_kas', 0);
        $this->assertDatabaseHas('tagihan_warga', [
            'id_tagihan' => $tagihanMei->getKey(),
            'status_bayar' => 'Belum Lunas',
        ]);
        $this->assertDatabaseHas('tagihan_warga', [
            'id_tagihan' => $tagihanJuni->getKey(),
            'status_bayar' => 'Belum Lunas',
        ]);
    }

    public function test_resident_payment_creates_payment_and_cash_transaction(): void
    {
        $bendahara = $this->createBendahara();
        $iuran = $this->createIuran();
        $warga = $this->createWarga('Budi', 'Blok A / No. 01');

        $tagihan = TagihanWarga::create([
            'id_warga' => $warga->getKey(),
            'id_iuran_wajib' => $iuran->getKey(),
            'bulan' => 5,
            'tahun' => 2026,
            'status_bayar' => 'Belum Lunas',
            'nominal' => 50000,
            'tanggal_jatuh_tempo' => '2026-05-31',
        ]);

        $this->actingAs($bendahara)
            ->post(route('pembayaran-iuran.store'), [
                'payment_scope' => 'resident',
                'id_warga' => $warga->getKey(),
                'tagihan_ids' => [$tagihan->getKey()],
                'metode_bayar' => 'Tunai',
                'tanggal_bayar' => '2026-05-20',
                'jumlah_bayar' => '50000',
                'catatan' => 'Lunas tepat waktu',
            ])
            ->assertRedirect(route('pembayaran-iuran', [
                'scope' => 'resident',
                'id_warga' => $warga->getKey(),
            ]));

        $this->assertDatabaseHas('pembayaran_iuran', [
            'id_tagihan' => $tagihan->getKey(),
            'id_user' => $bendahara->getKey(),
            'metode_bayar' => 'Tunai',
        ]);

        $this->assertDatabaseHas('tagihan_warga', [
            'id_tagihan' => $tagihan->getKey(),
            'status_bayar' => 'Lunas',
        ]);

        $this->assertDatabaseHas('transaksi_kas', [
            'id_tagihan' => $tagihan->getKey(),
            'id_user' => $bendahara->getKey(),
            'jenis_transaksi' => 'Masuk',
            'jumlah' => 50000,
        ]);
    }

    public function test_transaksi_kas_rejects_category_type_mismatch(): void
    {
        $bendahara = $this->createBendahara();
        $kategoriMasuk = Kategori::create([
            'nama_kategori' => 'Iuran Masuk',
            'tipe' => 'Masuk',
            'is_active' => true,
        ]);

        $this->actingAs($bendahara)
            ->post(route('transaksi-kas.store'), [
                'tgl_transaksi' => '2026-05-20',
                'jenis_transaksi' => 'Keluar',
                'id_kategori' => $kategoriMasuk->getKey(),
                'jumlah' => '10000',
                'keterangan' => 'Tidak cocok',
            ])
            ->assertRedirect(route('transaksi-kas'))
            ->assertSessionHas('error', 'Kategori yang dipilih tidak sesuai dengan jenis transaksi.');

        $this->assertDatabaseCount('transaksi_kas', 0);
    }

    public function test_global_search_returns_account_result_with_filtered_kelola_akun_link(): void
    {
        $ketua = $this->createKetuaRt();
        $account = User::factory()->create([
            'nama_lengkap' => 'Bendahara Satu',
            'username' => 'bendahara_satu',
            'email' => 'bendahara1@example.com',
            'role' => 'Bendahara',
            'is_approved' => true,
            'is_active' => true,
            'approved_at' => now(),
        ]);

        $this->actingAs($ketua)
            ->get(route('global-search', ['q' => 'bendahara1@example.com']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('GlobalSearch')
                ->where('results.akun.items.0.title', $account->nama_lengkap)
                ->where('results.akun.items.0.href', route('approval.index', ['search' => $account->email]))
                ->where('results.akun.href', route('approval.index', ['search' => $account->email]))
            );
    }

    public function test_kelola_akun_search_filters_managed_accounts(): void
    {
        $ketua = $this->createKetuaRt();
        $matching = User::factory()->create([
            'nama_lengkap' => 'Bendahara Cocok',
            'username' => 'bendahara_cocok',
            'email' => 'cocok@example.com',
            'role' => 'Bendahara',
            'is_approved' => true,
            'is_active' => true,
            'approved_at' => now(),
        ]);

        User::factory()->create([
            'nama_lengkap' => 'Bendahara Lain',
            'username' => 'bendahara_lain',
            'email' => 'lain@example.com',
            'role' => 'Bendahara',
            'is_approved' => true,
            'is_active' => true,
            'approved_at' => now(),
        ]);

        $this->actingAs($ketua)
            ->get(route('approval.index', ['search' => 'cocok@example.com']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Approval/Index')
                ->where('filters.search', 'cocok@example.com')
                ->has('managedAccounts', 1)
                ->where('managedAccounts.0.email', $matching->email)
            );
    }

    private function createKetuaRt(): User
    {
        return User::factory()->create([
            'role' => 'Ketua_RT',
            'email_verified_at' => now(),
            'is_approved' => true,
            'is_active' => true,
            'approved_at' => now(),
        ]);
    }

    private function createBendahara(): User
    {
        return User::factory()->create([
            'role' => 'Bendahara',
            'email_verified_at' => now(),
            'is_approved' => true,
            'is_active' => true,
            'approved_at' => now(),
        ]);
    }

    private function createWarga(string $nama, string $noRumah): Warga
    {
        return Warga::create([
            'nama' => $nama,
            'no_rumah' => $noRumah,
            'no_telepon' => '081234567890',
            'status_hunian' => 'Tetap',
        ]);
    }

    private function createIuran(): IuranWajib
    {
        return IuranWajib::create([
            'nama_iuran' => 'Iuran Kebersihan',
            'nominal_default' => 50000,
            'periode' => 'Bulanan',
            'is_active' => true,
        ]);
    }
}
