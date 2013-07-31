var deps = [
	'underscore',	// underscore is a dep and not a test case: remember to skip it.

	'example-tests',
];



define(deps, function() {

	console.log('initializing box tests');
	
	// we are going to run all the dependencies as function-wrapped tests, 
	// in the order they were listed.

	// skip the first dependency, as it is underscore
	var args = Array.prototype.splice.call(arguments, 1);

	console.log(args);
	
	_.each(args, function(testcase, index) {
		testcase();
	});
});