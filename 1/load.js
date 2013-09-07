(function(){
	if (window.$JQ)return;
	window.$JQ = true;
	var sc = document.createElement("script");
	sc.src = BASE + "jquery.js";
	document.body.appendChild(sc);
	sc.onload = function(){
		$.getScript(BASE+"jquery.plugin.js");
		if( window.location.href.indexOf("weibo.com") != -1 ){
			$.getScript(BASE+"app/sinaimage.js");
		}
	};
	sc.onerror = function(e){alert("load jq error" )};
})();

//javascript: void((function(s) { if(window.$JQ$)return; window.BASE = s ? "http://gtbcode.sinaapp.com/js/" : "http://lcs.com/sae/gtbcode/1/js/" ;var d = document, e = d.createElement('script'); e.setAttribute('charset', 'UTF-8'); e.setAttribute('src', BASE+'../load.js?_='+new Date()*1); (d.head||d.body).appendChild(e); })());