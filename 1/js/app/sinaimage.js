
var isPicuploadService  = window.location.host == "picupload.service.weibo.com";

!isPicuploadService && (function(){
    $("body").empty();
    
    var action = "http://picupload.service.weibo.com/interface/pic_upload.php?cb=http%3A%2F%2Fweibo.com%2Faj%2Fstatic%2Fupimgback.html%3F_wv%3D5%26callback%3DSTK_ijax_10086&url=0&markpos=1&marks=1&app=miniblog&s=rdxt";
    var getUUID = function(){ return "_"+Math.random().toString().substr(2); };
    var $tmp = $("<form method=post enctype='multipart/form-data' name=pic_upload ><input type=file name=pic1 /><input type=hidden name=nick /></form>").attr("action",action);
    var $nick = $("<textarea type=text name=nick  />").css("resize","both");
    
    $nick.val(window.$CONFIG && ("@"+window.$CONFIG.nick));
    var style = [];//
    
    style.push("<style>.img{margin-left: 10px;display: inline-block;}");
    style.push("form{display: inline-block;}");
    style.push("form input[type=file]{border-radius: 3px;border: 1px solid gray;height: 50px;background: rgb(230, 230, 230);}");
    style.push("</style>");
    $("body").append(style.join("\n"));
    
    var $formDiv = $("<div></div>").appendTo("body");$("body").append("<br>");
    var $contain = $("<div></div>").appendTo("body");
    
    var getSuffix = function( val ){
        val = val || ".png";
        var index = val.lastIndexOf ? val.lastIndexOf(".") : val.indexOf(".");
        return index != -1 ? val.substring( index ) : ".png";
    };

    var addImage = (function(){
        var i = 1 ;
        var getHost = function(){
            i = i % 4;
            i++;
            return "http://ww"+i+".sinaimg.cn/small/";
        };
        
        return function( pid ,name){
            var src = getHost() + pid + getSuffix(name);
            
            $("<div class=img ><a href='"+src.replace("small","large")+"' target=_blank > <img name="+name+" src="+src+" title='"+(new Date()).toString().match(/.+:\d+\s/)[0]+"' /></a><br><span>" + src + "<span></div>").appendTo($contain);
        };
    })();
    
    var addForm = function(){
        var id = getUUID();
        var $form = $tmp.clone();
		var $iframe = $("<iframe />");
        var $file = $form.find(":file");
        
		$form.attr("target",id);
		$iframe.css({position:"fixed",top:-1,left:-1,width:1,height:1}).attr({name:id,id:id});

		$file.change(function(){ $form.find("[name=nick]").val($nick.val()); $form.submit(); });
        
		$iframe.load(function(){ 
			var pid = false;
            $.log && $.log($iframe[0].contentWindow.location.search);
			$.each( $iframe[0].contentWindow.location.search.slice(1).split("&") , function(i,q){
				if( q.split("=")[0] == "pid") pid = q.split("=")[1];
			});
            
            if(pid)addImage(pid,$file[0] && $file[0].files && $file[0].files[0] && $file[0].files[0].name || $file.val());
            
            $file.val("");
		});

        $formDiv.append($form).append($iframe);
        return $form;
	};

   $formDiv.before($nick);
   $formDiv.before( $("<button style='padding: 3px;'>addForm</button>").click(addForm)); 
   addForm();  
   
   /****************/
   var $getHtml = $("<button>getHtml</button>");
   $getHtml.click(function(){
    var html = [];
    $("img").each(function(){
        html.push(this.outerHTML);
    });
    $("pre").text(html.join("\n"));

   });
   ($getHtml.add("<pre></pre>")).insertBefore("body");

})();


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
        xhr.open("POST","http://picupload.service.weibo.com/interface/pic_upload.php?app=miniblog&data=1&markpos=1&mime=image/png&ct=0.5098001323640347&nick="+$pageImage.val());
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
        reader.readAsArrayBuffer(file);

        return xhr;
    };

    var $pageImage = $("<textarea placeholder=pasteImage />").appendTo("body");
    var $file = $("<input type=file multiple=true />").appendTo("body");
    $("<button>getHtml</button>").appendTo("body").click(function(){
        var html = [];
        $("img").each(function(){
            html.push(this.outerHTML);
        });
        $pageImage.val( html.join("\n") );
    });
    var $list = $("<ul></ul>").appendTo("body");

    var uploadView = function(file){
        var $li = $("<li><div></div><a class=close href=javascript:;>&times;</a></li>");
        var xhr = imageUpload(file,function(data){
            var src = getSrc(data.pid , file.name);
            $li.find("a.close").remove();
            $li.find("div").html("<a href="+src.replace("small","large")+" target=_blank>"+src+"</a>" + "<img name='"+file.name+"' src='"+src+"' title='"+(new Date().toString().replace(/GMT.+$/,''))+"' />");
        },function(pre){
            pre = pre*100+"%";
            $li.find("div").css("width",pre).html(pre);
        });

        $li.find("a.close").click(function(){
            xhr.abort();
            $li.find("div").html("cancel");
        });
        $list.append($li);
    };

    $pageImage.getImage(function(data,file){
        uploadView(file);
    });

    $file.change(function(){
        for( var i = 0 , f ; f = this.files[i] ; i++ ){
            uploadView(f);
        }
        $file.val("");
    });
})();