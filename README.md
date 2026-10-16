# @emutel/nav

The EmuTel staff sidebar: one React component and one stylesheet, used by every staff app
(tickets, projects, billing, the sales console) so they look and behave as one product. Each app
supplies only its own sections; the logo block, app switcher, "All tools", headings, spacing, active
highlight, dark-mode toggle, signed-in user and phone drawer all come from here.

Self-contained on purpose: plain JS (no JSX, so no build step or transpile settings) and plain CSS
with `emn-` prefixed classes (no Tailwind, no app tokens), so it renders the same in a Tailwind 3,
Tailwind 4 or plain-CSS app. Icons for the shared parts are inlined; app sections can pass
lucide-react components, built-in icon names, or any renderable (an emoji, an element).

This repo is public so the apps' Docker builds can install it without credentials. Keep it free of
secrets and of anything beyond the sidebar itself.

## Use

```bash
npm install https://github.com/EmuTel-GH/emutel-nav/archive/refs/tags/v1.0.1.tar.gz
```

```js
// app/layout.js (once)
import "@emutel/nav/nav.css";
```

```jsx
"use client";
import EmutelSidebar, { EmutelMobileBar } from "@emutel/nav";

<div className="flex flex-col md:flex-row h-dvh overflow-hidden">
  <EmutelMobileBar product="Billing" onMenu={() => setMobileNav(true)} />
  <EmutelSidebar app="billing" product="Billing" sections={sections} user={user}
    collapsed={collapsed} onToggleCollapse={toggleCollapsed} dark={dark} onToggleDark={toggleDark}
    mobileOpen={mobileNav} onMobileClose={() => setMobileNav(false)} />
  <main className="flex-1 min-w-0 min-h-0 overflow-hidden">{children}</main>
</div>
```

`sections` is `[{ header?, headerIcon?, gold?, items: [{ key, label, icon, href | onClick, active,
external?, title?, count?, countTone?, trailing?, children? }] }]`. See `index.d.ts` for every prop.
The layout container is the app's (it stays a flex row on desktop, a column on phones); the sidebar
hides itself under 768px until `mobileOpen`, and the mobile bar shows only under 768px.

- `apps`: the switcher list (default `EMUTEL_APPS`: Tickets, Projects, Billing, Sales). Pass `[]` on
  a demo or reseller instance so our estate is never shown there.
- `catalogue`: core's tool catalogue (`/api/v1/admin/nav` groups). With it, "All tools" opens a
  panel listing every tool; without it, "All tools" links to the launcher at admin.emutel.net.
- `wordmark` / `logo`: white-label instances pass their own.

## Change it

1. Edit here, then commit, push, and tag a new version (`git tag v1.0.1 && git push --tags`).
2. In each app, point the dependency at the new tag and redeploy it. Builds pin a version on
   purpose: a moving branch would make two rebuilds of the same app look different.

Adding or removing a tool belongs in core's catalogue (`lib/admin-nav.ts` in emutel-core), not here.
