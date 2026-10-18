import type { routing } from "./routing"

import type admin from "../../messages/en/admin.json"
import type ai from "../../messages/en/ai.json"
import type auth from "../../messages/en/auth.json"
import type common from "../../messages/en/common.json"
import type dashboard from "../../messages/en/dashboard.json"
import type gear from "../../messages/en/gear.json"
import type home from "../../messages/en/home.json"
import type metadata from "../../messages/en/metadata.json"
import type nav from "../../messages/en/nav.json"
import type pages from "../../messages/en/pages.json"
import type provider from "../../messages/en/provider.json"

/** English is the source of truth: keys used in code must exist in en/*.json. */
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: {
      common: typeof common
      nav: typeof nav
      home: typeof home
      ai: typeof ai
      pages: typeof pages
      auth: typeof auth
      gear: typeof gear
      dashboard: typeof dashboard
      provider: typeof provider
      admin: typeof admin
      metadata: typeof metadata
    }
  }
}
