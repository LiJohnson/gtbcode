//sort
;(function(){
	var defaultCompareor = function( a , b ){ return a - b; };
	var exported = {};
	exported.swap = function(n,m){

		var tmp = this[n];
		this[n] = this[m];
		this[m] = tmp;
	};
	
	for( var k in exported  ){ Array.prototype[k]=exported[k]; }
})();
