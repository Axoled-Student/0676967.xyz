(function () {
  "use strict";

  var TZ = "Asia/Taipei";

  /* ---------- 台北時間與問候語 ---------- */
  var clockEl = document.getElementById("clock");
  var greetingEl = document.getElementById("greeting");

  var timeFmt = new Intl.DateTimeFormat("zh-TW", {
    timeZone: TZ,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  var hourFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    hour: "numeric",
  });

  function greetingFor(hour) {
    if (hour >= 5 && hour < 11) return "早安";
    if (hour >= 11 && hour < 18) return "午安";
    if (hour >= 18) return "晚安";
    return "夜深了";
  }

  var lastHour = -1;

  function tick() {
    var now = new Date();
    clockEl.textContent = timeFmt.format(now);

    var hour = parseInt(hourFmt.format(now), 10);
    if (hour !== lastHour) {
      lastHour = hour;
      greetingEl.textContent = greetingFor(hour) + "，歡迎光臨";
    }
  }

  tick();
  setInterval(tick, 1000);

  /* ---------- 捲動進場 ---------- */
  var items = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    items.forEach(function (el) {
      el.classList.add("in");
    });
  }
})();
