// Renders a 2-letter country code as a flag emoji via Unicode regional
// indicator symbols (e.g. "US" -> 🇺🇸). No data/asset dependency.
export function countryFlag(code: string): string {
  if (!code || code.length !== 2 || code.toUpperCase() === "XX") return "🏳️";
  const codePoints = [...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
