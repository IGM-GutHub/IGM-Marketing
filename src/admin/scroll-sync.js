/* Click a field in the edit form → the live preview scrolls to that section
   and flashes a highlight, so you never hunt for what you're editing.
   Field labels (configured in config.yml) map to selectors in the preview
   templates; list-item clicks resolve to the matching card (nth). */
(function () {
  // [label prefix (lowercase), preview selector] — innermost matching label wins
  var MAP = [
    // Site Settings
    ["badge text", ".hero .pill"],
    ["headline", ".hero h1"],
    ["paragraph", ".hero .lead"],
    ["homepage hero text", ".hero"],
    ["homepage hero stats", ".hero__stats"],
    ["homepage hero photo", ".photo--hero, .img-placeholder--hero"],
    ["site photos", ".photo--hero, .img-placeholder--hero"],
    ["top bar", ".topbar"],
    ["contact info", ".contact-item"],
    ["existing-client", ".client-callout"],
    ["about page stats", ".stats-band"],
    ["footer blurb", ".footer"],
    ["logo", ".brand"],
    ["company short name", ".brand"],
    ["legal name", ".footer"],
    // Content collections
    ["certifications", ".badge-strip__item"],
    ["testimonials", ".quote-card"],
    ["industries", ".industry-card"],
    ["team members", ".team-card"],
    ["services", ".split"],
  ];

  var lastFlash = null;

  function mapFor(text) {
    text = text.trim().toLowerCase();
    for (var i = 0; i < MAP.length; i++) {
      if (text.indexOf(MAP[i][0]) === 0) return MAP[i][1];
    }
    return null;
  }

  function ownLabel(node) {
    var l = node.querySelector('[class*="FieldLabel"]');
    if (!l) return null;
    var depth = 0;
    var n = l;
    while (n && n !== node && depth <= 3) {
      n = n.parentElement;
      depth++;
    }
    return n === node ? l.textContent : null;
  }

  function listIndex(node) {
    if (String(node.className).indexOf("SortableListItem") === -1) return -1;
    var idx = 0;
    var sib = node.previousElementSibling;
    while (sib) {
      if (String(sib.className).indexOf("SortableListItem") !== -1) idx++;
      sib = sib.previousElementSibling;
    }
    return idx;
  }

  function flash(el, doc) {
    if (lastFlash) {
      lastFlash.el.style.outline = lastFlash.prev;
      clearTimeout(lastFlash.timer);
    }
    var prev = el.style.outline;
    el.style.outline = "3px solid #1a8f9e";
    el.style.outlineOffset = "3px";
    lastFlash = {
      el: el,
      prev: prev,
      timer: setTimeout(function () {
        el.style.outline = prev;
        el.style.outlineOffset = "";
        lastFlash = null;
      }, 1500),
    };
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    void doc; // doc reserved for future use
  }

  document.addEventListener("click", function (e) {
    var pane1 = document.querySelector(".Pane1");
    var frame = document.getElementById("preview-pane");
    if (!pane1 || !frame || !frame.contentDocument) return;
    if (!pane1.contains(e.target)) return;

    var indexes = [];
    var node = e.target;
    var sel = null;
    while (node && node !== pane1) {
      var li = listIndex(node);
      if (li >= 0) indexes.push(li);
      var label = ownLabel(node);
      if (label) {
        sel = mapFor(label);
        if (sel) break;
      }
      node = node.parentElement;
    }
    if (!sel) return;

    var doc = frame.contentDocument;
    var els = doc.querySelectorAll(sel);
    if (!els.length) return;
    // outermost recorded list index = the top-level item (e.g. 3rd testimonial)
    var idx = indexes.length ? indexes[indexes.length - 1] : 0;
    flash(els[Math.min(idx, els.length - 1)], doc);
  });
})();
