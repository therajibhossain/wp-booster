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
define('WPBOOSTER_DIR', plugin_dir_path(__FILE__));
require_once WPBOOSTER_DIR . '/inc/autoload.php';

/*plugin environment variables*/
define('WPBOOSTER_VERSION', '1.0.0');
define('WPBOOSTER_NAME', 'wp-booster');
define('WPBOOSTER_FILE', plugin_basename(__FILE__));
define('WPBOOSTER_URL', plugins_url('wp-booster/'));
define('WPBOOSTER_STYLES', WPBOOSTER_URL . 'css/');
define('WPBOOSTER_SCRIPTS', WPBOOSTER_URL . 'js/');
define('WPBOOSTER_LOGS', WPBOOSTER_DIR . 'logs/');


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
} else {
    wpBoosterFront();
}