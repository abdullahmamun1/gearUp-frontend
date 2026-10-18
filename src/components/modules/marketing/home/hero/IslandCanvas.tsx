"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Sparkles, Stars } from "@react-three/drei"
import {
  CanvasTexture,
  DoubleSide,
  ExtrudeGeometry,
  getConsoleFunction,
  LatheGeometry,
  RepeatWrapping,
  setConsoleFunction,
  Shape,
  Vector2,
} from "three"
import type { Group, Mesh, MeshBasicMaterial, PointLight } from "three"

/**
 * React Three Fiber (9.8, the latest) still creates a THREE.Clock, which
 * three r183+ reports as deprecated on every canvas. That's internal to the
 * library, so drop just that one message (three's official console hook);
 * everything else passes through unchanged.
 */
const previousConsole = getConsoleFunction()
setConsoleFunction((type, message, ...params) => {
  if (
    typeof message === "string" &&
    message.startsWith("THREE.Clock: This module has been deprecated")
  ) {
    return
  }
  if (previousConsole) previousConsole(type, message, ...params)
  else
    (console[type as "log" | "warn" | "error"] ?? console.log)(
      message,
      ...params
    )
})

/**
 * The hero's 3D scene: a floating sky island with a camp on top, a pond
 * spilling over the edge as a waterfall, and clouds drifting past. Built only
 * from primitives (no model files to download or license). Lazy-loaded by
 * HeroVisual; never on phones or with reduced motion.
 *
 * Colours are hex versions of the theme tokens (three.js can't read oklch
 * CSS variables), and the canvas renders without tone mapping (`flat`) so
 * they come out as written.
 */
const PALETTE = {
  light: {
    grass: "#5fb877",
    grassEdge: "#4aa363",
    earth: "#b48862",
    rock: "#8f7462",
    pine: "#2f8f5b",
    leaf: "#6cc07a",
    trunk: "#7a5a40",
    tent: "#f08a3c",
    tentDoor: "#a14d1d",
    stone: "#b3aca2",
    water: "#5ab4e6",
    foam: "#e6f5ff",
    kayak: "#ef8a3e",
    frame: "#2d7db3",
    fire: "#ffb347",
    flame: "#fff1a8",
    cloud: "#ffffff",
    sky: "#fff4e4",
    ground: "#8fb79a",
    hemi: 0.95,
    ambient: 0.35,
    sun: "#fff1dc",
    sunIntensity: 1.5,
    fireIntensity: 0.5,
    cloudOpacity: 0.95,
  },
  dark: {
    grass: "#3d8a5c",
    grassEdge: "#33774f",
    earth: "#6b5140",
    rock: "#4d3d33",
    pine: "#2a7a50",
    leaf: "#46975f",
    trunk: "#4f3b2c",
    tent: "#e07a34",
    tentDoor: "#5a2a10",
    stone: "#6e6a66",
    water: "#3a86c4",
    foam: "#a9d4f5",
    kayak: "#e9803a",
    frame: "#6db5e8",
    fire: "#ffa23a",
    flame: "#fff1a8",
    cloud: "#9aa8d0",
    sky: "#7d8fc9",
    ground: "#3a4a62",
    hemi: 0.75,
    ambient: 0.45,
    sun: "#b9ccff",
    sunIntensity: 0.6,
    fireIntensity: 3.5,
    cloudOpacity: 0.55,
  },
} as const

type Palette = (typeof PALETTE)[keyof typeof PALETTE]
type Vec3 = [number, number, number]

/** Height of the grass surface; everything on the island stands on it. */
const TOP = 0.12

function Pine({
  position,
  scale = 1,
  c,
}: {
  position: Vec3
  scale?: number
  c: Palette
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 0.24, 6]} />
        <meshStandardMaterial color={c.trunk} flatShading />
      </mesh>
      {[
        [0.36, 0.42, 0.36],
        [0.29, 0.38, 0.6],
        [0.2, 0.32, 0.82],
      ].map(([radius, height, y]) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <coneGeometry args={[radius, height, 7]} />
          <meshStandardMaterial color={c.pine} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function RoundTree({
  position,
  scale = 1,
  c,
}: {
  position: Vec3
  scale?: number
  c: Palette
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.055, 0.32, 6]} />
        <meshStandardMaterial color={c.trunk} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={c.leaf} flatShading />
      </mesh>
      <mesh position={[0.14, 0.38, 0.08]} castShadow>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color={c.leaf} flatShading />
      </mesh>
    </group>
  )
}

function Rock({
  position,
  scale = 1,
  c,
}: {
  position: Vec3
  scale?: number
  c: Palette
}) {
  return (
    <mesh position={position} scale={[scale, scale * 0.7, scale]} castShadow>
      <dodecahedronGeometry args={[0.14, 0]} />
      <meshStandardMaterial color={c.stone} flatShading />
    </mesh>
  )
}

/** An A-frame: a triangle extruded front to back, with a dark doorway. */
function Tent({ c }: { c: Palette }) {
  const geometry = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-0.5, 0)
    shape.lineTo(0.5, 0)
    shape.lineTo(0, 0.68)
    shape.closePath()
    const extruded = new ExtrudeGeometry(shape, {
      depth: 0.9,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 1,
    })
    extruded.translate(0, 0, -0.45)
    return extruded
  }, [])
  const door = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-0.2, 0)
    shape.lineTo(0.2, 0)
    shape.lineTo(0, 0.44)
    shape.closePath()
    return shape
  }, [])

  return (
    <group position={[-0.35, TOP, -0.3]} rotation={[0, 0.55, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={c.tent} flatShading />
      </mesh>
      <mesh position={[0, 0.005, 0.472]}>
        <shapeGeometry args={[door]} />
        <meshStandardMaterial color={c.tentDoor} />
      </mesh>
    </group>
  )
}

function Campfire({ c, animate }: { c: Palette; animate: boolean }) {
  const flame = useRef<Group>(null)
  const light = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    if (!animate) return
    const t = clock.elapsedTime
    const flicker = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06
    flame.current?.scale.set(1, flicker, 1)
    if (light.current) light.current.intensity = c.fireIntensity * flicker
  })

  return (
    <group position={[0.6, TOP, 0.2]}>
      {Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2
        return (
          <Rock
            key={i}
            position={[Math.cos(angle) * 0.2, 0.02, Math.sin(angle) * 0.2]}
            scale={0.42}
            c={c}
          />
        )
      })}
      {[0.4, -0.4].map((rotation) => (
        <mesh
          key={rotation}
          position={[0, 0.04, 0]}
          rotation={[0, rotation, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.028, 0.028, 0.3, 6]} />
          <meshStandardMaterial color={c.trunk} flatShading />
        </mesh>
      ))}
      <group ref={flame} position={[0, 0.06, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <coneGeometry args={[0.1, 0.26, 6]} />
          <meshBasicMaterial color={c.fire} />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <coneGeometry args={[0.055, 0.16, 6]} />
          <meshBasicMaterial color={c.flame} />
        </mesh>
      </group>
      <pointLight
        ref={light}
        position={[0, 0.35, 0]}
        color={c.fire}
        intensity={c.fireIntensity}
        distance={2.5}
        decay={2}
      />
      {animate && (
        <Sparkles
          count={12}
          position={[0, 0.5, 0]}
          scale={[0.3, 0.6, 0.3]}
          size={2.5}
          speed={0.5}
          color={c.fire}
        />
      )}
    </group>
  )
}

function Bike({ c }: { c: Palette }) {
  const bar = (from: [number, number], to: [number, number]) => {
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    return {
      position: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0] as Vec3,
      rotation: [0, 0, Math.atan2(dy, dx) - Math.PI / 2] as Vec3,
      length: Math.hypot(dx, dy),
    }
  }
  const tubes = [
    bar([-0.24, 0.14], [0, 0.16]), // chainstay
    bar([0, 0.16], [-0.06, 0.38]), // seat tube
    bar([-0.06, 0.38], [0.2, 0.36]), // top tube
    bar([0, 0.16], [0.2, 0.36]), // down tube
    bar([0.2, 0.36], [0.25, 0.14]), // fork
    bar([-0.24, 0.14], [-0.06, 0.38]), // seat stay
  ]

  return (
    <group position={[-1.15, TOP, 0.75]} rotation={[0, 0.9, 0]} scale={0.95}>
      {[-0.24, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.14, 0]} castShadow>
          <torusGeometry args={[0.13, 0.016, 6, 24]} />
          <meshStandardMaterial color="#2a2522" />
        </mesh>
      ))}
      {tubes.map((tube, i) => (
        <mesh
          key={i}
          position={tube.position}
          rotation={tube.rotation}
          castShadow
        >
          <cylinderGeometry args={[0.014, 0.014, tube.length, 6]} />
          <meshStandardMaterial color={c.frame} />
        </mesh>
      ))}
      <mesh position={[-0.07, 0.41, 0]}>
        <boxGeometry args={[0.1, 0.025, 0.05]} />
        <meshStandardMaterial color="#2a2522" />
      </mesh>
      <mesh position={[0.21, 0.41, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 6]} />
        <meshStandardMaterial color="#2a2522" />
      </mesh>
    </group>
  )
}

/** Where the pond sits, and where its overflow leaves the island. */
const POND: Vec3 = [0.95, TOP + 0.004, 0.95]
const SPILL_ANGLE = Math.atan2(POND[0], POND[2])

function Pond({ c, animate }: { c: Palette; animate: boolean }) {
  const kayak = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!animate || !kayak.current) return
    const t = clock.elapsedTime
    kayak.current.position.y = 0.02 + Math.sin(t * 1.6) * 0.008
    kayak.current.rotation.z = Math.sin(t * 1.2) * 0.04
  })

  return (
    <group position={POND}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.5, 40]} />
        <meshStandardMaterial color={c.water} roughness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.47, 0.52, 40]} />
        <meshBasicMaterial color={c.foam} transparent opacity={0.55} />
      </mesh>
      {/* the stream running from the pond to the edge */}
      <mesh
        rotation={[-Math.PI / 2, 0, -SPILL_ANGLE]}
        position={[Math.sin(SPILL_ANGLE) * 0.5, 0, Math.cos(SPILL_ANGLE) * 0.5]}
      >
        <planeGeometry args={[0.22, 0.45]} />
        <meshStandardMaterial color={c.water} roughness={0.15} />
      </mesh>
      <group ref={kayak} position={[-0.08, 0.02, -0.05]} rotation={[0, 0.5, 0]}>
        <mesh scale={[1, 0.22, 0.3]} castShadow>
          <sphereGeometry args={[0.3, 20, 12]} />
          <meshStandardMaterial color={c.kayak} />
        </mesh>
        <mesh position={[0, 0.05, 0]} scale={[1, 0.3, 0.6]}>
          <sphereGeometry args={[0.08, 12, 8]} />
          <meshStandardMaterial color="#2a2522" />
        </mesh>
        <group position={[0, 0.08, 0]} rotation={[0.2, 0.3, 0.12]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.62, 5]} />
            <meshStandardMaterial color="#2a2522" />
          </mesh>
          {[-0.31, 0.31].map((x) => (
            <mesh key={x} position={[x, 0, 0]} scale={[1, 0.15, 0.5]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              <meshStandardMaterial color={c.frame} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

/** Water pouring off the rim: a strip with a scrolling, fading texture. */
function Waterfall({ c, animate }: { c: Palette; animate: boolean }) {
  const stream = useRef<Mesh>(null)
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 256
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = c.water
    ctx.fillRect(0, 0, 64, 256)
    ctx.fillStyle = c.foam
    // Seeded, so the streaks are the same on every render.
    let seed = 7
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    for (let i = 0; i < 26; i++) {
      ctx.globalAlpha = 0.35 + random() * 0.4
      ctx.fillRect(
        random() * 60,
        random() * 256,
        2 + random() * 3,
        18 + random() * 30
      )
    }
    const map = new CanvasTexture(canvas)
    map.wrapS = map.wrapT = RepeatWrapping
    return map
  }, [c.water, c.foam])
  const fade = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 4
    canvas.height = 128
    const ctx = canvas.getContext("2d")!
    const gradient = ctx.createLinearGradient(0, 0, 0, 128)
    gradient.addColorStop(0, "#fff")
    gradient.addColorStop(0.55, "#fff")
    gradient.addColorStop(1, "#000")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 4, 128)
    return new CanvasTexture(canvas)
  }, [])

  useFrame((_, delta) => {
    // Through the ref: the hook's own value mustn't be mutated.
    const material = stream.current?.material as MeshBasicMaterial | undefined
    if (animate && material?.map) material.map.offset.y += delta * 0.6
  })

  const radius = 2.04
  return (
    <mesh
      ref={stream}
      position={[
        Math.sin(SPILL_ANGLE) * radius,
        TOP - 0.75,
        Math.cos(SPILL_ANGLE) * radius,
      ]}
      rotation={[0, SPILL_ANGLE, 0]}
    >
      <planeGeometry args={[0.22, 1.5]} />
      <meshBasicMaterial
        map={texture}
        alphaMap={fade}
        transparent
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function Island({ c, animate }: { c: Palette; animate: boolean }) {
  // The underside: a faceted cone of earth and rock, turned on a lathe.
  const underside = useMemo(
    () =>
      new LatheGeometry(
        [
          new Vector2(0.001, -1.75),
          new Vector2(0.5, -1.5),
          new Vector2(1.05, -1.1),
          new Vector2(1.55, -0.65),
          new Vector2(1.9, -0.32),
          new Vector2(2.06, -0.1),
          new Vector2(2.08, 0),
        ],
        11
      ),
    []
  )

  return (
    <group>
      <mesh position={[0, TOP - 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2.02, 2.08, 0.2, 64]} />
        <meshStandardMaterial color={c.grass} />
      </mesh>
      <mesh position={[0, TOP - 0.2, 0]} geometry={underside} castShadow>
        <meshStandardMaterial color={c.earth} flatShading />
      </mesh>
      {/* a darker rocky tip */}
      <mesh position={[0, -1.25, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.62, 0.62, 7]} />
        <meshStandardMaterial color={c.rock} flatShading />
      </mesh>

      <Tent c={c} />
      <Campfire c={c} animate={animate} />
      <Bike c={c} />
      <Pond c={c} animate={animate} />

      <Pine position={[-1.25, TOP, -0.95]} scale={1.15} c={c} />
      <Pine position={[-0.55, TOP, -1.5]} scale={0.95} c={c} />
      <Pine position={[1.1, TOP, -1.25]} scale={1.05} c={c} />
      <Pine position={[1.7, TOP, -0.35]} scale={0.75} c={c} />
      <RoundTree position={[-1.7, TOP, -0.15]} scale={0.95} c={c} />
      <RoundTree position={[0.35, TOP, -1.55]} scale={0.8} c={c} />
      <RoundTree position={[1.65, TOP, 0.35]} scale={0.6} c={c} />
      <Rock position={[-0.2, TOP + 0.03, 1.45]} scale={1.1} c={c} />
      <Rock position={[0.05, TOP + 0.02, 1.6]} scale={0.6} c={c} />
      <Rock position={[1.35, TOP + 0.03, -0.75]} scale={0.8} c={c} />
    </group>
  )
}

/** A puffy cloud of a few overlapping spheres, drifting side to side. */
function Cloud({
  position,
  scale = 1,
  speed = 0.25,
  c,
  animate,
}: {
  position: Vec3
  scale?: number
  speed?: number
  c: Palette
  animate: boolean
}) {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!animate || !ref.current) return
    ref.current.position.x =
      position[0] + Math.sin(clock.elapsedTime * speed) * 0.35
  })
  const puffs: [Vec3, number][] = [
    [[0, 0, 0], 0.32],
    [[0.32, -0.05, 0.05], 0.24],
    [[-0.3, -0.07, 0], 0.22],
    [[0.12, 0.14, -0.05], 0.22],
  ]

  return (
    <group ref={ref} position={position} scale={scale}>
      {puffs.map(([offset, radius], i) => (
        <mesh key={i} position={offset}>
          <sphereGeometry args={[radius, 16, 12]} />
          <meshStandardMaterial
            color={c.cloud}
            transparent
            opacity={c.cloudOpacity}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Two small rocks orbiting loosely under the island. */
function FloatingRocks({ c }: { c: Palette }) {
  return (
    <>
      <Float speed={2} floatIntensity={0.6} rotationIntensity={0.6}>
        <mesh position={[-1.9, -1.1, 0.6]}>
          <dodecahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial color={c.earth} flatShading />
        </mesh>
      </Float>
      <Float speed={1.6} floatIntensity={0.5} rotationIntensity={0.8}>
        <mesh position={[1.75, -1.35, -0.2]}>
          <dodecahedronGeometry args={[0.11, 0]} />
          <meshStandardMaterial color={c.rock} flatShading />
        </mesh>
      </Float>
    </>
  )
}

/** A slow sway of the island, so it reads as 3D even without a pointer. */
function Sway({
  animate,
  children,
}: {
  animate: boolean
  children: React.ReactNode
}) {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!animate || !ref.current) return
    ref.current.rotation.y = -0.25 + Math.sin(clock.elapsedTime * 0.25) * 0.22
  })
  return (
    <group ref={ref} rotation={[0, -0.25, 0]}>
      {children}
    </group>
  )
}

/** Eases the camera toward the pointer for a gentle parallax. */
function CameraRig({ animate }: { animate: boolean }) {
  useFrame(({ camera, pointer }) => {
    if (!animate) return
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.04
    camera.position.y += (2.5 + pointer.y * 0.45 - camera.position.y) * 0.04
    camera.lookAt(0, -0.3, 0)
  })
  return null
}

export default function IslandCanvas({
  theme,
  active,
  animate,
  onReady,
}: {
  theme: "light" | "dark"
  /** Off screen: stop rendering entirely. */
  active: boolean
  /** Reduced motion: render one still frame. */
  animate: boolean
  onReady: () => void
}) {
  const c = PALETTE[theme]
  const shadowCamera = 3

  return (
    <Canvas
      flat
      // PCF shadows: three r183+ removed PCF-soft (it fell back to this
      // anyway, with a console warning).
      shadows="percentage"
      dpr={[1, 1.5]}
      camera={{ position: [0, 2.5, 7.1], fov: 34 }}
      frameloop={active && animate ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ camera }) => {
        camera.lookAt(0, -0.3, 0)
        onReady()
      }}
    >
      <hemisphereLight args={[c.sky, c.ground, c.hemi]} />
      <ambientLight intensity={c.ambient} />
      <directionalLight
        position={[4, 7, 4]}
        color={c.sun}
        intensity={c.sunIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-camera-left={-shadowCamera}
        shadow-camera-right={shadowCamera}
        shadow-camera-top={shadowCamera}
        shadow-camera-bottom={-shadowCamera}
      />
      {theme === "dark" && (
        <Stars radius={40} depth={20} count={900} factor={3} fade speed={0.4} />
      )}

      <Float
        speed={animate ? 1.2 : 0}
        rotationIntensity={0.08}
        floatIntensity={animate ? 0.35 : 0}
      >
        <Sway animate={animate}>
          <Island c={c} animate={animate} />
          <Waterfall c={c} animate={animate} />
        </Sway>
      </Float>
      <FloatingRocks c={c} />

      <Cloud
        position={[-1.85, 1.0, -1.5]}
        scale={1.1}
        speed={0.2}
        c={c}
        animate={animate}
      />
      <Cloud
        position={[1.9, 1.35, -1.9]}
        scale={0.9}
        speed={0.28}
        c={c}
        animate={animate}
      />
      <Cloud
        position={[1.3, -1.3, 0.9]}
        scale={0.6}
        speed={0.24}
        c={c}
        animate={animate}
      />

      <CameraRig animate={animate} />
    </Canvas>
  )
}
