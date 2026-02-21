import { normalizeDecimal } from "./Normalization.js";

export function addDecimalStrings(a, b) {
   // Normalize the inputs
   a = normalizeDecimal(a);
   b = normalizeDecimal(b);

   // Split into integer and fractional parts
   const [ai, af = ""] = a.split(".");
   const [bi, bf = ""] = b.split(".");

   // Pad fractional parts to the same length
   const fracLen = Math.max(af.length, bf.length);
   const afPad = af.padEnd(fracLen, "0");
   const bfPad = bf.padEnd(fracLen, "0");

   // Add fractional part (right-to-left)
   let carry = 0;
   let fracSum = "";
   for (let i = fracLen - 1; i >= 0; i--) {
      const d = parseInt(afPad[i]) + parseInt(bfPad[i]) + carry;
      fracSum = String(d % 10) + fracSum;
      carry = Math.floor(d / 10);
   }

   // Add integer part (right-to-left)
   const aiRev = ai.split("").reverse();
   const biRev = bi.split("").reverse();
   const intLen = Math.max(aiRev.length, biRev.length);

   let intSum = "";
   for (let i = 0; i < intLen; i++) {
      const db = i < biRev.length ? parseInt(biRev[i]) : 0;
      const da = i < aiRev.length ? parseInt(aiRev[i]) : 0;
      const d = da + db + carry;
      intSum = String(d % 10) + intSum;
      carry = Math.floor(d / 10);
   }
   if (carry) intSum = String(carry) + intSum;

   // Normalize the result
   return normalizeDecimal(intSum + "." + fracSum);
}

