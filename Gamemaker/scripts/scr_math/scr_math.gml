/**
 * Normalizes a number string by removing unnecessary zeros and decimals.
 * @param {String} _val The number string (e.g., "-0012.50")
 * @returns {String} The cleaned string (e.g., "-12.5")
 */
function normalize(_val) {
    // 1. Handle the sign
    var _is_negative = (string_char_at(_val, 1) == "-");
    if (_is_negative) _val = string_delete(_val, 1, 1);

    // Add a leading zero if the value starts directly with a decimal point
    if (string_char_at(_val, 1) == ".") {
        _val = "0" + _val;
    }

    // 2. Remove leading zeros (Stop if we hit a non-zero or "0.")
    while (string_length(_val) > 1 && string_char_at(_val, 1) == "0" && string_char_at(_val, 2) != ".") {
        _val = string_delete(_val, 1, 1);
    }

    // 3. Handle decimal and trailing zeros
    if (string_pos(".", _val) != 0) {
        while (string_char_at(_val, string_length(_val)) == "0") {
            _val = string_delete(_val, string_length(_val), 1);
        }
        // If it ends with ".", remove it (integer case)
        if (string_char_at(_val, string_length(_val)) == ".") {
            _val = string_delete(_val, string_length(_val), 1);
        }
    }

    // 4. Cleanup result and re-apply sign
    if (_val == "" || _val == "0") return "0";
    return _is_negative ? ("-" + _val) : _val;
}

/**
 * Adds two decimal strings using digit-by-digit arithmetic.
 */
function string_add(_s1, _s2) {
    var _neg1 = string_char_at(_s1, 1) == "-";
    var _neg2 = string_char_at(_s2, 1) == "-";
    var _v1 = _neg1 ? string_delete(_s1, 1, 1) : _s1;
    var _v2 = _neg2 ? string_delete(_s2, 1, 1) : _s2;

    if (_neg1 == _neg2) {
        // Both same sign: Add magnitudes, keep sign
        var _res = _manual_math(_v1, _v2, true);
        return normalize(_neg1 ? "-" + _res : _res);
    } else {
        // Different signs: Subtract smaller from larger
        if (compare_mag(_v1, _v2) >= 0) {
            var _res = _manual_math(_v1, _v2, false);
            return normalize(_neg1 ? "-" + _res : _res);
        } else {
            var _res = _manual_math(_v2, _v1, false);
            return normalize(_neg2 ? "-" + _res : _res);
        }
    }
}

/**
 * Subtracts two decimal strings using digit-by-digit arithmetic.
 */
function string_subtract(_s1, _s2) {
    // A - B is the same as A + (-B)
    var _neg2 = string_char_at(_s2, 1) == "-";
    var _v2_inv = _neg2 ? string_delete(_s2, 1, 1) : "-" + _s2;
    return string_add(_s1, _v2_inv);
}

/**
 * Core manual arithmetic logic (Primary School Algorithm)
 * @param {String} _v1 First magnitude (positive string)
 * @param {String} _v2 Second magnitude (positive string)
 * @param {Bool} _is_add True to add, False to subtract (_v1 must be >= _v2)
 */
function _manual_math(_v1, _v2, _is_add) {
    // 1. Align Decimals
    var _p1 = string_pos(".", _v1);
    var _p2 = string_pos(".", _v2);
    if (_p1 == 0) { _v1 += ".0"; _p1 = string_pos(".", _v1); }
    if (_p2 == 0) { _v2 += ".0"; _p2 = string_pos(".", _v2); }

    // Pad fractional part
    var _f1 = string_length(_v1) - _p1;
    var _f2 = string_length(_v2) - _p2;
    repeat(abs(_f1 - _f2)) {
        if (_f1 < _f2) _v1 += "0"; else _v2 += "0";
    }
    
    // Pad integer part
    repeat(abs(_p1 - _p2)) {
        if (_p1 < _p2) _v1 = "0" + _v1; else _v2 = "0" + _v2;
    }

    // 2. Iterate Backwards
    var _result = "";
    var _carry = 0;
    
    for (var i = string_length(_v1); i >= 1; i--) {
        var _c1 = string_char_at(_v1, i);
        if (_c1 == ".") {
            _result = "." + _result;
            continue;
        }
        
        var _d1 = real(_c1);
        var _d2 = real(string_char_at(_v2, i));
        
        if (_is_add) {
            var _sum = _d1 + _d2 + _carry;
            _carry = _sum >= 10 ? 1 : 0;
            _result = string(_sum % 10) + _result;
        } else {
            var _sub = _d1 - _d2 - _carry;
            if (_sub < 0) {
                _sub += 10;
                _carry = 1;
            } else {
                _carry = 0;
            }
            _result = string(_sub) + _result;
        }
    }
    
    if (_is_add && _carry > 0) _result = "1" + _result;
    return _result;
}

/// @function compare_mag(_v1, _v2)
/// @description Compares the absolute magnitude of two decimal number strings of arbitrary length.
/// @param {String} _v1 The first number string.
/// @param {String} _v2 The second number string.
/// @returns {Real} Returns 1 if |v1| > |v2|, -1 if |v1| < |v2|, or 0 if they are equal in magnitude.
function compare_mag(_v1, _v2) {
    var _norm_v1 = normalize(_v1);
    var _norm_v2 = normalize(_v2);
    
    // Strip negative signs to compare absolute magnitude
    if (string_char_at(_norm_v1, 1) == "-") {
        _norm_v1 = string_delete(_norm_v1, 1, 1);
    }
    if (string_char_at(_norm_v2, 1) == "-") {
        _norm_v2 = string_delete(_norm_v2, 1, 1);
    }
    
    // Split the first number into integer and fractional parts
    var _dot1 = string_pos(".", _norm_v1);
    var _int1 = "";
    var _frac1 = "";
    if (_dot1 == 0) {
        _int1 = _norm_v1;
    } else {
        _int1 = string_copy(_norm_v1, 1, _dot1 - 1);
        _frac1 = string_delete(_norm_v1, 1, _dot1);
    }

    // Split the second number into integer and fractional parts
    var _dot2 = string_pos(".", _norm_v2);
    var _int2 = "";
    var _frac2 = "";
    if (_dot2 == 0) {
        _int2 = _norm_v2;
    } else {
        _int2 = string_copy(_norm_v2, 1, _dot2 - 1);
        _frac2 = string_delete(_norm_v2, 1, _dot2);
    }

    // 1. Compare Integer Lengths
    var _len_int1 = string_length(_int1);
    var _len_int2 = string_length(_int2);
    
    if (_len_int1 > _len_int2) return 1;
    if (_len_int1 < _len_int2) return -1;

    // 2. Compare Integers Lexicographically (since lengths are now equal)
    if (_int1 > _int2) return 1;
    if (_int1 < _int2) return -1;

    // 3. Normalize fractional parts to the same length by padding trailing zeros
    var _len_frac1 = string_length(_frac1);
    var _len_frac2 = string_length(_frac2);

    if (_len_frac1 < _len_frac2) {
        repeat (_len_frac2 - _len_frac1) {
            _frac1 += "0";
        }
    } else if (_len_frac2 < _len_frac1) {
        repeat (_len_frac1 - _len_frac2) {
            _frac2 += "0";
        }
    }

    // 4. Compare Fractional Parts
    if (_frac1 > _frac2) return 1;
    if (_frac1 < _frac2) return -1;

    // Magnitudes are equal
    return 0;
}

/// @function compare(_v1, _v2)
/// @description Compares two signed decimal number strings of arbitrary length.
/// @param {String} _v1 The first number string.
/// @param {String} _v2 The second number string.
/// @returns {Real} Returns 1 if _v1 > _v2, -1 if _v1 < _v2, or 0 if they are equal.
function compare(_v1, _v2) {
   var _norm_v1 = normalize(_v1);
   var _norm_v2 = normalize(_v2);

   var _neg1 = (string_char_at(_norm_v1, 1) == "-");
   var _neg2 = (string_char_at(_norm_v2, 1) == "-");

   // One negative, one non-negative
   if (_neg1 && !_neg2) return -1;
   if (!_neg1 && _neg2) return 1;

   // Both negative: inverted magnitude comparison (-5 is smaller than -3)
   if (_neg1 && _neg2) {
      var _mag_res = compare_mag(_norm_v1, _norm_v2);
      return -_mag_res;
   }

   // Both positive or zero
   return compare_mag(_norm_v1, _norm_v2);
}