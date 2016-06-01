/**
 * Basic implementation of ASCII trie
 * @return {Object} a Trie
 */
var Trie = function() {
	var Node = function() {
		this.next = {};
		this.childs = 0;
		this.leaves = 0;
	};
	var inst = this;
	this.Tree = [(new Node())];
	var T = this.Tree;
	/**
	 * Clears the Trie
	 * @return this
	 */
	this.clear = function() {
		T.length = 0;
		T.push(new Node());
		return inst;
	};
	/**
	 * Inserts a new string into the Trie
	 * @param  {String} str The string to be added
	 * @return this
	 */
	this.insert = function(str) {
		var cur = 0;
		for (var i = 0; i < str.length; ++i) {
			var ch = str.charAt(i);
			if (T[cur].next[ch] === undefined) {
				T[cur].next[ch] = T.length;
				T.push(new Node());
				++T[cur].childs;
			}
			++T[cur].leaves; cur = T[cur].next[ch];
		}
		++T[cur].leaves;
		return inst;
	};
	/**
	 * Returns the alphabetically smallest string, starting from node u
	 * @param  {Integer} u Index of the node which the string starts from
	 * @return {String}    Found string
	 */
	this.firstString = function(u) {
		var Str = '';
		while (T[u].childs > 0) {
			for (var i = 0; i < 256; ++i) {
				var ch = String.fromCharCode(i);
				if (T[u].next[ch] !== undefined) {
					Str = Str + ch;
					u = T[u].next[ch]; break;
				}
			}
		}
		return Str;
	};
	/**
	 * Return whether the string given exists at node u
	 * @param  {Integer} u	The starting node
	 * @param  {String} str The string to check
	 * @return {Bool}     	`true` if there exists a string
	 */
	this.exist = function(u, str) {
		for (var i = 0; i < str.length; ++i) {
			var k = str.charAt(i);
			if (T[u].next[k] !== undefined) u = T[u].next[k];
			else return false;
		}
		return true;
	};
};

module.exports = Trie;
