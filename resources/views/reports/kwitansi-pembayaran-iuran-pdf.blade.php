<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 22px 22px 20px;
        }

        body {
            margin: 0;
            color: #1f2937;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.5;
        }

        .receipt {
            border: 1px solid #cbd5e1;
            border-radius: 14px;
            overflow: hidden;
        }

        .header {
            background: #0f766e;
            color: #ffffff;
            padding: 16px 18px;
        }

        .header-left {
            float: left;
            width: 65%;
        }

        .header-right {
            float: right;
            width: 28%;
            text-align: right;
        }

        .brand {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            opacity: 0.8;
            font-weight: 700;
        }

        .title {
            margin: 4px 0 0;
            font-size: 24px;
            line-height: 1.2;
            font-weight: 700;
        }

        .receipt-number {
            font-size: 11px;
            font-weight: 700;
        }

        .receipt-date {
            margin-top: 6px;
            font-size: 10px;
            opacity: 0.84;
        }

        .clear {
            clear: both;
        }

        .body {
            padding: 16px 18px 14px;
            background: #ffffff;
        }

        .hero {
            border: 1px solid #cbd5e1;
            border-left: 5px solid #0f766e;
            border-radius: 12px;
            padding: 12px 14px;
            background: #f8fafc;
        }

        .hero-label {
            color: #64748b;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 700;
        }

        .hero-value {
            margin-top: 6px;
            color: #0f172a;
            font-size: 28px;
            line-height: 1.1;
            font-weight: 700;
        }

        .hero-note {
            margin-top: 5px;
            color: #475569;
            font-size: 10px;
        }

        .info-table {
            width: 100%;
            margin-top: 14px;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 8px 0;
            border-bottom: 1px dashed #d7dee7;
            vertical-align: top;
        }

        .info-table tr:last-child td {
            border-bottom: none;
        }

        .label {
            width: 34%;
            color: #64748b;
        }

        .value {
            color: #0f172a;
            font-weight: 700;
        }

        .note-box {
            margin-top: 14px;
            border: 1px dashed #cbd5e1;
            border-radius: 10px;
            padding: 10px 12px;
            background: #f8fafc;
        }

        .note-title {
            color: #0f172a;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 700;
        }

        .note-body {
            margin-top: 6px;
            color: #475569;
            font-size: 10px;
        }

        .signature {
            width: 100%;
            margin-top: 16px;
        }

        .signature-right {
            width: 42%;
            margin-left: auto;
            text-align: center;
        }

        .signature-line {
            margin-top: 42px;
            border-top: 1px solid #94a3b8;
            padding-top: 6px;
            color: #0f172a;
            font-weight: 700;
        }

        .footer {
            margin-top: 12px;
            font-size: 9px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="header-left">
                <div class="brand">E-KASDA</div>
                <div class="title">{{ $title }}</div>
            </div>
            <div class="header-right">
                <div class="receipt-number">{{ $receiptNumber }}</div>
                <div class="receipt-date">Dicetak {{ $generatedAt }}</div>
            </div>
            <div class="clear"></div>
        </div>

        <div class="body">
            <div class="hero">
                <div class="hero-label">Nominal Diterima</div>
                <div class="hero-value">{{ $amount }}</div>
                <div class="hero-note">
                    Bukti pembayaran iuran untuk periode {{ $periodLabel }}.
                </div>
            </div>

            <table class="info-table">
                <tr>
                    <td class="label">Nama Warga</td>
                    <td class="value">{{ $wargaName }}</td>
                </tr>
                <tr>
                    <td class="label">No Rumah</td>
                    <td class="value">{{ $wargaAddress }}</td>
                </tr>
                <tr>
                    <td class="label">No Telepon</td>
                    <td class="value">{{ $phoneNumber ?: '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Jenis Iuran</td>
                    <td class="value">{{ $iuranName }}</td>
                </tr>
                <tr>
                    <td class="label">Periode</td>
                    <td class="value">{{ $periodLabel }}</td>
                </tr>
                <tr>
                    <td class="label">Tanggal Bayar</td>
                    <td class="value">{{ $paidAt }}</td>
                </tr>
                <tr>
                    <td class="label">Metode Pembayaran</td>
                    <td class="value">{{ $paymentMethod }}</td>
                </tr>
            </table>

            <div class="note-box">
                <div class="note-title">Catatan</div>
                <div class="note-body">
                    {{ $note ?: 'Tidak ada catatan tambahan untuk pembayaran ini.' }}
                </div>
            </div>

            <div class="signature">
                <div class="signature-right">
                    <div>Petugas Penerima</div>
                    <div class="signature-line">{{ $receivedBy }}</div>
                </div>
            </div>

            <div class="footer">
                E-KASDA - Kwitansi ini dibuat otomatis dari sistem pembayaran iuran RT.
            </div>
        </div>
    </div>
</body>
</html>
