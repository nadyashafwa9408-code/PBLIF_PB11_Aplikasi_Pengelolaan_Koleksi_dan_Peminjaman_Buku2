(function () {
  // ===== CSS dipasang lewat JS =====
  var css = `
  .bk-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:22px}
  .bk-top > :first-child{min-width:0}
  .bk-top > :last-child{margin:0 !important;flex-shrink:0}
  .bk-top button,.bk-top a{padding:10px 18px !important;font-size:12px !important;border-radius:10px !important;margin:0 !important;white-space:nowrap}

  .bk-tbl{width:100%;border-collapse:collapse}
  .bk-tbl th{padding:12px 14px !important;text-align:left;font-size:11px !important;font-weight:600 !important;
    letter-spacing:0 !important;text-transform:none !important;color:#5B5B80 !important;background:#F3F3FB !important;
    border-bottom:none !important;white-space:nowrap}
  .bk-tbl th:first-child{border-radius:10px 0 0 10px}
  .bk-tbl th:last-child{border-radius:0 10px 10px 0}
  .bk-tbl td{padding:12px 14px !important;font-size:11px !important;color:#3A3A55 !important;
    border-bottom:1px solid #F0F0F7 !important;vertical-align:middle;white-space:nowrap}
  .bk-tbl tr:last-child td{border-bottom:none !important}

  .bk-cov{width:30px;height:40px;border-radius:5px}
  .bk-judul{font-weight:500;color:#1B1B3A}

  .bk-aksi{display:flex;gap:8px;align-items:center}
  .bk-aksi button{width:26px !important;height:26px !important;min-width:0 !important;padding:0 !important;
    border:none !important;border-radius:7px !important;display:flex !important;align-items:center;
    justify-content:center;cursor:pointer;box-shadow:none !important}
  .bk-aksi button svg{width:13px;height:13px;display:block}
  .bk-aksi .bk-edit{background:#ECEBFB !important;color:#5B5BD6 !important}
  .bk-aksi .bk-hapus{background:#FDE4E4 !important;color:#E5484D !important}
  .bk-aksi button:hover{filter:brightness(.95)}
  `;

  var warna = [
    ["#E0592A", "#F0884A"], ["#1F4E79", "#3A7CA5"], ["#5B3A8C", "#8E5BC0"],
    ["#A0623A", "#D49A6A"], ["#2E7D6B", "#6BB58F"], ["#9A4A7A", "#C77BA8"]
  ];

  var SVG = 'width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var IKON_EDIT = '<svg ' + SVG + '><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  var IKON_HAPUS = '<svg ' + SVG + '><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>';

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function pasangCSS() {
    if (document.getElementById("bk-style")) return;
    var st = document.createElement("style");
    st.id = "bk-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ambil judul & sub-teks ("Penulis · Tahun") dari sel "Buku"
  function bacaBuku(td) {
    var kids = Array.from(td.children).map(function (k) { return k.textContent.trim(); }).filter(Boolean);
    if (kids.length >= 2) return { judul: kids[0], sub: kids[1] };
    var lines = td.innerText.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    return { judul: lines[0] || "", sub: lines[1] || "" };
  }

  function rapikanTabel() {
    var tabel = Array.from(document.querySelectorAll("table")).find(function (t) {
      if (t.classList.contains("bk-tbl")) return false;
      var h = Array.from(t.querySelectorAll("th")).map(function (x) { return x.textContent.trim().toLowerCase(); });
      return h.indexOf("buku") > -1 && h.indexOf("jenis") > -1 && h.indexOf("aksi") > -1;
    });
    if (!tabel) return;

    var ths = Array.from(tabel.querySelectorAll("th"));
    var teks = ths.map(function (x) { return x.textContent.trim().toLowerCase(); });
    var iBuku = teks.indexOf("buku"), iJenis = teks.indexOf("jenis"),
        iStok = teks.indexOf("stok"), iAksi = teks.indexOf("aksi");

    // --- header ---
    var thBuku = ths[iBuku], thJenis = ths[iJenis];
    var thCover = document.createElement("th"); thCover.textContent = "Cover";
    var thPenulis = document.createElement("th"); thPenulis.textContent = "Penulis";
    thBuku.textContent = "Judul";
    thBuku.parentNode.insertBefore(thCover, thBuku);
    thBuku.parentNode.insertBefore(thPenulis, thBuku.nextSibling);
    thJenis.remove();
    ths[0].textContent = "No";
    ths[iStok].textContent = "Stok";
    ths.forEach(function (t) {
      var x = t.textContent.trim();
      if (/^[A-Z ]+$/.test(x)) t.textContent = x.charAt(0) + x.slice(1).toLowerCase();
    });

    // --- baris ---
    Array.from(tabel.querySelectorAll("tr")).forEach(function (tr) {
      var tds = Array.from(tr.children).filter(function (c) { return c.tagName === "TD"; });
      if (tds.length !== ths.length) return;

      var tdBuku = tds[iBuku], tdJenis = tds[iJenis], tdStok = tds[iStok], tdAksi = tds[iAksi];
      var b = bacaBuku(tdBuku);
      var penulis = (b.sub.split("·")[0] || "").trim() || "-";

      // cover
      var c = warna[hash(b.judul) % warna.length];
      var tdCover = document.createElement("td");
      tdCover.innerHTML = '<div class="bk-cov" style="background:linear-gradient(160deg,' + c[0] + ',' + c[1] + ')"></div>';

      // penulis
      var tdPenulis = document.createElement("td");
      tdPenulis.textContent = penulis;

      // judul
      tdBuku.innerHTML = '<span class="bk-judul"></span>';
      tdBuku.firstChild.textContent = b.judul;

      tr.insertBefore(tdCover, tdBuku);
      tr.insertBefore(tdPenulis, tdBuku.nextSibling);
      tdJenis.remove();

      // stok jadi angka saja
      var n = tdStok.textContent.match(/\d+/);
      if (n) tdStok.textContent = n[0];

      // tombol aksi: pakai tombol asli, ganti tampilan jadi ikon
      var tombol = Array.from(tdAksi.querySelectorAll("button"));
      if (tombol.length) {
        var box = document.createElement("div");
        box.className = "bk-aksi";
        tombol.forEach(function (btn, i) {
          var hapus = i === tombol.length - 1 && tombol.length > 1;
          btn.innerHTML = hapus ? IKON_HAPUS : IKON_EDIT;
          btn.classList.add(hapus ? "bk-hapus" : "bk-edit");
          btn.title = hapus ? "Hapus" : "Ubah";
          box.appendChild(btn);
        });
        tdAksi.innerHTML = "";
        tdAksi.appendChild(box);
      }
    });

    tabel.classList.add("bk-tbl");
  }

  // judul + tombol "Tambah Buku" jadi satu baris (tombol di kanan)
  function rapikanHeader() {
    if (document.querySelector(".bk-top")) return;

    var h = Array.from(document.querySelectorAll("h1,h2")).find(function (x) {
      return /kelola buku/i.test(x.textContent);
    });
    var btn = Array.from(document.querySelectorAll("button,a")).find(function (x) {
      return /tambah buku/i.test(x.textContent);
    });
    var tabel = document.querySelector("table");
    if (!h || !btn || !tabel) return;

    // cari induk bersama yang memisahkan judul, tombol, dan tabel
    var ca = h.parentElement;
    while (ca && !(ca.contains(btn) && ca.contains(tabel))) ca = ca.parentElement;
    if (!ca) return;

    function idx(el) {
      var kids = Array.from(ca.children);
      return kids.findIndex(function (k) { return k.contains(el); });
    }
    var guard = 0;
    while (idx(h) === idx(btn) && idx(h) > -1 && guard++ < 5) {
      ca = ca.children[idx(h)];
    }
    var kids = Array.from(ca.children);
    var iH = idx(h), iB = idx(btn), iT = idx(tabel);
    if (iH < 0 || iB < 0 || iT < 0) return;

    var kiri = [], awal = Math.min(iH, iB);
    kids.forEach(function (k, i) {
      if (i >= 0 && i < iT && i !== iB && !k.matches("style,script")) kiri.push(k);
    });
    var kidBtn = kids[iB];

    var wrap = document.createElement("div");
    wrap.className = "bk-top";
    var kol = document.createElement("div");
    ca.insertBefore(wrap, kids[Math.min(awal, kiri.length ? kids.indexOf(kiri[0]) : awal)]);
    kiri.forEach(function (k) { kol.appendChild(k); });
    wrap.appendChild(kol);
    wrap.appendChild(kidBtn);
  }

  var sibuk = false;
  function jalan() {
    if (sibuk) return;
    sibuk = true;
    try {
      pasangCSS();
      rapikanHeader();
      rapikanTabel();
    } catch (e) {
      console.warn("buku.js:", e);
    }
    setTimeout(function () { sibuk = false; }, 0);
  }

  // halaman digambar ulang setelah tambah / ubah / hapus, jadi pantau perubahan
  new MutationObserver(jalan).observe(document.body, { childList: true, subtree: true });
  jalan();
})();