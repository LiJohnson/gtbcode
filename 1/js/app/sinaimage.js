(function(){
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
            
            $("<div class=img ><a href='"+src.replace("small","large")+"' target=_blank > <img src="+src+" title='"+(new Date()).toString().match(/.+:\d+\s/)[0]+"' /></a><br><span>" + src + "<span></div>").appendTo($contain);
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
            
            if(pid)addImage(pid,$file.val());
            
            $file.val("");
		});

        $formDiv.append($form).append($iframe);
        return $form;
	};
    var paste = (function(){return;
        var $paste = $("<input type=text />");
         $formDiv.before($paste);
        $paste.on("paste",function(e){
            var item = e.originalEvent.clipboardData.items[0];
            if( item.type.indexOf("image") != -1 ){
                var r = new FileReader();
                var $form = addForm();
                r.onload =function(e){
                    $form.find(":file").remove();
                    $form.append($("<textarea name=pic1 />").val(r.result));
                    $form.submit();
                };
                r.readAsBinaryString(item.getAsFile());
            }
        });
        
    })();
   $formDiv.before($nick);
   $formDiv.before( $("<button style='padding: 3px;'>addForm</button>").click(addForm)); 
   addForm();  
    
})();