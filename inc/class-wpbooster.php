<?php
/*Core class*/
if (!defined('ABSPATH')) {
    exit();
}

use WPBoosterConfig as conf;

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
        $this->init_hooks();
    }

    private function init_hooks()
    {
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
        $this->do_actions('active');
    }

    public function plugin_deactivate()
    {
        $this->do_actions('de-active');
    }

    public static function plugin_uninstall()
    {
        foreach (conf::option_name() as $item) {
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

    /*active/ de-active callback*/
    private function do_actions($status)
    {
        $options = conf::option_name();
        /*adding/removing encoding from .htaccess by WPBoosterCompression*/
        conf::boot_settings($options[0], $status);
    }

}