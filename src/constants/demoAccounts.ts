export type DemoAccount = {
  /** Message key under `auth.login.demo`. */
  label: "customer" | "provider" | "admin"
  email: string
  password: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: "customer", email: "customer1@gearup.com", password: "Password123" },
  { label: "provider", email: "provider2@gearup.com", password: "Password123" },
  { label: "admin", email: "admin@gearup.com", password: "Password123" },
]
