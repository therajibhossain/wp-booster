<?php

class WPBoosterSetting
{
    /**
     * Holds the values to be used in the fields callbacks
     */
    private $options;

    /**
     * Start up
     */
    public function __construct()
    {
        add_action('admin_menu', array($this, 'wpb_admin_menu'));
        add_action('admin_init', array($this, 'wpb_page_init'));
        add_action('wp_ajax_wpb_update_setting', array($this, 'wpb_update_setting'));
    }

    /**
     * Add options page
     */
    public function wpb_admin_menu()
    {
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
        $this->options = get_option('wpb_option_name');

        wp_enqueue_style($css = 'wp-booster', WPB_URL . "css/$css.css");
        $tabs = array('encoding_asset' => 'Compressing Assets', 'lazy_image' => 'Images');
        $html = '<div class="wrap"><h1>WP Booster Settings</h1>';

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

        ?>

        <form method="post" action="options.php" class="ajax">
            <?php
            // This prints out all hidden setting fields
            settings_fields('wpb_option_group');
            do_settings_sections('wpb-setting-admin');
            submit_button();
            ?>
        </form>
        </div>
        <?php
        wp_enqueue_script($js = 'wp-booster', WPB_URL . "js/$js.js", array('jquery'));
    }

    /**
     * Register and add settings
     */
    public function wpb_page_init()
    {
        register_setting(
            'wpb_option_group', // Option group
            'wpb_option_name', // Option name
            array($this, 'sanitize') // Sanitize
        );

        add_settings_section(
            'setting_section_id', // ID
            'WP Booster Settings', // Title
            array($this, 'print_section_info'), // Callback
            'wpb-setting-admin' // Page
        );

        add_settings_field(
            'id_number', // ID
            'ID Number', // Title
            array($this, 'id_number_callback'), // Callback
            'wpb-setting-admin', // Page
            'setting_section_id' // Section
        );

        add_settings_field(
            'title',
            'Title',
            array($this, 'title_callback'),
            'wpb-setting-admin',
            'setting_section_id'
        );
    }

    /**
     * Sanitize each setting field as needed
     *
     * @param array $input Contains all settings fields as array keys
     */
    public function sanitize($input)
    {
        $new_input = array();
        if (isset($input['id_number']))
            $new_input['id_number'] = absint($input['id_number']);

        if (isset($input['title']))
            $new_input['title'] = sanitize_text_field($input['title']);

        return $new_input;
    }

    /**
     * Print the Section text
     */
    public function print_section_info()
    {
        print 'Enter your settings below:';
    }

    /**
     * Get the settings option array and print one of its values
     */
    public function id_number_callback()
    {
        printf(
            '<input type="text" id="id_number" name="wpb_option_name[id_number]" value="%s" />',
            isset($this->options['id_number']) ? esc_attr($this->options['id_number']) : ''
        );
    }

    /**
     * Get the settings option array and print one of its values
     */
    public function title_callback()
    {
        printf(
            '<input type="text" id="title" name="wpb_option_name[title]" value="%s" />',
            isset($this->options['title']) ? esc_attr($this->options['title']) : ''
        );
    }

    /*updating all admin settings*/
    public function wpb_update_setting()
    {
        $formData = array();
        parse_str($_POST['formData'], $formData);

        /*validating CSRF*/
        $token = $formData['_token'];
        if (!isset($token) || !wp_verify_nonce($token, 'wpb_nonce')) wp_die("<br><br>YOU ARE NOT ALLOWED! ");

        $return = ['response' => 1, 'message' => 'successfully saved!'];
        echo json_encode($return);
        wp_die();
    }
}