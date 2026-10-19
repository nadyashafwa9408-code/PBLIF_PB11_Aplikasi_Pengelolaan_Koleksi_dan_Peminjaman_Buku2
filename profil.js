(function () {
  // ===== Data preferensi (belum ada di app.js, ubah sesuai keinginan) =====
  var PREFERENSI = [
    ["Genre favorit", "Fiksi & Pengembangan Diri"],
    ["Bahasa bacaan", "Bahasa Indonesia"],
    ["Pengingat tenggat", "<span class='pf-tag'>Aktif</span>"]
  ];

  var IKON = {
    buku:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/></svg>',
    cek:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    hati:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-9-9.2C1.8 7.6 3.6 5 6.5 5c1.8 0 3.1 1 3.5 2.2h4C14.4 6 15.7 5 17.5 5 20.4 5 22.2 7.6 21 10.8 19 15.6 12 20 12 20z"/></svg>',
    pensil:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function ambil(teks, label, berikut) {
    var re = new RegExp(label + ":\\s*(.*?)\\s*(?:" + berikut + ":|$)", "i");
    var m = teks.match(re);
    return m ? m[1].trim() : "-";
  }

  // cari kartu terdalam yang isinya persis "label + angka"
  function cariStat(label) {
    var re = new RegExp("^" + label + "\\s*(\\d+)$", "i");
    var hasil = null;
    document.querySelectorAll("div").forEach(function (el) {
      var m = el.textContent.trim().match(re);
      if (m) hasil = { el: el, angka: m[1] }; // yang terakhir = paling dalam
    });
    return hasil;
  }

  function jalan() {
    if (document.querySelector(".pf-head")) return;

    // --- cari judul "Informasi pribadi" & kartunya ---
    var judul = Array.from(document.querySelectorAll("h1,h2,h3,h4"))
      .find(function (h) { return /informasi pribadi/i.test(h.textContent); });
    if (!judul) { console.warn("Judul 'Informasi pribadi' tidak ditemukan"); return; }
    var kartuInfo = judul.nextElementSibling;
    if (!kartuInfo) return;

    // --- baca data user ---
    var t = kartuInfo.textContent;
    var nama     = ambil(t, "Nama", "Username");
    var username = ambil(t, "Username", "Email");
    var email    = ambil(t, "Email", "Peran");
    var peran    = ambil(t, "Peran", "Bergabung");
    var gabung   = ambil(t, "Bergabung", "$^");

    var inisial = nama.split(/\s+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w[0]; }).join("").toUpperCase();

    // --- baca angka statistik ---
    var sTotal = cariStat("Total peminjaman");
    var sSelesai = cariStat("Buku selesai");
    var sWish = cariStat("Wishlist");
    if (!sTotal || !sSelesai || !sWish) { console.warn("Kartu statistik tidak ditemukan"); return; }

    // --- susun blok baru ---
    var blok = document.createElement("div");
    blok.innerHTML =
      '<div class="pf-card pf-head">' +
        '<div class="pf-avatar">' + esc(inisial) + '</div>' +
        '<div class="pf-info">' +
          '<h3 class="pf-nama">' + esc(nama) + '</h3>' +
          '<p class="pf-email">' + esc(email) + '</p>' +
          '<span class="pf-badge">' + esc(peran) + '</span>' +
        '</div>' +
        '<button class="pf-edit" type="button">' + IKON.pensil + ' Edit Profil</button>' +
      '</div>' +

      '<div class="pf-stats">' +
        '<div class="pf-card pf-stat"><div class="pf-ico ungu">' + IKON.buku + '</div><div>' +
          '<div class="pf-lab">Total Peminjaman</div><div class="pf-num">' + sTotal.angka + '</div>' +
          '<div class="pf-ket">Sejak ' + esc(gabung) + '</div></div></div>' +
        '<div class="pf-card pf-stat"><div class="pf-ico hijau">' + IKON.cek + '</div><div>' +
          '<div class="pf-lab">Buku Selesai</div><div class="pf-num">' + sSelesai.angka + '</div>' +
          '<div class="pf-ket">Sudah selesai dibaca</div></div></div>' +
        '<div class="pf-card pf-stat"><div class="pf-ico merah">' + IKON.hati + '</div><div>' +
          '<div class="pf-lab">Wishlist</div><div class="pf-num">' + sWish.angka + '</div>' +
          '<div class="pf-ket">Tersimpan untuk nanti</div></div></div>' +
      '</div>' +

      '<div class="pf-cols">' +
        '<div class="pf-card pf-box"><h3>Informasi Pribadi</h3>' +
          '<div class="pf-row"><span>Username</span><b>' + esc(username) + '</b></div>' +
          '<div class="pf-row"><span>Email</span><b>' + esc(email) + '</b></div>' +
          '<div class="pf-row"><span>Tanggal bergabung</span><b>' + esc(gabung) + '</b></div>' +
        '</div>' +
        '<div class="pf-card pf-box"><h3>Preferensi</h3>' +
          PREFERENSI.map(function (p) {
            return '<div class="pf-row"><span>' + p[0] + '</span><b>' + p[1] + '</b></div>';
          }).join("") +
        '</div>' +
      '</div>';

    blok.querySelector(".pf-edit").onclick = function () {
      alert("Fitur edit profil belum tersedia");
    };

    // --- pasang di tempat statistik lama, lalu sembunyikan yang lama ---
    var grid = sTotal.el.parentElement;
    if (!(grid.contains(sSelesai.el) && grid.contains(sWish.el))) grid = sTotal.el;

    grid.parentElement.insertBefore(blok, grid);
    grid.style.display = "none";
    judul.style.display = "none";
    kartuInfo.style.display = "none";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", jalan);
  } else {
    jalan();
  }
})();