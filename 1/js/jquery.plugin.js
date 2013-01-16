/**
 * created by lcs 2012-07-13 16:27:17
 * JQuery的 一些工具方法
 */

(function($){
	if(!$)return;
	
	//调试开关
	$.debug = !0;
	 
	/**
	 * 信息打印
	 * @param e
	 */
	$.log = function(e){
        try{
		$.debug && console && console.debug(e);
        }catch (e){}
	};
	
	/**
	 * 刷新页面
	 * @param s		[可选] s秒后刷新页面
	 * @param url	[可选] 跳到指定的url
	 */
	$.refresh = function(s,url){
		s = s  && s * 1000;
		s = s || 1;
		setTimeout(function(){ url? (window.location.href=url): window.location.reload();},s);
	};
	
	//重写jquery的$.ajax的函数
	$.myAjax = function(option){
		
		var _complete = option['complete'] ;
		option['complete'] = function( d1 ,d2 ){
			$.log([d1,d2,d1.responseText]);
			if(_complete)_complete(d1,d2 );
		};
		var _error = option['error'] ;
		option['error'] = function( d1 ,d2 ){
			//$.alertMessage(d1.status + " " + d1.statusText + " " + d2 );
			if(_error)_error(d1,d2 );
		};
		option.url = option.url || "";
		option.url +=( option.url.indexOf("?")==-1 ?"?_=" : "&_=")+(new Date()*1+Math.random().toString().substring(2));
		return $.ajax(option);
			
	};
	//重写jquery的$.post函数
	$.post = function ( url , data , success , dataType ){
		if($.isFunction(data)){dataType=dataType||success;success = data;data=undefined;}
		return $.myAjax({
			  type: 'POST',
			  url: url,
			  data: data,
			  success: success,
			  dataType: dataType
		});
	};
	
	//重写jquery的$.get函数
	$.get = function ( url , data , success , dataType ){
		if($.isFunction(data)){dataType=dataType||success;success = data;data=undefined;}
		return $.myAjax({
			  type: 'GET',
			  url: url,
			  data: data,
			  success: success,
			  dataType: dataType
		});
	};
	
	/**
	 * 格式化日期
	 * @param ms		时间戳(以毫秒为单位)，也可以是date类型数据
	 * @param format	[可选]时间格式,y:年 m:月 d:日 h:时 M:分 s:秒
	 * 					默认是"y-m-d h:M:s" =>2013-01-06 17:37:31
	 * @returns
	 */
	$.formatDate = function(ms,format){
		var _d = $.type(ms)=="date"? ms : new Date(Math.floor(ms));
		format = format?format: "y-m-d h:M:s";
		var _add0 = function(n){return n < 10 ? "0"+n:n;};
		var _= {};
		_.y = _d.getFullYear();
		_.m = _add0(_d.getMonth()+1);
		_.d = _add0(_d.getDate());
		_.h = _add0(_d.getHours());
		_.M = _add0(_d.getMinutes());
		_.s = _add0(_d.getSeconds());
		
		$.each(_,function(k,v){ format = format.replace(k,v); });
		return format;
		
	};	
	
	
		
	/**
	 * 信息提示，要要结合bootstrap使用
	 * @param message	信息内容
	 * @param id		[可选]标识Id
	 */
	$.alertMessage = function(message , id){		
		var alertMessage = $("body > #alertMessage");
		
		if(message == false){
			alertMessage.find("#"+id).remove();
			alertMessage.find("span").length == 0 && $("body").find("#alertMessage").remove();
			return;
		}
		
		$.type(message) == "string" &&( message = $("<span "+ (id?"id='"+id+"'":"") +">" + message + "<br></span>"));		
		if(!alertMessage.length){
			alertMessage = $("<div id='alertMessage' class='alert' style='z-index: 1000;position: fixed;top: 0; right: 0;'><a class='close' data-dismiss='alert'>×</a></div>");
			$("body").append(alertMessage);
		}
		else{
			if(id){
				alertMessage.find("span#"+id).remove();
			}
		}
		alertMessage.append(message);
	};
	
	/**
	 * 信息弹出窗口
	 * @param opt 	1. 为string,打印信息
	 * 				2. 为object，参数如下
					  {
					  	title:	string 		[可选] 窗口标题
					  	message:string		打印的信息
					  	ok:		function	[可选] 确定事件回调函数
					  	close:	function	[可选] 关闭事件回调函数
					  	cancel:	function	[可选] 取消事件回调函数
					  	timeout:int			[可选] 设定自动关闭
					  }
	 *	@param fun	一般在第一个参数opt为string时用，此时为相对应的关闭事件回调函数
	 *	
	 *	example:
	 *		$.box("hello world");
	 *		$.box("hello world",function(){alert("closed");});
	 *		$.box({message:"hi~ ",title:"HI",ok:function(){alert("ok");}});
	 *	
	 */
	
	$.box = (function(){
		var messageBox = $("<div class='modal hide fade' id='messageBox' style='display:none;overflow: hidden;' ><div class='modal-header' style='padding: 5px 15px;' ><a class='close' href=javascript: data-dismiss='modal' style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\" >×</a><h3 style='font-size: 13px;font-family: 微软雅黑, 黑体, sans-serif;'>对话框标题</h3></div><div class='modal-body'></div><div class='modal-footer' style='padding: 7px'><button class='btn' id=close >关闭</button><button class='btn' id=cancel >取消</button><button class='btn' id=ok >确定</button></div></div>");
		var clickOk = function(){};
		var clcikCancel = function(){};
		var clcikClose = function(){};
		var timeId = 0;
		messageBox.find("#ok").click(function(e){ clickOk(e); });
		messageBox.find("#cancel").click(function(e){ clcikCancel(e); clcikCancel = function(){}; });
		messageBox.find("#close").click(function(e){ clcikClose(e); clcikClose=function(){}; });
		messageBox.find(".modal-footer").find(".btn").click(function(){messageBox.modal('hide');});
		messageBox.on('hidden', function (){
			clcikCancel();
			clcikClose();
			timeId && clearTimeout(timeId);
			timeId = 0;
		});
		return function(opt,fun){
			if( opt == 'close' )return messageBox.modal('hide') ;
			$.type(opt) == "string" && (opt={message:opt,close:fun});
			opt = opt||{};
			opt.title = opt.title||"消息";
			opt.message = opt.message || opt.html || "";
			
			if(  !$.fn.modal 
				|| ($.browser.msie && $.browser.version < 7 ) //ie6  好厉害
				||  messageBox.css("display") == "block"){ //已经打开
				if( opt.ok || opt.cancel ){
					confirm(opt.message)?opt.ok&&opt.ok():opt.cancel&&opt.cancel();
				}else{
					alert(opt.message);
					opt.close && opt.close();
				}		
				return;
			}
			
			clcikCancel = opt.cancel || function(){};
			clcikClose = opt.close || function(){};
			clickOk = opt.ok || function(){};
			
			messageBox.find("h3").html(opt.title);
			messageBox.find(".modal-body").html(opt.message);
			
			if( opt.ok || opt.cancel ){
				 messageBox.find("#ok").show();
				 messageBox.find("#cancel").show();
				 messageBox.find("#close").hide();
			}
			else{
				 messageBox.find("#ok").hide();
				 messageBox.find("#cancel").hide();
				 messageBox.find("#close").show();
			}
			timeId = 0;
			if( $.isNumeric(opt.timeout) ){
				var _ = function(){
					messageBox.find("h3").html(opt.title + " <span style='color:red'> "+opt.timeout+"秒自动关闭后</span>");
					if(opt.timeout > 0 ){
						timeId = setTimeout(_,1000);
					}
					else{
						messageBox.modal('hide');
					}
					opt.timeout--;
				};
				_();
			}
			
			messageBox.modal("show");

		};
		
	})();

	/**
	 * 背景遮罩
	 * @param [可选]	打印信息
	 */
	$.back =(function(){
		var html = '<div class=animate style="padding-top: 15%; color: #fff; font-size: 100px; text-align: center; width: 100%; height: 100%; position: fixed; top: 0; left: 0; background-color: rgb(0, 0, 0);opacity: 0.8;filter: alpha(opacity=80);display:none; "><span style=" margin-top: 50%;"></span></div>';
		var $html = $(html);
		return function(text){
			if( !text || text == 'close' ){
				return $html.hide();
			}
			!$html.parent().length && $("body").append($html);
			$html.show().find("span").html(text);
			return $html;
		};
	})();
	/**
	 * 异步提交当前节点里的所有 input、selest、textarea数据
	 * @param url 		发送请求地址
	 * @param callback  (可选)Function 发送成功时回调函数。
	 * @param type 		(可选)String  返回内容格式，xml, html, script, json, text, _default。
	 */
	$.fn.postData = function(url, data , callback , type) {
		if(typeof(data) == "function"){type = callback;callback = data ; data=!1;}
		
		if(this.check())
			return $.post(url , $(this).getPostData(data) , callback,(type == undefined ? 'json' : type));
	};

	$.fn.getPostData = function(data , formateType){
		var _postData = new $();
		this.each(function(){
			var _this = $(this);
			_postData = _postData.add(this.elements ? $.makeArray(this.elements) : _this.add(_this.find("input")).add(_this.find("select")).add(_this.find("textarea")));
		});
		formateType = formateType==undefined?true:formateType;
		return (data?$.param(data, formateType )+"&":"")+ $.param(_postData.serializeArray(),formateType);
	};
	
	
})(window.jQuery);




//输入验证
(function($){
	if(!$)return;
	var _inputError = function(_input , b , message){
		var checkClass = _input.parents(".control-group:eq(0)");
		checkClass =  checkClass.length == 0 ? _input.parent(".inp"):checkClass;
		checkClass =  checkClass.length == 0 ? _input:checkClass;
		
		var checkMessge = _input.parent(".inp").length == 0 ? _input : _input.parent(".inp");
		
		var messageError = message||_input.attr("check-message");
		var messageOK = message||_input.attr("check-ok");
		
		checkMessge.nextAll("[check-result]").remove();
		var html = false;
		if(b){
			checkClass.removeClass("error");
			checkClass.addClass("success");
			if( messageOK ){
				html = $(messageOK);
				html = html[0]?html:$("<span class='help-inline'>"+messageOK+"</span>");				
			}
		}
		else{
			checkClass.addClass("error");
			checkClass.removeClass("success");
			
			if(messageError){
				var html = $(messageError);
				html = html[0]?html:$("<span class='help-inline'>"+messageError+"</span>");
			}
		}
		if(html){
			html.attr("check-result","");
			var _class = checkMessge.attr("class");
			if( _class && _class.indexOf("inp") != -1 ){
				while( checkMessge.next().length == 1 ){ checkMessge = checkMessge.next(); }
			}
			checkMessge.after(html);
		}		
	};
	$.fn.checkResult = function(b,message){ 
		_inputError(this,b,message);
	};
	$.fn.check = function(){
		var _inputs = this.find("input");
		var _textarea = this.find("textarea");
		for( var _i = 0 ; _i < _textarea.length ; _i++)
			_inputs.push(_textarea[_i]);
		
		for( var _i = 0 ; _i < this.length ; _i++){
			var tname =this[_i].tagName.toLowerCase();
			(tname=="input" || tname == "textarea") && 	_inputs.push(this[_i]);
		}
		
		var result = true ;
		for( var _i = 0 ; _i < _inputs.length ; _i++) {
			var _input = $(_inputs[_i]);
			var checkType = _input.attr("check-type");
			var checkReg  = _input.attr("check-reg");
			var tmp = true ;
			
			if(checkReg)tmp = tmp &&  _input.checkRegexp(new RegExp(checkReg));
			if(checkType)tmp = tmp && _input.checkRegexp(checkType);			
			tmp = tmp && _input.checkLength();
			
			_inputError(_input,tmp);			
			
			result = result &&  tmp;
		}
		
		return result ;
	};
	//计算string长度，汉字长度为2
	$.strLen = function(str){
		str = str || "";
		return str.length + (str.match(/[^\x00-\xff]/g)||[]).length;
	};
	$.fn.checkLength = function(min,max){
		var result = true ;
		for( var _i = 0 ; _i < this.length ; _i++) {
			var _input = $(this[_i]);
			var checkLen = _input.attr("check-len");
			var val = (_input.val() || "");
			val = "".trim?val.trim():val;
			var len = $.strLen(val);
			var tmp = true;
			if(checkLen){
				checkLen = checkLen.split("-");
				min = min || Math.floor(checkLen[0]);
				max = max || Math.floor(checkLen[1]);
				
			}
			tmp = ( !$.isNumeric(min) || len >= min  )&&( !$.isNumeric(max) || len <= max ); 
			
			_inputError(_input,tmp);				
			
			result = result && tmp;
		}
		return result;
	};
	$.fn.checkRegexp = function(type){ 
		if(this.length == 0 )return true;
		
		var reg ;
		
		if( type == 'officePhone' ){
			reg = /^0\d{2,3}(-)?[1-9]\d{6,7}$/;
		}
		else if( type == 'mobilePhone' ){
			reg = /^1[3|4|5|8]\d{9}$/ ;
		}
		else if( type == 'email' ){
			reg = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i ;
		}
		else if( type == 'num' ){
			reg = /(^[1-9]\d*$)|(^0+[1-9]+\d*$)/;
		}
		else if( type == 'realNum' ){
			reg = /^\d+(\.\d+)?$/ ;
		}
		else if( $.type(type) === "regexp" ){
			reg = type ;
		}
		else {
			return false ;
		}
		
		var b = true ;
		for( var i = 0 ; i < this.length ; i=i+1 ){
			var a = reg.test($(this[i]).val());
			_inputError($(this[i]),a);
			b = b && a ;
		}
		return b ;
		//if( type ==  )
	};
	
	$.fn.bindCheckEvent = function(){
		$(this).find("[check-trigger]").each(function(){
			var _this = $(this);
			var _trigger = _this.attr("check-trigger").split(",");
			for( _i = 0 ; _i < _trigger.length ; _i++ ){
				_this.bind(_trigger[_i],function(){_this.check();});
			}
		});
	};
	$(function(){
		$("body").bindCheckEvent();
		//$("[check-trigger]").bind('blur',function(){_this.check();});
	});
})(window.jQuery);

//上传文件
;(function($){
	if(!$)return;
	var getId = function(){return "_"+(new Date().getTime())+(Math.random()+"").substring(2);};
	var _style = false&&$.debug?"position:absolute;right:0px;bottom:0px;":"position:absolute;top:-10000px;left:-10000pxpx;opacity:0;.filter:alpha(opacity=0)";
	var createIframe = function(id){
		return _iframe = $("<iframe style='"+_style+"' id='"+id+"' name='"+id+"' src='javascript:;'></iframe>");
	};
	var createForm = function(id , inputFile){
		var _form = $("<form method='POST' enctype='multipart/form-data' id='"+id+"' style='"+_style+";margin-right: 300px;' ><input type=submit /></form>");
		var _tmpInputs = [];
		inputFile.each(function(){
			if(this.type && this.type.toUpperCase() =="FILE" )
				var _this = $(this);
				var _tmp = _this.clone();
				_tmp.attr("disabled",true);
				_tmpInputs.push(_tmp);				
				_this.before(_tmp);
				_form.append(_this);
		});
		_form.tmpInput = _tmpInputs;
		return _form;
	};
	
	/**
	 * @param url 上传文件url
	 * @param callback 	[可选] 上传完成后的回调函数
	 * @param type		[可选] 返回数据类型
	 */
	$.fn.uploadFile = function(url , callback , type ){
		callback = callback||function(){};
		type = type||'json';
		
		var _id = getId();
		var _iframeId = "_iframe"+_id;
		var _formId = "_form"+_id;
		var _iframe = createIframe(_iframeId);
		var _form = createForm(_formId,this);
		
		_form.attr("action",url);
		_form.attr("target",_iframeId); 
		
		$("body").append(_iframe);
		$("body").append(_form);
		_iframe.on("load",function(e){
			var data ={};
			var _body = (_iframe[0].contentWindow&& _iframe[0].contentWindow.document.body )||(_iframe[0].contentDocument&&_iframe[0].contentDocument.body)||{};
			
			data = _body.textContent||_body.innerHTML;
			//data.Xml = _body.XMLDocument;
			if( type == 'json' )try{data =  $.parseJSON(data);}catch (e) {}
			if( type == 'xml' )try{data =  $.parseJSON(data);}catch (e) {}
						
			$.each(_form.tmpInput,function(i,_input){
				_input.before( _form.find("input[name="+_input.attr("name")+"]") );
				_input.remove();
			});
			_iframe.remove();
			_form.remove();
			callback(data);
		});
		_form.submit();
		
	};
})(window.jQuery);

//cookie 的相关操作
(function($){ 
	if(!$)return;
	
	$.cookie = {
		get:function(key){
			var c = document.cookie+";";
			var _start = c.indexOf(key+"=");
			var _end = _start==-1?-1:c.indexOf(";",_start);
			return escape(c.substring(_start,_end).split("=")[1]);
		},
		set:function(key,value,option){
			option = option || {};
			option.path = option.path ||  $.sc.frontPath;
			var tmp = "";
			$.each(option , function(k,v){
				tmp += ";"+k+"="+v;
			});
			document.cookie=key+"="+escape(value)+tmp;
			return document.cookie;
		}
	};
	
})(window.jQuery);

(function($){
	if(!$)return;
	$.fn.drag = function(option){
	if( $.type(option) == 'string' )option = {handle:$(option)};
	option = option||{};
	var _drags = this;
	var _z_index = 1 ;
	this.length > 1 && (option.handle = false);
	for( var i = this.length -1 ; i >= 0 ; i-- )
	(function(_this){
		var _lock = false , _oldX , _oldy;
		var _thisOffset = _this.offset();
		var _parentOffset = _this.offsetParent().offset();
		var _handle = option.handle?$(option.handle):_this;
		var _left = _thisOffset.left-_parentOffset.left;
		var _top = _thisOffset.top-_parentOffset.top;
		_this.css({position:'absolute' , left: _left , top: _top});
		
		_handle.mousedown(function(e){
			_lock=true;
			_oldX = false;
			_oldY = false;
			//var _this = $(this);
			var tmp = _this.css('z-index');
			var p = _this.position();
			_left = p.left;
			_top  = p.top;
			$.isNumeric(tmp) && tmp > _z_index && ( _z_index = Math.floor(tmp));
			_this.css('z-index',_z_index++);
			return false;
		})
		.mouseup(function(e){_lock=false;})
		.mouseover(function(e){_lockd=false;})
		.mousemove(function(e){
			if(!_lock)return e;
			
			_left += _oldX==false?0:(e.clientX-_oldX);
			_top  += _oldY==false?0:(e.clientY-_oldY);
			_this.css({left:_left,top:_top});
			
			_oldX = e.clientX;
			_oldY = e.clientY;
			return false;
		});
		$("body").mousemove(function(e){
			if(!_lock)return e;
			
			_left += _oldX==false?0:(e.clientX-_oldX);
			_top  += _oldY==false?0:(e.clientY-_oldY);
			_this.css({left:_left,top:_top});
			
			_oldX = e.clientX;
			_oldY = e.clientY;
			return false;
		});
		
	})($(this[i]));
	return _drags;
	
}

$.fn.zoom = function(){
	
	var fn = function( e ){
		e = e.originalEvent||{};
		var s = e.wheelDelta || e.detail ;//e['wheelDelta']!= undefined ?e['wheelDelta']:-e['detail'];
		var eventX =  e.offsetX || e.layerX ;
		var eventY =  e.offsetY || e.layerY ;
		
		var oldPosition = $(this).position();
		
		var oldHeight = $(this).height() ;
		var oldWidth  = $(this).width() ;
		if( s > 0 ) // 上
		{
			s = 1.1 ;
		}
		else	//下
		{
			s = 0.9 ;
		}
	
		$(this).height(oldHeight * s);
		$(this).width( oldWidth  * s);
		$(this).css("top" , (oldPosition.top + eventY*(1-s)) + "px");
		$(this).css("left" , (oldPosition.left+ eventX*(1-s)) + "px");
		
		return false ;
		
	} ; 
	
	this.bind("DOMMouseScroll" , fn );
	this.bind("mousewheel" , fn );
	return this;
};

$.fn.rotate = function(deg){
	deg = $.isNumeric(deg)?deg:0;
	var css = {};
	if( $.browser.msie){
		css.filter= "progid:DXImageTransform.Microsoft.BasicImage(Rotation="+(Math.floor((deg/90)))%4+")" ;
	}
	if( $.browser.opera ){
		css['-o-transform']="rotate("+deg+"deg)";
	}
	if( $.browser.mozilla  ){
		css['-moz-transform']="rotate("+deg+"deg)";

	}
	if( $.browser.safari || $.browser.webkit){
		css['-webkit-transform']="rotate("+deg+"deg)";
	}
	this.css(css);
	this.attr("rotate",deg);
	return this;
};

})(window.jQuery);


//设置&获取表单的值
(function($){
	if( !$ || $.fn.setData )return;
	
	$.fn.setData = function(data){
		var _this = $(this);
		$.each(data , function(name,value){
			try{
			_this.find("input[name="+name+"]:not([type=radio],[type=checkbox])").val(value);
			_this.find("textarea[name="+name+"]").val(value);
			
			_this.find("select[name="+name+"] option[value="+value+"]").attr("selected",true);
			_this.find("input[name="+name+"][type=radio][value="+value+"]").attr("checked",true);
			_this.find("input[name="+name+"][type=checkbox][value="+value+"]").attr("checked",true);
			}catch (e) {
			
			}
		});
		return _this;
	};
	
	$.fn.getData = function(){
		var data = {};
		this.find("[name]").each(function(){
			var _this = $(this);
			data[_this.attr("name")] = _this.val();
		});
		return data;
	};
})(window.jQuery);

//设置html
(function($){
	if( !$ )return;
	$.fn.setHtml = function(data){
		var $this = this;
		$.each( data , function(k,v){
			$this.find("[html-"+k+"]").html(v);
		});
		return $this;
	};
})(window.jQuery);

//异步运行
(function($){
	if( !$ || $.asy )return;
	var lastId = 0;
	//var lastFun = null;
	$.asy = function(fun , time ,repeat){
		if( "stop" == fun && lastId ){
			clearInterval(lastId);clearTimeout(lastId);
			lastId = 0;
		}
		if( repeat ){
			return lastId = setInterval(fun , time);
		}
		else{
			return lastId = setTimeout(fun , time);
		}
	};
})(window.jQuery);

//计算string长度，汉字长度为2
(function(){
	String.prototype.len = function(){return this.length + (this.match(/[^\x00-\xff]/g)||[]).length;};	
})();
