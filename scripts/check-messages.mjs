// Every message in messages/en must exist in messages/bn (and vice versa),
// with the same {placeholders}. Run: npm run check:messages
import fs from "node:fs"
import path from "node:path"

const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "messages")
const flatten = (value, prefix = "", out = {}) => {
  for (const [key, child] of Object.entries(value)) {
    const id = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === "object") flatten(child, id, out)
    else out[id] = String(child)
  }
  return out
}
const placeholders = (text) =>
  [...text.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((m) => m[1]).sort().join(",")

// Optional: node scripts/check-messages.mjs gear admin  (only those files)
const only = process.argv.slice(2).map((name) => `${name}.json`)

let problems = 0
const report = (message) => { problems++; console.log(message) }
for (const file of fs.readdirSync(path.join(root, "en"))) {
  if (only.length && !only.includes(file)) continue
  const read = (locale) => {
    const target = path.join(root, locale, file)
    return fs.existsSync(target) ? flatten(JSON.parse(fs.readFileSync(target, "utf8"))) : null
  }
  const en = read("en")
  const bn = read("bn")
  if (!bn) { report(`missing messages/bn/${file}`); continue }
  for (const key of Object.keys(en)) {
    if (!(key in bn)) report(`bn/${file}: missing ${key}`)
    else if (placeholders(en[key]) !== placeholders(bn[key]))
      report(`bn/${file}: ${key} placeholders differ ({${placeholders(en[key])}} vs {${placeholders(bn[key])}})`)
    else if (bn[key].trim() === "") report(`bn/${file}: ${key} is empty`)
  }
  for (const key of Object.keys(bn)) if (!(key in en)) report(`bn/${file}: extra key ${key}`)
}
console.log(problems ? `\n${problems} problem(s)` : "All message files match")
process.exit(problems ? 1 : 0)
