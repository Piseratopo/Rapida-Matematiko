/**
 * Asserts that a function's output matches an expected value.
 * @param {Function} _func The function to be tested
 * @param {Any} _input The input value to pass to the function
 * @param {Any} _expected The expected return value
 */
function test_assert(_func, _input, _expected) {
   var _actual = _func(_input);
    
   if (_actual != _expected) {
      var _error_msg = "TEST FAILED!" +
                        "\nInput: " + string(_input) +
                        "\nExpected: " + string(_expected) +
                        "\nActual: " + string(_actual);
        
      // show_error(msg, abort) -> setting abort to true stops the game
      show_error(_error_msg, true);
   } else {
      show_debug_message("Test Passed: " + string(_input) + " -> " + string(_actual));
   }
}