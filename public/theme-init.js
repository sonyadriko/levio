// Skrip inisialisasi tema & migrasi kunci localStorage lama.
// Dipindahkan dari inline <script> di layout ke file eksternal agar CSP
// ketat (`script-src 'self'`) bisa diaktifkan.
(function () {
  try {
    var pairs = [
      ["leveling.locale.v1", "levio.locale.v1"],
      ["leveling.settings.v1", "levio.settings.v1"],
      ["leveling.reminder.v1", "levio.reminder.v1"],
      ["leveling.progress.v1", "levio.progress.v1"],
      ["leveling.syncbanner.dismissed.v1", "levio.syncbanner.dismissed.v1"],
    ];
    for (var i = 0; i < pairs.length; i++) {
      var legacy = pairs[i][0];
      var current = pairs[i][1];
      if (localStorage.getItem(current) === null) {
        var value = localStorage.getItem(legacy);
        if (value !== null) localStorage.setItem(current, value);
      }
    }
  } catch {
  }
})();

(function () {
  try {
    var raw = localStorage.getItem("levio.settings.v1");
    if (raw === null) raw = localStorage.getItem("leveling.settings.v1");
    var mode = "auto";
    if (raw) {
      var p = JSON.parse(raw);
      if (p && (p.theme === "light" || p.theme === "dark" || p.theme === "auto")) {
        mode = p.theme;
      }
    }
    var dark =
      mode === "dark" ||
      (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
