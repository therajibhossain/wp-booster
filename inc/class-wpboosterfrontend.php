<?php

use WPBoosterConfig as config;

class WPBoosterFrontend
{
    private $_options = array();

    public function __construct()
    {
        $this->_options = config::option_value();
        $this->init_actions();

        //add_action('wp_enqueue_scripts', array($this, 'dequeue_my_css'));
    }

    private function init_actions()
    {
        // ******************** Crunchify Tips - Clean up WordPress Header START ********************** //
//        add_filter('the_generator', array($this, 'crunchify_remove_version'));
//
//        remove_action('wp_head', array($this, 'rest_output_link_wp_head'), 10);
//        remove_action('wp_head', array($this, 'wp_oembed_add_discovery_links'), 10);
//        remove_action('template_redirect', array($this, 'rest_output_link_header'), 11, 0);
//
//        remove_action('wp_head', array($this, 'rsd_link'));
//        remove_action('wp_head', array($this, 'wlwmanifest_link'));
//        remove_action('wp_head', array($this, 'wp_shortlink_wp_head'));
//        add_filter('script_loader_src', array($this, 'crunchify_cleanup_query_string'), 15, 1);
//        add_filter('style_loader_src', array($this, 'crunchify_cleanup_query_string'), 15, 1);
        // ******************** Clean up WordPress Header END ********************** //


        add_action("wp_enqueue_scripts", array($this, 'wp_head'), 100);
//        add_action("wp_head", array($this, 'wp_head'));


//        add_action('wp_print_styles', array($this, 'remove_styles'), 99);
    }

    function remove_styles()
    {
        $this->remove_enqueues('style', ['dashicons-css']);
    }


    /**
     * Remove specific style sheets.
     */
    function remove_enqueues($queue, $handles = '')
    {
        if (is_array($handles)) {
            foreach ($handles as $handle) {
                $queue == 'style' ? wp_dequeue_style($handles) : wp_dequeue_script($handles);
            }
        } elseif ($handles != false) {
            $queue == 'style' ? wp_dequeue_style($handles) : wp_dequeue_script($handles);
        } else {
            global $wp_styles, $wp_scripts;
            if ($queue == 'style') {
                $wp_styles->queue = array();
            } else {
                $wp_scripts->queue = array();
            }
        }
    }





// add a priority if you need it
// add_action('wp_enqueue_scripts','dequeue_my_css',100);

    private function enqueue_handles($queue)
    { echo "initialized<br>";
        $handles = array();
        foreach ($queue->queue as $handle) {
            if (isset($queue->registered[$handle])) {
                $src = $queue->registered[$handle]->src;
                $explode = explode(home_url(), $src);
                if (isset($explode[1])) {
                    $handles[] = $handle;
                }
            }
        }
        return $handles;
    }

    public function wp_head()
    {
        $combine_css = 'combine_css';
        $combine_js = 'combine_js';
        $combined = config::option_name()[1];
        $combine_css = (isset($this->_options[$combined][$combine_css])) ? $combine_css : false;
        $combine_js = (isset($this->_options[$combined][$combine_js])) ? $combine_js : false;

        $wpbooster_enqueued_styles = get_option('wpbooster_enqueued_styles');
        $wpbooster_enqueued_scripts = get_option('wpbooster_enqueued_scripts');

        global $wp_styles, $wp_scripts;
        $style_handles = $this->enqueue_handles($wp_styles);
        $script_handles = $this->enqueue_handles($wp_scripts);
        if ($wpbooster_enqueued_styles !== $style_handles) {
            update_option('wpbooster_enqueued_styles', $style_handles);
        }

        if ($wpbooster_enqueued_scripts !== $script_handles) {
            update_option('wpbooster_enqueued_scripts', $script_handles);
        }
        echo '<pre>', print_r($style_handles), '</pre>';
        echo '<pre>', print_r($script_handles), '</pre>';
        exit();

        $handles = array();
        if ($combine_css) {
            $combine_css_src = get_option("wpbooster_src_$combine_css");

            foreach ($wp_styles->queue as $handle) {
                if (isset($wp_styles->registered[$handle])) {
                    $src = $wp_styles->registered[$handle]->src;
                    $explode = explode(home_url(), $src);
                    if (isset($explode[1])) {
                        $handles[] = $handle;
                    }
                }
            }
            if ($handles) {
                update_option('wpbooster_styles');
            }
            echo '<pre>', print_r($handles), '</pre>';

            if ($combine_css_src) {


                $sl = 0;
                foreach ($wp_styles->queue as $handle) {
                    // Load the content of the css file
                    if (isset($wp_styles->registered[$handle])) {
                        //echo $sl++ . ". " . $handle . ": " . $wp_styles->registered[$handle]->src . "<br>";
                        $src = $wp_styles->registered[$handle]->src;
                        $explode = explode(home_url(), $src);
//                        if (isset($explode[1])) {
//                            if (in_array($src, $css_src)) {
//                                $enqueue_handles[$handle] = $src;
//                                $handles[] = $handle;
//
////                                wp_dequeue_style($handle);
////                                wp_deregister_style($handle);
//                                echo $sl++ . ". $src<br>";
//                            }
//                        }
                    }

                }


                //echo '<pre>', print_r($handles), '</pre>';
//                echo '<pre>', print_r($enqueue_handles), '</pre>';
//                echo '<pre>', print_r($css_src), '</pre>';
//                $r = array_diff($css_src, $enqueue_handles);
//                echo '<pre>', print_r($r), '</pre>';
                //exit();
            }
        }
//        $options = config::option_name();
//        echo '<pre>', print_r($options), '</pre>';
//        exit();
//
//        echo "\n";
//        echo '<link rel="stylesheet" href="' . WPBOOSTER_STYLES . 'wp-booster-css.php' . '" type="text/css" media="screen" />';
//        echo "\n";
    }


    public function crunchify_remove_version()
    {
        return '';
    }

    public function crunchify_cleanup_query_string($src)
    {
        $parts = explode('?', $src);
        return $parts[0];
    }

}