(function () {
  var warna = [
    ["#C0624F", "#E39A6B"],
    ["#3F6E9A", "#5E8DB5"],
    ["#D07A5A", "#DDA070"],
    ["#6B55B5", "#8E7FD6"],
    ["#3E8A78", "#7BAE6B"],
    ["#B5654F", "#D4A24E"]
  ];

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function tambahCover() {
    document.querySelectorAll(".scroll table").forEach(function (tbl) {
      var th = tbl.querySelector("th");
      // hanya tabel yang kolom pertamanya "JUDUL BUKU" (bukan tabel admin)
      if (!th || !/judul buku/i.test(th.textContent)) return;

      tbl.querySelectorAll("tr").forEach(function (tr) {
        var td = tr.querySelector("td");
        if (!td || td.dataset.cover) return;
        td.dataset.cover = "1";

        var judul = td.textContent.trim();
        var c = warna[hash(judul) % warna.length];

        var wrap = document.createElement("div");
        wrap.className = "bt-wrap";

        var cover = document.createElement("div");
        cover.className = "bt-cover";
        cover.style.background =
          "linear-gradient(135deg," + c[0] + "," + c[1] + ")";

        var teks = document.createElement("div");
        teks.className = "bt-teks";
        while (td.firstChild) teks.appendChild(td.firstChild);

        wrap.appendChild(cover);
        wrap.appendChild(teks);
        td.appendChild(wrap);
      });
    });
  }

  // tabel digambar ulang saat tombol filter diklik, jadi pantau perubahan halaman
  new MutationObserver(tambahCover).observe(document.body, {
    childList: true,
    subtree: true
  });
  tambahCover();
})();