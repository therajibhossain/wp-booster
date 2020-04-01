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
define('WPB_VERSION', '1.0.0');
define('WPBOOSTER_DIR', plugins_url('wp-booster/'));
define('WPBOOSTER_STYLES', WPBOOSTER_DIR . 'css/');
define('WPBOOSTER_SCRIPTS', WPBOOSTER_DIR . 'js/');
define('WPB_FILE', __FILE__);
define('WPB_URL', plugins_url('wp-booster/'));


function wpBooster()
{
    static $wpBooster = null;
    if (null === $wpBooster) {
        $wpBooster = new WPBooster(WPB_VERSION, WPB_FILE);
    }
    return $wpBooster;
}

if (is_admin()) {
    wpBooster();
}


add_action("wp_head", function () {
    echo "\n";
    echo '<link rel="stylesheet" href="' . WPBOOSTER_STYLES . 'style.css.php' . '" type="text/css" media="screen" />';
    echo "\n";
});


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


add_action('wp_print_scripts', 'fb_urls_of_enqueued_stuff');
//add_action('admin_footer', 'fb_urls_of_enqueued_stuff');
function fb_urls_of_enqueued_stuff($handles = array())
{
    // Print Styles
    global $wp_scripts, $wp_styles;
    $sl = 0;
    foreach ($wp_styles->queue as $handle) {
        echo $sl++ . ". " . $handle . ": " . $wp_styles->registered[$handle]->src . "<br>";
    }
    echo '<hr>';
    return;


    global $wp_scripts, $wp_styles;
    global $wp_print_styles;

    $a = wp_print_styles();
    echo '<pre>', print_r($a), '</pre>';
    $i = 0;
    foreach ($wp_styles->registered as $registered) {
        echo $i++ . ". " . $registered->handle . ": " . $registered->src . "<br>";
        //echo '<pre>', print_r($registered), '</pre>';
    }

}


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

    add_filter('clean_url', 'uncoverwp_async_scripts', 11, 1);
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

    add_filter('clean_url', 'uncoverwp_defer_scripts', 11, 1);
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