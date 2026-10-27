import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { cloudinaryThumb } from "@/utils/cloudinary"

/** The account's photo, or its initials while it loads or when there's none. */
export function UserAvatar({
  name,
  avatarUrl,
  className,
  fallbackClassName,
}: {
  name: string
  avatarUrl?: string | null
  className?: string
  fallbackClassName?: string
}) {
  return (
    <Avatar className={className}>
      {avatarUrl && (
        // Small and square: a 96 px Cloudinary thumb is plenty for 2x screens.
        <AvatarImage
          src={cloudinaryThumb(avatarUrl, 96)}
          alt=""
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-xs font-semibold text-primary",
          fallbackClassName
        )}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
