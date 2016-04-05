<?php
$expires_offset = 10000000;
$type = $_GET['type'];
$type = $type ? $type : 'js';
$compress = ( isset($_GET['c']) && $_GET['c'] );

if( $type == 'css' ){$path="css";}elseif( $type == 'js' || $type == 'javascript' ){$path="js";}else{echo 'unknown type';exit ;}

header('Content-Type: '.($type=='css'?'text/css':'application/x-javascript').'; charset=UTF-8');
header('Expires: ' . gmdate( "D, d M Y H:i:s", time() + $expires_offset ) . ' GMT');
header("Cache-Control: public, max-age=$expires_offset");

$out = '';
$files = isset($_GET['load']) && $_GET['load'];
if( $files ){
	$files = $_GET['load'];
	$files =preg_split("/,/",$files);
	foreach( $files as $file ){
		$out .= "/************************ begin $file ************************/\n";
		if(is_file($path .'/'.$file)){
			$out .= file_get_contents($path .'/'.$file)."\n";
		}else{
			$out .= "/************************ unknown $file : $type ************/\n\n";
		}
		$out .= "/************************ end $file ************************/\n\n";
	}
}



if ( $compress && ! ini_get('zlib.output_compression') && 'ob_gzhandler' != ini_get('output_handler') && isset($_SERVER['HTTP_ACCEPT_ENCODING']) ) {
	header('Vary: Accept-Encoding'); // Handle proxies
	if ( false !== stripos($_SERVER['HTTP_ACCEPT_ENCODING'], 'deflate') && function_exists('gzdeflate') ) {
		header('Content-Encoding: deflate');
		$out = gzdeflate( $out, 3 );
	} elseif ( false !== stripos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') && function_exists('gzencode') ) {
		header('Content-Encoding: gzip');
		$out = gzencode( $out."456", 3 );
	}
}

echo $out;
exit;
?>