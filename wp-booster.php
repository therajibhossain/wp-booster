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

//add_action('wp_enqueue_scripts', function () {
//    wp_enqueue_script('jquery_lazy_load', WPBOOSTER_SCRIPTS . 'jquery.lazyload.min.js', array('jquery'));
//});
/*calling lazy oad*/
//add_action('wp_footer', function () {
//    echo '<script type="text/javascript">
//                    (function($){
//                      $("img.lazyload").lazyload();
//                    })(jQuery);
//                </script>';
//});


//add_filter('the_content', 'gs_add_img_lazy_markup', 15);  // hook into filter and use
//priority 15 to make sure it is run after the srcset and sizes attributes have been added.

function gs_add_img_lazy_markup($the_content)
{

    libxml_use_internal_errors(true);
    $post = new DOMDocument();
    $post->loadHTML($the_content);
    $imgs = $post->getElementsByTagName('img');

    $attr = 'data-original';
    // Iterate each img tag
    foreach ($imgs as $img) {

        if ($img->hasAttribute($attr)) continue;

        if ($img->parentNode->tagName == 'noscript') continue;

        $clone = $img->cloneNode();

        $src = $img->getAttribute('src');
        if (false === filter_var($src, FILTER_VALIDATE_URL)) {
            $src = $img->getAttribute('data-src');
        }

        $img->setAttribute('src', WPBOOSTER_URL . 'img/loader.gif');
        $img->setAttribute($attr, $src);

        $srcset = $img->getAttribute('srcset');
        $img->removeAttribute('srcset');
        if (!empty($srcset)) {
            $img->setAttribute('data-srcset', $srcset);
        }

        $imgClass = $img->getAttribute('class');
        $img->setAttribute('class', $imgClass . ' lazyload');

        $no_script = $post->createElement('noscript');
        $no_script->appendChild($clone);
        $img->parentNode->insertBefore($no_script, $img);
    }

    return $post->saveHTML();
}