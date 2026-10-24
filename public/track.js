(function () {
  "use strict";

  var toggle = document.getElementById("ntoggle");
  var list = document.getElementById("nl");
  if (toggle && list) {
    toggle.addEventListener("click", function () {
      var open = list.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  window.paycore = window.paycore || { events: [] };

  function fire(name, detail) {
    if (!name) return;
    if (name === "fee_paid" && document.body.getAttribute("data-fee-payments") !== "on") return;
    var evt = { name: name, detail: detail || {}, at: Date.now() };
    window.paycore.events.push(evt);
    document.dispatchEvent(new CustomEvent("paycore:event", { detail: evt }));
    var node = document.createElement("div");
    node.setAttribute("data-paycore-fired", name);
    node.hidden = true;
    document.body.appendChild(node);
  }

  var path = document.body.getAttribute("data-paycore-path") || location.pathname;
  var primary = document.body.getAttribute("data-paycore-event");
  if (primary) fire(primary, { path: path });
  var extra = document.body.getAttribute("data-paycore-also") || "";
  extra.split(/\s+/).forEach(function (name) {
    if (name) fire(name, { path: path });
  });
  var vertical = document.body.getAttribute("data-paycore-vertical");
  if (vertical) fire("vertical_chosen", { path: path, vertical: vertical });
})();
