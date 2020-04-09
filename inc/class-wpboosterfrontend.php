<?php

use WPBoosterConfig as conf;

class WPBoosterFrontend
{
    private $_options = array();

    public function __construct()
    {
        $this->_options = conf::option_value();
        $this->init_actions();
    }

    private function init_actions()
    {
        /*combining styles & scripts*/
        add_action("wp_head", array($this, 'wp_head'), 1);

        /*removing query string param from styles scripts*/
        add_filter('script_loader_src', array($this, 'remove_script_version'));
        add_filter('style_loader_src', array($this, 'remove_script_version'));

        /*lazy loading*/
        $this->lazy_load();
    }

    private function lazy_load()
    {
        /*if lazy load is enabled*/
        if (isset($this->_options[conf::option_name()[2]][conf::lazy_load_option()])) {
            add_action('wp_enqueue_scripts', function () {
                wp_enqueue_script('jquery_lazy_load', WPBOOSTER_SCRIPTS . 'jquery.lazyload.min.js', array('jquery'));
            });
            /*calling lazy oad*/
            add_action('wp_footer', function () {
                echo '<script type="text/javascript">
                    (function($){
                      $("img.lazy").lazyload();
                    })(jQuery);
                </script>';
            });

            /*fileter_lazyload*/
            add_filter('the_content', function ($content) {
                return preg_replace_callback('/(<\s*img[^>]+)(src\s*=\s*"[^"]+")([^>]+>)/i', array($this, 'preg_lazyload'), $content);
            });
        }
    }

    public function preg_lazyload($img_match)
    {
        $img_replace = $img_match[1] . 'src="' . WPBOOSTER_URL . 'img/grey.gif" data-original' . substr($img_match[2], 3) . $img_match[3];
        $img_replace = preg_replace('/class\s*=\s*"/i', 'class="lazy ', $img_replace);
        $img_replace .= '<noscript>' . $img_match[0] . '</noscript>';
        return $img_replace;
    }

    /*removing query string param from styles scripts*/
    function remove_script_version($src)
    {
        return remove_query_arg('ver', $src);
    }

    public function wp_head()
    {
        $combined = conf::option_name()[1];
        $combine_css = conf::combined_option('css');
        $combine_js = conf::combined_option('js');
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
            if ($type === 'css') {
                wp_enqueue_style($file, WPBOOSTER_STYLES . "$file.css", array(), '', 'all');
            } else {
                wp_enqueue_script($file, WPBOOSTER_SCRIPTS . "$file.js", array());
            }

            foreach ($combine_src as $handle => $item) {
                ($type === 'css') ? wp_dequeue_style($handle) : wp_dequeue_script($handle);
            }
        }
    }

}