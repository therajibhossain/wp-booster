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
define('WPB_FILE', __FILE__);
//define('PLUGIN', 'WP Booster');

function wpBooster()
{
    static $wpBooster = null;
    if (null === $wpBooster) {
        $wpBooster = new WPBooster(WPB_VERSION, WPB_FILE);
    }
    return $wpBooster;
}

wpBooster();



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