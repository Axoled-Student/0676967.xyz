(function () {
  "use strict";

  var DATA_URL = "media/bad-apple.gz.txt"; // gzip 後再 base64 的文字影格
  var FPS = 10;
  var COLS = 100;
  var ROWS = 75;
  var BASE_FONT = 16; // 以固定字級排版，再用 scale 縮放，避免瀏覽器的最小字級限制

  var screen = document.getElementById("screen");
  var pre = document.getElementById("frame");
  var msg = document.getElementById("screen-msg");
  if (!screen || !pre || !msg) return;

  var frames = null;
  var userPaused = false; // 一律自動播放，只有使用者點一下才會暫停
  var inView = true;
  var running = false;
  var offset = 0; // 暫停時的播放位置（秒）
  var startedAt = 0;
  var lastIndex = -1;
  var rafId = 0;
  var charW = BASE_FONT * 0.6;

  /* ---------- 版面：讓 100×75 的字元剛好塞進畫面 ---------- */
  function measure() {
    var probe = document.createElement("span");
    probe.textContent = new Array(101).join("M");
    probe.style.cssText =
      "position:absolute;visibility:hidden;white-space:pre;letter-spacing:0;" +
      "font-size:" + BASE_FONT + "px;font-family:" + getComputedStyle(pre).fontFamily;
    document.body.appendChild(probe);
    charW = probe.getBoundingClientRect().width / 100;
    document.body.removeChild(probe);

    // 一格字元做成正方形，畫面才不會被拉長
    pre.style.lineHeight = charW + "px";
    pre.style.width = COLS * charW + "px";
    pre.style.height = ROWS * charW + "px";
  }

  function fit() {
    var scale = Math.min(
      screen.clientWidth / (COLS * charW),
      screen.clientHeight / (ROWS * charW)
    );
    pre.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
  }

  /* ---------- 資料載入 ---------- */
  function base64ToBytes(b64) {
    var bin = atob(b64.replace(/\s+/g, ""));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function load() {
    return fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (b64) {
        var stream = new Blob([base64ToBytes(b64)]).stream().pipeThrough(new DecompressionStream("gzip"));
        return new Response(stream).text();
      })
      .then(function (text) {
        return trimBlank(text.split("\f"));
      });
  }

  // 片頭片尾有幾秒全黑；自動開播和循環時跳過，一打開就有畫面
  function trimBlank(all) {
    var start = 0;
    var end = all.length - 1;
    while (start < end && !/\S/.test(all[start])) start++;
    while (end > start && !/\S/.test(all[end])) end--;
    return all.slice(start, end + 1);
  }

  /* ---------- 播放 ---------- */
  function duration() {
    return frames.length / FPS;
  }

  function position() {
    var pos = running ? offset + (performance.now() - startedAt) / 1000 : offset;
    return pos % duration(); // 播完自動從頭循環
  }

  function draw(pos) {
    var i = Math.floor(pos * FPS) % frames.length;
    if (i === lastIndex) return;
    lastIndex = i;
    pre.textContent = frames[i];
  }

  function loop() {
    if (!running) return;
    draw(position());
    rafId = requestAnimationFrame(loop);
  }

  function showMessage(text) {
    msg.textContent = text;
    msg.hidden = !text;
  }

  // 只有「資料好了、使用者沒按暫停、畫面看得到、分頁在前景」才會跑，其餘情況停下來省電
  function sync() {
    var shouldRun = frames !== null && !userPaused && inView && !document.hidden;
    if (shouldRun && !running) {
      startedAt = performance.now();
      running = true;
      rafId = requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      offset = position();
      running = false;
      cancelAnimationFrame(rafId);
    }
    if (frames) showMessage(userPaused ? "已暫停・點一下繼續" : "");
  }

  function toggle() {
    if (!frames) return;
    userPaused = !userPaused;
    sync();
  }

  screen.addEventListener("click", toggle);
  screen.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });

  document.addEventListener("visibilitychange", sync);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    }).observe(screen);
  }

  /* ---------- 初始化 ---------- */
  measure();
  fit();
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(screen);
  else window.addEventListener("resize", fit);

  showMessage("載入中…");
  load().then(
    function (loaded) {
      frames = loaded;
      sync();
    },
    function () {
      showMessage("畫面載入失敗，重新整理再試一次");
    }
  );
})();
