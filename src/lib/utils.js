/**
 * Merge class names (strings, arrays, objects with truthy keys).
 * Minimal clone of clsx for Tailwind.
 */
export function cn(...inputs) {
  const out = [];
  for (const x of inputs) {
    if (x == null) continue;
    if (typeof x === "string") out.push(x);
    else if (Array.isArray(x)) out.push(cn(...x));
    else if (typeof x === "object") {
      for (const [k, v] of Object.entries(x)) if (v) out.push(k);
    }
  }
  return out.filter(Boolean).join(" ");
}
