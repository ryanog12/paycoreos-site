/* PaycoreOS — shared site behaviour */
(function () {
  'use strict';

  // --- mobile menu toggle ---
  var toggle = document.getElementById('ntoggle');
  var list = document.getElementById('nl');
  if (toggle && list) {
    toggle.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // --- staggered fade-in on load ---
  function reveal() {
    var items = document.querySelectorAll('.fi:not(.v)');
    Array.prototype.forEach.call(items, function (el, i) {
      setTimeout(function () { el.classList.add('v'); }, i * 55);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal);
  } else {
    reveal();
  }

  // --- form buttons (placeholder until a backend is wired up) ---
  function feedback(id, sentText, resetText) {
    var b = document.getElementById(id);
    if (!b) return;
    b.addEventListener('click', function () {
      b.textContent = sentText;
      b.style.background = 'var(--green-l)';
      setTimeout(function () {
        b.textContent = resetText;
        b.style.background = '';
      }, 3000);
    });
  }
  feedback('sendBtn', '\u2713 Message Sent!', 'Send Message');
  feedback('submitBtn', '\u2713 Application Submitted!', 'Submit Application');
})();
