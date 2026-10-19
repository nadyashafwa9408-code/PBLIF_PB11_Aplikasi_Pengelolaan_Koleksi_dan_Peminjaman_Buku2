document.addEventListener("DOMContentLoaded", function () {
  // --- cari elemen-elemen banner lama lewat teksnya ---
  var sapaan = Array.from(document.querySelectorAll("p, span, div, h4, h5, h6"))
    .find(function (el) {
      return el.children.length === 0 &&
             el.textContent.trim().toUpperCase().startsWith("SELAMAT DATANG");
    });
  var judul = Array.from(document.querySelectorAll("h1, h2, h3"))
    .find(function (el) { return el.textContent.includes("Baca lebih banyak"); });
  var sub = Array.from(document.querySelectorAll("p, span, div"))
    .find(function (el) {
      return el.children.length === 0 &&
             el.textContent.trim().startsWith("Temukan novel");
    });
  var tombol = Array.from(document.querySelectorAll("a, button"))
    .find(function (el) { return el.textContent.includes("Jelajahi Koleksi"); });

  if (!sapaan || !judul || !sub || !tombol) {
    console.warn("Elemen banner tidak lengkap", { sapaan, judul, sub, tombol });
    return;
  }
  var els = [sapaan, judul, sub, tombol];

  // --- tentukan pembungkus banner ---
  var banner = els[0].parentElement;
  while (banner && !els.every(function (e) { return banner.contains(e); })) {
    banner = banner.parentElement;
  }

  // kalau pembungkusnya terlalu besar (ikut memuat kategori), buat pembungkus baru
  if (banner.textContent.includes("Kategori pilihan") || banner === document.body) {
    var kids = Array.from(banner.children);
    var idx = els.map(function (e) {
      return kids.findIndex(function (k) { return k.contains(e); });
    });
    var from = Math.min.apply(null, idx);
    var to = Math.max.apply(null, idx);
    var sec = document.createElement("section");
    banner.insertBefore(sec, kids[from]);
    kids.slice(from, to + 1).forEach(function (k) { sec.appendChild(k); });
    banner = sec;
  }

  if (banner.classList.contains("bn-banner")) return; // jangan jalan dua kali

  // --- beri class ---
  banner.classList.add("bn-banner");
  sapaan.classList.add("bn-sapaan");
  judul.classList.add("bn-judul");
  sub.classList.add("bn-sub");
  tombol.classList.add("bn-btn");

  // judul pecah jadi dua baris
  judul.innerHTML = judul.innerHTML.replace(/banyak,\s*/, "banyak,<br>");

  // --- bungkus teks di sisi kiri ---
  var teks = document.createElement("div");
  teks.className = "bn-teks";
  banner.insertBefore(teks, banner.firstChild);
  els.forEach(function (e) { teks.appendChild(e); });

  // --- tambahkan ilustrasi di sisi kanan ---
  var gambar = document.createElement("div");
  gambar.className = "bn-gambar";
  gambar.innerHTML =
    '<svg viewBox="0 0 250 175" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block" aria-hidden="true">' +
      '<ellipse cx="31" cy="46" rx="17" ry="35" transform="rotate(12 31 46)" fill="#5E9A74"/>' +
      '<ellipse cx="86" cy="70" rx="33" ry="13" transform="rotate(35 86 70)" fill="#5E9A74"/>' +
      '<polygon points="22,167 91,167 75,121 37,121" fill="#8A82DB"/>' +
      '<rect x="107" y="55" width="43" height="112" rx="5" fill="#6460D6" transform="rotate(-3 128 167)"/>' +
      '<rect x="153" y="33" width="40" height="134" rx="5" fill="#F4998A"/>' +
      '<rect x="190" y="73" width="42" height="94" rx="5" fill="#D9B55F" transform="rotate(6 211 167)"/>' +
    '</svg>';
  banner.appendChild(gambar);
});