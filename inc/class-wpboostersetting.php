<?php

use WPBoosterConfig as conf;

class WPBoosterSetting
{
    /**
     * Holds the values to be used in the fields callbacks
     */
    private $options = array();
    private static $_menu_tabs = array();

    /**
     * Start up
     */
    public function __construct()
    {
        $this->set_action_hooks();
    }

    /*setting action hooks*/
    private function set_action_hooks()
    {
        add_action('admin_menu', array($this, 'wpb_admin_menu'));
        add_action('admin_init', array($this, 'wpb_page_init'));
        add_action('wp_ajax_wpb_update_setting', array($this, 'wpb_update_setting'));
        add_filter('plugin_action_links_' . WPBOOSTER_FILE, array($this, 'settings_link'));
    }

    /*link to plugin list*/
    public function settings_link($links)
    {
        // Build and escape the URL.
        $url = esc_url(add_query_arg(
            'page',
            WPBOOSTER_NAME,
            get_admin_url() . 'admin.php'
        ));
        // Create the link.
        $settings_link = "<a href='$url'>" . __('Settings') . '</a>';
        // Adds the link to the end of the array.
        array_push(
            $links,
            $settings_link
        );
        return $links;
    }


    /**
     * Add options page
     */
    public function wpb_admin_menu()
    {
        if (!self::$_menu_tabs) {
            self::$_menu_tabs = conf::option_tabs();
        }
        // This page will be under "Settings"
        add_options_page(
            'WP Booster',
            'WP Booster Settings',
            'manage_options',
            'wp-booster',
            array($this, 'create_admin_page')
        );
    }

    /**
     * Options page callback
     */
    public function create_admin_page()
    {
        // Set class property
        foreach (conf::option_name() as $item) {
            $this->options[$item] = get_option($item);
        }

        $notice_div = '';
        foreach (array('error', 'success') as $item) {
            ob_start();
            ?>
            <div class="<?php echo $item . ' wpb-notice-' . $item ?> updated notice is-dismissible"
                 style="display: none">
                <p><?php echo $item ?></p>
            </div>
            <?php
            $notice_div .= ob_get_clean();
        }

        $tab_links = '';
        $tab_contents = '';
        $sl = 0;
        foreach (self::$_menu_tabs as $key => $tab) {
            $display = 'none';
            $active = '';
            if ($sl === 0) {
                $active = 'active';
                $display = 'block';
            }

            $tab_links .= '<button class="wpb_tablinks ' . $active . '" id="' . $key . '">' . $tab['title'] . '</button>';
            $tab_contents .= $this->set_form($key, $tab, $display);
            $sl++;
        }
        ?>
        <div class="wrap">
            <h1>WP Booster Settings</h1>
            <?php echo $notice_div ?>
            <div class="tab">
                <?php echo $tab_links ?>
            </div>
            <?php echo $tab_contents ?>
        </div>
        <?php
    }

    /*setting up form contents*/
    private function set_form($key, $tab, $display)
    {
        ob_start();
        ?>
        <div id="<?php echo $key ?>" class="tabcontent" style="display: <?php echo $display ?>">
            <h3><?php echo $tab['subtitle'] ?></h3>
            <hr>
            <form method="post" action="options.php" class="ajax <?php echo $key ?>" id="<?php echo $key ?>">
                <?php
                $this->input_field(array('_token', 'hidden', wp_create_nonce('wpb_nonce')));
                settings_fields('wpb_option_group');
                do_settings_sections('wpb-setting-' . $key);
                submit_button();
                ?>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Register and add settings fields
     */
    public function wpb_page_init()
    {
        register_setting(
            'wpb_option_group', // Option group
            'wpb_option_setting' // Option name
        );

        /*adding setting menu options*/
        foreach (self::$_menu_tabs as $key => $tab) {
            $setting = 'wpb-setting-' . $key;
            add_settings_section(
                'setting_section_id' . $setting, // ID
                '', // Title
                function ($tab) {
                }, // Callback
                $setting // Page
            );

            /*adding setting fields*/
            foreach ($tab['fields'] as $field) {
                $hr = isset($field['break']) ? "<hr>" : '';
                $name = $field['name'];
                add_settings_field(
                    $name, // ID
                    '<label for="' . $name . '">' . $field['title'] . '</label>' . $hr,
                    array($this, 'input_field'), // Callback
                    $setting, // Page
                    'setting_section_id' . $setting, // Section
                    array($name, $field['type'], '', $key)
                );
            }
        }
    }

    /*input_field_callback*/
    public function input_field($arg = [])
    {
        $name = $arg[0];
        $type = $arg[1];
        $full_name = '';
        $val = '';
        if (isset($arg[3])) {
            $full_name = "$arg[3][$name]";
            $val = isset($this->options[$arg[3]][$name]) ? esc_attr($this->options[$arg[3]][$name]) : '';
        }

        if ($type === 'checkbox') {
            printf(
                '<input type="checkbox" id="' . $name . '" name="' . $full_name . '" %s />',
                $val ? 'checked' : ''
            );
        } elseif (isset($arg[2])) {
            printf(
                '<input type="' . $type . '" name="' . $name . '" value="%s" />',
                $arg[2]
            );
        } else {
            printf(
                '<input type="text" id="' . $name . '" name="' . $full_name . '" value="%s" />',
                $val
            );
        }
    }

    /*updating all admin settings*/
    public function wpb_update_setting()
    {
        //conf::log('text'); die;



        $return = ['response' => 0, 'message' => 'noting changed!'];
        $form_data = array();
        parse_str($_POST['formData'], $form_data);

        /*validating CSRF*/
        $token = $form_data['_token'];
        if (!isset($token) || !wp_verify_nonce($token, 'wpb_nonce')) wp_die("<br><br>YOU ARE NOT ALLOWED! ");
        $option_name = $_POST['wpb_section'];

        if (update_option($option_name, isset($form_data[$option_name]) ? $form_data[$option_name] : '')) {
            conf::boot_settings($option_name);
            $return = ['response' => 1, 'message' => $option_name . '--- settings updated! To view update, refresh your site'];
        }
        echo json_encode($return);
        wp_die();
    }
}