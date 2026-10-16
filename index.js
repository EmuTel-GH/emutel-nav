"use client";

// The EmuTel staff sidebar, shared by every staff app (tickets, projects, billing, the sales
// console). One component and one stylesheet (nav.css), so the apps look and behave the same
// whatever each one uses for its own pages (Tailwind 3, Tailwind 4, plain CSS). Each app only
// supplies its own sections; everything else here is common.
//
// Written without JSX on purpose: plain JS needs no build step and no transpile settings in the
// apps that import it.

import { createElement as h, Fragment, useEffect, useRef, useState } from "react";
import NextLink from "next/link";

// ─── icons (lucide paths, inlined so the package needs no icon library) ──────────────────────────

function svg(size, children, extra) {
  return h("svg", {
    xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": true, ...extra,
  }, ...children);
}
const p = (d) => h("path", { key: d, d });
const ICONS = {
  chevronsLeft: [p("m11 17-5-5 5-5"), p("m18 17-5-5 5-5")],
  chevronsRight: [p("m6 17 5-5-5-5"), p("m13 17 5-5-5-5")],
  chevronLeft: [p("m15 18-6-6 6-6")],
  sun: [h("circle", { key: "c", cx: 12, cy: 12, r: 4 }), p("M12 2v2"), p("M12 20v2"), p("m4.93 4.93 1.41 1.41"), p("m17.66 17.66 1.41 1.41"), p("M2 12h2"), p("M20 12h2"), p("m6.34 17.66-1.41 1.41"), p("m19.07 4.93-1.41 1.41")],
  moon: [p("M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z")],
  menu: [p("M4 6h16"), p("M4 12h16"), p("M4 18h16")],
  x: [p("M18 6 6 18"), p("m6 6 12 12")],
  external: [p("M15 3h6v6"), p("M10 14 21 3"), p("M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6")],
  lifeBuoy: [h("circle", { key: "a", cx: 12, cy: 12, r: 10 }), h("circle", { key: "b", cx: 12, cy: 12, r: 4 }), p("m4.93 4.93 4.24 4.24"), p("m14.83 9.17 4.24-4.24"), p("m14.83 14.83 4.24 4.24"), p("m9.17 14.83-4.24 4.24")],
  folderKanban: [p("M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"), p("M8 10v4"), p("M12 10v2"), p("M16 10v6")],
  dollar: [p("M12 2v20"), p("M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6")],
  trendingUp: [p("M22 7 13.5 15.5 8.5 10.5 2 17"), p("M16 7h6v6")],
  grid: [h("rect", { key: 1, x: 3, y: 3, width: 7, height: 7, rx: 1 }), h("rect", { key: 2, x: 14, y: 3, width: 7, height: 7, rx: 1 }), h("rect", { key: 3, x: 14, y: 14, width: 7, height: 7, rx: 1 }), h("rect", { key: 4, x: 3, y: 14, width: 7, height: 7, rx: 1 })],
};
const icon = (name, size = 18, extra) => svg(size, ICONS[name], extra);

// ─── the app switcher list ───────────────────────────────────────────────────────────────────────
// The main staff apps, in the order people move between them. Pass `apps` to override (a demo or
// reseller instance passes [] so our estate is never shown on someone else's console). The full
// catalogue lives in core (/api/v1/admin/nav) and appears under "All tools".
export const EMUTEL_APPS = [
  { key: "tickets", label: "Tickets", href: "https://tickets.emutel.net/tickets", icon: "lifeBuoy" },
  { key: "projects", label: "Projects", href: "https://projects.emutel.net/", icon: "folderKanban" },
  { key: "billing", label: "Billing", href: "https://billing.emutel.net/", icon: "dollar" },
  { key: "sales", label: "Sales", href: "https://sales.emutel.com.au/", icon: "trendingUp" },
];
const ALL_TOOLS_URL = "https://admin.emutel.net/";

export function initials(name) {
  const parts = String(name || "").trim().split(/[\s@.]+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
}

// An icon may be a component (lucide-react and friends: a function or a forwardRef object), a
// built-in name from ICONS, or anything renderable (an element, an emoji, a character).
function renderIcon(ic, size = 18) {
  if (!ic) return null;
  if (typeof ic === "string" && ICONS[ic]) return icon(ic, size);
  if (typeof ic === "function" || (typeof ic === "object" && ic.$$typeof && ic.render)) {
    return h(ic, { size, strokeWidth: 1.75, "aria-hidden": true });
  }
  return h("span", { className: "emn-glyph", "aria-hidden": true }, ic);
}

function Wordmark({ mark }) {
  const text = (mark && String(mark.text || "").trim()) || "emutel";
  const at = mark ? Number(mark.accentIndex) : 3;
  if (!(at >= 0 && at < text.length)) return h(Fragment, null, text);
  return h(Fragment, null, text.slice(0, at), h("span", { className: "emn-accent" }, text[at]), text.slice(at + 1));
}

const COUNT_TONE = { gold: "emn-count-gold", danger: "emn-count-danger", muted: "" };

// ─── phone top bar ───────────────────────────────────────────────────────────────────────────────
// Shown under 768px only. back = { href, label } swaps the wordmark for a back link; reserveRight
// leaves room for something floating top-right (the helpdesk's notification bell).
export function EmutelMobileBar({ product, wordmark, onMenu, back = null, reserveRight = false, linkComponent }) {
  const L = linkComponent || NextLink;
  return h("div", { className: "emn-mobilebar" + (reserveRight ? " emn-reserve" : "") },
    h("button", { type: "button", className: "emn-iconbtn", onClick: onMenu, "aria-label": "Open menu" }, icon("menu", 20)),
    back
      ? h(L, { href: back.href, className: "emn-back" }, icon("chevronLeft", 18), " ", back.label)
      : h("span", { className: "emn-mb-brand" }, h(Wordmark, { mark: wordmark }),
          product ? h("span", { className: "emn-mb-product" }, product) : null),
  );
}

// ─── the sidebar ─────────────────────────────────────────────────────────────────────────────────
//
// sections: [{ key?, header?, headerIcon?, gold?, items: [item] }]
// item:     { key, label, icon, href? | onClick?, external?, active?, title?, count?, countTone?,
//             trailing?, children?: [{ key, label, href, active? }] }
//   href = an in-app route (client-side link); external = open in a new tab; onClick = a button.
//   children show indented under the item while it is active and the sidebar is expanded.
export default function EmutelSidebar({
  app, product, wordmark, logo = "/emutel-icon.png", homeHref = "/",
  sections = [], footer = [], footerSlot = null, user = null, online = false,
  collapsed = false, onToggleCollapse, dark = false, onToggleDark,
  mobileOpen = false, onMobileClose = () => {},
  apps = EMUTEL_APPS, catalogue = null, allToolsHref = ALL_TOOLS_URL, linkComponent,
}) {
  const L = linkComponent || NextLink;
  const c = collapsed && !mobileOpen; // the phone drawer is always full width
  const [panel, setPanel] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panel && !mobileOpen) return;
    function onKey(e) { if (e.key === "Escape") { setPanel(false); onMobileClose(); } }
    function onDoc(e) { if (panel && panelRef.current && !panelRef.current.contains(e.target)) setPanel(false); }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDoc); };
  }, [panel, mobileOpen, onMobileClose]);

  function Item({ v, sub = false }) {
    const cls = "emn-item" + (sub ? " emn-sub" : "") + (v.active ? " emn-on" : "");
    const title = v.title || (c ? v.label : undefined);
    const tone = COUNT_TONE[v.countTone] || "";
    const body = [
      sub ? null : h("span", { key: "i", className: "emn-ico" }, renderIcon(v.icon)),
      c && !sub ? null : h("span", { key: "l", className: "emn-lbl" }, v.label),
      !c && v.count > 0 ? h("span", { key: "n", className: "emn-count " + tone }, v.count) : null,
      !c && v.trailing ? h("span", { key: "t", className: "emn-trail" }, v.trailing) : null,
      !c && v.external ? h("span", { key: "x", className: "emn-out" }, icon("external", 13)) : null,
      c && v.count > 0 ? h("span", { key: "b", className: "emn-badge " + tone }, v.count) : null,
    ];
    const click = (e) => { if (v.onClick) v.onClick(e); onMobileClose(); };
    if (v.onClick && !v.href) return h("button", { type: "button", className: cls, title, onClick: click }, ...body);
    if (v.external) return h("a", { href: v.href, target: "_blank", rel: "noopener noreferrer", className: cls, title, onClick: click }, ...body);
    return h(L, { href: v.href, className: cls, title, onClick: click, "aria-current": v.active ? "page" : undefined }, ...body);
  }

  const visible = sections.filter((s) => s.items && s.items.length);

  return h(Fragment, null,
    mobileOpen ? h("div", { className: "emn-backdrop", onClick: onMobileClose, "aria-hidden": true }) : null,
    h("aside", { className: "emn-side" + (c ? " emn-collapsed" : "") + (mobileOpen ? " emn-open" : "") + (dark ? " emn-dark" : "") },

      // Brand: wordmark + product on the left, logo, then the collapse control (desktop) or the
      // close control (phone drawer).
      c
        ? h("div", { className: "emn-head emn-head-c" },
            h("button", { type: "button", className: "emn-iconbtn", onClick: onToggleCollapse, title: "Expand sidebar", "aria-label": "Expand sidebar" }, icon("chevronsRight")))
        : h("div", { className: "emn-head" },
            h("a", { href: homeHref, className: "emn-brand" },
              h("span", { className: "emn-word" }, h(Wordmark, { mark: wordmark })),
              product ? h("span", { className: "emn-product" }, product) : null),
            logo ? h("img", { className: "emn-logo", src: logo, alt: "", "aria-hidden": true, onError: (e) => { e.currentTarget.style.display = "none"; } }) : null,
            h("button", { type: "button", className: "emn-iconbtn emn-desk", onClick: onToggleCollapse, title: "Collapse sidebar", "aria-label": "Collapse sidebar" }, icon("chevronsLeft")),
            h("button", { type: "button", className: "emn-iconbtn emn-phone", onClick: onMobileClose, "aria-label": "Close menu" }, icon("x"))),

      // App switcher: the main apps, the current one lit, and "All tools" for the rest.
      apps && apps.length
        ? h("div", { className: "emn-switch", ref: panelRef },
            h("nav", { className: "emn-apps", "aria-label": "EmuTel apps" },
              ...apps.map((a) => h("a", {
                key: a.key, href: a.href, className: "emn-app" + (a.key === app ? " emn-on" : ""),
                "aria-current": a.key === app ? "page" : undefined,
                title: a.key === app ? `${a.label} (you're here)` : `Switch to ${a.label}`,
              }, renderIcon(a.icon, c ? 18 : 15), c ? null : h("span", null, a.label))),
              catalogue && catalogue.length
                ? h("button", { type: "button", className: "emn-app emn-all" + (panel ? " emn-on" : ""), onClick: () => setPanel((v) => !v), title: "All EmuTel tools", "aria-expanded": panel }, icon("grid", c ? 18 : 14), c ? null : h("span", null, "All tools"))
                : h("a", { className: "emn-app emn-all", href: allToolsHref, title: "All EmuTel tools" }, icon("grid", c ? 18 : 14), c ? null : h("span", null, "All tools"))),
            panel && catalogue
              ? h("div", { className: "emn-panel", role: "dialog", "aria-label": "All EmuTel tools" },
                  h("div", { className: "emn-panel-head" }, h("span", null, "All tools"),
                    h("button", { type: "button", className: "emn-iconbtn", onClick: () => setPanel(false), "aria-label": "Close" }, icon("x", 16))),
                  ...catalogue.filter((g) => g.tools && g.tools.length).map((g) => h("div", { key: g.key || g.heading, className: "emn-panel-group" },
                    h("div", { className: "emn-panel-h" }, g.heading, g.answers ? h("span", null, g.answers) : null),
                    ...g.tools.map((t) => h("a", { key: t.key || t.url, href: t.url, className: "emn-panel-tool", target: t.external === false ? undefined : "_blank", rel: "noopener noreferrer" },
                      h("span", { className: "emn-panel-name" }, t.label), t.blurb ? h("span", { className: "emn-panel-blurb" }, t.blurb) : null)))))
              : null)
        : null,

      h("nav", { className: "emn-nav" },
        ...visible.map((s, i) => h("div", { key: s.key || s.header || i, className: "emn-section" },
          s.header
            ? (c
                ? (i > 0 ? h("div", { className: "emn-rule" + (s.gold ? " emn-gold" : ""), title: s.header }) : null)
                : h("div", { className: "emn-h" + (i === 0 ? " emn-first" : "") + (s.gold ? " emn-gold" : "") }, s.headerIcon ? renderIcon(s.headerIcon, 11) : null, s.header))
            : (i > 0 ? h("div", { className: "emn-rule" }) : null),
          ...s.items.map((v) => h(Fragment, { key: v.key },
            h(Item, { v }),
            v.children && v.children.length && v.active && !c
              ? h("div", { className: "emn-subs" }, ...v.children.map((sv) => h(Item, { key: sv.key, v: sv, sub: true })))
              : null))))),

      h("div", { className: "emn-foot" },
        h("div", { className: "emn-rule emn-rule-foot" }),
        h(Item, { v: { key: "theme", label: dark ? "Light mode" : "Dark mode", icon: dark ? "sun" : "moon", onClick: onToggleDark, title: dark ? "Switch to light" : "Switch to dark" } }),
        ...footer.map((v) => h(Item, { key: v.key, v })),
        footerSlot && !c ? h("div", { className: "emn-slot" }, footerSlot) : null,
        user && (user.name || user.email)
          ? h("div", { className: "emn-user", title: c ? (user.name || user.email) : undefined },
              h("span", { className: "emn-avatar" }, initials(user.name || user.email), online ? h("span", { className: "emn-online" }) : null),
              c ? null : h("span", { className: "emn-who" },
                h("span", { className: "emn-name" }, user.name || String(user.email).split("@")[0]),
                user.email ? h("span", { className: "emn-mail" }, user.email) : null))
          : null)),
  );
}

export { EmutelSidebar };
