// Normalize
test_cases_normalize = [
	["12.5", "12.5"],
	["0012.50", "12.5"],
	["-0012.50", "-12.5"],
	["123.00", "123"],
	["0.00", "0"], 
	["-005.050", "-5.05"],
	["-0", "0"],
];

//for (var i = 0; i < array_length(test_cases_normalize); i++) {
//	var _case = test_cases_normalize[i];
//	test_assert(normalize, _case[0], _case[1]);
//}

// Add test
test_case_add = [
	[["0.1", "0.2"], "0.3"],
	[["99.9", "0.1"], "100"],
	[["-50", "10"], "-40"],
	[["0.12345678", "0.0000002026"], "0.1234569826"],
	[["123456789010237456789", "987654321099887766554"], "1111111110110125223343"],
	[["123456.777777", "789789123.123"], "789912579.900777"]
]
for (var i = 0; i < array_length(test_case_add); i++) {
	var _case = test_case_add[i];
	test_assert(function(_i){ return string_add(_i[0], _i[1]); }, _case[0], _case[1]);
}

// Subtract test
test_assert(function(_i){ return string_subtract(_i[0], _i[1]); }, ["1", "0.01"], "0.99");
test_assert(function(_i){ return string_subtract(_i[0], _i[1]); }, ["10", "20"], "-10");
test_assert(function(_i){ return string_subtract(_i[0], _i[1]); }, ["0", "0.0001"], "-0.0001");