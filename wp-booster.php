<?php
/**
 * Copyright (C) Getweb, Inc. Ltd. All Rights Reserved
 *
 * Plugin Name: WP Booster - Optimize DB and Cache assets
 * Plugin URI: https://getwebinc.com/plugins/wp-booster
 * Description: WP-Booster optimizes your site to make it faster & efficient
 * Version: 1.0.0
 * Author: Rajib Hossain, Team Getweb, Inc.
 * Author URI: https://getwebinc.net
 * Text Domain: wp-booster
 * Domain Path: /languages
 * License: GPL v2 or later
 * WP requires at least: 5.0.0
 */

if (!defined('ABSPATH')) die('Direct access not allowed');
define('WPB_DIR', plugin_dir_path(__FILE__));
require_once WPB_DIR . '/inc/autoload.php';

/*plugin environment variables*/
define('WPBOOSTER_VERSION', '1.0.0');
define('WPBOOSTER_NAME', 'wp-booster');
define('WPBOOSTER_FILE', __FILE__);
define('WPBOOSTER_URL', plugins_url('wp-booster/'));
define('WPBOOSTER_STYLES', WPBOOSTER_URL . 'css/');
define('WPBOOSTER_SCRIPTS', WPBOOSTER_URL . 'js/');


function wpb_admin_scripts()
{
    wp_enqueue_script($js = 'wp-booster-admin', WPBOOSTER_SCRIPTS . "/$js.js", array('jquery'));
}

add_action('admin_enqueue_scripts', 'wpb_admin_scripts');

function wpBooster()
{
    static $wpBooster = null;
    if (null === $wpBooster) {
        $wpBooster = new WPBooster(WPBOOSTER_VERSION, WPBOOSTER_FILE);
    }
    return $wpBooster;
}

function wpBoosterFront()
{
    static $wpBooster = null;
    if (null === $wpBooster) {
        $wpBooster = new WPBoosterFrontend();
    }
    return $wpBooster;
}

if (is_admin()) {
    wpBooster();


//    $html = wp_remote_retrieve_body(wp_remote_get((home_url())));
//    echo $html;
} else {
    wpBoosterFront();
}
//add_action("wp_head", function () {
//    echo '<h1>rhossain.php</h1>';die;
//});




























//add_action("wp_head", function () {
//    echo "\n";
//    echo '<link rel="stylesheet" href="' . WPBOOSTER_STYLES . 'wp-booster-css.php' . '" type="text/css" media="screen" />';
//    echo "\n";
//});


//add_action('get_header', 'pt_html_minify_start');
function pt_html_minify_start()
{
//    ob_start( 'pt_html_minyfy_finish' );
    //ob_start( 'compress' );
}

function pt_html_minyfy_finish($html)
{
    $html = preg_replace('/<!--(?!s*(?:[if [^]]+]|!|>))(?:(?!-->).)*-->/s', '', $html);
    $html = str_replace(array("\r\n", "\r", "\n", "\t"), '', $html);
    while (stristr($html, '  '))
        $html = str_replace('  ', ' ', $html);
    return $html;
}


//add_action('wp_print_scripts', 'fb_urls_of_enqueued_stuff');
function fb_urls_of_enqueued_stuff($handles = array())
{
    // Print Styles
    global $wp_scripts, $wp_styles;
    $sl = 0;
    foreach ($wp_styles->queue as $handle) {
        if (isset($wp_styles->registered[$handle])) {
            //echo $sl++ . ". " . $handle . ": " . $wp_styles->registered[$handle]->src . "<br>";
        }

    }
    echo '<hr>';


    // Array of css files
    $cssList = array();

    $mergeCSS = "";
// Loop the css Array
    foreach ($wp_styles->queue as $handle) {
        // Load the content of the css file
        if (isset($wp_styles->registered[$handle])) {
            //echo $sl++ . ". " . $handle . ": " . $wp_styles->registered[$handle]->src . "<br>";
            $src = $wp_styles->registered[$handle]->src;
            //echo $sl++ . ". $src<br>";

            $explode = explode('/wp-content/', $src);
            if (isset($explode[1])) {
                $cssList [] = $file = WP_CONTENT_DIR . '/' . $explode[1];
                if (file_exists($file)) {
                    echo $sl++ . ". $file<br>";
                    $mergeCSS .= file_get_contents($file);
                }
            }


        }

    }

//19545 1805kb
    echo '<pre>', print_r($cssList), '</pre>';
    die;
    //exit();
// Remove comments also applicable in javascript
    $mergeCSS = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $mergeCSS);

// Remove space after colons
    $mergeCSS = str_replace(': ', ':', $mergeCSS);

// Remove whitespace
    $mergeCSS = str_replace(array("\n", "\t", '  ', '    ', '    '), '', $mergeCSS);

//Generate Etag
    $genEtag = md5_file($_SERVER['SCRIPT_FILENAME']);

// call the browser that support gzip, deflate or none at all, if the browser doest      support compression this function will automatically return to FALSE
//    ob_start('ob_gzhandler');
//
//// call the generated etag
//    header("Etag: " . $genEtag);
//
//// Same as the cache-control and this is optional
//    header("Pragma: public");
//
//// Enable caching
//    header("Cache-Control: public ");
//
//// Expire in one day
//    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 86400) . ' GMT');
//
//// Set the correct MIME type, because Apache won't set it for us
//    header("Content-type: text/javascript");
//
//// Set accept-encoding
//    header('Vary: Accept-Encoding');

// Write everything out
    $frontEnd = WP_PLUGIN_DIR . '/' . WPBOOSTER_NAME . '/css/front-end.css';
    echo $frontEnd . "<br>";
    //file_put_contents($frontEnd, $mergeCSS);
    if (file_exists($frontEnd)) {
        echo "exists: " . $frontEnd;
        file_put_contents($frontEnd, $mergeCSS);
    }
    echo($mergeCSS);
    die;

}

function inspect_scripts()
{
    global $wp_scripts;
    echo '<hr>js<pre>', print_r($wp_scripts->queue), '</pre>';
}

//add_action( 'wp_print_scripts', 'inspect_scripts' );

function inspect_styles()
{
    global $wp_styles;
    echo '<hr>css<pre>', print_r($wp_styles->queue), '</pre>';
}

//add_action( 'wp_print_styles', 'inspect_styles' );


/**
 * Print enqueued style/script handles
 * https://lakewood.media/list-enqueued-scripts-handle/
 */
function lakewood_print_scripts_styles()
{
    if (!is_admin() && is_user_logged_in() && current_user_can('manage_options')) {
        // Print Scripts
        global $wp_scripts;
        foreach ($wp_scripts->queue as $handle) :
            echo '<div style="margin: 5px 3%; border: 1px solid #eee; padding: 20px;">Script <br />';
            echo "Handle: " . $handle . '<br />';
            echo "URL: " . $wp_scripts->registered[$handle]->src;
            echo '</div>';
        endforeach;

        // Print Styles
        global $wp_styles;
        foreach ($wp_styles->queue as $handle) :
            echo '<div style="margin: 5px 3%; border: 1px solid #eee; padding: 20px; background-color: #e0e0e0;">Style <br />';
            echo "Handle: " . $handle . '<br />';
            //echo "URL: " . $wp_styles->registered[$handle]->src;
            echo '</div>';
        endforeach;
    }
}

//add_action('wp_print_scripts', 'lakewood_print_scripts_styles', 101);


function crunchify_print_scripts_styles()
{
    $a = wp_print_styles();
    //echo '<pre>', print_r($a), '</pre>';


    global $wp_styles;
    $srcs = array_map('basename', (array)wp_list_pluck($wp_styles->registered, 'src'));
    echo '<pre>', print_r(wp_list_pluck($wp_styles->registered, 'src')), '</pre>';
    // Print all loaded Scripts
}


//add_action('wp_print_scripts', 'crunchify_print_scripts_styles');


function pm_remove_all_scripts()
{
    if (in_array($GLOBALS['pagenow'], ['wp-login.php', 'wp-register.php']) || is_admin()) return; //Bail early if we're
    global $wp_scripts;
    $wp_scripts->queue = array();
}

//add_action('wp_print_scripts', 'pm_remove_all_scripts', 100);

function pm_remove_all_styles()
{
    if (in_array($GLOBALS['pagenow'], ['wp-login.php', 'wp-register.php']) || is_admin()) return; //Bail early if we're

    global $wp_styles;
    $wp_styles->queue = array();
}

//add_action('wp_print_styles', 'pm_remove_all_styles', 100);


if (!function_exists('uncoverwp_async_scripts')) :
    /**
     * Async scripts to improve performance
     */
    function uncoverwp_async_scripts($url)
    {
        if (strpos($url, '#asyncload') === false) {
            return $url;
        } else if (is_admin()) {
            return str_replace('?#asyncload', '', $url);
        } else {
            return str_replace('?#asyncload', '', $url) . "' async='async";
        }
    }

    // add_filter('clean_url', 'uncoverwp_async_scripts', 11, 1);
endif;
if (!function_exists('uncoverwp_defer_scripts')) :
    /**
     * Defer scripts to improve performance
     */
    function uncoverwp_defer_scripts($url)
    {
        if (strpos($url, '#deferload') === false) {
            return $url;
        } else if (is_admin()) {
            return str_replace('?#deferload', '', $url);
        } else {
            return str_replace('?#deferload', '', $url) . "' defer='defer";
        }
    }

//    add_filter('clean_url', 'uncoverwp_defer_scripts', 11, 1);
endif;

// Enqueue scripts
function uncoverwp_scripts()
{
    // async assets
    wp_enqueue_script('uncoverwp-plugins', get_template_directory_uri() . '/assets/js/plugins.min.js#asyncload', 'jquery', '', true);
    wp_enqueue_script('uncoverwp-application', get_template_directory_uri() . '/assets/js/application.min.js#asyncload', 'jquery', '', true);

    // defer assets
    wp_enqueue_script('uncoverwp-plugins', get_template_directory_uri() . '/assets/js/plugins.min.js#deferload', 'jquery', '', true);
    wp_enqueue_script('uncoverwp-application', get_template_directory_uri() . '/assets/js/application.min.js#deferload', 'jquery', '', true);
}
//add_action( 'wp_enqueue_scripts', 'uncoverwp_scripts');


/*checking the version*/
//if (PHP_VERSION < '7.0') {
//    function wpb_incompatible()
//    {
//        echo '<p class="danger error">' . PLUGIN . ' requires PHP 7.0 or higher, upgrade your version!</p>';
//        if (isset($_GET['activate'])) {
//            unset($_GET['activate']);
//        }
//        return;
//    }
//
//    function wpb_deactivate_self()
//    {
//        deactivate_plugins(plugin_basename(WPB_PLUGIN_FILE));
//        return;
//    }
//
//    add_action('admin_notices', 'wpb_incompatible');
//    add_action('admin_init', 'wpb_deactivate_self');
//    return;
//}
//
//function wpb_autoload($class)
//{
//    $php = '.php';
//    $includes = dirname(__FILE__) . '/includes/';
//    if (in_array($class, ['Minify_HTML', 'JSMin'])) {
//        $file = str_replace('_', '-', strtolower($class));
//        $path = dirname(__FILE__) . '/classes/external/php/';
//        $filepath = $path . $file . $php;
//    } elseif (false != strpos($class, $neelde = 'WPBooster\\tubalmartin\\CssMin')) {
//        $file = str_replace($neelde, '', $class);
//        $path = $includes . 'external/php/yui-php-cssmin-bundled/';
//        $filepath = $path . $file . $php;
//    } elseif ('wpb' === substr($class, 0, 3)) {
//        $file = $class;
//        $filepath = $includes . $file . $php;
//    } elseif ('PAnd' === $class) {
//        $file = 'persist-admin-notices-dismissal';
//        $path = $includes . '/external/php/persist-admin-notices-dismissal/';
//        $filepath = $path . $file . $php;
//    }
//
//    if (!$filepath)
//        return;
//    require $filepath;
//}
//
//spl_autoload_register('wpb_autoload');
//
//function wpb()
//{
//    static $wpb = false;
//    if (!$wpb) {
//        $wpb = new wpBooster(WPB_VERSION, WPB_PLUGIN_FILE);
//    }
//    return $wpb;
//}
//
//wpb()->run();