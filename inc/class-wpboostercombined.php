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

    function ob_get_include($file, array $variables = array(), &$includeReturn = NULL)
    {
        $includeFilename = $file;
        unset($file);
        extract($variables);
        unset($variables);
        ob_start();
        $includeReturn = include($includeFilename);
        exit();
        return ob_get_clean();
        exit();
    }


    function get_header()
    {
        ob_start();
        $scripts = wp_scripts();
       include get_template_directory().'/header.php';

        exit();
;die;
        ob_get_clean();
    }

    private function combine()
    {
        add_action('get_header', array($this, 'get_header'), 10, 1);
        get_header();

        // $this->ob_get_include(get_template_directory().'/header.php');
        //$this->get_header();
        die;
        $combine_css = (isset($this->_options['combine_css'])) ? $this->_options['combine_css'] : false;
        $combine_js = (isset($this->_options['combine_js'])) ? $this->_options['combine_js'] : false;

        if ($this->_status == 'de-active') {
            $combine_js = $combine_js = false;
        }

        if ($combine_css || $combine_js) {
            ob_start();
            //$head = get_header('', '');
            get_header();
            $head = ob_get_clean();
            if ($head == '') {
                $html = config::homeHtml();
                //$html = wp_remote_retrieve_body(wp_remote_get((home_url())));
                if ($html) {
                    $explode = explode('<head>', $html);
                    if (isset($explode[1])) {
                        $explode = explode('</head>', $explode[1]);
                        $head = $explode[0];
                    }
                }
            }

            if ($head) {
                $dom = new DOMDocument;
                $dom->loadHTML(mb_convert_encoding($head, 'HTML-ENTITIES', 'UTF-8'));
                if ($combine_css) {
                    $this->merge_content($dom, 'link', 'combine_css');
                }
                if ($combine_js) {
                    $this->merge_content($dom, 'script', 'combine_js');
                }
            }
        }
    }

    private function merge_content($dom, $tag, $option_name)
    {
        global $wp_styles;
        die;

        $scripts = wp_scripts();
        echo '<pre>', print_r(wp_print_scripts()), '</pre>';
        echo '<pre>', print_r($scripts->queue), '</pre>';
        exit();


        $sl = 0;
        foreach ($wp_styles->queue as $handle) {
            // Load the content of the css file
            if (isset($wp_styles->registered[$handle])) {
                echo $sl++ . ". " . $handle . ": " . $wp_styles->registered[$handle]->src . "<br>";
//                $src = $wp_styles->registered[$handle]->src;
//                $explode = explode(home_url(), $src);
//                if (isset($explode[1])) {
//                    if (in_array($src, $css_src)) {
//                        $enqueue_handles[$handle] = $src;
//                        $handles[] = $handle;
//
//                        wp_dequeue_style($handle);
//                        wp_deregister_style($handle);
//                        //echo $sl++ . ". $src<br>";
//                    }
//                }
            }

        }
        return;


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