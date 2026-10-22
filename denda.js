// denda.js
const HARI_PINJAM = 14;          // batas lama peminjaman (hari)
const DENDA_PER_HARI = 1000;     // denda per hari keterlambatan (Rp)
const DENDA_MAKSIMAL = 50000;    // batas atas denda (Rp)
const MS_PER_HARI = 24 * 60 * 60 * 1000;

/**
 * Menghitung denda berdasarkan tanggal pinjam dan tanggal kembali.
 * Format tanggal: "YYYY-MM-DD" (sesuai input type="date").
 */
function hitungDenda(tglPinjam, tglKembali) {
  if (!tglPinjam || !tglKembali) {
    throw new Error("Tanggal pinjam dan tanggal kembali wajib diisi.");
  }

  // Pakai UTC supaya tidak terpengaruh zona waktu atau daylight saving
  const pinjam = new Date(tglPinjam + "T00:00:00Z").getTime();
  const kembali = new Date(tglKembali + "T00:00:00Z").getTime();

  if (Number.isNaN(pinjam) || Number.isNaN(kembali)) {
    throw new Error("Format tanggal tidak valid.");
  }
  if (kembali < pinjam) {
    throw new Error("Tanggal kembali tidak boleh sebelum tanggal pinjam.");
  }

  const lamaPinjam = Math.round((kembali - pinjam) / MS_PER_HARI);
  const hariTerlambat = Math.max(0, lamaPinjam - HARI_PINJAM);
  const denda = Math.min(hariTerlambat * DENDA_PER_HARI, DENDA_MAKSIMAL);

  return {
    lamaPinjam,
    hariTerlambat,
    denda,
    terlambat: hariTerlambat > 0,
  };
}

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Contoh pemakaian di halaman admin (form pengembalian)
const formDenda = document.getElementById("formDenda");
if (formDenda) {
  formDenda.addEventListener("submit", (e) => {
    e.preventDefault();
    const tglPinjam = document.getElementById("tglPinjam").value;
    const tglKembali = document.getElementById("tglKembali").value;
    const hasil = document.getElementById("hasil");

    try {
      const r = hitungDenda(tglPinjam, tglKembali);
      hasil.innerHTML = `
        Lama pinjam: <strong>${r.lamaPinjam} hari</strong><br>
        Terlambat: <strong>${r.hariTerlambat} hari</strong><br>
        Denda: <strong>${formatRupiah(r.denda)}</strong>
      `;
    } catch (err) {
      hasil.textContent = err.message;
    }
  });
}