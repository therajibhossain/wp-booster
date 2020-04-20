<?php
/**
 * Copyright (C) Getweb, Inc. Ltd. All Rights Reserved
 *
 * Plugin Name: WP Booster
 * Plugin URI: https://getwebinc.com/plugins/wp-booster
 * Description: WP-Booster optimizes your site to make it faster & efficient
 * Version: 1.0.0
 * Author: Rajib Hossain, Team Getweb, Inc.
 * Author URI: https://getwebinc.com
 * Text Domain: wp-booster
 * Domain Path: /languages
 * License: GPL v2 or later
 * WP requires at least: 5.0.0
 *
 * WPBooster is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.

WPBooster is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with WPBooster. If not, see {License URI}.
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


if (PHP_VERSION < 5.6) {
    function incompatible_notice()
    {
        echo '<div class="error"><p>' . 'WPBooster requires at least PHP 5.6. Please upgrade PHP. The Plugin has been deactivated.' . '</p></div>';
    }

    add_action('admin_notices', 'incompatible_notice');
    wpBooster()->plugin_deactivate();
    return;
}


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