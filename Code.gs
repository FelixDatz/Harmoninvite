/**
 * ============================================================
 * HARMONISPACE · Google Apps Script
 * File: Code.gs
 *
 * Cara pakai:
 *   1. Buka spreadsheet absensi kamu di Google Sheets
 *   2. Klik Extensions > Apps Script
 *   3. Paste seluruh kode ini, ganti SHEET_NAME jika perlu
 *   4. Deploy sebagai Web App (lihat panduan di README)
 * ============================================================
 */

// ✏️ Ganti nama sheet jika berbeda (tab di bagian bawah spreadsheet)
const SHEET_NAME = "Absensi";

/**
 * Tangani request POST dari form HTML.
 * Data diterima sebagai JSON di body request.
 */
function doPost(e) {
  try {
    // Parse JSON dari body request
    const body = JSON.parse(e.postData.contents);

    const nama      = body.nama      || "";
    const divisi    = body.divisi    || "";
    const kehadiran = body.kehadiran || "";
    const alasan    = body.alasan    || "-";
    const timestamp = body.timestamp || new Date().toLocaleString("id-ID");

    // Akses spreadsheet & sheet yang dituju
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    // Buat header jika sheet masih kosong (baris pertama)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "No",
        "Timestamp",
        "Nama Lengkap",
        "Asal Divisi",
        "Status Kehadiran",
        "Alasan Ketidakhadiran"
      ]);

      // Format header: bold, background hijau, teks putih
      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight("bold")
                 .setBackground("#2D5A27")
                 .setFontColor("#FFFFFF");
      sheet.setFrozenRows(1); // Freeze baris header
    }

    // Nomor urut otomatis
    const lastRow = sheet.getLastRow();
    const no = lastRow; // baris 1 = header, baris 2 = data ke-1, dst.

    // Tambahkan data baru
    sheet.appendRow([no, timestamp, nama, divisi, kehadiran, alasan]);

    // Auto-resize kolom agar rapi
    sheet.autoResizeColumns(1, 6);

    // Respons sukses (dengan header CORS agar bisa dibaca JS jika mode:"cors")
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", message: "Data berhasil disimpan." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Respons error
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * doGet: Diperlukan agar Web App bisa diakses (health check).
 * Jangan hapus fungsi ini.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Harmonispace API aktif ✓" }))
    .setMimeType(ContentService.MimeType.JSON);
}
