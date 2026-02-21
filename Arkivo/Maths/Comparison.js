import { normalizeDecimal } from "./Normalization.js";

export function isNegative(a) {
   return a.startsWith("-");
}

export function compareDecimalStrings(a, b) {
   a = normalizeDecimal(a);
   b = normalizeDecimal(b);

   if (isNegative(a) && !isNegative(b)) return -1;
   if (!isNegative(a) && isNegative(b)) return 1;
   if (isNegative(a) && isNegative(b)) return compareDecimalStrings(b.slice(1), a.slice(1));

   let [ai, af = ""] = a.split(".");
   let [bi, bf = ""] = b.split(".");

   // Compare integer parts
   if (ai.length > bi.length) return 1;
   if (ai.length < bi.length) return -1;

   if (ai > bi) return 1;
   if (ai < bi) return -1;

   // Compare fractional parts

   const fracLen = Math.max(af.length, bf.length);
   af = af.padEnd(fracLen, "0");
   bf = bf.padEnd(fracLen, "0");

   if (af == bf) return 0;

   return compareDecimalStrings(af, bf);
}
