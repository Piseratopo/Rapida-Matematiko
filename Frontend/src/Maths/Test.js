import { normalizeDecimal } from "./Normalization.js";
import { compareDecimalStrings } from "./Comparison.js";
import { addDecimalStrings } from "./BasicOperations.js";

function testNormalization() {
   console.log("=== Normalization test ===")
   console.log(normalizeDecimal("000123.4500"));
   console.log(normalizeDecimal("-000123.4500"));
   console.log(normalizeDecimal("--123.45"));
   console.log(normalizeDecimal(".00"));
   console.log(normalizeDecimal("0"));
   console.log(normalizeDecimal("00"));
   console.log(normalizeDecimal("-0"));
   console.log(normalizeDecimal("-00"));
   console.log(normalizeDecimal(".31"));
   console.log(normalizeDecimal(".031"));
   console.log(normalizeDecimal("-.31"));
   console.log(normalizeDecimal("----864.3135"));
   console.log(normalizeDecimal("-----864.3135"));
}

function testComparison() {
   console.log("=== Comparison test ===")
   console.log(compareDecimalStrings("234397293", "234397293"));
   console.log(compareDecimalStrings("234397293", "234397294"));
   console.log(compareDecimalStrings("234397293", "234397292"));
   console.log(compareDecimalStrings("234397293", "234397"));
   console.log(compareDecimalStrings("234397293", "11111111111111111111"));
   console.log(compareDecimalStrings("630397283", "-630397283"));
   console.log(compareDecimalStrings("-630397283", "630397283"));
   console.log(compareDecimalStrings("-630397283", "-630397283"));
   console.log(compareDecimalStrings("-630397283", "-630397284"));
   console.log(compareDecimalStrings("-10000000000000000000000", "-630397282"));
   console.log(compareDecimalStrings("12.34", "12.34"));
   console.log(compareDecimalStrings("12.34", "123.4"));
   console.log(compareDecimalStrings("12.34", "12.345"));
   console.log(compareDecimalStrings("12.34", "12.4"))
}

function testAdd() {
   console.log(addDecimalStrings("123", "877"));          // "1000"
   console.log(addDecimalStrings("0.1", "0.2"));          // "0.3"
   console.log(addDecimalStrings("999.999", "0.001"));    // "1000"
   console.log(addDecimalStrings("12345678901234567890", "0.55")); // "12345678901234567890.55"
   console.log(addDecimalStrings("1.500", "2.50"));       // "4"
}

testAdd();
