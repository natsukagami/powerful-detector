var Trie = require('./trie');
var path = require('path');

/**
 * implementation of the basic detector module
 * @return {Object[basicDetector]}
 */
var basicDetector = function() {
	this.Trie = new Trie();
	this.DList = [];
};

/**
 * basicDetector prototype
 * @type {Object}
 */
basicDetector.prototype = {
	/**
	 * clear the detector's status
	 * @return Nothing
	 */
	clear: function() {
		this.Trie.clear();
		this.DList.length = 0;
	},
	/**
	 * Return best io-matching string
	 * @param  {Bool} updated 	Whether to continue updating
	 * @return {Object {int, [string, string]}}
	 */
	best: function(updated) {
		if (updated === false) this.endUpdate();
		return (this.DList.length === 0 ? {
			id: 0,
			match: ['', '']
		}: this.DList[0]);
	}
};

// TODO: Document this
/**
 * Weird comparison of two strings
 * @param	{String} a
 * @param	{String} b
 * @return 	{int}
 */
function like_io(a, b) {
	var c = [], d = [];
	for (var i = 0; i < 256; ++i) c.push(0), d.push(0);
	a.split('').map(function(chr) { ++c[chr.charCodeAt(0)]; });
	b.split('').map(function(chr) { ++d[chr.charCodeAt(0)]; });
	var f = function(arr, v) {
		var p = 'iIoOaAeE';
		var ans = 0;
		for (var i = 0; i < 4; ++i) {
			ans += v * (i > 0 ? -1 : 1) * 10 * (arr[p.charCodeAt(2 * i)] + arr[p.charCodeAt(2 * i + 1)]);
		}
		return ans;
	};
	return f(c, 1) + f(d, -1);
}

/**
 * Return the difference between two paths
 * @param  {String} a [description]
 * @param  {String} b [description]
 * @return {int}
 */
function deltaDepth(a, b) {
	var count = function(str, chr) {
		var ans = 0;
		for (var i = 0; i < str.length; ++i) {
			if (str.charAt(i) === chr) ++ans;
		}
		return ans;
	};
	return Math.abs(count(a, path.sep) - count(b, path.sep));
}

/**
 * Compare two matching strings
 * @param  {Object {id: int, match: [string, string]}} a
 * @param  {Object {id: int, match: [string, string]}} b
 * @return {int}   Comparing a and b
 */
function better(a, b) {
	if (a.id !== b.id) return b.id - a.id;
	if (deltaDepth(a.match[0], a.match[1]) !== deltaDepth(b.match[0], b.match[1]))
		return deltaDepth(a.match[0], a.match[1]) - deltaDepth(b.match[0], b.match[1]);
	if (like_io(a.match[0], a.match[1]) !== like_io(b.match[0], b.match[1]))
		return -like_io(a.match[0], a.match[1]) + like_io(b.match[0], b.match[1]);
	return 0;
}

// TODO: Document this
/**
 * Reorder?
 * @param  {Object {id: int, match: [string, string]}} x
 * @return Nothing
 */
basicDetector.prototype.reorder = function(x) {
	var y = {
		id: x.id,
		match: [x.match[1], x.match[0]]
	};
	if (better(y, x) < 0) x.match = y.match;
};

// TODO: Document this
/**
 * Finish update?
 * @return Nothing
 */
basicDetector.prototype.endUpdate = function () {
	var Score = {};
	var Trie = this.Trie;
	for (var u = 0; u < Trie.Tree.length; ++u) {
		if (Trie.Tree[u].childs === 2 && Trie.Tree[u].leaves === 2) {
			var First = '', Second = '';
			for (var i = 0; i < 256; ++i) if (Trie.Tree[u].next[String.fromCharCode(i)]) {
				if (First === '')
					First = String.fromCharCode(i) + Trie.firstString(Trie.Tree[u].next[String.fromCharCode(i)]);
				else
					Second = String.fromCharCode(i) + Trie.firstString(Trie.Tree[u].next[String.fromCharCode(i)]);
			}
			Score[First + '~' + Second] = (Score[First + '~' + Second] === undefined ? 1 : Score[First + '~' + Second] + 1);
		}
	}
	this.DList = Object.keys(Score).map(function(key) {
		return {
			id: Score[key],
			match: key.split('~')
		};
	});
	var inst = this;
	this.DList.forEach(function(item) { inst.reorder(item); });
	this.DList.sort(better);
};

// TODO: Document this
/**
 * Extract IO list?
 * @return {Object {In: [string], Out: [String]}}
 */
basicDetector.prototype.extractIOList = function () {
	var List = {
		In: [],
		Out: []
	};
	if (this.DList.length === 0) return List; // Empty choice?
	var IF = this.DList[0].match[0], OF = this.DList[0].match[1];
	var Trie = this.Trie;
	var f = function(u, str) {
		if (Trie.exist(u, IF) && Trie.exist(u, OF)) {
			List.In.push(str + IF); List.Out.push(str + OF);
		}
		for (var i = 0; i < 256; ++i)
			if (Trie.Tree[u].next[String.fromCharCode(i)] !== undefined) {
				str = str + String.fromCharCode(i);
				f(Trie.Tree[u].next[String.fromCharCode(i)], str);
				str = str.slice(0, -1);
			}
	};
	f(0, '');
	return List;
};

// TODO: Document this
var forwardDetector = function() {
	basicDetector.call(this);
};
forwardDetector.prototype = Object.create(basicDetector.prototype);
forwardDetector.prototype.insert = function (str) {
	this.Trie.insert(str + '$');
};
forwardDetector.prototype.extractIOList = function(updated) {
	if (!updated) this.endUpdate();
	var List = basicDetector.prototype.extractIOList.call(this);
	List.In.forEach(function(item, id, arr) {
		arr[id] = item.slice(0, -1);
	});
	List.Out.forEach(function(item, id, arr) {
		arr[id] = item.slice(0, -1);
	});
	return List;
};

var backwardDetector = function() {
	basicDetector.call(this);
};
backwardDetector.prototype = Object.create(basicDetector.prototype);
backwardDetector.prototype.insert = function (str) {
	this.Trie.insert(str.split('').reverse().join('') + '$');
};
backwardDetector.prototype.extractIOList = function (updated) {
	if (!updated) this.endUpdate();
	var List = basicDetector.prototype.extractIOList.call(this);
	List.In.forEach(function(item, id, arr) {
		arr[id] = item.slice(0, -1).split('').reverse().join('');
	});
	List.Out.forEach(function(item, id, arr) {
		arr[id] = item.slice(0, -1).split('').reverse().join('');
	});
	return List;
};

module.exports = {
	basicDetector: basicDetector,
	forwardDetector: forwardDetector,
	backwardDetector: backwardDetector,
	better: better
};
