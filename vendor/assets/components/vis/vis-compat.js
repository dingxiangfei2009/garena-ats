define('util/traits',[], function() {
'use strict';

function is_number(value) {
	return 'number' === typeof value;
}

function is_string(value) {
	return 'string' === typeof value;
}

function is_object(value) {
	return value && 'object' === typeof value;
}

function is_array(value) {
	return Array.isArray(value);
}

function is_map(value) {
	return value instanceof Map;
}

function is_set(value) {
	return value instanceof Set;
}

function is_function(value) {
	return 'function' === typeof value;
}

function is_symbol(value) {
	return 'symbol' === typeof value;
}

function is_undefined(value) {
	return 'undefined' === typeof value;
}

function is_null(value) {
	return value === null;
}

function EMPTY_FUNCTION() {
}

function IDENTITY_FUNCTION(x) {
	return x;
}

function CONST_FUNCTION(x) {
	return function() {
		return x;
	};
}

return Object.freeze({
	is_number: is_number,
	is_function: is_function,
	is_object: is_object,
	is_array: is_array,
	is_symbol: is_symbol,
	is_string: is_string,
	is_map: is_map,
	is_set: is_set,
	is_undefined: is_undefined,
	is_null: is_null,
	EMPTY_FUNCTION: EMPTY_FUNCTION,
	IDENTITY_FUNCTION: IDENTITY_FUNCTION,
	CONST_FUNCTION: CONST_FUNCTION
});

});

define('util/data',[], function($){

return Object.freeze({
});

});
define('util/async',[], function() {
'use strict';
//var immediate_queue = [];
//
//function immediate_run_all() {
//	var _queue = immediate_queue.slice();
//	immediate_queue.length = 0;
//	for (var functor of _queue) {
//		functor();
//	}
//}

function async(functor, next_cycle, timeout) {
	switch(next_cycle) {
	case 'animate':
		requestAnimationFrame(functor);
		break;
	case 'timeout':
		setTimeout(functor, timeout || 0);
		break;
	default:
		Promise.resolve().then(functor);
	}
}

return Object.defineProperties({}, {
	async: {
		value: async,
		enumerable: true
	}
});

});
define('util/xhr',[], function () {
'use strict';

function xhr(options) {
	var xhr_object = new XMLHttpRequest;
	xhr_object.open(options.method || 'get', options.url);
	if (options.mime)
		xhr_object.overrideMimeType(options.mime);
	if (options.headers)
		for (var header of options.headers)
			xhr_object.setRequestHeader(header[0], header[1]);
	if (options.response_type)
		xhr_object.responseType = options.response_type;
	xhr_object.send(null);
	return new Promise(function (resolve, reject) {
		xhr_object.addEventListener('load', function (e) {
			if (xhr_object.readyState === 4) {
				if (xhr_object.status === 200) {
					resolve(xhr_object.response);
				} else {
					reject(xhr_object.status);
				}
			}
		});
	});
}

return xhr;
});

define('util/math',[], function () {
'use strict';

function sqr(x) {
  return x * x;
}

return Object.assign(Object.create(Math), {
  bit_and(x, y) {
    return x & y;
  },
  bit_or(x, y) {
    return x | y;
  },
  bit_xor(x, y) {
    return x ^ y;
  },
  bit_sll(x, y) {},
  cubic_bezier(x1, y1, x2, y2, epsilon) {
    epsilon = epsilon || 1e-5;
    function cubic(t, a, b) {
      var t2 = sqr(t), t3 = t2 * t;
      return 3 * a * (t3 - 2 * t2 + t) + 3 * b * (t2 - t3) + t3;
    }
    function cubic_deriv(t, a, b) {
      return 3 * sqr(1 - t) * a + 6 * (1 - t) * t * (b - a) + 3 * sqr(t) * (1 - b);
    }
    function solve_t(x) {
      var t = 0.5, abs = Infinity;
      for (var i = 0; i < 10 && abs > epsilon; ++i) {
        var new_x = cubic(t, x1, x2);
        var d = cubic_deriv(t, x1, x2);
        if (d < epsilon)  // divide by zero
          return solve_t_bisect(t, x);
        abs = Math.abs(new_x - x);
        t -= (new_x - x) / d;
      }
      return solve_t_bisect(t, x);
    }
    function solve_t_bisect(t, x) {
      var low_t = 0, high_t = 1, mid = t;
      while(high_t - low_t > epsilon) {
        if (cubic(mid, x1, x2) > x)
          high_t = mid;
        else
          low_t = mid;
        mid = (low_t + high_t) / 2;
      }
      return mid;
    }
    return x => cubic(solve_t(x), y1, y2);
  }
});

});

define('util/inherit',[], function () {
'use strict';

function inherit(subclass, base, proto) {
	subclass.prototype = Object.assign(Object.create(base.prototype), proto);
	subclass.prototype.constructor = subclass;
}

return inherit;

});
define('util/adt',['./inherit'], function (inherit) {
'use strict';

// AVL Tree
// github.com/louischatriot/node-binary-search-tree, GPL

/**
 * Constructor
 * @param {Object} options Optional
 * @param {Boolean}  options.unique Whether to enforce a 'unique' constraint on the key or not
 * @param {Key}      options.key Initialize this BST's key with key
 * @param {Value}    options.value Initialize this BST's data with [value]
 * @param {Function} options.compareKeys Initialize this BST's compareKeys
 */
function BinarySearchTree (options) {
  options = options || {};

  this.left = null;
  this.right = null;
  this.parent = options.parent !== undefined ? options.parent : null;
  if (options.hasOwnProperty('key')) { this.key = options.key; }
  this.data = options.hasOwnProperty('value') ? [options.value] : [];
  this.unique = options.unique || false;

  this.compareKeys = options.compareKeys;
  this.checkValueEquality = options.checkValueEquality;
}


// ================================
// Methods used to test the tree
// ================================


/**
 * Get the descendant with max key
 */
BinarySearchTree.prototype.getMaxKeyDescendant = function () {
  if (this.right) {
    return this.right.getMaxKeyDescendant();
  } else {
    return this;
  }
};


/**
 * Get the maximum key
 */
BinarySearchTree.prototype.getMaxKey = function () {
  return this.getMaxKeyDescendant().key;
};


/**
 * Get the descendant with min key
 */
BinarySearchTree.prototype.getMinKeyDescendant = function () {
  if (this.left) {
    return this.left.getMinKeyDescendant()
  } else {
    return this;
  }
};


/**
 * Get the minimum key
 */
BinarySearchTree.prototype.getMinKey = function () {
  return this.getMinKeyDescendant().key;
};


/**
 * Check that all nodes (incl. leaves) fullfil condition given by fn
 * test is a function passed every (key, data) and which throws if the condition is not met
 */
BinarySearchTree.prototype.checkAllNodesFullfillCondition = function (test) {
  if (!this.hasOwnProperty('key')) { return; }

  test(this.key, this.data);
  if (this.left) { this.left.checkAllNodesFullfillCondition(test); }
  if (this.right) { this.right.checkAllNodesFullfillCondition(test); }
};


/**
 * Check that the core BST properties on node ordering are verified
 * Throw if they aren't
 */
BinarySearchTree.prototype.checkNodeOrdering = function () {
  var self = this;

  if (!this.hasOwnProperty('key')) { return; }

  if (this.left) {
    this.left.checkAllNodesFullfillCondition(function (k) {
      if (self.compareKeys(k, self.key) >= 0) {
        throw 'Tree with root ' + self.key + ' is not a binary search tree';
      }
    });
    this.left.checkNodeOrdering();
  }

  if (this.right) {
    this.right.checkAllNodesFullfillCondition(function (k) {
      if (self.compareKeys(k, self.key) <= 0) {
        throw 'Tree with root ' + self.key + ' is not a binary search tree';
      }
    });
    this.right.checkNodeOrdering();
  }
};


/**
 * Check that all pointers are coherent in this tree
 */
BinarySearchTree.prototype.checkInternalPointers = function () {
  if (this.left) {
    if (this.left.parent !== this) { throw 'Parent pointer broken for key ' + this.key; }
    this.left.checkInternalPointers();
  }

  if (this.right) {
    if (this.right.parent !== this) { throw 'Parent pointer broken for key ' + this.key; }
    this.right.checkInternalPointers();
  }
};


/**
 * Check that a tree is a BST as defined here (node ordering and pointer references)
 */
BinarySearchTree.prototype.checkIsBST = function () {
  this.checkNodeOrdering();
  this.checkInternalPointers();
  if (this.parent) { throw "The root shouldn't have a parent"; }
};


/**
 * Get number of keys inserted
 */
BinarySearchTree.prototype.getNumberOfKeys = function () {
  var res;

  if (!this.hasOwnProperty('key')) { return 0; }

  res = 1;
  if (this.left) { res += this.left.getNumberOfKeys(); }
  if (this.right) { res += this.right.getNumberOfKeys(); }

  return res;
};



// ============================================
// Methods used to actually work on the tree
// ============================================

/**
 * Create a BST similar (i.e. same options except for key and value) to the current one
 * Use the same constructor (i.e. BinarySearchTree, AVLTree etc)
 * @param {Object} options see constructor
 */
BinarySearchTree.prototype.createSimilar = function (options) {
  options = options || {};
  options.unique = this.unique;
  options.compareKeys = this.compareKeys;
  options.checkValueEquality = this.checkValueEquality;

  return new this.constructor(options);
};


/**
 * Create the left child of this BST and return it
 */
BinarySearchTree.prototype.createLeftChild = function (options) {
  var leftChild = this.createSimilar(options);
  leftChild.parent = this;
  this.left = leftChild;

  return leftChild;
};


/**
 * Create the right child of this BST and return it
 */
BinarySearchTree.prototype.createRightChild = function (options) {
  var rightChild = this.createSimilar(options);
  rightChild.parent = this;
  this.right = rightChild;

  return rightChild;
};


/**
 * Insert a new element
 */
BinarySearchTree.prototype.insert = function (key, value) {
  // Empty tree, insert as root
  if (!this.hasOwnProperty('key')) {
    this.key = key;
    this.data.push(value);
    return;
  }

  // Same key as root
  if (this.compareKeys(this.key, key) === 0) {
    if (this.unique) {
      throw { message: "Can't insert key " + key + ", it violates the unique constraint"
            , key: key
            , errorType: 'uniqueViolated'
            };
    } else {
      this.data.push(value);
    }
    return;
  }

  if (this.compareKeys(key, this.key) < 0) {
    // Insert in left subtree
    if (this.left) {
      this.left.insert(key, value);
    } else {
      this.createLeftChild({ key: key, value: value });
    }
  } else {
    // Insert in right subtree
    if (this.right) {
      this.right.insert(key, value);
    } else {
      this.createRightChild({ key: key, value: value });
    }
  }
};


/**
 * Search for all data corresponding to a key
 */
BinarySearchTree.prototype.search = function (key) {
  if (!this.hasOwnProperty('key')) { return []; }

  if (this.compareKeys(this.key, key) === 0) { return this.data; }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      return this.left.search(key);
    } else {
      return [];
    }
  } else {
    if (this.right) {
      return this.right.search(key);
    } else {
      return [];
    }
  }
};


/**
 * Return a function that tells whether a given key matches a lower bound
 */
BinarySearchTree.prototype.getLowerBoundMatcher = function (query) {
  var self = this;

  // No lower bound
  if (!query.hasOwnProperty('$gt') && !query.hasOwnProperty('$gte')) {
    return function () { return true; };
  }

  if (query.hasOwnProperty('$gt') && query.hasOwnProperty('$gte')) {
    if (self.compareKeys(query.$gte, query.$gt) === 0) {
      return function (key) { return self.compareKeys(key, query.$gt) > 0; };
    }

    if (self.compareKeys(query.$gte, query.$gt) > 0) {
      return function (key) { return self.compareKeys(key, query.$gte) >= 0; };
    } else {
      return function (key) { return self.compareKeys(key, query.$gt) > 0; };
    }
  }

  if (query.hasOwnProperty('$gt')) {
    return function (key) { return self.compareKeys(key, query.$gt) > 0; };
  } else {
    return function (key) { return self.compareKeys(key, query.$gte) >= 0; };
  }
};


/**
 * Return a function that tells whether a given key matches an upper bound
 */
BinarySearchTree.prototype.getUpperBoundMatcher = function (query) {
  var self = this;

  // No lower bound
  if (!query.hasOwnProperty('$lt') && !query.hasOwnProperty('$lte')) {
    return function () { return true; };
  }

  if (query.hasOwnProperty('$lt') && query.hasOwnProperty('$lte')) {
    if (self.compareKeys(query.$lte, query.$lt) === 0) {
      return function (key) { return self.compareKeys(key, query.$lt) < 0; };
    }

    if (self.compareKeys(query.$lte, query.$lt) < 0) {
      return function (key) { return self.compareKeys(key, query.$lte) <= 0; };
    } else {
      return function (key) { return self.compareKeys(key, query.$lt) < 0; };
    }
  }

  if (query.hasOwnProperty('$lt')) {
    return function (key) { return self.compareKeys(key, query.$lt) < 0; };
  } else {
    return function (key) { return self.compareKeys(key, query.$lte) <= 0; };
  }
};


// Append all elements in toAppend to array
function append (array, toAppend) {
  var i;

  for (i = 0; i < toAppend.length; i += 1) {
    array.push(toAppend[i]);
  }
}


/**
 * Get all data for a key between bounds
 * Return it in key order
 * @param {Object} query Mongo-style query where keys are $lt, $lte, $gt or $gte (other keys are not considered)
 * @param {Functions} lbm/ubm matching functions calculated at the first recursive step
 */
BinarySearchTree.prototype.betweenBounds = function (query, lbm, ubm) {
  var res = [];

  if (!this.hasOwnProperty('key')) { return []; }   // Empty tree

  lbm = lbm || this.getLowerBoundMatcher(query);
  ubm = ubm || this.getUpperBoundMatcher(query);

  if (lbm(this.key) && this.left) { append(res, this.left.betweenBounds(query, lbm, ubm)); }
  if (lbm(this.key) && ubm(this.key)) { append(res, this.data); }
  if (ubm(this.key) && this.right) { append(res, this.right.betweenBounds(query, lbm, ubm)); }

  return res;
};


/**
 * Delete the current node if it is a leaf
 * Return true if it was deleted
 */
BinarySearchTree.prototype.deleteIfLeaf = function () {
  if (this.left || this.right) { return false; }

  // The leaf is itself a root
  if (!this.parent) {
    delete this.key;
    this.data = [];
    return true;
  }

  if (this.parent.left === this) {
    this.parent.left = null;
  } else {
    this.parent.right = null;
  }

  return true;
};


/**
 * Delete the current node if it has only one child
 * Return true if it was deleted
 */
BinarySearchTree.prototype.deleteIfOnlyOneChild = function () {
  var child;

  if (this.left && !this.right) { child = this.left; }
  if (!this.left && this.right) { child = this.right; }
  if (!child) { return false; }

  // Root
  if (!this.parent) {
    this.key = child.key;
    this.data = child.data;

    this.left = null;
    if (child.left) {
      this.left = child.left;
      child.left.parent = this;
    }

    this.right = null;
    if (child.right) {
      this.right = child.right;
      child.right.parent = this;
    }

    return true;
  }

  if (this.parent.left === this) {
    this.parent.left = child;
    child.parent = this.parent;
  } else {
    this.parent.right = child;
    child.parent = this.parent;
  }

  return true;
};


/**
 * Delete a key or just a value
 * @param {Key} key
 * @param {Value} value Optional. If not set, the whole key is deleted. If set, only this value is deleted
 */
BinarySearchTree.prototype.delete = function (key, value) {
  var newData = [], replaceWith
    , self = this
    ;

  if (!this.hasOwnProperty('key')) { return; }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) { this.left.delete(key, value); }
    return;
  }

  if (this.compareKeys(key, this.key) > 0) {
    if (this.right) { this.right.delete(key, value); }
    return;
  }

  if (!this.compareKeys(key, this.key) === 0) { return; }

  // Delete only a value
  if (this.data.length > 1 && value !== undefined) {
    this.data.forEach(function (d) {
      if (!self.checkValueEquality(d, value)) { newData.push(d); }
    });
    self.data = newData;
    return;
  }

  // Delete the whole node
  if (this.deleteIfLeaf()) {
    return;
  }
  if (this.deleteIfOnlyOneChild()) {
    return;
  }

  // We are in the case where the node to delete has two children
  if (Math.random() >= 0.5) {   // Randomize replacement to avoid unbalancing the tree too much
    // Use the in-order predecessor
    replaceWith = this.left.getMaxKeyDescendant();

    this.key = replaceWith.key;
    this.data = replaceWith.data;

    if (this === replaceWith.parent) {   // Special case
      this.left = replaceWith.left;
      if (replaceWith.left) { replaceWith.left.parent = replaceWith.parent; }
    } else {
      replaceWith.parent.right = replaceWith.left;
      if (replaceWith.left) { replaceWith.left.parent = replaceWith.parent; }
    }
  } else {
    // Use the in-order successor
    replaceWith = this.right.getMinKeyDescendant();

    this.key = replaceWith.key;
    this.data = replaceWith.data;

    if (this === replaceWith.parent) {   // Special case
      this.right = replaceWith.right;
      if (replaceWith.right) { replaceWith.right.parent = replaceWith.parent; }
    } else {
      replaceWith.parent.left = replaceWith.right;
      if (replaceWith.right) { replaceWith.right.parent = replaceWith.parent; }
    }
  }
};


/**
 * Execute a function on every node of the tree, in key order
 * @param {Function} fn Signature: node. Most useful will probably be node.key and node.data
 */
BinarySearchTree.prototype.executeOnEveryNode = function (fn) {
  if (this.left) { this.left.executeOnEveryNode(fn); }
  fn(this);
  if (this.right) { this.right.executeOnEveryNode(fn); }
};


/**
 * Pretty print a tree
 * @param {Boolean} printData To print the nodes' data along with the key
 */
BinarySearchTree.prototype.prettyPrint = function (printData, spacing) {
  spacing = spacing || "";

  console.log(spacing + "* " + this.key);
  if (printData) { console.log(spacing + "* " + this.data); }

  if (!this.left && !this.right) { return; }

  if (this.left) {
    this.left.prettyPrint(printData, spacing + "  ");
  } else {
    console.log(spacing + "  *");
  }
  if (this.right) {
    this.right.prettyPrint(printData, spacing + "  ");
  } else {
    console.log(spacing + "  *");
  }
};


/**
 * Constructor
 * We can't use a direct pointer to the root node (as in the simple binary search tree)
 * as the root will change during tree rotations
 * @param {Boolean}  options.unique Whether to enforce a 'unique' constraint on the key or not
 * @param {Function} options.compareKeys Initialize this BST's compareKeys
 */
function AVLTree (options) {
  this.tree = new _AVLTree(options);
}


/**
 * Constructor of the internal AVLTree
 * @param {Object} options Optional
 * @param {Boolean}  options.unique Whether to enforce a 'unique' constraint on the key or not
 * @param {Key}      options.key Initialize this BST's key with key
 * @param {Value}    options.value Initialize this BST's data with [value]
 * @param {Function} options.compareKeys Initialize this BST's compareKeys
 */
function _AVLTree (options) {
  options = options || {};

  this.left = null;
  this.right = null;
  this.parent = options.parent !== undefined ? options.parent : null;
  if (options.hasOwnProperty('key')) { this.key = options.key; }
  this.data = options.hasOwnProperty('value') ? [options.value] : [];
  this.unique = options.unique || false;

  this.compareKeys = options.compareKeys;
  this.checkValueEquality = options.checkValueEquality;
}


/**
 * Inherit basic functions from the basic binary search tree
 */
inherit(_AVLTree, BinarySearchTree);

/**
 * Keep a pointer to the internal tree constructor for testing purposes
 */
AVLTree._AVLTree = _AVLTree;


/**
 * Check the recorded height is correct for every node
 * Throws if one height doesn't match
 */
_AVLTree.prototype.checkHeightCorrect = function () {
  var leftH, rightH;

  if (!this.hasOwnProperty('key')) { return; }   // Empty tree

  if (this.left && this.left.height === undefined) { throw "Undefined height for node " + this.left.key; }
  if (this.right && this.right.height === undefined) { throw "Undefined height for node " + this.right.key; }
  if (this.height === undefined) { throw "Undefined height for node " + this.key; }

  leftH = this.left ? this.left.height : 0;
  rightH = this.right ? this.right.height : 0;

  if (this.height !== 1 + Math.max(leftH, rightH)) { throw "Height constraint failed for node " + this.key; }
  if (this.left) { this.left.checkHeightCorrect(); }
  if (this.right) { this.right.checkHeightCorrect(); }
};


/**
 * Return the balance factor
 */
_AVLTree.prototype.balanceFactor = function () {
  var leftH = this.left ? this.left.height : 0
    , rightH = this.right ? this.right.height : 0
    ;
  return leftH - rightH;
};


/**
 * Check that the balance factors are all between -1 and 1
 */
_AVLTree.prototype.checkBalanceFactors = function () {
  if (Math.abs(this.balanceFactor()) > 1) { throw 'Tree is unbalanced at node ' + this.key; }

  if (this.left) { this.left.checkBalanceFactors(); }
  if (this.right) { this.right.checkBalanceFactors(); }
};


/**
 * When checking if the BST conditions are met, also check that the heights are correct
 * and the tree is balanced
 */
_AVLTree.prototype.checkIsAVLT = function () {
  _AVLTree.super_.prototype.checkIsBST.call(this);
  this.checkHeightCorrect();
  this.checkBalanceFactors();
};
AVLTree.prototype.checkIsAVLT = function () { this.tree.checkIsAVLT(); };


/**
 * Perform a right rotation of the tree if possible
 * and return the root of the resulting tree
 * The resulting tree's nodes' heights are also updated
 */
_AVLTree.prototype.rightRotation = function () {
  var q = this
    , p = this.left
    , b
    , ah, bh, ch;

  if (!p) { return this; }   // No change

  b = p.right;

  // Alter tree structure
  if (q.parent) {
    p.parent = q.parent;
    if (q.parent.left === q) { q.parent.left = p; } else { q.parent.right = p; }
  } else {
    p.parent = null;
  }
  p.right = q;
  q.parent = p;
  q.left = b;
  if (b) { b.parent = q; }

  // Update heights
  ah = p.left ? p.left.height : 0;
  bh = b ? b.height : 0;
  ch = q.right ? q.right.height : 0;
  q.height = Math.max(bh, ch) + 1;
  p.height = Math.max(ah, q.height) + 1;

  return p;
};


/**
 * Perform a left rotation of the tree if possible
 * and return the root of the resulting tree
 * The resulting tree's nodes' heights are also updated
 */
_AVLTree.prototype.leftRotation = function () {
  var p = this
    , q = this.right
    , b
    , ah, bh, ch;

  if (!q) { return this; }   // No change

  b = q.left;

  // Alter tree structure
  if (p.parent) {
    q.parent = p.parent;
    if (p.parent.left === p) { p.parent.left = q; } else { p.parent.right = q; }
  } else {
    q.parent = null;
  }
  q.left = p;
  p.parent = q;
  p.right = b;
  if (b) { b.parent = p; }

  // Update heights
  ah = p.left ? p.left.height : 0;
  bh = b ? b.height : 0;
  ch = q.right ? q.right.height : 0;
  p.height = Math.max(ah, bh) + 1;
  q.height = Math.max(ch, p.height) + 1;

  return q;
};


/**
 * Modify the tree if its right subtree is too small compared to the left
 * Return the new root if any
 */
_AVLTree.prototype.rightTooSmall = function () {
  if (this.balanceFactor() <= 1) { return this; }   // Right is not too small, don't change

  if (this.left.balanceFactor() < 0) {
    this.left.leftRotation();
  }

  return this.rightRotation();
};


/**
 * Modify the tree if its left subtree is too small compared to the right
 * Return the new root if any
 */
_AVLTree.prototype.leftTooSmall = function () {
  if (this.balanceFactor() >= -1) { return this; }   // Left is not too small, don't change

  if (this.right.balanceFactor() > 0) {
    this.right.rightRotation();
  }

  return this.leftRotation();
};


/**
 * Rebalance the tree along the given path. The path is given reversed (as he was calculated
 * in the insert and delete functions).
 * Returns the new root of the tree
 * Of course, the first element of the path must be the root of the tree
 */
_AVLTree.prototype.rebalanceAlongPath = function (path) {
  var newRoot = this
    , rotated
    , i;

  if (!this.hasOwnProperty('key')) { delete this.height; return this; }   // Empty tree

  // Rebalance the tree and update all heights
  for (i = path.length - 1; i >= 0; i -= 1) {
    path[i].height = 1 + Math.max(path[i].left ? path[i].left.height : 0, path[i].right ? path[i].right.height : 0);

    if (path[i].balanceFactor() > 1) {
      rotated = path[i].rightTooSmall();
      if (i === 0) { newRoot = rotated; }
    }

    if (path[i].balanceFactor() < -1) {
      rotated = path[i].leftTooSmall();
      if (i === 0) { newRoot = rotated; }
    }
  }

  return newRoot;
};


/**
 * Insert a key, value pair in the tree while maintaining the AVL tree height constraint
 * Return a pointer to the root node, which may have changed
 */
_AVLTree.prototype.insert = function (key, value) {
  var insertPath = []
    , currentNode = this
    ;

  // Empty tree, insert as root
  if (!this.hasOwnProperty('key')) {
    this.key = key;
    this.data.push(value);
    this.height = 1;
    return this;
  }

  // Insert new leaf at the right place
  while (true) {
    // Same key: no change in the tree structure
    if (currentNode.compareKeys(currentNode.key, key) === 0) {
      if (currentNode.unique) {
        throw { message: "Can't insert key " + key + ", it violates the unique constraint"
              , key: key
              , errorType: 'uniqueViolated'
              };
      } else {
        currentNode.data.push(value);
      }
      return this;
    }

    insertPath.push(currentNode);

    if (currentNode.compareKeys(key, currentNode.key) < 0) {
      if (!currentNode.left) {
        insertPath.push(currentNode.createLeftChild({ key: key, value: value }));
        break;
      } else {
        currentNode = currentNode.left;
      }
    } else {
      if (!currentNode.right) {
        insertPath.push(currentNode.createRightChild({ key: key, value: value }));
        break;
      } else {
        currentNode = currentNode.right;
      }
    }
  }

  return this.rebalanceAlongPath(insertPath);
};

// Insert in the internal tree, update the pointer to the root if needed
AVLTree.prototype.insert = function (key, value) {
  var newTree = this.tree.insert(key, value);

  // If newTree is undefined, that means its structure was not modified
  if (newTree) { this.tree = newTree; }
};


/**
 * Delete a key or just a value and return the new root of the tree
 * @param {Key} key
 * @param {Value} value Optional. If not set, the whole key is deleted. If set, only this value is deleted
 */
_AVLTree.prototype.delete = function (key, value) {
  var newData = [], replaceWith
    , self = this
    , currentNode = this
    , deletePath = []
    ;

  if (!this.hasOwnProperty('key')) { return this; }   // Empty tree

  // Either no match is found and the function will return from within the loop
  // Or a match is found and deletePath will contain the path from the root to the node to delete after the loop
  while (true) {
    if (currentNode.compareKeys(key, currentNode.key) === 0) { break; }

    deletePath.push(currentNode);

    if (currentNode.compareKeys(key, currentNode.key) < 0) {
      if (currentNode.left) {
        currentNode = currentNode.left;
      } else {
        return this;   // Key not found, no modification
      }
    } else {
      // currentNode.compareKeys(key, currentNode.key) is > 0
      if (currentNode.right) {
        currentNode = currentNode.right;
      } else {
        return this;   // Key not found, no modification
      }
    }
  }

  // Delete only a value (no tree modification)
  if (currentNode.data.length > 1 && value) {
    currentNode.data.forEach(function (d) {
      if (!currentNode.checkValueEquality(d, value)) { newData.push(d); }
    });
    currentNode.data = newData;
    return this;
  }

  // Delete a whole node

  // Leaf
  if (!currentNode.left && !currentNode.right) {
    if (currentNode === this) {   // This leaf is also the root
      delete currentNode.key;
      currentNode.data = [];
      delete currentNode.height;
      return this;
    } else {
      if (currentNode.parent.left === currentNode) {
        currentNode.parent.left = null;
      } else {
        currentNode.parent.right = null;
      }
      return this.rebalanceAlongPath(deletePath);
    }
  }


  // Node with only one child
  if (!currentNode.left || !currentNode.right) {
    replaceWith = currentNode.left ? currentNode.left : currentNode.right;

    if (currentNode === this) {   // This node is also the root
      replaceWith.parent = null;
      return replaceWith;   // height of replaceWith is necessarily 1 because the tree was balanced before deletion
    } else {
      if (currentNode.parent.left === currentNode) {
        currentNode.parent.left = replaceWith;
        replaceWith.parent = currentNode.parent;
      } else {
        currentNode.parent.right = replaceWith;
        replaceWith.parent = currentNode.parent;
      }

      return this.rebalanceAlongPath(deletePath);
    }
  }


  // Node with two children
  // Use the in-order predecessor (no need to randomize since we actively rebalance)
  deletePath.push(currentNode);
  replaceWith = currentNode.left;

  // Special case: the in-order predecessor is right below the node to delete
  if (!replaceWith.right) {
    currentNode.key = replaceWith.key;
    currentNode.data = replaceWith.data;
    currentNode.left = replaceWith.left;
    if (replaceWith.left) { replaceWith.left.parent = currentNode; }
    return this.rebalanceAlongPath(deletePath);
  }

  // After this loop, replaceWith is the right-most leaf in the left subtree
  // and deletePath the path from the root (inclusive) to replaceWith (exclusive)
  while (true) {
    if (replaceWith.right) {
      deletePath.push(replaceWith);
      replaceWith = replaceWith.right;
    } else {
      break;
    }
  }

  currentNode.key = replaceWith.key;
  currentNode.data = replaceWith.data;

  replaceWith.parent.right = replaceWith.left;
  if (replaceWith.left) { replaceWith.left.parent = replaceWith.parent; }

  return this.rebalanceAlongPath(deletePath);
};

// Delete a value
AVLTree.prototype.delete = function (key, value) {
  var newTree = this.tree.delete(key, value);

  // If newTree is undefined, that means its structure was not modified
  if (newTree) { this.tree = newTree; }
};


/**
 * Other functions we want to use on an AVLTree as if it were the internal _AVLTree
 */
['getNumberOfKeys', 'search', 'betweenBounds', 'prettyPrint', 'executeOnEveryNode'].forEach(function (fn) {
  AVLTree.prototype[fn] = function () {
    return this.tree[fn].apply(this.tree, arguments);
  };
});

return Object.freeze({
	AVLTree: AVLTree
});

});
define('util/time',[], function () {
'use strict';

function getMillisecond() {
	return (new Date).getTime();
}

return {
	getMillisecond: getMillisecond
}
});
define('util/util',['./traits', './data', './async', './xhr', './math', './inherit', './adt', './time'],
function (traits, data, async, xhr, math, inherit, adt, time) {

function List(list) {
	this.list = list;
}

List.prototype[Symbol.iterator] = function *iterator() {
	var list = this.list;
	while (list.length) {
		yield list[0];
		list = list[1];
	}
};

List.prototype.map = function(functor) {
	var return_list = [];
	var pointer = return_list;
	for (var element of this) {
		pointer.push(functor(element));
		pointer.push([]);
		pointer = pointer[1];
	}
	return return_list;
};

List.prototype.flat_map = function(functor) {
	var return_list = [];
	var iterator = this[Symbol.iterator]();
	var element;
	while (!(element = iterator.next()).done) {
		return_list.push(functor(element.value));
	}
	return return_list;
};

List.prototype.for_each = function (functor, context) {
	var count = 0;
	var iterator = this[Symbol.iterator]();
	var element;
	while (!(element = iterator.next()).done) {
		functor.call(context, element.value, count, this);
		++count;
	}
};

function stream_animate(stream) {
	var gen;
	function animate(time) {
		if (!gen.next(time).done)
			requestAnimationFrame(animate);
	}
	requestAnimationFrame(time => {
		gen = stream(time);
		requestAnimationFrame(animate);
	});
}

function BiMap() {
	this.counter = new Uint32Array(1);
	this.object_id = new Map;
	this.id_object = new Map;
}
BiMap.prototype = {
	constructor: BiMap,
	has_object (object) {
		return this.object_id.has(object);
	},
	has_id (id) {
		return this.id_object.has(id);
	},
	add (object) {
		if (!this.has_object(object)) {
			this.object_id.set(object, this.counter[0]);
			this.id_object.set(this.counter[0], object);
			++this.counter[0];
		}
		return this.object_id.get(object);
	},
	delete_object (object) {
		if (this.has_object(object)) {
			var id = this.object_id.get(object);
			this.object_id.delete(object);
			this.id_object.delete(id);
		}
	},
	delete_id (id) {
		if (this.has_id(id)) {
			var object = this.id_object.get(id);
			this.object_id.delete(object);
			this.id_object.delete(id);
		}
	},
	object (id) {
		return this.has_id(id) ? this.id_object.get(id) : null;
	},
	id (object) {
		return this.has_object(object) ? this.object_id.get(object) : -1;
	}
};

return Object.freeze({
	async: async,
	data: data,
	List: List,
	stream_animate: stream_animate,
	traits: traits,
	xhr: xhr,
	math: math,
	inherit: inherit,
	adt: adt,
	BiMap: BiMap,
	time: time
});

});

define('compat/observe',['util/util'], function (util) {
'use strict';

var
  shim_enabled = false;

function notify_queue(change) {
  if (object_handler_map.has(change.object)) {
    if (!global_queue.size)
      util.async.async(() => process_queue(), 'animate');

    var control = global_object_handler.get(change.object);
    for (var handler of control)
      if (global_queue.has(handler))
        global_queue.get(handler).push(change);
      else
        global_queue.set(handler, [change]);
  }
}

function process_queue(immediate) {
  var set = new Set(global_queue);
  global_queue.clear();
  if (immediate)
    set.forEach(function(change_set, handler) {
      handler(change_set);
    });
  else
    set.forEach(function(change_set, handler) {
      // Promise as microtask does not work in Firefox
      util.async.async(() => handler(change_set), 'animate');
    });
}

var MAX_ARRAY_LENGTH = Math.pow(2,32)-1;
  
function make_observation(object, control) {
  control.queue = [];
  control.proxy = Proxy.revocable(object, {
    set (target, name, new_value) {
      if (object[name] === new_value)
        return true;
      var index = Number(name);
      var record = {
          type: name in object ? 'update' : 'add',
          object: object,
          name: name,
          oldValue: object[name],
          newValue: new_value
      };
      if (util.traits.is_array(object) && name)
        if (name === 'length') {
          var length = Number(new_value);
          if (!Number.isSafeInteger(length) ||
              length < 0 ||
              length >= MAX_ARRAY_LENGTH)
            throw new RangeError('Invalid array length');
          if (length < object.length)
            record = {
              type: 'splice',
              object: object,
              index: length,
              removed: object.slice(length),
              addedCount: 0
            };
          else if (length > object.length)
            record = {
              type: 'splice',
              object: object,
              index: object.length,
              removed: [],
              addedCount: length - object.length
            };
          else
            return true;
        } else if (Number.isSafeInteger(index) && object.length <= index)
          record = {
              type: 'splice',
              object: object,
              index: object.length,
              removed: [],
              addedCount: index - object.length + 1
          };
      notify_queue(record);
      object[name] = new_value;
      return true;
    },
    deleteProperty (target, name) {
      if (name in object) {
        notify_queue({
          type: 'delete',
          object: object,
          name: name,
          oldValue: object[name]
        });
      }
      return delete object[name];
    }
  });
  global_object_proxy.set(object, control.proxy.proxy);
}

function destroy_observation(object, control) {
  control.proxy.revoke();
  global_object_proxy.delete(object);
}

var object_handler_map = new WeakMap;
var handler_object_map = new WeakMap;
var global_object_handler = new WeakMap;
var global_queue = new Map;
var global_object_proxy = new WeakMap;

if (!util.traits.is_function(Object.observe)) {
	Array.observe = Object.observe = function (object, handler, list) {
    if (!util.traits.is_object(object))
      throw new Error('Object.observe cannot observe non-object');
    var control;
    if (global_object_handler.has(object))
        control = global_object_handler.get(object);
    else {
        global_object_handler.set(object, control = new Set);
        make_observation(object, control);
    }

    if (object_handler_map.has(object))
      object_handler_map.get(object).add(handler);
    else
      object_handler_map.set(object, new Set([handler]));
    if (handler_object_map.has(handler))
      handler_object_map.get(handler).add(object);
    else
      handler_object_map.set(handler, new Set([object]));
    control.add(handler);
	};
	Array.unobserve = Object.unobserve = function (object, handler) {
    if (global_object_handler.has(object)) {
      var control = global_object_handler.get(object);
      control.delete(handler);
      if (!control.size) {
        destroy_observation(object, control);
        global_object_handler.delete(object);
      }
      if (object_handler_map.has(object))
        object_handler_map.get(object).delete(handler);
      if (handler_object_map.has(handler))
        handler_object_map.get(handler).delete(object);
    }
	};
  Object.deliverChangeRecords = function (callback) {
    if (handler_object_map.has(callback) && global_queue.has(callback)) {
      var back_store = global_queue;
      global_queue = new Map([[callback, back_store.get(callback)]]);
      back_store.delete(callback);
      process_queue(true);
      global_queue = back_store;
    }
  };
  Object.getNotifier = function (object) {
    return {
      notify(change) {
        if (global_object_handler.has(object))
          notify_queue(
            Object.assign({
              object: object
            }, change));
      },
      performChange(type, process) {
        var change = process();
        if (util.traits.is_object(change) && global_object_handler.has(change.object))
          notify_queue(Object.assign(change, {type: type}));
      }
    };
  };
  var
    array_push = Array.prototype.push, array_pop = Array.prototype.pop,
    array_splice = Array.prototype.splice, array_shift = Array.prototype.shift,
    array_unshift = Array.prototype.unshift;

  Array.prototype.push = function() {
    var args = Array.prototype.slice.call(arguments);
    if (global_object_handler.has(this))
      notify_queue({
        type: 'splice',
        object: this,
        index: this.length,
        removed: [],
        addedCount: args.length
      });
    return array_push.apply(this, args);
  };
  Array.prototype.pop = function () {
    if (this.length && global_object_handler.has(this))
      notify_queue({
        type: 'splice',
        object: this,
        index: this.length - 1,
        removed: [this[this.length - 1]],
        addedCount: 0
      });
    return array_pop.call(this);
  };
  Array.prototype.splice = function (index, removed) {
    var added = Array.prototype.slice.call(arguments, 2);
    if (Number.isSafeInteger(index) && global_object_handler.has(this)) {
      index = Math.min(this.length, index);
      if (index < 0)
        index = Math.max(0, index + this.length);
      if (removed || added.length)
        notify_queue({
          type: 'splice',
          object: this,
          index: index,
          removed: this.slice(index, removed),
          addedCount: added.length
        });
    }
    return array_splice.call(this, index, removed, ...added);
  };
  Array.prototype.shift = function () {
    if (this.length && global_object_handler.has(this))
      notify_queue({
        type: 'splice',
        object: this,
        index: 0,
        removed: [this[0]],
        addedCount: 0
      });
    return array_shift.call(this);
  };
  Array.prototype.unshift = function () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length && global_object_handler.has(this))
      notify_queue({
        type: 'splice',
        object: this,
        index: 0,
        removed: [],
        addedCount: args.length
      });
    return array_unshift.apply(this, args);
  };
  shim_enabled = true;
}

function get_proxy(object) {
  if (shim_enabled)
    return global_object_proxy.get(object) || object;
  else
    return object;
}

Object.defineProperty(get_proxy, 'shim_enabled', {
  get() {
    return shim_enabled;
  }
});

return get_proxy;

});

define('observe/observe',['util/util', 'compat/observe'], function(util, _proxy) {
'use strict';

var
	SPLICE = Symbol('splice'),
	ALL_PROP = Symbol('all properties');

var NATIVE_EVENTS = ['add', 'update', 'delete', 'splice'];

var ALL_OBSERVE_FUNCTORS = new Set;

var shim_enabled = _proxy.shim_enabled;

function is_primitive_property(property) {
	return util.traits.is_string(property) ||
			util.traits.is_undefined(property) ||
			util.traits.is_null(property) ||
			util.traits.is_number(property);
}

var FLUSH_MODE_KEEP = true, FLUSH_MODE = false;

function flush(async_keep) {
	FLUSH_MODE = true;
	FLUSH_MODE_KEEP = async_keep;
	// synchronously flush all change records
	ALL_OBSERVE_FUNCTORS.forEach(functor => Object.deliverChangeRecords(functor));
	FLUSH_MODE = false;
}

function ObserveScope(events) {
	var object_set = new Map;
	var symbol_set = new Map;
	var objects = new util.BiMap;
	var symbols = new util.BiMap;
	var event_vector = NATIVE_EVENTS.concat(events);
	// Bijection map for handler/path
	var handlers = new Map;
	var handler_paths = new Map;
	ALL_OBSERVE_FUNCTORS.add(observer_handler);

	function attach_observer(target) {
		if (util.traits.is_array(target))
			Array.observe(target, observer_handler, event_vector);
		else if (util.traits.is_object(target))
			Object.observe(target, observer_handler, event_vector);
	}

	function detach_observer(target) {
		if (util.traits.is_array(target))
			Array.unobserve(target, observer_handler);
		else if (util.traits.is_object(target))
			Object.unobserve(target, observer_handler);
	}

	function observer_handler(change_set) {
		if (FLUSH_MODE)
			if (FLUSH_MODE_KEEP)
				util.async.async(
					() => observer_handler(change_set),
					shim_enabled ? 'animate' : null);
			else
				return;
		var handler_changes = new Map;
		function insert_change(object, property, change) {
			function aux(handler) {
				var o = Object.assign({
						object: object,
						name: property
					}, change);	// clone
				if (handler_changes.has(handler))
					handler_changes.get(handler).push(o);
				else
					handler_changes.set(handler, [o]);
			}
			var hash = object_property_hash(object, property);
			if (handlers.has(hash))
				handlers.get(hash).forEach(aux);
			hash = object_property_hash(object, SPLICE);
			if (handlers.has(hash) && (
				Number.isSafeInteger(Number(String(property))) ||
				property === 'length'))
				handlers.get(hash).forEach(aux);
			hash = object_property_hash(object, ALL_PROP);
			if (handlers.has(hash))
				handlers.get(hash).forEach(aux);
		}
		for (var change of change_set)
			if (object_set.has(change.object))
				if (change.type === 'splice' && ('index' in change)) {
					// additional change sets, for other non-splice watches
					insert_change(change.object, SPLICE, change);
					if (change.removed.length === change.addedCount)
						for (var i = 0; i < change.addedCount; ++i)
							insert_change(change.object, i + change.index, {
								name: i, type: 'update', [SPLICE]: true
							});
					else {
						for (var i = change.index, end = change.object.length; i < end; ++i)
							insert_change(change.object, i, {
								name: i, type: 'update', [SPLICE]: true
							});
						insert_change(change.object, 'length', {
							name: 'length',
							type: 'update',
							newValue: change.object.length,
							oldValue: change.object.length +
								(change.addedCount - change.removed.length)
						});
					}
				} else if (change.name)
					insert_change(change.object, change.name, change);
				else if (change.type === 'update')	// update all properties
					for (var property of Object.getOwnPropertyNames(change.object))
						insert_change(change.object, property, change);
		// handler invocations
		var handler_visit = new Set;
		handler_changes.forEach(function(changes, handler) {
			handler.disabled = false;
			if (util.traits.is_function(handler.init))
				handler.init();
			changes.some(function(change) {
				handler(change);
				return handler.disabled;
			});
		});
	}

	function object_property_hash(object, property) {
		var is_prim_prop = is_primitive_property(property);
		if (objects.has_object(object)) {
			var hash;
			if (is_prim_prop)
				hash = '';
			else if (symbols.has_object(property))
				hash = 's#';
			else
				return;
			hash += objects.id(object);
			hash += '#';
			if (is_prim_prop)
				hash += property;
			else
				hash += symbols.id(property);
			return hash;
		}
	}

	function reverse_hash(hash) {
		if (util.traits.is_string(hash)) {
			var object, property, v = hash.split('#');
			if (hash[0] === 's') {
				object = objects.object(Number(v[1]));
				property = symbols.object(Number(v[2]));
			} else {
				object = objects.object(Number(v[0]));
				property = v[1];
			}
			return [object, property];
		}
	}

	function attach (object, property, handler) {
		if (object_set.has(object)) {
			var count = object_set.get(object);
			object_set.set(object, count + 1);
		} else if (util.traits.is_object(object)) {
			object_set.set(object, 1);
			// object - id bijection mapping
			objects.add(object);
			attach_observer(object);
		} else
			return;
		if (symbol_set.has(property)) {
			var count = symbol_set.get(property);
			symbol_set.set(property, count + 1);
		} else if (!is_primitive_property(property)) {
			symbol_set.set(property, 1);
			symbols.add(property);
		}
		var hash = object_property_hash(object, property);
		if (handlers.has(hash))
			handlers.get(hash).add(handler);
		else
			handlers.set(hash, new Set([handler]));

		if (handler_paths.has(handler))
			handler_paths.get(handler).add(hash);
		else
			handler_paths.set(handler, new Set([hash]));
		return hash;
	}

	function detach (object, property, handler) {
		var hash = object_property_hash(object, property);
		if (handlers.has(hash) && handlers.get(hash).has(handler)) {
			handlers.get(hash).delete(handler);
			if (handlers.get(hash).size === 0)
				handlers.delete(hash);
			handler_paths.get(handler).delete(hash);
			if (handler_paths.get(handler).size === 0)
				handler_paths.delete(handler);
			// purge objects or symbols if necessary
			if (object_set.get(object) > 1) {
				var count = object_set.get(object);
				object_set.set(object, count - 1);
			} else if (object_set.has(object)) {
				object_set.delete(object);
				objects.delete_object(object);
				detach_observer(object);
			} else
				return;
			if (symbol_set.get(property) > 1) {
				var count = symbol_set.get(property);
				symbol_set.set(property, count - 1);
			} else if (symbol_set.has(property)) {
				symbol_set.delete(property);
				symbols.delete_object(property);
			} else
				return;
		}
	}

	function query_object_id (object) {
		return objects.id(object);
	}

	function query_object_by_id (id) {
		return objects.object(id);
	}

	function query_symbol_id (symbol) {
		return symbols.id(symbol);
	}

	function query_symbol_by_id (id) {
		return symbols.object(id);
	}

	function query_handler_paths (handler) {
		var list = new Set;
		handlers.forEach(function(handlers, hash) {
			if (handlers.has(handler))
				list.add(reverse_hash(hash));
		});
		return list;
	}

	function detach_all (handler) {
		if (handler_paths.has(handler))
			for (var hash of new Set(handler_paths.get(handler))) {
				var path = reverse_hash(hash);
				detach(path[0], path[1], handler);
			}
	}

	function destroy () {
		var object_set = new Set;
		for (var model of object_set) {
			detach_observer(model, object_set);
		}
		ALL_OBSERVE_FUNCTORS.delete(observer_handler);
	}

	return {
		attach: attach,
		detach: detach,
		query_object_id: query_object_id,
		query_object_by_id: query_object_by_id,
		query_symbol_id: query_symbol_id,
		query_symbol_by_id: query_symbol_by_id,
		query_handler_paths: query_handler_paths,
		object_property_hash: object_property_hash,
		detach_all: detach_all,
		destroy: destroy
	};
}

return Object.freeze({
	ObserveScope: ObserveScope,
	flush: flush,
	SPLICE: SPLICE,
	ALL_PROP: ALL_PROP
});

});

define('el/el_const',['observe/observe'], function (observe) {
'use strict';

return Object.freeze({

SPLICE: observe.SPLICE,
SUPER: Symbol('super'),
ROOT: Symbol('root'),
VOID: Symbol('void'),
ALL_PROP: observe.ALL_PROP,
NOTIFIER: Symbol('notifier'),
EL: Symbol('el')

});

});

define('el/scope',['./el_const'], function(CONST){
'use strict';

function Scope(model, super_scope) {
	if (super_scope instanceof Scope || super_scope === null || super_scope === undefined) {
		this.model = model || {};
		this[CONST.SUPER] = super_scope || null;
		this[CONST.ROOT] = super_scope instanceof Scope ? super_scope[CONST.ROOT] : this.model;
		Object.freeze(this);
	} else {
		throw new Error('Expecting Scope');
	}
}

return Object.defineProperties({}, {
	Scope: {
		value: Scope,
		enumerable: true
	}
});

});
define('el/standard',['util/util'], function (util) {
'use strict';

var $$$ = Object.freeze;

var STANDARD = {
	type: $$$({
		Array: Array,
		Object: Object,
		Symbol: Symbol,
		Number: Number,
		Boolean: Boolean,
		String: String,
		Map: Map,
		Set: Set
	}),
	notify(object, name) {
		Object.getNotifier(object).notify({type: 'update', name: name});
	},
	notify_splice(object, index, added, removed) {
		Object.getNotifier(object).notify({
			type: 'splice',
			index: index || 0,
			removed: removed || [],
			addedCount: added || 0
		});
	},
	math: $$$(util.math),
	util: $$$({
		rgba (r,g,b,a) {
			return `rgba(${0|r * 255},${0|g * 255},${0|b * 255},${a})`;
		},
		rgb (r,g,b) {
			return `rgb(${0|r * 255},${0|g * 255},${0|b * 255})`;
		},
		hsl (h,s,l) {
			return `hsl(${h},${s}%,${l}%)`;
		},
		hsla (h,s,l,a) {
			return `hsl(${h},${s}%,${l}%,${a})`;
		},
		string_template() {
			var value = '';
			for (var i = 0, end = arguments.length; i < end; ++i)
				value += arguments[i];
			return value;
		},
		log: console.log.bind(console),
		now () {
			return performance.now();
		},
		debug: function() {debugger;}
	}),
	tee(functor, value) {
		functor(value);
		return value;
	},
	stream: $$$({
		iterate (container) {
			return function *() {
				yield *container;
			};
		},
		evaluate (limit, stream) {
			var args = Array.prototype.slice.call(arguments, 2);
			var result = [];
			var count = 0;
			if (!util.traits.is_number(limit)) {
				stream = limit;
				limit = Infinity;
			}
			for (var value of stream(...args)) {
				if (count > limit) break;
				result.push(value);
				++count;
			}
			return result;
		},
		map (functor, stream) {
			return function *() {
				var args = Array.prototype.slice.call(arguments);
				var gen = stream(...args);
				for (var value of gen)
					yield functor(value);
			};
		},
		fold_left (functor, zero, stream) {
			var args = Array.prototype.slice.call(arguments, 3);
			var result = zero;
			for (var value of stream(args))
				result = functor(result, value);
			return result;
		},
		filter (functor, stream) {
			return function *() {
				var args = Array.prototype.slice.call(arguments);
				var gen = stream(...args);
				for (var value of gen)
					if (functor(value))
						yield value;
			};
		},
		some (functor, stream) {
			var args = Array.prototype.slice.call(arguments, 2);
			for (var value of stream(...args)) {
				var result = functor(value);
				if (result)
					return result;
			}
		},
		slice (begin, length, stream) {
			if (!util.traits.is_number(length)) {
				stream = length;
				length = Infinity;
			}
			return function *() {
				var args = Array.prototype.slice.call(arguments);
				var gen = stream(...args);
				var count;
				var value;
				for (count = 0; count < begin; ++count) {
					value = gen.next();
					if (value.done) return;
				}
				for (count = 0; !(count >= length); ++count) {
					value = gen.next();
					if (value.done)
						return;
					else
						yield value.value;
				}
			};
		},
		zip (functor) {
			var streams = Array.prototype.slice.call(arguments, 1);
			return function *() {
				var args = Array.prototype.slice.call(arguments);
				var gens = [];
				for (var i = 0, end = streams.length; i < end; ++i) {
					var stream = streams[i];
					if (args[i])
						gens.push(stream());
					else
						gens.push(stream(...args[i]));
				}
				while (true) {
					var parameters = [];
					var done = true;
					for (var i = 0, end = gens.length; i < end; ++i) {
						var value = gens[i].next();
						done &= value.done;
						parameters.push(value.value);
					}
					if (done)
						return;
					else
						yield functor(...parameters);
				}
			};
		},
		truncate(functor, stream) {
			return function *() {
				var args = Array.prototype.slice.call(arguments);
				var gen = stream(...args);
				for (var value of gen)
					if (functor(value))
						yield value;
					else
						return;
			};
		},
		concat() {
			var streams = Array.prototype.slice.call(arguments);
			return function *() {
				var args = Array.prototype.slice.call(arguments);
				var argc = 0;
				for (var stream of streams) {
					if (args[argc])
						yield *stream();
					else
						yield *stream(...args[argc]);
					++argc;
				}
			};
		}
	}),
	animate: util.stream_animate,
	traits: util.traits,
	async: util.async.async
};

for (var key in STANDARD)
	Object.defineProperty(STANDARD, key, {
		enumerable: true,
		value: STANDARD[key]
	});

return $$$({
	extend(name, lib) {
		return STANDARD[name] = lib;
	},
	library: STANDARD
});

});

define('el/el_eval',['util/util', './el_const', './scope', './standard', 'compat/observe', 'observe/observe'],
function (util, CONST, el_scope, el_standard, _proxy, observe){
'use strict';

var min = Math.min;
var PLACEHOLDER = Symbol('?');

function EvaluateResult(value, traits) {
	this.traits = traits;
	this.value = value;
}

function unwrap_evaluation_result(value) {
	if (value instanceof EvaluateResult)
		return value.value;
	else
		return value;
}

function make_return_value(value, traits, lazy) {
	return new EvaluateResult(value, traits, lazy);
}

function make_catch_return_value(action) {
	try {
		return action();
	} catch(e){
		throw make_return_value(e, []);
	}
}

function add_trait_properties(trait, object, property) {
	if (util.traits.is_object(object))
		trait.push([object, property]);
}

function merge_traits(traits, keep) {
	if (!traits.length)
		return [];
	var new_trait = [];
	for (var i = 0, endi = traits.length; i < endi; ++i)
		for (var j = 0, endj = traits[i].length; j < endj; ++j)
			new_trait.push(traits[i][j]);
	if (keep) {
		new_trait.bindable = traits[0].bindable;
		new_trait.context = traits[0].context;
		new_trait.bind_path = traits[0].bind_path;
	}
	return new_trait;
}

function evaluate_primitive(expression) {
	return make_return_value(expression.value, []);
}

// this one is special
function evaluate_iterate(expression, scope) {
	var collection = evaluate_el(expression.collection, scope);
	if (collection instanceof EvaluateResult && util.traits.is_array(collection.value))
		add_trait_properties(collection.traits, collection.value, CONST.SPLICE);
	return {
		iterate: true,
		element: expression.element,
		index: expression.index,
		reference: expression.reference,
		collection: collection
	};
}

function lookup_chain(scope, property) {
	var ptr = scope;
	while (!(property in ptr.model) &&
		ptr[CONST.SUPER] &&
		util.traits.is_object(ptr[CONST.SUPER])) {
		ptr = ptr[CONST.SUPER];
	}
	if (property in ptr.model) {
		return ptr.model;
	} else {
		return null;
	}
}

function full_scope_chain(scope, property) {
	var ptr = scope;
	var chain = [];
	while (ptr && !(property in ptr.model)) {
		chain.push(ptr.model);
		ptr = ptr[CONST.SUPER];
	}
	if (ptr)
		chain.unshift(ptr.model);	// actual bindable scope
	return chain;
}

function evaluate_identifier(expression, scope) {
	var model = lookup_chain(scope, expression.name);
	var trait =
		full_scope_chain(scope, expression.name)
			.map(model => [model, expression.name]);
	trait.bindable = true;
	trait.context = model || scope.model;
	trait.bind_path = [trait.context, expression.name];
	return make_return_value(
		model ? model[expression.name] : undefined,
		trait
	);
}

function evaluate_computed_identifier(expression, scope) {
	var value = evaluate_el(expression.value, scope.model);
	var model = lookup_chain(scope, value.value);
	var trait =
		merge_traits([
			value.traits,
			full_scope_chain(scope, value.value)
				.map(model => [model, value.value])
		]);
	trait.bindable = true;
	trait.context = model || scope.model;
	trait.bind_path = [trait.context, value.value];
	return make_return_value(model ? model[valeu.value] : undefined, trait);
}

function evaluate_add(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value + right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_sub(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value - right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_mul(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value * right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_div(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value / right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_mod(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value % right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_gt(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value > right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_ge(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value >= right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_lt(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value < right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_le(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value <= right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_eq(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value === right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_neq(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	var right = force(evaluate_el(expression.right, scope));
	return make_return_value(left.value !== right.value, merge_traits([left.traits, right.traits]));
}

function evaluate_and(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	if (left.value) {
		var right = evaluate_el(expression.right, scope);
		return make_return_value(right.value, merge_traits([left.traits, right.traits]));
	} else {
		return left;
	}
}

function evaluate_or(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	if (left.value) {
		return left;
	} else {
		var right = evaluate_el(expression.right, scope);
		return make_return_value(right.value, merge_traits([left.traits, right.traits]));
	}
}

function evaluate_neg(expression, scope) {
	var value = force(evaluate_el(expression.value, scope));
	return make_return_value(-value.value, value.traits);
}

function evaluate_bool_neg(expression, scope) {
	var value = force(evaluate_el(expression.value, scope));
	return make_return_value(!value.value, value.traits);
}

function evaluate_conditional(expression, scope) {
	var conditional = force(evaluate_el(expression.condition, scope));
	var value = conditional.value ?
				evaluate_el(expression.consequent, scope) :
				evaluate_el(expression.alternative, scope);
	return make_return_value(value.value, merge_traits([conditional.traits, value.traits]));
}

function evaluate_pipe(expression, scope) {
	var value = evaluate_el(expression.left, scope);
	var pipe_functor = evaluate_el(expression.right, scope);
	if (util.traits.is_function(pipe_functor.value)) {
		// assuming pure functions
		var result = apply_el_function(
			pipe_functor,
			value.value === CONST.VOID ? [] : [value.value]);
		if (result instanceof EvaluateResult)
			return make_return_value(result.value,
					merge_traits([value.traits, pipe_functor.traits, result.traits]));
		else
			return make_return_value(
					result,
					merge_traits([
						value.traits,
						pipe_functor.traits]));
	} else
		return make_return_value(undefined,
				merge_traits([value.traits, pipe_functor.traits]));
}

function evaluate_list_pipe(expression, scope) {
	var parameters = [];
	var traits = [];
	var force_parameters = expression.force;
	for (var i = 0, end = expression.left.length; i < end; ++i) {
		var value = evaluate_el(expression.left[i], scope);
		if (force_parameters)
			value = force(value);

		parameters.push(value.value);
		traits.push(value.traits);
	}
	var pipe_functor = evaluate_el(expression.right, scope);
	traits.push(pipe_functor.traits);
	if (util.traits.is_function(pipe_functor.value)) {
		var result = apply_el_function(pipe_functor, parameters);
		if (result instanceof EvaluateResult) {
			traits.push(result.traits);
			return make_return_value(
				result.value,
				merge_traits(traits));
		} else
			return make_return_value(
				result,
				merge_traits(traits));
	} else
		return make_return_value(undefined, merge_traits(traits));
}

function evaluate_promise(expression, scope) {
	var promise_value;
	(function() {
		try {
			promise_value = evaluate_el(expression.promise, scope);
		} catch (e) {
			return make_return_value(
				Promise.reject(make_return_value(e, [])),
				[]);
		}
	})();

	function resolve_respond(value) {
		var resolve_value = evaluate_el(expression.resolve, scope);
		var value_traits;
		if (value instanceof EvaluateResult) {
			value_traits = value.traits; value = value.value;
		} else
			value_traits = [];

		if (util.traits.is_function(resolve_value.value))
			return make_catch_return_value(function () {
				return make_return_value(
					apply_el_function(resolve_value, [value]),
					merge_traits([
						promise_value.traits,
						resolve_value.traits,
						value_traits
					]));
			});
		else
			return make_return_value(
				resolve_value.value,
				merge_traits([
					promise_value.traits,
					resolve_value.traits,
					value_traits
				]));
	}
	function reject_respond(reason) {
		var reason_traits;
		if (reason instanceof EvaluateResult) {
			reason_traits = reason.traits; reason = reason.value;
		} else
			reason_traits = [];

		if (expression.reject) {
			var reject_value = evaluate_el(expression.reject, scope);
			if (util.traits.is_function(reject_value.value))
				return make_catch_return_value(function () {
					return make_return_value(
						apply_el_function(reject_value.value, [reason.value]),
						merge_traits([
							promise_value.traits,
							reject_value.traits,
							reason_traits]));
				});
			else
				return make_return_value(
					reject_value.value,
					merge_traits([
						promise_value.traits,
						reject_value.traits,
						reason_traits]));
		} else
			throw reason;
	}

	if (promise_value.value instanceof Promise)
		return make_return_value(
			promise_value.value.then(resolve_respond, reject_respond),
			promise_value.traits);
	else
		return make_return_value(Promise.resolve(promise_value), promise_value.traits);
}

function evaluate_access(expression, scope) {
	var left = force(evaluate_el(expression.left, scope));
	if (util.traits.is_null(left.value) || util.traits.is_undefined(left.value)) {
		left.value = undefined;
		return left;
	} else if (util.traits.is_string(expression.right)) {
		if (left.traits.bindable)
			left.traits.bind_path.push(expression.right);
		left.traits.context = left.value;
		add_trait_properties(left.traits, left.value, expression.right);
		left.value = left.value[expression.right];
		return left;
	} else {
		var right = force(evaluate_el(expression.right, scope));
		var traits = merge_traits([left.traits, right.traits], true);
		if (traits.bindable)
			traits.bind_path.push(right.value);
		traits.context = left.value;
		add_trait_properties(traits, left.value, right.value);
		return make_return_value(left.value[right.value], traits);
	}
}

function evaluate_global_access (expression) {
	if (util.traits.is_string(expression.name))
		return make_return_value(el_standard.library[expression.name], []);
	else {
		var name = force(evaluate_el(expression.name));
		return make_return_value(el_standard.library[name.value], name.traits);
	}
}

function evaluate_object(expression, scope) {
	var object = {};
	var traits = [];
	expression.entries.forEach(function (pair) {
		var key;
		if (util.traits.is_string(pair[0]))
			key = pair[0];
		else {
			var key_result = force(evaluate_el(pair[0], scope));
			key = key_result.value;
			traits.push(key_result.traits);
		}
		var value = weak_force(evaluate_el(pair[1], scope));
		object[key] = value.value;
		traits.push(value.traits);
	});
	return make_return_value(object, merge_traits(traits));
}

function evaluate_array (expression, scope) {
	var values = [], traits = [];
	expression.array.map(function (entry) {
		var value;
		if (entry.type === 'spread') {
			value = force(evaluate_el(entry.value, scope));
			values.push(...value.value);
		} else {
			value = evaluate_el(entry, scope);
			values.push(value.value);
		}
		traits.push(value.traits);
	});
	return make_return_value(values, merge_traits(traits));
}

function evaluate_stream (expression, scope) {
	var value = evaluate_el(expression.start, scope);
	var traits = [value.traits];
	var start = value.value;
	var next;
	var step;
	if (expression.step) {
		value = evaluate_el(expression.step, scope);
		step = value.value;
		next = start + step;
		traits.push(value.traits);
	} else if (expression.next) {
		value = evaluate_el(expression.next, scope);
		next = value.value;
		step = next - start;
		traits.push(value.traits);
	}
	var end;
	if (expression.end) {
		value = evaluate_el(expression.end, scope);
		end = value.value;
		traits.push(value.traits);
	}
	var filter;
	if (expression.filter) {
		value = evaluate_el(expression.filter, scope);
		filter = value.value;
		traits.push(value.traits);
	}

	function test_filter(value) {
		var filter_value;
		if (filter) {
			filter_value = force(filter(value));
			if (filter_value instanceof EvaluateResult)
				return filter_value.value;
			else
				return filter_value;
		} else return true;
	}

	function *stream_generator() {
		if (start >= end)
			return;
		else if (test_filter(start))
			yield start;

		if (expression.next || expression.step) {
			if (next >= end)
				return;
			else if (test_filter(next))
				yield next;

			next += step;
			while (!(next >= end)) {
				if (test_filter(next))
					yield next;
				next += step;
			}
		} else {
			++start;
			while (!(start >= end)) {
				if (test_filter(start))
					yield start;
				++start;
			}
		}
	}
	return make_return_value(stream_generator, merge_traits(traits));
}

function evaluate_stream_map(expression, scope) {
	function make_sub_scope(collection, key, value) {
		var model = {};
		Object.defineProperty(model, iterator.element, {
			value: value,
			writable: true
		});
		util.traits.is_undefined(iterator.index) ||
			Object.defineProperty(model, iterator.index, {value: key});
		util.traits.is_undefined(iterator.reference) ||
			Object.defineProperty(model, iterator.reference, {value: collection});
		return new el_scope.Scope(model, scope);
	}
	var values;
	var iterator = evaluate_iterate(expression.iterator, scope);
	var collection = force(iterator.collection);
	var traits = [collection.traits];
	if (collection.value instanceof Map) {
		values = new Map;
		collection.value.forEach(function (value, key) {
			var result = evaluate_el(
				expression.map,
				make_sub_scope(collection.value, key, value));
			values.set(key, result.value);
			traits.push(result.traits);
		});
	} else if (util.traits.is_array(collection.value)) {
		values = [];
		for (var i = 0, end = collection.value.length; i < end; ++i) {
			var result = evaluate_el(
				expression.map,
				make_sub_scope(collection.value, i, collection.value[i]));
			values.push(result.value);
			traits.push(result.traits);
		}
	} else if (collection.value && collection.value[Symbol.iterator]) {
		values = [];
		var count = 0;
		for (var element of collection.value) {
			var result = evaluate_el(
				expression.map,
				make_sub_scope(collection.value, count, element));
			values.push(result.value);
			traits.push(result.traits);
		}
	}
	return make_return_value(values, merge_traits(traits));
}

function evaluate_self_reference (expression, scope) {
	return make_return_value(scope.model, []);
}

function evaluate_apply(expression, scope) {
	var force_parameters = expression.force;
	var functor = force(evaluate_el(expression.functor, scope));
	var parameters = [];
	var traits = [functor.traits];
	expression.parameters.forEach(function (parameter) {
		var spread = parameter.type === 'spread';
		var result = spread ?
			force(evaluate_el(parameter.value, scope)) :
			evaluate_el(parameter, scope);
		if (force_parameters)
			result = force(result);
		if (spread)
			parameters.push(...result.value);
		else
			parameters.push(result.value);
		traits.push(result.traits);
	});
	var parameter_length = parameters.length;
	var incomplete_parameter =
		parameters.some(parameter => parameter === PLACEHOLDER);
	if (incomplete_parameter) {
		return make_return_value(function bound() {
			var args = Array.prototype.slice.call(arguments);
			var fill_args = [];
			var arg_length = args.length;
			var curry_ptr = 0, arg_ptr = 0;
			while (curry_ptr < parameter_length) {
				if (parameters[curry_ptr] === PLACEHOLDER)
					if (arg_ptr < arg_length)
						fill_args.push(args[arg_ptr++]);
					else
						fill_args.push(undefined);
				else
					fill_args.push(parameters[curry_ptr]);
				++curry_ptr;
			}
			while (arg_ptr < arg_length)
				fill_args.push(args[arg_ptr++]);
			return apply_el_function(functor, fill_args);
		}, merge_traits(traits));
	} else if (util.traits.is_function(functor.value)) {
		var return_value =
			apply_el_function(functor, parameters);
		if (return_value instanceof EvaluateResult) {
			traits.push(return_value.traits);
			return_value = return_value.value;	// unwrap
		}
		return make_return_value(return_value, merge_traits(traits));
	} else
		return make_return_value(undefined, merge_traits(traits));
}

function evaluate_placeholder() {
	return make_return_value(PLACEHOLDER, []);
}

function apply_el_function(functor, parameters) {
	return new LazyApplication(functor.value, functor.traits.context, parameters);
}

function force(value) {
	if (value instanceof EvaluateResult &&
		!(value.value instanceof Expression ||
		value.value instanceof LazyApplication))
		return value;
	var traits = [];
	while (true) {
		if (value instanceof EvaluateResult) {
			traits.push(value.traits);
			value = value.value;
		}
		if (value instanceof Expression)
			value = value.evaluate();
		else if (value instanceof LazyApplication)
			value = value.apply();
		else
			break;
	}
	if (value instanceof EvaluateResult) {
		traits.push(value.traits);
		value = value.value;
	}
	return make_return_value(value, merge_traits(traits));
}

// only force lazy applications
function weak_force(value) {
	if (value instanceof LazyApplication ||
		value instanceof EvaluateResult && value.value instanceof LazyApplication) {
		var traits = [];
		while (true) {
			if (value instanceof EvaluateResult) {
				traits.push(value.traits);
				value = value.value;
			}
			if (value instanceof LazyApplication)
				value = value.apply();
			else
				break;
		}
		if (value instanceof EvaluateResult) {
			traits.push(value.traits);
			value = value.value;
		}
		return make_return_value(value, merge_traits(traits));
	} else
		return value;
}

function force_values(values) {
	return values.map(force);
}

function evaluate_force(expression, scope) {
	return force(evaluate_el(expression.value, scope));
}

function evaluate_force_primitive(expression, scope) {
	return make_return_value(
		weak_force(evaluate_el(expression.value, scope)).value,
		[]);
}

function evaluate_all_properties(expression, scope) {
	var value = evaluate_el(expression.value, scope);
	add_trait_properties(value.traits, value.value, CONST.ALL_PROP);
	return value;
}

function evaluate_arrow_function (expression, scope) {
	var set_context = (model, context) => {
		model['this'] = context || scope.model;
	};
	var set_parameters = () => void 0;
	if (expression.input) {
		var parameters = expression.input.parameters;
		var parameter_length = parameters.length;
		set_parameters = (model, args) => {
			for (var i = 0, end = parameter_length; i < end; ++i)
				model[parameters[i]] = args[i];
			if (expression.input.spread)
				model[expression.input.spread] = args.slice(parameter_length);
			model['arguments'] = args.slice();
		};
		if (expression.input.context)
			set_context = (model, context, traits) => {
				var value = evaluate_el(expression.input.context, scope);
				traits.push(value.traits);
				model['this'] = value.value || context || scope.model;
			};
	}
	function invoke() {
		var traits = [];
		var pseudo_model = {'this': null, '$self': invoke};
		set_context(pseudo_model, this);
		var args = [];
		for (var i = 0, end = arguments.length; i < end; ++i)
			args.push(arguments[i]);
		set_parameters(pseudo_model, args);

		var sub_scope = new el_scope.Scope(pseudo_model, scope);
		var result = evaluate_el(expression.value, sub_scope);
		traits.push(result.traits);
		return make_return_value(result.value, merge_traits(traits));
	}
	Object.defineProperty(invoke, CONST.EL, {
		value: true
	});
	return make_return_value(invoke, []);
}

function Expression(expression, scope) {
	this.expression = expression;
	this.scope = scope;
}

Expression.prototype.evaluate = function () {
	return evaluate_el(this.expression, this.scope);
};

function Substitute(expression, scope, precondition, postcondition) {
	this.expression = expression;
	this.scope = scope;
	this.precondition = precondition;
	this.postcondition = postcondition;
}

function LazyApplication(functor, context, parameters) {
	this.functor = functor;
	this.context = context;
	this.parameters = parameters;
}

LazyApplication.prototype.apply = function () {
	function unwrap(value) {
		if (value instanceof EvaluateResult) {
			traits.push(value.traits);
			return value.value;
		} else
			return value;
	}
	var traits = [];
	var functor = unwrap(force(this.functor));
	var context = unwrap(force(this.context));
	var traits_container = {traits: traits};
	var parameters =
		this.parameters.map(function(parameter) {
			parameter = weak_force(parameter);
			if (parameter instanceof EvaluateResult) {
				traits.push(parameter.traits);
				parameter = parameter.value;
			}
			if (!functor[CONST.EL])
				return wrap_el_function(parameter, traits_container);
			else
				return parameter;
		});
	var result = functor.apply(context, parameters);
	traits_container.traits = null;
	if (result instanceof EvaluateResult) {
		traits.push(result.traits);
		result = result.value;
	}
	return make_return_value(result, merge_traits(traits));
};
	
function wrap_el_function(functor, traits_container) {
	if (util.traits.is_function(functor) && functor[CONST.EL])
		return function () {
			var args = Array.prototype.slice.call(arguments);
			var result = force(functor(...args));
			if (traits_container && traits_container.traits)
				traits_container.traits.push(result.traits);
			return result.value;
		};
	else
		return functor;
}

function evaluate_el_evaluator (expression, scope) {
	return make_return_value(
		new Expression(expression.expression, scope),
			[]);
}

function evaluate_el_substitute (expression, scope) {
	var sub_scope =
		unwrap_evaluation_result(
			force(evaluate_el(expression.scope, scope)));
	if (!sub_scope)
		sub_scope = new el_scope.Scope({}, scope);
	else if (!(sub_scope instanceof el_scope.Scope))
		sub_scope = new el_scope.Scope(sub_scope, scope);
	return make_return_value(
		new Substitute(expression.value, sub_scope,
				expression.precondition, expression.postcondition),
			[]);
}

function evaluate_substitue(substitute) {
	var post = [];
	var current = substitute;
	var traits = [];
	var precondition_assertion_failed = false;
	while (current instanceof Substitute) {
		while (current.precondition) {
			var precondition_result = force(evaluate_el(current.precondition, current.scope));
			if (precondition_result.value) {
				if (precondition_result.value instanceof Substitute) {
					current = precondition_result.value;
				} else
					break;
			} else {
				precondition_assertion_failed = true;
				break;
			}
		}
		if (precondition_assertion_failed) {
			current = undefined;
		} else {
			if (current.postcondition)
				post.push(current.postcondition);
			var eval_result = force(evaluate_el(current.expression, current.scope));
			current = eval_result.value;
			traits.unshift(eval_result.traits);
		}
	}
	for (var i = post.length - 1; i >= 0; ++i)
		evaluate_substitue(post[i]);
	return make_return_value(current, merge_traits(traits, true));
}

function evaluate_substitue_evaluator (expression, scope) {
	var substitute = force(evaluate_el(expression.value, scope));
	if (substitute.value instanceof Substitute) {
		var result = evaluate_substitue(substitute.value);
		return make_return_value(result.value, merge_traits([result.traits, substitute.traits]));
	} else
		return substitute;
}

function evaluate_scope (expression, scope) {
	return make_return_value(scope, []);
}

function evaluate_scope_uplift (expression, scope) {
	return evaluate_el(expression.expression, scope[CONST.SUPER] || scope);
}

function evaluate_last_value (expression, scope) {
	var traits = [];
	for (var i = 0, end = expression.list.length - 1; i < end; ++i) {
		traits.push(force(evaluate_el(expression.list[i], scope)).traits);
	}
	var last = evaluate_el(expression.list[expression.list.length - 1], scope);
	traits.unshift(last.traits);
	return make_return_value(last.value, merge_traits(traits, true));
}

function evaluate_void(){
	return make_return_value(CONST.VOID, []);
}

function evaluate_sequence (expression, scope) {
	var end = expression.sequence.length - 1
	for (var i = 0; i < end; ++i)
		force(evaluate_el(expression.sequence[i], scope));
	return evaluate_el(expression.sequence[end], scope); // last value
}

function evaluate_object_property_assignment (expression, scope) {
	var target = force(evaluate_el(expression.target, scope));
	var value = weak_force(evaluate_el(expression.value, scope));
	var target_object = _proxy(target.value);
	if (!target.value)
		return value;
	else if (util.traits.is_string(expression.name))
		return make_return_value(
			target_object[expression.name] = value.value,
			merge_traits([target.traits, value.traits]));
	else {
		var name = force(evaluate_el(expression.name, scope));
		return make_return_value(
			target_object[name.value] = value.value,
			merge_traits([target.traits, name.traits, value.traits]));
	}
}

function evaluate_identifier_assignment (expression, scope) {
	var model = lookup_chain(scope, expression.target) || scope.model;
	var value = weak_force(evaluate_el(expression.value, scope));
	_proxy(model)[expression.target] = value.value;
	value.traits.bindable = false;
	return value;
}

function evaluate_computed_identifier_assignment (expression, scope) {
	var name = force(evaluate_el(expression.target, scope));
	var value = weak_force(evaluate_el(expression.value, scope));
	var model = lookup_chain(scope, expression.target) || scope.model;
	return make_return_value(
		_proxy(model)[name.value] = value.value,
		merge_traits([
			name.traits,
			value.traits
		]));
}

function evaluate_assignment (expression, scope) {
	if (!util.traits.is_undefined(expression.name))
		return evaluate_object_property_assignment(expression, scope);
	else if (util.traits.is_string(expression.target))
		return evaluate_identifier_assignment(expression, scope);
	else
		return evaluate_computed_identifier_assignment(expression, scope);
}

function evaluate_touch (expression, scope) {
	var value = force(evaluate_el(expression.value, scope));
	if (value.traits.bindable) {
		var bind_path = value.traits.bind_path;
		Object.getNotifier(value.traits.context).notify({
			type: 'update',
			name: bind_path[bind_path.length - 1]
		});
	}
	return make_return_value(value.value, []);
}

function evaluate_negative_touch (expression, scope) {
	observe.flush(true);
	try {
		var value = force(evaluate_el(expression.value, scope));
		return value;
	} finally {
		observe.flush();
	}
}

function evaluate_bind(expression, scope) {
	var value = force(evaluate_el(expression.value, scope));
	var functor = force(evaluate_el(expression.functor, scope));
	var traits = [value.traits, functor.traits];
	if (value.value && MONADS.has(value.value.constructor)) {
		value = force(MONADS.get(value.value.constructor)['bind'](functor.value, value.value));
		traits.push(value.traits);
		return make_return_value(value.value, merge_traits(traits));
	} else
		return make_return_value(undefined, merge_traits(traits));
}

function evaluate_return(expression, scope) {
	var container = force(evaluate_el(expression.container, scope));
	var value = force(evaluate_el(expression.value, scope));
	var traits = [container.traits, value.traits];
	if (value.value && MONADS.has(value.value.constructor)) {
		value = force(MONADS.get(container.value)['return'](value.value));
		traits.push(value.traits);
		return make_return_value(value.value, merge_traits(traits));
	} else
		return make_return_value(undefined, merge_traits(traits));
}

var MONADS = new Map([
	[
		Array,
		{
			'return': function(x) {return make_return_value([x],[]);},
			'bind': function (f, x) {
				var traits = [];
				var ret = x.map(function (x) {
					var ret = force(f(x));
					traits.push(ret.traits);
					return ret.value;
				});
				return make_return_value(ret, merge_traits(traits));
			}
		}],
	[
		Object,
		{
			'return': function (x) {return make_return_value({[x[0]]: x[1]}, []); },
			'bind': function (f, x) {
				var traits = [];
				var o = {};
				for (var key in x) {
					var v = force(f(x[key]));
					traits.push(v.traits);
					o[key] = v.value;
				}
				return make_return_value(o, merge_traits(traits));
			}
		}],
	[
		Set,
		{
			'return': function (x) {return make_return_value(new Set([x]), []);},
			'bind': function (f, x) {
				var traits = [];
				var s = new Set;
				for (var e of x) {
					var v = force(f(x));
					traits.push(v.traits);
					s.add(v.value);
				}
				return make_return_value(s, merge_traits(traits));
			}
		}],
	[
		Map,
		{
			'return': function (x) {return new Map([x]);},
			'bind': function (f, x) {
				var traits = [];
				var m = new Map;
				x.forEach(function(v, k) {
					v = force(f(v));
					traits.push(v.traits);
					m.set(k, v.value);
				});
				return make_return_value(m, merge_traits(traits));
			}
	}]
]);

var EVALUATERS = new Map([
	['primitive',		evaluate_primitive],
	['identifier',		evaluate_identifier],
	['iterate',			evaluate_iterate],
	['add',				evaluate_add],
	['sub',				evaluate_sub],
	['mul',				evaluate_mul],
	['div',				evaluate_div],
	['mod',				evaluate_mod],
	['gt',				evaluate_gt],
	['ge',				evaluate_ge],
	['lt',				evaluate_lt],
	['le',				evaluate_le],
	['eq',				evaluate_eq],
	['neq',				evaluate_neq],
	['and',				evaluate_and],
	['or',				evaluate_or],
	['neg',				evaluate_neg],
	['bool_neg',		evaluate_bool_neg],
	['conditional',		evaluate_conditional],
	['object',			evaluate_object],
	['array',			evaluate_array],
	['stream',			evaluate_stream],
	['stream_map',		evaluate_stream_map],
	['pipe',			evaluate_pipe],
	['list_pipe',		evaluate_list_pipe],
	['bind',			evaluate_bind],
	['return',			evaluate_return],
	['promise',			evaluate_promise],
	['global_access',	evaluate_global_access],
	['access',			evaluate_access],
	['apply',			evaluate_apply],
	['placeholder',		evaluate_placeholder],
	['void',			evaluate_void],
	['self_reference',	evaluate_self_reference],
	['computed_identifier',	evaluate_computed_identifier],
	['arrow',			evaluate_arrow_function],
	['el',				evaluate_el_evaluator],
	['el_substitute',	evaluate_el_substitute],
	['evaluate_substitue', evaluate_substitue_evaluator],
	['scope',			evaluate_scope],
	['scope_uplift',	evaluate_scope_uplift],
	['last_value',		evaluate_last_value],
	['sequence',		evaluate_sequence],
	['assignment',		evaluate_assignment],
	['force',			evaluate_force],
	['force_primitive',	evaluate_force_primitive],
	['all_properties',	evaluate_all_properties],
	['touch',			evaluate_touch],
	['negative_touch',	evaluate_negative_touch]
]);

function evaluate_el(expression, scope) {
	return EVALUATERS.get(expression.type)(expression, scope);
}

function bind_value(path, value) {
	var ptr = path[0];
	var i = 1, length = path.length - 1;
	while (i < length)
		if (util.traits.is_object(ptr) || util.traits.is_function(ptr))
			ptr = ptr[path[i++]];
		else
			return ;
	_proxy(ptr)[path[length]] = value;
}

function set_global_monad_registry(constructor, monad_ops) {
	MONADS.set(constructor, monad_ops);
}

return {
	apply_el_function: apply_el_function,
	bind_value: bind_value,
	evaluate_el: evaluate_el,
	evaluate_substitue: evaluate_substitue,
	EvaluateResult: EvaluateResult,
	Expression: Expression,
	Substitute: Substitute,
	force: force,
	lookup_chain: lookup_chain,
	merge_traits: merge_traits,
	make_return_value: make_return_value,
	wrap_el_function: wrap_el_function,
	set_global_monad_registry: set_global_monad_registry
};

});

define('el/el_watch',['./el_eval', './el_const', 'util/util'],
function (el_eval, CONST, util) {
'use strict';

function attempt_bind(eval_result) {
	if (util.traits.is_function(eval_result.value))
		return eval_result.value.bind(eval_result.traits.context);
	else
		return eval_result.value;
}

// evaluate and watch expression
// no need for old values or such
function watch_and_evaluate_el(expression, options) {
	var
		scope = options.scope,
		observe_scope = options.observe_scope,
		handler = options.handler,
		splice_handler = options.splice_handler,
		watch_traits = [],
		watch_traits_set = new Set,
		removed = false,
		substitute = null;

	function update_dependencies(new_dependencies) {
		var
			current_dependencies = watch_traits,
			new_dependencies_set = new Set;
		// addition
		new_dependencies.forEach(function (pair) {
			var object = pair[0];
			var property = pair[1];
			var hash = observe_scope.object_property_hash(object, property);
			if (!watch_traits_set.has(hash))
				hash = observe_scope.attach(object, property, watch_handler);
			new_dependencies_set.add(hash);
		});
		current_dependencies.forEach(function(pair) {
			var object = pair[0];
			var property = pair[1];
			var hash = observe_scope.object_property_hash(object, property);
			if (!new_dependencies_set.has(hash))
				observe_scope.detach(object, property, watch_handler);
		});
		watch_traits = new_dependencies;
		watch_traits_set = new_dependencies_set;
	}

	function watch_handler(change) {
		if (removed) {
			watch_handler.disabled = true;
			return;
		}

		var eval_result;
		if (substitute) {
			eval_result = el_eval.evaluate_substitue(substitute);
		} else {
			eval_result = el_eval.force(el_eval.evaluate_el(expression, scope));
			if (eval_result.value instanceof el_eval.Substitute) {
				substitute = eval_result.value;
				eval_result = el_eval.evaluate_substitue(substitute);
			}
		}

		if (util.traits.is_object(eval_result.value) && eval_result.value.iterate) {
			watch_iterate(eval_result.value, change);
		} else if (eval_result.value instanceof Promise) {
			// promise style
			eval_result.value.then(function (return_value) {
				update_dependencies(return_value.traits);
				watch_handler.disabled = handler(attempt_bind(return_value));
			});
		} else {
			update_dependencies(eval_result.traits);
			watch_handler.disabled = handler(attempt_bind(eval_result));
			if (util.traits.is_undefined(watch_handler.disabled))
				watch_handler.disabled = true;
		}
	}

	function watch_iterate(eval_result, change) {
		var
			type = change.type,
			target = change.object,
			index = change.index,
			name = Number(String(change.name)),
			added = change.addedCount,
			removed = change.removed,
			splice_source = change[CONST.SPLICE];
		function dispatch(collection) {
			update_dependencies(collection.traits);
			switch(type) {
			case 'splice':
			case 'add':
			case 'update':
			case 'delete':
				if (util.traits.is_array(collection.value) &&
					util.traits.is_function(splice_handler) &&
					target === collection.value &&
					!splice_source)
					return watch_handler.disabled =
						splice_handler(
							type,
							collection.value,
							util.traits.is_undefined(index) ? name : index,
							added,
							removed);
			default:
				watch_handler.disabled = handler(collection.value);
			}
		}

		if (eval_result.collection instanceof Promise)
			// resolves later
			eval_result.collection.then(dispatch);
		else
			dispatch(el_eval.force(eval_result.collection));	// resolve now
	}

	function bind_handler(value) {
		// trace and assign new value
		if (watch_traits.bindable)
			el_eval.bind_value(watch_traits.bind_path, value);
	}

	function get_context(value) {
		return watch_traits.context;
	}

	function unwatch() {
		observe_scope.detach_all(watch_handler);
		watch_handler.disabled = true;
		removed = true;
	}

	watch_handler({});

	return {
		bind_handler: bind_handler,
		get_context: get_context,
		unwatch: unwatch
	};
}

return watch_and_evaluate_el;

});



define('el/parser',['require'],function(require){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,6],$V1=[1,10],$V2=[1,30],$V3=[1,11],$V4=[1,32],$V5=[1,20],$V6=[1,21],$V7=[1,22],$V8=[1,23],$V9=[1,26],$Va=[1,27],$Vb=[1,31],$Vc=[1,33],$Vd=[1,34],$Ve=[1,35],$Vf=[1,36],$Vg=[1,44],$Vh=[1,29],$Vi=[1,38],$Vj=[1,39],$Vk=[1,40],$Vl=[1,41],$Vm=[1,42],$Vn=[1,43],$Vo=[1,45],$Vp=[1,48],$Vq=[1,62],$Vr=[1,49],$Vs=[1,50],$Vt=[1,51],$Vu=[1,54],$Vv=[1,55],$Vw=[1,56],$Vx=[1,57],$Vy=[1,58],$Vz=[1,59],$VA=[1,60],$VB=[1,61],$VC=[1,52],$VD=[1,53],$VE=[1,63],$VF=[1,64],$VG=[1,65],$VH=[1,66],$VI=[1,67],$VJ=[1,68],$VK=[1,69],$VL=[1,70],$VM=[2,128],$VN=[5,9,11,12,13,16,17,19,22,23,37,38,39,40,41,42,45,46,47,48,50,51,52,53,54,55,56,57,58,61,72,88],$VO=[1,77],$VP=[1,80],$VQ=[1,78],$VR=[1,83],$VS=[1,84],$VT=[2,114],$VU=[1,88],$VV=[1,87],$VW=[1,89],$VX=[5,13,22],$VY=[1,92],$VZ=[1,91],$V_=[1,97],$V$=[1,98],$V01=[1,101],$V11=[1,102],$V21=[1,103],$V31=[1,122],$V41=[1,124],$V51=[1,128],$V61=[1,130],$V71=[1,147],$V81=[1,148],$V91=[5,9,12,13,16,17,19,22,37,38,39,40,41,42,46,48,50,51,52,53,54,55,56,57,58,61,72,88],$Va1=[1,155],$Vb1=[1,156],$Vc1=[2,100],$Vd1=[5,9,12,13,17,22,46,48,61,72,88],$Ve1=[2,45],$Vf1=[5,9,12,13,16,17,22,37,38,42,46,48,50,51,52,53,54,55,56,57,58,61,72,88],$Vg1=[5,9,12,13,16,17,22,37,38,39,40,41,42,46,48,50,51,52,53,54,55,56,57,58,61,72,88],$Vh1=[5,9,12,13,16,17,22,42,46,48,50,51,52,53,54,55,56,57,58,61,72,88],$Vi1=[5,9,11,12,13,16,19,23,37,38,39,40,41,42,45,47,48,50,51,52,53,54,55,56,57,58,88],$Vj1=[2,39],$Vk1=[12,13],$Vl1=[1,195],$Vm1=[5,46],$Vn1=[12,13,88],$Vo1=[2,38],$Vp1=[2,44],$Vq1=[1,252],$Vr1=[12,22];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"top_expression":3,"expression":4,"EOF":5,"iteration_expression":6,"sequence_expression":7,"pipe_expression":8,">>=":9,"RET":10,"(":11,",":12,")":13,"promise_expression":14,"arithmetic_expression":15,"?":16,":":17,"access_expression":18,"!":19,"@":20,"{":21,"}":22,"^":23,"application_expression":24,"primary_expression":25,"boolean_expression":26,"literal_expression":27,"object_expression":28,"arrow_function_expression":29,"select_last_value_expression":30,"el_expression":31,"`":32,"embedded_string_expression":33,"DELETE":34,"#":35,"!#":36,"+":37,"-":38,"*":39,"/":40,"%":41,"<=>":42,"IDENT":43,"IN":44,"[":45,"]":46,".":47,"|":48,"expression_list":49,"->":50,"&&":51,"||":52,">":53,">=":54,"<":55,"<=":56,"===":57,"!==":58,"curry_parameter_list":59,"curry_parameter":60,"...":61,"\\":62,"=>":63,"arrow_function_output_expression":64,"arrow_function_input_expression":65,"identifier_list":66,"${":67,"@{":68,"^^":69,"@@@":70,"array_expression_list":71,"..":72,"object_expression_list":73,"object_expression_entry":74,"STR":75,"assignment_instruction":76,"primitive_constant":77,"@@":78,"NUM":79,"INF":80,"NAN":81,"UNDEF":82,"T":83,"F":84,"VOID":85,"sequence":86,"sequence_element":87,";":88,"=":89,"assignment_value":90,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",9:">>=",10:"RET",11:"(",12:",",13:")",16:"?",17:":",19:"!",20:"@",21:"{",22:"}",23:"^",32:"`",33:"embedded_string_expression",34:"DELETE",35:"#",36:"!#",37:"+",38:"-",39:"*",40:"/",41:"%",42:"<=>",43:"IDENT",44:"IN",45:"[",46:"]",47:".",48:"|",50:"->",51:"&&",52:"||",53:">",54:">=",55:"<",56:"<=",57:"===",58:"!==",61:"...",62:"\\",63:"=>",67:"${",68:"@{",69:"^^",70:"@@@",72:"..",75:"STR",78:"@@",79:"NUM",80:"INF",81:"NAN",82:"UNDEF",83:"T",84:"F",85:"VOID",88:";",89:"="},
productions_: [0,[3,2],[3,2],[3,2],[4,1],[4,3],[4,6],[4,1],[4,1],[4,5],[4,1],[4,3],[4,2],[4,5],[4,2],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,3],[4,3],[4,2],[4,2],[4,2],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,2],[6,3],[6,5],[6,7],[18,4],[18,3],[18,3],[18,4],[18,3],[18,4],[18,4],[8,3],[8,4],[8,7],[8,8],[14,5],[14,3],[26,3],[26,3],[26,3],[26,3],[26,3],[26,3],[26,3],[26,3],[26,2],[24,4],[24,5],[24,3],[59,3],[59,1],[60,1],[60,1],[60,2],[29,5],[29,6],[65,1],[65,3],[65,4],[64,1],[64,5],[66,1],[66,2],[66,3],[31,3],[31,6],[31,9],[31,11],[31,4],[31,1],[30,4],[27,2],[27,3],[27,4],[27,6],[27,6],[27,7],[27,5],[27,6],[27,7],[27,8],[27,8],[27,9],[27,6],[71,3],[71,4],[71,1],[71,2],[28,2],[28,3],[73,3],[73,1],[74,3],[74,5],[74,3],[49,1],[49,1],[49,3],[49,3],[25,1],[25,1],[25,1],[77,1],[77,1],[77,1],[77,1],[77,1],[77,1],[77,1],[77,1],[7,1],[86,3],[86,2],[87,1],[87,1],[76,5],[76,6],[76,3],[76,6],[90,1],[90,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: case 2: case 3:
return $$[$0-1];
break;
case 4: case 7: case 8: case 10: case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 66: case 73: case 113: case 127: case 128:
this.$ = $$[$0];
break;
case 5:
this.$ = {
			type: 'bind',
			value: $$[$0-2],
			functor: $$[$0]
		};
break;
case 6:
this.$ = {
			type: 'return',
			container: $$[$0-3],
			value: $$[$0-1]
		};
break;
case 9:
this.$ = {
			type: 'conditional',
			condition: $$[$0-4],
			consequent: $$[$0-2],
			alternative: $$[$0]
		};
break;
case 11: case 23: case 24:
this.$ = $$[$0-1];
break;
case 12:
this.$ = {
			type: 'force',
			value: $$[$0-1]
		};
break;
case 13:
this.$ = {
			type: 'evaluate_substitue',
			value: $$[$0-1]
		};
break;
case 14:
this.$ = {
			type: 'force_primitive',
			value: $$[$0-1]
		};
break;
case 25:
this.$ = {
			type: 'delete',
			value: $$[$0]
		};
break;
case 26:
this.$ = {
			type: 'touch',
			value: $$[$0]
		};
break;
case 27:
this.$ = {
			type: 'negative_touch',
			value: $$[$0]
		};
break;
case 28:
this.$ = attempt_compress({
			type: 'add',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 29:
this.$ = attempt_compress({
			type: 'sub',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 30:
this.$ = attempt_compress({
			type: 'mul',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 31:
this.$ = attempt_compress({
			type: 'div',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 32:
this.$ = attempt_compress({
			type: 'mod',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 33:
this.$ = attempt_compress({
			type: 'cmp',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 34:
this.$ = attempt_compress({
			type: 'neg',
			value: $$[$0]
		});
break;
case 35:
this.$ = {
			type: 'iterate',
			element: $$[$0-2],
			collection: $$[$0]
		};
break;
case 36:
this.$ = {
			type: 'iterate',
			element: $$[$0-4],
			index: $$[$0-2],
			collection: $$[$0]
		};
break;
case 37:
this.$ = {
			type: 'iterate',
			element: $$[$0-6],
			index: $$[$0-4],
			reference: $$[$0-2],
			collection: $$[$0]
		};
break;
case 38:
this.$ = {
			type: 'access',
			left: $$[$0-3],
			right: $$[$0-1]
		};
break;
case 39:
this.$ = {
			type: 'access',
			left: $$[$0-2],
			right: $$[$0]
		};
break;
case 40:
this.$ = {
			type: 'all_properties',
			value: $$[$0-2]
		};
break;
case 41:
this.$ = {
			type: 'all_properties',
			value: $$[$0-3]
		};
break;
case 42:
this.$ = {
			type: 'global_access',
			name: $$[$0]
		};
break;
case 43:
this.$ = {
			type: 'global_access',
			value: $$[$0-1]
		};
break;
case 44:
this.$ = {
			type: 'computed_identifier',
			value: $$[$0-1]
		};
break;
case 45:
this.$ = {
			type: 'pipe',
			left: $$[$0-2],
			right: $$[$0]
		};
break;
case 46:
this.$ = {
			type: 'pipe',
			left: $$[$0-3],
			right: $$[$0],
			force: true
		};
break;
case 47:
this.$ = {
			type: 'list_pipe',
			left: flatten([$$[$0-5], $$[$0-3]]),
			right: $$[$0]
		};
break;
case 48:
this.$ = {
			type: 'list_pipe',
			left: flatten([$$[$0-6], $$[$0-4]]),
			right: $$[$0],
			force: true
		};
break;
case 49:
this.$ = {
			type: 'promise',
			promise: $$[$0-4],
			resolve: $$[$0-2],
			reject: $$[$0]
		};
break;
case 50:
this.$ = {
			type: 'promise',
			promise: $$[$0-2],
			resolve: $$[$0]
		};
break;
case 51:
this.$ = attempt_compress({
			type: 'and',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 52:
this.$ = attempt_compress({
			type: 'or',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 53:
this.$ = attempt_compress({
			type: 'gt',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 54:
this.$ = attempt_compress({
			type: 'ge',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 55:
this.$ = attempt_compress({
			type: 'lt',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 56:
this.$ = attempt_compress({
			type: 'le',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 57:
this.$ = attempt_compress({
			type: 'eq',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 58:
this.$ = attempt_compress({
			type: 'neq',
			left: $$[$0-2],
			right: $$[$0]
		});
break;
case 59:
this.$ = attempt_compress({
			type: 'bool_neg',
			value: $$[$0]
		});
break;
case 60:
this.$ = {
			type: 'apply',
			functor: $$[$0-3],
			parameters: flatten($$[$0-1])
		};
break;
case 61:
this.$ = {
			type: 'apply',
			functor: $$[$0-4],
			parameters: flatten($$[$0-1]),
			force: true
		};
break;
case 62:
this.$ = {
			type: 'apply',
			functor: $$[$0-2],
			parameters: []
		};
break;
case 63: case 77: case 98: case 104: case 106: case 111: case 112: case 125:
this.$ = [$$[$0-2], $$[$0]];
break;
case 64: case 75: case 100: case 105:
this.$ = [$$[$0], []];
break;
case 65:
this.$ = {
			type: 'placeholder'
		};
break;
case 67:
this.$ = {
			type: 'spread',
			value: $$[$0]
		};
break;
case 68:
this.$ = {
			type: 'arrow',
			value: $$[$0-1]
		};
break;
case 69:
this.$ = {
			type: 'arrow',
			input: $$[$0-3],
			value: $$[$0-1]
		};
break;
case 70:
this.$ = find_spread({
			parameters: check_duplicates(flatten($$[$0]))
		});
break;
case 71:
this.$ = {
			context: $$[$0-1],
			parameters: []
		};
break;
case 72:
this.$ = find_spread({
			context: $$[$0-2],
			parameters: check_duplicates(flatten($$[$0]))
		});
break;
case 74:
this.$ = $$[$0-2];
break;
case 76:
this.$ = [{spread: $$[$0]}, []];
break;
case 78:
this.$ = {
			type: 'el',
			expression: $$[$0-1]
		};
break;
case 79:
this.$ = {
			type: 'el_substitute',
			scope: $$[$0-3],
			value: $$[$0-1]
		};
break;
case 80:
this.$ = {
			type: 'el_substitute',
			precondition: $$[$0-6],
			scope: $$[$0-3],
			value: $$[$0-1]
		};
break;
case 81:
this.$ = {
			type: 'el_substitute',
			precondition: $$[$0-8],
			postcondition: $$[$0-6],
			scope: $$[$0-3],
			value: $$[$0-1]
		};
break;
case 82:
this.$ = {
			type: 'scope_uplift',
			value: $$[$0-1]
		};
break;
case 83:
this.$ = {
			type: 'scope'
		};
break;
case 84:
this.$ = {
			type: 'last_value',
			list: flatten($$[$0-1])
		};
break;
case 85:
this.$ = {
			type: 'array',
			array: []
		};
break;
case 86:
this.$ = {
			type: 'array',
			array: flatten($$[$0-1])
		};
break;
case 87:
this.$ = {
			type: 'stream',
			start: $$[$0-2]
		};
break;
case 88:
this.$ = {
			type: 'stream',
			start: $$[$0-4],
			step: $$[$0-2]
		};
break;
case 89:
this.$ = {
			type: 'stream',
			start: $$[$0-4],
			next: $$[$0-2]
		};
break;
case 90:
this.$ = {
			type: 'stream',
			start: $$[$0-5],
			next: $$[$0-3],
			end: $$[$0-1]
		};
break;
case 91:
this.$ = {
			type: 'stream',
			start: $$[$0-3],
			end: $$[$0-1]
		};
break;
case 92:
this.$ = {
			type: 'stream',
			start: $$[$0-4],
			filter: $$[$0-1]
		};
break;
case 93:
this.$ = {
			type: 'stream',
			start: $$[$0-5],
			end: $$[$0-3],
			filter: $$[$0-1]
		};
break;
case 94:
this.$ = {
			type: 'stream',
			start: $$[$0-6],
			step: $$[$0-4],
			filter: $$[$0-1]
		};
break;
case 95:
this.$ = {
			type: 'stream',
			start: $$[$0-6],
			next: $$[$0-4],
			filter: $$[$0-1]
		};
break;
case 96:
this.$ = {
			type: 'stream',
			start: $$[$0-7],
			next: $$[$0-5],
			end: $$[$0-3],
			filter: $$[$0-1]
		};
break;
case 97:
this.$ = {
			type: 'stream_map',
			map: $$[$0-4],
			iterator: $$[$0-1]
		};
break;
case 99:
this.$ = [{type: 'spread', value: $$[$0-2]}, $$[$0]];
break;
case 101:
this.$ = [{type: 'spread', value: $$[$0]}, []];
break;
case 102:
this.$ = {
			type: 'object',
			entries: []
		};
break;
case 103:
this.$ = {
			type: 'object',
			entries: flatten($$[$0-1])
		};
break;
case 107:
this.$ = [$$[$0-3], $$[$0]];
break;
case 108:
this.$ = [replace_escapes($$[$0-2]), $$[$0]];
break;
case 109: case 110:
this.$ = [$$[$0],[]];
break;
case 114:
this.$ = {
			type: 'identifier',
			name: $$[$0]
		};
break;
case 115:
this.$ = {
			type: 'self_reference'
		};
break;
case 116:
this.$ = make_primitive_value_expression(Number($$[$0]));
break;
case 117:
this.$ = make_primitive_value_expression(Infinity);
break;
case 118:
this.$ = make_primitive_value_expression(NaN);
break;
case 119:
this.$ = make_primitive_value_expression();
break;
case 120:
this.$ = make_primitive_value_expression(true);
break;
case 121:
this.$ = make_primitive_value_expression(false);
break;
case 122:
this.$ = make_primitive_value_expression(replace_escapes($$[$0]));
break;
case 123:
this.$ = {
			type: 'void'
		};
break;
case 124:
this.$ = {
			type: 'sequence',
			sequence: flatten($$[$0])
		};
break;
case 126:
this.$ = [$$[$0-1], []];
break;
case 129:
this.$ = {
			type: 'assignment',
			target: $$[$0-4],
			name: $$[$0-2],
			value: $$[$0]
		};
break;
case 130:
this.$ = {
			type: 'assignment',
			target: $$[$0-5],
			name: $$[$0-3],
			value: $$[$0]
		};
break;
case 131:
this.$ = {
			type: 'assignment',
			target: $$[$0-2],
			value: $$[$0]
		};
break;
case 132:
this.$ = {
			type: 'assignment',
			target: $$[$0-3],
			value: $$[$0]
		};
break;
}
},
table: [{3:1,4:2,6:3,7:4,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:[1,24],45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:46,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo,86:25,87:37},{1:[3]},{5:[1,47],9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$VA,47:$VB,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL,88:$VM},{5:[1,71]},{5:[1,72]},o($VN,[2,4]),{11:[1,73]},o($VN,[2,7]),o($VN,[2,8]),o($VN,[2,10]),{4:74,7:75,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,62:[1,76],67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:46,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo,86:25,87:37},{11:$VP,19:$VQ,45:[1,79]},o($VN,[2,15]),o($VN,[2,16]),o($VN,[2,17]),o($VN,[2,18]),o($VN,[2,19]),o($VN,[2,20]),o($VN,[2,21]),o($VN,[2,22]),{33:[1,81]},{4:82,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:85,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:86,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o([5,9,11,16,19,23,37,38,39,40,41,42,45,47,48,50,51,52,53,54,55,56,57,58,88],$VT,{12:$VU,44:$VV,89:$VW}),o($VX,[2,124]),{4:90,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{45:$VY,47:$VZ},o($VN,[2,113]),o($VN,[2,115]),{4:93,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:96,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,46:[1,94],61:$V_,67:$Vc,68:$Vd,69:$Ve,70:$Vf,71:95,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{22:$V$,43:$V01,45:$V11,73:99,74:100,75:$V21},{4:104,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{21:[1,105],45:[1,106]},{11:[1,107]},o($VN,[2,83]),{88:[1,108]},o($VN,[2,116]),o($VN,[2,117]),o($VN,[2,118]),o($VN,[2,119]),o($VN,[2,120]),o($VN,[2,121]),o($VN,[2,122]),o($VN,[2,123]),{88:[2,127]},{1:[2,1]},{4:109,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:110,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o([5,9,12,13,16,17,19,22,23,37,38,39,40,41,42,45,46,47,48,50,51,52,53,54,55,56,57,58,61,72,88],[2,12],{11:[1,112]}),o($VN,[2,14]),{4:113,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:114,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:115,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:116,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:117,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:118,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:119,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:120,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:121,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$V31,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{39:$V41,43:[1,123]},{4:129,8:5,10:$V0,11:$V1,13:[1,126],14:7,15:8,16:$V51,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,59:125,60:127,61:$V61,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:131,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:132,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:133,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:134,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:135,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:136,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:137,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:138,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{1:[2,2]},{1:[2,3]},{4:139,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,12:[1,141],13:[1,140],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$VA,47:$VB,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL,88:$VM},{13:[1,142]},{21:[1,146],43:$V71,61:$V81,63:[1,143],65:144,66:145},o([9,11,12,13,16,19,23,37,38,39,40,41,42,45,47,48,50,51,52,53,54,55,56,57,58,88],$VT,{89:$VW}),{21:[1,149]},{4:150,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:152,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,49:151,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:153,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{32:[1,154]},o($VN,[2,25]),{11:$VP,19:$VQ,45:[1,157]},o($VN,$VT),o($V91,[2,26],{11:$Vq,23:$Vt,45:$Va1,47:$Vb1}),o($V91,[2,27],{11:$Vq,23:$Vt,45:$Va1,47:$Vb1}),{4:158,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{43:[1,159]},{4:162,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:161,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo,90:160},o($V91,[2,34],{11:$Vq,23:$Vt,45:$Va1,47:$Vb1}),{43:[1,163]},{4:164,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($V91,[2,59],{11:$Vq,23:$Vt,45:$Va1,47:$Vb1}),o($VN,[2,85]),{46:[1,165]},{9:$Vp,11:$Vq,12:[1,167],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:$Vc1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL,61:[1,168],72:[1,166]},{4:169,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($VN,[2,102]),{22:[1,170]},{12:[1,171],22:[2,105]},{17:[1,172]},{4:173,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{17:[1,174]},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,175],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:176,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:177,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:178,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($VX,[2,126],{8:5,14:7,15:8,18:9,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,77:28,87:37,76:46,86:179,4:180,10:$V0,11:$V1,19:$V2,20:$V3,21:$V4,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo}),o($Vd1,[2,5],{11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{9:$Vp,11:$Vq,16:$Vr,17:[1,181],19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:182,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:129,8:5,10:$V0,11:$V1,14:7,15:8,16:$V51,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,59:183,60:127,61:$V61,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($Vd1,$Ve1,{11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o([5,9,12,13,22,46,48,50,61,72,88],[2,50],{11:$Vq,16:$Vr,17:[1,184],19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o($Vf1,[2,28],{11:$Vq,19:$Vs,23:$Vt,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),o($Vf1,[2,29],{11:$Vq,19:$Vs,23:$Vt,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),o($Vg1,[2,30],{11:$Vq,19:$Vs,23:$Vt,45:$Va1,47:$Vb1}),o($Vg1,[2,31],{11:$Vq,19:$Vs,23:$Vt,45:$Va1,47:$Vb1}),o($Vf1,[2,32],{11:$Vq,19:$Vs,23:$Vt,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),o($Vh1,[2,33],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,185],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{45:$VY,46:[1,186],47:$VZ},o($Vi1,$Vj1,{89:[1,187]}),o($VN,[2,40]),{13:[1,188]},o($VN,[2,62]),{12:[1,189],13:[2,64]},o($Vk1,[2,65]),o($Vk1,[2,66],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{4:190,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o([5,9,12,13,16,17,22,46,48,50,51,52,61,72,88],[2,51],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o([5,9,12,13,16,17,22,46,48,50,52,61,72,88],[2,52],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,51:$VE,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o($Vh1,[2,53],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),o($Vh1,[2,54],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),o($Vh1,[2,55],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),o($Vh1,[2,56],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),o($Vh1,[2,57],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),o($Vh1,[2,58],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,45:$Va1,47:$Vb1}),{9:$Vp,11:$Vq,12:[1,191],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($VN,[2,11]),{4:152,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,49:192,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:153,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($VN,[2,23]),{4:194,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$Vl1,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,64:193,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{63:[1,196]},{63:[2,70]},{4:197,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{12:[1,198],63:[2,75]},{43:[1,199]},{4:200,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,201],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{13:[1,202]},{9:$Vp,11:$Vq,12:[1,203],13:[2,109],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$VA,47:$VB,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{12:[1,204],13:[2,110]},o($VN,[2,24]),{4:205,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$V31,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{39:$V41,43:[1,206]},{4:207,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($Vm1,[2,35],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{12:[1,209],44:[1,208]},o($Vn1,[2,131]),o($Vn1,[2,133]),o($Vn1,[2,134],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$VA,47:$VB,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o($VN,[2,42]),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,210],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($VN,[2,86]),{4:212,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,46:[1,211],48:[1,213],67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:214,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,61:$V_,67:$Vc,68:$Vd,69:$Ve,70:$Vf,71:215,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{48:[1,216]},{9:$Vp,11:$Vq,12:[1,217],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[2,101],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($VN,[2,103]),{43:$V01,45:$V11,73:218,74:100,75:$V21},{4:219,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,220],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:221,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($VN,[2,78]),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,222],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{9:$Vp,11:$Vq,12:[1,224],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,223],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{9:$Vp,11:$Vq,13:[1,225],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($VX,[2,125]),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$VA,47:$VB,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL,88:$VM},{4:226,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($V91,[2,46],{11:$Vq,23:$Vt,45:$Va1,47:$Vb1}),{13:[1,227]},{4:228,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($Vi1,$Vo1,{89:[1,229]}),o($VN,[2,41]),{4:162,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:161,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo,90:230},o($VN,[2,60]),{4:129,8:5,10:$V0,11:$V1,14:7,15:8,16:$V51,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,59:231,60:127,61:$V61,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($Vk1,[2,67],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{4:232,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{13:[1,233]},{13:[1,234]},{9:$Vp,11:$Vq,13:[2,73],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{21:[1,235],22:$V$,43:$V01,45:$V11,73:99,74:100,75:$V21},{4:194,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$Vl1,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,64:236,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,237],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{43:$V71,61:$V81,66:238},{63:[2,76]},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,239],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($Vi1,$Vp1,{89:[1,240]}),o($VN,[2,84]),{4:152,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,49:241,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:153,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:152,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,49:242,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:153,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,243],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($VN,$Vj1),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,244],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:245,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{43:[1,246]},o($VN,[2,43]),o($VN,[2,87]),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,248],47:$Vb1,48:[1,249],50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL,72:[1,247]},{4:250,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,12:$Vq1,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:$Vc1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL,72:[1,251]},{46:[2,98]},{6:253,43:[1,254]},{4:256,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,61:$V_,67:$Vc,68:$Vd,69:$Ve,70:$Vf,71:255,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{22:[2,104]},o($Vr1,[2,106],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{17:[1,257]},o($Vr1,[2,108],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{4:258,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{21:[1,259]},{4:260,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($VN,[2,82]),o([5,9,12,13,16,17,22,46,48,50,61,72,88],[2,9],{11:$Vq,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o($VN,[2,61]),o([5,9,12,13,17,22,46,48,50,61,72,88],[2,49],{11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{4:162,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:161,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo,90:261},o($Vn1,[2,129]),{13:[2,63]},{9:$Vp,11:$Vq,13:[1,262],16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{19:[1,264],48:[1,263]},o($VN,[2,68]),{4:180,7:265,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:46,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo,86:25,87:37},{13:[1,266]},{43:$V71,61:$V81,63:[2,71],66:267},{63:[2,77]},o($VN,[2,13]),{4:162,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$V3,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VO,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,76:161,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo,90:268},{13:[2,111]},{13:[2,112]},o($VN,$Vo1),o($VN,$Vp1),o($Vm1,[2,36],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{44:[1,269]},{46:[1,270],48:[1,271]},o($VN,[2,91]),{4:272,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,273],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:275,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,46:[1,274],48:[1,276],67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:256,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,61:$V_,67:$Vc,68:$Vd,69:$Ve,70:$Vf,71:215,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{46:[1,277]},{12:$VU,44:$VV},{46:[2,99]},{9:$Vp,11:$Vq,12:$Vq1,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:$Vc1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:278,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,279],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:280,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,281],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($Vn1,[2,130]),o($VN,[2,6]),{4:282,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{48:[1,283]},{22:[1,284]},o($VN,[2,69]),{63:[2,72]},o($Vn1,[2,132]),{4:285,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($VN,[2,88]),{4:286,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o([9,48,72],$Ve1,{11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,287],47:$Vb1,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o($VN,[2,92]),o($VN,[2,89]),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,288],47:$Vb1,48:[1,289],50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:290,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($VN,[2,97]),o($Vr1,[2,107],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o($VN,[2,79]),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,291],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{21:[1,292]},o($Vd1,[2,47],{11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{4:293,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{22:[1,294]},o($Vm1,[2,37],{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,295],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($VN,[2,93]),o($VN,[2,90]),{4:296,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,297],47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{4:298,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{4:299,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},o($Vd1,[2,48],{11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),{13:[2,74]},o($VN,[2,94]),o([9,48],$Ve1,{11:$Vq,16:$Vr,19:$Vs,23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,46:[1,300],47:$Vb1,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL}),o($VN,[2,95]),{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,301],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,302],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($VN,[2,96]),o($VN,[2,80]),{4:303,8:5,10:$V0,11:$V1,14:7,15:8,18:9,19:$V2,20:$VR,21:$V4,24:12,25:13,26:14,27:15,28:16,29:17,30:18,31:19,32:$V5,34:$V6,35:$V7,36:$V8,38:$V9,39:$Va,43:$VS,45:$Vb,67:$Vc,68:$Vd,69:$Ve,70:$Vf,75:$Vg,77:28,78:$Vh,79:$Vi,80:$Vj,81:$Vk,82:$Vl,83:$Vm,84:$Vn,85:$Vo},{9:$Vp,11:$Vq,16:$Vr,19:$Vs,22:[1,304],23:$Vt,37:$Vu,38:$Vv,39:$Vw,40:$Vx,41:$Vy,42:$Vz,45:$Va1,47:$Vb1,48:$VC,50:$VD,51:$VE,52:$VF,53:$VG,54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL},o($VN,[2,81])],
defaultActions: {46:[2,127],47:[2,1],71:[2,2],72:[2,3],145:[2,70],199:[2,76],215:[2,98],218:[2,104],231:[2,63],238:[2,77],241:[2,111],242:[2,112],255:[2,99],267:[2,72],294:[2,74]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};


// additional functions

function is_binary_compressible(left, right) {
	return left.type === 'primitive' && right.type === 'primitive';
}

function is_unary_compressible(value) {
	return value.type === 'primitive';
}

function make_primitive_value_expression(value) {
	return {
		type: 'primitive',
		value: value
	};
}

function compare(a, b) {
	return (a > b) - (a < b);
}

function attempt_compress(expression) {
	switch (expression.type) {
	case 'add':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value + expression.right.value) :
			expression;
	case 'sub':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value - expression.right.value) :
			expression;
	case 'mul':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value * expression.right.value) :
			expression;
	case 'div':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value / expression.right.value) :
			expression;
	case 'mod':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value % expression.right.value) :
			expression;
	case 'cmp':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(
				compare(expression.left.value, expression.right.value)) :
			expression;
	case 'eq':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value === expression.right.value) :
			expression;
	case 'gt':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value > expression.right.value) :
			expression;
	case 'ge':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value >= expression.right.value) :
			expression;
	case 'lt':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value < expression.right.value) :
			expression;
	case 'le':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value <= expression.right.value) :
			expression;
	case 'neg':
		return is_unary_compressible(expression.value) ?
			make_primitive_value_expression(-expression.value.value) :
			expression;
	case 'and':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value && expression.right.value) :
			expression;
	case 'or':
		return is_binary_compressible(expression.left, expression.right) ?
			make_primitive_value_expression(expression.left.value || expression.right.value) :
			expression;
	case 'bool_neg':
		return is_binary_compressible(expression.value) ?
			make_primitive_value_expression(!expression.value.value) :
			expression;
	case 'conditional':
		return is_unary_compressible(expression.condition) ?
			expression.condition.value ? expression.consequent : expression.alternative :
			expression;
	default:
		return expression;
	}
}

function flatten(list) {
	var vec = [];
	var first = list;
	while (first.length) {
		vec.push(first[0]);
		first = first[1];
	}
	return vec;
}

function check_duplicates(parameters) {
	var set = new Set(parameters);
	if (set.size === parameters.length) {
		return parameters;
	} else {
		throw new Error('Duplicate parameter names');
	}
}

function find_spread(input) {
	if ('object' === typeof input.parameters[input.parameters.length - 1]) {
		var spread = input.parameters.pop();
		input.spread = spread.spread;
	}
	return input;
}

function replace_escapes(string) {
	return string.replace(/\\'/g, '\'')
		.replace(/\\"/g, '"')
		.replace(/\\n/g, '\n')
		.replace(/\\r/g, '\r')
		.replace(/\\t/g, '\t')
		.replace(/\\b/g, '\b')
		.replace(/\\f/g, '\f')
		.slice(1, -1);
}

/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip spaces */
break;
case 1:/* skip comments */
break;
case 2:return 75
break;
case 3:return 75
break;
case 4:return 79
break;
case 5:return 79
break;
case 6:return 80
break;
case 7:return 81
break;
case 8:return 83
break;
case 9:return 84
break;
case 10:return 42
break;
case 11:return 9
break;
case 12:return 50
break;
case 13:return 63
break;
case 14:return 39
break;
case 15:return 40
break;
case 16:return 37
break;
case 17:return 38
break;
case 18:return 36
break;
case 19:return 19
break;
case 20:return 35
break;
case 21:return 51
break;
case 22:return 51
break;
case 23:return 52
break;
case 24:return 52
break;
case 25:return 53
break;
case 26:return 53
break;
case 27:return 55
break;
case 28:return 55
break;
case 29:return 54
break;
case 30:return 54
break;
case 31:return 56
break;
case 32:return 56
break;
case 33:return 57
break;
case 34:return 57
break;
case 35:return 58
break;
case 36:return 58
break;
case 37:return 16
break;
case 38:return 17
break;
case 39:return 41
break;
case 40:return 41
break;
case 41:return 11
break;
case 42:return 13
break;
case 43:return 48
break;
case 44:return 45
break;
case 45:return 46
break;
case 46:return 61
break;
case 47:return 72
break;
case 48:return 47
break;
case 49:return 12
break;
case 50:return 34
break;
case 51:return 85
break;
case 52:return 82
break;
case 53:return 10
break;
case 54:return 44
break;
case 55:return 70
break;
case 56:return 68
break;
case 57:return 78
break;
case 58:return 20
break;
case 59:return 21
break;
case 60:return 67
break;
case 61:return 22
break;
case 62:return 62
break;
case 63:return 88
break;
case 64:return 89
break;
case 65:return 69
break;
case 66:return 23
break;
case 67:return 43
break;
case 68:return 5
break;
}
},
rules: [/^(?:\s+)/,/^(?:\/\*([^*]+|(\*[^\/])+)*\*\/)/,/^(?:"(\\.|[^"])*")/,/^(?:'(\\.|[^'])*')/,/^(?:[0-9]*\.[0-9]+\b)/,/^(?:[0-9]+(\.[0-9]+)?((e|E)(\+|)?[0-9]+)?\b)/,/^(?:Infinity\b)/,/^(?:NaN\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:<=>)/,/^(?:>>=)/,/^(?:->)/,/^(?:=>)/,/^(?:\*)/,/^(?:\/)/,/^(?:\+)/,/^(?:-)/,/^(?:!#)/,/^(?:!)/,/^(?:#)/,/^(?:and\b)/,/^(?:&&)/,/^(?:or\b)/,/^(?:\|\|)/,/^(?:gt\b)/,/^(?:>)/,/^(?:lt\b)/,/^(?:<)/,/^(?:ge\b)/,/^(?:>=)/,/^(?:le\b)/,/^(?:<=)/,/^(?:eq\b)/,/^(?:===)/,/^(?:neq\b)/,/^(?:!==)/,/^(?:\?)/,/^(?::)/,/^(?:mod\b)/,/^(?:%)/,/^(?:\()/,/^(?:\))/,/^(?:\|)/,/^(?:\[)/,/^(?:\])/,/^(?:\.\.\.)/,/^(?:\.\.)/,/^(?:\.)/,/^(?:,)/,/^(?:delete\b)/,/^(?:void\b)/,/^(?:undefined\b)/,/^(?:return\b)/,/^(?:in\b)/,/^(?:@@@)/,/^(?:@\{)/,/^(?:@@)/,/^(?:@)/,/^(?:\{)/,/^(?:\$\{)/,/^(?:\})/,/^(?:\\)/,/^(?:;)/,/^(?:=)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:[_$A-Za-z\xA0-\uFFFF][_$A-Za-z0-9\xA0-\uFFFF]*)/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
return parser;
});
define('el/template',['./parser', './el_watch', 'util/util'],
function (parser, watch, util) {
'use strict';

function slice_template(template) {
	var vec = [];
	var idx = 0, length = template.length;
	while (idx < length) {
		var next = template.indexOf('{{', idx);
		if (next < 0) {
			vec.push({
				type: 'primitive',
				value: template.substring(idx, length)
			});
			break;
		} else {
			if (next > idx) {
				vec.push({
					type: 'primitive',
					value: template.substring(idx, next)
				});
			}
			var closing = template.indexOf('}}', idx);
			if (closing < 0) {
				vec.push({
					type: 'primitive',
					value: template.substring(next)
				});
				break;
			} else {
				vec.push(parser.parse(template.substring(next + 2, closing)));
				idx = closing + 2;
			}
		}
	}

	if (vec.length) {
		var compressed = [vec.shift()];
		vec.forEach(function (item) {
			if (item.type === 'primitive' && compressed[compressed.length - 1] === 'primitive') {
				compressed[compressed.length - 1].value += String(item.value);
			} else {
				compressed.push(item);
			}
		});
		return compressed;
	} else {
		return vec;
	}
}

function text_template(template_vec, scope, observe_scope, update_callback) {
	function update_content() {
		var text = '';
		for(var value of values) {
			text += value;
		}
		update_callback(text);
	}

	function unwatch() {
		for (var i = 0, end = watches.length; i < end; ++i)
			watches[i].unwatch();
	}

	if (template_vec.length === 0 ||
		template_vec.length === 1 && template_vec[0].type === 'primitive') {
		update_callback(template_vec.length === 0 ? '' : template_vec[0].value);
		// do not touch, as it is unnecessary
	} else {
		var values = Array(template_vec.length);
		var watches = Array(template_vec.length);

		template_vec.forEach(function (expression, index) {
			watches[index] = watch(expression, {
				observe_scope: observe_scope,
				scope: scope,
				handler (value) {
					values[index] = value;
					update_content();
				}
			});
		});
		return unwatch;
	}
}

return {
	slice_template: slice_template,
	text_template: text_template
};

});

define(
'el/shadow',['./parser', './el_watch', './el_eval', './template',
'util/util', 'compat/observe', 'observe/observe'],
function (parser, el_watch, el_eval, el_template, util, _proxy, observe) {
'use strict';

var VOID_EXPRESSION = parser.parse('void(0)');

var GLOBAL_EXPRESSION_CACHE = new Map;
var GLOBAL_EXPRESSION_CACHE_QUEUE = new util.adt.AVLTree({
    compareKeys(x, y) {
      return (x > y) - (x < y);
    },
    checkValueEquality(x, y) {
      return x === y;
    }
  });
var GLOBAL_EXPRESSION_CACHE_LIMIT = 1000;

function query_cache(string) {
  if (GLOBAL_EXPRESSION_CACHE.has(string)) {
    var now = util.time.getMillisecond();
    var cache = GLOBAL_EXPRESSION_CACHE.get(string);
    GLOBAL_EXPRESSION_CACHE_QUEUE.delete(cache[0], string);
    GLOBAL_EXPRESSION_CACHE_QUEUE.insert(now, string);
    cache[0] = now;
    return cache[1];
  }
}

function put_cache(string, expression) {
  var now = util.time.getMillisecond();
  var cache = [now, expression];
  GLOBAL_EXPRESSION_CACHE.set(string, expression);
  GLOBAL_EXPRESSION_CACHE_QUEUE.insert(now, string);
  while (GLOBAL_EXPRESSION_CACHE_LIMIT < GLOBAL_EXPRESSION_CACHE.size) {
    var oldest_time = GLOBAL_EXPRESSION_CACHE_QUEUE.getMinKey();
    string = GLOBAL_EXPRESSION_CACHE_QUEUE.search(oldest_time)[0];
    GLOBAL_EXPRESSION_CACHE_QUEUE.delete(oldest_time, string);
    GLOBAL_EXPRESSION_CACHE.delete(string);
  }
}

function parse(string) {
  var expression = query_cache(string);
  if (expression)
    return expression;
  try {
    if (util.traits.is_string(string)) {
      expression = parser.parse(string);
      put_cache(string, expression);
      return expression;
    } else if (util.traits.is_object(string))
      return string;
    else
      return VOID_EXPRESSION;
  } catch (e) {
    console.log("parser error", string, e);
    return VOID_EXPRESSION;
  }
}

function ShadowContext() {
  this.observe_scope = observe.ObserveScope();
  this.unwatch_set = new Set;
}
ShadowContext.prototype = {
  constructor: ShadowContext,
  register(handler) {
    this.unwatch_set.add(handler);
  },
  unregister(handler) {
    this.unwatch_set.delete(handler);
  },
  destroy() {
    for (var handler of this.unwatch_set)
      handler();
    this.unwatch_set.clear();
    this.observe_scope.destroy();
  }
};

function Shadow () {
}

function ShadowValue (context, scope, expression_string, handler) {
  this.handler = handler || util.traits.IDENTITY_FUNCTION;
  this.context = context;
  this.expression = parse(expression_string);
  this.update_handlers = new Set;
  this.watch =
    el_watch(this.expression, {
      observe_scope: context.observe_scope,
      scope: scope,
      handler: value => {
        this.value = this.handler(value);
        this.update();
      }
    });
  this.unwatch_handler = this.watch.unwatch;
  this.bind_handler = this.watch.bind_handler;
  context.register(this.unwatch_handler);
}
util.inherit(ShadowValue, Shadow, {
  update() {
    for (var handler of this.update_handlers)
      handler(this.value);
  },
  register_update(handler) {
    this.update_handlers.add(handler);
    handler(this.value);
  },
  destroy() {
    this.context.unregister(this.unwatch_handler);
    this.unwatch_handler();
  },
  invoke() {
    var args = Array.prototype.slice.call(arguments);
    if (util.traits.is_function(this.value))
      return el_eval.force(
        this.value.apply(this.watch.get_context(), args)).value;
  },
  context_invoke(context) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (util.traits.is_function(this.value))
      return el_eval.force(
        this.value.apply(context, args)).value;
  }
});

function FAIL(message) {
  throw new Exception(message);
}

function ShadowObject(map, object) {
  this.shadows = new Map;
  this.value = object || {};
  map.forEach((value, key) => {
    if (value instanceof Shadow) {
      if (this.shadows.has(key))
        FAIL('Duplicate key in shadow object');
      this.shadows.set(key, value);
      value.register_update(value => _proxy(this.value)[key] = value);
    } else
      this.value[key] = value;
  });
}
util.inherit(ShadowObject, Shadow, {
  register_update(handler) {
    handler(this.value);
  },
  get_shadow(property) {
    return this.shadows.get(property);
  },
  destroy() {
    this.shadows.forEach(shadow => shadow.destroy());
  }
});

/**
 * delegate handlers:
 * all_proxy [optional] handling 'update collection', return a collection to be presented
 * splice_proxy [optional] handling 'splice collection'
 * splice_change [optional] handling creation and destruction
 */
function ShadowArray(context, scope, expression_string, delegates, array) {
  this.context = context;
  this.delegates = delegates || {};
  this.value = array || [];
  this.update_handlers = new Set;
  this.expression = parse(expression_string);
  this.unwatch_iterate = el_watch(
    this.expression,
    {
      observe_scope: context.observe_scope,
      scope: scope,
      handler: collection => this.array_update(collection),
      splice_handler: (type, collection, index, added, removed_list) =>
        this.array_splice(type, collection, index, added, removed_list)
    }).unwatch;
  context.register(this.unwatch_iterate);
}
util.inherit(ShadowArray, Shadow, {
  *splice_change() {
    while (true) {
      var change = yield true;
      if (change)
        switch (change.operation) {
        case 'update':
        case 'create':
          yield change.value;
          break;
        case 'destroy':
          yield true;
          break;
        default:
          return;
        }
      else
        break;
    }
  },
  array_update(collection) {
    if (util.traits.is_function(this.delegates.all_proxy)) {
      var ret_array =
        this.delegates
        .all_proxy(collection, this.value);
      this.value.length = 0;
      if (util.traits.is_array(ret_array))
        this.value.push(...ret_array);
      return this.update();
    }
    var pipe = this.delegates.splice_change ?
      this.delegates.splice_change(collection, this.value) :
      this.splice_change(collection);
    pipe.next();  // start
    if (util.traits.is_array(collection)) {
      for (var i = 0, end = collection.length; i < end; ++i)
        if (i < this.value.length) {
          _proxy(this.value)[i] = pipe.next({
            operation: 'update',
            key: i,
            value: collection[i],
            target: this.value[i]
          }).value;
          pipe.next();
        } else {
          this.value.push(pipe.next({
              operation: 'create',
              key: i,
              value: collection[i]
            }).value);
          pipe.next();
        }
      for (var i = this.value.length - 1, end = collection.length - 1; i > end; --i) {
        pipe.next({
          operation: 'destroy',
          key: i,
          target: this.value[i]
        });
        pipe.next();
        this.value.pop();
      }
    } else {
      for (var i = 0, end = this.value.length; i < end; ++i) {
        pipe.next({
          operation: 'destroy',
          key: 0,
          target: this.value[i]
        });
        pipe.next();
      }
      this.value.length = 0;
      if (collection instanceof Map)
        collection.forEach((value, key) => {
          this.value.push(pipe.next({
              operation: 'create',
              key: key,
              value: value
            }).value);
          pipe.next();
        });
      else if (collection && collection[Symbol.iterator]) {
        var count = 0;
        for (var value of collection) {
          this.value.push(pipe.next({
              operation: 'create',
              key: count,
              value: value
            }).value);
          pipe.next();
          ++count;
        }
      }
    }
    pipe.next();
    this.update();
  },
  array_splice(type, collection, index, added, removed_list) {
    if (util.traits.is_function(this.delegates.splice_proxy)) {
      var ret_array =
        this.delegates
        .splice_proxy(type, collection, index, added, removed_list, this.value);
        this.value.length = 0;
      if (util.traits.is_array(ret_array))
        this.value.push(...ret_array);
      return this.update();
    } else if (type === 'splice') {
      var pipe = this.delegates.splice_change ?
        this.delegates.splice_change(collection, this.value) :
        this.splice_change(collection);
      pipe.next();  // start
      var new_values = [];
      for (var i = index + removed_list.length - 1, end = index; i >= end; --i) {
        pipe.next({
          operation: 'destroy',
          key: i,
          target: this.value[i]
        });
        pipe.next();
      }
      for (var i = index, end = index + added; i < end; ++i) {
        new_values.push(pipe.next({
            operation: 'create',
            key: i,
            value: collection[i]
          }).value);
        pipe.next();
      }
      this.value.splice(index, removed_list.length, ...new_values);
      pipe.next();
      this.update();
    } else if (Number.isSafeInteger(Number(index))) {
      index = Number(index);
      var pipe = this.delegates.splice_change ?
        this.delegates.splice_change(collection, this.value) :
        this.splice_change(collection);
      pipe.next();
      if (index < this.value.length) {
        this.value[index] = pipe.next({
            operation: 'update',
            key: index,
            value: collection[index],
            target: this.value[index]
          }).value;
        pipe.next();
      } else {
        this.value[index] = pipe.next({
          operation: 'create',
          key: index,
          value: collection[index]
        }).value;
        pipe.next();
      }
      pipe.next();  // terminating
      this.update();
    }
  },
  update() {
    for (var handler of this.update_handlers)
      handler(this.value);
  },
  register_update(handler) {
    this.update_handlers.add(handler);
    handler(this.value);
  },
  destroy() {
    this.array_update([]);  // purge all elements
    this.context.unregister(this.unwatch_iterate);
    this.unwatch_iterate();
  }
});

function ShadowTemplate (context, scope, raw_string, handler) {
  this.handler = handler || util.traits.IDENTITY_FUNCTION;
  this.context = context;
  this.update_handlers = new Set;
  this.template = el_template.slice_template(raw_string);
  var unwatch = this.unwatch_handler =
    el_template.text_template(
      this.template,
      scope,
      context.observe_scope,
      value => {
        this.value = this.handler(value);
        this.update();
      });
  if (unwatch)
    context.register(unwatch);
  else
    context.register(this.unwatch_handler = ()=>{});
}
util.inherit(ShadowTemplate, Shadow, {
  update() {
    for (var handler of this.update_handlers)
      handler(this.value);
  },
  register_update(handler) {
    this.update_handlers.add(handler);
    handler(this.value);
  },
  destroy() {
    this.context.unregister(this.unwatch_handler);
    this.unwatch_handler();
  }
});

function object(map, object) {
  return new ShadowObject(map, object);
}

function array(context, scope, expression_string, create, destroy) {
  return new ShadowArray(context, scope, expression_string, create, destroy);
}

function value(context, scope, expression_string, handler) {
  return new ShadowValue(context, scope, expression_string, handler);
}

function template(context, scope, raw_string, handler) {
  return new ShadowTemplate(context, scope, raw_string, handler);
}

function parse_expression(expression_string, expression_cache) {
  if (expression_cache.has(expression_string))
    return expression_cache.get(expression_string);
  else {
    var expression = parse(expression_string);
    expression_cache.set(expression_string, expression);
    return expression;
  }
}

function perform_changes(change_set, scope, expression_cache) {
  expression_cache = expression_cache || new Map;
  for (var change of change_set) {
    var value = change[1];
    if (util.traits.is_string(change[0])) {
      var expression = parse_expression(change[0], expression_cache);
      var result = el_eval.evaluate_el(expression, scope);
      if (result.traits.bindable)
        el_eval.bind_value(result.traits.bind_path, value);
    } else if (util.traits.is_array(change[0])) {
      var chain = change[0].slice();
      // in agreement with evaluater behaviour
      chain.unshift(el_eval.lookup_chain(scope, change[0]) || scope.model);
      el_eval.bind_value(chain, value);
    } else if (change[0]) {
      var record = change[0];
      var target;
      if (util.traits.is_string(record.object))
        target =
          el_eval.evaluate_el(
            parse_expression(record.object, expression_cache), scope);
      else if (util.traits.is_array(record.object)) {
        var chain = record.object;
        target = el_eval.lookup_chain(scope, chain[0]) || scope.model;
        for (var i = 0, end = chain.length; i < end; ++i)
          if (target)
            target = ptr[chain[i]];
        if (target)
          if (target.splice && record.type === 'splice')
            target.splice(record.index, record.removed, ...record.added);
          else
            _proxy(target)[record.name] = record.value;
      }
    }
  }
}

return {
  object: object,
  array: array,
  value: value,
  template: template,
  perform_changes: perform_changes,
  ShadowContext: ShadowContext
};

});

define('el/extension',['./standard', './parser', './el_eval', './scope'],
function(standard, parser, $eval, scope) {
'use strict';

standard.extend(
	'to_object',
	$eval.evaluate_el(
		parser.parse(
			`
(\\ map => @(
	o = {},
	map.forEach((\\ v, k => @(
		o[k^] = v^
		))),
	o^
));
			`
		), new scope.Scope).value);

standard.extend(
	'new',
	function (CONSTRUCTOR) {
		var args = Array.prototype.slice.call(arguments, 1);
		return new CONSTRUCTOR(...args);
	});

standard.extend(
	'object_map',
	$eval.evaluate_el(
		parser.parse(`
(\\ map => @{
	{null}
	map >>= (\\ x => @!{x^})
})
		`), new scope.Scope).value);
	
standard.extend(
	'stateful_event',
	$eval.evaluate_el(
		parser.parse(`
(\\ f, state =>
	(\\ e => (
		state = f(e, state);
	))
)
		`), new scope.Scope).value);

});
define('el/el',[
	'./el_eval', './el_watch', './parser', './el_const',
	'./scope', './shadow', './template', './standard', './extension'],
function(eval, watch, parser, CONST, scope, shadow, template, standard) {

return {
	watch: watch,
	eval: eval,
	parser: parser,
	template: template,
	CONST: CONST,
	scope: scope,
	shadow: shadow,
	standard: standard
};

});

define('module_struct',[], function(){
'use strict';

function make_module_data_key(name) {
	return Symbol('vis-module: ' + name);
}

function module(module_name, options) {

	function instance() {
		var args = [];
		for (var i = 0, end = arguments.length; i < end; ++i) {
			args.push(arguments[i]);
		}
		return new options.instance(...args);
	}

	return Object.defineProperties({
		configure: options.configure,
		instance: instance,
		bootstrap: options.bootstrap
	},
	{
		identifier: {
			value: make_module_data_key(module_name)
		}
	});
}

return module;

});
define('presenter/canvas2d/element',['el/el', 'util/util'],
function (el, util) {
'use strict';

var TRANSFORM_REGEX = /(\w+)\((((\+|-)?((\.\d+)|(\d+(\.\d+)?)))|\s)+\)/g;

function parseTransformOrigin(string) {
	if (string) {
		var a = /\((.+),(.+)\)/
			.exec(string.trim());
		if (a && a.length > 2)
			return [Number(a[1]) || 0, Number(a[2]) || 0];
	} else
		return [0,0];
}

function performTransform(context, transform) {
	if (util.traits.is_string(transform))
		(transform.match(TRANSFORM_REGEX) || [])
		.reverse()
		.forEach(
			function(transform) {
				var a = /(\w+)\((.*)\)/.exec(transform);
				var transform_type = a[1];
				a = a[2].split(/\s*,\s*/).map(Number);
				switch (transform_type) {
				case 'matrix':
					context.transform(...a);
					break;
				case 'translate':
					if (a.length < 2) a.push(a[0]);
					context.translate(...a);
					break;
				case 'scale':
					context.scale(...a);
					break;
				case 'rotate':
					if (a.length < 2)
						context.rotate(a[0]);
					else if (a.length > 2) {
						context.translate(a[1], a[2]);
						context.rotate(a[0]);
						context.translate(-a[1], -a[2]);
					}
					break;
				case 'skewX':
					context.transform(1,Math.tan(a[0]),0,1,0);
					break;
				case 'skewY':
					context.transform(1,0,0,Math.tan(a[0]),1,0);
					break;
				}
			});
}


function Drawable(attributes, context, scope, parent_settings) {
}
Drawable.prototype = {
	constructor: Drawable,
	event (event) {},
	destroy_guard() {
		if (this.destroyed)
			throw new Error;
	},
	destroy () {
		this.destroyed = true;
	},
	refresh (context) {}
};

function Line(attributes, context, scope, parent_settings) {
	Drawable.call(this, attributes, scope, parent_settings);
	this.attributes = attributes;
	this.settings = {};
	this.path = null;
	this.shadow = el.shadow.object(new Map([
		['style', el.shadow.value(context, scope, attributes.style, style => {
			this.destroy_guard();
			if (style) {
				this.fill_defaults(style);
				this.dirty_path = true;
				attributes.presenter.requestRefresh();
				return style;
			} else
				return this.make_default_style();
		})],
		['event', el.shadow.value(context, scope, attributes.event, event => {
			this.destroy_guard();
			return event;
		})],
		['transform', el.shadow.value(context, scope, attributes.transform, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || this.attributes.settings.transform;
		})],
		['transformOrigin', el.shadow.value(context, scope, attributes.transformOrigin, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || this.attributes.settings.transformOrigin;
		})]
		]), this.settings);
}
util.inherit(Line, Drawable, {
	make_default_style() {
		return {
			startX: this.attributes.settings.startX,
			startY: this.attributes.settings.startY,
			endX: this.attributes.settings.endX,
			endY: this.attributes.settings.endY,
			color: this.attributes.settings.color,
			width: this.attributes.settings.width
		};
	},
	fill_defaults(style) {
		style.startX = style.startX || this.attributes.settings.startX;
		style.startY = style.startY || this.attributes.settings.startY;
		style.endX = style.endX || this.attributes.settings.endX;
		style.endY = style.endY || this.attributes.settings.endY;
		style.color = style.color || this.attributes.settings.color;
		style.width = style.width || this.attributes.settings.width;
	},
	update_path() {
		this.path = new Path2D();
		this.path.moveTo((this.settings.style.startX || 0) + 0.5, (this.settings.style.startY || 0) + 0.5);
		this.path.lineTo((this.settings.style.endX || 0) + 0.5, (this.settings.style.endY || 0) + 0.5);
	},
	refresh(context) {
		if (this.dirty_path) {
			this.update_path();
			this.dirty_path = false;
		}
		var drawing_context = context.context;
		this.performTransform(drawing_context);
		drawing_context.strokeStyle = this.settings.style.color || '#000';
		drawing_context.lineWidth = this.settings.style.width || 1;
		drawing_context.stroke(this.path);
	},
	performTransform(context) {
		context.translate(-this.settings.transformOrigin[0] || 0, -this.settings.transformOrigin[1] || 0);
		performTransform(context, this.settings.transform);
		context.translate(this.settings.transformOrigin[0] || 0, this.settings.transformOrigin[1] || 0);
	},
	destroy() {
		Drawable.prototype.destroy.call(this);
		this.shadow.destroy();
	},
	is_in_path(x, y) {
		this.performTransform(this.attributes.presenter.context);
		return this.attributes.presenter.context.isPointInPath(this.path, x, y);
	},
	event (event) {
		if (this.is_in_path(event.offsetX, event.offsetY)) {
			return this.shadow.get_shadow('event').invoke(event);
		} else
			this.shadow.get_shadow('event').invoke(new event.constructor('mouseout',event));
	}
});
Line.interpret = function(presenter, node) {
	return {
		type: 'shape',
		presenter: presenter,
		shape: 'line',
		settings: {
			startX: Number(node.getAttribute('start-x')) || 0,
			endX: Number(node.getAttribute('end-x')) || 0,
			startY: Number(node.getAttribute('start-y')) || 0,
			endY: Number(node.getAttribute('end-y')) || 0,
			color: node.getAttribute('color') || '#000000',
			width: node.getAttribute('width') || 1,
			transform: node.getAttribute('transform'),
			transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin'))
		},
		style: node.dataset['bindStyle'] && el.parser.parse(node.dataset['bindStyle']),
		event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
		transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
		transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
	};
};

function Rect(attributes, context, scope, parent_settings) {
	Drawable.call(this, attributes, scope, parent_settings);
	this.attributes = attributes;
	this.settings = {
		style: this.make_default_style()
	};
	this.update_path();
	this.shadow = el.shadow.object(new Map([
		['style', el.shadow.value(context, scope, attributes.style, style => {
			this.destroy_guard();
			this.dirty_path = true;
			attributes.presenter.requestRefresh();
			return style || this.make_default_style();
		})],
		['event', el.shadow.value(context, scope, attributes.style, event => {
			this.destroy_guard();
			return event;
		})],
		['transform', el.shadow.value(context, scope, attributes.transform, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value;
		})],
		['transformOrigin', el.shadow.value(context, scope, attributes.transformOrigin, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || this.attributes.settings.transformOrigin;
		})]
		]), this.settings);
}
util.inherit(Rect, Drawable, {
	make_default_style() {
		return {
			x: this.attributes.settings.x,
			y: this.attributes.settings.y,
			width: this.attributes.settings.width,
			height: this.attributes.settings.height,
			color: this.attributes.settings.color,
			fillColor: this.attributes.settings.fillColor,
			border: this.attributes.settings.border
		};
	},
	update_path() {
		var x = (this.settings.style.x || this.attributes.settings.x) + 0.5,
			y = (this.settings.style.y || this.attributes.settings.y) + 0.5,
			width = this.settings.style.width || this.attributes.settings.width,
			height = this.settings.style.height || this.attributes.settings.height;
		this.path = new Path2D();
		this.path.rect(x, y, width, height);
	},
	refresh(context) {
		if (this.dirty_path) {
			this.update_path();
			this.dirty_path = false;
		}
		var drawing_context = context.context;
		this.performTransform(drawing_context);
		if (this.settings.style.color) {
			drawing_context.strokeStyle = this.settings.style.color;
			drawing_context.lineWidth = this.settings.style.width || 1;
			drawing_context.stroke(this.path);
		}
		if (this.settings.style.fillColor) {
			drawing_context.fillStyle = this.settings.style.fillColor;
			drawing_context.fill(this.path);
		}
	},
	performTransform(context) {
		context.translate(-this.settings.transformOrigin[0] || 0, -this.settings.transformOrigin[1] || 0);
		performTransform(context, this.settings.transform);
		context.translate(this.settings.transformOrigin[0] || 0, this.settings.transformOrigin[1] || 0);
	},
	is_in_path(x, y) {
		this.performTransform(this.attributes.presenter.context);
		return this.attributes.presenter.context.isPointInPath(this.path, x, y);
	},
	event (event) {
		if (this.is_in_path(event.offsetX, event.offsetY))
			return this.shadow.get_shadow('event').invoke(event);
		else
			this.shadow.get_shadow('event').invoke(new event.constructor('mouseout', event));
	},
	destroy() {
		Drawable.prototype.destroy.call(this);
		this.shadow.destroy();
	}
});
Rect.interpret = function (presenter, node) {
	return {
		type: 'shape',
		presenter: presenter,
		shape: 'rect',
		settings: {
			x: Number(node.getAttribute('x')) || 0,
			y: Number(node.getAttribute('y')) || 0,
			width: Number(node.getAttribute('width')) || 0,
			height: Number(node.getAttribute('height')) || 0,
			color: node.getAttribute('color'),
			fillColor: node.getAttribute('fillColor'),
			border: Number(node.getAttribute('border')) || 0,
			transform: node.getAttribute('transform'),
			transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin'))
		},
		style: node.dataset['bindStyle'] && el.parser.parse(node.dataset['bindStyle']),
		event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
		transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
		transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
	};
};

function Circle(attributes, context, scope, parent_settings) {
	Drawable.call(this, attributes, scope, parent_settings);
	this.attributes = attributes;
	this.settings = {
		style: this.make_default_style()
	};
	this.update_path();
	this.shadow = el.shadow.object(new Map([
		['style', el.shadow.value(context, scope, attributes.style, style => {
			this.destroy_guard();
			if (style) {
				this.fill_defaults(style);
				this.dirty_path = true;
				attributes.presenter.requestRefresh();
				return style;
			} else {
				attributes.presenter.requestRefresh();
				return this.make_default_style();
			}
		})],
		['event', el.shadow.value(context, scope, attributes.event, event => {
			this.destroy_guard();
			if (util.traits.is_function(event))
				this.event_handler = event;
			return event;
		})],
		['transform', el.shadow.value(context, scope, attributes.transform, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || this.attributes.settings.transform;
		})],
		['transformOrigin', el.shadow.value(context, scope, attributes.transformOrigin, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || this.attributes.settings.transformOrigin;
		})]
		]), this.settings);
}
util.inherit(Circle, Drawable, {
	fill_defaults(style) {
		style.x = style.x || this.attributes.settings.x;
		style.y = style.y || this.attributes.settings.y;
		style.radius = style.radius || this.attributes.settings.radius;
		style.color = style.color || this.attributes.settings.color;
		style.fillColor = style.fillColor || this.attributes.settings.fillColor;
		style.border = style.border || this.attributes.settings.border;
	},
	make_default_style() {
		return {
			x: this.attributes.settings.x,
			y: this.attributes.settings.y,
			radius: this.attributes.settings.radius,
			color: this.attributes.settings.color,
			fillColor: this.attributes.settings.fillColor,
			border: this.attributes.settings.border
		};
	},
	update_path() {
		var radius = this.settings.style.radius;
		var startX = this.settings.style.x + radius;
		this.path = new Path2D(
			'M' + startX + ' ' + this.settings.style.y +
			'a' + this.settings.style.radius + ' ' + this.settings.style.radius +
				' 0 0 0 ' + -2 * radius + ' 0' +
			/* 0 x rotation, 0 large arc, 0 clockwise sweep, dx=-radius, dy=0 */
			'a' + this.settings.style.radius + ' ' + this.settings.style.radius +
				' 0 0 0 ' + 2 * radius + ' 0' +
			'Z'
		);
		this.attributes.presenter.requestRefresh();
	},
	refresh(context) {
		if (this.dirty_path) {
			this.update_path();
			this.dirty_path = false;
		}
		var drawing_context = context.context;
		this.performTransform(drawing_context);
		if (this.settings.style.color) {
			drawing_context.strokeStyle = this.settings.style.color;
			drawing_context.lineWidth = this.settings.style.width || 1;
			drawing_context.stroke(this.path);
		}
		if (this.settings.style.fillColor) {
			drawing_context.fillStyle = this.settings.style.fillColor;
			drawing_context.fill(this.path);
		}
	},
	performTransform(context) {
		context.translate(-this.settings.transformOrigin[0] || 0, -this.settings.transformOrigin[1] || 0);
		performTransform(context, this.settings.transform);
		context.translate(this.settings.transformOrigin[0] || 0, this.settings.transformOrigin[1] || 0);
	},
	is_in_path(x, y) {
		this.performTransform(this.attributes.presenter.context);
		return this.attributes.presenter.context.isPointInPath(this.path, x, y);
	},
	event (event) {
		if (this.is_in_path(event.offsetX, event.offsetY))
			return this.shadow.get_shadow('event').invoke(event);
		else
			this.shadow.get_shadow('event').invoke(new event.constructor('mouseout', event));
	},
	destroy() {
		Drawable.prototype.destroy.call(this);
		this.shadow.destroy();
	}
});
Circle.interpret = function (presenter, node) {
	return {
		type: 'shape',
		presenter: presenter,
		shape: 'circle',
		settings: {
			x: Number(node.getAttribute('x')) || 0,
			y: Number(node.getAttribute('y')) || 0,
			radius: Number(node.getAttribute('radius')) || 0,
			color: node.getAttribute('color') || '#000',
			fillColor: node.getAttribute('fill-color'),
			border: Number(node.getAttribute('border')),
			transform: node.getAttribute('transform'),
			transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin'))
		},
		style: node.dataset['bindStyle'] && el.parser.parse(node.dataset['bindStyle']),
		event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
		transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
		transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
	};
};

function Curve(attributes, context, scope, parent_settings) {
	Drawable.call(this, attributes, scope, parent_settings);
	this.settings = {
		path: attributes.settings.path,
		color: attributes.settings.color,
		fillColor: attributes.settings.fillColor,
		width: attributes.settings.width
	};
	this.presenter = attributes.presenter;
	this.path = null;
	this.shadow = el.shadow.object(new Map([
		['path', el.shadow.value(context, scope, attributes.bindings.path, path => {
			path = path || attributes.settings.path || '';
			this.destroy_guard();
			this.path = new Path2D(path);
			attributes.presenter.requestRefresh();
			return path;
		})],
		['color', el.shadow.value(context, scope, attributes.bindings.color, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.color;
		})],
		['fillColor', el.shadow.value(context, scope, attributes.bindings.fillColor, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.fillColor;
		})],
		['width', el.shadow.value(context, scope, attributes.bindings.width, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.width;
		})],
		['event', el.shadow.value(context, scope, attributes.bindings.event, event => {
			this.destroy_guard();
			if (util.traits.is_function(event))
				this.event_handler = event;
			return event;
		})],
		['transform', el.shadow.value(context, scope, attributes.bindings.transform, value => {
			this.destroy_guard();
			return value || attributes.settings.transform;
		})],
		['transformOrigin', el.shadow.value(context, scope, attributes.bindings.transformOrigin, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.transformOrigin;
		})]
		]), this.settings);
}
util.inherit(Curve, Drawable, {
	refresh(context) {
		var drawing_context = context.context;
		if (this.path) {
			this.performTransform(drawing_context);
			if (this.settings.color) {
				drawing_context.strokeStyle = this.settings.color;
				drawing_context.lineWidth = this.settings.width;
				drawing_context.stroke(this.path);
			}
			if (this.settings.fillColor) {
				drawing_context.fillStyle = this.settings.fillColor;
				drawing_context.fill(this.path);
			}
		}
	},
	performTransform(context) {
		context.translate(-this.settings.transformOrigin[0] || 0, -this.settings.transformOrigin[1] || 0);
		performTransform(context, this.settings.transform);
		context.translate(this.settings.transformOrigin[0] || 0, this.settings.transformOrigin[1] || 0);
	},
	is_in_path(x, y) {
		this.performTransform(this.presenter.context);
		return this.presenter.context.isPointInPath(this.path, x, y);
	},
	event (event) {
		if (this.is_in_path(event.offsetX, event.offsetY))
			return this.shadow.get_shadow('event').invoke(event);
		else
			this.shadow.get_shadow('event').invoke(new event.constructor('mouseout', event));
	},
	destroy() {
		Drawable.prototype.destroy.call(this);
		this.shadow.destroy();
	}
});
Curve.interpret = function (presenter, node) {
	return {
		type: 'shape',
		presenter: presenter,
		shape: 'curve',
		settings: {
			path: node.getAttribute('path'),
			color: node.getAttribute('color'),
			fillColor: node.getAttribute('fill-color'),
			width: Number(node.getAttribute('width')) || 1,
			transform: node.getAttribute('transform'),
			transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin'))
		},
		bindings: {
			path: node.dataset['bindPath'] && el.parser.parse(node.dataset['bindPath']),
			color: node.dataset['bindColor'] && el.parser.parse(node.dataset['bindColor']),
			fillColor: node.dataset['bindFillColor'] && el.parser.parse(node.dataset['bindFillColor']),
			event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
			transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
			transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
		}
	};
};

function Text(attributes, context, scope, parent_settings) {
	Drawable.call(this, attributes, scope, parent_settings);
	this.attributes = attributes;
	this.settings = {
		x: attributes.settings.x,
		y: attributes.settings.y,
		size: attributes.settings.size,
		font: attributes.settings.font,
		anchor: attributes.settings.anchor
	};
	var getFontStyle = this.getFontStyle =
		() => `${this.settings.size}px ${this.settings.font}`;
	var getTextSize = () => this.settings.size;
	var getTextWidth = () => {
		var context = attributes.presenter.context;
		context.save();
		context.font = getFontStyle();
		var width = context.measureText(this.text).width;
		context.restore();
		return width;
	};
	this.model = {
		$element: {
			textSize: 0,
			textWidth: 0,
			parentSettings: parent_settings
		}
	};
	Object.defineProperty(this.model.$element, 'textSize', {get: getTextSize});
	Object.defineProperty(this.model.$element, 'textWidth', {get: getTextWidth});
	var sub_scope = new el.scope.Scope(this.model, scope);
	this.shadow = el.shadow.object(new Map([
		['size', el.shadow.value(context, scope, attributes.bindings.size, value => {
			this.destroy_guard();
			this.update_model();
			return value || attributes.settings.size;
		})],
		['font', el.shadow.value(context, scope, attributes.bindings.font, value => {
			this.destroy_guard();
			this.update_model();
			return value || attributes.settings.font;
		})],
		['x', el.shadow.value(context, sub_scope, attributes.bindings.x, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.x;
		})],
		['y', el.shadow.value(context, sub_scope, attributes.bindings.y, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.y;
		})],
		['event', el.shadow.value(context, sub_scope, attributes.bindings.event, event => {
			this.destroy_guard();
			if (util.traits.is_function(event))
				this.event_handler = event;
			return event;
		})],
		['text', el.shadow.template(context, sub_scope, attributes.settings.text, value => {
			this.destroy_guard();
			this.text = value;
			this.update_model();
			return value;
		})],
		['transform', el.shadow.value(context, sub_scope, attributes.bindings.transform, value => {
			this.destroy_guard();
			return value || attributes.settings.transform;
		})],
		['anchor', el.shadow.value(context, sub_scope, attributes.bindings.anchor, value => {
			this.destroy_guard();
			return value || attributes.settings.anchor;
		})],
		['transformOrigin', el.shadow.value(context, sub_scope, attributes.bindings.transformOrigin, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.transformOrigin;
		})]
		]), this.settings);
}
var TRANSLATE_TEXT_ALIGN = new Map([
	['middle', 'center'],
	['start', 'start'],
	['end', 'end']
]);
util.inherit(Text, Drawable, {
	update_model() {
		var notifier = Object.getNotifier(this.model.$element);
		notifier.notify({
			type: 'update',
			name: 'textSize'
		});
		notifier.notify({
			type: 'update',
			name: 'textWidth'
		});
		this.attributes.presenter.requestRefresh();
	},
	refresh(context) {
		var drawing_context = context.context;
		drawing_context.font = this.getFontStyle();
		drawing_context.textAlign = TRANSLATE_TEXT_ALIGN.get(this.settings.anchor);
		this.performTransform(drawing_context);
		drawing_context.fillText(this.text, this.settings.x, this.settings.y);
	},
	performTransform(context) {
		context.translate(-this.settings.transformOrigin[0] || 0, -this.settings.transformOrigin[1] || 0);
		performTransform(context, this.settings.transform);
		context.translate(this.settings.transformOrigin[0] || 0, this.settings.transformOrigin[1] || 0);
	},
	is_in_path(x, y) {
		var path = new Path2D;
		this.performTransform(this.attributes.presenter.context);
		path.rect(this.settings.x, this.settings.y,
			this.model.$element.textWidth, this.model.$element.textSize);
		return this.attributes.presenter.context.isPointInPath(path, x, y);
	},
	event (event) {
		if (this.is_in_path(event.offsetX, event.offsetY))
			return this.shadow.get_shadow('event').invoke(event);
		else
			this.shadow.get_shadow('event').invoke(new event.constructor('mouseout', event));
	},
	destroy() {
		Drawable.prototype.destroy.call(this);
		this.shadow.destroy();
	}
});
Text.interpret = function (presenter, node) {
	return {
		type: 'text',
		presenter: presenter,
		settings: {
			x: Number(node.getAttribute('x')) || 0,
			y: Number(node.getAttribute('y')) || 0,
			size: Number(node.getAttribute('size')) || 10,
			font: node.getAttribute('font') || 'sans-serif',
			text: node.textContent.trim(),
			transform: node.getAttribute('transform'),
			transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin')),
			anchor: node.getAttribute('anchor') || 'start'
		},
		bindings: {
			x: node.dataset['bindX'] && el.parser.parse(node.dataset['bindX']),
			y: node.dataset['bindY'] && el.parser.parse(node.dataset['bindY']),
			size: node.dataset['bindSize'] && el.parser.parse(node.dataset['bindSize']),
			font: node.dataset['bindFont'] && el.parser.parse(node.dataset['bindFont']),
			event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
			transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
			transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin']),
			anchor: node.dataset['bindAnchor'] && el.parser.parse(node.dataset['bindAnchor'])
		}
	};
};

function Shape() {}
Shape.interpret = function (presenter, node) {
	switch (node.getAttribute('type')) {
	case 'line':
		return Line.interpret(presenter, node);
	case 'rect':
		return Rect.interpret(presenter, node);
	case 'circle':
		return Circle.interpret(presenter, node);
	case 'curve':
		return Curve.interpret(presenter, node);
	}
};
Shape.new_instance = function (attributes, context, scope, parent_settings) {
	switch (attributes.shape) {
	case 'line':
		return new Line(attributes, context, scope, parent_settings);
	case 'rect':
		return new Rect(attributes, context, scope, parent_settings);
	case 'circle':
		return new Circle(attributes, context, scope, parent_settings);
	case 'curve':
		return new Curve(attributes, context, scope, parent_settings);
	}
};

return Object.freeze({
	Drawable: Drawable,
	Shape: Shape,
	Text: Text,
	performTransform: performTransform,
	parseTransformOrigin: parseTransformOrigin
});
});

define('presenter/canvas2d/layout',['./element', 'el/el', 'util/util', 'compat/observe'],
function (element, el, util, _proxy) {
'use strict';

function interpret_children(children, presenter) {
	return Array.from(children)
		.map(function (node) {
			return interpret_template(presenter, node);
		});
}

function Root(attributes, scope) {
	element.Drawable.call(this, attributes, scope);
	this.presenter = attributes.presenter;
	this.settings = {
		x: 0,
		y: 0,
		width: attributes.presenter.canvas.width,
		height: attributes.presenter.canvas.height
	};
	this.children = [];
	this.context = new el.shadow.ShadowContext;
	this.root_scope = new el.scope.Scope({
		$canvas: {
			width: this.settings.width,
			height: this.settings.height
		}
	}, scope);
	for (var i = 0, end = attributes.children.length; i < end; ++i)
		this.children.push(
			make_layout(
				attributes.children[i],
				this.context,
				this.root_scope,
				this.settings));
}
util.inherit(Root, element.Drawable, {
	setSize(width, height) {
		_proxy(this.settings).width = _proxy(this.root_scope.model.$canvas).width = width;
		_proxy(this.settings).height = _proxy(this.root_scope.model.$canvas).height = height;
	},
	refresh(context) {
		var drawing_context = context.context;
		drawing_context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		for (var i = 0, end = this.children.length; i < end; ++i) {
			drawing_context.save();
			this.children[i].refresh(context);
			drawing_context.restore();
		}
	},
	destroy() {
		for (var i = 0, end = this.children.length; i < end; ++i)
			this.children[i].destroy();
		this.context.destroy();
		element.Drawable.prototype.destroy.call(this);
	},
	test_event(layout, event) {
		this.presenter.context.save();
		var result = layout.event(event);
		this.presenter.context.restore();
		return result;
	},
	event(event) {
		var result = this.children.some(layout => this.test_event(layout, event));
	}
});
Root.interpret = function (presenter, node) {
	return {
		type: 'root',
		presenter: presenter,
		children: interpret_children(node.content.children, presenter)
	};
};

function RelativeLayout(attributes, context, scope, parent_settings) {
	element.Drawable.call(this, attributes, scope, parent_settings);
	this.presenter = attributes.presenter;
	this.settings = {
		x: attributes.settings.x,
		y: attributes.settings.y,
		width: attributes.settings.width,
		height: attributes.settings.height,
		border: attributes.settings.border,
		rotation: attributes.settings.rotation,
		clip: attributes.settings.clip,
        transform: attributes.settings.transform,
		parentSettings: parent_settings
	};
	this.model = {
		$element: {
			settings: this.settings
		}
	};
	var layout_scope = new el.scope.Scope(this.model, scope);
	this.settings_shadow = el.shadow.object(new Map([
		['x', el.shadow.value(context, layout_scope, attributes.bindings.x, value => {
			this.destroy_guard();
			this.clip_dirty = true;
			attributes.presenter.requestRefresh();
			return Number(value) || attributes.settings.x || 0;
		})],
		['y', el.shadow.value(context, layout_scope, attributes.bindings.y, value => {
			this.destroy_guard();
			this.clip_dirty = true;
			attributes.presenter.requestRefresh();
			return Number(value) || attributes.settings.y || 0;
		})],
		['width', el.shadow.value(context, layout_scope, attributes.bindings.width, value => {
			this.destroy_guard();
			this.clip_dirty = true;
			attributes.presenter.requestRefresh();
			return Number(value) || attributes.settings.width || 0;
		})],
		['height', el.shadow.value(context, layout_scope, attributes.bindings.height, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return Number(value) || attributes.settings.height || 0;
		})],
		['rotation', el.shadow.value(context, layout_scope, attributes.bindings.rotation, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return Number(value) || attributes.settings.rotation || 0;
		})],
		['clip', el.shadow.value(context, layout_scope, attributes.bindings.clip, value => {
			this.destroy_guard();
			this.clip_dirty = true;
			this.path = new Path2D(value);
			attributes.presenter.requestRefresh();
			return !!value;
		})],
		['event', el.shadow.value(context, layout_scope, attributes.bindings.event, value => {
			this.destroy_guard();
			return value;
		})],
		['init', el.shadow.value(context, layout_scope, attributes.bindings.init, value => {
			this.destroy_guard();
			return util.traits.is_function(value) ? value : util.traits.EMPTY_FUNCTION;
		})],
		['transform', el.shadow.value(context, layout_scope, attributes.bindings.transform, value => {
			this.destroy_guard();
			return value || attributes.settings.transform;
		})],
		['transformOrigin', el.shadow.value(context, layout_scope, attributes.bindings.transformOrigin, value => {
			return value || attributes.settings.transformOrigin;
		})]
	]), this.settings);
	// invoke init function only once
	this.settings_shadow.get_shadow('init').invoke(this.settings);
	this.children = [];
	for (var i = 0, end = attributes.template.length; i < end; ++i)
		this.children.push(
			make_layout(
				attributes.template[i], context, layout_scope, this.settings));
}
util.inherit(RelativeLayout, element.Drawable, {
	update_clip() {
		if (this.settings.clip) {return ;}
		this.path = new Path2D;
		this.path.rect(
			this.settings.x,
			this.settings.y,
			this.settings.width,
			this.settings.height);
	},
	refresh(context) {
		if (this.clip_dirty) {
			this.update_clip();
			this.clip_dirty = false;
		}
		var drawing_context = context.context;
		drawing_context.translate(this.settings.x, this.settings.y);
		drawing_context.rotate(this.settings.rotation);
		this.performTransform(drawing_context);
		this.settings.clip &&
			drawing_context.clip(this.path);
		for (var i = 0, end = this.children.length; i < end; ++i) {
			drawing_context.save();
			this.children[i].refresh(context);
			drawing_context.restore();
		}
	},
	performTransform(context) {
		context.translate(-this.settings.transformOrigin[0] || 0, -this.settings.transformOrigin[1] || 0);
		element.performTransform(context, this.settings.transform);
		context.translate(this.settings.transformOrigin[0] || 0, this.settings.transformOrigin[1] || 0);
	},
	is_in_clip_path(x, y) {
		if (this.settings.clip) {
			this.presenter.context.clip(this.path);
			return this.presenter.context.isPointInPath(this.path, x, y);
		} else {
			return true;	// allow overflow
		}
	},
	test_event(layout, event) {
		var drawing_context = this.presenter.context;
		drawing_context.save();
		var result = layout.event(event);
		drawing_context.restore();
		return result;
	},
	event(event) {
		var result;
		var drawing_context = this.presenter.context;
		drawing_context.save();
		drawing_context.translate(this.settings.x, this.settings.y);
		drawing_context.rotate(this.settings.rotation);
		this.performTransform(drawing_context);
		if (this.is_in_clip_path(event.offsetX, event.offsetY)) {
			this.children.forEach(layout => this.test_event(layout, event));
			result = this.settings_shadow.get_shadow('event').invoke(event);
		}
		drawing_context.restore();
		return result;
	},
	destroy() {
		for (var i = 0, end = this.children.length; i < end; ++i)
			this.children[i].destroy();
		this.settings_shadow.destroy();
		element.Drawable.prototype.destroy.call(this);
	}
});
RelativeLayout.interpret = function (presenter, node) {
	return {
		type: 'relative-layout',
		presenter: presenter,
		settings: {
			x: Number(node.getAttribute('x')) || 0,
			y: Number(node.getAttribute('y')) || 0,
			width: Number(node.getAttribute('width'))|| Infinity,
			height: Number(node.getAttribute('height')) || Infinity,
			rotation: Number(node.getAttribute('rotation')) || 0,
			border: Number(node.getAttribute('border')) || 0,
			clip: node.hasAttribute('clip'),
			transform: node.getAttribute('transform'),
			transformOrigin: element.parseTransformOrigin(node.getAttribute('transform-origin'))
		},
		bindings: {
			x: node.dataset['bindX'] && el.parser.parse(node.dataset['bindX']),
			y: node.dataset['bindY'] && el.parser.parse(node.dataset['bindY']),
			width: node.dataset['bindWidth'] && el.parser.parse(node.dataset['bindWidth']),
			height: node.dataset['bindHeight'] && el.parser.parse(node.dataset['bindHeight']),
			rotation: node.dataset['bindRotation'] && el.parser.parse(node.dataset['bindRotation']),
			init: node.dataset['bindInit'] && el.parser.parse(node.dataset['bindInit']),
			clip: node.dataset['bindClip'] && el.parser.parse(node.dataset['bindClip']),
			event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
			transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
			transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
		},
		template: interpret_children(node.children, presenter)
	};
};

function IterativeTemplate(attributes, context, scope, parent_settings) {
	element.Drawable.call(this, attributes, scope, parent_settings);
	var self = this;
	this.attributes = attributes;
	this.scope = scope;
	this.context = context;
	this.parent_settings = parent_settings;
	this.children = [];
	this.shadow = el.shadow.array(
		context, scope, attributes.iterator,
		{
			*splice_change(collection) {
				yield* self.update_splice(collection);
			}
		}, this.children);
}
util.inherit(IterativeTemplate, element.Drawable, {
	make_item(element, index, collection) {
		var model = {};
		model[this.attributes.iterator.element] = element;
		if (this.attributes.iterator.index)
			model[this.attributes.iterator.index] = index;
		if (this.attributes.iterator.reference)
			model[this.attributes.iterator.reference] = collection;
		var sub_scope = new el.scope.Scope(model, this.scope);
		return {
			sub_scope: sub_scope,
			children: this.attributes.template.map(
				attributes =>
					make_layout(attributes, this.context, sub_scope, this.parent_settings))
		};
	},
	*update_splice(collection) {
		this.destroy_guard();
		while (true) {
			var change = yield true;
			if (change)
				switch (change.operation) {
				case 'create':
					yield this.make_item(change.value, change.key, collection);
					break;
				case 'destroy':
					this.destroy_item(change.target);
					yield true;
					break;
				case 'update':
					_proxy(change.target.sub_scope.model)
						[this.attributes.iterator.element] =
							change.value;
					if (this.attributes.iterator.index)
						_proxy(change.target.sub_scope.model)
							[this.attributes.iterator.index] =
								change.key;
					if (this.attributes.iterator.reference)
						_proxy(change.target.sub_scope.model)
							[this.attributes.iterator.reference] =
								collection;
					yield change.target;
					break;
				}
			else
				break;
		}
		this.attributes.presenter.requestRefresh();
	},
	refresh(context) {
		var drawing_context = context.context;
		for (var i = 0, endi = this.children.length; i < endi; ++i)
			for (var j = 0, endj = this.children[i].children.length; j < endj; ++j) {
				drawing_context.save();
				this.children[i].children[j].refresh(context);
				drawing_context.restore();
			}
	},
	event (event) {
		return this.children.some(
			item =>
				item.children.some(layout => layout.event(event)));
	},
	destroy_item (item) {
		item.children.forEach(child => child.destroy());
	},
	destroy() {
		this.shadow.destroy();
        this.children.forEach(item => this.destroy_item(item));
		element.Drawable.prototype.destroy.call(this);
	}
});
IterativeTemplate.interpret = function (presenter, node) {
	return {
		type: 'iterate',
		presenter: presenter,
		iterator: el.parser.parse(node.dataset['iterate']),
		template: interpret_children(node.content.children, presenter)
	};
};

function ConditionalTemplate(attributes, context, scope, parent_settings) {
	element.Drawable.call(this, attributes, scope, parent_settings);
	this.children = null;
	this.condition_shadow = el.shadow.value(
		context, scope, attributes.condition, 
		condition => {
			this.destroy_guard();
			if (condition && !this.children) {
				this.children = [];
				for (var i = 0, end = attributes.template.length; i < end; ++i)
					this.children.push(
						make_layout(
							attributes.template[i], context, scope, parent_settings));
			} else if (!condition && this.children) {
				for (var i = 0, end = this.children.length; i < end; ++i)
					this.children[i].destroy();
				this.children = null;
			}
		});
}
util.inherit(ConditionalTemplate, element.Drawable, {
	refresh(context) {
		if (this.children) {
			for (var i = 0, end = this.children.length; i < end; ++i)
				this.children[i].refresh(context);
		}
	},
	event (event) {
		return this.children && this.children.some(layout => layout.event(event));
	},
	destroy() {
		if (this.children)
			for (var i = 0, end = this.children.length; i < end; ++i)
				this.children[i].destroy();
		this.condition_shadow.destroy();
		element.Drawable.prototype.destroy.call(this);
	}
});
ConditionalTemplate.interpret = function(presenter, node) {
	return {
		type: 'condition',
		presenter: presenter,
		condition: el.parser.parse(node.dataset['condition']),
		template: interpret_children(node.content.children, presenter)
	}
};

function InjectiveTemplate(attributes, context, scope, parent_settings) {
	element.Drawable.call(this, attributes, scope, parent_settings);
    this.presenter = attributes.presenter;
	this.children = [];
    this.dirty = true;
	this.argument_shadow = el.shadow.value(context, scope, attributes.argument,
		argument => {
        this.dirty = true;
			util.async.async(() => this.inject(attributes, context, scope, parent_settings));
			return argument;
		});
	this.inject_shadow = el.shadow.value(context, scope, attributes.injection,
		template => {
        this.dirty = true;
			util.async.async(() => this.inject(attributes, context, scope, parent_settings));
			return template;
		});
}
util.inherit(InjectiveTemplate, element.Drawable, {
	inject(attributes, context, scope, parent_settings) {
		if (this.destroyed || !this.dirty)
			return;
        this.dirty = false;
		var template = this.inject_shadow.value;
		var argument = this.argument_shadow.value;
		this.destroy_guard();
		this.destroy_children();
		this.children.length = 0;
		if (template && template.element) {
			var sub_scope = new el.scope.Scope(
				argument || {},
				template.scope || scope);
			var sub_attributes = template.template ||
				interpret_children(
					template.element.content.children,
					attributes.presenter);
			for (var i = 0, end = sub_attributes.length; i < end; ++i)
				this.children.push(
					make_layout(
						sub_attributes[i], context, sub_scope, parent_settings));
		}
	},
	event (event) {
		return this.children.some(layout => layout.event(event));
	},
	destroy_children() {
		if (this.children)
			for (var i = 0, end = this.children.length; i < end; ++i)
				this.children[i].destroy();
	},
	destroy() {
		this.destroy_children();
		this.inject_shadow.destroy();
		this.argument_shadow.destroy();
		element.Drawable.prototype.destroy.call(this);
	},
	refresh(context) {
		var drawing_context = context.context;
		if (this.children)
			for (var i = 0, end = this.children.length; i < end; ++i) {
				drawing_context.save();
				this.children[i].refresh(context);
				drawing_context.restore();
			}
	}
});
InjectiveTemplate.interpret = function (presenter, node) {
	return {
		type: 'inject',
		presenter: presenter,
		injection: el.parser.parse(node.dataset['inject']),
		argument: node.dataset['argument'] && el.parser.parse(node.dataset['argument'])
	}
};

function ModelingTemplate(attributes, context, scope, parent_settings) {
	element.Drawable.call(this, attributes, scope, parent_settings);
	this.children = [];
	this.model = null;
	var sub_scope = null;
	var enabled = false;
	this.shadow = el.shadow.value(context, scope, attributes.model,
		model => {
			this.destroy_guard();
			if (util.traits.is_object(model)) {
				if (this.model) {
					Object.assign(_proxy(this.model), model);
					for (var key of Object.getOwnPropertyNames(this.model))
						if (!(key in model))
							delete _proxy(this.model)[key];
				} else {
					this.model = Object.assign({}, model);
					sub_scope = new el.scope.Scope(this.model, scope);
					this.children.length = 0;
					for (var i = 0, end = attributes.template.length; i < end; ++i)
						this.children.push(
							make_layout(
								attributes.template[i], context, sub_scope, parent_settings));
				}
			} else {
				if (this.model)
					this.destroy_all_children();
				this.model = null;
			}
		});
}
util.inherit(ModelingTemplate, element.Drawable, {
	refresh(context) {
		var drawing_context = context.context;
		if (this.children)
			for (var i = 0, end = this.children.length; i < end; ++i) {
				drawing_context.save();
				this.children[i].refresh(context);
				drawing_context.restore();
			}
	},
	event (event) {
		return this.children.some(layout => layout.event(event));
	},
	destroy_all_children() {
		if (this.children) {
			for (var i = 0, end = this.children.length; i < end; ++i)
				this.children[i].destroy();
		}
		this.children.length = 0;
	},
	destroy() {
		this.destroy_all_children();
		this.shadow.destroy();
		element.Drawable.prototype.destroy.call(this);
	}
});
ModelingTemplate.interpret = function (presenter, node) {
	return {
		type: 'model',
		presenter: presenter,
		model: el.parser.parse(node.dataset['model']),
		template: interpret_children(node.content.children, presenter)
	}
};

function Template (attributes, context, scope, parent_settings) {
	this.bind_shadow = el.shadow.value(context, scope, attributes.bind);
	this.bind_shadow.bind_handler({
		element: attributes.element,
		template: attributes.template,
		scope: scope
	});
}
util.inherit(Template, element.Drawable, {
	destroy() {
		this.bind_shadow.destroy();
		element.Drawable.prototype.destroy.call(this);
	}
});

Template.interpret = function (presenter, node) {
	if (node.dataset['condition']) {
		return ConditionalTemplate.interpret(presenter, node);
	} else if (node.dataset['model']) {
		return ModelingTemplate.interpret(presenter, node);
	} else if (node.dataset['iterate']) {
		return IterativeTemplate.interpret(presenter, node);
	} else if (node.dataset['inject']) {
		return InjectiveTemplate.interpret(presenter, node);
	} else
		// generic template
		return {
			type: 'template',
			presenter: presenter,
			element: node,
			bind: node.dataset['bind'] && el.parser.parse(node.dataset['bind']),
			template: interpret_children(node.content.children, presenter)
		};
};

function DrawBox(attributes, context, scope, parent_settings) {
	element.Drawable.call(this, attributes, scope, parent_settings);
	this.attributes = attributes;
	this.settings = {
		x: attributes.settings.x,
		y: attributes.settings.y,
		parentSettings: parent_settings
	};
	this.model = {
		$element: {
			settings: this.settings
		}
	};
	var layout_scope = new el.scope.Scope(this.model, scope);
	this.shadow = el.shadow.object(new Map([
		['x', el.shadow.value(context, scope, attributes.bindings.x, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.x;
		})],
		['y', el.shadow.value(context, scope, attributes.bindings.y, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			return value || attributes.settings.y;
		})],
		['painter', el.shadow.value(context, scope, attributes.bindings.painter, value => {
			this.destroy_guard();
			attributes.presenter.requestRefresh();
			this.painter = value;
			return value;
		})],
		['event', el.shadow.value(context, scope, attributes.bindings.painter, value => {
			this.destroy_guard();
			return value;
		})],
		['transform', el.shadow.value(context, scope, attributes.bindings.transform, value => {
			this.destroy_guard();
			return value;
		})]
		]), this.settings);
	this.children = attributes.template.map(template =>
		make_layout(template, context, ayout_scope, this.settings));
}
util.inherit(DrawBox, element.Drawable, {
	refresh(context) {
		context.context.translate(this.settings.x, this.settings.y);
		this.performTransform(context.context);
		if (util.traits.is_function(this.painter)) {
			var safe_delegate = context.getSafeDelegate();
			this.painter(safe_delegate, () => this.refresh_elements(context));
			safe_delegate.reset();
		} else
			this.refresh_elements(context);
	},
	performTransform(context) {
		context.translate(-this.settings.transformOrigin[0] || 0, -this.settings.transformOrigin[1] || 0);
		element.performTransform(context, this.settings.transform);
		context.translate(this.settings.transformOrigin[0] || 0, this.settings.transformOrigin[1] || 0);
	},
	refresh_elements(context) {
		this.children.forEach(layout => layout.refresh(context));
	},
	event(event) {
		var drawing_context = this.attributes.presenter.context;
		drawing_context.save();
		drawing_context.translate(this.settings.x, this.settings.y);
		this.performTransform(drawing_context);
		var result = this.shadow.get_shadow('event').invoke(event);
		drawing_context.restore();
		return result;
	},
	destroy() {
		this.children.forEach(layout => layout.destroy());
		this.shadow.destroy();
		element.Drawable.prototype.destroy.call(this);
	}
});
DrawBox.interpret = function (presenter, node) {
	return {
		presenter: presenter,
		settings: {
			x: Number(node.getAttribute('x')) || 0,
			y: Number(node.getAttribute('y')) || 0,
			transform: node.getAttribute('transform'),
			transformOrigin: element.parseTransformOrigin(node.getAttribute('transform-origin'))
		},
		bindings: {
			x: node.dataset['bindX'] && el.parser.parse(node.dataset['bindX']),
			y: node.dataset['bindY'] && el.parser.parse(node.dataset['bindY']),
			painter: node.dataset['bindPainter'] && el.parser.parse(node.dataset['bindPainter']),
			event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
			transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
			transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
		},
		template: interpret_children(node.children, presenter)
	};
};

function make_layout(attributes, context, scope, parent_settings) {
	switch (attributes.type) {
	case 'relative-layout':
		return new RelativeLayout(attributes, context, scope, parent_settings);
	case 'iterate':
		return new IterativeTemplate(attributes, context, scope, parent_settings);
	case 'condition':
		return new ConditionalTemplate(attributes, context, scope, parent_settings);
	case 'inject':
		return new InjectiveTemplate(attributes, context, scope, parent_settings);
	case 'model':
		return new ModelingTemplate(attributes, context, scope, parent_settings);
	case 'template':
		return new Template(attributes, context, scope, parent_settings);
	case 'shape':
		return element.Shape.new_instance(attributes, context, scope, parent_settings);
	case 'text':
		return new element.Text(attributes, context, scope, parent_settings);
	}
}

function interpret_template (presenter, node) {
	switch (node.nodeName.toLowerCase()) {
	case 'relative-layout':
		return RelativeLayout.interpret(presenter, node);
	case 'template':
		return Template.interpret(presenter, node);
	case 'draw-box':
		return DrawBox.interpret(presenter, node);
	case 'shape':
		return element.Shape.interpret(presenter, node);
	case 'text':
		return element.Text.interpret(presenter, node);
	}
}

function interpret_root (presenter, node) {
	return Root.interpret(presenter, node);
}

function bind(presenter, node, model) {
	var attributes = interpret_root(presenter, node);
	return new Root(attributes, new el.scope.Scope(model, null));
}

return {
	interpret_root: interpret_root,
	interpret_template: interpret_template,
	make_layout: make_layout,
	bind: bind
};

});

define('presenter/canvas2d/grapher/bar',['module_struct', 'el/el', 'compat/observe'],
function (module, el, _proxy) {
'use strict';

function RibbonBarGraph() {
	this.animation = {
		start_time: 0,
		handler: undefined,
		post_animation: undefined,
		animating: false
	};
	this.model = {
		settings: {
			global: {
				yAxisWidth: 20,
				xAxisHeight: 20,
				iterationProportion: 0.2,
				globalAlpha: 1,
				fadeInterval: 1000
			},
			xAxis: {
				widthProportion: 0.1
			},
			yAxis: {
				value_step: 50
			}
		},
		scale: {
			max: 100,
			calculateXAxis (iteration, iterationWidth) {
				return iterationWidth * (iteration + 0.5);
			},
			make_horizontal_lines (step) {
				var max = this.max;
				function *gen() {
					var value = 0;
					while (value < max) {
						yield value;
						value += step;
					}
				}
				return gen();
			}
		},
		setGraphAreaSetting (setting) {
			this.settings.graphArea = setting;
		},
		setHint (ribbon, event) {
			if (event.type !== 'mousemove')
				return ;
			clearTimeout(this.hint_erase_handler);
			_proxy(this.hint).showing = true;
			_proxy(this.hint).x = event.offsetX;
			_proxy(this.hint).y = event.offsetY;
			_proxy(this.hint).from = ribbon.left;
			_proxy(this.hint).to = ribbon.right;
			_proxy(this.hint).amount = ribbon.change;
			this.hint_erase_handler = setTimeout(() => {
				_proxy(this.hint).showing = false;
			}, 1800);
		},
		xAxis: {
			labels: []
		},
		yAxis: {
			labels: []
		},
		bars: null,
		hint: {
			showing: false,
			x: 0,
			y: 0,
			from: null,
			to: null,
			amount: null
		}
	};
	this.loaded = false;
};
RibbonBarGraph.prototype = {
	constructor: RibbonBarGraph,
	load(data_model) {
		if (this.data_scope_shadow_context)
			this.data_scope_shadow_context.destroy();
		this.data_scope_shadow_context = new el.shadow.ShadowContext;
		this.data_model = data_model;
		var data_scope = new el.scope.Scope(data_model);
		el.shadow.array(this.data_scope_shadow_context, data_scope, 'value in values',
			{
				all_proxy: values => this.animate_update_values(values),
				splice_proxy:
				(type, values, index, added, removed) =>
					this.animate_update_values_splice(type, values, index, added, removed)
			});
		this.loaded = true;
	},
	update_max() {
		_proxy(this.model.scale).max = 0;
		_proxy(this.model.scale).iteration = this.data_model.values.length;
		for (var value of this.data_model.values) {
			var sum = 0;
			for (var object of this.data_model.objects) {
				sum += value[object];
			}
			if (this.model.scale.max < sum) {
				_proxy(this.model.scale).max = sum;
			}
		}
		_proxy(this.model.scale).max *= 1 + 0.1;
	},
	update_values() {
		this.update_max();

		var bars = _proxy(this.model).bars = [];
		var iteration = 0;
		var base_values = [];
		for (var value of this.data_model.values) {
			var prefix_sum = 0;
			var suffix_sum = 0;
			var base = {};
			for (var object of this.data_model.objects) {
				suffix_sum += value[object];
				bars.push({
					iteration: iteration,
					topValue: suffix_sum,
					bottomValue: prefix_sum,
					color: [Math.random(),Math.random(),Math.random()]
				});
				base[object] = prefix_sum;

				prefix_sum = suffix_sum;
			}
			base_values.push(base);
			++iteration;
		}
		_proxy(this.model.xAxis).labels = this.data_model.values_labels;
		this.update_ribbons(base_values);
	},
	update_ribbons(base_values) {
		var iteration = 0;
		var ribbons = _proxy(this.model).ribbons = [];
		var inflow_sum = {};	//right
		var outflow_sum = {};	//left
		for (var change of this.data_model.changes) {
			for (var object of this.data_model.objects) {
				inflow_sum[object] = outflow_sum[object] = 0;
			}
			for (var object of this.data_model.objects)
				for (var otherObject of this.data_model.objects)
					if (object !== otherObject &&
						change[object] &&
						change[object][otherObject]) {
						ribbons.push({
							left: object,
							right: otherObject,
							change: change[object][otherObject],
							color: [Math.random(),Math.random(),Math.random()],
							iterationLeft: iteration,
							topValueLeft: outflow_sum[object] + change[object][otherObject]
							+ base_values[iteration][object],
							bottomValueLeft: outflow_sum[object]
							+ base_values[iteration][object],
							iterationRight: iteration + 1,
							topValueRight: inflow_sum[otherObject] + change[object][otherObject]
							+ base_values[iteration + 1][otherObject],
							bottomValueRight: inflow_sum[otherObject]
							+ base_values[iteration + 1][otherObject]
						});
						inflow_sum[otherObject] += change[object][otherObject];
						outflow_sum[object] += change[object][otherObject];
					}
			++iteration;
		}
	},
	fade_out(start_time, time) {
		var fade_time = this.model.settings.global.fadeInterval;
		if (time < start_time + fade_time) {
			_proxy(this.model.settings.global).globalAlpha =
				1 - (time - start_time) / fade_time;
			return true;
		}
	},
	start_animation() {
		this.stop_animation();
		this.start_animation_loop(
			(start_time, time) =>
				this.fade_out(start_time, time)
			,
			() => this.end_animation());
	},
	end_animation() {
		this.update_values();
		_proxy(this.model.settings.global).globalAlpha = 1;
	},
	animate_update_values() {
		if (this.loaded)
			this.start_animation();
		else
			this.end_animation();
	},
	animate_update_values_splice(type, values, index, added, removed) {
		if (type === 'splice') {
			if (this.loaded)
				this.start_animation();
			else
				this.end_animation();
		} else if (index && Number.isFinite(index)) {
			if (this.loaded)
				this.start_animation();
			else
				this.end_animation();
		}
	},
	stop_animation() {
		if (this.animation.animating) {
			cancelAnimationFrame(this.animation.handler);
			this.animation.animating = false;
			this.animation.handler = undefined;
			this.animation.post_animation();
		}
	},
	start_animation_loop(animation_effect, post_animation) {
		// fade out effect
		this.animation.animating = true;
		this.animation.start_time = performance.now();
		this.animation.post_animation = post_animation;
		var handler = time => {
			// animation settings
			if (animation_effect(this.animation.start_time, time)) {
				this.animation.handler = requestAnimationFrame(handler);
			} else {
				this.stop_animation();
			}
		};
		handler(this.animation.start_time);
	}
};

return Object.freeze({
	RibbonBarGraph:
		module('presenter.canvas2d.grapher.RibbonBarGraph', {instance: RibbonBarGraph})
});

});

define('presenter/canvas2d/grapher/grapher',['./bar'], function (bar) {
'use strict';

return {
	bar: bar
};

});
define('presenter/canvas2d/canvas2d',['module_struct', 'util/util', './layout', './grapher/grapher'],
function (module, util, layout, grapher) {
'use strict';

var SAFE_CONTEXTS = new WeakMap;
var SAFE_CONTEXT_STACK = new WeakMap;

function SafeCanvasRendering2DContext(context) {
	SAFE_CONTEXTS.set(this, context);
	SAFE_CONTEXT_STACK.set(this, 0);
}

SafeCanvasRendering2DContext.prototype = {
	constructor: SafeCanvasRendering2DContext,
	/* All properties and methods */
	get fillStyle() {return SAFE_CONTEXTS.get(this).fillStyle;},
	set fillStyle(x) {return SAFE_CONTEXTS.get(this).fillStyle = x;},
	get font() {return SAFE_CONTEXTS.get(this).font;},
	set font(x) {return SAFE_CONTEXTS.get(this).font = x;},
	get globalAlpha() {return SAFE_CONTEXTS.get(this).globalAlpha;},
	set globalAlpha(x) {return SAFE_CONTEXTS.get(this).globalAlpha = x;},
	get globalCompositeOperation() {return SAFE_CONTEXTS.get(this).globalCompositeOperation;},
	set globalCompositeOperation(x) {return SAFE_CONTEXTS.get(this).globalCompositeOperation = x;},
	get lineCap() {return SAFE_CONTEXTS.get(this).lineCap;},
	set lineCap(x) {return SAFE_CONTEXTS.get(this).lineCap = x;},
	get lineDashOffset() {return SAFE_CONTEXTS.get(this).lineDashOffset;},
	set lineDashOffset(x) {return SAFE_CONTEXTS.get(this).lineDashOffset = x;},
	get lineJoin() {return SAFE_CONTEXTS.get(this).lineJoin;},
	set lineJoin(x) {return SAFE_CONTEXTS.get(this).lineJoin = x;},
	get lineWidth() {return SAFE_CONTEXTS.get(this).lineWidth;},
	set lineWidth(x) {return SAFE_CONTEXTS.get(this).lineWidth = x;},
	get miterLimit() {return SAFE_CONTEXTS.get(this).miterLimit;},
	set miterLimit(x) {return SAFE_CONTEXTS.get(this).miterLimit = x;},
	get shadowBlur() {return SAFE_CONTEXTS.get(this).shadowBlur;},
	set shadowBlur(x) {return SAFE_CONTEXTS.get(this).shadowBlur = x;},
	get strokeStyle() {return SAFE_CONTEXTS.get(this).strokeStyle;},
	set strokeStyle(x) {return SAFE_CONTEXTS.get(this).strokeStyle = x;},
	get textAlign() {return SAFE_CONTEXTS.get(this).textAlign;},
	set textAlign(x) {return SAFE_CONTEXTS.get(this).textAlign = x;},
	get textBaseline() {return SAFE_CONTEXTS.get(this).textBaseline;},
	set textBaseline(x) {return SAFE_CONTEXTS.get(this).textBaseline = x;},
	arc(x, y, radius, startAngle, endAngle, anticlockwise) {return SAFE_CONTEXTS.get(this).arc(x, y, radius, startAngle, endAngle, anticlockwise);},
	arcTo(x1, y1, x2, y2, radius) {return SAFE_CONTEXTS.get(this).arcTo(x1, y1, x2, y2, radius);},
	beginPath() {return SAFE_CONTEXTS.get(this).beginPath();},
	bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {return SAFE_CONTEXTS.get(this).bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);},
	clearRect() {return SAFE_CONTEXTS.get(this).clearRect();},
	clip() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).clip(...args);
	},
	closePath() {return SAFE_CONTEXTS.get(this).closePath();},
	createImageData() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).createImageData(...args);
	},
	createLinearGradient(x0, y0, x1, y1) {return SAFE_CONTEXTS.get(this).createLinearGradient(x0, y0, x1, y1);},
	createPattern(image, repetition) {return SAFE_CONTEXTS.get(this).createPattern(image, repetition);},
	createRadialGradient(x0, y0, r0, x1, y1, r1) {return SAFE_CONTEXTS.get(this).createRadialGradient(x0, y0, r0, x1, y1, r1);},
	drawFocusIfNeeded() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).drawFocusIfNeeded(...args);
	},
	drawImage() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).drawImage(...args);
	},
	drawImage() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).drawImage(...args);
	},
	fill() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).fill(...args);
	},
	fillRect(x, y, width, height) {return SAFE_CONTEXTS.get(this).fillRect(x, y, width, height);},
	fillText() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).fillText(...args);
	},
	getImageData(sx, sy, sw, sh) {return SAFE_CONTEXTS.get(this).getImageData(sx, sy, sw, sh);},
	getLineDash() {return SAFE_CONTEXTS.get(this).getLineDash();},
	isPointInPath() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).isPointInPath(...args);
	},
	isPointInStroke() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).isPointInStroke(...args);
	},
	lineTo(x, y) {return SAFE_CONTEXTS.get(this).lineTo(x, y);},
	measureText(text) {return SAFE_CONTEXTS.get(this).measureText(text);},
	moveTo(x, y) {return SAFE_CONTEXTS.get(this).moveTo(x, y);},
	putImageData() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).putImageData(...args);
	},
	quadraticCurveTo(cpx, cpy, x, y) {return SAFE_CONTEXTS.get(this).quadraticCurveTo(cpx, cpy, x, y);},
	rect(x, y, width, height) {return SAFE_CONTEXTS.get(this).rect(x, y, width, height);},
	restore() {
		var stack_height = SAFE_CONTEXT_STACK.get(this);
		if (stack_height) {
			SAFE_CONTEXT_STACK.set(this, stack_height - 1);
			SAFE_CONTEXTS.get(this).restore();
		}
	},
	resetTransform() {
		var stack_height = SAFE_CONTEXT_STACK.get(this);
		for (var i = 0; i < stack_height; ++i)
			this.restore();
	},
	rotate(angle) {return SAFE_CONTEXTS.get(this).rotate(angle);},
	save() {
		var stack_height = SAFE_CONTEXT_STACK.get(this);
		SAFE_CONTEXT_STACK.set(this, stack_height + 1);
		SAFE_CONTEXTS.get(this).save();
	},
	scale(x, y) {return SAFE_CONTEXTS.get(this).scale(x, y);},
	setLineDash(segments) {return SAFE_CONTEXTS.get(this).setLineDash(segments);},
	setTransform(a, b, c, d, e, f) {return SAFE_CONTEXTS.get(this).setTransform(a, b, c, d, e, f);},
	stroke() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).stroke(...args);
	},
	strokeRect(x, y, width, height) {return SAFE_CONTEXTS.get(this).strokeRect(x, y, width, height);},
	strokeText() {
		var args = Array.prototype.slice.call(arguments);
		return SAFE_CONTEXTS.get(this).strokeText(...args);
	},
	transform(a, b, c, d, e, f) {return SAFE_CONTEXTS.get(this).transform(a, b, c, d, e, f);},
	translate(x, y) {return SAFE_CONTEXTS.get(this).translate(x, y);}
};

function Canvas2DDrawingContext_Impl(context, canvas) {
	this.context = context;
	this.canvas = canvas;
}
Canvas2DDrawingContext_Impl.prototype.updateTimestamp =
function (timestamp) {
	this.timestamp = timestamp || performance.now();
};

Canvas2DDrawingContext_Impl.prototype.getSafeDelegate =
function () {
	// TODO we are still waiting from Proxy on chrome
	if (this.safe)
		return this;
	return Object.defineProperties(
		new Canvas2DDrawingContext_Impl(new SafeCanvasRendering2DContext(this.context), null),
		{
			safe: {value: true, enumerable: true},
			reset: {value: function() {this.context.resetTransform();}, enumerable: true}
		});
};

function Canvas2DPresenter_Impl() {
	var event_handler = event => this.layout.event(event);
	this.model = {
		painter: timestamp => this.painter(timestamp),
		event: {
			$event: {
				mousedown: event_handler,
				mousemove: event_handler,
				mouseup: event_handler
			}
		}
	};
	this.dirty = false;
}
Canvas2DPresenter_Impl.prototype = {
	constructor: Canvas2DPresenter_Impl,
	bind(target, template, data_model) {
		this.canvas = target;
		this.context = target.getContext('2d');
		this.template = template;
		this.drawing_context = new Canvas2DDrawingContext_Impl(this.context, target);
		this.layout = layout.bind(this, template, data_model);
	},

	painter(timestamp) {
		this.drawing_context.updateTimestamp(timestamp);
		if (this.layout)
			this.layout.refresh(this.drawing_context);
		this.dirty = false;
	},

	resize() {
		this.layout.setSize(this.canvas.width, this.canvas.height);
		this.requestRefresh();
	},

	requestRefresh() {
		if (!this.dirty) {
			util.async.async(()=>this.painter(), 'animate');
			this.dirty = true;
		}
	},

	destroy() {
		if (this.layout)
			this.layout.destroy();
	}
};

var Canvas2DPresenter = module('presenter.canvas2d.Canvas2DPresenter', {
	dependency: [],
	instance: Canvas2DPresenter_Impl,
	configure: function () {}
});

return {
	layout: layout,
	grapher: grapher,
	Canvas2DPresenter: Canvas2DPresenter
};

});

define('presenter/svg/layout',['el/el', 'util/util', 'compat/observe'], function(el, util, _proxy) {
'use strict';
    
var COUNTER = new Uint32Array(1);
    
function get_token() {
    return COUNTER[0]++;
}

function parseTransformOrigin(string) {
	if (string) {
		var a = /\((.+),(.+)\)/
			.exec(string.trim());
		if (a && a.length > 2)
			return [Number(a[1]) || 0, Number(a[2]) || 0];
	} else
		return [0,0];
}
    
function degree_radian(degree) {
    return degree ? degree / 180 * Math.PI : 0;
}
    
function radian_degree(radian) {
    return radian ? radian / Math.PI * 180 : 0;
}

function create_element(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}
    
function Drawable() {}
Object.assign(Drawable.prototype, {
	destroy() {
		this.destroyed = true;
	},
	refresh() {},
	event() {},
    destroy_guard() {
        if (this.destroyed)
            throw new Error("resource is already destroyed");
    }
});

// root element
function Root(attributes, scope) {
	Drawable.call(this);
	this.settings = {
		x: 0,
		y: 0,
		width: attributes.presenter.canvas.width,
		height: attributes. presenter.canvas.height,
		element: attributes.presenter.canvas
	};
	this.context = new el.shadow.ShadowContext;
	this.children = [];
	this.root_scope = new el.scope.Scope({
		$canvas: {
			width: this.settings.width,
			height: this.settings.height
		}
	}, scope);
	for (var i = 0; i < attributes.children.length; ++i)
		this.children.push(
			make_layout(
				attributes.children[i],
				this.context,
				this.root_scope,
				this.settings));
}
util.inherit(Root, Drawable, {
	destroy() {
		for (var i = 0; i < this.children.length; ++i)
			this.children[i].destroy();
		Drawable.prototype.destroy.call(this);
	},
	refresh() {},
	event() {}
});
Root.interpret = function(presenter, template) {
	return {
		type: 'root',
		presenter: presenter,
		children: interpret_children(
			template.content ? template.content.children : template.children,
			presenter)
	};
};

// g element
function RelativeLayout (attributes, context, scope, parent_settings) {
	Drawable.call(this);
	this.presenter = attributes.presenter;
    this.element = create_element('g');
	this.attach_events();
	this.settings = {
		x: attributes.settings.x,
		y: attributes.settings.y,
		width: attributes.settings.width,
		height: attributes.settings.height,
        border: attributes.settings.border,
		rotation: attributes.settings.rotation,
		clip: attributes.settings.clip,
        clipPath: attributes.settings.clipPath,
        transform: attributes.settings.transform,
        element: this.element,
		parentSettings: parent_settings
	};
    parent_settings.element.appendChild(this.element);
    // apply settings now
    this.model = {
        $element: {
            settings: this.settings
        }
    };
    var layout_scope = new el.scope.Scope(this.model, scope);
    this.shadow = el.shadow.object(new Map([
        ['x', el.shadow.value(context, layout_scope, attributes.bindings.x, value => {
            this.destroy_guard();
            util.async.async(() => this.set_transform());
            return Number(value) || attributes.settings.x || 0;
        })],
        ['y', el.shadow.value(context, layout_scope, attributes.bindings.y, value => {
            this.destroy_guard();
            util.async.async(() => this.set_transform());
            return Number(value) || attributes.settings.y || 0;
        })],
        ['width', el.shadow.value(context, layout_scope, attributes.bindings.width, value => {
            this.destroy_guard();
            util.async.async(() => this.set_clip());
            return Number.isFinite(value) ? value : attributes.settings.width || Infinity;
        })],
        ['height', el.shadow.value(context, layout_scope, attributes.bindings.height, value => {
            this.destroy_guard();
            util.async.async(() => this.set_clip());
            return Number.isFinite(value) ? value : attributes.settings.height || Infinity;
        })],
        ['clip', el.shadow.value(context, layout_scope, attributes.bindings.clip, value => {
            this.destroy_guard();
            util.async.async(() => this.set_clip());
            return value;
        })],
        ['clipPath', el.shadow.value(context, layout_scope, attributes.bindings.clipPath, value => {
            this.destroy_guard();
            util.async.async(() => this.set_clip());
            return value;
        })],
        ['transform', el.shadow.value(context, layout_scope, attributes.bindings.transform, value => {
            this.destroy_guard();
            util.async.async(() => this.set_transform());
            return value || attributes.settings.transform || '';
        })],
        ['transformOrigin', el.shadow.value(context, layout_scope, attributes.bindings.transformOrigin, value => {
        	this.destroy_guard();
        	util.async.async(() => this.set_transform_origin());
        	return value || attributes.settings.transformOrigin;
        })],
        ['rotation', el.shadow.value(context, layout_scope, attributes.bindings.rotation, value => {
            this.destroy_guard();
            util.async.async(() => this.set_transform());
            return value || attributes.settings.rotation || 0;
        })],
		['event', el.shadow.value(context, layout_scope, attributes.bindings.event, event => {
			this.destroy_guard();
			return event;
		})],
		['init', el.shadow.value(context, layout_scope, attributes.bindings.init, init => {
			this.destroy_guard();
			util.async.async(() => this.init());
			return init;
		})]
    ]), this.settings);
    this.children = [];
    for (var i = 0; i < attributes.template.length; ++i)
        this.children.push(make_layout(attributes.template[i], context, layout_scope, this.settings));
}
util.inherit(RelativeLayout, Drawable, {
	init() {
		this.shadow.get_shadow('init').invoke(this.settings);
	},
	attach_events() {
		var listener =
			e => this.shadow.get_shadow('event').invoke(e);
		['mousedown', 'mouseup', 'mousemove', 'mousein', 'mouseout', 'click'].forEach(
			ev_name => this.element.addEventListener(ev_name, listener));
	},
	destroy() {
        if (this.clip_path)
            this.presenter.deregister_def(this.clip_path);
        this.shadow.destroy();
        this.element.remove();
        Drawable.prototype.destroy.call(this);
	},
    set_clip() {
        var path;
        if (this.settings.clipPath) {
            this.element.setAttribute('clip-path', 'url(#' + this.settings.clipPath + ')')
        } else if (this.settings.clip) {
            if (!this.clip_path) {
                this.clip_path = create_element('clipPath');
                this.clip_path.id = 'clip_path_' + get_token();
            }
            path = this.clip_path.querySelector('path')
            if (!path) {
                this.clip_path.innerHTML = '';
                path = create_element('path');
                this.clip_path.appendChild(path);
                this.element.setAttribute('clip-path', 'url(#' + this.clip_path.id + ')');
            }
            path.d = value;
        } else if (this.clip_path) {
            this.clip_path.innerHTML = '';
            if (Number.isFinite(this.settings.width) && Number.isFinite(this.settings.height)) {
                path = create_element('path');
                path.d =
                    `M0 0
                    v${this.settings.width}
                    h${this.settings.height}
                    v${-this.settings.width}
                    z`;
                this.clip_path.appendChild(path);
            } else {
                this.element.setAttribute('clip-path', '');
            }
        }
    },
	set_transform_origin() {
		this.element.style.transformOrigin = `${this.settings.transformOrigin[0] || 0}px ${this.settings.transformOrigin[1] || 0}px`;
	},
    set_transform() {
        this.element.setAttribute(
            'transform',
            (this.settings.transform || '') +
            ` rotate(${radian_degree(this.settings.rotation)})` +
            ` translate(${this.settings.x || 0} ${this.settings.y || 0})`);
    }
});
RelativeLayout.interpret = function (presenter, node) {
    return {
		type: 'relative-layout',
        settings: {
            x: node.getAttribute('x') || 0,
            y: node.getAttribute('y') || 0,
            width: node.getAttribute('width') || Infinity,
            height: node.getAttribute('height') || Infinity,
            border: node.getAttribute('border') || 0,
            clip: node.getAttribute('clip') || '',
            clipPath: node.getAttribute('clip-path') || '',
            transform: node.getAttribute('transform') || '',
            transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin')),
            rotation: node.getAttribute('rotation') || ''
        },
        bindings: {
            x: node.dataset['bindX'] && el.parser.parse(node.dataset['bindX']),
            y: node.dataset['bindY'] && el.parser.parse(node.dataset['bindY']),
            width: node.dataset['bindWidth'] && el.parser.parse(node.dataset['bindWidth']),
            height: node.dataset['bindHeight'] && el.parser.parse(node.dataset['bindHeight']),
            border: node.dataset['bindBorder'] && el.parser.parse(node.dataset['bindBorder']),
            clip: node.dataset['bindClip'] && el.parser.parse(node.dataset['bindClip']),
            clipPath: node.dataset['bindClipPath'] && el.parser.parse(node.dataset['bindClipPath']),
            transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
            rotation: node.dataset['bindRotation'] && el.parser.parse(node.dataset['bindRotation']),
			event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
			init: node.dataset['bindInit'] && el.parser.parse(node.dataset['bindInit']),
			transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
        },
        template: interpret_children(node.children, presenter)
    };
};
    
function IterativeTemplate(attributes, context, scope, parent_settings) {
    Drawable.call(this);
    var self = this;
    this.attributes = attributes;
	this.scope = scope;
	this.context = context;
	this.parent_settings = parent_settings;
	this.children = [];
	this.shadow = el.shadow.array(
		context, scope, attributes.iterator,
		{
			*splice_change(collection) {
				yield* self.update_splice(collection);
			}
		}, this.children);
}
util.inherit(IterativeTemplate, Drawable, {
    destroy() {
        for (var i = 0; i < this.children.length; ++i)
            for (var j = 0; i < this.children[i].length; ++j)
                this.children[i][j].destroy();
        Drawable.prototype.destroy.call(this);
    },
    make_item(element, index, collection) {
        var model = {};
        model[this.attributes.iterator.element] = element;
        if (this.attributes.iterator.index)
            model[this.attributes.iterator.index] = index;
        if (this.attributes.iterator.reference)
            model[this.attributes.iterator.reference] = collection;
        var sub_scope = new el.scope.Scope(model, this.scope);
        return {
            sub_scope: sub_scope,
            children: this.attributes.template.map(
                attributes => make_layout(attributes, this.context, sub_scope, this.parent_settings))
        };
    },
    destroy_item(item) {
        for (var i = 0; i < item.children.length; ++i)
            item.children[i].destroy();
    },
    *update_splice(collection) {
        this.destroy_guard();
        var change;
        while (true) {
            change = yield true;
            if (change)
                switch (change.operation) {
                case 'create':
                    yield this.make_item(change.value, change.key, collection);
                    break;
                case 'destroy':
                    this.destroy_item(change.target);
                    yield;
                    break;
                case 'update':
					change.target.sub_scope.model[this.attributes.iterator.element] =
						change.value;
					if (this.attributes.iterator.index)
						change.target.sub_scope.model[this.attributes.iterator.index] =
							change.key;
					if (this.attributes.iterator.reference)
						change.target.sub_scope.model[this.attributes.iterator.reference] =
							collection;
					yield change.target;
                    break;
                default:
                    return;
                }
            else
                return;
        }
    }
});  
IterativeTemplate.interpret = function (presenter, node) {
	return {
		type: 'iterate',
		presenter: presenter,
		iterator: el.parser.parse(node.dataset['iterate']),
		template: interpret_children(node.content.children, presenter)
	};
};
    
function ConditionalTemplate(attributes, context, scope, parent_settings) {
	Drawable.call(this);
	this.children = null;
	this.condition_shadow = el.shadow.value(
		context, scope, attributes.condition, 
		condition => {
			this.destroy_guard();
			if (condition && !this.children) {
				this.children = [];
				for (var i = 0, end = attributes.template.length; i < end; ++i)
					this.children.push(
						make_layout(
							attributes.template[i], context, scope, parent_settings));
			} else if (!condition && this.children) {
				for (var i = 0, end = this.children.length; i < end; ++i)
					this.children[i].destroy();
				this.children = null;
			}
		});
}
util.inherit(ConditionalTemplate, Drawable, {
	destroy() {
		if (this.children)
			for (var i = 0, end = this.children.length; i < end; ++i)
				this.children[i].destroy();
		this.condition_shadow.destroy();
		Drawable.prototype.destroy.call(this);
	}
});
ConditionalTemplate.interpret = function(presenter, node) {
	return {
		type: 'condition',
		presenter: presenter,
		condition: el.parser.parse(node.dataset['condition']),
		template: interpret_children(node.content.children, presenter)
	}
};

function InjectiveTemplate(attributes, context, scope, parent_settings) {
	Drawable.call(this);
	this.children = [];
    this.dirty = true;
	this.argument_shadow = el.shadow.value(context, scope, attributes.argument,
		argument => {
            this.dirty = true;
			util.async.async(() => this.inject(attributes, context, scope, parent_settings));
			return argument;
		});
	this.inject_shadow = el.shadow.value(context, scope, attributes.injection,
		template => {
            this.dirty = true;
			util.async.async(() => this.inject(attributes, context, scope, parent_settings));
			return template;
		});
}
util.inherit(InjectiveTemplate, Drawable, {
	inject(attributes, context, scope, parent_settings) {
		if (this.destroyed || !this.dirty)
			return;
        this.dirty = false;
		var template = this.inject_shadow.value;
		var argument = this.argument_shadow.value;
		this.destroy_guard();
		this.destroy_children();
		this.children.length = 0;
		if (template && template.element) {
			var sub_scope = new el.scope.Scope(
				argument || {},
				template.scope || scope);
			var sub_attributes = template.template ||
				interpret_children(
					template.element.content.children,
					attributes.presenter);
			for (var i = 0, end = sub_attributes.length; i < end; ++i)
				this.children.push(
					make_layout(
						sub_attributes[i], context, sub_scope, parent_settings));
		}
	},
	destroy_children() {
		if (this.children)
			for (var i = 0, end = this.children.length; i < end; ++i)
				this.children[i].destroy();
	},
	destroy() {
		this.destroy_children();
		this.inject_shadow.destroy();
		this.argument_shadow.destroy();
		Drawable.prototype.destroy.call(this);
	},
});
InjectiveTemplate.interpret = function (presenter, node) {
	return {
		type: 'inject',
		presenter: presenter,
		injection: el.parser.parse(node.dataset['inject']),
		argument: node.dataset['argument'] && el.parser.parse(node.dataset['argument'])
	}
};

function ModelingTemplate(attributes, context, scope, parent_settings) {
	Drawable.call(this);
	this.children = [];
	this.model = null;
	var sub_scope = null;
	var enabled = false;
	this.shadow = el.shadow.value(context, scope, attributes.model,
		model => {
			this.destroy_guard();
			if (util.traits.is_object(model)) {
				if (this.model) {
					Object.assign(this.model, model);
					for (var key of Object.getOwnPropertyNames(this.model))
						if (!(key in model))
							delete this.model[key];
				} else {
					this.model = Object.assign({}, model);
					sub_scope = new el.scope.Scope(this.model, scope);
					this.children.length = 0;
					for (var i = 0, end = attributes.template.length; i < end; ++i)
						this.children.push(
							make_layout(
								attributes.template[i], context, sub_scope, parent_settings));
				}
			} else {
				if (this.model)
					this.destroy_all_children();
				this.model = null;
			}
		});
}
util.inherit(ModelingTemplate, Drawable, {
	refresh(context) {
		var drawing_context = context.context;
		if (this.children)
			for (var i = 0, end = this.children.length; i < end; ++i) {
				drawing_context.save();
				this.children[i].refresh(context);
				drawing_context.restore();
			}
	},
	event (event) {
		return this.children.some(layout => layout.event(event));
	},
	destroy_all_children() {
		if (this.children) {
			for (var i = 0, end = this.children.length; i < end; ++i)
				this.children[i].destroy();
		}
		this.children.length = 0;
	},
	destroy() {
		this.destroy_all_children();
		this.shadow.destroy();
		Drawable.prototype.destroy.call(this);
	}
});
ModelingTemplate.interpret = function (presenter, node) {
	return {
		type: 'model',
		presenter: presenter,
		model: el.parser.parse(node.dataset['model']),
		template: interpret_children(node.content.children, presenter)
	}
};

function Template (attributes, context, scope, parent_settings) {
	this.bind_shadow = el.shadow.value(context, scope, attributes.bind);
	this.bind_shadow.bind_handler({
		element: attributes.element,
		template: attributes.template,
		scope: scope
	});
}
util.inherit(Template, Drawable, {
	destroy() {
		this.bind_shadow.destroy();
		Drawable.prototype.destroy.call(this);
	}
});

Template.interpret = function (presenter, node) {
	if (node.dataset['condition']) {
		return ConditionalTemplate.interpret(presenter, node);
	} else if (node.dataset['model']) {
		return ModelingTemplate.interpret(presenter, node);
	} else if (node.dataset['iterate']) {
		return IterativeTemplate.interpret(presenter, node);
	} else if (node.dataset['inject']) {
		return InjectiveTemplate.interpret(presenter, node);
	} else
		// generic template
		return {
			type: 'template',
			presenter: presenter,
			element: node,
			bind: node.dataset['bind'] && el.parser.parse(node.dataset['bind']),
			template: interpret_children(node.content.children, presenter)
		};
};
    
function Shape() {}
util.inherit(Shape, Drawable, {});
Shape.interpret = function (presenter, node) {
	switch (node.getAttribute('type')) {
	case 'line':
		return Line.interpret(presenter, node);
	case 'rect':
		return Rect.interpret(presenter, node);
	case 'circle':
		return Circle.interpret(presenter, node);
	case 'curve':
		return Curve.interpret(presenter, node);
	}
};
Shape.new_instance = function (attributes, context, scope, parent_settings) {
	switch (attributes.shape) {
	case 'line':
		return new Line(attributes, context, scope, parent_settings);
	case 'rect':
		return new Rect(attributes, context, scope, parent_settings);
	case 'circle':
		return new Circle(attributes, context, scope, parent_settings);
	case 'curve':
		return new Curve(attributes, context, scope, parent_settings);
	}
};

function Line(attributes, context, scope, parent_settings) {
	Drawable.call(this, attributes, scope, parent_settings);
	this.attributes = attributes;
	this.settings = {};
	this.path = null;
    this.element = create_element('line');
	this.attach_events();
    parent_settings.element.appendChild(this.element);
	this.shadow = el.shadow.object(new Map([
		['style', el.shadow.value(context, scope, attributes.style, style => {
			this.destroy_guard();
            util.async.async(() => this.assign_style(), 'animate');
			if (style) {
				this.fill_defaults(style);
				this.dirty_path = true;
				return style;
			} else
				return this.make_default_style();
		})],
		['event', el.shadow.value(context, scope, attributes.event, event => {
			this.destroy_guard();
			return event;
		})],
		['transformOrigin', el.shadow.value(context, scope, attributes.transformOrigin, value => {
			this.destroy_guard();
			util.async.async(() => this.set_transform_origin());
			return value || attributes.settings.transformOrigin;
		})],
		['transform', el.shadow.value(context, scope, attributes.transform, value => {
			this.destroy_guard();
            util.async.async(() => this.set_transform(), 'animate');
			return value || this.attributes.settings.transform;
		})]
		]), this.settings);
}
util.inherit(Line, Drawable, {
	attach_events() {
		var listener =
			e => this.shadow.get_shadow('event').invoke(e);
		['mousedown', 'mouseup', 'mousemove', 'mousein', 'mouseout', 'click'].forEach(
			ev_name => this.element.addEventListener(ev_name, listener));
	},
    assign_style() {
        this.element.setAttribute('x1', this.settings.style.startX || 0);
        this.element.setAttribute('y1', this.settings.style.startY || 0);
        this.element.setAttribute('x2', this.settings.style.endX || 0);
        this.element.setAttribute('y2', this.settings.style.endY || 0);
        this.element.style.stroke = this.settings.style.color || '#000';
        this.element.style.strokeWidth = this.settings.style.width;
    },
	set_transform_origin() {
		this.element.style.transformOrigin = `${this.settings.transformOrigin[0] || 0}px ${this.settings.transformOrigin[1] || 0}px`;
	},
    set_transform() {
        this.element.setAttribute('transform', this.settings.transform || '');
    },
	make_default_style() {
		return {
			startX: this.attributes.settings.startX,
			startY: this.attributes.settings.startY,
			endX: this.attributes.settings.endX,
			endY: this.attributes.settings.endY,
			color: this.attributes.settings.color,
			width: this.attributes.settings.width
		};
	},
	fill_defaults(style) {
		style.startX = style.startX || this.attributes.settings.startX;
		style.startY = style.startY || this.attributes.settings.startY;
		style.endX = style.endX || this.attributes.settings.endX;
		style.endY = style.endY || this.attributes.settings.endY;
		style.color = style.color || this.attributes.settings.color;
		style.width = style.width || this.attributes.settings.width;
	},
	destroy() {
		this.shadow.destroy();
        this.element.remove();
		Drawable.prototype.destroy.call(this);
	}
});
Line.interpret = function(presenter, node) {
	return {
		type: 'shape',
		presenter: presenter,
		shape: 'line',
		settings: {
			startX: Number(node.getAttribute('start-x')) || 0,
			endX: Number(node.getAttribute('end-x')) || 0,
			startY: Number(node.getAttribute('start-y')) || 0,
			endY: Number(node.getAttribute('end-y')) || 0,
			color: node.getAttribute('color') || '#000000',
			width: node.getAttribute('width') || 1,
            transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin')),
			transform: node.getAttribute('transform')
		},
		style: node.dataset['bindStyle'] && el.parser.parse(node.dataset['bindStyle']),
		event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
		transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
		transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
	};
};

function Rect(attributes, context, scope, parent_settings) {
	Drawable.call(this, attributes, scope, parent_settings);
	this.attributes = attributes;
    this.element = create_element('rect');
	this.attach_events();
    parent_settings.element.appendChild(this.element);
	this.settings = {
		style: this.make_default_style()
	};
	this.shadow = el.shadow.object(new Map([
		['style', el.shadow.value(context, scope, attributes.style, style => {
			this.destroy_guard();
            util.async.async(() => this.assign_style(), 'animate');
			return style || this.make_default_style();
		})],
		['event', el.shadow.value(context, scope, attributes.event, event => {
			this.destroy_guard();
			return event;
		})],
		['transformOrigin', el.shadow.value(context, scope, attributes.transformOrigin, value => {
			this.destroy_guard();
			util.async.async(() => this.set_transform_origin());
			return value || attributes.settings.transformOrigin;
		})],
		['transform', el.shadow.value(context, scope, attributes.transform, value => {
			this.destroy_guard();
            util.async.async(() => this.set_transform(), 'animate');
			return value;
		})]
		]), this.settings);
}
util.inherit(Rect, Drawable, {
	attach_events() {
		var listener =
			e => this.shadow.get_shadow('event').invoke(e);
		['mousedown', 'mouseup', 'mousemove', 'mousein', 'mouseout', 'click'].forEach(
			ev_name => this.element.addEventListener(ev_name, listener));
	},
    assign_style() {
        this.element.setAttribute('width', this.settings.style.width);
        this.element.setAttribute('height', this.settings.style.height);
        this.element.setAttribute('x', this.settings.style.x);
        this.element.setAttribute('y', this.settings.style.y);
        this.element.style.fill = this.settings.style.fillColor || 'transparent';
        this.element.style.stroke = this.settings.style.color || 'transparent';
        this.element.style.strokeWidth = this.settings.style.border || 0;
    },
	set_transform_origin() {
		this.element.style.transformOrigin = `${this.settings.transformOrigin[0] || 0}px ${this.settings.transformOrigin[1] || 0}px`;
	},
    set_transform() {
        this.element.setAttribute('transform', this.settings.transform || '');
    },
	make_default_style() {
		return {
			x: this.attributes.settings.x,
			y: this.attributes.settings.y,
			width: this.attributes.settings.width,
			height: this.attributes.settings.height,
			color: this.attributes.settings.color,
			fillColor: this.attributes.settings.fillColor,
			border: this.attributes.settings.border
		};
	},
	destroy() {
		this.shadow.destroy();
        this.element.remove();
		Drawable.prototype.destroy.call(this);
	}
});
Rect.interpret = function (presenter, node) {
	return {
		type: 'shape',
		presenter: presenter,
		shape: 'rect',
		settings: {
			x: Number(node.getAttribute('x')) || 0,
			y: Number(node.getAttribute('y')) || 0,
			width: Number(node.getAttribute('width')) || 0,
			height: Number(node.getAttribute('height')) || 0,
			color: node.getAttribute('color'),
			fillColor: node.getAttribute('fillColor'),
			border: Number(node.getAttribute('border')) || 0,
            transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin')),
			transform: node.getAttribute('transform')
		},
		style: node.dataset['bindStyle'] && el.parser.parse(node.dataset['bindStyle']),
		event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
		transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
		transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
	};
};

function Circle(attributes, context, scope, parent_settings) {
	Drawable.call(this);
    this.element = create_element('circle');
	this.attach_events();
    parent_settings.element.appendChild(this.element);
	this.attributes = attributes;
	this.settings = {
		style: this.make_default_style()
	};
	this.shadow = el.shadow.object(new Map([
		['style', el.shadow.value(context, scope, attributes.style, style => {
			this.destroy_guard();
            util.async.async(() => this.assign_style(), 'animate');
			if (style) {
				this.fill_defaults(style);
				return style;
			} else
				return this.make_default_style();
		})],
		['event', el.shadow.value(context, scope, attributes.event, event => {
			this.destroy_guard();
			return event;
		})],
		['transformOrigin', el.shadow.value(context, scope, attributes.transformOrigin, value => {
			this.destroy_guard();
			util.async.async(() => this.set_transform_origin());
			return value || attributes.settings.transformOrigin;
		})],
		['transform', el.shadow.value(context, scope, attributes.transform, value => {
			this.destroy_guard();
            util.async.async(() => this.set_transform(), 'animate');
			return value || this.attributes.settings.transform;
		})]
		]), this.settings);
}
util.inherit(Circle, Drawable, {
	attach_events() {
		var listener =
			e => this.shadow.get_shadow('event').invoke(e);
		['mousedown', 'mouseup', 'mousemove', 'mousein', 'mouseout', 'click'].forEach(
			ev_name => this.element.addEventListener(ev_name, listener));
	},
    assign_style() {
        this.element.setAttribute('cx', this.settings.style.x);
        this.element.setAttribute('cy', this.settings.style.y);
        this.element.setAttribute('r', this.settings.style.radius);
        this.element.style.stroke = this.settings.style.color;
        this.element.style.strokeWidth = this.settings.style.border;
        this.element.style.fill = this.settings.style.fillColor;
    },
	set_transform_origin() {
		this.element.style.transformOrigin = `${this.settings.transformOrigin[0] || 0}px ${this.settings.transformOrigin[1] || 0}px`;
	},
    set_transform() {
        this.element.setAttribute('transform', this.settings.transform || '');
    },
	fill_defaults(style) {
		style.x = style.x || this.attributes.settings.x;
		style.y = style.y || this.attributes.settings.y;
		style.radius = style.radius || this.attributes.settings.radius;
		style.color = style.color || this.attributes.settings.color;
		style.fillColor = style.fillColor || this.attributes.settings.fillColor;
		style.border = style.border || this.attributes.settings.border;
	},
	make_default_style() {
		return {
			x: this.attributes.settings.x,
			y: this.attributes.settings.y,
			radius: this.attributes.settings.radius,
			color: this.attributes.settings.color,
			fillColor: this.attributes.settings.fillColor,
			border: this.attributes.settings.border
		};
	},
	destroy() {
		this.shadow.destroy();
        this.element.remove();
		Drawable.prototype.destroy.call(this);
	}
});
Circle.interpret = function (presenter, node) {
	return {
		type: 'shape',
		presenter: presenter,
		shape: 'circle',
		settings: {
			x: Number(node.getAttribute('x')) || 0,
			y: Number(node.getAttribute('y')) || 0,
			radius: Number(node.getAttribute('radius')) || 0,
			color: node.getAttribute('color') || '#000',
			fillColor: node.getAttribute('fill-color'),
			border: Number(node.getAttribute('border')),
            transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin')),
			transform: node.getAttribute('transform')
		},
		style: node.dataset['bindStyle'] && el.parser.parse(node.dataset['bindStyle']),
		event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
		transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
		transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
	};
};

function Curve(attributes, context, scope, parent_settings) {
	Drawable.call(this);
    this.element = create_element('path');
	this.attach_events();
    parent_settings.element.appendChild(this.element);
	this.settings = {
		path: attributes.settings.path,
		color: attributes.settings.color,
		fillColor: attributes.settings.fillColor,
		width: attributes.settings.width
	};
	this.presenter = attributes.presenter;
	this.path = null;
	this.shadow = el.shadow.object(new Map([
		['path', el.shadow.value(context, scope, attributes.bindings.path, path => {
			path = path || attributes.settings.path || '';
			this.destroy_guard();
            this.element.setAttribute('d', path);
			return path;
		})],
		['color', el.shadow.value(context, scope, attributes.bindings.color, value => {
			this.destroy_guard();
			return this.element.style.stroke = value || attributes.settings.color;
		})],
		['fillColor', el.shadow.value(context, scope, attributes.bindings.fillColor, value => {
			this.destroy_guard();
			return this.element.style.fill = value || attributes.settings.fillColor;
		})],
		['width', el.shadow.value(context, scope, attributes.bindings.width, value => {
			this.destroy_guard();
			return this.element.style.strokeWidth = value || attributes.settings.width;
		})],
		['event', el.shadow.value(context, scope, attributes.bindings.event, event => {
			this.destroy_guard();
			return event;
		})],
		['transformOrigin', el.shadow.value(context, scope, attributes.transformOrigin, value => {
			this.destroy_guard();
			util.async.async(() => this.set_transform_origin());
			return value || attributes.settings.transformOrigin;
		})],
		['transform', el.shadow.value(context, scope, attributes.bindings.transform, value => {
			this.destroy_guard();
            util.async.async(() => this.set_transform(), 'animate');
			return value || attributes.settings.transform;
		})]
		]), this.settings);
}
util.inherit(Curve, Drawable, {
	attach_events() {
		var listener =
			e => this.shadow.get_shadow('event').invoke(e);
		['mousedown', 'mouseup', 'mousemove', 'mousein', 'mouseout', 'click'].forEach(
			ev_name => this.element.addEventListener(ev_name, listener));
	},
	set_transform_origin() {
		this.element.style.transformOrigin = `${this.settings.transformOrigin[0] || 0}px ${this.settings.transformOrigin[1] || 0}px`;
	},
    set_transform() {
		this.element.setAttribute('transform', this.settings.transform || '');
    },
	destroy() {
		this.shadow.destroy();
        this.element.remove();
		Drawable.prototype.destroy.call(this);
	}
});
Curve.interpret = function (presenter, node) {
	return {
		type: 'shape',
		presenter: presenter,
		shape: 'curve',
		settings: {
			path: node.getAttribute('path'),
			color: node.getAttribute('color'),
			fillColor: node.getAttribute('fill-color'),
			width: Number(node.getAttribute('width')) || 1,
            transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin')),
			transform: node.getAttribute('transform')
		},
		bindings: {
			path: node.dataset['bindPath'] && el.parser.parse(node.dataset['bindPath']),
			color: node.dataset['bindColor'] && el.parser.parse(node.dataset['bindColor']),
			fillColor: node.dataset['bindFillColor'] && el.parser.parse(node.dataset['bindFillColor']),
			event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
			transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
			transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin'])
		}
	};
};

function Text(attributes, context, scope, parent_settings) {
	Drawable.call(this);
    this.element = create_element('text');
	this.attach_events();
    parent_settings.element.appendChild(this.element);
	this.attributes = attributes;
	this.settings = {
		x: attributes.settings.x,
		y: attributes.settings.y,
		size: attributes.settings.size,
		font: attributes.settings.font,
		anchor: attributes.settings.anchor,
        color: attributes.settings.color
	};
	var get_font_style = this.get_font_style =
		() => `${this.settings.size}px ${this.settings.font}`;
	var get_text_size = () => this.settings.size;
	var get_text_width = () => {
        var transform = this.element.getAttribute('transform');
        this.element.setAttribute('transform', '');
        var width = this.element.getBBox().width;
        this.element.setAttribute('transform', transform);
		return width;
	};
	this.model = {
		$element: {
			textSize: 0,
			textWidth: 0,
			parentSettings: parent_settings
		}
	};
	Object.defineProperty(this.model.$element, 'textSize', {get: get_text_size});
	Object.defineProperty(this.model.$element, 'textWidth', {get: get_text_width});
	var sub_scope = new el.scope.Scope(this.model, scope);
	this.shadow = el.shadow.object(new Map([
		['size', el.shadow.value(context, scope, attributes.bindings.size, value => {
			this.destroy_guard();
			this.update_model();
			return value || attributes.settings.size;
		})],
		['font', el.shadow.value(context, scope, attributes.bindings.font, value => {
			this.destroy_guard();
            this.set_font();
			return value || attributes.settings.font;
		})],
        ['color', el.shadow.value(context, scope, attributes.bindings.color, value => {
            this.destroy_guard();
            return this.element.style.color = value || attributes.settings.color;
        })],
		['x', el.shadow.value(context, sub_scope, attributes.bindings.x, value => {
			this.destroy_guard();
            util.async.async(() => this.set_position(), 'animate');
			return value || attributes.settings.x;
		})],
		['y', el.shadow.value(context, sub_scope, attributes.bindings.y, value => {
			this.destroy_guard();
            util.async.async(() => this.set_position(), 'animate');
			return value || attributes.settings.y;
		})],
		['event', el.shadow.value(context, sub_scope, attributes.bindings.event, event => {
			this.destroy_guard();
			return event;
		})],
		['text', el.shadow.template(context, sub_scope, attributes.settings.text, value => {
			this.destroy_guard();
			util.async.async(() => this.set_text(), 'animate');
			return value;
		})],
		['transformOrigin', el.shadow.value(context, sub_scope, attributes.bindings.transformOrigin, value => {
			this.destroy_guard();
			util.async.async(() => this.set_transform_origin());
			return value || attributes.settings.transformOrigin;
		})],
		['transform', el.shadow.value(context, sub_scope, attributes.bindings.transform, value => {
			this.destroy_guard();
            util.async.async(() => this.set_transform());
			return value || attributes.settings.transform;
		})],
		['anchor', el.shadow.value(context, sub_scope, attributes.bindings.anchor, value => {
			this.destroy_guard();
			util.async.async(() => this.set_anchor(), 'animate');
			return value || attributes.settings.anchor;
		})]
		]), this.settings);
}
util.inherit(Text, Drawable, {
	attach_events() {
		var listener =
			e => this.shadow.get_shadow('event').invoke(e);
		['mousedown', 'mousemove', 'mouseup', 'mousein', 'mouseout', 'click'].forEach(
			ev_name => this.element.addEventListener(ev_name, listener));
	},
	set_anchor() {
		Array.prototype.forEach.call(this.element.children, tspan => {
			tspan.style.textAnchor = this.settings.anchor;
		});
	},
	set_text() {
		while (this.element.lastChild)
			this.element.lastChild.remove();
		// split text
		if (this.settings.text)
			this.settings.text.split('\n').map((text, index) => {
				var tspan = create_element('tspan');
				tspan.style.textAnchor = this.settings.anchor;
				tspan.textContent = text;
				tspan.setAttribute('x', 0);
				tspan.setAttribute('dy', index * this.settings.size);
				this.element.appendChild(tspan);
			});
		this.update_model();
	},
	set_position() {
		this.element.setAttribute('x', this.settings.x);
		this.element.setAttribute('y', this.settings.y);
		Array.prototype.forEach.call(this.element.children, tspan => {
			tspan.setAttribute('x', this.settings.x);
			tspan.setAttribute('y', this.settings.y);
		});
	},
    set_font() {
        this.element.style.font = this.get_font_style();
        this.update_model();
    },
	set_transform_origin() {
		this.element.style.transformOrigin = `${this.settings.transformOrigin[0] || 0}px ${this.settings.transformOrigin[1] || 0}px`;
	},
    set_transform() {
        this.element.setAttribute('transform', this.settings.transform || '');
    },
	update_model() {
		var notifier = Object.getNotifier(this.model.$element);
		notifier.notify({
			type: 'update',
			name: 'textSize'
		});
		notifier.notify({
			type: 'update',
			name: 'textWidth'
		});
	},
	destroy() {
		this.shadow.destroy();
        this.element.remove();
		Drawable.prototype.destroy.call(this);
	}
});
Text.interpret = function (presenter, node) {
	return {
		type: 'text',
		presenter: presenter,
		settings: {
			x: Number(node.getAttribute('x')) || 0,
			y: Number(node.getAttribute('y')) || 0,
			size: Number(node.getAttribute('size')) || 10,
			font: node.getAttribute('font') || 'sans-serif',
			text: node.textContent.trim(),
            transformOrigin: parseTransformOrigin(node.getAttribute('transform-origin')),
			transform: node.getAttribute('transform'),
			anchor: node.getAttribute('anchor') || 'start',
            color: node.getAttribute('color') || 'black'
		},
		bindings: {
			x: node.dataset['bindX'] && el.parser.parse(node.dataset['bindX']),
			y: node.dataset['bindY'] && el.parser.parse(node.dataset['bindY']),
			size: node.dataset['bindSize'] && el.parser.parse(node.dataset['bindSize']),
			font: node.dataset['bindFont'] && el.parser.parse(node.dataset['bindFont']),
			event: node.dataset['bindEvent'] && el.parser.parse(node.dataset['bindEvent']),
			transform: node.dataset['bindTransform'] && el.parser.parse(node.dataset['bindTransform']),
			transformOrigin: node.dataset['bindTransformOrigin'] && el.parser.parse(node.dataset['bindTransformOrigin']),
			anchor: node.dataset['bindAnchor'] && el.parser.parse(node.dataset['bindAnchor']),
            color: node.dataset['bindColor'] && el.parser.parse(node.dataset['bindColor'])
		}
	};
};

function make_layout(attributes, context, scope, parent_settings) {
	switch (attributes.type) {
	case 'relative-layout':
		return new RelativeLayout(attributes, context, scope, parent_settings);
	case 'iterate':
		return new IterativeTemplate(attributes, context, scope, parent_settings);
	case 'condition':
		return new ConditionalTemplate(attributes, context, scope, parent_settings);
	case 'inject':
		return new InjectiveTemplate(attributes, context, scope, parent_settings);
	case 'model':
		return new ModelingTemplate(attributes, context, scope, parent_settings);
	case 'template':
		return new Template(attributes, context, scope, parent_settings);
	case 'shape':
		return Shape.new_instance(attributes, context, scope, parent_settings);
	case 'text':
		return new Text(attributes, context, scope, parent_settings);
	}
}

function interpret_template (presenter, node) {
	switch(node.nodeName.toLowerCase()) {
	case 'relative-layout':
		return RelativeLayout.interpret(presenter, node);
	case 'template':
		return Template.interpret(presenter, node);
	case 'draw-box':
		return DrawBox.interpret(presenter, node);
	case 'shape':
		return Shape.interpret(presenter, node);
	case 'text':
		return Text.interpret(presenter, node);
	}
}

function interpret_root(presenter, template) {
	return Root.interpret(presenter, template);
}

function interpret_children(children, presenter) {
	return Array.from(children).map(node => interpret_template(presenter, node));
}

function bind(presenter, template, model) {
	return new Root(interpret_root(presenter, template), new el.scope.Scope(model));
}

return Object.freeze({
	Root: Root,
	bind: bind
});

});
define('presenter/svg/svg',['module_struct', './layout', 'util/util'],
function(module, layout, util) {
'use strict';

function SVGPresenterImpl() {
	this.model = {
		painter: timestamp => this.refresh(timestamp),
		event: {/* empty */}
	};
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
	this.dirty = false;
}

Object.assign(SVGPresenterImpl.prototype, {
	bind(target, template, model) {
		if (this.layout)
			this.layout.destroy();
		this.canvas = target;
        this.canvas.appendChild(this.defs);
		this.layout = layout.bind(this, template, model);
	},
	refresh(timestamp) {
		this.layout.refresh(timestamp);
	},
	resize() {
		this.layout.setSize(this.target.width, this.target.height);
	},
	requestRefresh() {
		util.async(timestamp => this.refresh(timestamp), 'animate');
	},
	destroy() {
		if (this.layout)
			this.layout.destroy();
	},
    register_def(element) {
        this.defs.appendChild(element);
    },
    remove_def(element) {
        this.element.remove();
    }
});

var SVGPresenter = module('SVGPresenter', {instance: SVGPresenterImpl});

return Object.freeze({
	SVGPresenter: SVGPresenter
});

});
define('presenter/presenter',['./canvas2d/canvas2d', './svg/svg'], function(canvas2d, svg) {
'use strict';

return {
	canvas2d: canvas2d,
    svg: svg
};

});
define('compat/input',['util/util'], function (util) {
var BIND_HANDLERS = new Map;

function delegate_property_setter(constructor, property, event_name) {
	if (!BIND_HANDLERS.has(constructor))
		BIND_HANDLERS.set(constructor, {});
	var o = Object.getOwnPropertyDescriptor(constructor.prototype, property);
	var getter = o.get;
	var setter = o.set;
	Object.defineProperty(constructor.prototype, property, {
		configurable: true,
		enumerable: true,
		get: o.get,
		set (x) {
			var before = getter.call(this);
			setter.call(this, x);
			var after = getter.call(this);
			if (before !== after)
				if (util.traits.is_function(event_name))
					util.async.async(() => event_name(this));
				else if (util.traits.is_array(event_name))
					util.async.async(() =>
						event_name.forEach(ev =>
							this.dispatchEvent(new Event(ev))));
				else
					util.async.async(() => this.dispatchEvent(new Event(event_name)));
			return x;
		}
	});
	BIND_HANDLERS.get(constructor)[property] = setter;
}

delegate_property_setter(HTMLInputElement, 'value', ['input', 'change']);
delegate_property_setter(HTMLInputElement, 'checked', ['click', 'input', 'change']);
delegate_property_setter(HTMLOptionElement, 'selected', function (element) {
	element.parentElement.dispatchEvent(new Event('change'));
});
delegate_property_setter(HTMLTextAreaElement, 'value', ['input', 'change']);

return {
	invoke_setter(element, property, value) {
		if (BIND_HANDLERS.has(element.constructor))
			if (property in BIND_HANDLERS.get(element.constructor))
				BIND_HANDLERS
					.get(element.constructor)
					[property]
					.call(element, value);
	}
};

});
define('bind',['el/el', 'util/util', 'compat/input', 'compat/observe'],
function (el, util, input_setter, _proxy){
'use strict';

var unprocessedClass = 'vis-unprocessed';
var domBindHandlers = new Map;
var domBindElements = new Set;
var domBindRootElementScopes = new WeakMap;

function dom_observer_handler(changeset) {
	for (var change of changeset) {
		for (var removedElement of
			Array.prototype.slice.call(change.removedNodes)) {
			domBindElements.delete(removedElement);
			if (domBindHandlers.has(removedElement)) {
				for (var handler of domBindHandlers.get(removedElement))
					handler();
				domBindHandlers.delete(removedElement);
			}
		}
		for (var addedElement of
			Array.prototype.slice.call(change.addedNodes))
			if (!domBindElements.has(addedElement)) {
				var parent = addedElement.parentElement;
				while(parent && parent.nodeName.toLowerCase() !== 'template' && !check_static(parent))
					if (domBindRootElementScopes.has(parent)) {
						var context_scope = domBindRootElementScopes.get(parent);
						bind_element(addedElement, context_scope.scope, context_scope.context);
						break;
					} else
						parent = parent.parentElement;
			}
	}
}

var domObserver = new MutationObserver(dom_observer_handler);
domObserver.observe(document, {childList: true, subtree: true});

function registerDOMBindHandler(target, handler) {
	var handlers;
	if (domBindHandlers.has(target)) {
		handlers = domBindHandlers.get(target);
	} else {
		handlers = new Set;
		domBindHandlers.set(target, handlers);
	}
	handlers.add(handler);
}

function bind(target, instance) {
	if (util.traits.is_string(target)) {
		target = document.querySelectorAll(target);
	}

	var root_scope = new el.scope.Scope(instance.model, null);
	var context = new el.shadow.ShadowContext;	// start watching
	if (target instanceof NodeList)
		Array.prototype.forEach.call(
			target,
			target => domBindRootElementScopes.set(target, {scope: root_scope, context: context}));
	else if (target instanceof Node)
		domBindRootElementScopes.set(target, {scope: root_scope, context: context});
	bind_element(target, root_scope, context);
}

function check_static(target) {
	return target instanceof Element && target.hasAttribute('vis-static');
}

function bind_element(target, scope, context) {
	function visit_node(target) {
		try {
			var node_name = target.nodeName.toLowerCase();
			if (node_name === 'script' ||
					domBindElements.has(target) ||
					check_static(target))
				return NodeFilter.FILTER_REJECT;
			else
				domBindElements.add(target);

			bind_element_attribute(target, scope, context);
			bind_element_attribute_set(target, scope, context);
			bind_element_all_attributes(target, scope, context);
			switch (target.nodeName.toLowerCase()) {
			case '#text':
			case '#data':
				bind_text_template(target, scope, context);
			case 'script':
			case '#comment':
				return NodeFilter.FILTER_REJECT;
			}
			if (target instanceof Element)
				bind_action_attribute(target, scope, context);
			switch (target.nodeName.toLowerCase()) {
			case 'a':
			case 'button':
				bind_element(target.childNodes, scope, context);
				return NodeFilter.FILTER_ACCEPT;
			case 'select':
				bind_element(target.childNodes, scope, context);
			case 'input':
			case 'textarea':
				bind_value_attribute(target, scope, context);
				return NodeFilter.FILTER_ACCEPT;
			case 'canvas':
				bind_painter_attribute(target, scope, context);
				return NodeFilter.FILTER_REJECT;
			case 'template':
				bind_control_attributes(target, scope, context);
				return NodeFilter.FILTER_REJECT;
			default:
				return NodeFilter.FILTER_ACCEPT;
			}
		} catch(e) {
			return NodeFilter.FILTER_REJECT;
		} finally {
			if (target.classList)
				target.classList.remove(unprocessedClass);
		}
	}

	function walk_nodes(target) {
		visit_node(target);
		var itr = document.createTreeWalker(
			target,
			NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
			{acceptNode: visit_node});
			while (itr.nextNode()) ;
	}

	if (target instanceof NodeList)
		Array.prototype.forEach.call(target, walk_nodes);
	else if (target instanceof Node)
		walk_nodes(target);
	else
		for (var element of target)
			walk_nodes(element);
}

function bind_action_attribute(target, scope, context) {
	if (target.hasAttribute('vis-action')) {
		// onclick expression
		var handler_shadow = el.shadow.value(
			context,
			scope,
			target.getAttribute('vis-action'));
		target.addEventListener('click', function (event) {
			handler_shadow.context_invoke(this, event);
		});
		registerDOMBindHandler(target, () => handler_shadow.destroy());
	}
}

function bind_value_attribute(target, scope, context) {
	if (target.hasAttribute('vis-value')) {
		var type = target.getAttribute('vis-value-type');
		var on_change_hook = function (event) {
			var value;
			if (target.nodeName.toLowerCase() === 'select')
				value = Array.prototype.map.call(target.selectedOptions, e => e.value);
			else if (target.type === 'checkbox')
				value = target.checked;
			else
				value = target.value;
			switch (type) {
			case 'integer':
				if (Number.isNaN(value = Number.parseInt(value)))
					return;
				break;
			case 'number':
				if (Number.isNaN(value = Number(value)))
					return;
				break;
			case 'boolean':
				value = Boolean(value);
				break;
			case 'string':
				value = String(value);
			}
			// update value
			value_shadow.bind_handler(value);
			change_shadow.invoke(value);
		};
		if (target.nodeName.toLowerCase() === 'select' || target.type === 'checkbox')
			target.addEventListener('change', on_change_hook);
		else
			target.addEventListener('input', on_change_hook);
		var value_shadow = el.shadow.value(
			context,
			scope,
			target.getAttribute('vis-value'),
			function (value) {
				if (value || value === 0)
					target[target.type === 'checkbox' ? 'checked' : 'value'] = value;
				else
					target[target.type === 'checkbox' ? 'checked' : 'value'] = '';
			});
		var change_shadow =
			el.shadow.value(
				context,
				scope,
				target.getAttribute('vis-change'));
		registerDOMBindHandler(target, function(){
			value_shadow.destroy();
			if (change_shadow)
				change_shadow.destroy();
		});
	}
}

function bind_element_attribute(target, scope, context) {
	if (target instanceof Element && target.hasAttribute('vis-element')) {
		var shadow = el.shadow.value(
			context,
			scope,
			target.getAttribute('vis-element'),
			util.traits.EMPTY_FUNCTION);
		shadow.bind_handler({
			element: target,
			scope: scope
		});
		registerDOMBindHandler(target, () => shadow.destroy());
	}
}

function bind_element_attribute_set(target, scope, context) {
	function purge_event_handlers() {
		event_map.forEach(
			(handler, event_name) =>
				target.removeEventListener(event_name, handler));
		event_map.clear();
	}
	if (target instanceof Element && target.getAttribute('vis-attributes')) {
		var event_map = new Map;
		var shadow = el.shadow.value(
			context,
			scope,
			target.getAttribute('vis-attributes'),
			function (attr) {
				if (attr instanceof Map) {
					attr.forEach(function (value, key) {
						target.setAttribute(key, value);
					});
				} else if (util.traits.is_object(attr))
					Object.getOwnPropertyNames(attr)
					.forEach(function (key) {
						switch (key) {
						case '$event':
							purge_event_handlers();
							Object.getOwnPropertyNames(attr.$event)
							.forEach(function (event) {
								var handler = attr.$event[event];
								target.addEventListener(event, el.eval.wrap_el_function(handler));
								event_map.set(event, handler);
							});
							break;
						default:
							target.setAttribute(key, attr[key]);
						}
					});
			});
		registerDOMBindHandler(target, () => shadow.destroy());
	}
}

function bind_element_all_attributes(target, scope, context) {
	// iterate all attributes
	var shadows = [];
	function bind_template(attribute) {
		var shadow = el.shadow.template(
			context,
			scope,
			attribute.value,
			function (value) {
				attribute.value = value;
			});
		shadows.push(shadow);
	}

	if (target instanceof Element && target.hasAttributes())
		for (var i = 0, end = target.attributes.length; i < end; ++i)
			if (!target.attributes[i].name.startsWith('vis-'))
				bind_template(target.attributes[i]);
	registerDOMBindHandler(
		target,
		() => shadows.forEach(shadow => shadow.destroy())
	);
}

function import_child_nodes(template) {
	var childNodes = template.childNodes;
	var fragment = document.createDocumentFragment();
	Array.prototype.forEach.call(childNodes,
		node => fragment.appendChild(document.importNode(node, true)));
	return fragment;
}

function inject(template, scope, context, position) {
	var importNode;
	if (template.content)
		importNode = document.importNode(template.content, true);
	else
		importNode = import_child_nodes(template);
	bind_element(importNode, scope, context);
	var elements = Array.prototype.slice.call(importNode.childNodes);
	var anchor = position || template;
	anchor.parentNode.insertBefore(importNode, position || template);
	return elements;
}

function animate_enter(elements, animation_config) {
	if (animation_config && util.traits.is_function(animation_config.enter))
		animation_config.enter(elements);
}
function animate_leave(elements, animation_config) {
	if (animation_config && util.traits.is_function(animation_config.leave))
		animation_config.leave(elements, function () {
			for (var element of elements) {
				element.remove();
			}
		});
	else
		for (var element of elements)
			element.remove();
}

function bind_condition_attribute(target, scope, context) {
	var animation_shadow = el.shadow.value(
		context,
		scope,
		target.getAttribute('vis-animate'));
	var elements = null;
	var condition;
	function get_consequent_template() {
		var root = target.content || target;
		var children = new Set(Array.prototype.slice.call(root.children));
		var consequent = Array.prototype.slice
			.call(root.querySelectorAll('consequent'))
			.filter(element => children.has(element));
		if (consequent.length)
			return consequent[0];
		else
			return target;
	}
	function get_alternative_template() {
		var root = target.content || target;
		var children = new Set(Array.prototype.slice.call(root.children));
		var alternative = Array.prototype.slice
			.call(root.querySelectorAll('alternative'))
			.filter(element => children.has(element));
		if (alternative.length)
			return alternative[0];
	}
	function switch_content(newCondition) {
		if (elements)
			animate_leave(elements.slice(), animation_shadow.value);
		if (newCondition) {
			elements = inject(get_consequent_template(), scope, context, target);
			animate_enter(elements.slice(), animation_shadow.value);
		} else {
			var alternative_template = get_alternative_template();
			if (alternative_template) {
				elements = inject(alternative_template, scope, context, target);
				animate_enter(elements.slice(), animation_shadow.value);
			} else
				elements = null;
		}
		condition = newCondition;
	}
	var shadow = el.shadow.value(
		context,
		scope,
		target.getAttribute('vis-condition'),
		function (value) {
			value = Boolean(value);
			if (elements) {
				if (condition ^ value)
					switch_content(value);
			} else
				switch_content(value);
			return value;
		});
	registerDOMBindHandler(target, function(){
		if (elements)
			animate_leave(elements.slice(), animation_shadow.value);
		shadow.destroy();
		animation_shadow.destroy();
	});
}

function bind_model_attribute(target, scope, context) {
	var animation_shadow = el.shadow.value(
		context,
		scope,
		target.getAttribute('vis-animate'));
	var elements = null;
	var sub_scope;
	var shadow = el.shadow.value(
		context,
		scope,
		target.getAttribute('vis-model'),
		function (model) {
			if (util.traits.is_object(model)) {
				if (elements) {
					Object.assign(_proxy(sub_scope.model), model);
					for (var key of Object.getOwnPropertyNames(sub_scope.model))
						if (!(key in model))
							delete _proxy(sub_scope.model)[key];
				} else {
					elements = inject(
						target,
						sub_scope = new el.scope.Scope(Object.assign({}, model), scope),
						context);
					animate_enter(elements.slice(), animation_shadow.value);
				}
			} else {
				if (elements)
					animate_leave(elements.slice(), animation_shadow.value);
				elements = null;
			}
		});
	registerDOMBindHandler(target, function(){
		if (elements)
			animate_leave(elements.slice(), animation_shadow.value);
		shadow.destroy();
		animation_shadow.destroy();
	});
}

function bind_iterate_attribute(target, scope, context) {
	var expression = el.parser.parse(target.getAttribute('vis-iterate'));

	if (expression.type !== 'iterate') {return ;}

	var item_scopes = new WeakMap;
	var item_scope_feedback_shadows = new WeakMap;
	var element_expression = el.parser.parse(expression.element);
	
	var animation_shadow = el.shadow.value(
		context,
		scope,
		target.getAttribute('vis-animate'));
	var list = [];

	function find_next_item_node(start) {
		while (start < list.length && !list[start].length) {
			++start;
		}
		return start < list.length ? list[start][0] : target;
	}

	function make_sub_scope(value, key, collection) {
		var model = {};
		Object.defineProperty(model, expression.element, {
			value: value,
			writable: true
		});
		util.traits.is_undefined(expression.index) ||
			Object.defineProperty(model, expression.index, {value: key});
		util.traits.is_undefined(expression.reference) ||
			Object.defineProperty(model, expression.reference, {value: collection});
		return new el.scope.Scope(model, scope);
	}

	function push_new_item(collection, key, value, update_feedback) {
		var scope = make_sub_scope(value, key, collection);
		var new_item = inject(target, scope, context);
		list.push(new_item);
		animate_enter(new_item.slice(), animation_shadow.value);
		item_scopes.set(new_item, scope);
		item_scope_feedback_shadows.set(
			new_item,
			el.shadow.value(
				context,
				scope,
				element_expression,
				update_feedback));
	}

	function update_collection(collection) {
		// total refresh
		if (util.traits.is_map(collection)) {
			for (var item of list) {
				animate_leave(item.slice(), animation_shadow.value);
				item_scope_feedback_shadows.get(item).destroy();
			}
			list = [];
			collection.forEach(
				(value, key) =>
					push_new_item(
						collection, key, value, value => collection.set(key, value))
			);
		} else if (util.traits.is_array(collection)) {
			var length = collection.length;
			collection.forEach(function (value, i) {
				if (i < list.length) {
					if (item_scopes.has(list[i]))
						_proxy(item_scopes.get(list[i])
							.model)[expression.element] = value;
				} else
					push_new_item(collection, i, value, value => _proxy(collection)[i] = value);
			});
			for (var i = length; i < list.length; ++i) {
				animate_leave(list[length].slice(), animation_shadow.value);
				if (item_scope_feedback_shadows.has(list[length]))
					item_scope_feedback_shadows.get(list[length]).destroy();
				list.splice(length, 1);
			}
		} else if (collection) {
			var count = 0;
			for (var element of collection) {
				// generic access to collection
				if (count < list.length) {
					if (item_scopes.has(list[i]))
						_proxy(item_scopes.get(list[i])
							.model)[expression.element] =
								element
				} else
					// immutable
					push_new_item(collection, count, element, () => {});
				++count;
			}
			for (var i = count; i < list.length; ++i) {
				animate_leave(list[count].slice(), animation_shadow.value);
				if (item_scope_feedback_shadows.has(list[count]))
					item_scope_feedback_shadows.get(list[count]).destory();
				list.splice(count, 1);
			}
		}
		return list.slice();	// return a shallow copy of list of elements
	}

	function *update_splice(collection) {
		while (true) {
			var change = yield true;
			if (change)
				switch (change.operation) {
				case 'create':
					var next_item_node = find_next_item_node(change.key);
					var scope = make_sub_scope(change.value, change.key, collection);
					var new_item = inject(target, scope, context, next_item_node);
					list.splice(change.key, 0, new_item);
					animate_enter(new_item.slice(), animation_shadow.value);
					item_scopes.set(new_item, scope);
					(index =>
						item_scope_feedback_shadows.set(
							new_item,
							el.shadow.value(
								context,
								scope,
								element_expression,
								value => _proxy(collection)[index] = value))
					)(change.key);
					yield new_item;
					break;
				case 'destroy':
					animate_leave(list[change.key].slice(), animation_shadow.value);
					if (item_scope_feedback_shadows.has(list[change.key]))
						item_scope_feedback_shadows.get(list[change.key]).destroy();
					list.splice(change.key, 1);
					yield true;
					break;
				case 'update':
					if (item_scopes.has(list[change.key]))
						_proxy(item_scopes.get(list[change.key])
							.model)[expression.element] = change.value;
					yield list[change.key];
				}
			else
				break;
		}
	}

	var shadow =
		el.shadow.array(
			context,
			scope,
			expression,
			{
				all_proxy: update_collection,
				splice_change: update_splice
			});
	registerDOMBindHandler(target, function () {
		list.forEach(function(item) {
			if (item_scope_feedback_shadows.has(item))
				item_scope_feedback_shadows.get(item).destroy();
			animate_leave(item.slice(), animation_shadow.value);
		});
		shadow.destroy();
		animation_shadow.destroy();
	});
}

function bind_inject_attribute(target, scope, context) {
	var elements = null;

	function update_injection(template, argument) {
		if (elements)
			animate_leave(elements.slice(), animation_shadow.value);
		if (template) {
			var sub_scope = new el.scope.Scope(argument || {}, template.scope || scope);
			elements = inject(template.element, sub_scope, context, target);
			animate_enter(elements.slice(), animation_shadow.value);
		} else
			elements = null;
	}

	var animation_shadow = el.shadow.value(
		context,
		scope,
		target.getAttribute('vis-animate'));
	var argument_shadow = el.shadow.value(
		context,
		scope,
		target.getAttribute('vis-argument'),
		function (value) {
			util.async.async(() => update_injection(shadow.value, argument_shadow.value));
			return value;
		});
	var shadow = el.shadow.value(
		context,
		scope,
		target.getAttribute('vis-inject'),
		function (value) {
			util.async.async(() => update_injection(shadow.value, argument_shadow.value));
			return value;
		});
	registerDOMBindHandler(target, function () {
		if (elements)
			animate_leave(elements.slice(), animation_shadow.value);
		shadow.destroy();
		animation_shadow.destroy();
		argument_shadow.destroy();
	});
}

function bind_control_attributes(target, scope, context) {
	if (target.hasAttribute('vis-condition')) {
		bind_condition_attribute(target, scope, context);
	} else if (target.hasAttribute('vis-iterate')) {
		bind_iterate_attribute(target, scope, context);
	} else if (target.hasAttribute('vis-model')) {
		bind_model_attribute(target, scope, context);
	} else if (target.hasAttribute('vis-inject')) {
		bind_inject_attribute(target, scope, context);
	}
}

function bind_painter_attribute(target, scope, context) {
	if (target.hasAttribute('vis-painter')) {
		var shadow = el.shadow.value(
			context,
			scope,
			target.getAttribute('vis-painter'),
			function (handler) {
				if (util.traits.is_function(handler)) {
					requestAnimationFrame(
						time => shadow.invoke(time, target));
				}
				return handler;
			});
		registerDOMBindHandler(target, () => shadow.destroy());
	}
}

function bind_text_template(target, scope, context) {
	var shadow = el.shadow.template(
		context,
		scope,
		target.textContent,
		function (text) {
			target.textContent = text;
			return text;
		});

	// text removal is only registered at parent nodes only
	registerDOMBindHandler(target.parentNode, () => shadow.destroy());
}

return Object.freeze({
	bind: bind,
	bind_element: bind_element
});

});

define('worker',[],function(){

return function(script) {
	var url =
		URL.createObjectURL(
			new Blob([script], {type: 'application/javascript'}));
	var worker = new Worker(url);
	URL.revokeObjectURL(url);
	return worker;
};

});
define('data/interpolate',['util/util', 'el/el'],
function(util, el) {
'use strict';

var interpolate =
	el.eval.force(el.eval.evaluate_el(
		el.parser.parse(
`(\\...expr => (
	force_expr = \${expr >>= (\\x => x^ || 0)};
	initial = force_expr!;
	mode = *.traits.IDENTITY_FUNCTION;
	functor = (\\ x, y => y);
	start = end = *.traits.EMPTY_FUNCTION;
	delay = 0;
	duration = 1000;
	transition = @{ {{
		current: \${initial},
		update: void(),
		last: \${initial},
		start_time: *.util.now()
		}} (
			@(functor_call = \${
				functor((current_time^ - start_time^ - delay) / duration,
					...[0..expr.length^] | *.stream.evaluate^
					>>= (\\ index =>
						mix^(
							last[index]^,
							current[index]^,
							mode((current_time^ - start_time^ - delay) / duration)
				)))
			}, void());
			current_time = *.util.now();
			current.some((\\ value, index => value neq (expr[index] || 0))) && (
				last = last.map(
					(\\ value, index =>
						(start_time + delay + duration < current_time)^ ?
							current[index]^
						: (start_time + delay < current_time)^ ?
							mix(
								value,
								current[index],
								mode((current_time - start_time - delay) / duration))^
						: value^)
				);
				current = force_expr!;
				start_time = current_time;
				start(...force_expr);
			);
			(start_time + delay + duration < current_time)^ ? (
				last = force_expr!;
				end(...force_expr);
				functor(1, ...force_expr);
			) : (
				*.async((\\=>#update), 'animate');
				(start_time + delay < current_time)^ ?
					@(
						update,
						force_expr!,
						functor_call^
					)
				: @(
					update,
					force_expr!,
					functor(0, ...last));
			);
		)
	};
	control = {
		with: (\\ x =>( mode = x; control; )),
		functor: (\\ x =>( functor = x; control; )),
		start: (\\ x =>( start = x; control; )),
		end: (\\ x =>( end = x; control; )),
		delay: (\\ x =>( delay = x; control; )),
		duration: (\\ x =>( duration = x; control; )),
		initial: (\\ ...x =>( initial = x; control; )),
		transition: transition
	};
	control;
))`),
		new el.scope.Scope({
			mix(a,b,t) {
				return (1-t)*a + t*b;
			}}))).value;

Object.assign(interpolate, {
	linear: util.traits.IDENTITY_FUNCTION,
	cubic_bezier: util.math.cubic_bezier
});

el.standard.extend('interpolate', interpolate);

return interpolate;

});
define('data/data',['el/el', 'util/util', 'compat/observe', './interpolate'],
function(el, util, _proxy) {
'use strict';

function Aggregate(context, scope, collection, options) {
	options = Object.assign({
		compare: (x, y) => (x > y) - (x < y),
		equal: (x, y) => x === y,
		left_fold: (a,b) => a + b,
		right_fold: (a,b) => a + b,
		left_fold_initial: 0,
		right_fold_initial: 0
	}, options);
	var self = this;
	var sum = 0;
	var count = 0;
	var prefix_sum = [];
	var suffix_sum = [];

	this.model = {
		min: 0,
		max: 0,
		sum: 0,
		count: 0,
		average: 0,
		prefix_sum: prefix_sum,
		suffix_sum: suffix_sum
	};

	function calculateAggregates(shadowed) {
		var min = shadowed[0];
		var max = shadowed[0];
		_proxy(suffix_sum).length =
		_proxy(prefix_sum).length = shadowed.length;
		var left_fold_initial =
			util.traits.is_function(options.left_fold_initial) ?
				options.left_fold_initial() : options.left_fold_initial;
		for (var i = 0, end = shadowed.length, s = left_fold_initial; i < end; ++i) {
			if (options.compare(min, shadowed[i]) > 0)
				min = shadowed[i];
			if (options.compare(shadowed[i], max) > 0)
				max = shadowed[i];
			_proxy(prefix_sum)[i] = s = options.left_fold(s, shadowed[i]);
		}
		var right_fold_initial =
			util.traits.is_function(options.right_fold_initial) ?
				options.right_fold_initial() : options.right_fold_initial;
		for (var i = shadowed.length - 1, s = right_fold_initial; i >= 0; --i)
			_proxy(suffix_sum)[i] = s = options.right_fold(s, shadowed[i]);
		var count = shadowed.length;
		var sum = prefix_sum[prefix_sum.length - 1];
		_proxy(self.model).min = min;
		_proxy(self.model).max = max;
		_proxy(self.model).count = count;
		_proxy(self.model).sum = sum;
		_proxy(self.model).average = sum / count;
	}

	this.shadow = new el.shadow.array(context, scope, collection, {
		*splice_change(collection, shadowed) {
			while (true) {
				var change = yield true;
				var n;
				if (change)
					switch (change.operation) {
					case 'update':
						yield change.value;
						break;
					case 'create':
						yield change.value;
						break;
					case 'destroy':
						yield true;
						break;
					default:
						return calculateAggregates(shadowed);
					}
				else
					return calculateAggregates(shadowed);
			}
		}
	});
}

Object.assign(Aggregate.prototype, {
	destroy() {
		this.shadow.destroy();
	}
});

Aggregate.COLLECTION_EXPRESSION = el.parser.parse('collection');

return Object.freeze({
	Aggregate: Aggregate
});

});
require(['el/el', 'presenter/presenter', 'bind', 'module_struct', 'worker', 'data/data'],
function(el, presenter, bind, module, worker, data) {

return Object.freeze({
  el: el,
  bind: bind,
  module: module,
  worker: worker,
  data: data
});

});

define("vis", function(){});

