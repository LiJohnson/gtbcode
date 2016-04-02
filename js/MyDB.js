/**
 * created by lcs 2013-03-16 09:34:05
 * 封装Indexed DB 一些操作（用起来像localStorage）
 * 需要 chrome 24 + 
 * demo：
 * 		var myDB = new MyDB("db" , "table");
 *		myDB.set("a",{a:123});
 *		myDB.get("a",function(obj){ ... });
 *		myDB.delete("a");
 */
 
;(function(win){

	var indexedDB = win.indexedDB || win.webkitIndexedDB || win.mozIndexedDB || win.msIndexedDB;
	var hasError = function(e){
		console.log("数据存储失败！",e);
	};
	
	var MyDB = function( dbName , tableName ,version){
		// dbName and tableName is required
		if( !dbName || !tableName || dbName=="" || tableName=="")throw("give me a DBName and TableName");
		
		var getStor = function( callBack){
			callBack = callBack || function(){};
			var request = !version ? indexedDB.open(dbName):indexedDB.open(dbName,version);
			request.onsuccess = function(evt){
				var os = evt.target.result.transaction(tableName,"readwrite").objectStore(tableName);
				callBack(os);
			};
			request.onerror = hasError;
			request.onupgradeneeded = function(evt){
				evt.currentTarget.result.createObjectStore(tableName);
			};
		};
		//get a value
		this.get = function(key , callBack ){
			getStor(function(stor){
				var req = stor.get( key );
				req.onsuccess = function( e ){ callBack && callBack( e.target.result ,e);};
				req.onerror = function(e){ callBack && callBack( e ); };
			});
		};
		//set a key-value
		this.set = function(key , value , callBack){
			getStor(function(stor){
				var req = stor.put( value, key );
				req.onsuccess = function( e ){callBack && callBack( e.target.result , e ); };
				req.onerror = function(e){ callBack && callBack( e);  };
			});
		};
		//delete a obj 
		this.delete = function(key,callBack){
			getStor(function(stor){
				var req = stor.delete( key );
				req.onsuccess = function( e ){ callBack && callBack( e.target.result ,e);};
				req.onerror = function(e){ callBack && callBack( e ); };
			});
		};
		
		//get all data from table
		this.getAll = function(callBack){
			var data={};
			getStor(function(stor){
				var req = stor.openCursor();
				req.onsuccess = function(e) {
					var result = e.target.result;
					if( result ){
						data[result.key]=result.value;
						result.continue()
					}else{
						callBack && callBack(data);
					}
				};
			});
		};
		//do more thing width this function
		this.getStor = function(callBack){
			getStor(callBack);
		};
	};
	//export
	win.MyDB = MyDB;
})(this);
