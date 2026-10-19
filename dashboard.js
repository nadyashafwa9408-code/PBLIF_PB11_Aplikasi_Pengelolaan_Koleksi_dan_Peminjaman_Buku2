(function () {
  // ===== CSS dipasang lewat JS, tidak perlu menyentuh style.css =====
  var css = `
  .dh-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin:22px 0 22px}
  .dh-stat{display:flex;align-items:center;gap:14px;padding:18px 20px;border-radius:16px;background:var(--bg)}
  .dh-ico{width:38px;height:38px;flex-shrink:0;border-radius:10px;background:#fff;color:var(--fg);display:flex;align-items:center;justify-content:center}
  .dh-ico svg{width:19px;height:19px;display:block}
  .dh-lab{font-size:11px;color:#6B6B85;margin-bottom:2px}
  .dh-num{font-size:24px;font-weight:800;line-height:1.1;color:#1B1B3A}

  .dh-wrap{display:grid;grid-template-columns:1fr 1.6fr;gap:20px;align-items:start}
  .dh-card{background:#fff;border:1px solid #ECECF5;border-radius:16px;box-shadow:0 4px 16px rgba(27,27,58,.04);padding:22px 24px;min-height:300px;min-width:0}
  .dh-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
  .dh-head h3{margin:0;font-size:13px;font-weight:700;color:#1B1B3A}
  .dh-link{font-size:11px;font-weight:600;color:#5B5BD6;text-decoration:none}
  .dh-link:hover{text-decoration:underline}

  .dh-pop{display:flex;align-items:center;gap:12px;padding:8px 0}
  .dh-rank{width:12px;font-size:10px;color:#6B6B85;text-align:center}
  .dh-cov{width:34px;height:44px;flex-shrink:0;border-radius:5px}
  .dh-pop b{display:block;font-size:11px;color:#1B1B3A;margin-bottom:3px}
  .dh-pop small{font-size:10px;color:#8A8AA3}

  .dh-tbl{width:100%;border-collapse:collapse}
  .dh-tbl th{padding:10px 12px;text-align:left;font-size:10px;font-weight:600;color:#5B5BD6;background:#F3F3FB}
  .dh-tbl th:first-child{border-radius:8px 0 0 8px}
  .dh-tbl th:last-child{border-radius:0 8px 8px 0}
  .dh-tbl td{padding:12px;font-size:10.5px;color:#3A3A55;border-bottom:1px solid #F0F0F7}
  .dh-st{display:inline-block;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:700}
  .dh-st.menunggu{background:#FDF0CF;color:#B7791F}
  .dh-st.dipinjam{background:#ECEBFB;color:#5B5BD6}
  .dh-st.terlambat{background:#FDE4E4;color:#D64545}
  .dh-st.selesai{background:#DDF5E8;color:#2E9E6B}
  .dh-kosong{font-size:11px;color:#8A8AA3;padding:8px 0}

  @media(max-width:900px){.dh-stats{grid-template-columns:repeat(2,1fr)}.dh-wrap{grid-template-columns:1fr}}
  `;

  var warna = [
    ["#E0592A", "#F0884A"], ["#1F4E79", "#3A7CA5"], ["#5B3A8C", "#8E5BC0"],
    ["#A0623A", "#D49A6A"], ["#2E7D6B", "#6BB58F"], ["#9A4A7A", "#C77BA8"]
  ];

  function ikon(path) {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }
  var IKON = {
    buku: ikon('<path d="M4 4v16M9 4v16M14 6l3 14 4-1-3-14z"/>'),
    cek:  ikon('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'),
    jam:  ikon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    awas: ikon('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/>')
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  // coba ambil nama penulis dari data buku di app.js (kalau bisa diakses)
  function penulisDari(judul) {
    try {
      if (typeof B === "function") {
        var b = B().find(function (x) { return x.t === judul; });
        if (b && b.a) return b.a;
      }
    } catch (e) {}
    return "";
  }

  function cariStat(label) {
    var re = new RegExp("^" + label + "\\s*(\\d+)$", "i");
    var hasil = null;
    document.querySelectorAll("div").forEach(function (el) {
      var m = el.textContent.trim().match(re);
      if (m) hasil = { el: el, angka: m[1] };
    });
    return hasil;
  }
  function cariJudul(teks) {
    return Array.from(document.querySelectorAll("h1,h2,h3,h4")).find(function (h) {
      return h.textContent.toLowerCase().indexOf(teks) > -1;
    });
  }
  function baris(el) {
    return el.innerText.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function sembunyikan(el) {
    el.style.display = "none";
    var p = el.parentElement;
    while (p && p !== document.body &&
           Array.from(p.children).every(function (c) {
             return c.style.display === "none" || c.tagName === "SCRIPT" || c.tagName === "STYLE";
           })) {
      p.style.display = "none";
      p = p.parentElement;
    }
  }
  function kelasStatus(s) {
    s = s.toLowerCase();
    if (s.indexOf("lambat") > -1) return "terlambat";
    if (s.indexOf("tunggu") > -1) return "menunggu";
    if (s.indexOf("kembali") > -1 || s.indexOf("selesai") > -1) return "selesai";
    return "dipinjam";
  }

  function jalan() {
    if (document.querySelector(".dh-wrap")) return;

    var s1 = cariStat("Total judul"), s2 = cariStat("Buku tersedia"),
        s3 = cariStat("Sedang dipinjam"), s4 = cariStat("Terlambat");
    var jPop = cariJudul("buku terpopuler"), jBaru = cariJudul("peminjaman terbaru");

    if (!s1 || !s2 || !s3 || !s4 || !jPop || !jBaru) {
      console.warn("Elemen dashboard tidak lengkap", { s1, s2, s3, s4, jPop, jBaru });
      return;
    }
    var kPop = jPop.nextElementSibling, kBaru = jBaru.nextElementSibling;

    var pop = [];
    baris(kPop).forEach(function (t) {
      var m = t.match(/^(.*?)\s*\((\d+)x dipinjam\)\s*$/i);
      if (m) pop.push({ judul: m[1], n: m[2] });
    });
    var baru = [];
    baris(kBaru).forEach(function (t) {
      var m = t.match(/^(.+?)\s+[—–-]\s+(.+?)\s+(\S+)$/);
      if (m) baru.push({ nama: m[1], judul: m[2], status: m[3] });
    });

    var htmlPop = pop.length ? pop.slice(0, 5).map(function (b, i) {
      var c = warna[hash(b.judul) % warna.length];
      var sub = penulisDari(b.judul) || (b.n + "x dipinjam");
      return '<div class="dh-pop"><span class="dh-rank">' + (i + 1) + '</span>' +
        '<div class="dh-cov" style="background:linear-gradient(160deg,' + c[0] + ',' + c[1] + ')"></div>' +
        '<div><b>' + esc(b.judul) + '</b><small>' + esc(sub) + '</small></div></div>';
    }).join("") : '<div class="dh-kosong">Belum ada data.</div>';

    var htmlBaru = baru.length ?
      '<table class="dh-tbl"><thead><tr><th>Nama Peminjam</th><th>Judul Buku</th><th>Status</th></tr></thead><tbody>' +
      baru.slice(0, 6).map(function (r) {
        return '<tr><td>' + esc(r.nama) + '</td><td>' + esc(r.judul) + '</td>' +
          '<td><span class="dh-st ' + kelasStatus(r.status) + '">' + esc(r.status) + '</span></td></tr>';
      }).join("") + '</tbody></table>'
      : '<div class="dh-kosong">Belum ada peminjaman.</div>';

    function stat(bg, fg, ic, label, angka) {
      return '<div class="dh-stat" style="--bg:' + bg + ';--fg:' + fg + '">' +
        '<div class="dh-ico">' + ic + '</div><div>' +
        '<div class="dh-lab">' + label + '</div><div class="dh-num">' + angka + '</div></div></div>';
    }

    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    var blok = document.createElement("div");
    blok.innerHTML =
      '<div class="dh-stats">' +
        stat("#DCE6FF", "#4A6CF7", IKON.buku, "Total Buku", s1.angka) +
        stat("#DCF5E7", "#2E9E6B", IKON.cek, "Buku Tersedia", s2.angka) +
        stat("#FFF0CC", "#D99A1B", IKON.jam, "Sedang Dipinjam", s3.angka) +
        stat("#FFE0E0", "#E5484D", IKON.awas, "Terlambat", s4.angka) +
      '</div>' +
      '<div class="dh-wrap">' +
        '<div class="dh-card"><div class="dh-head"><h3>Buku Terpopuler</h3>' +
          '<a class="dh-link" href="admin-buku.html">Lihat Semua</a></div>' + htmlPop + '</div>' +
        '<div class="dh-card"><div class="dh-head"><h3>Peminjaman Terbaru</h3>' +
          '<a class="dh-link" href="admin-peminjaman.html">Lihat Semua</a></div>' + htmlBaru + '</div>' +
      '</div>';

    var grid = s1.el.parentElement;
    if (!(grid.contains(s2.el) && grid.contains(s3.el) && grid.contains(s4.el))) grid = s1.el;
    grid.parentElement.insertBefore(blok, grid);

    sembunyikan(grid);
    sembunyikan(jPop); sembunyikan(kPop);
    sembunyikan(jBaru); sembunyikan(kBaru);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", jalan);
  } else {
    jalan();
  }
})();