export type DemoAccount = {
  label: string
  email: string
  password: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: "Customer", email: "customer1@gearup.com", password: "Password123" },
  { label: "Provider", email: "provider2@gearup.com", password: "Password123" },
  { label: "Admin", email: "admin@gearup.com", password: "Password123" },
]
