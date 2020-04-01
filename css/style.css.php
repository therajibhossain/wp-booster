<?php
//header('Content-type: text/css');
//ob_start("compress");
//
//    function compress( $minify )
//    {
//	    /* remove comments */
//    	$minify = preg_replace( '!/*[^*]**+([^/][^*]**+)*/!', '', $minify );
//
//        /* remove tabs, spaces, newlines, etc. */
//    	 $minify = str_replace( array("rn", "r", "n", "t", '  ', '    ', '    '), '', $minify );
//
//        return $minify;
//    }
//
//    /* css files for combining */
//    include('animate.css');
//    include('bootstrap.css');
//    include('bootstrap-rtl.css');
//
//ob_end_flush();

 // compress and merge CSS files
header('Content-type: text/css');
ob_start("compress");

function compress($buffer) {
	$buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $buffer);
	$buffer = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $buffer);
	return $buffer;
}


 include('front-end.css');
ob_end_flush();
