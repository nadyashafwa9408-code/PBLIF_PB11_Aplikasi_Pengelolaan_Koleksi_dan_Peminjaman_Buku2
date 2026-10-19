(function () {
  // baris/kartu yang tidak cocok disembunyikan lewat class ini
  // (class terpisah supaya tidak bentrok dengan cari-status.js dan filter bawaan)
  var st = document.createElement("style");
  st.textContent = ".ps-hide{display:none !important}";
  document.head.appendChild(st);

  var STATUS_PINJAM = /(menunggu|dipinjam|terlambat|selesai|dikembalikan)/i;
  var inp = null;

  function cariInput() {
    return Array.from(document.querySelectorAll("input")).find(function (i) {
      return i.id !== "s" && /^cari buku/i.test(i.placeholder || "");
    });
  }

  function kata() {
    return (inp ? inp.value : "").toLowerCase().split(/\s+/).filter(Boolean);
  }

  function cocok(teks, tk) {
    teks = teks.toLowerCase();
    return tk.every(function (t) { return teks.indexOf(t) > -1; });
  }

  // 1) kartu buku (Tersedia / Habis) dan 2) baris tabel (Menunggu, Dipinjam, dst.)
  function terapkan() {
    if (!inp) return;
    var tk = kata();

    document.querySelectorAll(".bk").forEach(function (el) {
      el.classList.toggle("ps-hide", tk.length > 0 && !cocok(el.textContent, tk));
    });

    document.querySelectorAll("table:not(.dh-tbl) tr").forEach(function (tr) {
      if (!tr.querySelector("td")) return; // lewati baris header
      tr.classList.toggle("ps-hide", tk.length > 0 && !cocok(tr.textContent, tk));
    });
  }

  function adaDaftar() {
    return document.querySelector(".bk") ||
           document.querySelector("table:not(.dh-tbl) td");
  }

  // tekan Enter di halaman tanpa daftar (Dashboard, Profil, dll.) -> pindah halaman
  function pindah() {
    var q = inp.value.trim();
    if (!q || adaDaftar()) return;

    var admin = /Administrator/i.test(document.body.innerText);
    var pinjam = STATUS_PINJAM.test(q);
    var tujuan = admin
      ? (pinjam ? "admin-peminjaman.html" : "admin-buku.html")
      : (pinjam ? "peminjaman.html" : "cari.html");

    location.href = tujuan + "?q=" + encodeURIComponent(q);
  }

  // isi otomatis kolom cari kalau datang dari halaman lain (?q=...)
  function dariUrl() {
    var q = new URLSearchParams(location.search).get("q");
    if (!q || !inp || inp.dataset.pq) return;
    inp.dataset.pq = "1";
    inp.value = q;

    var s = document.getElementById("s"); // kolom cari milik halaman Cari Buku
    if (s) {
      s.value = q;
      if (typeof fl === "function") fl();
    }
    terapkan();
  }

  function pasang() {
    inp = cariInput();
    if (!inp || inp.dataset.ps) return;
    inp.dataset.ps = "1";
    inp.addEventListener("input", terapkan);
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); pindah(); }
    });
    dariUrl();
  }

  // halaman digambar ulang saat filter diklik, data berubah, atau tombol Setujui ditekan
  var t = null;
  new MutationObserver(function () {
    clearTimeout(t);
    t = setTimeout(function () { pasang(); terapkan(); }, 50);
  }).observe(document.body, { childList: true, subtree: true });

  pasang();
  terapkan();
})();