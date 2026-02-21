/**
 * Removes leading zeros from integer part and trailing zeros from fractional part.
 * If fractional part becomes empty, returns only integer part.
 * @param {string} intPart - Integer part of the number
 * @param {string} fracPart - Fractional part of the number
 * @returns {string} - Normalized decimal string
 */
export function normalizeDecimal(decimalString) {
   // Remove double negative sign
   while (decimalString.startsWith('--')) {
      decimalString = decimalString.slice(2);
   }

   // Handle negative numbers
   let isNegative = false;
   if (decimalString.startsWith('-')) {
      isNegative = true;
      decimalString = decimalString.slice(1);
   }

   // Split into integer and fractional parts
   let [intPart, fracPart = ""] = decimalString.split(".");

   // Remove leading zeros from integer part (but keep at least one zero)
   intPart = intPart.replace(/^0+(?!$)/, "");

   // Remove trailing zeros from fractional part
   fracPart = fracPart.replace(/0+$/, "");

   // Build result
   let result = fracPart.length === 0 ? intPart : `${intPart}.${fracPart}`;

   // Handle zero
   if (result === "" || result === "0") return "0";

   // Add negative sign if needed
   return isNegative ? `-${result}` : result;
}
