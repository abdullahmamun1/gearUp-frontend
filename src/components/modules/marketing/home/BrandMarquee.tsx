import { getBrands } from "@/api/gear"
import { Marquee } from "@/components/shared/motion/Marquee"

/** A strip of the brands providers list, so it reflects the real catalogue. */
export async function BrandMarquee() {
  const res = await getBrands()
  const brands = (res.data ?? []).slice(0, 24)
  if (brands.length < 6) return null

  return (
    <section className="border-b py-8" aria-labelledby="brands-heading">
      <p
        id="brands-heading"
        className="mb-5 text-center text-eyebrow text-muted-foreground"
      >
        Gear from brands you know
      </p>
      <Marquee label="Brands on GearUp" speed={55}>
        {brands.map((brand) => (
          <span
            key={brand}
            className="font-heading text-xl font-semibold whitespace-nowrap text-foreground/45 transition-colors hover:text-foreground"
          >
            {brand}
          </span>
        ))}
      </Marquee>
    </section>
  )
}
