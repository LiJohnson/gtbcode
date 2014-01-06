//sort
;(function(){
	var ex = Array.prototype;
	var defaultComparator = function( a , b ){ return a == b ? 0 : a - b ; };

	var Record = function( a , b , swap){ this.a = a ; this.b = b ; this.swap = !! swap; };
	ex.record = [];
	
	ex.swap = function(n,m){
		this.record.push( new Record( n , m , true ) );
		var tmp = this[n];
		this[n] = this[m];
		this[m] = tmp;
	};
	/**
	 * 冒泡排序
	 */
	ex.bubbleSort = function(compare ){

		compare = compare || defaultComparator ;
		
		for( var i = 0 ; i < this.length ; i++ ){
			for( var j = 0 , len = this.length - i - 1 ; j < len ; j++ ){
				if( compare( this[j] , this[j+1] ) > 0 ){
					this.swap(j,j+1);
				}
			}
		}
		
		return this;
	};
	/**
	 *	Straight Selection Sort
	 *	直接选择排序(打擂台)
	 */
	ex.straightSelectionSort = function( compare ){

		compare = compare || defaultComparator ;
		
		for( var i = 0 ; i < this.length ; i++ ){
			for( var j = 0 , last = this.length - i - 1 ; j < last ; j++ ){
				if( compare( this[j] , this[last] ) > 0 ){
					this.swap(j,last);
				}
			}
		}
		
		return this;
	};
	
	/**
	 * 插入排序
	 */
	ex.insertSort = function( compare ){
		compare = compare || defaultComparator ;
		
		for( var i = 1 ; i < this.length ; i++ ){
			for( var j = 0 ; j < i ; j++ ){
				if( compare( this[j] , this[i] ) > 0 ){
					for( var k = i ; k  > j ; k-- ){
						this.swap( k , k-1 );
					}
				}
			}
		}

		return this;
	};
	
	/**
	 *	快速排序
	 */
	ex.quickSort = (function(){
		var gCompare = null;
		var dePart = function(arr , start , end ){
			var mid = start;
			var val = arr[mid];
			start++;
			while( start < end ){
				while( start < end && gCompare( val , arr[start] ) > 0 )start++;
				while( start < end && gCompare( val , arr[end]   ) < 0 )end--;
				start != end && arr.swap(start,end);
				start < end && start++;
				start < end && end--;
			}
			if( gCompare(val , arr[start]) < 0  ){
				arr.swap(mid,start-1);
				return start-1;
			}else{
				arr.swap( mid , start );
				return start;
			}
		};
		var qsort = function( arr , start , end ){
			if( start < end ){
				var mid = dePart( arr , start , end );
				qsort( arr , start , mid-1 );
				qsort( arr , mid+1 , end );
			}
		};
		return function ( compare  ){

			gCompare = compare || defaultComparator ;
			qsort(this , 0 , this.length -1);

			return this;
		};

	})();
})();
