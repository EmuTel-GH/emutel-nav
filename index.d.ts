import type { ComponentType, ReactNode } from "react";

/** A component (e.g. a lucide-react icon), a built-in icon name, or anything renderable. */
export type NavIcon = ComponentType<any> | string | ReactNode;

export interface NavSubItem { key: string; label: string; href: string; active?: boolean; title?: string }

export interface NavItem {
  key: string;
  label: string;
  icon?: NavIcon;
  /** An in-app route (client-side link), or a full URL when `external`. */
  href?: string;
  onClick?: (e: unknown) => void;
  /** Opens in a new tab and shows a launch mark. */
  external?: boolean;
  active?: boolean;
  title?: string;
  count?: number;
  countTone?: "gold" | "danger" | "muted";
  trailing?: ReactNode;
  /** Shown indented under the item while it is active and the sidebar is expanded. */
  children?: NavSubItem[];
}

export interface NavSection { key?: string; header?: string; headerIcon?: NavIcon; gold?: boolean; items: NavItem[] }

export interface EmutelApp { key: string; label: string; href: string; icon: NavIcon }

export interface CatalogueTool { key?: string; label: string; blurb?: string; url: string; external?: boolean }
export interface CatalogueGroup { key?: string; heading: string; answers?: string; tools: CatalogueTool[] }

export interface EmutelSidebarProps {
  /** This app's key in the switcher ("tickets" | "projects" | "billing" | "sales"). */
  app?: string;
  /** The small label under the wordmark ("Helpdesk", "Billing", ...). */
  product?: string;
  /** Whose name is in the corner; default emutel with the t in gold. */
  wordmark?: { text: string; accentIndex: number } | null;
  /** Image in the corner; default EMUTEL_LOGO (embedded, so apps need no copy). Empty string hides it. */
  logo?: string;
  homeHref?: string;
  sections?: NavSection[];
  footer?: NavItem[];
  footerSlot?: ReactNode;
  user?: { name?: string | null; email?: string | null } | null;
  online?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  dark?: boolean;
  onToggleDark?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  /** Switcher apps; default EMUTEL_APPS. Pass [] to hide the switcher (demo / reseller instances). */
  apps?: EmutelApp[];
  /** Core's catalogue (/api/v1/admin/nav groups). With it, "All tools" opens a panel; without, it links to allToolsHref. */
  catalogue?: CatalogueGroup[] | null;
  allToolsHref?: string;
  /** Link component for in-app routes; default next/link. */
  linkComponent?: ComponentType<any>;
}

export interface EmutelMobileBarProps {
  product?: string;
  wordmark?: { text: string; accentIndex: number } | null;
  onMenu?: () => void;
  back?: { href: string; label: string } | null;
  reserveRight?: boolean;
  linkComponent?: ComponentType<any>;
}

export declare const EMUTEL_APPS: EmutelApp[];
/** The EmuTel mark as a data URI: the sidebar default, for apps that want it elsewhere. */
export declare const EMUTEL_LOGO: string;
export declare function initials(name?: string | null): string;
export declare function EmutelMobileBar(props: EmutelMobileBarProps): JSX.Element;
export declare function EmutelSidebar(props: EmutelSidebarProps): JSX.Element;
export default EmutelSidebar;
