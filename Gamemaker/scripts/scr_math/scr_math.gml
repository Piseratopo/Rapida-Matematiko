/**
 * Normalizes a number string by removing unnecessary zeros and decimals.
 * @param {String} _val The number string (e.g., "-0012.50")
 * @returns {String} The cleaned string (e.g., "-12.5")
 */
function normalize(_val) {
    // 1. Handle the sign
    var _is_negative = (string_char_at(_val, 1) == "-");
    if (_is_negative) _val = string_delete(_val, 1, 1);

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
        if (_compare_mag(_v1, _v2) >= 0) {
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

/**
 * Compares two positive number strings. Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal.
 */
function _compare_mag(_v1, _v2) {
    // Simple way: check length after normalizing to same decimal precision
    // but a quick GML trick is comparing real() if they aren't massive.
    // For manual logic:
    var _n1 = normalize(_v1);
    var _n2 = normalize(_v2);
    if (string_length(_n1) > string_length(_n2) && string_pos(".", _n1) >= string_pos(".", _n2)) return 1;
    // For the purpose of this manual logic, real() is fine for small comparisons
    var _r1 = real(_n1); var _r2 = real(_n2);
    if (_r1 > _r2) return 1;
    if (_r1 < _r2) return -1;
    return 0;
}