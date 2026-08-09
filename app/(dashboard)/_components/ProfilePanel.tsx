import { Badge } from "@/components/ui/badge"
import { getMe } from "@/service/auth"

import { PageHeader } from "./PageHeader"
import { ProfileForm } from "./ProfileForm"

export async function ProfilePanel() {
  const res = await getMe()
  const user = res.data

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account details, straight from the server."
      />

      {!res.success || !user ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {res.message}
        </p>
      ) : (
        <div className="grid max-w-lg gap-6">
          <dl className="grid gap-px overflow-hidden rounded-xl border bg-border">
            <Row label="Name" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone || "Not provided"} />
            <Row
              label="Role"
              value={<Badge variant="secondary">{user.role}</Badge>}
            />
            <Row
              label="Status"
              value={
                <Badge
                  variant={user.status === "ACTIVE" ? "default" : "destructive"}
                >
                  {user.status}
                </Badge>
              }
            />
            <Row
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </dl>

          <ProfileForm user={user} />
        </div>
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-card px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}
