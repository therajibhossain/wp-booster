<?php
/*Core class*/
if (!defined('ABSPATH')) {
    exit();
}

use WPBoosterConfig as config;

class WPBooster
{
    const INIT_EARLIAR_PRIORITY = -1;
    const DEFAULT_HOOK_PRIORITY = 2;

    /*version string*/
    protected $version = null;
    /*filepath string*/
    protected $filepath = null;

    /**
     * WPBooster constructor.
     * @param $version
     * @param $filepath
     */
    public function __construct($version, $filepath)
    {
        //add_action('wp_print_scripts', array($this, 'fb_urls_of_enqueued_stuff'));
        //die;


        $this->version = $version;
        $this->filepath = $filepath;
        new WPBoosterSetting();
//        add_action('init', array($this,'set_location_trading_hour_days')); //sets the default trading hour days (used by the content type)
//        add_action('init', array($this,'register_location_content_type')); //register location content type
//        add_action('add_meta_boxes', array($this,'add_location_meta_boxes')); //add meta boxes
//        add_action('save_post_wp_locations', array($this,'save_location')); //save location
//        add_action('admin_enqueue_scripts', array($this,'enqueue_admin_scripts_and_styles')); //admin scripts and styles
//        add_action('wp_enqueue_scripts', array($this,'enqueue_public_scripts_and_styles')); //public scripts and styles
//        add_filter('the_content', array($this,'prepend_location_meta_to_content')); //gets our meta data and dispayed it before the content

        register_activation_hook($this->filepath, array($this, 'plugin_activate')); //activate hook
        register_deactivation_hook($this->filepath, array($this, 'plugin_deactivate')); //deactivate hook
        register_uninstall_hook($this->filepath, 'WPBooster::plugin_uninstall'); //deactivate hook
    }




    //add_action('wp_print_scripts', 'fb_urls_of_enqueued_stuff');
    public function fb_urls_of_enqueued_stuff($handles = array())
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


    public function plugin_activate()
    {
        foreach (config::option_name() as $item) {
            update_option($item, null);
        }
        $this->do_actions('active');
    }

    public function plugin_deactivate()
    {
        $this->do_actions('de-active');
    }

    public static function plugin_uninstall()
    {
        foreach (config::option_name() as $item) {
            if (get_option($item) != false) {
                delete_option($item);
            }
        }
    }

    private function do_actions($status)
    {
        new WPBoosterCompression($status);
    }

    public
    function run()
    {
        $this->add_hooks();

        $checker = new WPBCacheChecker();
        $checker->run();
    }

    protected
    function add_hooks()
    {

        if (!defined('WPB_SETUP_INITHOOK')) {
            define('WPB_SETUP_INITHOOK', 'plugins_loaded');
        }
        add_action(WPB_SETUP_INITHOOK, [$this, 'setup']);
        add_action(WPB_SETUP_INITHOOK, [$this, 'hook_page_cache_purge']);

        $wpbSetupDone = 'wpb_setup_done';
        add_action($wpbSetupDone, [$this, 'version_upgrades_check']);
        add_action($wpbSetupDone, [$this, 'check_cache_and_run']);
        add_action($wpbSetupDone, [$this, 'maybe_run_wpb_extra']);
        add_action($wpbSetupDone, [$this, 'maybe_partners_tab']);
        add_action($wpbSetupDone, [$this, 'maybe_criticalcss_tab']);


        add_action('init', [$this, 'load_textdomain']);
        add_action('admin_init', ['PAnd', 'init']);

        register_activation_hook($this->filepath, [$this, 'on_activate']);
    }

    public
    function on_activate()
    {
        register_uninstall_hook($this->filepath, 'WPBooster::on_uninstall');
    }

    public
    function load_textdomain()
    {
        load_plugin_textdomain('wp - booster');
    }

    public
    function setup()
    {
        /*do we gzip in php when caching or is the webserver doing it?*/
        $wpbCacheNoZip = 'WPB_CACHE_NOGZIP';
        define($wpbCacheNoZip, (bool)WPBOptionWrapper::get_option(strtolower($wpbCacheNoZip)));

        /*These can be overwritten by specifying them in wp-config.php or such*/

        if (!define($wpbWpContentName = 'WPB_WP_CONTENT_NAME')) {
            define($wpbWpContentName, wp_basename(WP_CONTENT_DIR));
        }

        if (!define($wpbCacheChildDir = 'WPB_CACHE_CHILD_DIR')) {
            define($wpbCacheChildDir, ' / cache / wpbooster');
        }

        if (!define($wpbCacheFilePrefix = 'WPB_CACHE_FILE_PREFIX')) {
            define($wpbCacheFilePrefix, 'wpbooster_');
        }

        /*Note: trailing slash is not optional!*/
        if (!define($wpbCacheDir = 'WPB_CACHE_DIR')) {
            define($wpbCacheDir, WPBCache::get_pathname());
        }

        $strLen = strlen(WP_CONTENT_DIR) - strlen(WPB_WP_CONTENT_DIR);
        define('WP_ROOT_DIR', substr(WP_CONTENT_DIR, 0, $strLen));

        if (!defined($wpbWpSiteUrl = 'WPB_WP_SITE_URL')) {
            if (function_exists('domain_mapping_siteurl')) {
                define($wpbWpSiteUrl, domain_mapping_siteurl(get_current_blog_id()));
            } else {
                define($wpbWpSiteUrl, site_url());
            }
        }

        if (!defined($wpbWpContentUrl = 'WPB_WP_CONTENT_URL')) {
            if (function_exists('get_original_url')) {
                define($wpbWpContentUrl, str_replace(get_original_url($wpbWpSiteUrl)));
            } else {
                define($wpbWpContentUrl, content_url());
            }
        }

        if (!defined($wpbCacheUrl = 'WPB_CACHE_URL')) {
            if (is_multisite() && apply_filters('wpb_separate_blog_caches', true)) {
                $blog_id = get_current_blog_id();
                define($wpbCacheUrl, $wpbWpContentUrl . $wpbCacheChildDir . $blog_id . ' / ');
            } else {
                define($wpbCacheUrl, $wpbWpContentUrl . $wpbCacheChildDir);
            }
        }

        if (!defined($wpbWpRootUrl = 'WPB_WP_ROOT_URL')) {
            define($wpbWpRootUrl, str_replace($wpbWpContentName, '', $wpbWpContentUrl));
        }

        if (!defined($wpbHash = 'WPB_HASH')) {
            define($wpbHash, wp_hash($wpbCacheUrl));
        }

        if (!defined($wpbSiteDomain = 'WPB_SITE_DOMAIN')) {
            define($wpbSiteDomain, parse_url($wpbWpSiteUrl, PHP_URL_HOST));
        }

        $withMbString = apply_filters('wpb_filter_main_use_mbstring', false);
        WPBUtils::mbstring_available($withMbString ? \extension_loaded('mbstring') : false);

        do_action('wpb_setup_done');
    }

    public
    function version_upgrades_check()
    {
        WPBVersionUpdatesHandler::check_installed_and_update($this->version);
    }

    public
    function check_cache_and_run()
    {
        if (WPBCache::cacheavail()) {
            $conf = WPBConfig::instance();
            if ($conf->get('wpb_html') || $conf->get('wpb_js') || $conf->get('wpb_css') || WPBImages::imgopt_active() || WPBImages::should_lazyload_wrapper()) {
                if (!defined('WPB_NOBUFFER_OPTIMIZE')) {
                    /*Hook into WordPress frontend*/
                    if (defined('WPB_INIT_EARLIER')) {
                        add_action('init', [$this, 'start_buffering'], self::INIT_EARLIAR_PRIORITY);
                    } else {
                        if (!defined($wpbHookInto = 'WPB_HOOK_INTO')) {
                            define($wpbHookInto, 'template_redirect');
                        }
                        add_action(constant($wpbHookInto), [$this, 'start_buffering'], self::DEFAULT_HOOK_PRIORITY);
                    }
                }
                /*and disable jetpack's site accelerator if JS or css opt . are active */
                if (class_exists('Jetpack') && apply_filters('wpb_filter_main_disable_jetpack_cdn', true) && ($conf->get('wpb_js') || $conf->get('wpb_css'))) {
                    add_filter('jetpack_force_disable_site_accelerator', '__return_true');
                }
            }
        } else {
            add_action('admin_notices', 'WPBooster::notice_cache_unavailable');
        }
    }

    public
    function maybe_run_wpb_extra()
    {
        if (apply_filters('wpb_filter_extra_activate', true)) {
            $wpb_imgopt = new WPBImages();
            $wpb_imgopt->run();
            $wpb_extra = new WPBExtra();
            $wpb_extra->run();

            /*and show the imgopt notice*/
            add_action('admin_notices', 'WPBooster::notice_plug_imgopt');
        }
    }

    public
    function maybe_run_partners_tab()
    {
        /*load partners tab code if in admin (and not in admin-ajax.php)*/
        if (WPBConfig::is_admin_and_not_ajax()) {
            new WPBPartners();
        }
    }

    public
    function maybe_run_criticalcss_tab()
    {
        /*load criticalcss tab code if in admin (and not in admin-ajax.php)*/
        if (WPBConfig::is_admin_and_not_ajax() && !WPBUtils::is_plugin_active('wpbooster-criticalcss/wpb_criticss_aas.php')) {
            new WPBCriticalCSSSettings();
        }
    }

    public
    function hook_page_cache_purge()
    {
        /*hook into a collection of page cache purge actions if filter allows*/
        if (apply_filters('wpb_filter_main_hookpagecachepurge', true)) {
            $page_cache_purge_actions = [
                'after_rocket_clean_domain', //exists
                'hyper_cache_purged', //stefano confirmed this will be added
                'w3tc_flush_posts', //exists
                'w3tc_flush_all', //exists
                'ce_action_cache_cleared', //Sven confirmed this will be added
                'wpbce_action_cache_cleared', //some other cache enabler
                'comet_cache_wipe_cache', //still to be confirmed by Raam
                'wp_cache_cleared', //github.com/automattic/wp-super-cache/pull/537
                'wpfc_delete_cache', //Emre confirmed this will be added
                'swift_performance_after_clear_all_cache', //swift perf. yeah
                'wp_cache_flush', //wp-optimize
                'rt_ngix_helper_afterfastcgi_purge_all', //ngix helper
            ];
        }
    }
}