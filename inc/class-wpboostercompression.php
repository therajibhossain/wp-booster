<?php

class WPBoosterCompression
{
    private $_options, $_status;
    private static $option_name = 'wpb_option_setting';

    public function __construct($status = 'active')
    {
        $this->_options = get_option(self::$option_name);
        $this->_status = $status;
        $this->compression();
    }

    private function compression()
    {
        $gzip_compress = (isset($this->_options['gzip_compress'])) ? $this->_options['gzip_compress'] : false;
        $browser_cache = (isset($this->_options['browser_cache'])) ? $this->_options['browser_cache'] : false;
        if ($this->_status == 'de-active') {
            $gzip_compress = $browser_cache = false;
        }
        $htaccess = '.htaccess';
        $src = ABSPATH . $htaccess;

        if (!is_writable()) {
            echo '.htaccess file not writable';
            return false;
        }


        if ($gzip_compress || $browser_cache) {
            if (file_exists($src)) {
                $dest = WPB_DIR . 'backup/' . $htaccess;
                if (!file_exists($dest)) {
                    copy($src, $dest);
                }
            }
        }

        $content = $new_content = (file_get_contents($src));

        $new_content .= $this->new_content('WP-Booster-Gzip', $new_content, 'gzip', $gzip_compress);
        $new_content .= $this->new_content('WP-Booster-Browser-Cache', $new_content, 'cache', $browser_cache);

        file_put_contents($src, $new_content);
        return true;
    }

    private function new_content($wpb_prefix, &$new_content, $type, $enable)
    {
        $begin = explode("# BEGIN $wpb_prefix", $new_content);
        if (isset($begin[0])) {
            $new_content = $begin[0];
        }

        if (isset($begin[1])) {
            $end = explode("# END $wpb_prefix", $begin[1]);
            $new_content .= isset($end[1]) ? $end[1] : $end[0];
        }
        $new_content = trim($new_content);
        if ($enable) {
            $new_content .= ($type == 'gzip') ? $this->gzip_content($wpb_prefix) : $this->browser_cache_content($wpb_prefix);
        }
    }

    private function gzip_content($wpb_gzip)
    {
        return "\n\n\n# BEGIN $wpb_gzip
<IfModule mod_filter.c>
	<IfModule mod_deflate.c>
        # Compress HTML, CSS, JavaScript, Text, XML and fonts
		AddType application/vnd.ms-fontobject .eot
		AddType font/ttf .ttf
		AddType font/otf .otf
		AddType font/x-woff .woff
		AddType image/svg+xml .svg
		
		AddOutputFilterByType DEFLATE application/javascript
		AddOutputFilterByType DEFLATE application/rss+xml
		AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
		AddOutputFilterByType DEFLATE application/x-font
		AddOutputFilterByType DEFLATE application/x-font-opentype
		AddOutputFilterByType DEFLATE application/x-font-otf
		AddOutputFilterByType DEFLATE application/x-font-truetype
		AddOutputFilterByType DEFLATE application/x-font-ttf
		AddOutputFilterByType DEFLATE application/x-font-woff
		AddOutputFilterByType DEFLATE application/x-javascript
		AddOutputFilterByType DEFLATE application/xhtml+xml
		AddOutputFilterByType DEFLATE application/xml
		AddOutputFilterByType DEFLATE font/opentype
		AddOutputFilterByType DEFLATE font/otf
		AddOutputFilterByType DEFLATE font/ttf
		AddOutputFilterByType DEFLATE font/woff
		AddOutputFilterByType DEFLATE image/svg+xml
		AddOutputFilterByType DEFLATE image/x-icon
		AddOutputFilterByType DEFLATE text/css
		AddOutputFilterByType DEFLATE text/html
		AddOutputFilterByType DEFLATE text/javascript
		AddOutputFilterByType DEFLATE text/plain
		AddOutputFilterByType DEFLATE text/xml
		
        # Remove browser bugs (only needed for really old browsers)
		BrowserMatch ^Mozilla/4 gzip-only-text/html
		BrowserMatch ^Mozilla/4\.0[678] no-gzip
		BrowserMatch \bMSIE !no-gzip !gzip-only-text/html
		Header append Vary User-Agent
	</IfModule>
</IfModule>
# END $wpb_gzip";
    }

    private function browser_cache_content($wpb_cache)
    {
        return "\n\n# BEGIN $wpb_cache
<IfModule mod_expires.c>
    ExpiresActive on
    
    # Perhaps better to whitelist expires rules? Perhaps.
    ExpiresDefault \"access plus 1 month\"
    
    # cache.appcache needs re-requests in FF 3.6 (thanks Remy ~Introducing HTML5)
    ExpiresByType text/cache-manifest \"access plus 0 seconds\"
    
    # Your document HTML
    ExpiresByType text/html \"access plus 0 seconds\"
    
    # Data
    ExpiresByType text/xml \"access plus 0 seconds\"
    ExpiresByType application/xml \"access plus 0 seconds\"
    ExpiresByType application/json \"access plus 0 seconds\"
    
    # Feed
    ExpiresByType application/rss+xml \"access plus 1 hour\"
    ExpiresByType application/atom+xml \"access plus 1 hour\"
    
    # Favicon (cannot be renamed)
    ExpiresByType image/x-icon \"access plus 1 week\"
    
    # Media: images, video, audio
    ExpiresByType image/gif \"access plus 1 month\"
    ExpiresByType image/png \"access plus 1 month\"
    ExpiresByType image/jpg \"access plus 1 month\"
    ExpiresByType image/jpeg \"access plus 1 month\"
    ExpiresByType video/ogg \"access plus 1 month\"
    ExpiresByType audio/ogg \"access plus 1 month\"
    ExpiresByType video/mp4 \"access plus 1 month\"
    ExpiresByType video/webm \"access plus 1 month\"
    
    # HTC files (css3pie)
    ExpiresByType text/x-component \"access plus 1 month\"
    
    # Web fonts
    ExpiresByType application/x-font-ttf \"access plus 1 month\"
    ExpiresByType font/opentype \"access plus 1 month\"
    ExpiresByType application/x-font-woff \"access plus 1 month\"
    ExpiresByType image/svg+xml \"access plus 1 month\"
    ExpiresByType application/vnd.ms-fontobject \"access plus 1 month\"
    
    # CSS and JavaScript
    ExpiresByType text/css \"access plus 1 year\"
    ExpiresByType application/javascript \"access plus 1 year\"
    
    <IfModule mod_headers.c>
        Header append Cache-Control \"public\"
    </IfModule>
</IfModule>
# END $wpb_cache";
    }
}