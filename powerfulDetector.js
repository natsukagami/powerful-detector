var { basicDetector, forwardDetector, backwardDetector, better } = require('./basicDetector');

/**
 * Check if the single-char string x is a digit
 * @param  {String}  x
 * @return {Boolean}
 */
function isDigit(x) {
	return (x.length === 1 &&
		x.charCodeAt(0) >= '0'.charCodeAt(0) &&
		x.charCodeAt(0) <= '9'.charCodeAt(0));
}
/**
 * Count the number of digits in the string
 * @param  {String} string
 * @param  {int}    idx 	The starting index
 * @return {int}
 */
var countDigitFrom = function(string, idx) {
	var ans = 0;
	for (var i = idx; i < string.length; ++i) {
		var chr = string.charAt(i);
		if (isDigit(chr)) ans = ans + 1;
	}
	return ans;
};

/**
 * Sort the testcases by order?
 * @param  {Object {In: [string], Out: [string]}} List
 * @return {Object {In: [string], Out: [string]}} Sorted List
 */
var smartSort = function(List) {
	/**
	 * Compares the two object in list, passed by index
	 * @param  {int} a Index of List object
	 * @param  {int} b Index of List object
	 * @return {int} Comparison value
	 */
	var inst = this;
	this.comp = function(a, b) {
		var A = List.In[a], B = List.In[b];
		for (var i = 0; i < Math.min(A.length, B.length); ++i)
			if (A.charAt(i) != B.charAt(i)) {
				if (isDigit(A.charAt(i)) && isDigit(B.charAt(i))) {
					var cA = countDigitFrom(A, i),
						cB = countDigitFrom(B, i);
					if (cA !== cB) return cA - cB;
				}
				return A.charCodeAt(i) - B.charCodeAt(i);
			}
		return A.length - B.length;
	};
	/**
	 * Returns the permuted list, from the array of indices
	 * @param  {[int]} Indices 							The array of indices
	 * @return {Object {In: [string], Out: [string]}}   The permuted list
	 */
	this.applyPermutation = function(Indices) {
		var newList = [];
		Indices.forEach(function(idx) { newList.push([List.In[idx], List.Out[idx]]); });
		return newList;
	};
	/**
	 * Sorts the indices and return the permuted list
	 * @return {Object {In: [string], Out: [string]}}   The permuted list
	 */
	this.execute = function() {
		var Indices = [];
		for (var i = 0; i < List.In.length; ++i) Indices.push(i);
		Indices.sort(inst.comp);
		return inst.applyPermutation(Indices);
	};
};

/**
 * Implementation of the main detector, receiving the
 * list of files, then sort them and pair them by input-output.
 * @param {[string]} files	List of files
 * @return {Object} [description]
 */
var detector = function(files) {
	var inst = this;
	this.fwd = new forwardDetector();
	this.bwd = new backwardDetector();
	this.clear = function() {
		inst.fwd.clear(); inst.bwd.clear();
	};
	this.insert = function(str) {
		inst.fwd.insert(str); inst.bwd.insert(str);
	};
	this.extractIOList = function() {
		files.forEach(function(file) { inst.insert(file); });
		var List;
		if (better(inst.bwd.best(false), inst.fwd.best(false)) >= 0) {
			List = inst.fwd.extractIOList(true);
		} else {
			List = inst.bwd.extractIOList(true);
		}
		return (new smartSort(List)).execute();
	};
};

module.exports = detector;
