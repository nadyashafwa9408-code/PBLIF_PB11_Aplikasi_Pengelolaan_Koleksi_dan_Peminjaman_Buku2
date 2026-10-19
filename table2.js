(function () {
  // CSS dipasang lewat JS, jadi tidak bergantung pada style.css
  var css = `
  .bt-wrap{display:flex;align-items:center;gap:14px}
  .bt-cover{position:relative;flex-shrink:0;width:40px;height:52px;border-radius:6px;overflow:hidden}
  .bt-cover::after{content:"";position:absolute;top:28%;left:22%;width:56%;aspect-ratio:1;
    border:1px solid rgba(255,255,255,.7);transform:rotate(25deg)}
  .bt-teks{display:flex;flex-direction:column;gap:3px}
  .bt-teks b,.bt-teks strong{display:block;margin:0;font-size:11px;color:#1B1B3A}
  .bt-teks small,.bt-teks span{display:block;margin:0;font-size:10px;color:#8A8AA3}
  `;

  var warna = [
    ["#C0624F", "#E39A6B"], ["#3F6E9A", "#5E8DB5"], ["#D07A5A", "#DDA070"],
    ["#6B55B5", "#8E7FD6"], ["#3E8A78", "#7BAE6B"], ["#B5654F", "#D4A24E"]
  ];

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function pasangCSS() {
    if (document.getElementById("bt-style")) return;
    var st = document.createElement("style");
    st.id = "bt-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function tambahCover() {
    pasangCSS();
    document.querySelectorAll("table").forEach(function (tbl) {
      var ths = Array.from(tbl.querySelectorAll("th"));
      var idx = ths.findIndex(function (th) {
        return /^judul buku$/i.test(th.textContent.trim());
      });
      if (idx < 0) return; // bukan tabel peminjaman/riwayat

      tbl.querySelectorAll("tr").forEach(function (tr) {
        var tds = Array.from(tr.children).filter(function (c) { return c.tagName === "TD"; });
        var td = tds[idx];
        if (!td || td.dataset.cover) return;
        td.dataset.cover = "1";

        // judul = baris pertama teks di sel itu
        var judul = td.innerText.split("\n")[0].trim();
        var c = warna[hash(judul) % warna.length];

        var wrap = document.createElement("div");
        wrap.className = "bt-wrap";

        var cover = document.createElement("div");
        cover.className = "bt-cover";
        cover.style.background = "linear-gradient(135deg," + c[0] + "," + c[1] + ")";

        var teks = document.createElement("div");
        teks.className = "bt-teks";
        while (td.firstChild) teks.appendChild(td.firstChild);

        wrap.appendChild(cover);
        wrap.appendChild(teks);
        td.appendChild(wrap);
      });
    });
  }

  // tabel digambar ulang saat filter diklik atau tombol Setujui ditekan
  new MutationObserver(tambahCover).observe(document.body, { childList: true, subtree: true });
  tambahCover();
})();