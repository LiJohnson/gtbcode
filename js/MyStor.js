/**
 * localStorage
 * @param  storage could be window.sessionStorage/window.localStorage
 * @param  String key     
 */
var Storage = function(key, storage) {
	storage = storage || win.localStorage || {};
	var data = JSON.parse(storage[key] || "{}") || {};

	/**
	 * get all value
	 */
	this.getAll = function() {
		return data;
	};

	/**
	 * get a value
	 */
	this.get = function(key) {
		return data[key];
	};

	/**
	 * set a value
	 */
	this.set = function(k, v) {
		if (arguments.length == 1) {
			data = k;
		} else {
			data[k] = v;
		}
		storage[key] = JSON.stringify(data);
	};

	/**
	 * delete a key
	 */
	this.remove = function(k) {
		delete data[k];
		storage[key] = JSON.stringify(data);
	};

	/**
	 * destory this storage
	 */
	this.destory = function() {
		if (storage.removeItem) {
			storage.removeItem(key);
		} else {
			storage[key] = null;
		}
	};
};