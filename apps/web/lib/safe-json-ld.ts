/**
 * JSON.stringify does not escape `<`, so user-supplied text containing
 * `</script>` inside a JSON-LD payload can break out of the <script> tag
 * and inject executable markup. Escape it as a unicode sequence, which is
 * valid inside a JSON string and never triggers HTML tag parsing.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
