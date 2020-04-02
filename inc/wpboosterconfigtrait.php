<?php

trait WPBoosterConfig
{
    private static $_menu_tabs, $option_name;

    public static function option_name()
    {
        if (!self::$option_name) {
            $prefix = 'wpbooster_';
            self::$option_name = array(
                $prefix . 'encoding', $prefix . 'combined', $prefix . 'lazy_load'
            );
        }
        return self::$option_name;
    }

    public static function option_tabs()
    {
        if (!self::$_menu_tabs) {
            $tab_list = array(
                array(
                    'title' => 'Compressing Assets', 'subtitle' => 'compressing settings', 'fields' => array(
                    array('name' => 'gzip_compress', 'title' => 'Enable GZIP compression', 'type' => 'checkbox'),
                    array('name' => 'browser_cache', 'title' => 'Enable Browser Caching', 'type' => 'checkbox'),
                )
                ),
                array(
                    'title' => 'Combined CSS & JS', 'subtitle' => 'combining settings', 'fields' => array(
                    array('name' => 'combine_css', 'title' => 'Combine & Minify CSS', 'type' => 'checkbox'),
                    array('name' => 'combine_js', 'title' => 'Combine & Minify JS', 'type' => 'checkbox'),
                )
                ),
                array(
                    'title' => 'Image Lazy load', 'subtitle' => 'lazy load settings', 'fields' => array(
                    array('name' => 'lazy_load_image', 'title' => 'Lazy Load images', 'type' => 'checkbox'),
                )
                ),
            );

            $list = array();
            foreach (self::option_name() as $key => $item) {
                $list[$item] = $tab_list[$key];
            }
            self::$_menu_tabs = $list;
        }
        return self::$_menu_tabs;

    }

    public static function boot_settings($option_name = '*')
    {
        $options = self::option_name();
        if ($option_name == '*') {

        } elseif ($option_name === $options[0]) {
            new WPBoosterCompression($option_name);
        } elseif ($option_name === $options[1]) {
            new WPBoosterCombined($option_name);
        }
    }
}