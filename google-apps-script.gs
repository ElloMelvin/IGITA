/**
 * IGITA 2026 — Google Apps Script
 *
 * Cara pasang:
 * 1. Buat Google Spreadsheet baru
 * 2. Extensions → Apps Script → hapus isi default, tempel seluruh file ini
 * 3. (Opsional) Buat folder Drive "IGITA 2026 Bukti Bayar", salin ID folder ke DRIVE_FOLDER_ID
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Salin URL Web App (berakhiran /exec) ke register.js → GOOGLE_SCRIPT_URL
 */

const SHEET_NAME = 'Pendaftaran';
/** Kosongkan '' untuk simpan bukti bayar di root Drive; atau isi ID folder Drive */
const DRIVE_FOLDER_ID = '';

const HEADERS = [
  'Timestamp',
  'Kode Registrasi',
  'Kategori',
  'Nama Tim',
  'Institusi',
  'Ketua Nama', 'Ketua Email', 'Ketua HP', 'Ketua IG',
  'Anggota 2 Nama', 'Anggota 2 Email', 'Anggota 2 HP', 'Anggota 2 IG',
  'Anggota 3 Nama', 'Anggota 3 Email', 'Anggota 3 HP', 'Anggota 3 IG',
  'Anggota 4 Nama', 'Anggota 4 Email', 'Anggota 4 HP', 'Anggota 4 IG',
  'Cadangan Nama', 'Cadangan Email', 'Cadangan HP', 'Cadangan IG',
  'Link Bukti Bayar'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    ensureHeaders(sheet);

    let buktiLink = '';
    if (payload.buktiBase64 && payload.buktiName) {
      buktiLink = saveBuktiFile(payload);
    }

    sheet.appendRow([
      new Date(),
      payload.kode || '',
      payload.kategori || '',
      payload.namaTim || '',
      payload.institusi || '',
      payload.m1Nama || '', payload.m1Email || '', payload.m1Hp || '', payload.m1Ig || '',
      payload.m2Nama || '', payload.m2Email || '', payload.m2Hp || '', payload.m2Ig || '',
      payload.m3Nama || '', payload.m3Email || '', payload.m3Hp || '', payload.m3Ig || '',
      payload.m4Nama || '', payload.m4Email || '', payload.m4Hp || '', payload.m4Ig || '',
      payload.m5Nama || '', payload.m5Email || '', payload.m5Hp || '', payload.m5Ig || '',
      buktiLink
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function saveBuktiFile(payload) {
  const bytes = Utilities.base64Decode(payload.buktiBase64);
  const blob = Utilities.newBlob(
    bytes,
    payload.buktiMime || 'application/octet-stream',
    payload.buktiName
  );
  const folder = DRIVE_FOLDER_ID
    ? DriveApp.getFolderById(DRIVE_FOLDER_ID)
    : DriveApp.getRootFolder();
  const prefix = (payload.kode || 'IGITA') + '_';
  const file = folder.createFile(blob.setName(prefix + payload.buktiName));
  return file.getUrl();
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
