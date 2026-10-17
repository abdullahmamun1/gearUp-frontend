import { Ground, Illustration } from "./Illustration"

type Props = { className?: string }

function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        x={-2.5}
        y={-6}
        width={5}
        height={14}
        rx={1.5}
        className="fill-foreground/25"
      />
      <path d="M0-46 L16-14 H-16Z" className="fill-primary/80" />
      <path d="M0-34 L20-2 H-20Z" className="fill-primary" />
    </g>
  )
}

function Sun({
  x,
  y,
  r = 14,
  tone = "ember",
}: {
  x: number
  y: number
  r?: number
  tone?: "ember" | "lagoon"
}) {
  const fill = tone === "ember" ? "fill-ember" : "fill-lagoon"
  return (
    <g>
      <circle cx={x} cy={y} r={r + 8} className={`${fill} opacity-15`} />
      <circle cx={x} cy={y} r={r} className={fill} />
    </g>
  )
}

export function CampingScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <Sun x={190} y={34} />
      <path
        d="M0 132 Q60 104 120 116 T240 110 V160 H0Z"
        className="fill-primary/15"
      />
      <Ground />
      <Pine x={42} y={128} s={1.1} />
      <Pine x={66} y={132} s={0.8} />
      <Pine x={204} y={130} s={0.9} />
      {/* tent */}
      <path d="M86 140 L124 70 L162 140Z" className="fill-ember" />
      <path d="M124 70 L162 140 H138Z" className="fill-ember-strong/60" />
      <path
        d="M124 104 L112 140 H136Z"
        className="fill-foreground/70 dark:fill-black/55"
      />
      <path
        d="M124 70 V140"
        className="stroke-foreground/30"
        strokeWidth={1.5}
      />
      {/* campfire */}
      <path
        d="M176 142 L196 134 M178 134 L198 142"
        className="stroke-foreground/40"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M187 136 C180 126 186 118 188 112 C192 120 196 124 192 136Z"
        className="fill-ember"
      />
      <path
        d="M187 136 C184 130 187 126 188 122 C190 127 192 130 190 136Z"
        className="fill-warning"
      />
    </Illustration>
  )
}

export function WaterScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <Sun x={58} y={36} />
      <path
        d="M0 96 Q30 90 60 96 T120 96 T180 96 T240 96 V160 H0Z"
        className="fill-lagoon/25"
      />
      <path
        d="M0 112 Q30 106 60 112 T120 112 T180 112 T240 112 V160 H0Z"
        className="fill-lagoon/45"
      />
      <path
        d="M0 130 Q30 124 60 130 T120 130 T180 130 T240 130 V160 H0Z"
        className="fill-lagoon/70"
      />
      {/* kayak */}
      <path
        d="M70 104 Q120 122 178 104 Q122 96 70 104Z"
        className="fill-ember"
      />
      <ellipse
        cx={124}
        cy={104}
        rx={14}
        ry={3.5}
        className="fill-foreground/60"
      />
      {/* paddler */}
      <circle cx={124} cy={82} r={6} className="fill-foreground/70" />
      <path d="M118 102 Q124 86 130 102Z" className="fill-primary" />
      <path
        d="M92 76 L158 98"
        className="stroke-foreground/60"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <ellipse
        cx={90}
        cy={75}
        rx={7}
        ry={3}
        transform="rotate(18 90 75)"
        className="fill-primary"
      />
      <ellipse
        cx={160}
        cy={99}
        rx={7}
        ry={3}
        transform="rotate(18 160 99)"
        className="fill-primary"
      />
      <path
        d="M196 70 l6 -4 6 4 M186 58 l5 -3 5 3"
        className="stroke-foreground/30"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Illustration>
  )
}

export function CyclingScene({ className }: Props) {
  const wheel = (cx: number) => (
    <g>
      <circle
        cx={cx}
        cy={112}
        r={24}
        className="stroke-foreground/70"
        strokeWidth={4}
      />
      <circle cx={cx} cy={112} r={3} className="fill-foreground/70" />
      <path
        d={`M${cx} 88 V136 M${cx - 24} 112 H${cx + 24}`}
        className="stroke-foreground/15"
        strokeWidth={1.5}
      />
    </g>
  )
  return (
    <Illustration className={className}>
      <path
        d="M0 120 Q50 86 110 106 T240 92 V160 H0Z"
        className="fill-primary/15"
      />
      <Sun x={196} y={36} r={12} />
      <path
        d="M0 140 H240"
        className="stroke-foreground/15"
        strokeWidth={2}
        strokeDasharray="10 8"
      />
      <Ground />
      {wheel(76)}
      {wheel(166)}
      {/* frame */}
      <path
        d="M76 112 L104 76 H150 L166 112 M104 76 L122 112 L150 76 M122 112 H76"
        className="stroke-ember"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M150 76 L146 62 H160"
        className="stroke-foreground/70"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M98 70 H114"
        className="stroke-foreground/70"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={122} cy={112} r={6} className="fill-lagoon" />
    </Illustration>
  )
}

export function HikingScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <Sun x={56} y={38} r={12} tone="lagoon" />
      <path
        d="M10 140 L86 44 L132 104 L160 72 L232 140Z"
        className="fill-primary/25"
      />
      <path d="M40 140 L112 58 L184 140Z" className="fill-primary" />
      <path
        d="M112 58 L126 74 L118 72 L112 80 L104 72 L98 74Z"
        className="fill-white"
      />
      <path d="M112 58 V36" className="stroke-foreground/70" strokeWidth={2} />
      <path d="M112 36 L130 42 L112 48Z" className="fill-ember" />
      <path
        d="M70 140 C96 124 92 112 116 104 S138 90 128 80"
        className="stroke-background/80"
        strokeWidth={2.5}
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <Ground />
      <Pine x={196} y={136} s={0.8} />
      <Pine x={214} y={140} s={0.6} />
    </Illustration>
  )
}

export function ClimbingScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <path
        d="M140 160 L150 20 L196 10 L222 40 L240 160Z"
        className="fill-primary/70"
      />
      <path d="M150 20 L196 10 L186 60 L160 76Z" className="fill-primary" />
      <path
        d="M176 92 L196 86 L204 108Z M160 120 L182 116 L176 136Z"
        className="fill-background/25"
      />
      {/* rope */}
      <path
        d="M190 14 C176 40 196 64 178 90 S150 124 120 140"
        className="stroke-ember"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={190} cy={14} r={4} className="fill-foreground/70" />
      {/* carabiner */}
      <rect
        x={70}
        y={60}
        width={34}
        height={56}
        rx={17}
        transform="rotate(-18 87 88)"
        className="stroke-lagoon"
        strokeWidth={6}
      />
      <path
        d="M78 74 L92 70"
        className="stroke-foreground/70"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Ground cx={110} rx={80} />
    </Illustration>
  )
}

export function TeamSportsScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <path d="M0 124 H240 V160 H0Z" className="fill-primary/20" />
      {/* goal */}
      <path
        d="M128 124 V52 H220 V124"
        className="stroke-foreground/70"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path
        d="M140 60 V124 M156 60 V124 M172 60 V124 M188 60 V124 M204 60 V124 M132 70 H216 M132 86 H216 M132 102 H216"
        className="stroke-foreground/15"
        strokeWidth={1.5}
      />
      {/* ball */}
      <circle
        cx={84}
        cy={110}
        r={26}
        className="fill-background stroke-foreground/70"
        strokeWidth={3}
      />
      <path
        d="M84 98 L95 106 L91 119 H77 L73 106Z"
        className="fill-foreground/70"
      />
      <path
        d="M84 98 V86 M95 106 L106 102 M91 119 L98 130 M77 119 L70 130 M73 106 L62 102"
        className="stroke-foreground/50"
        strokeWidth={2}
      />
      <path
        d="M40 92 H56 M32 106 H52 M40 120 H54"
        className="stroke-ember"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Ground />
    </Illustration>
  )
}

/** "How it works" step 1. */
export function SearchStepScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <rect
        x={34}
        y={30}
        width={120}
        height={84}
        rx={12}
        className="fill-card stroke-foreground/15"
        strokeWidth={2}
      />
      <rect
        x={46}
        y={42}
        width={44}
        height={30}
        rx={6}
        className="fill-primary/25"
      />
      <rect
        x={98}
        y={42}
        width={44}
        height={30}
        rx={6}
        className="fill-lagoon/25"
      />
      <rect
        x={46}
        y={80}
        width={44}
        height={6}
        rx={3}
        className="fill-foreground/15"
      />
      <rect
        x={98}
        y={80}
        width={34}
        height={6}
        rx={3}
        className="fill-foreground/15"
      />
      <rect
        x={46}
        y={92}
        width={28}
        height={6}
        rx={3}
        className="fill-foreground/10"
      />
      <circle
        cx={162}
        cy={98}
        r={26}
        className="fill-ember/15 stroke-ember"
        strokeWidth={6}
      />
      <path
        d="M181 117 L204 140"
        className="stroke-ember"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <Ground />
    </Illustration>
  )
}

/** "How it works" step 2. */
export function DatesStepScene({ className }: Props) {
  const cells = []
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
      const day = row * 7 + col
      const inRange = day >= 9 && day <= 12
      const edge = day === 9 || day === 12
      cells.push(
        <rect
          key={day}
          x={58 + col * 18}
          y={62 + row * 16}
          width={14}
          height={12}
          rx={3}
          className={
            edge
              ? "fill-primary"
              : inRange
                ? "fill-primary/30"
                : "fill-foreground/8"
          }
        />
      )
    }
  }
  return (
    <Illustration className={className}>
      <rect
        x={48}
        y={30}
        width={144}
        height={110}
        rx={14}
        className="fill-card stroke-foreground/15"
        strokeWidth={2}
      />
      <path
        d="M48 44 a14 14 0 0 1 14 -14 H178 a14 14 0 0 1 14 14 V52 H48Z"
        className="fill-ember"
      />
      <path
        d="M82 22 V38 M158 22 V38"
        className="stroke-foreground/60"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {cells}
      <Ground />
    </Illustration>
  )
}

/** "How it works" step 3. */
export function PickupStepScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <path d="M58 80 L106 58 L154 80 L106 102Z" className="fill-primary/60" />
      <path d="M58 80 V126 L106 148 V102Z" className="fill-primary" />
      <path d="M154 80 V126 L106 148 V102Z" className="fill-primary/80" />
      <path
        d="M82 69 L130 91"
        className="stroke-background/60"
        strokeWidth={6}
      />
      <circle cx={178} cy={58} r={24} className="fill-success" />
      <path
        d="M167 58 L175 66 L190 50"
        className="stroke-background"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Ground />
    </Illustration>
  )
}

const BY_CATEGORY: Record<string, (props: Props) => React.ReactElement> = {
  camping: CampingScene,
  "water sports": WaterScene,
  cycling: CyclingScene,
  "hiking & trekking": HikingScene,
  climbing: ClimbingScene,
  "team sports": TeamSportsScene,
}

/** Scene for a category name; camping is the friendly default. */
export function CategoryScene({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Scene = BY_CATEGORY[name.trim().toLowerCase()] ?? CampingScene
  return <Scene className={className} />
}

/**
 * The hero's floating island, flat. It's the poster under the 3D canvas
 * (and the hero image on phones), so it mirrors the 3D layout.
 */
export function IslandScene({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 360"
      fill="none"
      aria-hidden
      focusable="false"
      className={className}
    >
      <ellipse cx={200} cy={268} rx={176} ry={34} className="fill-lagoon/25" />
      <ellipse cx={200} cy={262} rx={130} ry={22} className="fill-lagoon/35" />
      {/* rock */}
      <path
        d="M86 196 L314 196 L262 286 L200 316 L138 286Z"
        className="fill-foreground/30"
      />
      <path
        d="M200 196 L314 196 L262 286 L200 316Z"
        className="fill-foreground/20"
      />
      {/* grass top */}
      <ellipse cx={200} cy={196} rx={116} ry={30} className="fill-primary" />
      <ellipse cx={200} cy={190} rx={116} ry={30} className="fill-primary/80" />
      {/* tent */}
      <path d="M150 196 L192 120 L234 196Z" className="fill-ember" />
      <path d="M192 120 L234 196 H210Z" className="fill-ember-strong/60" />
      <path
        d="M192 158 L180 196 H204Z"
        className="fill-foreground/70 dark:fill-black/55"
      />
      {/* pines */}
      <g transform="translate(110 192)">
        <rect
          x={-3}
          y={-8}
          width={6}
          height={14}
          className="fill-foreground/30"
        />
        <path
          d="M0-62 L20-26 H-20Z M0-46 L24-8 H-24Z"
          className="fill-primary"
        />
      </g>
      <g transform="translate(276 186) scale(0.8)">
        <rect
          x={-3}
          y={-8}
          width={6}
          height={14}
          className="fill-foreground/30"
        />
        <path
          d="M0-62 L20-26 H-20Z M0-46 L24-8 H-24Z"
          className="fill-primary"
        />
      </g>
      <g transform="translate(296 200) scale(0.6)">
        <rect
          x={-3}
          y={-8}
          width={6}
          height={14}
          className="fill-foreground/30"
        />
        <path
          d="M0-62 L20-26 H-20Z M0-46 L24-8 H-24Z"
          className="fill-primary"
        />
      </g>
      {/* campfire */}
      <path
        d="M246 204 L262 198 M248 198 L264 204"
        className="stroke-foreground/40"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M255 200 C249 190 254 184 256 178 C259 185 263 190 259 200Z"
        className="fill-ember"
      />
      {/* kayak on the water */}
      <path
        d="M296 262 Q330 274 368 262 Q332 254 296 262Z"
        className="fill-ember"
      />
      <path
        d="M314 250 L350 270"
        className="stroke-foreground/50"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* sun / moon */}
      <circle
        cx={318}
        cy={70}
        r={30}
        className="fill-ember opacity-15 dark:fill-lagoon"
      />
      <circle cx={318} cy={70} r={18} className="fill-ember dark:fill-lagoon" />
    </svg>
  )
}

/** Contact, email verification and the newsletter: a letter in flight. */
export function MailScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <Ground rx={70} />
      <circle cx={120} cy={80} r={58} className="fill-primary/10" />
      <path
        d="M30 62 Q70 30 100 52"
        className="stroke-lagoon/60"
        strokeWidth={2}
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <path d="M196 34 L212 40 L198 48 Z" className="fill-lagoon" />
      <path
        d="M168 42 Q186 30 196 38"
        className="stroke-lagoon/60"
        strokeWidth={2}
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      {/* envelope */}
      <rect
        x={72}
        y={60}
        width={96}
        height={66}
        rx={8}
        className="fill-card stroke-foreground/15"
        strokeWidth={2}
      />
      <path
        d="M72 70 L120 102 L168 70 V68 a8 8 0 0 0 -8 -8 H80 a8 8 0 0 0 -8 8Z"
        className="fill-primary"
      />
      <path
        d="M72 126 L108 96 M168 126 L132 96"
        className="stroke-foreground/15"
        strokeWidth={2}
      />
      {/* seal */}
      <circle cx={120} cy={100} r={9} className="fill-ember" />
      <path
        d="M116 100 l3 3 l6 -6"
        className="stroke-ember-foreground"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={48} cy={110} r={5} className="fill-ember/70" />
      <circle cx={194} cy={104} r={4} className="fill-primary/60" />
    </Illustration>
  )
}

/** Forgot and reset password: a key beside a padlock. */
export function KeyScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <Ground rx={70} />
      <circle cx={120} cy={82} r={58} className="fill-lagoon/10" />
      {/* padlock */}
      <path
        d="M128 76 V60 a20 20 0 0 1 40 0 V76"
        className="stroke-foreground/30"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <rect
        x={118}
        y={74}
        width={60}
        height={56}
        rx={10}
        className="fill-primary"
      />
      <rect
        x={118}
        y={74}
        width={60}
        height={14}
        rx={7}
        className="fill-primary/70"
      />
      <circle cx={148} cy={102} r={7} className="fill-primary-foreground/90" />
      <rect
        x={145}
        y={104}
        width={6}
        height={13}
        rx={3}
        className="fill-primary-foreground/90"
      />
      {/* key */}
      <g transform="rotate(-28 78 112)">
        <circle cx={62} cy={112} r={16} className="fill-ember" />
        <circle cx={62} cy={112} r={6} className="fill-background" />
        <rect
          x={76}
          y={108}
          width={46}
          height={8}
          rx={3}
          className="fill-ember"
        />
        <rect
          x={104}
          y={114}
          width={7}
          height={10}
          rx={2}
          className="fill-ember"
        />
        <rect
          x={114}
          y={114}
          width={6}
          height={7}
          rx={2}
          className="fill-ember"
        />
      </g>
      <path
        d="M190 40 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4z"
        className="fill-warning"
      />
    </Illustration>
  )
}

/** Privacy: a shield with a check. */
export function ShieldScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <Ground rx={64} />
      <circle cx={120} cy={80} r={60} className="fill-primary/10" />
      <circle cx={120} cy={80} r={42} className="fill-primary/10" />
      <path
        d="M120 26 L164 42 V78 C164 106 146 126 120 138 C94 126 76 106 76 78 V42Z"
        className="fill-primary"
      />
      <path
        d="M120 26 L164 42 V78 C164 106 146 126 120 138Z"
        className="fill-foreground/10"
      />
      <path
        d="M102 82 L116 96 L140 70"
        className="stroke-primary-foreground"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x={34}
        y={58}
        width={34}
        height={22}
        rx={5}
        className="fill-card stroke-foreground/15"
        strokeWidth={2}
      />
      <rect
        x={40}
        y={66}
        width={14}
        height={3}
        rx={1.5}
        className="fill-lagoon"
      />
      <rect
        x={40}
        y={72}
        width={22}
        height={3}
        rx={1.5}
        className="fill-foreground/20"
      />
      <circle cx={190} cy={60} r={12} className="fill-ember" />
      <path
        d="M185 60 l3 3 l7 -7"
        className="stroke-ember-foreground"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Illustration>
  )
}

/** Not found: a compass that has lost its bearings, on a trail map. */
export function CompassScene({ className }: Props) {
  return (
    <Illustration className={className}>
      <Ground rx={80} />
      <path
        d="M28 120 C60 96 82 132 112 112 S170 90 212 112"
        className="stroke-foreground/20"
        strokeWidth={3}
        strokeDasharray="6 7"
        strokeLinecap="round"
      />
      <path
        d="M200 96 l12 12 M212 96 l-12 12"
        className="stroke-ember"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Pine x={44} y={110} s={0.7} />
      <Pine x={196} y={70} s={0.55} />
      <circle
        cx={120}
        cy={74}
        r={46}
        className="fill-card stroke-foreground/15"
        strokeWidth={3}
      />
      <circle cx={120} cy={74} r={36} className="fill-lagoon/10" />
      <path
        d="M120 44 L130 74 L120 104 L110 74Z"
        className="fill-foreground/15"
      />
      <g transform="rotate(38 120 74)">
        <path d="M120 44 L129 74 H111Z" className="fill-ember" />
        <path d="M120 104 L129 74 H111Z" className="fill-lagoon" />
      </g>
      <circle cx={120} cy={74} r={5} className="fill-foreground/60" />
      <rect
        x={114}
        y={22}
        width={12}
        height={8}
        rx={3}
        className="fill-foreground/25"
      />
    </Illustration>
  )
}
