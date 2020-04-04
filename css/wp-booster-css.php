<?php
// compress and merge CSS files
header('Content-type: text/css');
ob_start("compress");

function compress($buffer)
{
    $buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $buffer);
    $buffer = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $buffer);
    return $buffer;
}

include_once('wp-booster.css');
ob_end_flush();
