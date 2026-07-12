/* Styled live previews for the Decap CMS editor.
   Renders entries with the site's real markup + main.css so the right-hand
   pane reads like the live website. Non-interactive by design. */
(function () {
  var h = window.h;
  var createClass = window.createClass;

  CMS.registerPreviewStyle(
    "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@600;700;800;900&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
  );
  CMS.registerPreviewStyle("/assets/css/main.css");
  CMS.registerPreviewStyle("body { background: #fff; } .page { box-shadow: none; }", { raw: true });

  function val(entry, path, fallback) {
    var v = entry.getIn(["data"].concat(path));
    return v === undefined || v === null || v === "" ? fallback || "" : v;
  }

  function items(entry, path) {
    var v = entry.getIn(["data"].concat(path));
    return v && v.toJS ? v.toJS() : [];
  }

  function img(getAsset, path) {
    return path ? String(getAsset(path)) : "";
  }

  function placeholder(label, extraClass) {
    return h(
      "div",
      { className: "img-placeholder " + (extraClass || "") },
      h("span", null, "[ " + label + " ]")
    );
  }

  function brandMark() {
    return h("span", { className: "brand__mark", "aria-hidden": "true" }, h("span"));
  }

  /* ---------- Site Settings ---------- */
  var SitePreview = createClass({
    render: function () {
      var e = this.props.entry;
      var getAsset = this.props.getAsset;
      var logo = img(getAsset, val(e, ["logo"]));
      var hero = img(getAsset, val(e, ["images", "hero"]));
      var stats = items(e, ["heroStats"]);
      var aboutStats = items(e, ["aboutStats"]);

      function photoCard(cls, label, src) {
        return h("div", { className: cls },
          src
            ? h("img", { className: "photo", src: src, style: { minHeight: "180px", maxHeight: "220px" } })
            : placeholder(label, ""),
          h("div", { className: "mono-label", style: { marginTop: "8px", textAlign: "center" } }, label));
      }

      var statNodes = [];
      stats.forEach(function (s, i) {
        if (i) statNodes.push(h("div", { className: "hero__divider", key: "d" + i }));
        statNodes.push(
          h("div", { key: "s" + i },
            h("div", { className: "hero__stat-value" }, s.value),
            h("div", { className: "hero__stat-label" }, s.label))
        );
      });

      return h("div", { className: "page" },
        h("div", { className: "topbar" },
          h("span", { className: "topbar__left" }, val(e, ["topbar", "left"])),
          h("span", { className: "topbar__status" },
            h("span", { className: "topbar__dot" }, "●"), " ",
            val(e, ["topbar", "status"]), " | ", val(e, ["contact", "phone"]))),
        h("header", { className: "nav" },
          h("span", { className: "brand" },
            logo ? h("img", { className: "brand__logo", src: logo }) : brandMark(),
            h("span", null,
              h("span", { className: "brand__name" }, val(e, ["name"])),
              h("br"),
              h("span", { className: "brand__tag" }, "Managed IT"))),
          h("span", { className: "btn btn--primary btn--sm" }, "Book a consult")),
        h("section", { className: "hero" },
          h("div", null,
            h("span", { className: "pill" }, val(e, ["hero", "pill"])),
            h("h1", { className: "display-1", style: { marginTop: "22px" } }, val(e, ["hero", "heading"])),
            h("p", { className: "lead", style: { marginTop: "22px" } }, val(e, ["hero", "lead"])),
            h("div", { className: "hero__actions" },
              h("span", { className: "btn btn--primary" }, "Book a free consult"),
              h("span", { className: "btn btn--outline" }, "Get a security assessment")),
            h("div", { className: "hero__stats" }, statNodes)),
          hero
            ? h("img", { className: "photo photo--hero", src: hero })
            : placeholder("hero photo — IT team / server room", "img-placeholder--hero")),
        h("section", { className: "stats-band" },
          aboutStats.map(function (s, i) {
            return h("div", { className: "stats-band__item", key: i },
              h("div", { className: "stats-band__value" }, s.value),
              h("div", { className: "stats-band__label" }, s.label));
          })),
        h("section", { className: "section section--mist pv-photos" },
          h("div", { className: "section-head" },
            h("p", { className: "eyebrow" }, "Photos used on other pages")),
          h("div", { className: "grid-3" },
            photoCard("pv-photo-aboutHero", "About page top photo", img(getAsset, val(e, ["images", "aboutHero"]))),
            photoCard("pv-photo-story", "About 'Our story' photo", img(getAsset, val(e, ["images", "story"]))),
            photoCard("pv-photo-map", "Contact page map image", img(getAsset, val(e, ["images", "map"]))))),
        h("section", { className: "contact-grid" },
          h("div", null,
            h("span", { className: "pill" }, "Book a consult"),
            h("div", { style: { display: "flex", flexDirection: "column", gap: "20px", marginTop: "28px" } },
              h("div", { className: "contact-item" },
                h("div", null,
                  h("div", { className: "contact-item__title" }, "Call us"),
                  h("div", { className: "contact-item__value" }, val(e, ["contact", "phone"])),
                  h("div", { className: "contact-item__note" }, val(e, ["contact", "hours"])))),
              h("div", { className: "contact-item" },
                h("div", null,
                  h("div", { className: "contact-item__title" }, "Email us"),
                  h("div", { className: "contact-item__value" }, val(e, ["contact", "email"])),
                  h("div", { className: "contact-item__note" }, val(e, ["contact", "emailNote"])))),
              h("div", { className: "contact-item" },
                h("div", null,
                  h("div", { className: "contact-item__title" }, "Visit us"),
                  h("div", { className: "contact-item__value" }, val(e, ["contact", "addressLine1"])),
                  h("div", { className: "contact-item__note" }, val(e, ["contact", "addressLine2"]))))),
            h("div", { className: "client-callout" },
              h("div", { className: "client-callout__head" },
                h("span", { className: "topbar__dot" }, "●"), " Existing client?"),
              h("p", null, "Reach the 24/7 help desk any time at ",
                h("strong", null, val(e, ["existingClient", "phone"])), " or ",
                val(e, ["existingClient", "email"]), ".")))),
        h("footer", { className: "footer" },
          h("div", null,
            h("div", { className: "footer__brand" },
              logo ? h("img", { className: "brand__logo", src: logo }) : brandMark(),
              h("strong", null, val(e, ["name"]))),
            h("p", { className: "footer__blurb" }, val(e, ["footerBlurb"]))),
          h("div", null,
            h("h2", null, "Contact"),
            h("ul", null,
              h("li", null, val(e, ["contact", "phone"])),
              h("li", null, val(e, ["contact", "email"])),
              h("li", null, val(e, ["contact", "city"]))))));
    },
  });

  /* ---------- Certifications ---------- */
  var CertsPreview = createClass({
    render: function () {
      var e = this.props.entry;
      return h("div", { className: "page" },
        h("section", { className: "badge-strip" },
          h("span", { className: "badge-strip__label" }, "Partners & certifications"),
          items(e, ["items"]).map(function (c, i) {
            return h("span", { className: "badge-strip__item", key: i }, c.name);
          })));
    },
  });

  /* ---------- Testimonials ---------- */
  var TestimonialsPreview = createClass({
    render: function () {
      var e = this.props.entry;
      return h("div", { className: "page" },
        h("section", { className: "section section--mist" },
          h("div", { className: "section-head" },
            h("p", { className: "eyebrow" }, "Client stories"),
            h("h2", { className: "display-2" }, "Trusted by teams who can't go dark")),
          h("div", { className: "grid-2" },
            items(e, ["items"]).map(function (t, i) {
              return h("figure", { className: "quote-card", key: i },
                h("blockquote", null, h("p", null, "“" + (t.quote || "") + "”")),
                h("figcaption", null,
                  h("div", { className: "quote-card__avatar" }),
                  h("div", null,
                    h("div", { className: "quote-card__name" }, t.name),
                    h("div", { className: "quote-card__role" }, t.role))));
            }))));
    },
  });

  /* ---------- Industries ---------- */
  var IndustriesPreview = createClass({
    render: function () {
      var e = this.props.entry;
      var list = items(e, ["items"]);
      var cls = "grid-industries" + (list.length <= 4 ? " grid-industries--" + list.length : "");
      return h("div", { className: "page" },
        h("section", { className: "section section--navy" },
          h("div", { className: "section-head" },
            h("p", { className: "eyebrow eyebrow--light" }, "Who we serve"),
            h("h2", { className: "display-2" }, "Built for industries that can't afford to fail an audit")),
          h("div", { className: cls },
            list.map(function (ind, i) {
              var n = i + 1;
              return h("div", { className: "industry-card", key: i },
                h("div", { className: "industry-card__index" }, (n < 10 ? "0" : "") + n + " / " + (ind.label || "")),
                h("h3", null, ind.title),
                h("p", null, ind.body));
            }))));
    },
  });

  /* ---------- Team ---------- */
  var TeamPreview = createClass({
    render: function () {
      var e = this.props.entry;
      var getAsset = this.props.getAsset;
      return h("div", { className: "page" },
        h("section", { className: "section" },
          h("div", { className: "section-head" },
            h("p", { className: "eyebrow" }, "Leadership"),
            h("h2", { className: "display-2" }, "The people behind your peace of mind")),
          h("div", { className: "grid-4" },
            items(e, ["items"]).map(function (p, i) {
              var photo = img(getAsset, p.photo);
              return h("div", { className: "team-card", key: i },
                h("div", { className: "team-card__photo" },
                  photo ? h("img", { src: photo }) : null),
                h("div", { className: "team-card__body" },
                  h("div", { className: "team-card__name" }, p.name),
                  h("div", { className: "team-card__role" }, p.role),
                  h("p", { className: "team-card__bio" }, p.bio)));
            }))));
    },
  });

  /* ---------- Services ---------- */
  var ServicesPreview = createClass({
    render: function () {
      var e = this.props.entry;
      var getAsset = this.props.getAsset;
      var list = items(e, ["items"]);
      return h("div", { className: "page" },
        h("nav", { className: "chip-row", style: { paddingTop: "24px" } },
          list.map(function (s, i) {
            return h("span", { className: "chip", key: i }, s.chip);
          })),
        list.map(function (s, i) {
          var photo = img(getAsset, s.image);
          var flip = (i + 1) % 2 === 0;
          return h("section", { className: "split" + (flip ? " split--mist split--flip" : ""), key: i },
            h("div", null,
              h("p", { className: "split__index" }, s.index),
              h("h2", null, s.heading),
              h("p", { className: "body-copy" }, s.body),
              h("ul", { className: "feature-list" },
                (s.features || []).map(function (f, j) {
                  return h("li", { key: j }, f);
                }))),
            photo
              ? h("img", { className: "photo", src: photo })
              : placeholder("image — " + (s.imageLabel || "")));
        }));
    },
  });

  CMS.registerPreviewTemplate("site", SitePreview);
  CMS.registerPreviewTemplate("certifications", CertsPreview);
  CMS.registerPreviewTemplate("testimonials", TestimonialsPreview);
  CMS.registerPreviewTemplate("industries", IndustriesPreview);
  CMS.registerPreviewTemplate("team", TeamPreview);
  CMS.registerPreviewTemplate("services", ServicesPreview);
})();
