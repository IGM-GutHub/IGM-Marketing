/* Draggable divider between the edit form and the live preview pane.
   - Drag to resize the split (persisted in localStorage)
   - Double-click to collapse/restore the preview
   Decap has no built-in resize; this positions a fixed overlay handle at the
   pane boundary rather than inserting nodes into React-managed containers. */
(function () {
  var KEY = "igm-admin-preview-pct";
  var COLLAPSED = 0.02; // effectively hidden, but keeps layout stable
  var handle = null;
  var panes = null;

  function findPanes() {
    // Decap's editor renders a react-split-pane whose resizer is disabled;
    // we size Pane1 directly and let Pane2 flex.
    if (!document.getElementById("preview-pane")) return null;
    var sp = document.querySelector(".SplitPane");
    if (!sp) return null;
    var left = sp.querySelector(":scope > .Pane1");
    var right = sp.querySelector(":scope > .Pane2");
    return left && right ? { container: sp, left: left, right: right } : null;
  }

  function getPct() {
    var v = parseFloat(localStorage.getItem(KEY));
    return isNaN(v) ? 0.5 : Math.min(Math.max(v, COLLAPSED), 0.85);
  }

  function apply(pct) {
    if (!panes) return;
    var leftPct = (1 - pct) * 100;
    panes.left.style.width = leftPct + "%";
    panes.left.style.flex = "0 0 auto";
    panes.right.style.flex = "1 1 0%";
    panes.right.style.minWidth = "0";
    panes.right.style.overflow = "hidden";
    position();
  }

  function position() {
    if (!handle || !panes) return;
    var r = panes.right.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) {
      handle.style.display = "none"; // preview hidden via the eye toggle
      return;
    }
    handle.style.display = "block";
    handle.style.left = r.left - 5 + "px";
    handle.style.top = r.top + "px";
    handle.style.height = r.height + "px";
  }

  function makeHandle() {
    handle = document.createElement("div");
    handle.title = "Drag to resize the preview · double-click to collapse";
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-label", "Resize preview pane");
    handle.style.cssText =
      "position:fixed;width:14px;z-index:2147483000;cursor:col-resize;" +
      "background:transparent;border-left:2px solid rgba(18,118,132,.4);" +
      "transition:background .12s ease,border-color .12s ease;";

    // visible grip: rounded teal tab with dots, vertically centered
    var grip = document.createElement("div");
    grip.style.cssText =
      "position:absolute;top:50%;left:-7px;transform:translateY(-50%);" +
      "width:16px;height:64px;border-radius:999px;background:#127684;" +
      "box-shadow:0 2px 8px rgba(11,26,44,.35);display:flex;flex-direction:column;" +
      "align-items:center;justify-content:center;gap:5px;pointer-events:none;" +
      "transition:transform .12s ease,background .12s ease;";
    for (var i = 0; i < 3; i++) {
      var dot = document.createElement("div");
      dot.style.cssText = "width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.9);";
      grip.appendChild(dot);
    }
    handle.appendChild(grip);

    handle.addEventListener("mouseenter", function () {
      handle.style.borderLeftColor = "rgba(18,118,132,.95)";
      handle.style.background = "rgba(18,118,132,.12)";
      grip.style.background = "#0e6b77";
      grip.style.transform = "translateY(-50%) scale(1.15)";
    });
    handle.addEventListener("mouseleave", function () {
      handle.style.borderLeftColor = "rgba(18,118,132,.4)";
      handle.style.background = "transparent";
      grip.style.background = "#127684";
      grip.style.transform = "translateY(-50%)";
    });

    var dragging = false;
    handle.addEventListener("mousedown", function (e) {
      e.preventDefault();
      dragging = true;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    });
    document.addEventListener("mousemove", function (e) {
      if (!dragging || !panes) return;
      var rect = panes.container.getBoundingClientRect();
      var pct = Math.min(Math.max((rect.right - e.clientX) / rect.width, COLLAPSED), 0.85);
      localStorage.setItem(KEY, String(pct));
      apply(pct);
    });
    document.addEventListener("mouseup", function () {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    });
    handle.addEventListener("dblclick", function () {
      var pct = getPct();
      if (pct > COLLAPSED + 0.01) {
        localStorage.setItem(KEY + "-restore", String(pct));
        localStorage.setItem(KEY, String(COLLAPSED));
      } else {
        var restore = parseFloat(localStorage.getItem(KEY + "-restore"));
        localStorage.setItem(KEY, String(isNaN(restore) ? 0.5 : restore));
      }
      apply(getPct());
    });
    document.body.appendChild(handle);
  }

  function tick() {
    var found = findPanes();
    if (found) {
      panes = found;
      if (!handle) makeHandle();
      apply(getPct()); // reapply each tick — React re-renders can reset inline widths
    } else if (handle) {
      handle.style.display = "none";
      panes = null;
    }
  }

  // The editor mounts/unmounts as routes change; poll cheaply + follow scroll/resize.
  setInterval(tick, 500);
  window.addEventListener("resize", position);
  document.addEventListener("scroll", position, true);
})();
