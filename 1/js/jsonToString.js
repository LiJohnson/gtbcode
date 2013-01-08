var jsonToString = (function(){

	var type = function(val){
		var _type = typeof val;
		if( _type == 'object' ){
			_type = Object.prototype.toString.call(val).match(/\s[^\]]+/)[0].trim().toLowerCase();
		}
		return _type;
	};
	//Date RegExp
	var valueToStr = function(val , deep){
		var _type = type(val);
		if( _type == 'object' ){
			return objectToStr(val,deep-1);
		}else if( _type == 'array'){
			return arrayToStr(val,deep);
		}else if( _type == 'function' ){
			return val.toString();
		}else if( _type == 'date' ){
			return 'new Date('+val*1+')';
		}else if( _type == 'regexp' ){
			return val.toString();
		}else if( _type == 'number' ){
			return val;
		}else if( _type == 'boolean'){
			return !!val;
		}else if( _type == 'undefined'){
			return 'undefined';
		}else if( _type == 'null'){
			return 'null';
		}else { //others:string  ...
			return strToStr(val.toString());
		}
	
	};
	var objectToStr = function(obj , deep){
		if( deep <= 0 )return strToStr(obj.toString());
		
		var str = '{';
		for( var k in obj ){
			str += strToStr(k)+':'+valueToStr(obj[k] , deep)+',';
		}
		return str.replace(/,$/,'') + '}';

	};
	var arrayToStr = function(arr , deep){
		var str = '[';
		for( var i = 0 ; i < arr.length ; i++ ){
			str += valueToStr(arr[i] , deep)+',';
		}
		return str.replace(/,$/,'') + ']';
	};
	var strToStr = function(str){
		str = str.replace(/\"/g,'\\\"')
				.replace(/\'/g,'\\\'')
				.replace(/\n/g,'\\n')
				.replace(/\t/g,'\\t')
				.replace(/\f/g,'\\f')
				//.replace(/\b/g,'\\b')
				.replace(/\r/g,'\\r');
		return '\"' + str + '\"';
	};
	return function(json , deep){
		deep = deep || 5;
		return objectToStr(json , deep);
	};
})();
window.jsonToString = jsonToString;