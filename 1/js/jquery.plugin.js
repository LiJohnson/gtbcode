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
	$.log = (function(){
		var f = function(){};
		if( window.console && window.console.debug ){
			f = function(){
				$.debug && window.console.debug.apply(window.console,arguments);
			};
		}else{/*
			var $de = $('<div debug="" style="display:none;position: fixed; _position: absolute; right: 0;    bottom: 0;    width: 300px;    height: 100px;    background: white;    border: 1px solid;    overflow: scroll;"></div>');
			var line = 0;
			f = function(e , de){
			    if( $de.parent().length == 0 )$de.appendTo("body");
			    if( e == "hide" )return $de.hide();
			    
			    $de.show().append(++line +  " : ").append(e).append("<br>").scrollTop(~(1<<31));
			};
		*/	
		}
		return  f;
	})();
	
	/**
	 * 刷新页面
	 * @param s		[可选] s秒后刷新页面
	 * @param url	[可选] 跳到指定的url
	 */
	$.refresh = function(s,url){
		if( $.type(s) == "string" ){url = s ; s = 0.1;}
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
			if( 'parsererror' == d2 )option['success'](d1.responseText);
			if(_error)_error(d1,d2 );
		};
		
		option.url = option.url || "";
		option.url +=( option.url.indexOf("?")==-1 ?"?_" : "&_")+(new Date()*1+Math.random().toString().substring(2));
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
			  dataType: dataType||'json'
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
			  dataType: dataType||'json'
		});
	};
	
	/**
	 * 格式化日期
	 * @param ms		时间戳(以毫秒为单位)，也可以是date类型数据
	 * @param format	[可选]时间格式,y:年 m:月 d:日 h:时 M:分 s:秒
	 * 					默认是"y-m-d h:M:s" =>2013-01-06 17:37:31
	 *
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
	 * 信息提示，要结合bootstrap使用
	 * @param message	信息内容
	 * @param id		[可选]标识Id
	 */
	$.alertMessage = (function(){
		var $alertMessage = $("<div class='alert' style='z-index: 1000;position: fixed;top: 0; right: 0;'><a class='close' data-dismiss='alert'>×</a></div>");
		var total = 30;
		return function(message , id){
			if( message == 'close' ){
				return $alertMessage.remove();
			}
			
			if( $alertMessage.parent().length == 0 ){
				$alertMessage.find("span").remove();
				$("body").append($alertMessage);
			}
			var $span = false;
			if( id ){
				$span = $alertMessage.find("span#"+id);
				$span = $span.length > 0 && $span;
			}
			
			if( !$span ){
				$span = $("<span "+ (id?"id='"+id+"'":"") +"></span>");
				$alertMessage.append($span);
			}
			$span.html(message+"<br>");

			var count = $alertMessage.find(">span").length - total;
			if( count > 0 ){
				$alertMessage.find(">span:lt("+count+")").remove();
			}
			
		};
	})(); 
	
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
	 *	说明：若没有引入bootstrap项目，弹出窗口为浏览器自带的
	 */
	$.browser = $.browser || {};
	$.box = (function(){		
		var messageBox = $("<div class='modal hide fade' id='messageBox' style='display:none;overflow: hidden;' ><div class='modal-header' style='padding: 5px 15px;' ><a class='close' href=javascript: data-dismiss='modal' style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\" >×</a><h3 style='font-size: 13px;font-family: 微软雅黑, 黑体, sans-serif;'>对话框标题</h3></div><div class='modal-body'></div><div class='modal-footer' style='padding: 7px'><button class='btn' id=close >关闭</button><button class='btn' id=cancel >取消</button><button class='btn' id=ok >确定</button></div></div>");
		var clickOk = function(){};
		var clcikCancel = function(){};
		var clcikClose = function(){};
		var timeId = 0;
		messageBox.find("#ok").click(function(e){ clickOk(e) != false && messageBox.modal('hide') ;clcikCancel = function(){}; });
		messageBox.find("#cancel").click(function(e){ clcikCancel(e) != false && messageBox.modal('hide'); clcikCancel = function(){}; });
		messageBox.find("#close").click(function(e){ clcikClose(e) != false && messageBox.modal('hide'); clcikClose=function(){}; });
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
			
			return messageBox.modal("show");
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
/**
 *	html:
	<form>
	<input id=test check-trigger="blur focus change" check-len="1-20" check-reg="\\d+" check-type="num" check-message="wrong" check-ok="ok" />
	<input check-type=email check-message="not a eamai" />
	<textarea check-trigger=blur check-len=1 check-ok="ok" />
	</form>
 *	check-trigger 	: 事件，多个事件用空格隔开
 *	check-len		: 输入长度，格式可为:"n"(或"n-m")，分别表示输入长度大于等于n(或大于等于n且小于等于m)
 *	check-type		: 数据输入类型：可为email、num等;
 *	check-reg		: 数据校验正则
 *	check-message	: 校验错误时打印的信息
 *	check-ok		: 校验正确时打印的信息
 *	check-target	: jquery selector,指定信息打印的地方
 *	
 *	手动调用：var res = $("#test").check();	
 *			  res = $("form").check(); 		//校验form表单下的所有数据
 *	check方法返回boolean类型数据
 */

(function($){
	if(!$)return;

	//计算string长度，汉字长度为2
	var strLen = function(str){
		str = str || "";
		return str.length + (str.match(/[^\x00-\xff]/g)||[]).length;
	};

	var checkType = {
			officePhone : /^0\d{2,3}(-)?[1-9]\d{6,7}$/,
			mobilePhone : /^1[3|4|5|8]\d{9}$/,
			email		: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
			num			: /(^[1-9]\d*$)|(^0+[1-9]+\d*$)/,
			realNum		: /^\d+(\.\d+)?$/,
			url			: /^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
	};
	var _checkRange = function($input,range){
		if( !range )return true;
		var result = false;
		var num = $input.val()*1;
		range = range.split("~");
		if( $.isNumeric( range[0] ) ){
			result = num >= range[0];
			if( result && $.isNumeric( range[1] ) ){
				result = num <= range[1];
			}
		}else if($.isNumeric( range[1] ) ){
			result = num <= range[1];
		}
		return result;
	};
	$.fn.checkResult = function( check ,message){
		var _input = $(this);
		var html = false;
		var checkMessge = _input.parent(".inp").length == 0 ? _input : _input.parent(".inp");
		var checkClass = _input.parents(".control-group:eq(0)");
		var target = $(_input.attr("check-target"));
		
		checkClass =  checkClass.length == 0 ? _input.parent(".inp"):checkClass;
		checkClass =  checkClass.length == 0 ? _input:checkClass;
		
		checkMessge.nextAll("[check-result]").remove();
		target.empty();
		
		if( check == undefined ){
			return checkClass.removeClass("error success");
		}else if(check){
			checkClass.removeClass("error").addClass("success");
			message = message||_input.attr("check-ok");
		}
		else{
			checkClass.addClass("error").removeClass("success");
			message =  message||_input.attr("check-message");			
		}
		
		if( message ){
			html = $(message);
			html = html[0]?html:$("<span class='help-inline'>"+message+"</span>");
		}
		
		
		if(html){
			html.attr("check-result","");
			if( target.length > 0 ){
				target.html(html);
			}
			else{
				var _class = checkMessge.attr("class");
				if( _class && _class.indexOf("inp") != -1 ){
					while( checkMessge.next().length == 1 ){ checkMessge = checkMessge.next(); }
				}
				checkMessge.after(html);
			}
		}
		return this;
		
	};
	$.fn.check = function( callBack ){
		callBack = callBack || function(){};
		
		var $this = $(this);
		var $inputs = $this.filter("input,textarea").add($this.find("input,textarea"));		
		var result = true ;
		$inputs.each(function(index,input){
			var $input = $(input);
			var checkType = $input.attr("check-type");
			var checkReg  = $input.attr("check-reg");
			var checkRange = $input.attr("check-range");
			var check = true ;
			
			if(checkReg) check = check &&  $input.checkRegexp(new RegExp(checkReg));
			if(checkType)check = check && $input.checkRegexp(checkType);			
			if(checkRange)check = check && _checkRange($input,checkRange);			
			check = check && $input.checkLength();			
			
			callBack( $input ,check  ) != false && $input.checkResult(check);
			result = result && check;
		});
		
		return result ;
	};
	
	$.fn.checkLength = function(min,max){
		var result = true ;
		for( var _i = 0 ; _i < this.length ; _i++) {
			var _input = $(this[_i]);
			var checkLen = _input.attr("check-len");
			var val = (_input.val() || "");
			val = "".trim?val.trim():val;
			var len = strLen(val);
			var tmp = true;
			if(checkLen){
				checkLen = checkLen.split("-");
				min = min || Math.floor(checkLen[0]);
				max = max || Math.floor(checkLen[1]);
				
			}
			tmp = ( !$.isNumeric(min) || len >= min  )&&( !$.isNumeric(max) || len <= max ); 
			
			result = result && tmp;
		}
		return result;
	};
	
	$.fn.checkRegexp = function(type){ 
		if(this.length == 0 )return true;
		
		var reg = checkType[type] || type ;
		if( $.type(reg) != "regexp" ){
			return false ;
		}
		
		var b = true ;
		for( var i = 0 ; i < this.length ; i=i+1 ){
			var a = reg.test($(this[i]).val());
			b = b && a ;
		}
		return b ;
		
	};
	
	$.fn.bindCheckEvent = function(cb){
		$(this).find("[check-trigger]").each(function(){
			var $this = $(this);
			var trigger = $this.attr("check-trigger");
			$this.off( trigger );
			$this.on( trigger,function(){ $this.check(cb);});
		});
	};
	$(function(){
		$(document).delegate("[check-trigger]","click focus mouseover",function(){
			var $this = $(this);
			var trigger = $this.attr("check-trigger");
			$this.off( trigger );
			$this.on( trigger,function(){ $this.check();});
			$this.attr("check-trigger-delegated",trigger);
			$this.removeAttr("check-trigger");
		});
		
		$(document).delegate("[check-len],[check-type],[check-reg]","focus",function(){ $(this).checkResult() })
		$(document).delegate("[check-len],[check-type],[check-reg]","blur",function(){ $(this).check( function( $input , res ){ if( $input.val()=="" && !res )return false; } ); })
	});
})(window.jQuery);


//上传文件
;(function($){
	if(!$)return;
	
	if( window.FormData && window.XMLHttpRequest && new window.XMLHttpRequest().upload && $("<input type=file>")[0].files ){
		/*********************************************/
		//新时代的文件异步上传
		
		/**
		 * @param url 上传文件url
		 * @param data 		[可选] 提交的数据
		 * @param callback 	[可选] 上传完成后的回调函数
		 * @param progress 	[可选] 进度
		 * @param type		[可选] 返回数据类型
		 */
		$.fn.uploadFile = function(url , data , cb , progress, type){
			if( $.type(data) == 'function' ){
				type = progress;
				progress = cb;
				cb = data;
				data = {};
			}
			if( $.type(progress) != 'function' ){
				var t = type;
				type = progress;
				progress = t;
			}
			if( $.type(progress) != 'function' ){
				progress = function(){};
			}
			
			type = type || 'json';

			var formData = new FormData();
			var xhr = new XMLHttpRequest();
			this.filter(":file").add(this.find(":file")).each(function(){
				formData.append(this.name,this.files[0]);
			});

			$.each(data,function(k,v){
				formData.append(k,v);
			});

			xhr.upload.addEventListener("progress",function(e){
				progress(e.loaded/e.total , e);
			},false);

			xhr.addEventListener("load",function(e){
				if( !cb )return;
				var data = xhr.response;
				if( type == 'json' ){
					try{data = $.parseJSON(data);}catch (e) {}
				}else if( type == 'xml' ){
					try{data = $.parseXML(data);}catch (e) {}
				}else if( type == 'html' ){
					try{data = $.parseHTML(data);}catch (e) {}
				}
				cb(data,e);
			},false);
			
			this.abortUpload = function(){
				xhr.abort();
			};
			
			xhr.addEventListener("error",function(e){},false);			
			xhr.open("POST", url);  
			xhr.send(formData);
			return this;
		};
		
		return;
	}
	
	/*********************************************/
	//古代的伪异步上传
	var getId = function(){return "_"+(new Date().getTime())+(Math.random()+"").substring(2);};
	var _style = "position:absolute;top:-10000px;left:-10000pxpx;opacity:0;.filter:alpha(opacity=0)";
	var createIframe = function(id){
		return $frame = $("<iframe style='"+_style+"' id='"+id+"' name='"+id+"' src='javascript:;'></iframe>");
	};
	var createForm = function(id , $inputFile , data){
		var $form = $("<form method='POST' enctype='multipart/form-data' id='"+id+"' style='"+_style+";margin-right: 300px;' ><input type=submit /></form>");
	
		$inputFile.each(function(){
			var $this = $(this);
			 $this.before($this.data("clone"));
			 $form.append($this);
		});
		$.each(data||{},function(k,v){
			$form.append($("<input type=hidden >").attr({name:k,value:v}));
		});
		
		return $form;
	};
	
	/**
	 * @param url 上传文件url
	 * @param data 		[可选] 提交的数据
	 * @param callback 	[可选] 上传完成后的回调函数
	 * @param progress 	[可选] 伪进度
	 * @param type		[可选] 返回数据类型
	 */
	$.fn.uploadFile = function(url , data , callback , progress, type){
		var $this = $(this);
		if( $.type(data) == 'function' ){
			type = progress;
			progress = callback;
			callback = data;
			data = {};
		}
		if( $.type(progress) != 'function' ){
			var t = type;
			type = progress;
			progress = t;
		}
		if( $.type(progress) != 'function' ){
			progress = function(){};
		}
		
		callback = callback||function(){};
		type = type||'json';
		
		var $files = this.filter(":file").each(function(){
			var $this = $(this);
			var $clone = $this.clone().attr("disabled",true);
			$clone.data("this",$this);
			$this.data("clone",$clone);
		});
		
		var id = getId();
		var iframeId = "_iframe"+id;
		var formId = "_form"+id;
		var $iframe = createIframe(iframeId);
		var $form = createForm(formId, $files , data);
		var timeId = 0;
		$form.attr({action:url,target:iframeId});
		
		$("body").append($iframe);
		$("body").append($form);
		
		$iframe.on("load",function(e){
			var data = $(this).contents().find('body').html();
			
			if( type == 'json' )try{data =  $.parseJSON(data);}catch (e) {}
			if( type == 'xml' )try{data =  $.parseXML(data);}catch (e) {}
			
			$files.each(function(){
				var $this = $(this);
				$this.data("clone").before($this);
				$this.data("clone").remove();
			});
			
			setTimeout(function(){
				$iframe.remove();
				$form.remove();
			},300);
			$this.abortUpload = function(){};
			clearInterval(timeId);
			progress(1);
			callback(data);
		});
		
		//伪进度
		var per = 0;
		timeId = setInterval(function(){
			per += Math.random()*0.05;
			per < 1 ? progress(per) : clearInterval(timeId);
		}, 90);
		
		$form.submit();
		
		$this.abortUpload = function(){
			$files.each(function(){
				var $this = $(this);
				$this.data("clone").before($this);
				$this.data("clone").remove();
			});
			$iframe.remove();
			$form.remove();
		};
		
		return $this;
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

//拖动、放大、旋转
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
		}).mouseup(function(e){_lock=false;});
		
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
	deg = deg*1 || 0;
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
	
	$.fn.setData = function(data,key){
		var _this = $(this);
		$.each(data ||{}, function(name,value){
			try{
				name = "name='" + ( key ? key+"."+name : name ) + "'";
				_this.find("input["+name+"]:not([type=radio],[type=checkbox]),textarea["+name+"],select["+name+"]").val(value);
				
				_this.find("input["+name+"][type=radio][value="+value+"]").attr("checked",true);
				_this.find("input["+name+"][type=checkbox][value="+value+"]").attr("checked",true);
			}catch (e){}
		});
		return _this;
	};
	
	$.fn.getData = function(){
		var data = {};
		this.find("[name]:not([type=radio],[type=checkbox])").each(function(){
			var _this = $(this);
			data[_this.attr("name")] = _this.val();
		});
		this.find("[name][type=radio]:checked,[name][type=checkbox]:checked").each(function(){
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

/**
 * 以粘贴或拖拽的形式获取图片(文件)
 */
(function($){
	$.fn.getImage = function(cb){
		var $this = this;
		if( !window.FileReader )return this;
		
		$this.getFile(function(file){
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload =function(e){
				/^data:image.+/.test(reader.result) && cb && cb.call && cb.call($this,reader.result,file);
			};
		});

		return $this;
	};

	$.fn.getFile = function(cb){
		if(!$.isFunction(cb))return this;

		var $this = $(this);
		$this.on("paste",function(e){
			if( e.originalEvent.clipboardData && e.originalEvent.clipboardData.items && e.originalEvent.clipboardData.items[0] ){
				var file = e.originalEvent.clipboardData.items[0].getAsFile();
				cb.call($this,file , [file]);
			}
			return e;
		}).on("dragenter",function(e){
			$this.addClass("drag");
		}).on("dragleave",function(e){
			$this.removeClass("drag");
		}).on("drop",function(e){
			$this.removeClass("drag");
			var file = e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files && e.originalEvent.dataTransfer.files[0];
			cb.call($this,e.originalEvent.dataTransfer.files[0] , e.originalEvent.dataTransfer.files);
			e.preventDefault();
		}).filter(":file").change(function(){
			if( this.files && this.files.length > 0 ){
				cb.call($this,this.files[0],this.files);
			}
		});

		return this;
	};
})(window.jQuery);


/*
(function(){
	//计算string长度，汉字长度为2
	String.prototype.len = function(){return this.length + (this.match(/[^\x00-\xff]/g)||[]).length;};	
	//Array.indexOf
	if(!Array.indexOf)Array.prototype.indexOf=function(r){for(var b=0;b<this.length;b++)if(this[b]==r)return b;return-1};
})();

(function($){
	if( !$ || $.fn.modal )return;
	$(function(){ (($("head").length && $("head"))||$("body")).append('<style>.modal-open .modal .dropdown-menu{z-index:2050}.modal-open .modal .dropdown.open{*z-index:2050}.modal-open .modal .popover{z-index:2060}.modal-open .modal .tooltip{z-index:2080}.modal-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:1040;background-color:#000}.modal-backdrop.fade{opacity:0}.modal-backdrop,.modal-backdrop.fade.in{opacity:.8;filter:alpha(opacity=80)}.modal{position:fixed;top:50%;left:50%;z-index:1050;width:560px;margin:-250px 0 0 -280px;overflow:auto;background-color:#fff;border:1px solid #999;border:1px solid rgba(0,0,0,0.3);*border:1px solid #999;-webkit-border-radius:6px;-moz-border-radius:6px;border-radius:6px;-webkit-box-shadow:0 3px 7px rgba(0,0,0,0.3);-moz-box-shadow:0 3px 7px rgba(0,0,0,0.3);box-shadow:0 3px 7px rgba(0,0,0,0.3);-webkit-background-clip:padding-box;-moz-background-clip:padding-box;background-clip:padding-box}.modal.fade{top:-25%;-webkit-transition:opacity .3s linear,top .3s ease-out;-moz-transition:opacity .3s linear,top .3s ease-out;-o-transition:opacity .3s linear,top .3s ease-out;transition:opacity .3s linear,top .3s ease-out}.modal.fade.in{top:50%}.modal-header{padding:9px 15px;border-bottom:1px solid #eee}.modal-header .close{float:right;margin-top:2px}.modal-header h3{margin:0;line-height:30px}.modal-body{max-height:400px;padding:15px;overflow-y:auto}.modal-form{margin-bottom:0}.modal-footer{padding:14px 15px 15px;margin-bottom:0;text-align:right;background-color:#f5f5f5;border-top:1px solid #ddd;-webkit-border-radius:0 0 6px 6px;-moz-border-radius:0 0 6px 6px;border-radius:0 0 6px 6px;*zoom:1;-webkit-box-shadow:inset 0 1px 0 #fff;-moz-box-shadow:inset 0 1px 0 #fff;box-shadow:inset 0 1px 0 #fff}.modal-footer:before,.modal-footer:after{display:table;line-height:0;content:""}.modal-footer:after{clear:both}.modal-footer .btn+.btn{margin-bottom:0;margin-left:5px}.modal-footer .btn-group .btn+.btn{margin-left:-1px}.fade{opacity:0;-webkit-transition:opacity .15s linear;-moz-transition:opacity .15s linear;-o-transition:opacity .15s linear;transition:opacity .15s linear}.fade.in{opacity:1}.close{float:right;font-size:20px;font-weight:bold;line-height:20px;color:#000;text-shadow:0 1px 0 #fff;opacity:.2;filter:alpha(opacity=20)}.close:hover{color:#000;text-decoration:none;cursor:pointer;opacity:.4;filter:alpha(opacity=40)}.btn{display:inline-block;*display:inline;padding:4px 14px;margin-bottom:0;*margin-left:.3em;font-size:14px;line-height:20px;*line-height:20px;color:#333;text-align:center;text-shadow:0 1px 1px rgba(255,255,255,0.75);vertical-align:middle;cursor:pointer;background-color:#f5f5f5;*background-color:#e6e6e6;background-image:-webkit-gradient(linear,0 0,0 100%,from(#fff),to(#e6e6e6));background-image:-webkit-linear-gradient(top,#fff,#e6e6e6);background-image:-o-linear-gradient(top,#fff,#e6e6e6);background-image:linear-gradient(to bottom,#fff,#e6e6e6);background-image:-moz-linear-gradient(top,#fff,#e6e6e6);background-repeat:repeat-x;border:1px solid #bbb;*border:0;border-color:rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25);border-color:#e6e6e6 #e6e6e6 #bfbfbf;border-bottom-color:#a2a2a2;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;filter:progid:dximagetransform.microsoft.gradient(startColorstr="#ffffffff",endColorstr="#ffe6e6e6",GradientType=0);filter:progid:dximagetransform.microsoft.gradient(enabled=false);*zoom:1;-webkit-box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05);box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05)}.btn:hover,.btn:active,.btn.active,.btn.disabled,.btn[disabled]{color:#333;background-color:#e6e6e6;*background-color:#d9d9d9}.btn:active,.btn.active{background-color:#ccc \9}.btn:first-child{*margin-left:0}.btn:hover{color:#333;text-decoration:none;background-color:#e6e6e6;*background-color:#d9d9d9;background-position:0 -15px;-webkit-transition:background-position .1s linear;-moz-transition:background-position .1s linear;-o-transition:background-position .1s linear;transition:background-position .1s linear}.btn:focus{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}.btn.active,.btn:active{background-color:#e6e6e6;background-color:#d9d9d9 \9;background-image:none;outline:0;-webkit-box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05);box-shadow:inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05)}.btn.disabled,.btn[disabled]{cursor:default;background-color:#e6e6e6;background-image:none;opacity:.65;filter:alpha(opacity=65);-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none}.btn-large{padding:9px 14px;font-size:16px;line-height:normal;-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px}.btn-large [class^="icon-"]{margin-top:2px}.btn-small{padding:3px 9px;font-size:12px;line-height:18px}.btn-small [class^="icon-"]{margin-top:0}.btn-mini{padding:2px 6px;font-size:11px;line-height:17px}</style>'); });
	!function(a){a(function(){a.support.transition=function(){var a=function(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},c;for(c in b)if(a.style[c]!==undefined)return b[c]}();return a&&{end:a}}()})}(window.jQuery),!function(a){var b=function(b,c){this.options=c,this.$element=a(b).delegate('[data-dismiss="modal"]',"click.dismiss.modal",a.proxy(this.hide,this)),this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};b.prototype={constructor:b,toggle:function(){return this[this.isShown?"hide":"show"]()},show:function(){var b=this,c=a.Event("show");this.$element.trigger(c);if(this.isShown||c.isDefaultPrevented())return;this.isShown=!0,this.escape(),this.backdrop(function(){var c=a.support.transition&&b.$element.hasClass("fade");b.$element.parent().length||b.$element.appendTo(document.body),b.$element.show(),c&&b.$element[0].offsetWidth,b.$element.addClass("in").attr("aria-hidden",!1),b.enforceFocus(),c?b.$element.one(a.support.transition.end,function(){b.$element.focus().trigger("shown")}):b.$element.focus().trigger("shown")})},hide:function(b){b&&b.preventDefault();var c=this;b=a.Event("hide"),this.$element.trigger(b);if(!this.isShown||b.isDefaultPrevented())return;this.isShown=!1,this.escape(),a(document).off("focusin.modal"),this.$element.removeClass("in").attr("aria-hidden",!0),a.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var b=this;a(document).on("focusin.modal",function(a){b.$element[0]!==a.target&&!b.$element.has(a.target).length&&b.$element.focus()})},escape:function(){var a=this;this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.modal",function(b){b.which==27&&a.hide()}):this.isShown||this.$element.off("keyup.dismiss.modal")},hideWithTransition:function(){var b=this,c=setTimeout(function(){b.$element.off(a.support.transition.end),b.hideModal()},500);this.$element.one(a.support.transition.end,function(){clearTimeout(c),b.hideModal()})},hideModal:function(){var a=this;this.$element.hide(),this.backdrop(function(){a.removeBackdrop(),a.$element.trigger("hidden")})},removeBackdrop:function(){this.$backdrop.remove(),this.$backdrop=null},backdrop:function(b){var c=this,d=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var e=a.support.transition&&d;this.$backdrop=a('<div class="modal-backdrop '+d+'" />').appendTo(document.body),this.$backdrop.click(this.options.backdrop=="static"?a.proxy(this.$element[0].focus,this.$element[0]):a.proxy(this.hide,this)),e&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in");if(!b)return;e?this.$backdrop.one(a.support.transition.end,b):b()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,b):b()):b&&b()}};var c=a.fn.modal;a.fn.modal=function(c){return this.each(function(){var d=a(this),e=d.data("modal"),f=a.extend({},a.fn.modal.defaults,d.data(),typeof c=="object"&&c);e||d.data("modal",e=new b(this,f)),typeof c=="string"?e[c]():f.show&&e.show()})},a.fn.modal.defaults={backdrop:!0,keyboard:!0,show:!0},a.fn.modal.Constructor=b,a.fn.modal.noConflict=function(){return a.fn.modal=c,this},a(document).on("click.modal.data-api",'[data-toggle="modal"]',function(b){var c=a(this),d=c.attr("href"),e=a(c.attr("data-target")||d&&d.replace(/.*(?=#[^\s]+$)/,"")),f=e.data("modal")?"toggle":a.extend({remote:!/#/.test(d)&&d},e.data(),c.data());b.preventDefault(),e.modal(f).one("hide",function(){c.focus()})})}(window.jQuery);
})(window.jQuery);
*/