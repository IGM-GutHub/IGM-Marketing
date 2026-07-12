// Netlify Identity emails (invites, recovery, confirmation) link to the site
// root with a token in the hash. The Identity widget only loads on /admin/,
// so forward those tokens there.
(function () {
  var h = window.location.hash;
  if (h && /^#(invite_token|recovery_token|confirmation_token|email_change_token)=/.test(h)) {
    window.location.replace("/admin/" + h);
  }
})();
