<?php

use WPBoosterConfig as conf;

class WPBoosterCombined
{
    private $_options, $_status;
    private static $option_name;

    public function __construct($option_name, $status = 'active')
    {
        $this->_options = get_option(self::$option_name = $option_name);
        $this->_status = $status;
        try {
            $this->combine();
        } catch (Exception $e) {
            conf::log(__METHOD__ . $e->getMessage());
        }
    }

    private function combine()
    {
        $css_field = conf::combined_option();
        $js_field = conf::combined_option('js');
        $combine_css = (isset($this->_options[$css_field])) ? $css_field : false;
        $combine_js = (isset($this->_options[$js_field])) ? $js_field : false;

        if ($this->_status == 'de-active') {
            $combine_js = $combine_js = false;
        }

        if ($combine_css || $combine_js) {
            $combine_option = $combine_css ? $combine_css : $combine_js;
            $sec = sanitize_text_field($_POST['wpb_section']);
            $sec_val = get_option($sec);
            update_option($sec, '');

            $html = wp_remote_retrieve_body(wp_remote_get((home_url())));
            if ($html) {
                $head = '';
                $explode = explode('<head>', $html);
                if (isset($explode[1])) {
                    $explode = explode('</head>', $explode[1]);
                    $head = $explode[0];
                }

                if ($head) {
                    $dom = new DOMDocument;
                    $dom->loadHTML(mb_convert_encoding($head, 'HTML-ENTITIES', 'UTF-8'));
                    if ($combine_css) {
                        $this->merge_content('link', $combine_css, $dom);
                    }
                    if ($combine_js) {
                        $this->merge_content('script', $combine_js, $dom);
                    }

                    update_option($sec, $sec_val);
                } else {
                    conf::log(__METHOD__ . __LINE__ . " HTML head is missing");
                }
            } else {
                conf::log(__METHOD__ . __LINE__ . " HTML missing");
            }
        }
    }

    private function merge_content($tag, $option_name, $dom)
    {
        $enqueued_src = get_option($tag == 'link' ? "wpbooster_enqueued_styles" : 'wpbooster_enqueued_scripts');
        $combine_option = "wpbooster_src_$option_name";

        $nodes = $dom->getElementsByTagName($tag);
        $tag_src_html = array();
        if ($nodes) {
            foreach ($nodes as $node) {
                if ($tag === 'link') {
                    $get_attr = ($node->getAttribute('rel') === 'stylesheet') ? 'href' : '';
                } else {
                    $get_attr = 'src';
                }

                if (isset($get_attr)) {
                    $href = $node->getAttribute($get_attr);
                    if (strpos($href, 'jquery.lazyload.min.js') === false)
                        $tag_src_html[] = $href;
                }
            }
        } else {
            conf::log(__METHOD__ . __LINE__ . " html node is missing ($tag)");
        }

        $combine_src_new = array();
        $merge_content = '';
        $sl = 1;
        if ($enqueued_src) {
            foreach ($enqueued_src as $handle => $href) {
                $combine_src_new[$handle] = $href;
            }

            foreach ($tag_src_html as $k => $item) {
                unset($tag_src_html[$k]);
                $item = explode('?', $item)[0];
                if (in_array($item, $combine_src_new)) {
                    $merged = $this->get_content($item);
                    if ($merged) {
                        $comment = "/*!$sl. $item*/";
                        $merge_content .= $comment . $merged;
                        $sl++;
                        $tag_src_html[array_search($item, $combine_src_new)] = $item;
                    }
                }
            }

            $ext = ($tag === 'link') ? 'css' : 'js';
            $dest_src = WP_PLUGIN_DIR . '/' . WPBOOSTER_NAME . '/' . $ext . '/' . WPBOOSTER_NAME . '.' . $ext;
            if (file_exists($dest_src) && $merge_content) {
                $merge_content = $this->minify($merge_content, $ext, $tag_src_html);
                $merged = file_put_contents($dest_src, $merge_content);
            }
        }

        if ($tag_src_html && isset($merged)) {
            update_option($combine_option, $tag_src_html);
            return true;
        }
        conf::log(__METHOD__ . " empty content", 'warning');
        return false;
    }

    private function minify($input, $ext, $combine_src_new)
    {
        $new_line = "\n";
        $minify_dir = WPBOOSTER_DIR . "/minify/$ext/";
        if ($ext === 'js') {
            require_once $minify_dir . "JSMin.php";
            $output = \JSMin\JSMin::minify($input);
        } else {
            require_once $minify_dir . "Minifier.php";
            $compressor = new \tubalmartin\CssMin\Minifier;
            $output = $compressor->run($input);
        }
        if ($output) {
            $str = "(total-files: " . count($combine_src_new) . ") ";
            return $output .= $new_line . conf::get_comment('/*', '*/', $str, 0) . conf::get_comment();
        }

        conf::log(__METHOD__ . " minify problem ($ext)");
        return false;
    }

    private function blacklist_file($src)
    {

    }

    private function get_content($src)
    {
        $explode = explode(home_url(), $src);
        if (isset($explode[1]) && (strpos($explode[1], '.php') === false)) {
            return file_get_contents($src);
        }
        conf::log(__METHOD__ . " ($src) cannot be added", 'warning');
        return false;
    }
}