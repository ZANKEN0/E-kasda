<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 16px 18px 14px;
        }

        body {
            margin: 0;
            color: #1f2937;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.38;
        }

        .document {
            width: 100%;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
        }

        .header-left {
            float: left;
            width: 64%;
        }

        .header-right {
            float: right;
            width: 30%;
        }

        .brand-mark {
            display: inline-block;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #8ff0e2;
            color: #0f172a;
            text-align: center;
            line-height: 30px;
            font-weight: 700;
            font-size: 12px;
            vertical-align: top;
            margin-right: 8px;
        }

        .brand-copy {
            display: inline-block;
            width: 82%;
            vertical-align: top;
        }

        .title {
            margin: 0;
            color: #0f172a;
            font-size: 20px;
            line-height: 1.2;
            font-weight: 700;
        }

        .subtitle {
            margin-top: 2px;
            color: #64748b;
            font-size: 9px;
        }

        .meta-box {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 6px 8px;
            background: #f8fafc;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-table td {
            padding: 2px 0;
            font-size: 9px;
            vertical-align: top;
        }

        .meta-label {
            color: #64748b;
            width: 46%;
        }

        .meta-value {
            text-align: right;
            color: #0f172a;
            font-weight: 700;
        }

        .clear {
            clear: both;
        }

        .hero {
            margin-top: 10px;
            border: 1px solid #cbd5e1;
            border-left: 6px solid #0f766e;
            border-radius: 12px;
            padding: 10px 12px;
            background: #f8fafc;
        }

        .hero-label {
            color: #64748b;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-weight: 700;
        }

        .hero-value {
            margin-top: 5px;
            color: #0f172a;
            font-size: 24px;
            line-height: 1.1;
            font-weight: 700;
        }

        .hero-note {
            margin-top: 4px;
            color: #475569;
            font-size: 8.5px;
        }

        .summary-grid {
            width: 100%;
            margin-top: 8px;
            border-collapse: separate;
            border-spacing: 6px;
            margin-left: -6px;
            margin-right: -6px;
        }

        .summary-cell {
            width: 25%;
            border: 1px solid #d7dee7;
            border-radius: 12px;
            padding: 8px 10px;
            background: #ffffff;
        }

        .summary-label {
            color: #64748b;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-weight: 700;
        }

        .summary-value {
            margin-top: 5px;
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
        }

        .summary-success {
            color: #0f9d6e;
        }

        .summary-danger {
            color: #c24141;
        }

        .section {
            margin-top: 10px;
        }

        .section-title {
            margin: 0 0 4px;
            font-size: 12px;
            color: #0f172a;
            font-weight: 700;
        }

        .section-note {
            margin: 0 0 6px;
            color: #64748b;
            font-size: 8.5px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d7dee7;
            border-radius: 10px;
            overflow: hidden;
        }

        .data-table thead th {
            background: #f8fafc;
            color: #64748b;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            text-align: left;
            padding: 7px 8px;
            border-bottom: 1px solid #d7dee7;
        }

        .data-table tbody td {
            padding: 7px 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }

        .data-table tbody tr:last-child td {
            border-bottom: none;
        }

        .align-right {
            text-align: right;
        }

        .text-strong {
            color: #0f172a;
            font-weight: 700;
        }

        .text-muted {
            color: #64748b;
            font-size: 9px;
        }

        .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 999px;
            font-size: 8px;
            font-weight: 700;
            line-height: 1.4;
        }

        .badge-success {
            background: #e8fbf3;
            color: #0f9d6e;
        }

        .badge-danger {
            background: #fdecec;
            color: #c24141;
        }

        .panel-table {
            width: 100%;
            margin-top: 10px;
            border-collapse: separate;
            border-spacing: 10px 0;
            margin-left: -10px;
            margin-right: -10px;
        }

        .panel-cell {
            width: 50%;
            vertical-align: top;
        }

        .panel {
            border: 1px solid #d7dee7;
            border-radius: 12px;
            background: #ffffff;
            overflow: hidden;
        }

        .panel-head {
            padding: 8px 10px;
            background: #f8fafc;
            border-bottom: 1px solid #d7dee7;
        }

        .panel-head-title {
            margin: 0;
            color: #0f172a;
            font-size: 11px;
            font-weight: 700;
        }

        .panel-body {
            padding: 6px 10px;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 6px 0;
            border-bottom: 1px dashed #d7dee7;
            font-size: 9px;
        }

        .info-table tr:last-child td {
            border-bottom: none;
        }

        .info-label {
            color: #64748b;
        }

        .info-value {
            text-align: right;
            color: #0f172a;
            font-weight: 700;
        }

        .footer {
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid #d7dee7;
            color: #64748b;
            font-size: 8px;
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <div class="header-left">
                <span class="brand-mark">EK</span>
                <div class="brand-copy">
                    <h1 class="title">{{ $title }}</h1>
                    <div class="subtitle">{{ $subTitle }}</div>
                </div>
            </div>

            <div class="header-right">
                <div class="meta-box">
                    <table class="meta-table">
                        <tr>
                            <td class="meta-label">Periode</td>
                            <td class="meta-value">{{ $periodLabel }}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Tanggal Cetak</td>
                            <td class="meta-value">{{ $generatedAt }}</td>
                        </tr>
                        <tr>
                            <td class="meta-label">Dicetak Oleh</td>
                            <td class="meta-value">{{ $generatedBy }}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="clear"></div>
        </div>

        <div class="hero">
            <div class="hero-label">Saldo Akhir Periode</div>
            <div class="hero-value">{{ $summary['saldo_akhir'] }}</div>
            <div class="hero-note">
                Dokumen ini merangkum {{ $summary['jumlah_transaksi'] }} transaksi kas dan pembayaran iuran yang tercatat pada periode {{ $periodLabel }}.
            </div>
        </div>

        <table class="summary-grid">
            <tr>
                <td class="summary-cell">
                    <div class="summary-label">Saldo Awal</div>
                    <div class="summary-value">{{ $summary['saldo_awal'] }}</div>
                </td>
                <td class="summary-cell">
                    <div class="summary-label">Total Pemasukan</div>
                    <div class="summary-value summary-success">{{ $summary['total_masuk'] }}</div>
                </td>
                <td class="summary-cell">
                    <div class="summary-label">Total Pengeluaran</div>
                    <div class="summary-value summary-danger">{{ $summary['total_keluar'] }}</div>
                </td>
                <td class="summary-cell">
                    <div class="summary-label">Jumlah Transaksi</div>
                    <div class="summary-value">{{ $summary['jumlah_transaksi'] }}</div>
                </td>
            </tr>
        </table>

        <div class="section">
            <h2 class="section-title">Rincian Transaksi</h2>
            <p class="section-note">Daftar berikut menampilkan seluruh transaksi masuk dan keluar pada periode {{ $periodLabel }}.</p>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 12%;">Tanggal</th>
                        <th style="width: 11%;">Jenis</th>
                        <th style="width: 16%;">Kategori</th>
                        <th style="width: 31%;">Keterangan</th>
                        <th style="width: 15%;" class="align-right">Debit</th>
                        <th style="width: 15%;" class="align-right">Kredit</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($transactions as $row)
                        <tr>
                            <td>{{ $row['tanggal'] }}</td>
                            <td>
                                <span class="badge {{ $row['jenis_transaksi'] === 'Masuk' ? 'badge-success' : 'badge-danger' }}">
                                    {{ $row['jenis_transaksi'] }}
                                </span>
                            </td>
                            <td>{{ $row['kategori'] }}</td>
                            <td>
                                <div class="text-strong">{{ $row['keterangan'] ?: '-' }}</div>
                                <div class="text-muted">{{ $row['sumber'] }}</div>
                            </td>
                            <td class="align-right text-strong" style="color: #0f9d6e;">{{ $row['debit'] }}</td>
                            <td class="align-right text-strong" style="color: #c24141;">{{ $row['kredit'] }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="text-align: center; color: #64748b; padding: 16px 10px;">
                                Belum ada transaksi pada periode ini.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <table class="panel-table">
            <tr>
                <td class="panel-cell">
                    <div class="panel">
                        <div class="panel-head">
                            <h3 class="panel-head-title">Ringkasan Periode</h3>
                        </div>
                        <div class="panel-body">
                            <table class="info-table">
                                <tr>
                                    <td class="info-label">Periode Laporan</td>
                                    <td class="info-value">{{ $periodLabel }}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">Saldo Awal</td>
                                    <td class="info-value">{{ $summary['saldo_awal'] }}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">Total Pemasukan</td>
                                    <td class="info-value">{{ $summary['total_masuk'] }}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">Total Pengeluaran</td>
                                    <td class="info-value">{{ $summary['total_keluar'] }}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">Saldo Akhir</td>
                                    <td class="info-value">{{ $summary['saldo_akhir'] }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </td>
                <td class="panel-cell">
                    <div class="panel">
                        <div class="panel-head">
                            <h3 class="panel-head-title">Komposisi Kategori</h3>
                        </div>
                        <div class="panel-body" style="padding: 0;">
                            <table class="data-table" style="border: none; border-radius: 0;">
                                <thead>
                                    <tr>
                                        <th>Kategori</th>
                                        <th>Jenis</th>
                                        <th style="width: 18%;" class="align-right">Transaksi</th>
                                        <th style="width: 24%;" class="align-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($categoryBreakdown as $item)
                                        <tr>
                                            <td>{{ $item['kategori'] }}</td>
                                            <td>{{ $item['jenis_transaksi'] }}</td>
                                            <td class="align-right">{{ $item['jumlah_transaksi'] }}</td>
                                            <td class="align-right text-strong">{{ $item['total'] }}</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="4" style="text-align: center; color: #64748b; padding: 16px 10px;">
                                                Belum ada komposisi kategori pada periode ini.
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        <div class="footer">
            E-KASDA - Laporan ini dihasilkan dari data transaksi kas dan pembayaran iuran yang tersimpan di sistem.
        </div>
    </div>
</body>
</html>
