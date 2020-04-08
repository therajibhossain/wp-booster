<?php
/*Core class*/
if (!defined('ABSPATH')) {
    exit();
}

use WPBoosterConfig as config;

class WPBooster
{
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
        $this->version = $version;
        $this->filepath = $filepath;

        register_activation_hook($this->filepath, array($this, 'plugin_activate')); //activate hook
        register_deactivation_hook($this->filepath, array($this, 'plugin_deactivate')); //deactivate hook
        register_uninstall_hook($this->filepath, 'WPBooster::plugin_uninstall'); //deactivate hook

        add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
        new WPBoosterSetting();
    }

    public function admin_scripts()
    {
        $file = WPBOOSTER_NAME . '-admin';
        wp_enqueue_style($file, WPBOOSTER_STYLES . "/$file.css");
        wp_enqueue_script($file, WPBOOSTER_SCRIPTS . "/$file.js", array('jquery'));
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
        $prefix = 'wpbooster';
        $other_options = array(
            $prefix . "_enqueued_scripts",
            $prefix . "_enqueued_styles",
            $prefix . "_src_combine_js",
            $prefix . "_src_combine_css",
        );
        foreach ($other_options as $item) {
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