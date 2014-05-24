
var isPicuploadService  = window.location.host == "picupload.service.weibo.com";
isPicuploadService && (function(){
	$("body").empty();
	$("body").append("<style>ul{width:500px;list-style: none;} li{width:100%;background:rgb(231, 227, 227);height:30px;margin-top:3px;position:relative;} ul li div{background:rgb(211, 235, 211);height:100%;} li img{max-height: 32px;max-width: 30px;}</style>");
	$("body").append("<style>li a.close{position:absolute;top:0;right:0;}</style>");
	var getSrc = (function(){
		var i = 1 ;
		var getHost = function(){
			i = i % 4;
			i++;
			return "http://ww"+i+".sinaimg.cn/small/";
		};
		return function( pid ,name){
			var src = getHost() + pid + ((name||"").match(/\.\w{3,4}$/)||[".png"])[0];
			return src;
		};
	})();

	var imageUpload = function(file , cb , progress){
		var xhr = new XMLHttpRequest();
		var reader = new FileReader();
		xhr.open("POST","http://picupload.service.weibo.com/interface/pic_upload.php?app=miniblog&data=1&markpos=1&mime=image/png&ct=0.5098001323640347&nick="+encodeURIComponent($html.find("textarea").val()));
		//logo=&nick=%40%E7%9B%9B321&marks=1&url=0
		xhr.upload.addEventListener("progress",function(e){              
				progress && progress.call(xhr,e.loaded/e.total , e);
		},false);

		xhr.onprogress = function(e){$.log(xhr.status,e);};
		xhr.onerror = function(e){
		};
		xhr.onload = function(){
			var data = eval("("+xhr.responseText.match(/\{.+$/)[0]+")");
			$.log( data );
			cb && cb.call(xhr,data.data.pics.pic_1);
		};
		reader.onload = function(){
			xhr.send(reader.result);    
		};
		//reader.readAsArrayBuffer(file);
		xhr.send(file); 
		return xhr;
	};

	var $html = $("<div><input type=file multiple=true /><button>getHtml</button><br><textarea placeholder=pasteImage style='width:90%;height:100px;' /></div>").appendTo("body");


	 $html.find("button").click(function(){
		var html = [];
		$("img").each(function(){
			html.push(this.outerHTML);
		});
		var getTime = function(img){
			return (img.match(/time:\d+/)||[""])[0].replace("time:","")*1 || 0;
		};
		html.sort(function(a,b){
			return getTime(a) - getTime(b);
		});
		$html.find("textarea").val( html.join("\n") );
	});

	var $list = $("<ul></ul>").appendTo("body");

	var uploadView = function(file,exifData){
		var $li = $("<li><div></div><a class=close href=javascript:;>&times;</a></li>");
		var xhr = imageUpload(file,function(data){
			var src = getSrc(data.pid , file.name);
			$li.find("a.close").remove();
			$li.find("div").html("<a href="+src.replace("small","large")+" target=_blank>"+src+"</a>" + "<img name='"+file.name+"' src='"+src+"' title='"+(new Date().toString().replace(/GMT.+$/,''))+"' />");

			getExifData(file,function(exifData,file){
				exifData && exifData.GPS && $li.find("img").attr("data-gps",JSON.stringify( $.extend( {time:new Date((exifData.DateTimeOriginal||"").replace(":","-").replace(":","-") )*1},exifData.GPS  ) ).replace(/"/g,''));
			});
		},function(pre){
			pre = (pre*100).toFixed(2)+"%";
			$li.find("div").css("width",pre).html(pre);
		});

		$li.find("a.close").click(function(){
			xhr.abort();
			$li.find("div").html("cancel");
		});
		$list.append($li);
	};

	$html.find(":file,textarea").getFile(function(file,files){
		for( var i = 0 , f ; f =  files[i] ; i++ ){            
			uploadView(f);
		}
	});
})();