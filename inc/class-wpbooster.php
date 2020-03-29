<?php
/*Core class*/
if (!defined('ABSPATH')) {
    exit();
}


class WPBooster
{
    const INIT_EARLIAR_PRIORITY = -1;
    const DEFAULT_HOOK_PRIORITY = 2;

    /*version string*/
    protected $version = null;
    /*filepath string*/
    protected $filepath = null;
    private $_wpb_url = null;

    /**
     * WPBooster constructor.
     * @param $version
     * @param $filepath
     */
    public function __construct($version, $filepath)
    {
        $this->version = $version;
        $this->filepath = $filepath;
        $this->_wpb_url = plugins_url('wp-booster/');
//        add_action('plugins_loaded', '_mc4wp_load_plugin', 8);
        add_action('admin_menu', array($this, 'admin_menu'));
        //add_action('wp_ajax_wpb_update_setting', array($this, 'wpb_update_setting'));
        $my_settings_page = new WPBoosterSetting();

//        add_action('init', array($this,'set_location_trading_hour_days')); //sets the default trading hour days (used by the content type)
//        add_action('init', array($this,'register_location_content_type')); //register location content type
//        add_action('add_meta_boxes', array($this,'add_location_meta_boxes')); //add meta boxes
//        add_action('save_post_wp_locations', array($this,'save_location')); //save location
//        add_action('admin_enqueue_scripts', array($this,'enqueue_admin_scripts_and_styles')); //admin scripts and styles
//        add_action('wp_enqueue_scripts', array($this,'enqueue_public_scripts_and_styles')); //public scripts and styles
//        add_filter('the_content', array($this,'prepend_location_meta_to_content')); //gets our meta data and dispayed it before the content

        register_activation_hook($this->filepath, array($this, 'plugin_activate')); //activate hook
        register_deactivation_hook($this->filepath, array($this, 'plugin_deactivate')); //deactivate hook

    }

    public function plugin_activate()
    {

    }

    public function plugin_deactivate()
    {

    }




    public function admin_menu()
    {
        $function = array($this, 'admin_menu_page');
        $icon = $this->_wpb_url . 'images/icon.png';
        add_menu_page('WP Booster Settings', 'WP Booster', 'manage_options', 'wp-booster', $function, $icon, 4);
    }

    public function admin_menu_page()
    { return;
        wp_enqueue_style($css = 'wp-booster', $this->_wpb_url . "css/$css.css");
        $tabs = array('encoding_asset' => 'Compressing Assets', 'lazy_image' => 'Images');
        $html = '';

        $tablinks = '<div class="tab">';
        $tabcontents = '';
        $sl = 0;
        foreach ($tabs as $key => $tab) {
            $tablinks .= '<button class="wpb_tablinks" id="' . $key . '">' . $tab . '</button>';

            $tabcontents .= '<div id="' . $key . '" class="tabcontent">
              <span class="close_btn">&times</span>
              <h3>' . $tab . '</h3>
              <p>' . $tab . '</p>
            </div>';
            $sl++;
        }

        $html .= $tablinks . '</div>';
        $noticeDiv = '';
        foreach (array('error', 'success') as $item) {
            $noticeDiv .= '<div class="' . $item . ' updated notice wpb-notice-' . $item . ' is-dismissible" style="display: none">
            <p>' . $item . '</p>
        </div>';
        }
        $html .= $noticeDiv . $tabcontents;
        echo $html;
        $this->formOptions();
        wp_enqueue_script($js = 'wp-booster', $this->_wpb_url . "js/$js.js", array('jquery'));
    }

    private function formOptions()
    {
        ?>
        <div class="ajax-form">
            <div class="container">
                <div class=row>
                    <div class="col-md-6 col-md-offset-3 form-box">
                        <form action="" method="post" class="ajax">

                            <h1>Ajax Form</h1>
                            <?php settings_fields('myplugin_options_group'); ?>
                            <input name="_token" value="<?php echo wp_create_nonce('wpb_nonce') ?>">

                            <label><b>Name</b></label>

                            <input type="text" placeholder="Enter Your Name" name="name"
                                   required class="name">

                            <label><b>Email</b></label>

                            <input type="email" placeholder="Enter your Email" name="email"
                                   required class="email">

                            <label><b>Message</b></label>

                            <input type="textarea" placeholder="Message" name="message"
                                   required class="message">
                            <hr>

                            <?php submit_button(); ?>
                        </form>

                    </div>

                </div>

            </div>
        </div>


        <!--        <div>-->
        <!--            --><?php //screen_icon();
        ?>
        <!--            <h2>My Plugin Page Title</h2>-->
        <!--            <form method="post" action="options.php">-->
        <!--                --><?php //settings_fields('myplugin_options_group');
        ?>
        <!--                <h3>This is my option</h3>-->
        <!--                <p>Some text here.</p>-->
        <!--                <table>-->
        <!--                    <tr valign="top">-->
        <!--                        <th scope="row"><label for="myplugin_option_name">Label</label></th>-->
        <!--                        <td><input type="text" id="myplugin_option_name" name="myplugin_option_name"-->
        <!--                                   value="--><?php //echo get_option('myplugin_option_name');
        ?><!--"/></td>-->
        <!--                    </tr>-->
        <!--                </table>-->
        <!--                --><?php //submit_button();
        ?>
        <!--            </form>-->
        <!--        </div>-->
        <?php
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