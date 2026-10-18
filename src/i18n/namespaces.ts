/**
 * Message files: messages/<locale>/<namespace>.json. Each namespace belongs
 * to one area of the app, so translations of different areas never touch
 * the same file. Form errors live in their area too (`auth.validation.*`).
 */
export const NAMESPACES = [
  "common", // shared components, statuses, units, generic actions
  "nav", // navbar, footer, menus, sidebar, command palette, error pages
  "home", // the home page sections
  "ai", // gear finder, AI showcase, listing writer
  "pages", // about, contact, privacy, newsletter
  "auth", // login, register, password and email flows
  "gear", // browse, gear page, provider profile, renting
  "dashboard", // shared dashboard pieces and the customer dashboard
  "provider", // provider dashboard
  "admin", // admin dashboard
  "metadata", // page titles and descriptions
] as const

export type Namespace = (typeof NAMESPACES)[number]
