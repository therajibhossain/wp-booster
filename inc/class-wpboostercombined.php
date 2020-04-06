<?php

use WPBoosterConfig as config;

class WPBoosterCombined
{
    private $_options, $_status;
    private static $option_name;

    public function __construct($option_name, $status = 'active')
    {
        $this->_options = get_option(self::$option_name = $option_name);
        $this->_status = $status;
        $this->combine();
    }

    private function enqueued_handles($queue)
    {
        $handles = array();
        foreach ($queue->queue as $handle) {
            if (isset($queue->registered[$handle])) {
                $src = $queue->registered[$handle]->src;
                $handles[$handle] = $src;
                $explode = explode(home_url(), $src);
                if (isset($explode[1])) {
                    //$handles[$handle] = $src;
                }
            }
        }
        return $handles;
    }

    private function combine()
    {
        $css_field = config::combined_option();
        $js_field = config::combined_option('js');
        $combine_css = (isset($this->_options[$css_field])) ? $css_field : false;
        $combine_js = (isset($this->_options[$js_field])) ? $js_field : false;

        if ($this->_status == 'de-active') {
            $combine_js = $combine_js = false;
        }

        if ($combine_css || $combine_js) {
            $html = config::homeHtml();
            //$html = wp_remote_retrieve_body(wp_remote_get((home_url())));
            if ($html) {
                $head = '';
                $explode = explode('<head>', $html);
                if (isset($explode[1])) {
                    $explode = explode('</head>', $explode[1]);
                    $head = $explode[0];
                }

//                if ($head) {
//                    $dom = new DOMDocument;
//                    $dom->loadHTML(mb_convert_encoding($head, 'HTML-ENTITIES', 'UTF-8'));
//                    if ($combine_css) {
//                        $this->merge_content($dom, 'link', $combine_css);
//                    }
//                    if ($combine_js) {
//                        $this->merge_content($dom, 'script', $combine_js);
//                    }
//                }

                if ($combine_css) {
                    $this->merge_content('link', $combine_css);
                }
                if ($combine_js) {
                    $this->merge_content('script', $combine_js);
                }
            }
        }
    }

    private
    function merge_content($tag, $option_name)
    {
        $enqueued_src = get_option($tag == 'link' ? "wpbooster_enqueued_styles" : 'wpbooster_enqueued_scripts');
        $combine_option = "wpbooster_src_$option_name";
        $combine_src = get_option($combine_option);

        $combine_src_new = array();
        $merge_content = '';
        $new_line = "\n";
        if ($enqueued_src) {
            foreach ($enqueued_src as $handle => $href) {
                $merged = $this->get_content($href);
                if ($merged) {
                    $merge_content .= $merged;
                    $combine_src_new[$handle] = $href;
                }
            }

            echo $merge_content;die;


            $ext = ($tag === 'link') ? 'css' : 'js';
            $dest_src = WP_PLUGIN_DIR . '/' . WPBOOSTER_NAME . '/' . $ext . '/' . WPBOOSTER_NAME . '.' . $ext;
            if (file_exists($dest_src) && $merge_content) {
                $merge_content = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $merge_content);
                $merge_content = str_replace(': ', ':', $merge_content);
                $merge_content = str_replace(array("\n", "\t", '  ', '    ', '    '), '', $merge_content);

                $comment = $new_line . config::get_comment('/*', '*/', "wp-booster-combined-sources: "
                        . implode(', ', $combine_src_new), 0) . $new_line . config::get_comment();
                $merged = file_put_contents($dest_src, $merge_content . $comment);
            }
        }

        if ($combine_src_new && isset($merged)) {
            update_option($combine_option, $combine_src_new);
            return true;
        }
        return false;
        /*custom new*/


        /*main function previous*/
        $tag_src = array();
        $merge_content = '';
        $new_line = "\n";
        $nodes = $dom->getElementsByTagName($tag);
        if ($nodes) {
            foreach ($nodes as $node) {
                if ($tag === 'link') {
                    $get_attr = ($node->getAttribute('rel') === 'stylesheet') ? 'href' : '';
                } else {
                    $get_attr = 'src';
                }

                if (isset($get_attr)) {
                    $href = $node->getAttribute($get_attr);
                    $merged = $this->get_content($href);
                    if ($merged) {
                        $merge_content .= $merged;
                        $tag_src[] = $href;
                    }
                }
            }

            $ext = ($tag === 'link') ? 'css' : 'js';
            $dest_src = WP_PLUGIN_DIR . '/' . WPBOOSTER_NAME . '/' . $ext . '/wp-booster.' . $ext;
            if (file_exists($dest_src) && $merge_content) {
                $merge_content = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $merge_content);
                $merge_content = str_replace(': ', ':', $merge_content);
                $merge_content = str_replace(array("\n", "\t", '  ', '    ', '    '), '', $merge_content);

                $comment = $new_line . config::get_comment('/*', '*/', "wp-booster-combined-sources: "
                        . implode(', ', $tag_src), 0) . $new_line . config::get_comment();
                $merged = file_put_contents($dest_src, $merge_content . $comment);
            }
        }

        if ($tag_src && isset($merged)) {
            update_option('wpbooster_src_' . $option_name, $tag_src);
            return true;
        }
        return false;
        /*end main function previous*/
    }

    private function get_content($src)
    {
        $explode = explode(home_url(), $src);
        if (isset($explode[1]) && (strpos($explode[1], '.php') === false)) {
            return file_get_contents($src);
        }
        return false;
    }
}