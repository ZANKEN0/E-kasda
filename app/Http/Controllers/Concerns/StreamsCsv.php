<?php

namespace App\Http\Controllers\Concerns;

use Symfony\Component\HttpFoundation\StreamedResponse;

trait StreamsCsv
{
    /**
     * @param  array<int, string>  $headers
     * @param  iterable<int, array<int, scalar|null>>  $rows
     * @param  array<int, array<int, scalar|null>>  $metaRows
     */
    protected function streamCsv(
        string $filename,
        array $headers,
        iterable $rows,
        array $metaRows = [],
    ): StreamedResponse {
        return response()->streamDownload(function () use ($headers, $rows, $metaRows): void {
            $handle = fopen('php://output', 'wb');

            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");

            foreach ($metaRows as $metaRow) {
                fputcsv($handle, $metaRow);
            }

            if ($metaRows !== []) {
                fputcsv($handle, []);
            }

            fputcsv($handle, $headers);

            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
