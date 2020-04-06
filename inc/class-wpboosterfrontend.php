<?php

use WPBoosterConfig as config;

class WPBoosterFrontend
{
    private $_options = array();

    public function __construct()
    {
        $this->_options = config::option_value();
        $this->init_actions();
    }

    private function init_actions()
    {
        add_action("wp_head", array($this, 'wp_head'), 1);
    }

    public function wp_head()
    {
        $combined = config::option_name()[1];
        $combine_css = config::combined_option('css');
        $combine_js = config::combined_option('js');
        $combine_css = (isset($this->_options[$combined][$combine_css])) ? $combine_css : false;
        $combine_js = (isset($this->_options[$combined][$combine_js])) ? $combine_js : false;

        $this->update_enqueued('styles');
        $this->update_enqueued('scripts');

        if ($combine_css) {
            $this->dequeue_src($combine_css, 'css');
        }

        if ($combine_js) {
            $this->dequeue_src($combine_js, 'js');
        }
    }

    private function update_enqueued($type)
    {
        $wpbooster_enqueued = get_option($option_name = 'wpbooster_enqueued_' . $type);
        if (!isset($_COOKIE[$option_name])) {
            global $wp_styles, $wp_scripts;
            $wp_handles = $type === 'styles' ? $wp_styles : $wp_scripts;
            $handles = $this->enqueued_handles($wp_handles);
            if ($wpbooster_enqueued !== $handles) {
                update_option($option_name, $handles);
            }
            setcookie($option_name, 1, 0);
        }
    }

    private function enqueued_handles($queue)
    {
        $handles = array();
        foreach ($queue->queue as $handle) {
            if (isset($queue->registered[$handle])) {
                $src = $queue->registered[$handle]->src;
                $explode = explode(home_url(), $src);
                if (isset($explode[1])) {
                    $handles[$handle] = $src;
                }
            }
        }
        return $handles;
    }

    private function dequeue_src($combine, $type)
    {
        $combine_src = get_option("wpbooster_src_$combine");
        if ($combine_src) {
            $file = WPBOOSTER_NAME;
            foreach ($combine_src as $handle => $item) {
                ($type === 'css') ? wp_dequeue_style($handle) : wp_dequeue_script($handle);
            }
            if ($type === 'css') {
                wp_enqueue_style($file, WPBOOSTER_STYLES . "$file.css", array(), '', 'all');
            } else {
                wp_enqueue_script($file, WPBOOSTER_SCRIPTS . "$file.js", array());
            }
        }
    }

}