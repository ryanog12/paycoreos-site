(function () {
  "use strict";

  var form = document.getElementById("application-form");
  if (!form) return;

  var started = false;
  form.addEventListener("focusin", function () {
    if (started || !window.paycore) return;
    started = true;
    var path = document.body.getAttribute("data-paycore-path") || location.pathname;
    var evt = { name: "application_started", detail: { path: path }, at: Date.now() };
    window.paycore.events.push(evt);
    document.dispatchEvent(new CustomEvent("paycore:event", { detail: evt }));
    var node = document.createElement("div");
    node.setAttribute("data-paycore-fired", "application_started");
    node.hidden = true;
    document.body.appendChild(node);
  });

  function valueOf(key) {
    var nodes = form.querySelectorAll('[name="f_' + key + '"]');
    if (!nodes.length) return "";
    if (nodes[0].type === "checkbox" && nodes.length > 1) {
      return Array.prototype.filter.call(nodes, function (n) { return n.checked; }).map(function (n) { return n.value; }).join(",");
    }
    if (nodes[0].type === "radio") {
      var picked = Array.prototype.find.call(nodes, function (n) { return n.checked; });
      return picked ? picked.value : "";
    }
    if (nodes[0].type === "checkbox") return nodes[0].checked ? "yes" : "no";
    return nodes[0].value || "";
  }

  function match(cond) {
    if (!cond) return true;
    if (cond.any) return cond.any.some(match);
    if (cond.all) {
      return cond.all.every(function (rule) { return valueOf(rule.key) === rule.equals; });
    }
    return true;
  }

  function applyConditions() {
    var blocks = form.querySelectorAll("[data-condition]");
    Array.prototype.forEach.call(blocks, function (block) {
      var cond = {};
      try { cond = JSON.parse(block.getAttribute("data-condition") || "{}"); } catch (e) { cond = {}; }
      var on = match(cond);
      block.hidden = !on;
      Array.prototype.forEach.call(block.querySelectorAll("input, select, textarea"), function (input) {
        input.disabled = !on;
      });
    });
  }

  form.addEventListener("change", applyConditions);
  applyConditions();
})();