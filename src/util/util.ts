// http://www.unicode.org/reports/tr38/#BlockListing
export function charInCJK(char) {
  const codePoint = char.codePointAt(0);
  return (
    (0x3400 <= codePoint && codePoint <= 0x4dbf) || // 	CJK Unified Ideographs Extension A
    (0x4e00 <= codePoint && codePoint <= 0x9ffc) || //	CJK Unified Ideographs
    (0xf900 <= codePoint && codePoint <= 0xfa6d) || // 	CJK Compatibility Ideographs
    (0xfa70 <= codePoint && codePoint <= 0xfad9) ||
    (0x20000 <= codePoint && codePoint <= 0x2a6dd) || // CJK Unified Ideographs Extension B
    (0x2a700 <= codePoint && codePoint <= 0x2b734) || // CJK Unified Ideographs Extension C
    (0x2b740 <= codePoint && codePoint <= 0x2b81d) || // JK Unified Ideographs Extension D
    (0x2b820 <= codePoint && codePoint <= 0x2cea1) || // CJK Unified Ideographs Extension E
    (0x2ceb0 <= codePoint && codePoint <= 0x2ebe0) || // CJK Unified Ideographs Extension F
    (0x30000 <= codePoint && codePoint <= 0x3134a) || // CJK Unified Ideographs Extension G
    (0x2f800 <= codePoint && codePoint <= 0x2fa1d)
  ); // 	CJK Compatibility Supplement
}
