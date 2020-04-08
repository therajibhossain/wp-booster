<?php

trait WPBoosterConfig
{
    private static $extensions = array(), $_menu_tabs, $option_name, $option_value = array();

    private function isExtensionLoaded($extension_name)
    {
        if (!isset(self::$extensions[$extension_name])) {
            self::$extensions[$extension_name] = extension_loaded($extension_name);
        }
        return self::$extensions[$extension_name];
    }

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

    public static function homeHtml()
    {
        return '<!DOCTYPE html>
<html lang="en-US" class="no-js">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width">
	<meta name="author" content="Rajib Hossain <rajibhossain.php@gmail.com">
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<link rel="pingback" href="http://localhost/kholahat/xmlrpc.php">
					<script>document.documentElement.className = document.documentElement.className + \' yes-js js_active js\'</script>
			<title>Kholahat &#8211; Online Grocery Shopping and Delivery in Dhaka</title>
<link  href="http://localhost/kholahat/wp-content/plugins/rh-side-cart-wc/public/css/rh-wsc-sidebar.css" rel="stylesheet" type="text/css"><style type="text/css" data-type="vc_custom-css">.vc_row.wpb_row.vc_row-fluid.position-img.vc_custom_1512654065866{
    left: unset !important;
    width: unset !important;
    margin-top: 0px !important;
}</style><style type="text/css" data-type="vc_shortcodes-custom-css">.vc_custom_1512654065866{margin-top: 30px !important;margin-bottom: 60px !important;}</style><link rel=\'dns-prefetch\' href=\'//fonts.googleapis.com\' />
<link rel=\'dns-prefetch\' href=\'//s.w.org\' />
<link rel="alternate" type="application/rss+xml" title="Kholahat &raquo; Feed" href="http://localhost/kholahat/feed/" />
<link rel="alternate" type="application/rss+xml" title="Kholahat &raquo; Comments Feed" href="http://localhost/kholahat/comments/feed/" />
		<script type="text/javascript">
			window._wpemojiSettings = {"baseUrl":"https:\/\/s.w.org\/images\/core\/emoji\/12.0.0-1\/72x72\/","ext":".png","svgUrl":"https:\/\/s.w.org\/images\/core\/emoji\/12.0.0-1\/svg\/","svgExt":".svg","source":{"wpemoji":"http:\/\/localhost\/kholahat\/wp-includes\/js\/wp-emoji.js","twemoji":"http:\/\/localhost\/kholahat\/wp-includes\/js\/twemoji.js"}};
			/**
 * @output wp-includes/js/wp-emoji-loader.js
 */

( function( window, document, settings ) {
	var src, ready, ii, tests;

	// Create a canvas element for testing native browser support of emoji.
	var canvas = document.createElement( \'canvas\' );
	var context = canvas.getContext && canvas.getContext( \'2d\' );

	/**
	 * Checks if two sets of Emoji characters render the same visually.
	 *
	 * @since 4.9.0
	 *
	 * @private
	 *
	 * @param {number[]} set1 Set of Emoji character codes.
	 * @param {number[]} set2 Set of Emoji character codes.
	 *
	 * @return {boolean} True if the two sets render the same.
	 */
	function emojiSetsRenderIdentically( set1, set2 ) {
		var stringFromCharCode = String.fromCharCode;

		// Cleanup from previous test.
		context.clearRect( 0, 0, canvas.width, canvas.height );
		context.fillText( stringFromCharCode.apply( this, set1 ), 0, 0 );
		var rendered1 = canvas.toDataURL();

		// Cleanup from previous test.
		context.clearRect( 0, 0, canvas.width, canvas.height );
		context.fillText( stringFromCharCode.apply( this, set2 ), 0, 0 );
		var rendered2 = canvas.toDataURL();

		return rendered1 === rendered2;
	}

	/**
	 * Detects if the browser supports rendering emoji or flag emoji.
	 *
	 * Flag emoji are a single glyph made of two characters, so some browsers
	 * (notably, Firefox OS X) don\'t support them.
	 *
	 * @since 4.2.0
	 *
	 * @private
	 *
	 * @param {string} type Whether to test for support of "flag" or "emoji".
	 *
	 * @return {boolean} True if the browser can render emoji, false if it cannot.
	 */
	function browserSupportsEmoji( type ) {
		var isIdentical;

		if ( ! context || ! context.fillText ) {
			return false;
		}

		/*
		 * Chrome on OS X added native emoji rendering in M41. Unfortunately,
		 * it doesn\'t work when the font is bolder than 500 weight. So, we
		 * check for bold rendering support to avoid invisible emoji in Chrome.
		 */
		context.textBaseline = \'top\';
		context.font = \'600 32px Arial\';

		switch ( type ) {
			case \'flag\':
				/*
				 * Test for Transgender flag compatibility. This flag is shortlisted for the Emoji 13 spec,
				 * but has landed in Twemoji early, so we can add support for it, too.
				 *
				 * To test for support, we try to render it, and compare the rendering to how it would look if
				 * the browser doesn\'t render it correctly (white flag emoji + transgender symbol).
				 */
				isIdentical = emojiSetsRenderIdentically(
					[ 0x1F3F3, 0xFE0F, 0x200D, 0x26A7, 0xFE0F ],
					[ 0x1F3F3, 0xFE0F, 0x200B, 0x26A7, 0xFE0F ]
				);

				if ( isIdentical ) {
					return false;
				}

				/*
				 * Test for UN flag compatibility. This is the least supported of the letter locale flags,
				 * so gives us an easy test for full support.
				 *
				 * To test for support, we try to render it, and compare the rendering to how it would look if
				 * the browser doesn\'t render it correctly ([U] + [N]).
				 */
				isIdentical = emojiSetsRenderIdentically(
					[ 0xD83C, 0xDDFA, 0xD83C, 0xDDF3 ],
					[ 0xD83C, 0xDDFA, 0x200B, 0xD83C, 0xDDF3 ]
				);

				if ( isIdentical ) {
					return false;
				}

				/*
				 * Test for English flag compatibility. England is a country in the United Kingdom, it
				 * does not have a two letter locale code but rather an five letter sub-division code.
				 *
				 * To test for support, we try to render it, and compare the rendering to how it would look if
				 * the browser doesn\'t render it correctly (black flag emoji + [G] + [B] + [E] + [N] + [G]).
				 */
				isIdentical = emojiSetsRenderIdentically(
					[ 0xD83C, 0xDFF4, 0xDB40, 0xDC67, 0xDB40, 0xDC62, 0xDB40, 0xDC65, 0xDB40, 0xDC6E, 0xDB40, 0xDC67, 0xDB40, 0xDC7F ],
					[ 0xD83C, 0xDFF4, 0x200B, 0xDB40, 0xDC67, 0x200B, 0xDB40, 0xDC62, 0x200B, 0xDB40, 0xDC65, 0x200B, 0xDB40, 0xDC6E, 0x200B, 0xDB40, 0xDC67, 0x200B, 0xDB40, 0xDC7F ]
				);

				return ! isIdentical;
			case \'emoji\':
				/*
				 * Love is love.
				 *
				 * To test for Emoji 12 support, try to render a new emoji: men holding hands, with different skin
				 * tone modifiers.
				 *
				 * When updating this test for future Emoji releases, ensure that individual emoji that make up the
				 * sequence come from older emoji standards.
				 */
				isIdentical = emojiSetsRenderIdentically(
					[0xD83D, 0xDC68, 0xD83C, 0xDFFE, 0x200D, 0xD83E, 0xDD1D, 0x200D, 0xD83D, 0xDC68, 0xD83C, 0xDFFC],
					[0xD83D, 0xDC68, 0xD83C, 0xDFFE, 0x200B, 0xD83E, 0xDD1D, 0x200B, 0xD83D, 0xDC68, 0xD83C, 0xDFFC]
				);

				return ! isIdentical;
		}

		return false;
	}

	/**
	 * Adds a script to the head of the document.
	 *
	 * @ignore
	 *
	 * @since 4.2.0
	 *
	 * @param {Object} src The url where the script is located.
	 * @return {void}
	 */
	function addScript( src ) {
		var script = document.createElement( \'script\' );

		script.src = src;
		script.defer = script.type = \'text/javascript\';
		document.getElementsByTagName( \'head\' )[0].appendChild( script );
	}

	tests = Array( \'flag\', \'emoji\' );

	settings.supports = {
		everything: true,
		everythingExceptFlag: true
	};

	/*
	 * Tests the browser support for flag emojis and other emojis, and adjusts the
	 * support settings accordingly.
	 */
	for( ii = 0; ii < tests.length; ii++ ) {
		settings.supports[ tests[ ii ] ] = browserSupportsEmoji( tests[ ii ] );

		settings.supports.everything = settings.supports.everything && settings.supports[ tests[ ii ] ];

		if ( \'flag\' !== tests[ ii ] ) {
			settings.supports.everythingExceptFlag = settings.supports.everythingExceptFlag && settings.supports[ tests[ ii ] ];
		}
	}

	settings.supports.everythingExceptFlag = settings.supports.everythingExceptFlag && ! settings.supports.flag;

	// Sets DOMReady to false and assigns a ready function to settings.
	settings.DOMReady = false;
	settings.readyCallback = function() {
		settings.DOMReady = true;
	};

	// When the browser can not render everything we need to load a polyfill.
	if ( ! settings.supports.everything ) {
		ready = function() {
			settings.readyCallback();
		};

		/*
		 * Cross-browser version of adding a dom ready event.
		 */
		if ( document.addEventListener ) {
			document.addEventListener( \'DOMContentLoaded\', ready, false );
			window.addEventListener( \'load\', ready, false );
		} else {
			window.attachEvent( \'onload\', ready );
			document.attachEvent( \'onreadystatechange\', function() {
				if ( \'complete\' === document.readyState ) {
					settings.readyCallback();
				}
			} );
		}

		src = settings.source || {};

		if ( src.concatemoji ) {
			addScript( src.concatemoji );
		} else if ( src.wpemoji && src.twemoji ) {
			addScript( src.twemoji );
			addScript( src.wpemoji );
		}
	}

} )( window, document, window._wpemojiSettings );
		</script>
		<style type="text/css">
img.wp-smiley,
img.emoji {
	display: inline !important;
	border: none !important;
	box-shadow: none !important;
	height: 1em !important;
	width: 1em !important;
	margin: 0 .07em !important;
	vertical-align: -0.1em !important;
	background: none !important;
	padding: 0 !important;
}
</style>
	<link rel=\'stylesheet\' id=\'wp-block-library-css\'  href=\'http://localhost/kholahat/wp-includes/css/dist/block-library/style.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'wc-block-style-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woocommerce/packages/woocommerce-blocks/build/style.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'jquery-selectBox-css\'  href=\'http://localhost/kholahat/wp-content/plugins/yith-woocommerce-wishlist/assets/css/jquery.selectBox.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'yith-wcwl-font-awesome-css\'  href=\'http://localhost/kholahat/wp-content/plugins/yith-woocommerce-wishlist/assets/css/font-awesome.min.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'yith-wcwl-main-css\'  href=\'http://localhost/kholahat/wp-content/plugins/yith-woocommerce-wishlist/assets/css/style.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'contact-form-7-css\'  href=\'http://localhost/kholahat/wp-content/plugins/contact-form-7/includes/css/styles.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'woocommerce-layout-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/css/woocommerce-layout.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'woocommerce-smallscreen-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/css/woocommerce-smallscreen.css\' type=\'text/css\' media=\'only screen and (max-width: 768px)\' />
<link rel=\'stylesheet\' id=\'woocommerce-general-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/css/woocommerce.css\' type=\'text/css\' media=\'all\' />
<style id=\'woocommerce-inline-inline-css\' type=\'text/css\'>
.woocommerce form .form-row .required { visibility: visible; }
</style>
<link rel=\'stylesheet\' id=\'xoo-wsc-css\'  href=\'http://localhost/kholahat/wp-content/plugins/rh-side-cart-wc/public/css/xoo-wsc-public.css\' type=\'text/css\' media=\'all\' />
<style id=\'xoo-wsc-inline-css\' type=\'text/css\'>

			.xoo-wsc-ctxt{
				font-size: 20px;
			}

			.xoo-wsc-container{
				width: 320px;
			}
			.xoo-wsc-body{
				font-size: 14px;
			}
			.xoo-wsc-img-col{
				width: 35%;
			}
			.xoo-wsc-sum-col{
				width: 60%;
			}
			.xoo-wsc-basket{
				background-color: #ffffff;
				bottom: 12px;
				position: fixed;
			}
			
			.xoo-wsc-bki{
				color: #000000;
				font-size: 35px;
			}
			.xoo-wsc-items-count{
				background-color: #cc0086;
				color: #ffffff;
			}
			.xoo-wsc-footer a.button{
				margin: 4px 0;
			}
		.xoo-wsc-footer{
				position: absolute;
			}
			.xoo-wsc-container{
				top: 0;
				bottom: 0;
			}
				.xoo-wsc-basket{
					right: 0;
				}
				.xoo-wsc-basket, .xoo-wsc-container{
					transition-property: right;
				}
				.xoo-wsc-items-count{
					left: -15px;
				}
				.xoo-wsc-container{
					right: -320px;
				}
				.xoo-wsc-modal.xoo-wsc-active .xoo-wsc-basket{
					right: 320px;
				}
				.xoo-wsc-modal.xoo-wsc-active .xoo-wsc-container{
					right: 0;
				}
			
</style>
<link rel=\'stylesheet\' id=\'yith-quick-view-css\'  href=\'http://localhost/kholahat/wp-content/plugins/yith-woocommerce-quick-view/assets/css/yith-quick-view.css\' type=\'text/css\' media=\'all\' />
<style id=\'yith-quick-view-inline-css\' type=\'text/css\'>

				#yith-quick-view-modal .yith-wcqv-main{background:#ffffff;}
				#yith-quick-view-close{color:#cdcdcd;}
				#yith-quick-view-close:hover{color:#ff0000;}
</style>
<link rel=\'stylesheet\' id=\'woocommerce_prettyPhoto_css-css\'  href=\'//localhost/kholahat/wp-content/plugins/woocommerce/assets/css/prettyPhoto.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'greenmart-theme-fonts-css\'  href=\'http://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900%7CRoboto+Slab:100,300,400,700&#038;subset=latin%2Clatin-ext\' type=\'text/css\' media=\'all\' />
<!--[if lt IE 9]>
<link rel=\'stylesheet\' id=\'vc_lte_ie9-css\'  href=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/css/vc_lte_ie9.min.css\' type=\'text/css\' media=\'screen\' />
<![endif]-->
<link rel=\'stylesheet\' id=\'js_composer_front-css\'  href=\'//localhost/kholahat/wp-content/uploads/js_composer/js_composer_front_custom.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'woo-variation-swatches-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woo-variation-swatches/assets/css/frontend.css\' type=\'text/css\' media=\'all\' />
<style id=\'woo-variation-swatches-inline-css\' type=\'text/css\'>
.variable-item:not(.radio-variable-item) { width : 30px; height : 30px; } .woo-variation-swatches-style-squared .button-variable-item { min-width : 30px; } .button-variable-item span { font-size : 16px; }
</style>
<link rel=\'stylesheet\' id=\'woo-variation-swatches-theme-override-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woo-variation-swatches/assets/css/wvs-theme-override.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'woo-variation-swatches-tooltip-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woo-variation-swatches/assets/css/frontend-tooltip.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'greenmart-woocommerce-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/skins/organic/woocommerce.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'font-awesome-css\'  href=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/lib/bower/font-awesome/css/font-awesome.min.css\' type=\'text/css\' media=\'all\' />
<style id=\'font-awesome-inline-css\' type=\'text/css\'>
[data-font="FontAwesome"]:before {font-family: \'FontAwesome\' !important;content: attr(data-icon) !important;speak: none !important;font-weight: normal !important;font-variant: normal !important;text-transform: none !important;line-height: 1 !important;font-style: normal !important;-webkit-font-smoothing: antialiased !important;-moz-osx-font-smoothing: grayscale !important;}
</style>
<link rel=\'stylesheet\' id=\'font-tbay-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/font-tbay-custom.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'simple-line-icons-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/simple-line-icons.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'material-design-iconic-font-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/material-design-iconic-font.min.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'themify-icons-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/themify-icons.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'greenmart-template-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/skins/organic/template.css\' type=\'text/css\' media=\'all\' />
<style id=\'greenmart-template-inline-css\' type=\'text/css\'>
.vc_custom_1505445847374{padding-bottom: 30px !important;}.vc_custom_1574831449989{margin-top: 10px !important;}.vc_custom_1574832046344{margin-top: 25px !important;margin-bottom: 15px !important;}
</style>
<link rel=\'stylesheet\' id=\'greenmart-style-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/style.css\' type=\'text/css\' media=\'all\' />
<style id=\'greenmart-style-inline-css\' type=\'text/css\'>
/* Custom Color (skin) *//* check main color *//***************************************************************//* Top Bar *****************************************************//***************************************************************//* Top Bar Backgound */#tbay-topbar, #tbay-header.header-v2 #tbay-topbar,#tbay-header.header-v4 #tbay-topbar {}/* Top Bar Color *//* Top Bar Link Color *//***************************************************************//* Header *****************************************************//***************************************************************//* Header Backgound */#tbay-header .header-main, #tbay-header.header-v3 .tbay-mainmenu {}/* Header Color *//* Header Link Color *//* Header Link Color Active *//* Menu Link Color *//* Menu Link Color Active *//***************************************************************//* Footer *****************************************************//***************************************************************//* Footer Backgound */#tbay-footer, .bottom-footer {}/* Footer Heading Color*//* Footer Color *//* Footer Link Color *//* Footer Link Color Hover*//***************************************************************//* Copyright *****************************************************//***************************************************************//* Copyright Backgound */.tbay-copyright {}/* Footer Color *//* Footer Link Color *//* Footer Link Color Hover*//* Woocommerce Breadcrumbs */.site-header .logo img {max-width: 160px;}.site-header .logo img {padding-top: 0;padding-right: 0;padding-bottom: 0;padding-left: 0;}@media (min-width: 768px) and (max-width: 1024px){/* Limit logo image width for tablet according to mobile header height */.logo-mobile-theme a img {max-width: 100px;}.logo-mobile-theme a img {padding-top: 0;padding-right: 0;padding-bottom: 0;padding-left: 0;}}@media (max-width: 768px) {/* Limit logo image height for mobile according to mobile header height */.mobile-logo a img {max-width: 200px;}.mobile-logo a img {padding-top: 0;padding-right: 0;padding-bottom: 0;padding-left: 0;}}/* Custom CSS */
</style>
<link rel=\'stylesheet\' id=\'sumoselect-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/sumoselect.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'jquery-fancybox-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/jquery.fancybox.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'jquery-treeview-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart/css/jquery.treeview.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'greenmart-child-style-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart-child/style.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'greenmart-child-icofont-css\'  href=\'http://localhost/kholahat/wp-content/themes/greenmart-child/css/icofont.css\' type=\'text/css\' media=\'all\' />
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/jquery/jquery.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/jquery/jquery-migrate.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/jquery-blockui/jquery.blockUI.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var wc_add_to_cart_params = {"ajax_url":"\/kholahat\/wp-admin\/admin-ajax.php","wc_ajax_url":"\/kholahat\/?wc-ajax=%%endpoint%%","i18n_view_cart":"View cart","cart_url":"http:\/\/localhost\/kholahat\/cart\/","is_cart":"","cart_redirect_after_add":"no"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/js/vendors/woocommerce-add-to-cart.js\'></script>
<link rel=\'https://api.w.org/\' href=\'http://localhost/kholahat/wp-json/\' />
<link rel="EditURI" type="application/rsd+xml" title="RSD" href="http://localhost/kholahat/xmlrpc.php?rsd" />
<link rel="wlwmanifest" type="application/wlwmanifest+xml" href="http://localhost/kholahat/wp-includes/wlwmanifest.xml" /> 
<meta name="generator" content="WordPress 5.3.2" />
<meta name="generator" content="WooCommerce 3.8.1" />
<link rel="canonical" href="http://localhost/kholahat/" />
<link rel=\'shortlink\' href=\'http://localhost/kholahat/\' />
<link rel="alternate" type="application/json+oembed" href="http://localhost/kholahat/wp-json/oembed/1.0/embed?url=http%3A%2F%2Flocalhost%2Fkholahat%2F" />
<link rel="alternate" type="text/xml+oembed" href="http://localhost/kholahat/wp-json/oembed/1.0/embed?url=http%3A%2F%2Flocalhost%2Fkholahat%2F&#038;format=xml" />

<link rel="stylesheet" href="http://localhost/kholahat/wp-content/plugins/wp-booster/css/style.css.php" type="text/css" media="screen" />
<meta name="referrer" content="always"/>	<noscript><style>.woocommerce-product-gallery{ opacity: 1 !important; }</style></noscript>
	<style type="text/css">.recentcomments a{display:inline !important;padding:0 !important;margin:0 !important;}</style><meta name="generator" content="Powered by WPBakery Page Builder - drag and drop page builder for WordPress."/>
<link rel="alternate" href="http://localhost/kholahat/" hreflang="en" />
<link rel="alternate" href="http://localhost/kholahat/bn/" hreflang="bn" />
<link rel="icon" href="http://localhost/kholahat/wp-content/uploads/2019/11/favicon-1.png" sizes="32x32" />
<link rel="icon" href="http://localhost/kholahat/wp-content/uploads/2019/11/favicon-1.png" sizes="192x192" />
<link rel="apple-touch-icon-precomposed" href="http://localhost/kholahat/wp-content/uploads/2019/11/favicon-1.png" />
<meta name="msapplication-TileImage" content="http://localhost/kholahat/wp-content/uploads/2019/11/favicon-1.png" />
<noscript><style> .wpb_animate_when_almost_visible { opacity: 1; }</style></noscript>	
</head>
<body class="home page-template-default page page-id-110 theme-greenmart woocommerce-no-js woo-variation-swatches woo-variation-swatches-theme-greenmart-child woo-variation-swatches-theme-child-greenmart woo-variation-swatches-style-squared woo-variation-swatches-attribute-behavior-blur woo-variation-swatches-tooltip-enabled woo-variation-swatches-stylesheet-enabled tbay-homepage v1  tbay-disable-ajax-popup-cart wpb-js-composer js-comp-ver-6.0.5 vc_responsive mobile-hidden-footer">
<div id="wrapper-container" class="wrapper-container v1">

	  

	  

<div id="tbay-mobile-smartmenu" data-themes="theme-light" data-enablesocial="1" data-socialjsons="[{\'icon\':\'fa fa-facebook\',\'url\':\'https:\/\/www.facebook.com\/\'},{\'icon\':\'fa fa-instagram\',\'url\':\'https:\/\/www.instagram.com\/\'},{\'icon\':\'fa fa-twitter\',\'url\':\'https:\/\/twitter.com\/\'},{\'icon\':\'fa fa-google-plus\',\'url\':\'https:\/\/plus.google.com\'}]" data-enabletabs="1" data-tabone="Menu" data-taboneicon="icon-menu icons" data-tabsecond="Categories" data-tabsecondicon="icon-grid icons" data-enableeffects="1" data-effectspanels="no-effect" data-effectslistitems="fx-listitems-fade" data-counters="1" data-title="Menu" data-enablesearch="1" data-textsearch="Search in menu..." data-searchnoresults="No results found." data-searchsplash="What are you looking for? </br>Start typing to search the menu." class="tbay-mmenu hidden-lg hidden-md v1"> 
    <div class="tbay-offcanvas-body">

        <nav id="tbay-mobile-menu-navbar" class="navbar navbar-offcanvas navbar-static">
            <div id="main-mobile-menu-mmenu" class="menu-category-menu-image-container"><ul id="main-mobile-menu-mmenu-wrapper" class="menu"><li id="menu-item-2623" class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-2623"><a href="http://localhost/kholahat/./home-appliances/">Home Appliances</a></li>
<li id="menu-item-2609" class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-2609"><a href="http://localhost/kholahat/./mother-babies/">Mother &#038; Babies</a></li>
<li id="menu-item-2608" class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-2608"><a href="http://localhost/kholahat/./meat-fishes/">Meat &#038; Fishes</a></li>
<li id="menu-item-2610" class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-2610"><a href="http://localhost/kholahat/./cosmetics/">Cosmetics</a></li>
<li id="menu-item-3500" class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-has-children  menu-item-3500"><a href="http://localhost/kholahat/./foods/">Foods</a>
<ul class="sub-menu">
	<li id="menu-item-3501" class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-3501"><a href="http://localhost/kholahat/./foods/breakfast-drinks/">Breakfast &#038; Drinks</a></li>
	<li id="menu-item-3502" class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-3502"><a href="http://localhost/kholahat/./foods/fruits-vegetables/">Fruits &#038; Vegetables</a></li>
</ul>
</li>
</ul></div><div id="mobile-menu-second-mmenu" class="menu-category-menu-image-container"><ul id="main-mobile-second-mmenu-wrapper" class="menu"><li class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-2623"><a href="http://localhost/kholahat/./home-appliances/">Home Appliances</a></li>
<li class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-2609"><a href="http://localhost/kholahat/./mother-babies/">Mother &#038; Babies</a></li>
<li class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-2608"><a href="http://localhost/kholahat/./meat-fishes/">Meat &#038; Fishes</a></li>
<li class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-2610"><a href="http://localhost/kholahat/./cosmetics/">Cosmetics</a></li>
<li class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-has-children  menu-item-3500"><a href="http://localhost/kholahat/./foods/">Foods</a>
<ul class="sub-menu">
	<li class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-3501"><a href="http://localhost/kholahat/./foods/breakfast-drinks/">Breakfast &#038; Drinks</a></li>
	<li class=" menu-item menu-item-type-taxonomy menu-item-object-product_cat  menu-item-3502"><a href="http://localhost/kholahat/./foods/fruits-vegetables/">Fruits &#038; Vegetables</a></li>
</ul>
</li>
</ul></div>        </nav>


    </div>
</div>


	<div class="topbar-device-mobile  visible-xxs clearfix">
				<div class="active-mobile">
			<a href="#tbay-mobile-menu-navbar" class="btn btn-sm btn-danger"><i class="fa fa-bars"></i></a><a href="#page" class="btn btn-sm btn-danger"><i class="fa fa-close"></i></a>		</div>
		<div class="mobile-logo">
							<div class="logo-theme">
					<a href="http://localhost/kholahat/">
						<img src="http://localhost/kholahat/wp-content/themes/greenmart/images/organic/mobile-logo.png" alt="Kholahat">
					</a>
				</div>
					</div>
		<div class="search-device">
			<a class="show-search" href="javascript:;"><i class="icon-magnifier icons"></i></a>
			
	<div class="tbay-search-form">
		<form action="http://localhost/kholahat/" method="get" data-appendto=".result-mobile">
			<div class="form-group">
				<div class="input-group">
									  		<input type="text" placeholder="I&rsquo;m searching for..." name="s" required oninvalid="this.setCustomValidity(\'Enter at least 2 characters\')" oninput="setCustomValidity(\'\')"  class="tbay-search form-control input-sm"/>
						<div class="tbay-preloader"></div>

					  	<div class="button-group input-group-addon">
							<button type="submit" class="button-search btn btn-sm"><i class="icofont-search-2"></i></button>
						</div>
						<div class="tbay-search-result result-mobile"></div>
											<input type="hidden" name="post_type" value="product" class="post_type" />
									</div>
				
			</div>
		</form>
	</div>

		</div>
					<div class="device-cart">
				<a class="mobil-view-cart" href="http://localhost/kholahat/cart/" >
					<i class="icon-basket icons"></i>
					<span class="mini-cart-items cart-mobile">0</span>
				</a>   
			</div>
		
	
</div>
	
	

        <div class="footer-device-mobile visible-xxs clearfix">
        <div class="device-home active ">
            <a href="http://localhost/kholahat/" >
                <i class="icon-home icons"></i>
                Home            </a>   
        </div>	

                    <div class="device-cart ">
                <a class="mobil-view-cart" href="http://localhost/kholahat/cart/" >
    				<span class="icon">
    					<i class="icon-basket icons"></i>
    					<span class="count mini-cart-items cart-mobile">0</span>
    					View Cart    				</span>
                </a>   
            </div>
        

                <div class="device-wishlist">
            <a class="text-skin wishlist-icon" href="http://localhost/kholahat/?wishlist-action">
    			<span class="icon">
    				<i class="icon-heart icons"></i>
    				<span class="count count_wishlist">0</span>
    				Wishlist    			</span>
            </a>
        </div>
        
                <div class="device-account ">
            <a href="http://localhost/kholahat/my-account/" title="Login">
                <i class="icon-user icons"></i>
                Account            </a>
        </div>
        
    </div>

    
	<div class="topbar-mobile  hidden-lg hidden-md hidden-xxs clearfix">
	<div class="logo-mobile-theme col-xs-6 text-left">
		
    <div class="logo">
        <a href="http://localhost/kholahat/">
            <img src="http://localhost/kholahat/wp-content/uploads/2019/11/kholahat-logo-1.png" alt="Kholahat">
        </a>
    </div>
 
        <h1 class="site-title"><a href="http://localhost/kholahat/" rel="home">Kholahat</a></h1>        <h2 class="site-description">Online Grocery Shopping and Delivery in Dhaka</h2>
	</div>
     <div class="topbar-mobile-right col-xs-6 text-right">
        <div class="active-mobile">
            <a href="#tbay-mobile-menu-navbar" class="btn btn-sm btn-danger"><i class="fa fa-bars"></i></a><a href="#page" class="btn btn-sm btn-danger"><i class="fa fa-close"></i></a>        </div>
        <div class="topbar-inner">
            <div class="search-device">
				<a class="show-search" href="javascript:;"><i class="icon-magnifier icons"></i></a>
				
	<div class="tbay-search-form">
		<form action="http://localhost/kholahat/" method="get" data-appendto=".result-mobile">
			<div class="form-group">
				<div class="input-group">
									  		<input type="text" placeholder="I&rsquo;m searching for..." name="s" required oninvalid="this.setCustomValidity(\'Enter at least 2 characters\')" oninput="setCustomValidity(\'\')"  class="tbay-search form-control input-sm"/>
						<div class="tbay-preloader"></div>

					  	<div class="button-group input-group-addon">
							<button type="submit" class="button-search btn btn-sm"><i class="icofont-search-2"></i></button>
						</div>
						<div class="tbay-search-result result-mobile"></div>
											<input type="hidden" name="post_type" value="product" class="post_type" />
									</div>
				
			</div>
		</form>
	</div>

			</div>
            
            <div class="setting-popup">

                <div class="dropdown">
                    <button class="btn btn-sm btn-primary btn-outline dropdown-toggle" type="button" data-toggle="dropdown"><span class="fa fa-user"></span></button>
                    <div class="dropdown-menu">
                                                    <div class="pull-left">
                                <div class="menu-top-menu-container"><ul id="menu-top-menu" class="menu-topbar"><li id="menu-item-2972" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2972"><a href="http://localhost/kholahat/checkout/">Checkout</a></li>
<li id="menu-item-2970" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2970"><a href="http://localhost/kholahat/wishlist/">Wishlist</a></li>
</ul></div>                            </div>
                                            </div>
                </div>

            </div>
            <div class="active-mobile top-cart">

                <div class="dropdown">
                    <button class="btn btn-sm btn-primary btn-outline dropdown-toggle" type="button" data-toggle="dropdown"><span class="fa fa-shopping-cart"></span></button>
                    <div class="dropdown-menu">
                        <div class="widget_shopping_cart_content"></div>
                    </div>
                </div>
                
            </div>  
        </div>
    </div>       
</div>

	
	<style>
    .tool-items li {
        list-style: none;
    }
</style>

<header id="tbay-header"
        class="site-header header-default header-v1 hidden-sm hidden-xs main-sticky-header"
        role="banner">
    <div class="header-main clearfix">
        <div class="container-fluid">
            <div class="header-inner d-flex justify-content-between bd-highlight mb-3">
                <!-- //LOGO -->
                <div class="logo-in-theme text-center">
                    
    <div class="logo">
        <a href="http://localhost/kholahat/">
            <img src="http://localhost/kholahat/wp-content/uploads/2019/11/kholahat-logo-1.png" alt="Kholahat">
        </a>
    </div>
                 </div>
                <!-- SEARCH -->
                <div class="search hidden-sm hidden-xs">
                    <div class="pull-right search-inp">
                                <div class="tbay-search-form ">
        <form action="http://localhost/kholahat/" method="get" data-appendto=".result-desktop">
            <div class="form-group">
                <div class="input-group">
                                        <input type="text"
                    placeholder="Search for products (e.g. eggs, milk, alu)"
                    name="s" required
                    oninvalid="this.setCustomValidity(\'Enter at least 2 characters                    \')"
                    oninput="setCustomValidity(\'\')" class="tbay-search form-control input-sm"/>
                    <div class="tbay-preloader"></div>
                    <div class="button-group input-group-addon">
                        <button type="submit" class="button-search btn btn-sm">
                            <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100">
                                <path d="M44.5,78.5c-18.8,0-34-15.3-34-34s15.3-34,34-34s34,15.3,34,34S63.3,78.5,44.5,78.5z M44.5,18.1  C30,18.1,18.2,30,18.2,44.5S30,70.8,44.5,70.8S70.9,59,70.9,44.5S59,18.1,44.5,18.1z"
                                ></path>
                                <path d="M87.2,91c-1,0-2-0.4-2.7-1.1L63.1,68.5c-1.5-1.5-1.5-3.9,0-5.4s3.9-1.5,5.4,0l21.3,21.3  c1.5,1.5,1.5,3.9,0,5.4C89.2,90.6,88.2,91,87.2,91z"
                                ></path>
                            </svg>
                        </button>
                    </div>

                    <div class="tbay-search-result result-desktop"></div>

                                            <input type="hidden" name="post_type"
                               value="product" class="post_type"/>
                                    </div>

            </div>
        </form>
    </div>

                    </div>
                </div>

                <div class="helpArea area hidden-sm hidden-xs"><a
                            href="http://localhost/kholahat/frequently-asked-questions/"><span>Need Help</span><span
                                class="questionIcon">?</span></a>
                </div>

                <div class="tool-items">
                    	<li class="lang-item lang-item-53 lang-item-bn lang-item-first"><a lang="bn-BD" hreflang="bn-BD" href="http://localhost/kholahat/bn/">বাংলা</a></li>

                    <span class="hidden">
                    <a href="http://localhost/kholahat/" title="English"
                       class="nturl notranslate en flag united-states tool-item"
                       data-lang="English">EN</a> |
                    <a href="http://localhost/kholahat/bn" title="Bengali"
                       class="nturl notranslate bn flag Bengali tool-item"
                       data-lang="Bengali">বাং</a>
                        </span>
                </div>


                <div class="hadd-card pull-right text-right clearfix">

                                                <div id="weglot_here"></div>


    <ul class="list-inline acount style1 ">
                    <li><a href="http://localhost/kholahat/my-account/"
                   title="Login"> Login </a>
            </li>
            </ul>
                    
                                            <div class="top-cart-wishlist pull-left">

                            <!-- Cart -->
                            <div class="top-cart hidden-xs pull-right">
                                <div class="tbay-topcart">
 <div id="cart" class="dropdown version-1">
        <span class="text-skin cart-icon">
			<i class="icofont-shopping-cart"></i>
			<span class="mini-cart-items">
			   0			</span>
		</span>
        <a class="dropdown-toggle mini-cart" data-toggle="dropdown" aria-expanded="true" role="button" aria-haspopup="true" data-delay="0" href="#" title="View your shopping cart">
            
			<span class="sub-title">My Shopping Cart  <i class="icofont-rounded-down"></i> </span>
			<span class="mini-cart-subtotal"><span class="woocommerce-Price-amount amount"><span class="woocommerce-Price-currencySymbol">&#2547;&nbsp;</span>0.00</span></span>
            
        </a>            
        <div class="dropdown-menu"><div class="widget_shopping_cart_content">
            

<div class="mini_cart_content">
	<div class="mini_cart_inner">
		<div class="mcart-border">
							<ul class="cart_empty ">
					<li>You have no items in your shopping cart</li>
					<li class="total">Subtotal: <span class="woocommerce-Price-amount amount"><span class="woocommerce-Price-currencySymbol">&#2547;&nbsp;</span>0.00</span></li>
				</ul>
			
						<div class="clearfix"></div>
		</div>
	</div>
</div>

        </div></div>
    </div>
</div>                                </div>
                        </div>
                    
                </div>
            </div>

        </div>
    </div>
    <section id="tbay-mainmenu" class="tbay-mainmenu hidden-xs hidden-sm">
        <div class="container">
                    </div>
    </section>
</header>
	<div id="tbay-main-content">

<section id="main-container" class="container inner">
	<div class="row">
		
				
		<div id="main-content" class="main-page clearfix">
			<div id="main" class="site-main" role="main">

				<div data-vc-full-width="true" data-vc-full-width-init="false" data-vc-stretch-content="true" class="vc_row wpb_row vc_row-fluid position-img vc_custom_1512654065866"><div class="container"><div class="vc_fluid col-sm-12 hidden-xs"><div class="vc_column-inner "><div class="wpb_wrapper"><div class="wpb_single_image widget wpb_content_element vc_align_center">
		
		<figure class="wpb_wrapper vc_figure">
			<div class="vc_single_image-wrapper tbay-image-loaded   vc_box_border_grey"><img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D&#039;http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg&#039; viewBox%3D&#039;0 0 600 400&#039;%2F%3E" data-src="http://localhost/kholahat/wp-content/uploads/2019/11/landingBanner.jpg" class="vc_single_image-img unveil-image" alt="landingBanner" /></div>
		</figure>
	</div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div>
<div class="widget widget-text-heading center  ">
	        <h3 class="widget-title" >
           <span>Our Product Categories</span>
        </h3>
        </div><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div></div></div></div></div><div class="woocommerce columns-3"><div class="products products-grid"><div class="row"  data-xlgdesktop=3 data-desktop=3 data-desktopsmall=3 data-tablet=2 data-mobile=2><li class="product-category product">
    <a href="http://localhost/kholahat/./foods/">
    <a class="show-cat" href="http://localhost/kholahat/./foods/">
        <span class="categoryName">
            Foods        </span>

        <span class="categoryImg">
        <img src="http://localhost/kholahat/wp-content/uploads/revslider/layer-3-slider1-405x330.png" alt="Foods" width="405" height="330" />        </span>

        
    </a>

    </a></li>
<li class="product-category product first">
    <a href="http://localhost/kholahat/./home-appliances/">
    <a class="show-cat" href="http://localhost/kholahat/./home-appliances/">
        <span class="categoryName">
            Home Appliances        </span>

        <span class="categoryImg">
        <img src="http://localhost/kholahat/wp-content/uploads/revslider/layer-3-slider1-405x330.png" alt="Home Appliances" width="405" height="330" />        </span>

        
    </a>

    </a></li>
<li class="product-category product last">
    <a href="http://localhost/kholahat/./spices/">
    <a class="show-cat" href="http://localhost/kholahat/./spices/">
        <span class="categoryName">
            Spices        </span>

        <span class="categoryImg">
        <img src="http://localhost/kholahat/wp-content/uploads/revslider/layer-3-slider1-405x330.png" alt="Spices" width="405" height="330" />        </span>

        
    </a>

    </a></li>
<li class="product-category product">
    <a href="http://localhost/kholahat/./fashion-jewelry/">
    <a class="show-cat" href="http://localhost/kholahat/./fashion-jewelry/">
        <span class="categoryName">
            Fashion &amp; Jewelry        </span>

        <span class="categoryImg">
        <img src="http://localhost/kholahat/wp-content/uploads/revslider/layer-3-slider1-405x330.png" alt="Fashion &amp; Jewelry" width="405" height="330" />        </span>

        
    </a>

    </a></li>
<li class="product-category product first">
    <a href="http://localhost/kholahat/./mother-babies/">
    <a class="show-cat" href="http://localhost/kholahat/./mother-babies/">
        <span class="categoryName">
            Mother &amp; Babies        </span>

        <span class="categoryImg">
        <img src="http://localhost/kholahat/wp-content/uploads/revslider/layer-3-slider1-405x330.png" alt="Mother &amp; Babies" width="405" height="330" />        </span>

        
    </a>

    </a></li>
<li class="product-category product last">
    <a href="http://localhost/kholahat/./meat-fishes/">
    <a class="show-cat" href="http://localhost/kholahat/./meat-fishes/">
        <span class="categoryName">
            Meat &amp; Fishes        </span>

        <span class="categoryImg">
        <img src="http://localhost/kholahat/wp-content/uploads/revslider/layer-3-slider1-405x330.png" alt="Meat &amp; Fishes" width="405" height="330" />        </span>

        
    </a>

    </a></li>
<li class="product-category product">
    <a href="http://localhost/kholahat/./cosmetics/">
    <a class="show-cat" href="http://localhost/kholahat/./cosmetics/">
        <span class="categoryName">
            Cosmetics        </span>

        <span class="categoryImg">
        <img src="http://localhost/kholahat/wp-content/uploads/revslider/layer-3-slider1-405x330.png" alt="Cosmetics" width="405" height="330" />        </span>

        
    </a>

    </a></li>
</div></div></div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div><div class="wpb_single_image widget wpb_content_element vc_align_center">
		
		<figure class="wpb_wrapper vc_figure">
			<div class="vc_single_image-wrapper tbay-image-loaded   vc_box_border_grey"><img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D&#039;http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg&#039; viewBox%3D&#039;0 0 600 400&#039;%2F%3E" data-src="http://localhost/kholahat/wp-content/uploads/2019/11/ad1.png" class="vc_single_image-img unveil-image" alt="" /></div>
		</figure>
	</div></div></div></div><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div></div></div></div></div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper">
	<div class="wpb_text_column wpb_content_element " >
		<div class="wpb_wrapper">
			<p style="text-align: center;"><strong>Dear Customers,</strong><br />
<strong>Welcome to KholaHat.com.</strong></p>
<p style="text-align: center;">If you&#8217;re searching for a product that is not in our category, you can ask us for it by filling out the form below.</p>

		</div>
	</div>
<noscript class="ninja-forms-noscript-message">
    Notice: JavaScript is required for this content.</noscript><div id="nf-form-1-cont" class="nf-form-cont" aria-live="polite" aria-labelledby="nf-form-title-1" aria-describedby="nf-form-errors-1" role="form">

    <div class="nf-loading-spinner"></div>

</div>
        <!-- TODO: Move to Template File. -->
        <script>var formDisplay=1;var nfForms=nfForms||[];var form=[];form.id=\'1\';form.settings={"objectType":"Form Setting","editActive":true,"title":"Contact Us","key":"","created_at":"2019-12-02 04:25:06","default_label_pos":"above","conditions":[],"show_title":0,"clear_complete":"1","hide_complete":"1","wrapper_class":"","element_class":"","add_submit":"1","logged_in":"","not_logged_in_msg":"","sub_limit_number":"","sub_limit_msg":"","calculations":[],"formContentData":["name_1575262696580","mobile_1575261661022","message_1575262022015","submit"],"container_styles_background-color":"","container_styles_border":"","container_styles_border-style":"","container_styles_border-color":"","container_styles_color":"","container_styles_height":"","container_styles_width":"","container_styles_font-size":"","container_styles_margin":"","container_styles_padding":"","container_styles_display":"","container_styles_float":"","container_styles_show_advanced_css":"0","container_styles_advanced":"","title_styles_background-color":"","title_styles_border":"","title_styles_border-style":"","title_styles_border-color":"","title_styles_color":"","title_styles_height":"","title_styles_width":"","title_styles_font-size":"","title_styles_margin":"","title_styles_padding":"","title_styles_display":"","title_styles_float":"","title_styles_show_advanced_css":"0","title_styles_advanced":"","row_styles_background-color":"","row_styles_border":"","row_styles_border-style":"","row_styles_border-color":"","row_styles_color":"","row_styles_height":"","row_styles_width":"","row_styles_font-size":"","row_styles_margin":"","row_styles_padding":"","row_styles_display":"","row_styles_show_advanced_css":"0","row_styles_advanced":"","row-odd_styles_background-color":"","row-odd_styles_border":"","row-odd_styles_border-style":"","row-odd_styles_border-color":"","row-odd_styles_color":"","row-odd_styles_height":"","row-odd_styles_width":"","row-odd_styles_font-size":"","row-odd_styles_margin":"","row-odd_styles_padding":"","row-odd_styles_display":"","row-odd_styles_show_advanced_css":"0","row-odd_styles_advanced":"","success-msg_styles_background-color":"","success-msg_styles_border":"","success-msg_styles_border-style":"","success-msg_styles_border-color":"","success-msg_styles_color":"","success-msg_styles_height":"","success-msg_styles_width":"","success-msg_styles_font-size":"","success-msg_styles_margin":"","success-msg_styles_padding":"","success-msg_styles_display":"","success-msg_styles_show_advanced_css":"0","success-msg_styles_advanced":"","error_msg_styles_background-color":"","error_msg_styles_border":"","error_msg_styles_border-style":"","error_msg_styles_border-color":"","error_msg_styles_color":"","error_msg_styles_height":"","error_msg_styles_width":"","error_msg_styles_font-size":"","error_msg_styles_margin":"","error_msg_styles_padding":"","error_msg_styles_display":"","error_msg_styles_show_advanced_css":"0","error_msg_styles_advanced":"","allow_public_link":0,"embed_form":"","changeEmailErrorMsg":"Please enter a valid email address!","changeDateErrorMsg":"Please enter a valid date!","confirmFieldErrorMsg":"These fields must match!","fieldNumberNumMinError":"Number Min Error","fieldNumberNumMaxError":"Number Max Error","fieldNumberIncrementBy":"Please increment by ","formErrorsCorrectErrors":"Please correct errors before submitting this form.","validateRequiredField":"This is a required field.","honeypotHoneypotError":"Honeypot Error","fieldsMarkedRequired":"Fields marked with an <span class=\"ninja-forms-req-symbol\">*<\/span> are required","currency":"","unique_field":"0","unique_field_error":"A form with this value has already been submitted.","drawerDisabled":false,"ninjaForms":"Ninja Forms","fieldTextareaRTEInsertLink":"Insert Link","fieldTextareaRTEInsertMedia":"Insert Media","fieldTextareaRTESelectAFile":"Select a file","formHoneypot":"If you are a human seeing this field, please leave it empty.","fileUploadOldCodeFileUploadInProgress":"File Upload in Progress.","fileUploadOldCodeFileUpload":"FILE UPLOAD","currencySymbol":false,"thousands_sep":",","decimal_point":".","siteLocale":"en_US","dateFormat":"m\/d\/Y","startOfWeek":"1","of":"of","previousMonth":"Previous Month","nextMonth":"Next Month","months":["January","February","March","April","May","June","July","August","September","October","November","December"],"monthsShort":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"weekdays":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"weekdaysShort":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],"weekdaysMin":["Su","Mo","Tu","We","Th","Fr","Sa"],"currency_symbol":"","beforeForm":"","beforeFields":"","afterFields":"","afterForm":""};form.fields=[{"objectType":"Field","objectDomain":"fields","editActive":false,"order":1,"type":"firstname","label":"Name","key":"name_1575262696580","label_pos":"above","required":1,"default":"","placeholder":"Your name","container_class":"","element_class":"","admin_label":"","help_text":"","custom_name_attribute":"fname","personally_identifiable":1,"value":"","drawerDisabled":false,"id":7,"beforeField":"","afterField":"","parentType":"firstname","element_templates":["firstname","input"],"old_classname":"","wrap_template":"wrap"},{"objectType":"Field","objectDomain":"fields","editActive":false,"order":2,"type":"phone","label":"Mobile","key":"mobile_1575261661022","label_pos":"above","required":1,"default":"","placeholder":8801783553817,"container_class":"","element_class":"","input_limit":"","input_limit_type":"characters","input_limit_msg":"Character(s) left","manual_key":false,"admin_label":"","help_text":"","mask":"","custom_mask":"","custom_name_attribute":"phone","personally_identifiable":1,"value":"","drawerDisabled":false,"id":6,"beforeField":"","afterField":"","parentType":"textbox","element_templates":["tel","textbox","input"],"old_classname":"","wrap_template":"wrap"},{"objectType":"Field","objectDomain":"fields","editActive":false,"order":3,"label":"Message","key":"message_1575262022015","type":"textarea","created_at":"2019-12-02 04:25:06","label_pos":"above","required":1,"placeholder":"Your requirements","default":"","wrapper_class":"","element_class":"","container_class":"","input_limit":"","input_limit_type":"characters","input_limit_msg":"Character(s) left","manual_key":"","disable_input":"","admin_label":"","help_text":"","desc_text":"","disable_browser_autocomplete":"","textarea_rte":0,"disable_rte_mobile":"","textarea_media":0,"wrap_styles_background-color":"","wrap_styles_border":"","wrap_styles_border-style":"","wrap_styles_border-color":"","wrap_styles_color":"","wrap_styles_height":"","wrap_styles_width":"","wrap_styles_font-size":"","wrap_styles_margin":"","wrap_styles_padding":"","wrap_styles_display":"","wrap_styles_float":"","wrap_styles_show_advanced_css":0,"wrap_styles_advanced":"","label_styles_background-color":"","label_styles_border":"","label_styles_border-style":"","label_styles_border-color":"","label_styles_color":"","label_styles_height":"","label_styles_width":"","label_styles_font-size":"","label_styles_margin":"","label_styles_padding":"","label_styles_display":"","label_styles_float":"","label_styles_show_advanced_css":0,"label_styles_advanced":"","element_styles_background-color":"","element_styles_border":"","element_styles_border-style":"","element_styles_border-color":"","element_styles_color":"","element_styles_height":"","element_styles_width":"","element_styles_font-size":"","element_styles_margin":"","element_styles_padding":"","element_styles_display":"","element_styles_float":"","element_styles_show_advanced_css":0,"element_styles_advanced":"","cellcid":"c3284","value":"","drawerDisabled":false,"id":3,"beforeField":"","afterField":"","parentType":"textarea","element_templates":["textarea","input"],"old_classname":"","wrap_template":"wrap"},{"objectType":"Field","objectDomain":"fields","editActive":false,"order":4,"label":"Submit","key":"submit","type":"submit","created_at":"2019-12-02 04:25:06","processing_label":"Processing","container_class":"","element_class":"","wrap_styles_background-color":"","wrap_styles_border":"","wrap_styles_border-style":"","wrap_styles_border-color":"","wrap_styles_color":"","wrap_styles_height":"","wrap_styles_width":"","wrap_styles_font-size":"","wrap_styles_margin":"","wrap_styles_padding":"","wrap_styles_display":"","wrap_styles_float":"","wrap_styles_show_advanced_css":0,"wrap_styles_advanced":"","label_styles_background-color":"","label_styles_border":"","label_styles_border-style":"","label_styles_border-color":"","label_styles_color":"","label_styles_height":"","label_styles_width":"","label_styles_font-size":"","label_styles_margin":"","label_styles_padding":"","label_styles_display":"","label_styles_float":"","label_styles_show_advanced_css":0,"label_styles_advanced":"","element_styles_background-color":"","element_styles_border":"","element_styles_border-style":"","element_styles_border-color":"","element_styles_color":"","element_styles_height":"","element_styles_width":"","element_styles_font-size":"","element_styles_margin":"","element_styles_padding":"","element_styles_display":"","element_styles_float":"","element_styles_show_advanced_css":0,"element_styles_advanced":"","submit_element_hover_styles_background-color":"","submit_element_hover_styles_border":"","submit_element_hover_styles_border-style":"","submit_element_hover_styles_border-color":"","submit_element_hover_styles_color":"","submit_element_hover_styles_height":"","submit_element_hover_styles_width":"","submit_element_hover_styles_font-size":"","submit_element_hover_styles_margin":"","submit_element_hover_styles_padding":"","submit_element_hover_styles_display":"","submit_element_hover_styles_float":"","submit_element_hover_styles_show_advanced_css":0,"submit_element_hover_styles_advanced":"","cellcid":"c3287","id":4,"beforeField":"","afterField":"","value":"","label_pos":"above","parentType":"textbox","element_templates":["submit","button","input"],"old_classname":"","wrap_template":"wrap-no-label"}];nfForms.push(form);</script>
        </div></div></div><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div></div></div></div></div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper">
<div class="widget widget-text-heading center  ">
	        <h3 class="widget-title" >
           <span>Why to buy from Kholahat?</span>
        </h3>
        </div></div></div></div><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div></div></div></div></div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="wpb_single_image widget wpb_content_element vc_align_center">
		
		<figure class="wpb_wrapper vc_figure">
			<div class="vc_single_image-wrapper tbay-image-loaded   vc_box_border_grey"><img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D&#039;http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg&#039; viewBox%3D&#039;0 0 600 400&#039;%2F%3E" data-src="http://localhost/kholahat/wp-content/uploads/2019/11/ad2.png" class="vc_single_image-img unveil-image" alt="" /></div>
		</figure>
	</div></div></div></div><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div></div></div></div></div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper">
<div class="widget widget-text-heading center  ">
	        <h3 class="widget-title" >
           <span>How to order from Kholahat?</span>
        </h3>
        </div></div></div></div><div class="vc_fluid col-sm-6"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="wpb_single_image widget wpb_content_element vc_align_center">
		
		<figure class="wpb_wrapper vc_figure">
			<div class="vc_single_image-wrapper tbay-image-loaded   vc_box_border_grey"><img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D&#039;http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg&#039; viewBox%3D&#039;0 0 600 400&#039;%2F%3E" data-src="http://localhost/kholahat/wp-content/uploads/2019/12/g2g-buyer-flow.png" class="vc_single_image-img unveil-image" alt="g2g-buyer-flow" /></div>
		</figure>
	</div></div></div></div><div class="vc_fluid col-sm-6"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="widget widget-video   ">
    <div class="video-wrapper-inner">
	<div class="video">
							<a class="fancybox-video fancybox.iframe tbay-image-loaded" href="https://www.youtube.com/embed/EN9T9pGFjRQ">
				<i class="fa fa-play-circle" aria-hidden="true"></i>
    		    <img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D&#039;http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg&#039; viewBox%3D&#039;0 0 600 400&#039;%2F%3E" data-src="http://localhost/kholahat/wp-content/uploads/2019/12/youtube_logo_dark.jpg" class=" unveil-image" alt="youtube_logo_dark" />        	</a>
        	</div>
	<div class="video-content">
					</div>
	</div>
</div></div></div></div><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div></div></div></div></div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper">
<div class="widget widget-text-heading center  ">
	        <h3 class="widget-title" >
           <span>Special Offer</span>
        </h3>
        </div></div></div></div></div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="wpb_images_carousel wpb_content_element vc_clearfix"><div class="wpb_wrapper"><div id="vc_images-carousel-1-1585996157" data-ride="vc_carousel" data-wrap="false" style="width: 100%;" data-interval="0" data-auto-height="yes" data-mode="horizontal" data-partial="false" data-per-view="1" data-hide-on-end="true" class="vc_slide vc_images_carousel"><ol class="vc_carousel-indicators"><li data-target="#vc_images-carousel-1-1585996157" data-slide-to="0"></li><li data-target="#vc_images-carousel-1-1585996157" data-slide-to="1"></li><li data-target="#vc_images-carousel-1-1585996157" data-slide-to="2"></li></ol><div class="vc_carousel-inner"><div class="vc_carousel-slideline"><div class="vc_carousel-slideline-inner"><div class="vc_item"><div class="vc_inner"><a class="prettyphoto" href="http://localhost/kholahat/wp-content/uploads/2019/11/tutorial-1-470x168.jpg" data-rel="prettyPhoto[rel-110-1096739241]"><img width="1008" height="360" src="http://localhost/kholahat/wp-content/uploads/2019/11/tutorial-1.jpg" class="attachment-full wp-post-image" alt="" /></a></div></div><div class="vc_item"><div class="vc_inner"><a class="prettyphoto" href="http://localhost/kholahat/wp-content/uploads/2019/11/tutorial-2-470x168.jpg" data-rel="prettyPhoto[rel-110-1096739241]"><img width="1008" height="360" src="http://localhost/kholahat/wp-content/uploads/2019/11/tutorial-2.jpg" class="attachment-full wp-post-image" alt="" /></a></div></div><div class="vc_item"><div class="vc_inner"><a class="prettyphoto" href="http://localhost/kholahat/wp-content/uploads/2019/11/tutorial-3-470x168.jpg" data-rel="prettyPhoto[rel-110-1096739241]"><img width="1008" height="360" src="http://localhost/kholahat/wp-content/uploads/2019/11/tutorial-3.jpg" class="attachment-full wp-post-image" alt="" /></a></div></div></div></div></div><a class="vc_left vc_carousel-control" href="#vc_images-carousel-1-1585996157" data-slide="prev"><span class="icon-prev"></span></a><a class="vc_right vc_carousel-control" href="#vc_images-carousel-1-1585996157" data-slide="next"><span class="icon-next"></span></a></div></div></div></div></div></div><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="vc_empty_space"   style="height: 32px"><span class="vc_empty_space_inner"></span></div></div></div></div></div><div class="wpb_gmaps_widget wpb_content_element"><div class="wpb_wrapper"><div class="wpb_map_wraper"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.2562976141026!2d90.3640540154299!3d23.77388598457784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c0afe5d038f5%3A0xcb48f980676a73ee!2sRupayan%20Shelford%2C%20Plot%20No%20%23%2023%2F6%2C%20Block%20%23B%2C%20Mirpur%20Rd%2C%20Dhaka%201207!5e0!3m2!1sen!2sbd!4v1574836953898!5m2!1sen!2sbd" width="600" height="450" frameborder="0" style="border:0;" allowfullscreen=""></iframe></div></div></div></div></div></div></div></div><div class="vc_row-full-width vc_clearfix"></div>
			</div><!-- .site-main -->

		</div><!-- .content-area -->
		
				
				
	</div>
</section>

	</div><!-- .site-content -->

	<footer id="tbay-footer" class="tbay-footer" role="contentinfo">
					<div class="vc_row wpb_row vc_row-fluid footer-top"><div class="container"><div class="row"><div class="vc_fluid col-sm-12"><div class="vc_column-inner "><div class="wpb_wrapper"><div class="vc_row wpb_row vc_inner vc_row-fluid top-footer"><div class="vc_fluid col-sm-3"><div class="vc_column-inner"><div class="wpb_wrapper">
	<div class="wpb_text_column wpb_content_element " >
		<div class="wpb_wrapper">
			<p><span class="txt1"><strong>Newsletter</strong> Sign Up</span><br />
<span class="txt2">(Get <strong>30% off</strong> coupon today subscibers)</span></p>

		</div>
	</div>
</div></div></div><div class="vc_fluid col-sm-4"><div class="vc_column-inner"><div class="wpb_wrapper">
	<div class="wpb_text_column wpb_content_element  vc_custom_1574831449989" >
		<div class="wpb_wrapper">
			<p><span class="txt3">Join <strong>35.000+ subscribers</strong> and get a new discount coupon on every Wednesday.</span></p>

		</div>
	</div>
</div></div></div><div class="vc_fluid col-sm-5"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="widget widget-newletter ">
        <div class="widget-content"> 
				
		
		<script>(function() {
	if ( ! window.mc4wp) {
		window.mc4wp = {
			listeners: [],
			forms    : {
				on: function (event, callback) {
					window.mc4wp.listeners.push(
						{
							event   : event,
							callback: callback
						}
					);
				}
			}
		}
	}
})();
</script><!-- Mailchimp for WordPress v4.7.4 - https://wordpress.org/plugins/mailchimp-for-wp/ --><form id="mc4wp-form-1" class="mc4wp-form mc4wp-form-227" method="post" data-id="227" data-name="newletters" ><div class="mc4wp-form-fields"><div class="mail-style1">
<div class="input-group">
    <input id="mc4wp_email" class="form-control input-newletter" name="EMAIL" required="required" type="email" placeholder="Enter your email address" /> 
    <span class="input-group-btn"> 
      <input class="btn btn-default" type="submit" value="SUBSCRIBE" />
    </span>
  </div>
</div></div><label style="display: none !important;">Leave this field empty if you\'re human: <input type="text" name="_mc4wp_honeypot" value="" tabindex="-1" autocomplete="off" /></label><input type="hidden" name="_mc4wp_timestamp" value="1585996157" /><input type="hidden" name="_mc4wp_form_id" value="227" /><input type="hidden" name="_mc4wp_form_element_id" value="mc4wp-form-1" /><div class="mc4wp-response"></div></form><!-- / Mailchimp for WordPress Plugin -->	</div>
</div></div></div></div></div></div></div></div></div></div></div><div class="vc_row wpb_row vc_row-fluid footer-content"><div class="container"><div class="row"><div class="marg-bt-35 vc_fluid col-sm-3"><div class="vc_column-inner "><div class="wpb_wrapper">
<div class="widget widget-text-heading center  ">
	        <h3 class="widget-title" >
           <span>get the app</span>
        </h3>
        </div>
	<div class="wpb_text_column wpb_content_element " >
		<div class="wpb_wrapper">
			<p class="txt-4">Kholahat App is now available on Google Play &amp; App Store. Get it now.</p>

		</div>
	</div>

	<div class="wpb_text_column wpb_content_element " >
		<div class="wpb_wrapper">
			<div class="app-download-section">
<div class="wrap">
<div class="google_play_store"><a href="https://play.google.com/store/apps/details?id=com.chaldal.poached"><img src="https://cdn.chaldal.net/asset/Egg.Grocery.Fabric/Egg.Grocery.Web/1.5.0+Release-237/Default/components/shared/NewFooter/images/google_play_store.png?q=low&amp;webp=1&amp;alpha=1" /></a></div>
<div class="app_store"><a href="https://itunes.apple.com/us/app/chaldal-online-grocery/id1104493220"><img src="https://cdn.chaldal.net/asset/Egg.Grocery.Fabric/Egg.Grocery.Web/1.5.0+Release-237/Default/components/shared/NewFooter/images/app_store.png?q=low&amp;webp=1&amp;alpha=1" /></a></div>
</div>
</div>

		</div>
	</div>
</div></div></div><div class="marg-bt-35 vc_fluid col-sm-2"><div class="vc_column-inner "><div class="wpb_wrapper"><div class="tbay_custom_menu wpb_content_element none-menu"><div class="widget widget_nav_menu"><h2 class="widgettitle">Information</h2><div class="nav menu-category-menu-container"><ul id="footer-1-i0cxf" class="menu"><li id="menu-item-2982" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2982 aligned-"><a href="http://localhost/kholahat/cart/">My Cart</a></li>
<li id="menu-item-2985" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2985 aligned-"><a href="http://localhost/kholahat/wishlist/">Wishlist</a></li>
<li id="menu-item-2983" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2983 aligned-"><a href="http://localhost/kholahat/checkout/">Checkout</a></li>
</ul></div></div></div></div></div></div><div class="marg-bt-35 vc_fluid col-sm-2"><div class="vc_column-inner "><div class="wpb_wrapper"><div class="tbay_custom_menu wpb_content_element none-menu"><div class="widget widget_nav_menu"><h2 class="widgettitle">user area</h2><div class="nav menu-category-menu-container"><ul id="footer-1-efa0S" class="menu"><li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2982 aligned-"><a href="http://localhost/kholahat/cart/">My Cart</a></li>
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2985 aligned-"><a href="http://localhost/kholahat/wishlist/">Wishlist</a></li>
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2983 aligned-"><a href="http://localhost/kholahat/checkout/">Checkout</a></li>
</ul></div></div></div></div></div></div><div class="marg-bt-35 clearfix vc_fluid col-sm-2"><div class="vc_column-inner "><div class="wpb_wrapper"><div class="tbay_custom_menu wpb_content_element none-menu"><div class="widget widget_nav_menu"><h2 class="widgettitle">guide &amp; help</h2><div class="nav menu-category-menu-container"><ul id="footer-1-JOebS" class="menu"><li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2982 aligned-"><a href="http://localhost/kholahat/cart/">My Cart</a></li>
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2985 aligned-"><a href="http://localhost/kholahat/wishlist/">Wishlist</a></li>
<li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-2983 aligned-"><a href="http://localhost/kholahat/checkout/">Checkout</a></li>
</ul></div></div></div></div></div></div><div class="marg-bt-35 vc_fluid col-sm-3"><div class="vc_column-inner "><div class="wpb_wrapper">
<div class="widget widget-text-heading center  ">
	        <h3 class="widget-title" >
           <span>contact info</span>
        </h3>
        </div>
	<div class="wpb_text_column wpb_content_element " >
		<div class="wpb_wrapper">
			<div class="ft-contact-info">
<p><span class="txt1"><i class="icofont icofont-headphone-alt-1"></i>01783-553817</span><br />
<span class="txt2">Rupayan Shelford, Plot No # 23/6, Block # B, Mirpur Rd, Dhaka-1207</span><br />
<a class="txt3" href="#">support@kholahat.com</a></p>
</div>

		</div>
	</div>
<div class="widget widget-social ">
        <div class="widget-content">
    			<ul class="social list-inline">
		    		                <li>
		                    <a href="https://themeforest.net/user/thembay" class="facebook" target="_blank">
		                        <i class="fa fa-facebook "></i>
		                    </a>
		                </li>
		    		                <li>
		                    <a href="https://twitter.com/bay_them" class="twitter" target="_blank">
		                        <i class="fa fa-twitter "></i>
		                    </a>
		                </li>
		    		                <li>
		                    <a href="https://www.youtube.com/channel/UCIkuoXjv4tS6SUHhEBAg9Ew/" class="youtube" target="_blank">
		                        <i class="fa fa-youtube "></i>
		                    </a>
		                </li>
		    		                <li>
		                    <a href="#" class="google-plus" target="_blank">
		                        <i class="fa fa-google-plus "></i>
		                    </a>
		                </li>
		    		                <li>
		                    <a href="https://www.instagram.com/thembayteam/" class="instagram" target="_blank">
		                        <i class="fa fa-instagram "></i>
		                    </a>
		                </li>
		    		</ul>
	</div>
</div></div></div></div></div></div></div><div class="vc_row wpb_row vc_row-fluid bottom-footer vc_custom_1505445847374"><div class="container"><div class="row"><div class="vc_fluid col-sm-12"><div class="vc_column-inner "><div class="wpb_wrapper"><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-12"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="wpb_single_image widget wpb_content_element vc_align_center  vc_custom_1574832046344">
		
		<figure class="wpb_wrapper vc_figure">
			<a href="#" target="_self" class="vc_single_image-wrapper tbay-image-loaded   vc_box_border_grey"><img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D&#039;http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg&#039; viewBox%3D&#039;0 0 600 400&#039;%2F%3E" data-src="http://localhost/kholahat/wp-content/uploads/2019/11/kholahat-logo-1.png" class="vc_single_image-img unveil-image" alt="kholahat-logo-1" /></a>
		</figure>
	</div></div></div></div></div><div class="vc_row wpb_row vc_inner vc_row-fluid"><div class="vc_fluid col-sm-3"><div class="vc_column-inner"><div class="wpb_wrapper">
	<div class="wpb_text_column wpb_content_element  payIcons" >
		<div class="wpb_wrapper">
			<p><img src="https://cdn.chaldal.net/asset/Egg.Grocery.Fabric/Egg.Grocery.Web/1.5.0+Release-237/Default/components/shared/NewFooter/images/Amex.png?q=low&amp;webp=1&amp;alpha=1" /><img src="https://cdn.chaldal.net/asset/Egg.Grocery.Fabric/Egg.Grocery.Web/1.5.0+Release-237/Default/components/shared/NewFooter/images/mastercard.png?q=low&amp;webp=1&amp;alpha=1" /><img src="https://cdn.chaldal.net/asset/Egg.Grocery.Fabric/Egg.Grocery.Web/1.5.0+Release-237/Default/components/shared/NewFooter/images/VIsa.png?q=low&amp;webp=1&amp;alpha=1" /><img src="https://cdn.chaldal.net/asset/Egg.Grocery.Fabric/Egg.Grocery.Web/1.5.0+Release-237/Default/components/shared/NewFooter/images/bkash.png?v=1&amp;q=low&amp;webp=1&amp;alpha=1" /><img src="https://cdn.chaldal.net/asset/Egg.Grocery.Fabric/Egg.Grocery.Web/1.5.0+Release-237/Default/components/shared/NewFooter/images/COD.png?v=1&amp;q=low&amp;webp=1&amp;alpha=1" /></p>

		</div>
	</div>
</div></div></div><div class="vc_fluid col-sm-6"><div class="vc_column-inner"><div class="wpb_wrapper">
	<div class="wpb_text_column wpb_content_element  coppyright" >
		<div class="wpb_wrapper">
			<p>Copyright © 2019 <a class="text-theme" href="https://kholahat.com">Kholahat</a> All Rights Reserved.</p>

		</div>
	</div>
</div></div></div><div class="vc_fluid col-sm-3"><div class="vc_column-inner"><div class="wpb_wrapper"><div class="tbay_custom_menu wpb_content_element menu-bottom-ft none-menu"><div class="widget widget_nav_menu"><div class="nav menu-category-menu-container"><ul id="menu-bottom-footer-63gy4" class="menu"><li id="menu-item-3003" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3003 aligned-left"><a href="http://localhost/kholahat/about-us/">About Kholahat</a></li>
<li id="menu-item-3004" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3004 aligned-left"><a href="http://localhost/kholahat/cart/">Cart</a></li>
<li id="menu-item-3005" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3005 aligned-left"><a href="http://localhost/kholahat/contact-us/">Contact Us</a></li>
</ul></div></div></div></div></div></div></div></div></div></div></div></div></div><div class="vc_row wpb_row vc_row-fluid"><div class="container"><div class="row"><div class="vc_fluid col-sm-12"><div class="vc_column-inner "><div class="wpb_wrapper"><div  class="wpb_widgetised_column wpb_content_element no-margin">
		<div class="wpb_wrapper">
			
			
		</div>
	</div>
</div></div></div></div></div></div>					
	</footer><!-- .site-footer -->

		
	
		
	

</div><!-- .site -->


<div class="xoo-wsc-modal">

            

        <div class="xoo-wsc-basket" style="">
                            <section class="stickyHeader">
                    <div class="itemCount">
                        <svg version="1.1" id="Calque_1" x="0px" y="0px" style="fill:#FDD670;stroke:#FDD670;"
                             width="16px"
                             height="24px" viewBox="0 0 100 160.13">
                            <g>
                                <polygon points="11.052,154.666 21.987,143.115 35.409,154.666"></polygon>
                                <path d="M83.055,36.599c-0.323-7.997-1.229-15.362-2.72-19.555c-2.273-6.396-5.49-7.737-7.789-7.737
                                c-6.796,0-13.674,11.599-16.489,25.689l-3.371-0.2l-0.19-0.012l-5.509,1.333c-0.058-9.911-1.01-17.577-2.849-22.747
                                   c-2.273-6.394-5.49-7.737-7.788-7.737c-8.618,0-17.367,18.625-17.788,37.361l-13.79,3.336l0.18,1.731h-0.18v106.605l17.466-17.762
                                      l18.592,17.762V48.06H9.886l42.845-10.764l2.862,0.171c-0.47,2.892-0.74,5.865-0.822,8.843l-8.954,1.75v106.605l48.777-10.655
                                         V38.532l0.073-1.244L83.055,36.599z M36.35,8.124c2.709,0,4.453,3.307,5.441,6.081c1.779,5.01,2.69,12.589,2.711,22.513
                                          l-23.429,5.667C21.663,23.304,30.499,8.124,36.35,8.124z M72.546,11.798c2.709,0,4.454,3.308,5.44,6.081
                                            c1.396,3.926,2.252,10.927,2.571,18.572l-22.035-1.308C61.289,21.508,67.87,11.798,72.546,11.798z M58.062,37.612l22.581,1.34
                                              c0.019,0.762,0.028,1.528,0.039,2.297l-23.404,4.571C57.375,42.986,57.637,40.234,58.062,37.612z M83.165,40.766
                                                c-0.007-0.557-0.01-1.112-0.021-1.665l6.549,0.39L83.165,40.766z"
                                ></path>
                            </g>
                        </svg>
                        <p>
                            <span class="rh-wsc-items-count">
                                 ITEMS                            </span>
                        </p></div>
                    <div class="total">
                        <div class="odometer odometer-auto-theme odometer-animating-up odometer-animating">
                            <span class="rh-wsc-items-subtotal"><span class="woocommerce-Price-amount amount"><span class="woocommerce-Price-currencySymbol">&#2547;&nbsp;</span>0.00</span></span>
                        </div>
                    </div>
                </section>
            
        </div>
    
    <div class="xoo-wsc-opac"></div>
    <div class="xoo-wsc-container">
            </div>
</div>

<div class="xoo-wsc-notice-box" style="display: none;">
    <div>
        <span class="xoo-wsc-notice"></span>
    </div>
</div>
<div id="yith-quick-view-modal">
	<div class="yith-quick-view-overlay"></div>
	<div class="yith-wcqv-wrapper">
		<div class="yith-wcqv-main">
			<div class="yith-wcqv-head">
				<a href="#" id="yith-quick-view-close" class="yith-wcqv-close">X</a>
			</div>
			<div id="yith-quick-view-content" class="woocommerce single-product"></div>
		</div>
	</div>
</div>
    <div class="modal fade" id="tbay-cart-modal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-body">
                    <button type="button" class="close btn btn-close" data-dismiss="modal" aria-hidden="true">
                        <i class="fa fa-times"></i>
                    </button>
                    <div class="modal-body-content"></div>
                </div>
            </div>
        </div>
    </div>
    <script>(function() {function addEventListener(element,event,handler) {
	if (element.addEventListener) {
		element.addEventListener( event,handler, false );
	} else if (element.attachEvent) {
		element.attachEvent( \'on\' + event,handler );
	}
}
function maybePrefixUrlField() {
	if (this.value.trim() !== \'\' && this.value.indexOf( \'http\' ) !== 0) {
		this.value = "http://" + this.value;
	}
}

var urlFields = document.querySelectorAll( \'.mc4wp-form input[type="url"]\' );
if ( urlFields && urlFields.length > 0 ) {
	for ( var j = 0; j < urlFields.length; j++ ) {
		addEventListener( urlFields[j],\'blur\',maybePrefixUrlField );
	}
}
/* test if browser supports date fields */
var testInput = document.createElement( \'input\' );
testInput.setAttribute( \'type\', \'date\' );
if ( testInput.type !== \'date\') {

	/* add placeholder & pattern to all date fields */
	var dateFields = document.querySelectorAll( \'.mc4wp-form input[type="date"]\' );
	for (var i = 0; i < dateFields.length; i++) {
		if ( ! dateFields[i].placeholder) {
			dateFields[i].placeholder = \'YYYY-MM-DD\';
		}
		if ( ! dateFields[i].pattern) {
			dateFields[i].pattern = \'[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])\';
		}
	}
}
})();</script>	<script type="text/javascript">
		var c = document.body.className;
		c = c.replace(/woocommerce-no-js/, \'woocommerce-js\');
		document.body.className = c;
	</script>
	
<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
	<div class="pswp__bg"></div>
	<div class="pswp__scroll-wrap">
		<div class="pswp__container">
			<div class="pswp__item"></div>
			<div class="pswp__item"></div>
			<div class="pswp__item"></div>
		</div>
		<div class="pswp__ui pswp__ui--hidden">
			<div class="pswp__top-bar">
				<div class="pswp__counter"></div>
				<button class="pswp__button pswp__button--close" aria-label="Close (Esc)"></button>
				<button class="pswp__button pswp__button--share" aria-label="Share"></button>
				<button class="pswp__button pswp__button--fs" aria-label="Toggle fullscreen"></button>
				<button class="pswp__button pswp__button--zoom" aria-label="Zoom in/out"></button>
				<div class="pswp__preloader">
					<div class="pswp__preloader__icn">
						<div class="pswp__preloader__cut">
							<div class="pswp__preloader__donut"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
				<div class="pswp__share-tooltip"></div>
			</div>
			<button class="pswp__button pswp__button--arrow--left" aria-label="Previous (arrow left)"></button>
			<button class="pswp__button pswp__button--arrow--right" aria-label="Next (arrow right)"></button>
			<div class="pswp__caption">
				<div class="pswp__caption__center"></div>
			</div>
		</div>
	</div>
</div>
<script type="text/template" id="tmpl-variation-template">
	<div class="woocommerce-variation-description">{{{ data.variation.variation_description }}}</div>
	<div class="woocommerce-variation-price">{{{ data.variation.price_html }}}</div>
	<div class="woocommerce-variation-availability">{{{ data.variation.availability_html }}}</div>
</script>
<script type="text/template" id="tmpl-unavailable-variation-template">
	<p>Sorry, this product is unavailable. Please choose a different combination.</p>
</script>
<link rel=\'stylesheet\' id=\'dashicons-css\'  href=\'http://localhost/kholahat/wp-includes/css/dashicons.css\' type=\'text/css\' media=\'all\' />
<style id=\'dashicons-inline-css\' type=\'text/css\'>
[data-font="Dashicons"]:before {font-family: \'Dashicons\' !important;content: attr(data-icon) !important;speak: none !important;font-weight: normal !important;font-variant: normal !important;text-transform: none !important;line-height: 1 !important;font-style: normal !important;-webkit-font-smoothing: antialiased !important;-moz-osx-font-smoothing: grayscale !important;}
</style>
<link rel=\'stylesheet\' id=\'nf-display-css\'  href=\'http://localhost/kholahat/wp-content/plugins/rh-enquiry-forms/assets/css/display-opinions-light.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'nf-font-awesome-css\'  href=\'http://localhost/kholahat/wp-content/plugins/rh-enquiry-forms/assets/css/font-awesome.min.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'vc_carousel_css-css\'  href=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/lib/vc_carousel/css/vc_carousel.min.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'prettyphoto-css\'  href=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/lib/prettyphoto/css/prettyPhoto.min.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'photoswipe-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/css/photoswipe/photoswipe.css\' type=\'text/css\' media=\'all\' />
<link rel=\'stylesheet\' id=\'photoswipe-default-skin-css\'  href=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/css/photoswipe/default-skin/default-skin.css\' type=\'text/css\' media=\'all\' />
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/jquery/ui/core.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/jquery/ui/widget.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/jquery/ui/position.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/jquery/ui/menu.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/dist/vendor/wp-polyfill.js\'></script>
<script type=\'text/javascript\'>
( \'fetch\' in window ) || document.write( \'<script src="http://localhost/kholahat/wp-includes/js/dist/vendor/wp-polyfill-fetch.js"></scr\' + \'ipt>\' );( document.contains ) || document.write( \'<script src="http://localhost/kholahat/wp-includes/js/dist/vendor/wp-polyfill-node-contains.js"></scr\' + \'ipt>\' );( window.FormData && window.FormData.prototype.keys ) || document.write( \'<script src="http://localhost/kholahat/wp-includes/js/dist/vendor/wp-polyfill-formdata.js"></scr\' + \'ipt>\' );( Element.prototype.matches && Element.prototype.closest ) || document.write( \'<script src="http://localhost/kholahat/wp-includes/js/dist/vendor/wp-polyfill-element-closest.js"></scr\' + \'ipt>\' );
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/dist/dom-ready.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/dist/a11y.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var uiAutocompleteL10n = {"noResults":"No results found.","oneResult":"1 result found. Use up and down arrow keys to navigate.","manyResults":"%d results found. Use up and down arrow keys to navigate.","itemSelected":"Item selected."};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/jquery/ui/autocomplete.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/skins/organic/autocomplete-search-init.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/yith-woocommerce-wishlist/assets/js/jquery.selectBox.min.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var yith_wcwl_l10n = {"ajax_url":"\/kholahat\/wp-admin\/admin-ajax.php","redirect_to_cart":"no","multi_wishlist":"","hide_add_button":"1","enable_ajax_loading":"","ajax_loader_url":"http:\/\/localhost\/kholahat\/wp-content\/plugins\/yith-woocommerce-wishlist\/assets\/images\/ajax-loader-alt.svg","remove_from_wishlist_after_add_to_cart":"1","labels":{"cookie_disabled":"We are sorry, but this feature is available only if cookies on your browser are enabled.","added_to_cart_message":"<div class=\"woocommerce-notices-wrapper\"><div class=\"woocommerce-message\" role=\"alert\">Product added to cart successfully<\/div><\/div>"},"actions":{"add_to_wishlist_action":"add_to_wishlist","remove_from_wishlist_action":"remove_from_wishlist","reload_wishlist_and_adding_elem_action":"reload_wishlist_and_adding_elem","load_mobile_action":"load_mobile","delete_item_action":"delete_item","save_title_action":"save_title","save_privacy_action":"save_privacy","load_fragments":"load_fragments"}};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/yith-woocommerce-wishlist/assets/js/unminified/jquery.yith-wcwl.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var wpcf7 = {"apiSettings":{"root":"http:\/\/localhost\/kholahat\/wp-json\/contact-form-7\/v1","namespace":"contact-form-7\/v1"}};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/contact-form-7/includes/js/scripts.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/js-cookie/js.cookie.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var woocommerce_params = {"ajax_url":"\/kholahat\/wp-admin\/admin-ajax.php","wc_ajax_url":"\/kholahat\/?wc-ajax=%%endpoint%%"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/frontend/woocommerce.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/jquery-cookie/jquery.cookie.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var wc_cart_fragments_params = {"ajax_url":"\/kholahat\/wp-admin\/admin-ajax.php","wc_ajax_url":"\/kholahat\/?wc-ajax=%%endpoint%%","cart_hash_key":"wc_cart_hash_d20ae640f97fdd20eea3e6c10b1bb39b","fragment_name":"wc_fragments_d20ae640f97fdd20eea3e6c10b1bb39b","request_timeout":"5000"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woo-poly-integration/public/js/Cart.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var yith_qv = {"ajaxurl":"\/kholahat\/wp-admin\/admin-ajax.php","loader":"http:\/\/localhost\/kholahat\/wp-content\/plugins\/yith-woocommerce-quick-view\/assets\/image\/qv-loader.gif","lang":"en"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/yith-woocommerce-quick-view/assets/js/frontend.js\'></script>
<script type=\'text/javascript\' src=\'//localhost/kholahat/wp-content/plugins/woocommerce/assets/js/prettyPhoto/jquery.prettyPhoto.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var mailchimp_public_data = {"site_url":"http:\/\/localhost\/kholahat","ajax_url":"http:\/\/localhost\/kholahat\/wp-admin\/admin-ajax.php"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/mailchimp-for-woocommerce/public/js/mailchimp-woocommerce-public.min.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var cart_qty_ajax = {"ajax_url":"http:\/\/localhost\/kholahat\/wp-admin\/admin-ajax.php"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/cart-qty-ajax.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/underscore.min.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var _wpUtilSettings = {"ajax":{"url":"\/kholahat\/wp-admin\/admin-ajax.php"}};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/wp-util.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var woo_variation_swatches_options = {"is_product_page":""};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woo-variation-swatches/assets/js/frontend.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/slick.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/jquery.sumoselect.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/jquery.fancybox.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/greenmart-skip-link-fix.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/jquery.mmenu.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/jquery.treeview.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/bootstrap.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/js/dist/js_composer_front.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/owl.carousel.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/woocommerce.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/jquery.countdownTimer.min.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var greenmart_ajax = {"ajaxurl":"http:\/\/localhost\/kholahat\/wp-admin\/admin-ajax.php"};
var greenmart_settings = {"active_theme":"organic","cancel":"cancel","mobile":"","search":"Search","view_all":"View All","ajax_single_add_to_cart":"1","ajax_update_quantity":"1"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/functions.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/themes/greenmart/js/skins/organic/functions.min.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var rh_wsc_localize = {"adminurl":"http:\/\/localhost\/kholahat\/wp-admin\/admin-ajax.php","wc_ajax_url":"\/kholahat\/?wc-ajax=%%endpoint%%","ajax_atc":"1","added_to_cart":"","auto_open_cart":"1","atc_icons":"1","atc_reset":"1","trigger_class":null,"cont_height":"full_screen"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/rh-side-cart-wc/public/js/xoo-wsc-public.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/wp-embed.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-includes/js/backbone.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/rh-enquiry-forms/assets/js/min/front-end-deps.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var nfi18n = {"ninjaForms":"Ninja Forms","changeEmailErrorMsg":"Please enter a valid email address!","changeDateErrorMsg":"Please enter a valid date!","confirmFieldErrorMsg":"These fields must match!","fieldNumberNumMinError":"Number Min Error","fieldNumberNumMaxError":"Number Max Error","fieldNumberIncrementBy":"Please increment by ","fieldTextareaRTEInsertLink":"Insert Link","fieldTextareaRTEInsertMedia":"Insert Media","fieldTextareaRTESelectAFile":"Select a file","formErrorsCorrectErrors":"Please correct errors before submitting this form.","formHoneypot":"If you are a human seeing this field, please leave it empty.","validateRequiredField":"This is a required field.","honeypotHoneypotError":"Honeypot Error","fileUploadOldCodeFileUploadInProgress":"File Upload in Progress.","fileUploadOldCodeFileUpload":"FILE UPLOAD","currencySymbol":"","fieldsMarkedRequired":"Fields marked with an <span class=\"ninja-forms-req-symbol\">*<\/span> are required","thousands_sep":",","decimal_point":".","siteLocale":"en_US","dateFormat":"m\/d\/Y","startOfWeek":"1","of":"of","previousMonth":"Previous Month","nextMonth":"Next Month","months":["January","February","March","April","May","June","July","August","September","October","November","December"],"monthsShort":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"weekdays":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"weekdaysShort":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],"weekdaysMin":["Su","Mo","Tu","We","Th","Fr","Sa"]};
var nfFrontEnd = {"adminAjax":"http:\/\/localhost\/kholahat\/wp-admin\/admin-ajax.php","ajaxNonce":"34cad8a418","requireBaseUrl":"http:\/\/localhost\/kholahat\/wp-content\/plugins\/rh-enquiry-forms\/assets\/js\/","use_merge_tags":{"user":{"address":"address","textbox":"textbox","button":"button","checkbox":"checkbox","city":"city","confirm":"confirm","date":"date","email":"email","firstname":"firstname","html":"html","hidden":"hidden","lastname":"lastname","listcheckbox":"listcheckbox","listcountry":"listcountry","listimage":"listimage","listmultiselect":"listmultiselect","listradio":"listradio","listselect":"listselect","liststate":"liststate","note":"note","number":"number","password":"password","passwordconfirm":"passwordconfirm","product":"product","quantity":"quantity","recaptcha":"recaptcha","shipping":"shipping","spam":"spam","starrating":"starrating","submit":"submit","terms":"terms","textarea":"textarea","total":"total","unknown":"unknown","zip":"zip","hr":"hr"},"post":{"address":"address","textbox":"textbox","button":"button","checkbox":"checkbox","city":"city","confirm":"confirm","date":"date","email":"email","firstname":"firstname","html":"html","hidden":"hidden","lastname":"lastname","listcheckbox":"listcheckbox","listcountry":"listcountry","listimage":"listimage","listmultiselect":"listmultiselect","listradio":"listradio","listselect":"listselect","liststate":"liststate","note":"note","number":"number","password":"password","passwordconfirm":"passwordconfirm","product":"product","quantity":"quantity","recaptcha":"recaptcha","shipping":"shipping","spam":"spam","starrating":"starrating","submit":"submit","terms":"terms","textarea":"textarea","total":"total","unknown":"unknown","zip":"zip","hr":"hr"},"system":{"address":"address","textbox":"textbox","button":"button","checkbox":"checkbox","city":"city","confirm":"confirm","date":"date","email":"email","firstname":"firstname","html":"html","hidden":"hidden","lastname":"lastname","listcheckbox":"listcheckbox","listcountry":"listcountry","listimage":"listimage","listmultiselect":"listmultiselect","listradio":"listradio","listselect":"listselect","liststate":"liststate","note":"note","number":"number","password":"password","passwordconfirm":"passwordconfirm","product":"product","quantity":"quantity","recaptcha":"recaptcha","shipping":"shipping","spam":"spam","starrating":"starrating","submit":"submit","terms":"terms","textarea":"textarea","total":"total","unknown":"unknown","zip":"zip","hr":"hr"},"fields":{"address":"address","textbox":"textbox","button":"button","checkbox":"checkbox","city":"city","confirm":"confirm","date":"date","email":"email","firstname":"firstname","html":"html","hidden":"hidden","lastname":"lastname","listcheckbox":"listcheckbox","listcountry":"listcountry","listimage":"listimage","listmultiselect":"listmultiselect","listradio":"listradio","listselect":"listselect","liststate":"liststate","note":"note","number":"number","password":"password","passwordconfirm":"passwordconfirm","product":"product","quantity":"quantity","recaptcha":"recaptcha","shipping":"shipping","spam":"spam","starrating":"starrating","submit":"submit","terms":"terms","textarea":"textarea","total":"total","unknown":"unknown","zip":"zip","hr":"hr"},"calculations":{"html":"html","hidden":"hidden","note":"note","unknown":"unknown"}},"opinionated_styles":"light"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/rh-enquiry-forms/assets/js/min/front-end.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/lib/vc_carousel/js/transition.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/lib/vc_carousel/js/vc_carousel.min.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/js_composer/assets/lib/prettyphoto/js/jquery.prettyPhoto.min.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var wc_add_to_cart_variation_params = {"wc_ajax_url":"\/kholahat\/?wc-ajax=%%endpoint%%","i18n_no_matching_variations_text":"Sorry, no products matched your selection. Please choose a different combination.","i18n_make_a_selection_text":"Please select some product options before adding this product to your cart.","i18n_unavailable_text":"Sorry, this product is unavailable. Please choose a different combination."};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart-variation.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/zoom/jquery.zoom.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/photoswipe/photoswipe.js\'></script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/photoswipe/photoswipe-ui-default.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var wc_single_product_params = {"i18n_required_rating_text":"Please select a rating","review_rating_required":"yes","flexslider":{"rtl":false,"animation":"slide","smoothHeight":true,"directionNav":false,"controlNav":"thumbnails","slideshow":false,"animationSpeed":500,"animationLoop":false,"allowOneSlide":false},"zoom_enabled":"1","zoom_options":[],"photoswipe_enabled":"1","photoswipe_options":{"shareEl":false,"closeOnScroll":false,"history":false,"hideAnimationDuration":0,"showAnimationDuration":0},"flexslider_enabled":"1"};
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/woocommerce/assets/js/frontend/single-product.js\'></script>
<script type=\'text/javascript\'>
/* <![CDATA[ */
var mc4wp_forms_config = [];
/* ]]> */
</script>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/mailchimp-for-wp/assets/js/forms-api.js\'></script>
<!--[if lte IE 9]>
<script type=\'text/javascript\' src=\'http://localhost/kholahat/wp-content/plugins/mailchimp-for-wp/assets/js/third-party/placeholders.min.js\'></script>
<![endif]-->
<script id="tmpl-nf-layout" type="text/template">
	<span id="nf-form-title-{{{ data.id }}}" class="nf-form-title">
		{{{ ( 1 == data.settings.show_title ) ? \'<h3>\' + data.settings.title + \'</h3>\' : \'\' }}}
	</span>
	<div class="nf-form-wrap ninja-forms-form-wrap">
		<div class="nf-response-msg"></div>
		<div class="nf-debug-msg"></div>
		<div class="nf-before-form"></div>
		<div class="nf-form-layout"></div>
		<div class="nf-after-form"></div>
	</div>
</script>

<script id="tmpl-nf-empty" type="text/template">

</script>
<script id="tmpl-nf-before-form" type="text/template">
	{{{ data.beforeForm }}}
</script><script id="tmpl-nf-after-form" type="text/template">
	{{{ data.afterForm }}}
</script><script id="tmpl-nf-before-fields" type="text/template">
    <div class="nf-form-fields-required">{{{ data.renderFieldsMarkedRequired() }}}</div>
    {{{ data.beforeFields }}}
</script><script id="tmpl-nf-after-fields" type="text/template">
    {{{ data.afterFields }}}
    <div id="nf-form-errors-{{{ data.id }}}" class="nf-form-errors" role="alert"></div>
    <div class="nf-form-hp"></div>
</script>
<script id="tmpl-nf-before-field" type="text/template">
    {{{ data.beforeField }}}
</script><script id="tmpl-nf-after-field" type="text/template">
    {{{ data.afterField }}}
</script><script id="tmpl-nf-form-layout" type="text/template">
	<form>
		<div>
			<div class="nf-before-form-content"></div>
			<div class="nf-form-content {{{ data.element_class }}}"></div>
			<div class="nf-after-form-content"></div>
		</div>
	</form>
</script><script id="tmpl-nf-form-hp" type="text/template">
	<label for="nf-field-hp-{{{ data.id }}}" aria-hidden="true">
		{{{ nfi18n.formHoneypot }}}
		<input id="nf-field-hp-{{{ data.id }}}" name="nf-field-hp" class="nf-element nf-field-hp" type="text" value=""/>
	</label>
</script>
<script id="tmpl-nf-field-layout" type="text/template">
    <div id="nf-field-{{{ data.id }}}-container" class="nf-field-container {{{ data.type }}}-container {{{ data.renderContainerClass() }}}">
        <div class="nf-before-field"></div>
        <div class="nf-field"></div>
        <div class="nf-after-field"></div>
    </div>
</script>
<script id="tmpl-nf-field-before" type="text/template">
    {{{ data.beforeField }}}
</script><script id="tmpl-nf-field-after" type="text/template">
    <#
    /*
     * Render our input limit section if that setting exists.
     */
    #>
    <div class="nf-input-limit"></div>
    <#
    /*
     * Render our error section if we have an error.
     */
    #>
    <div id="nf-error-{{{ data.id }}}" class="nf-error-wrap nf-error" role="alert"></div>
    <#
    /*
     * Render any custom HTML after our field.
     */
    #>
    {{{ data.afterField }}}
</script>
<script id="tmpl-nf-field-wrap" type="text/template">
	<div id="nf-field-{{{ data.id }}}-wrap" class="{{{ data.renderWrapClass() }}}" data-field-id="{{{ data.id }}}">
		<#
		/*
		 * This is our main field template. It\'s called for every field type.
		 * Note that must have ONE top-level, wrapping element. i.e. a div/span/etc that wraps all of the template.
		 */
        #>
		<#
		/*
		 * Render our label.
		 */
        #>
		{{{ data.renderLabel() }}}
		<#
		/*
		 * Render our field element. Uses the template for the field being rendered.
		 */
        #>
		<div class="nf-field-element">{{{ data.renderElement() }}}</div>
		<#
		/*
		 * Render our Description Text.
		 */
        #>
		{{{ data.renderDescText() }}}
	</div>
</script>
<script id="tmpl-nf-field-wrap-no-label" type="text/template">
    <div id="nf-field-{{{ data.id }}}-wrap" class="{{{ data.renderWrapClass() }}}" data-field-id="{{{ data.id }}}">
        <div class="nf-field-label"></div>
        <div class="nf-field-element">{{{ data.renderElement() }}}</div>
        <div class="nf-error-wrap"></div>
    </div>
</script>
<script id="tmpl-nf-field-wrap-no-container" type="text/template">

        {{{ data.renderElement() }}}

        <div class="nf-error-wrap"></div>
</script>
<script id="tmpl-nf-field-label" type="text/template">
	<div class="nf-field-label"><label for="nf-field-{{{ data.id }}}"
	                                   id="nf-label-field-{{{ data.id }}}"
	                                   class="{{{ data.renderLabelClasses() }}}">{{{ data.label }}} {{{ ( \'undefined\' != typeof data.required && 1 == data.required ) ? \'<span class="ninja-forms-req-symbol">*</span>\' : \'\' }}} {{{ data.maybeRenderHelp() }}}</label></div>
</script>
<script id="tmpl-nf-field-error" type="text/template">
	<div class="nf-error-msg nf-error-{{{ data.id }}}">{{{ data.msg }}}</div>
</script><script id="tmpl-nf-form-error" type="text/template">
	<div class="nf-error-msg nf-error-{{{ data.id }}}">{{{ data.msg }}}</div>
</script><script id="tmpl-nf-field-input-limit" type="text/template">
    {{{ data.currentCount() }}} {{{ nfi18n.of }}} {{{ data.input_limit }}} {{{ data.input_limit_msg }}}
</script><script id="tmpl-nf-field-null" type="text/template">
</script><script id="tmpl-nf-field-firstname" type="text/template">
    <input
            type="text"
            value="{{{ data.value }}}"
            class="{{{ data.renderClasses() }}} nf-element"

            id="nf-field-{{{ data.id }}}"
            <# if( ! data.disable_browser_autocompletes ){ #>
            name="{{ data.custom_name_attribute || \'nf-field-\' + data.id + \'-\' + data.type }}"
            autocomplete="given-name"
            <# } else { #>
            name="{{ data.custom_name_attribute || \'nf-field-\' + data.id }}"
            {{{ data.maybeDisableAutocomplete() }}}
            <# } #>
            {{{ data.renderPlaceholder() }}}

            aria-invalid="false"
            aria-describedby="nf-error-{{{ data.id }}}"
            aria-labelledby="nf-label-field-{{{ data.id }}}"

            {{{ data.maybeRequired() }}}
    >
</script>
<script id=\'tmpl-nf-field-input\' type=\'text/template\'>
    <input id="nf-field-{{{ data.id }}}" name="nf-field-{{{ data.id }}}" aria-invalid="false" aria-describedby="nf-error-{{{ data.id }}}" class="{{{ data.renderClasses() }}} nf-element" type="text" value="{{{ data.value }}}" {{{ data.renderPlaceholder() }}} {{{ data.maybeDisabled() }}}
           aria-labelledby="nf-label-field-{{{ data.id }}}"

            {{{ data.maybeRequired() }}}
    >
</script>
<script id="tmpl-nf-field-tel" type="text/template">
	<input
			type="tel"
			value="{{{ data.value }}}"
			class="{{{ data.renderClasses() }}} nf-element"

			id="nf-field-{{{ data.id }}}"
			<# if( ! data.disable_browser_autocompletes ){ #>
			name="{{ data.custom_name_attribute || \'nf-field-\' + data.id + \'-\' + data.type }}"
			autocomplete="tel"
			<# } else { #>
			name="{{ data.custom_name_attribute || \'nf-field-\' + data.id }}"
			{{{ data.maybeDisableAutocomplete() }}}
			<# } #>
			{{{ data.renderPlaceholder() }}}

			aria-invalid="false"
			aria-describedby="nf-error-{{{ data.id }}}"
			aria-labelledby="nf-label-field-{{{ data.id }}}"

			{{{ data.maybeRequired() }}}
	>
</script>
<script id="tmpl-nf-field-textbox" type="text/template">
	<input
			type="text"
			value="{{{ data.value }}}"
			class="{{{ data.renderClasses() }}} nf-element"
			{{{ data.renderPlaceholder() }}}
			{{{ data.maybeDisabled() }}}
			{{{ data.maybeInputLimit() }}}

			id="nf-field-{{{ data.id }}}"
			<# if( ! data.disable_browser_autocomplete && -1 < [ \'city\', \'zip\' ].indexOf( data.type ) ){ #>
				name="{{ data.custom_name_attribute || \'nf-field-\' + data.id + \'-\' + data.type }}"
				autocomplete="on"
			<# } else { #>
				name="{{ data.custom_name_attribute || \'nf-field-\' + data.id }}"
				{{{ data.maybeDisableAutocomplete() }}}
			<# } #>

			aria-invalid="false"
			aria-describedby="nf-error-{{{ data.id }}}"
			aria-labelledby="nf-label-field-{{{ data.id }}}"

			{{{ data.maybeRequired() }}}
	>
</script>
<script id="tmpl-nf-field-textarea" type="text/template">
    <textarea id="nf-field-{{{ data.id }}}" name="nf-field-{{{ data.id }}}" aria-invalid="false" aria-describedby="nf-error-{{{ data.id }}}" class="{{{ data.renderClasses() }}} nf-element" {{{ data.renderPlaceholder() }}} {{{ data.maybeDisabled() }}} {{{ data.maybeDisableAutocomplete() }}} {{{ data.maybeInputLimit() }}}
        aria-labelledby="nf-label-field-{{{ data.id }}}"

        {{{ data.maybeRequired() }}}
    >{{{ data.value }}}</textarea>
</script>

<!-- Rich Text Editor Templates -->

<script id="tmpl-nf-rte-media-button" type="text/template">
    <span class="dashicons dashicons-admin-media"></span>
</script>

<script id="tmpl-nf-rte-link-button" type="text/template">
    <span class="dashicons dashicons-admin-links"></span>
</script>

<script id="tmpl-nf-rte-unlink-button" type="text/template">
    <span class="dashicons dashicons-editor-unlink"></span>
</script>

<script id="tmpl-nf-rte-link-dropdown" type="text/template">
    <div class="summernote-link">
        URL
        <input type="url" class="widefat code link-url"> <br />
        Text
        <input type="url" class="widefat code link-text"> <br />
        <label>
            <input type="checkbox" class="link-new-window"> {{{ nfi18n.fieldsTextareaOpenNewWindow }}}
        </label>
        <input type="button" class="cancel-link extra" value="Cancel">
        <input type="button" class="insert-link extra" value="Insert">
    </div>
</script>
<script id="tmpl-nf-field-submit" type="text/template">
	<input id="nf-field-{{{ data.id }}}" class="{{{ data.renderClasses() }}} nf-element " type="button" value="{{{ data.label }}}" {{{ ( data.disabled ) ? \'disabled\' : \'\' }}}>
</script><script id=\'tmpl-nf-field-button\' type=\'text/template\'>
    <button id="nf-field-{{{ data.id }}}" name="nf-field-{{{ data.id }}}" class="{{{ data.classes }}} nf-element">
        {{{ data.label }}}
    </button>
</script>
</body>
</html>';
    }

    public static function get_comment($start = '/*', $end = '*/', $comment = 'wp-booster | last-modified: ', $date = 1)
    {
        $date = ($date != false) ? date('F d, Y h:i:sA') : '';
        return "$start " . $comment . " " . $date . " $end";
    }

    public static function option_value()
    {
        if (!self::$option_value) {
            foreach (self::option_name() as $item) {
                self::$option_value[$item] = get_option($item);
            }
        }
        return self::$option_value;
    }

    public static function combined_option($type = 'css')
    {
        return self::option_tabs()[self::option_name()[1]]['fields'][$type == 'css' ? 0 : 1]['name'];
    }

    public static function log($message, $type = 'error')
    {
        if (is_array($message)) {
            $message = json_encode($message);
        }
        $file = fopen(WPBOOSTER_LOGS . WPBOOSTER_NAME . '.log', "a");
        echo fwrite($file, "[" . date('d-M-y h:i:s') . "] $type :: " . $message . "\n");
        fclose($file);
    }
}