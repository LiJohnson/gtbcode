var jsonToString = (function(){

	var type = function(val){
		var _type = typeof val;
		if( _type == 'object' ){
			_type = Object.prototype.toString.call(val).match(/\s[^\]]+/)[0].trim().toLowerCase();
		}
		return _type;
	};
	//Date RegExp
	var fun = {
		'function'	:function(val){return val.toString();},
		'date'		:function(val){return 'new Date('+val*1+')';},
		'regexp'	:function(val){return val.toString();},
		'number'	:function(val){return val;},
		'boolean'	:function(val){return !!val;},
		'undefined'	:function(val){return 'undefined';},
		'null'		:function(val){return 'null';}
	};
	var valueToStr = function(val , deep){
		var _type = type(val);
		if( _type == 'object' ){
			return objectToStr(val,deep-1);
		}else if( _type == 'array'){
			return arrayToStr(val,deep);
		}else if( fun[_type] ){
			return fun[_type](val);
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
		deep = deep || 10;
		return objectToStr(json , deep);
	};
})();
window.jsonToString = jsonToString;