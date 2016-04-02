$( function()
{
	var canvas = lcs ;
	var cxt = canvas.getContext("2d");
	cxt.translate( 200 , 200 );

	Vector3 = function(x,y,z){
		this.x = x ? x : 0 ;
		this.y = y ? y : 0 ;
		this.z = z ? z : 0 ; 
		this.length = function(){return Math.pow( this.x * this.x + this.y * this.y + this.z * this.z , 0.5);};
		this.LVector = function()
		{
			if( this.z != 0 )return new Vector3( 1 , 1 , -1*(this.x+this.y)/this.z);
			return new Vector3( 0 , 0 , 1 );
		};
		this.muti = function( v )
		{
			return this.x * v.x + this.y * v.y + this.z * v.z ;
		};
		this.add = function ( v )
		{
			this.x += v.x ;
			this.y += v.y ;
			this.z += v.z ;
			return this ;
		};
		this.sub = function( v )
		{
			return this.add( v.clone().zoom(-1) );
		};
		this.getCos = function( v )
		{
			return this.muti(v) / (v.length()*this.length());
		};
		this.zoom = function ( t )
		{
			this.x *= t ;
			this.y *= t ;
			this.z *= t ;

			return this ;
		}
		this.clone = function(){ return new Vector3( this.x , this.y , this.z ); };
	};

	var rote = function(  points , a , b )
	{
		var newPoint = [] ;
		for( i = 0 ; i < points.length ; i++ )
		{
			p = points[i] ;
			newPoint.push( new Vector3( p.x*Math.cos(a) + p.y*Math.sin(a) , p.y*Math.cos(a)-p.x*Math.sin(a) , p.z ) );
		}
		return newPoint ;
	}

	var getView = function getView( point , v , distance )
	{
		var newPoint = [];

		var cosX = -1*v.y / (Math.pow(v.x*v.x+v.y*v.y,0.5));
		var sinY = v.x / (Math.pow(v.x*v.x+v.y*v.y,0.5));

		var side = new Vector3( cosX , sinY , 0);

		var v2 = v.clone() ;
		v2.zoom( 1 - distance/v2.length() );
		//side.add(v2);

		for( i = 0 ; i < point.length ; i++ )
		{
			var p = point[i] ;
			var tmp = new Vector3( p.x - v.x , p.y - v.y , p.z - v.z );
			var len = tmp.length();
			var len2 = distance / Math.abs(v.getCos( tmp )) ;
			tmp.zoom(len2/len);

			tmp.add( v );
			tmp.sub( v2 );

			var cos = tmp.getCos( side );
			var z = tmp.z > 0 ? 1 : -1 ;
			newPoint.push( new Vector3( cos*tmp.length() , z*Math.pow( 1 - cos*cos, 0.5 )*tmp.length()  , 0 ) );

		}
		return newPoint;
	}

	var showPorint = function( viewPoint  )
	{

		cxt.fillStyle = "rgba(0, 0, 0, 1)";
        cxt.fillRect(-200, -200, canvas.width, canvas.height);

		cxt.fillStyle = "#fff";
		for( i = 0 ; i < viewPoint.length ; i++  )
		{
			cxt.fillRect( viewPoint[i].x , viewPoint[i].y , 5 , 5 );
		}
	}

	var point = [] ;
	var size = 150 ;
	for( var i = 0 ; i < 8 ; i++ )point.push( new Vector3(size*Math.pow(-1,i%2) , size*Math.pow(-1,(i>>1)%2) ,  size*Math.pow(-1,(i>>2)%2)  ));

	lcs.ang = 1 ;
	setInterval( function(){ showPorint( getView( rote(point,( (lcs.ang)* Math.PI/180)) , new Vector3(400,0,0) , 100 ) ); lcs.ang += 1;} , 30 );

} );