(function () {
  "use strict";

  var root = document.documentElement;
  var TZ = "Asia/Taipei";

  /* ---------- 深色／淺色模式 ---------- */
  var toggle = document.getElementById("theme-toggle");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.dataset.theme || (darkQuery.matches ? "dark" : "light");
  }

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });

  /* ---------- 台北時間與問候語 ---------- */
  var clockEl = document.getElementById("clock");
  var dateEl = document.getElementById("date");
  var greetingEl = document.getElementById("greeting");

  var timeFmt = new Intl.DateTimeFormat("zh-TW", {
    timeZone: TZ,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  var dateFmt = new Intl.DateTimeFormat("zh-TW", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
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

  var lastDate = "";

  function tick() {
    var now = new Date();
    clockEl.textContent = timeFmt.format(now);

    var dateText = dateFmt.format(now);
    if (dateText !== lastDate) {
      lastDate = dateText;
      dateEl.textContent = dateText;
      greetingEl.textContent =
        greetingFor(parseInt(hourFmt.format(now), 10)) + "，歡迎光臨";
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
