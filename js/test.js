(function($) {
    "use strict";

    jQuery( document).ready( function($){

        var acs_action  = 'greenmart_autocomplete_search',
            $t          = $("input[name='s']");


        $t.on("focus", function(){

            var appendto = ( typeof jQuery(this).parents('form').data('appendto') !== "undefined" ) ? jQuery(this).parents('form').data('appendto') : '';

            $(this).autocomplete({
                source: function(req, response){
                    $.ajax({
                        url: greenmart_ajax.ajaxurl+'?callback=?&action='+acs_action,
                        dataType: "json",
                        data: {
                            term: req.term,
                            category: this.element.parent().find('.dropdown_product_cat').val(),
                            style: this.element.data('style'),
                            post_type: this.element.parent().find('.post_type').val()
                        },
                        success: function(data,event, ui) {
                            response(data);
                        },
                    });
                },
                minLength: 2,
                appendTo: appendto,
                autoFocus: true,
                search: function(event, ui) {
                    $(event.currentTarget).parents('.tbay-search-form').addClass('load');
                },
                select: function(event, ui) {
                    window.location.href = ui.item.link;
                },
                create: function() {

                    $(this).data('ui-autocomplete')._renderItem = function( ul, item ) {
                        var string = '';
                        if ( item.image != '' ) {
                            var string = '<a class="image" href="' + item.link + '" title="'+ item.label +'"><img class="pull-left" src="'+ item.image+'" style="margin-right:10px;"></a>';
                        }

                        string += '<div class="group">';
                        string += '<div class="name"><a href="' + item.link + '" title="'+ item.label +'">'+ item.label +'</a></div>';
                        if ( item.price != '' ) {
                            string += '<div class="price">'+ item.price +'</div> ';
                        }
                        string += '</div>';


                        return $( "<li>" ).append( string ).appendTo( ul );
                    };

                    jQuery(this).data('ui-autocomplete')._renderMenu = function (ul, items) {
                        var that = this
                        jQuery.each(items, function (index, item) {
                            that._renderItemData(ul, item)
                        })

                        if( items[0].view_all ) {
                            ul.append('<li class="list-header ui-menu-divider">' + items[0].result + '</li>')
                            ul.append('<li class="list-bottom ui-menu-divider"><a class="search-view-all" href="javascript:void(0)">'+ greenmart_settings.view_all +'</a></li>')
                        } else {
                            ul.append('<li class="list-header ui-menu-divider">' + items[0].result + '</li>')
                        }

                        $( document.body ).trigger( 'greenmart_search_view_all' )
                    }

                },
                response: function(event, ui) {
                    // ui.content is the array that's about to be sent to the response callback.
                    if (ui.content.length === 0) {
                        $(".tbay-preloader").text("No results found");
                        $(".tbay-preloader").addClass('no-results');
                    } else {
                        $(".tbay-preloader").empty();
                        $(".tbay-preloader").removeClass('no-results');
                    }
                },
                open: function(event, ui) {
                    $(event.target).parents('.tbay-search-form').removeClass('load');
                    $(event.target).parents('.tbay-search-form').addClass('active');
                },
                close: function() {
                }
            });

        });


        $(document.body).on('greenmart_search_view_all', () => {
            $('.search-view-all').on("click", function() {
                jQuery(this).parents('form').submit();
            });
        });

        $('.tbay-preloader').on('click', function(){
            $(this).parents('.tbay-search-form').removeClass('active');
            $(this).parents('.tbay-search-form').find('input[name=s]').val('');
        });

        $("input[name=s]").keyup(function(){
            if($(this).val().length == 0) {
                $(this).parents('.tbay-search-form').removeClass('load');
                $(this).parents('.tbay-search-form').removeClass('active');
                $(this).parents('.tbay-search-form').find('.tbay-preloader').empty();
            }
        });

    });
})(jQuery)
/**
 * Main YITH WooCommerce Wishlist JS
 *
 * @author YITH
 * @package YITH WooCommerce Wishlist
 * @version 3.0.0
 */

jQuery( document ).ready( function( $ ){

    /* === MAIN INIT === */

    $(document).on( 'yith_wcwl_init', function(){
        var t = $(this),
            cart_redirect_after_add = ( typeof( wc_add_to_cart_params ) !== 'undefined' && wc_add_to_cart_params !== null ) ? wc_add_to_cart_params.cart_redirect_after_add : '';

        t.on( 'click', '.add_to_wishlist', function( ev ) {
            var t = $( this),
                product_id = t.attr( 'data-product-id' ),
                el_wrap = $( '.add-to-wishlist-' + product_id ),
                data = {
                    add_to_wishlist: product_id,
                    product_type: t.data( 'product-type' ),
                    wishlist_id: t.data( 'wishlist-id' ),
                    action: yith_wcwl_l10n.actions.add_to_wishlist_action,
                    fragments: retrieve_fragments( product_id )
                };

            ev.preventDefault();

            jQuery( document.body ).trigger( 'adding_to_wishlist' );

            if( yith_wcwl_l10n.multi_wishlist && yith_wcwl_l10n.modal_enable ){
                var wishlist_popup_container = t.parents( '.yith-wcwl-popup-footer' ).prev( '.yith-wcwl-popup-content' ),
                    wishlist_popup_select = wishlist_popup_container.find( '.wishlist-select' ),
                    wishlist_popup_name = wishlist_popup_container.find( '.wishlist-name' ),
                    wishlist_popup_visibility = wishlist_popup_container.find( '.wishlist-visibility' ).filter(':checked');

                data.wishlist_id = wishlist_popup_select.is(':visible') ? wishlist_popup_select.val() : 'new';
                data.wishlist_name = wishlist_popup_name.val();
                data.wishlist_visibility = wishlist_popup_visibility.val();

                if( 'new' === data.wishlist_id && ! data.wishlist_name ){
                    wishlist_popup_name.closest('p').addClass('woocommerce-invalid');
                    return false;
                }
                else{
                    wishlist_popup_name.closest('p').removeClass('woocommerce-invalid');
                }
            }

            if( ! is_cookie_enabled() ){
                alert( yith_wcwl_l10n.labels.cookie_disabled );
                return;
            }

            $.ajax({
                type: 'POST',
                url: yith_wcwl_l10n.ajax_url,
                data: data,
                dataType: 'json',
                beforeSend: function(){
                    block( t );
                },
                complete: function(){
                    unblock( t );
                },
                success: function( response ) {
                    var response_result = response.result,
                        response_message = response.message;

                    if( yith_wcwl_l10n.multi_wishlist ) {
                        // close PrettyPhoto popup
                        close_pretty_photo( response_message );

                        // update options for all wishlist selects
                        if( typeof( response.user_wishlists ) != 'undefined' ) {
                            update_wishlists( response.user_wishlists );
                        }
                    }
                    else {
                        print_message(response_message);
                    }

                    if( response_result === "true" || response_result === "exists" ) {
                        if( typeof response.fragments != 'undefined' ) {
                            replace_fragments( response.fragments );
                        }

                        if( ! yith_wcwl_l10n.multi_wishlist || yith_wcwl_l10n.hide_add_button ) {
                            el_wrap.find('.yith-wcwl-add-button').remove();
                        }

                        el_wrap.addClass('exists');
                    }

                    init_handling_after_ajax();

                    $('body').trigger('added_to_wishlist', [ t, el_wrap ] );
                }

            });

            return false;
        } );

        t.on( 'click', '.wishlist_table .remove_from_wishlist', function( ev ){
            var t = $( this );

            ev.preventDefault();

            remove_item_from_wishlist( t );

            return false;
        } );

        t.on( 'adding_to_cart', 'body', function( ev, button, data ){
            if( typeof button != 'undefined' && typeof data != 'undefined' && button.closest( '.wishlist_table' ).length ){
                data.remove_from_wishlist_after_add_to_cart = button.closest( '[data-row-id]' ).data( 'row-id' );
                data.wishlist_id = button.closest( '.wishlist_table' ).data( 'id' );
                typeof wc_add_to_cart_params !== 'undefined' && ( wc_add_to_cart_params.cart_redirect_after_add = yith_wcwl_l10n.redirect_to_cart );
                typeof yith_wccl_general !== 'undefined' && ( yith_wccl_general.cart_redirect = yith_wcwl_l10n.redirect_to_cart );
            }
        } );

        t.on( 'added_to_cart', 'body', function( ev, fragments, carthash, button ){
            if( typeof button != 'undefined' && button.closest( '.wishlist_table' ).length ) {
                typeof wc_add_to_cart_params !== 'undefined' && ( wc_add_to_cart_params.cart_redirect_after_add = cart_redirect_after_add );
                typeof yith_wccl_general !== 'undefined' && ( yith_wccl_general.cart_redirect = cart_redirect_after_add );

                var tr = button.closest('[data-row-id]'),
                    table = tr.closest('.wishlist-fragment'),
                    options = table.data('fragment-options');

                button.removeClass('added');
                tr.find('.added_to_cart').remove();

                if ( yith_wcwl_l10n.remove_from_wishlist_after_add_to_cart && options.is_user_owner ) {
                    tr.remove();
                }
            }
        } );

        t.on( 'added_to_cart', 'body', function(){
            var messages = $( '.woocommerce-message');

            if( messages.length === 0 ){
                $( '#yith-wcwl-form').prepend( yith_wcwl_l10n.labels.added_to_cart_message );
            }
            else{
                messages.fadeOut( 300, function(){
                    $(this).replaceWith( yith_wcwl_l10n.labels.added_to_cart_message ).fadeIn();
                } );
            }
        } );

        t.on( 'cart_page_refreshed', 'body', init_handling_after_ajax );

        t.on( 'click', '.show-title-form', show_title_form );

        t.on( 'click', '.wishlist-title-with-form h2', show_title_form );

        t.on( 'click', '.remove_from_all_wishlists', function( ev ){
            var t = $(this),
                prod_id = t.attr('data-product-id'),
                wishlist_id = t.data('wishlist-id'),
                content = t.closest( '.content' ),
                data = {
                    action: yith_wcwl_l10n.actions.remove_from_all_wishlists,
                    prod_id: prod_id,
                    wishlist_id: wishlist_id,
                    fragments: retrieve_fragments( prod_id )
                };

            ev.preventDefault();

            $.ajax({
                beforeSend: function(){
                    block( content );
                },
                complete: function(){
                    unblock( content );
                },
                data: data,
                dataType: 'json',
                method: 'post',
                success: function( data ){
                    if( typeof data.fragments != 'undefined' ){
                        replace_fragments( data.fragments );
                    }

                    init_handling_after_ajax();
                },
                url: yith_wcwl_l10n.ajax_url
            });
        } );

        t.on( 'click', '.hide-title-form', hide_title_form );

        t.on( 'click', '.save-title-form', submit_title_form );

        t.on( 'change', '.wishlist_manage_table .wishlist-visibility', save_privacy );

        t.on( 'change', '.change-wishlist', function(){
            var t = $(this),
                table = t.parents( '.cart.wishlist_table'),
                wishlist_token = table.data('token'),
                item_id = t.parents( '[data-row-id]').data('row-id'),
                to_token = t.val();

            call_ajax_move_item_to_another_wishlist(
                {
                    wishlist_token            : wishlist_token,
                    destination_wishlist_token: to_token,
                    item_id                   : item_id,
                    fragments                 : retrieve_fragments()
                },
                function(){
                    block( table );
                },
                function( data ){
                    if( typeof data.fragments != 'undefined' ) {
                        replace_fragments( data.fragments );
                    }

                    unblock( table );
                }
            );
        } );

        t.on( 'click', '.yith-wcwl-popup-footer .move_to_wishlist', function(){
            var t = $(this),
                product_id = t.attr('data-product-id'),
                wishlist_token = t.data('origin-wishlist-id'),
                form = t.closest('form'),
                to_token = form.find('.wishlist-select').val(),
                wishlist_name_field = form.find('.wishlist-name'),
                wishlist_name = wishlist_name_field.val(),
                wishlist_visibility = form.find('.wishlist-visibility').filter(':checked').val();

            if( 'new' === to_token && ! wishlist_name ){
                wishlist_name_field.closest('p').addClass('woocommerce-invalid');
                return false;
            }
            else{
                wishlist_name_field.closest('p').removeClass('woocommerce-invalid');
            }

            call_ajax_move_item_to_another_wishlist(
                {
                    wishlist_token            : wishlist_token,
                    destination_wishlist_token: to_token,
                    item_id                   : product_id,
                    wishlist_name             : wishlist_name,
                    wishlist_visibility       : wishlist_visibility,
                    fragments                 : retrieve_fragments( product_id )
                },
                function(){
                    block( t );
                },
                function( response ){
                    var response_message = response.message;

                    if( yith_wcwl_l10n.multi_wishlist ) {
                        close_pretty_photo( response_message );

                        if( typeof( response.user_wishlists ) != 'undefined' ){
                            update_wishlists( response.user_wishlists );
                        }
                    }
                    else {
                        print_message(response_message);
                    }

                    if( typeof response.fragments != 'undefined' ) {
                        replace_fragments( response.fragments );
                    }

                    init_handling_after_ajax();

                    unblock( t );
                }
            );
        } );

        t.on( 'click', '.delete_item', function(){
            var t = $(this),
                product_id = t.attr('data-product-id'),
                item_id = t.data('item-id'),
                el_wrap = $( '.add-to-wishlist-' + product_id );

            $.ajax( {
                url: yith_wcwl_l10n.ajax_url,
                data : {
                    action: yith_wcwl_l10n.actions.delete_item_action,
                    item_id: item_id,
                    fragments: retrieve_fragments( product_id )
                },
                dataType: 'json',
                beforeSend: function(){
                    block( t )
                },
                complete: function(){
                    unblock( t );
                },
                method: 'post',
                success: function( response ){
                    var fragments = response.fragments,
                        response_message = response.message;

                    if( yith_wcwl_l10n.multi_wishlist ) {
                        close_pretty_photo( response_message );
                    }

                    if( ! t.closest( '.yith-wcwl-remove-button' ).length ){
                        print_message(response_message);
                    }

                    if( typeof fragments != 'undefined' ){
                        replace_fragments( fragments );
                    }

                    init_handling_after_ajax();

                    $('body').trigger('removed_from_wishlist', [ t, el_wrap ] );
                }
            } );

            return false;
        } );

        t.on( 'change', '.yith-wcwl-popup-content .wishlist-select', function(){
            var t = $(this);

            if( t.val() === 'new' ){
                t.parents( '.yith-wcwl-first-row' ).next( '.yith-wcwl-second-row' ).show();
            }
            else{
                t.parents( '.yith-wcwl-first-row' ).next( '.yith-wcwl-second-row' ).hide();
            }
        } );

        t.on( 'change', '#bulk_add_to_cart', function(){
            var t = $(this),
                checkboxes = t.closest( '.wishlist_table' ).find( '[data-row-id]' ).find( 'input[type="checkbox"]:not(:disabled)' );

            if( t.is( ':checked' ) ){
                checkboxes.attr( 'checked','checked').change();
            }
            else{
                checkboxes.removeAttr( 'checked').change();
            }
        } );

        t.on( 'submit', '.wishlist-ask-an-estimate-popup', function(){
            var t = $(this),
                form = t.closest( 'form' ),
                pp_content = t.closest('.pp_content'),
                data = form.serialize();

            $.ajax({
                beforeSend: function(){
                    block( form );
                },
                complete: function(){
                    unblock( form );
                },
                data: data + '&action=' + yith_wcwl_l10n.actions.ask_an_estimate,
                dataType: 'json',
                method: 'post',
                success: function( data ){
                    if( typeof data.result != 'undefined' && data.result ){
                        var template = data.template;

                        if( typeof template != 'undefined' ){
                            form.replaceWith( template );
                            pp_content.css('height', 'auto');

                            setTimeout( close_pretty_photo, 3000 );
                        }
                    }
                    else if( typeof data.message != 'undefined' ){
                        form.find( '.woocommerce-error' ).remove();
                        form.find( '.popup-description' ).after( $('<div>', {
                            text: data.message,
                            class: 'woocommerce-error'
                        } ) )
                    }
                },
                url: yith_wcwl_l10n.ajax_url
            });

            return false;
        } );

        t.on('click', '.yith-wfbt-add-wishlist', function(e){
            e.preventDefault();
            var t    = $(this),
                form = $( '#yith-wcwl-form' );

            $('html, body').animate({
                scrollTop: ( form.offset().top)
            },500);

            // ajax call
            reload_wishlist_and_adding_elem( t, form );
        });

        t.on( 'submit', '.yith-wcwl-popup-form', function(){
            return false;
        } );

        t.on( 'yith_infs_added_elem', function(){
            init_wishlist_pretty_photo();
        } );

        t.on( 'found_variation', function( ev, variation ){
            var t = $( ev.target ),
                product_id = t.data( 'product_id' ),
                variation_id = variation.variation_id,
                targets = $('.add_to_wishlist[data-product-id="' + product_id + '"]').add('.add_to_wishlist[data-original-product-id="' + product_id + '"]');

            if( ! product_id || ! variation_id || ! targets.length ){
                return;
            }

            targets.each( function(){
                var t = $(this),
                    container = t.closest( '.yith-wcwl-add-to-wishlist' ),
                    options;

                t.attr( 'data-original-product-id', product_id );
                t.attr( 'data-product-id', variation_id );

                console.log(t, t.attr('data-product-id'));

                if( container.length ) {
                    options = container.data( 'fragment-options' );

                    if( typeof options != 'undefined' ){
                        options.product_id = variation_id;
                        container.data( 'fragment-options', options );
                    }

                    container
                        .removeClass(function (i, classes) {
                            return classes.match(/add-to-wishlist-\S+/g).join(' ');
                        })
                        .addClass('add-to-wishlist-' + variation_id)
                        .attr('data-fragment-ref', variation_id);
                }
            } );
        } );

        t.on( 'reset_data', function( ev ){
            var t = $( ev.target ),
                product_id = t.data( 'product_id' ),
                targets = $('.add_to_wishlist[data-original-product-id="' + product_id + '"]');

            if( ! product_id || ! targets.length ){
                return;
            }

            targets.each( function(){
                var t = $(this),
                    container = t.closest( '.yith-wcwl-add-to-wishlist' ),
                    variation_id = t.attr( 'data-product-id' ),
                    options;

                t.attr( 'data-product-id', product_id );
                t.attr( 'data-original-product-id', '' );

                if( container.length ) {
                    options = container.data( 'fragment-options' );

                    if( typeof options != 'undefined' ){
                        options.product_id = product_id;
                        container.data( 'fragment-options', options );
                    }

                    container
                        .removeClass('add-to-wishlist-' + variation_id)
                        .addClass('add-to-wishlist-' + product_id)
                        .attr('data-fragment-ref', product_id);
                }
            } );
        } );

        t.on( 'yith_wcwl_reload_fragments', load_fragments );

        t.on( 'yith_infs_added_elem', function( ev, elem ){
            load_fragments( {
                container: elem,
                firstLoad: false
            } );
        } );

        t.on( 'yith_wcwl_fragments_loaded', function( ev ){
            $( '.variations_form' ).find( '.variations select' ).last().change();
        } );

        init_wishlist_popup();

        init_wishlist_tooltip();

        init_wishlist_dropdown();

        init_wishlist_drag_n_drop();

        init_quantity();

        init_wishlist_details_popup();

        init_wishlist_popup_tabs();

        init_select_box();

        init_checkbox_handling();

        init_wishlist_pretty_photo();

        init_add_to_cart_icon();

        init_wishlist_responsive();

        init_copy_wishlist_link();

        load_fragments();

    } ).trigger('yith_wcwl_init');

    /* === INIT FUNCTIONS === */

    /**
     * Adds selectbox where needed
     *
     * @return void
     * @since 3.0.0
     */
    function init_select_box() {
        if( typeof $.fn.selectBox != 'undefined' ) {
            $('select.selectBox').filter(':visible').not('.enhanced').selectBox().addClass('enhanced');
        }
    }

    /**
     * Init PrettyPhoto for all links withi the plugin that open a popup
     *
     * @return void
     * @since 2.0.16
     */
    function init_wishlist_pretty_photo() {
        if( typeof $.prettyPhoto == 'undefined' ){
            return;
        }

        var ppParams = {
            hook                  : 'data-rel',
            social_tools          : false,
            theme                 : 'pp_woocommerce',
            horizontal_padding    : 20,
            opacity               : 0.8,
            deeplinking           : false,
            overlay_gallery       : false,
            default_width         : 500,
            changepicturecallback : function(){
                init_select_box();

                $('.wishlist-select').change();
                $(document).trigger( 'yith_wcwl_popup_opened', [ this ] );
            },
            markup: '<div class="pp_pic_holder">' +
                '<div class="ppt">&nbsp;</div>' +
                '<div class="pp_top">' +
                '<div class="pp_left"></div>' +
                '<div class="pp_middle"></div>' +
                '<div class="pp_right"></div>' +
                '</div>' +
                '<div class="pp_content_container">' +
                '<div class="pp_left">' +
                '<div class="pp_right">' +
                '<div class="pp_content">' +
                '<div class="pp_loaderIcon"></div>' +
                '<div class="pp_fade">' +
                '<a href="#" class="pp_expand" title="Expand the image">Expand</a>' +
                '<div class="pp_hoverContainer">' +
                '<a class="pp_next" href="#">next</a>' +
                '<a class="pp_previous" href="#">previous</a>' +
                '</div>' +
                '<div id="pp_full_res"></div>' +
                '<div class="pp_details">' +
                '<a class="pp_close" href="#">Close</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="pp_bottom">' +
                '<div class="pp_left"></div>' +
                '<div class="pp_middle"></div>' +
                '<div class="pp_right"></div>' +
                '</div>' +
                '</div>' +
                '<div class="pp_overlay yith-wcwl-overlay"></div>'
        };

        $('a[data-rel^="prettyPhoto[add_to_wishlist_"]')
            .add('a[data-rel="prettyPhoto[ask_an_estimate]"]')
            .add('a[data-rel="prettyPhoto[create_wishlist]"]')
            .unbind( 'click' )
            .prettyPhoto( ppParams );

        $('a[data-rel="prettyPhoto[move_to_another_wishlist]"]').on( 'click', function(){
            var t = $(this),
                popup = $('#move_to_another_wishlist'),
                form = popup.find('form'),
                row_id = form.find( '.row-id' ),
                id = t.closest('[data-row-id]').data('row-id');

            if( row_id.length ){
                row_id.remove();
            }

            form.append( '<input type="hidden" name="row_id" class="row-id" value="' + id + '"/>' );
        } ).prettyPhoto( ppParams );

        // add & remove class to body when popup is opened
        var observer = new MutationObserver( function( mutationsList, observer ){
            for ( var i in mutationsList ) {
                var mutation = mutationsList[ i ];
                if ( mutation.type === 'childList' ) {
                    typeof mutation.addedNodes !== 'undefined' && mutation.addedNodes.forEach( function( currentValue ){
                        if( currentValue.classList.contains( 'yith-wcwl-overlay' ) ){
                            $('body').addClass( 'yith-wcwl-with-pretty-photo' );
                        }
                    } );

                    typeof mutation.removedNodes !== 'undefined' && mutation.removedNodes.forEach( function( currentValue ){
                        if( currentValue.classList.contains( 'yith-wcwl-overlay' ) ){
                            $('body').removeClass( 'yith-wcwl-with-pretty-photo' );
                        }
                    } );
                }
            }
        } );

        observer.observe( document.body, {
            childList: true
        } );
    }

    /**
     * Init checkbox handling
     *
     * @return void
     * @since 3.0.0
     */
    function init_checkbox_handling() {
        var checkboxes = $('.wishlist_table').find('.product-checkbox input[type="checkbox"]');

        checkboxes.off('change').on( 'change', function(){
            var t = $(this),
                p = t.parent();

            p
                .removeClass( 'checked' )
                .removeClass( 'unchecked' )
                .addClass( t.is(':checked') ? 'checked' : 'unchecked' );
        } ).trigger('change');
    }

    /**
     * Show icon on Add to Cart button
     *
     * @return void
     */
    function init_add_to_cart_icon() {
        $('.add_to_cart').filter('[data-icon]').not('.icon-added').each( function(){
            var t = $(this),
                data = t.data('icon'),
                icon;

            if( data.match( /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi ) ){
                icon = $( '<img/>', { src: data } );
            }
            else{
                icon = $( '<i/>', { class: 'fa ' + data } );
            }

            t.prepend( icon ).addClass('icon-added');
        } )
    }

    /**
     * Init js handling on wishlist table items after ajax update
     *
     * @return void
     * @since 2.0.7
     */
    function init_handling_after_ajax() {
        init_select_box();
        init_wishlist_pretty_photo();
        init_checkbox_handling();
        init_add_to_cart_icon();
        init_wishlist_dropdown();
        init_wishlist_tooltip();
        init_wishlist_details_popup();
        init_wishlist_drag_n_drop();
        init_copy_wishlist_link();

        $(document).trigger( 'yith_wcwl_init_after_ajax' );
    }

    /**
     * Add tooltip to Add to Wishlist buttons
     *
     * @return void
     * @since 3.0.0
     */
    function init_wishlist_tooltip() {
        if( ! yith_wcwl_l10n.enable_tooltip ){
            return;
        }

        $('.yith-wcwl-add-to-wishlist').find('[data-title]').each( function(){
            var t = $(this);

            if( t.hasClass( 'tooltip-added' ) ){
                return;
            }

            t
                .on('mouseenter', function () {
                    var t = $(this),
                        tooltip = null,
                        wrapperWidth = t.outerWidth(),
                        left = 0,
                        width = 0;

                    tooltip = $('<span>', {class: 'yith-wcwl-tooltip', text: t.data('title')});

                    t.append(tooltip);

                    width = tooltip.outerWidth() + 6;
                    tooltip.outerWidth(width);
                    left = (wrapperWidth - width) / 2;

                    tooltip.css({left: left.toFixed(0) + 'px'}).fadeIn(200);

                    t.addClass('with-tooltip');
                })
                .on('mouseleave', function () {
                    var t = $(this);

                    t.find('.yith-wcwl-tooltip').fadeOut(200, function(){
                        t.removeClass('with-tooltip').find('.yith-wcwl-tooltip').remove();
                    });
                });

            t.addClass('tooltip-added');
        } );
    }

    /**
     * Add wishlist popup message
     *
     * @return void
     * @since 2.0.0
     */
    function init_wishlist_popup() {
        if( typeof yith_wcwl_l10n.enable_notices != 'undefined' && ! yith_wcwl_l10n.enable_notices ){
            return;
        }

        if( $('.yith-wcwl-add-to-wishlist').length && ! $( '#yith-wcwl-popup-message' ).length ) {
            var message_div = $( '<div>' )
                    .attr( 'id', 'yith-wcwl-message' ),
                popup_div = $( '<div>' )
                    .attr( 'id', 'yith-wcwl-popup-message' )
                    .html( message_div )
                    .hide();

            $( 'body' ).prepend( popup_div );
        }
    }

    /**
     * Add Dropdown to Add to Wishlist when modal is disabled and Multi Wishlist enabled
     *
     * @return void
     * @since 3.0.0
     */
    function init_wishlist_dropdown() {
        $('.yith-wcwl-add-button').filter('.with-dropdown')
            .on( 'mouseleave', function(){
                var t = $(this),
                    dropdown = t.find('.yith-wcwl-dropdown');

                if( dropdown.length ) {
                    dropdown.fadeOut(200);
                }
            } )
            .children('a')
            .on( 'mouseenter', function(){
                var t = $(this),
                    el_wrap = t.closest('.with-dropdown'),
                    dropdown = el_wrap.find('.yith-wcwl-dropdown');

                if( dropdown.length && dropdown.children().length ){
                    el_wrap.find('.yith-wcwl-dropdown').fadeIn(200);
                }
            } );
    }

    /**
     * Handle Drag & Drop of wishlist items for sorting
     *
     * @return void
     * @since 3.0.0
     */
    function init_wishlist_drag_n_drop() {
        if( typeof yith_wcwl_l10n.enable_drag_n_drop === 'undefined' || ! yith_wcwl_l10n.enable_drag_n_drop ){
            return;
        }

        $('.wishlist_table').filter('.sortable').not('.no-interactions').each( function(){
            var t = $(this),
                jqxhr = false;

            t.sortable( {
                items: '[data-row-id]',
                helper: function( e, ui ){
                    ui.children().each(function() {
                        $(this).width($(this).width());
                    });
                    return ui;
                },
                update: function(){
                    var row = t.find('[data-row-id]'),
                        positions = [];

                    if( ! row.length ){
                        return;
                    }

                    if( jqxhr ){
                        jqxhr.abort();
                    }

                    row.each( function(){
                        var t = $(this);

                        positions.push( t.data('row-id') );
                    } );

                    jqxhr = $.ajax({
                        data: {
                            action: yith_wcwl_l10n.actions.sort_wishlist_items,
                            positions: positions,
                            wishlist_token: t.data('token'),
                            page: t.data('page'),
                            per_page: t.data('per-page')
                        },
                        method: 'POST',
                        url: yith_wcwl_l10n.ajax_url
                    });
                }
            } );
        } );
    }

    /**
     * Handle quantity input change for each wishlist item
     *
     * @return void
     * @since 3.0.0
     */
    function init_quantity() {
        var jqxhr,
            timeout;

        $('.wishlist_table').on( 'change', '.product-quantity input', function(){
            var t = $(this),
                row = t.closest('[data-row-id]'),
                product_id = row.data('row-id'),
                table = t.closest('.wishlist_table'),
                token = table.data('token');

            clearTimeout( timeout );

            // set add to cart link to add specific qty to cart
            row.find( '.add_to_cart' ).data('quantity', t.val());

            timeout = setTimeout( function(){
                if( jqxhr ){
                    jqxhr.abort();
                }

                jqxhr = $.ajax({
                    beforeSend: function(){
                        block( table );
                    },
                    complete: function(){
                        unblock( table );
                    },
                    data: {
                        product_id: product_id,
                        wishlist_token: token,
                        quantity: t.val(),
                        action: yith_wcwl_l10n.actions.update_item_quantity
                    },
                    method: 'POST',
                    url: yith_wcwl_l10n.ajax_url
                });
            }, 1000 );
        } );
    }

    /**
     * Init handling for copy button
     *
     * @return void
     * @since 2.2.11
     */
    function init_copy_wishlist_link () {
        $('.copy-trigger').on('click', function () {

            var obj_to_copy = $('.copy-target');

            if (obj_to_copy.length > 0) {
                if (obj_to_copy.is('input')) {

                    if (isOS()) {

                        obj_to_copy[0].setSelectionRange(0, 9999);
                    } else {
                        obj_to_copy.select();
                    }
                    document.execCommand("copy");
                } else {

                    var hidden = $('<input/>', {
                        val : obj_to_copy.text(),
                        type: 'text'
                    });

                    b('body').append(hidden);

                    if (isOS()) {
                        hidden[0].setSelectionRange(0, 9999);
                    } else {
                        hidden.select();
                    }
                    document.execCommand('copy');

                    hidden.remove();
                }
            }
        });
    }

    /**
     * Handle popup for images grid layout
     *
     * @return void
     * @since 3.0.0
     */
    function init_wishlist_details_popup() {
        $('.wishlist_table').filter('.images_grid').not('.enhanced')
            .on( 'click', '[data-row-id] .product-thumbnail a', function(ev){
                var t = $(this),
                    item = t.closest('[data-row-id]'),
                    items = item.siblings( '[data-row-id]' ),
                    popup = item.find('.item-details');

                ev.preventDefault();

                if( popup.length ){
                    items.removeClass('show');
                    item.toggleClass( 'show' );
                }
            } )
            .on( 'click', '[data-row-id] a.close', function (ev){
                var t = $(this),
                    item = t.closest('[data-row-id]'),
                    popup = item.find('.item-details');

                ev.preventDefault();

                if( popup.length ){
                    item.removeClass('show');
                }
            } )
            .on( 'click', '[data-row-id] a.remove_from_wishlist', function(ev){
                var t = $(this);

                ev.stopPropagation();

                remove_item_from_wishlist( t );

                return false;
            } )
            .addClass( 'enhanced' );


        $(document)
            .on( 'click', function( ev ){
                if( ! $( ev.target ).closest( '[data-row-id]' ).length ){
                    $('.wishlist_table').filter('.images_grid').find('.show').removeClass('show');
                }
            } )
            .on( 'added_to_cart', function(){
                $('.wishlist_table').filter('.images_grid').find('.show').removeClass('show');
            } );
    }

    /**
     * Handle tabs inside wishlist popups
     *
     * @return void
     * @since 3.0.0
     */
    function init_wishlist_popup_tabs() {
        $(document).on( 'click', '.show-tab', function(ev){
            var t = $(this),
                container = t.closest('.yith-wcwl-popup-content'),
                tab = t.data('tab'),
                target = container.find('.tab').filter( '.' + tab );

            ev.preventDefault();

            if( ! target.length ){
                return false;
            }

            t.addClass('active').siblings('.show-tab').removeClass('active');

            target.show().siblings('.tab').hide();

            if( 'create' === tab ){
                container.prepend( '<input type="hidden" id="new_wishlist_selector" class="wishlist-select" value="new">' );
            }
            else{
                container.find( '#new_wishlist_selector' ).remove();
            }
        } );

        $(document).on( 'change', '.wishlist-select', function(ev){
            var t = $(this),
                container = t.closest('.yith-wcwl-popup-content'),
                tab = t.closest( '.tab' ),
                createTab = container.find( '.tab.create' ),
                showTab = container.find( '.show-tab' ),
                createShowTab = showTab.filter( '[data-tab="create"]' ),
                val = t.val();

            if( val === 'new' && createTab.length ){
                tab.hide();
                createTab.show();

                showTab.removeClass( 'active' );
                createShowTab.addClass( 'active' );

                t.find('option').removeProp( 'selected' );
                t.change();
            }
        } )
    }

    /**
     * Init responsive behaviour of the wishlist
     *
     * @return void
     * @since 3.0.0
     */
    function init_wishlist_responsive() {
        var jqxhr = false;

        $( window ).on( 'resize', function( ev ){
            var table = $('.wishlist_table.responsive'),
                mobile = table.is('.mobile'),
                media = window.matchMedia( '(max-width: 768px)' ),
                form = table.closest('form'),
                id = form.attr('class'),
                options = form.data('fragment-options'),
                fragments = {},
                load = false;

            if( ! table.length ){
                return;
            }

            if( media.matches && table && ! mobile ){
                options.is_mobile = 'yes';
                load = true;
            }
            else if( ! media.matches && table && mobile ){
                options.is_mobile = 'no';
                load = true;
            }

            if( load ){
                if( jqxhr ){
                    jqxhr.abort();
                }

                fragments[ id ] = options;

                jqxhr = $.ajax( {
                    beforeSend: function(){
                        block( table );
                    },
                    complete: function(){
                        unblock( table );
                    },
                    data: {
                        action: yith_wcwl_l10n.actions.load_mobile_action,
                        fragments: fragments
                    },
                    method: 'post',
                    success: function( data ){
                        if( typeof data.fragments != 'undefined' ){
                            replace_fragments( data.fragments );

                            init_handling_after_ajax();

                            $(document).trigger( 'yith_wcwl_responsive_template', [ mobile, data.fragments ] );
                        }
                    },
                    url: yith_wcwl_l10n.ajax_url
                } );
            }
        } );
    }

    /* === EVENT HANDLING === */

    /**
     * Move item to another wishlist
     *
     * @return void
     * @since 3.0.0
     */
    function call_ajax_move_item_to_another_wishlist( data, beforeSend, complete ) {
        data.action = yith_wcwl_l10n.actions.move_to_another_wishlist_action;

        if( data.wishlist_token === '' || data.destination_wishlist_token === '' || data.item_id === '' ){
            return;
        }

        $.ajax( {
            beforeSend: beforeSend,
            url: yith_wcwl_l10n.ajax_url,
            data: data,
            dataType: 'json',
            method: 'post',
            success: function( response ){
                complete( response );

                init_handling_after_ajax();

                $('body').trigger('moved_to_another_wishlist', [ $(this), data.item_id ] );
            }
        });
    }

    /**
     * Remove a product from the wishlist.
     *
     * @param el
     * @return void
     * @since 1.0.0
     */
    function remove_item_from_wishlist( el ) {
        var table = el.parents( '.cart.wishlist_table' ),
            row = el.parents( '[data-row-id]' ),
            data_row_id = row.data( 'row-id'),
            wishlist_id = table.data( 'id' ),
            wishlist_token = table.data( 'token' ),
            data = {
                action: yith_wcwl_l10n.actions.remove_from_wishlist_action,
                remove_from_wishlist: data_row_id,
                wishlist_id: wishlist_id,
                wishlist_token: wishlist_token,
                fragments: retrieve_fragments( data_row_id )
            };

        $.ajax( {
            beforeSend: function(){
                block( table );
            },
            complete: function(){
                unblock( table );
            },
            data: data,
            method: 'post',
            success: function( data ){
                if( typeof data.fragments != 'undefined' ){
                    replace_fragments( data.fragments );
                }

                init_handling_after_ajax();

                $('body').trigger('removed_from_wishlist', [ el, row ] );
            },
            url: yith_wcwl_l10n.ajax_url
        } );
    }

    /**
     * Remove a product from the wishlist.
     *
     * @param el
     * @param form
     * @return void
     * @since 1.0.0
     */
    function reload_wishlist_and_adding_elem( el, form ) {

        var product_id = el.data( 'data-product-id' ),
            table = $(document).find( '.cart.wishlist_table' ),
            pagination = table.data( 'pagination' ),
            per_page = table.data( 'per-page' ),
            wishlist_id = table.data( 'id' ),
            wishlist_token = table.data( 'token' ),
            data = {
                action: yith_wcwl_l10n.actions.reload_wishlist_and_adding_elem_action,
                pagination: pagination,
                per_page: per_page,
                wishlist_id: wishlist_id,
                wishlist_token: wishlist_token,
                add_to_wishlist: product_id,
                product_type: el.data( 'product-type' )
            };

        if( ! is_cookie_enabled() ){
            alert( yith_wcwl_l10n.labels.cookie_disabled );
            return
        }

        $.ajax({
            type: 'POST',
            url: yith_wcwl_l10n.ajax_url,
            data: data,
            dataType    : 'html',
            beforeSend: function(){
                block( table );
            },
            complete: function(){
                unblock( table );
            },
            success: function(res) {
                var obj      = $(res),
                    new_form = obj.find('#yith-wcwl-form'); // get new form

                form.replaceWith( new_form );
                init_handling_after_ajax();
            }
        });
    }

    /**
     * Show form to edit wishlist title
     *
     * @param ev event
     * @return void
     * @since 2.0.0
     */
    function show_title_form( ev ) {
        var t = $(this),
            table = t.closest( '.wishlist_table' ),
            title = null;
        ev.preventDefault();

        // if button is in table
        if( table.length ){
            title = t.closest('[data-wishlist-id]').find('.wishlist-title');
        }
        else{
            title = t.parents( '.wishlist-title' );
        }

        title.next().show().find('input[type="text"]').focus();
        title.hide();
    }

    /**
     * Hide form to edit wishlist title
     *
     * @param ev event
     * @return void
     * @since 2.0.0
     */
    function hide_title_form( ev ) {
        var t = $(this);
        ev.preventDefault();

        t.parents( '.hidden-title-form').hide();
        t.parents( '.hidden-title-form').prev().show();
    }

    /**
     * Submit form to save a new wishlist title
     *
     * @param ev event
     * @return void
     * @since 2.0.7
     */
    function submit_title_form( ev ) {
        var t = $(this),
            form = t.closest( '.hidden-title-form' ),
            row = t.closest( '[data-wishlist-id]' ),
            wishlist_id = row.data( 'wishlist-id' ),
            title_input = form.find( 'input[type="text"]' ),
            new_title = title_input.val(),
            data = {};

        ev.preventDefault();

        if( ! new_title ){
            form.addClass('woocommerce-invalid');
            title_input.focus();
            return;
        }

        data = {
            action: yith_wcwl_l10n.actions.save_title_action,
            wishlist_id: wishlist_id,
            title: new_title,
            fragments: retrieve_fragments()
        };

        $.ajax({
            type: 'POST',
            url: yith_wcwl_l10n.ajax_url,
            data: data,
            dataType: 'json',
            beforeSend: function(){
                block( form );
            },
            complete: function(){
                unblock( form );
            },
            success: function( response ) {
                var fragments = response.fragments,
                    status = response.result;

                if( status ) {
                    form.hide();
                    form.prev().find('.wishlist-anchor').text( new_title ).end().show();
                }
                else{
                    form.addClass( 'woocommerce-invalid' );
                    title_input.focus();
                }

                if( typeof fragments != 'undefined' ){
                    replace_fragments( fragments );
                }
            }
        });
    }

    /**
     * Submit form to save a new wishlist privacy
     *
     * @param ev event
     * @return void
     * @since 2.0.7
     */
    function save_privacy( ev ){
        var t = $(this),
            new_privacy = t.val(),
            row = t.closest( '[data-wishlist-id]' ),
            wishlist_id = row.data( 'wishlist-id' ),
            data = {
                action: yith_wcwl_l10n.actions.save_privacy_action,
                wishlist_id: wishlist_id,
                privacy: new_privacy,
                fragments: retrieve_fragments()
            };

        $.ajax({
            type: 'POST',
            url: yith_wcwl_l10n.ajax_url,
            data: data,
            dataType: 'json',
            success: function( response ) {
                var fragments = response.fragments;

                if( typeof fragments != 'undefined' ){
                    replace_fragments( fragments );
                }
            }
        });
    }

    /* === UTILS === */

    /**
     * Closes pretty photo popup, if any
     *
     * @return void
     * @since 3.0.0
     */
    function close_pretty_photo( message ) {
        if( typeof $.prettyPhoto != 'undefined' && typeof $.prettyPhoto.close != 'undefined' ) {
            if( typeof message != 'undefined' ){
                var container = $('.pp_content_container'),
                    content = container.find('.pp_content'),
                    form = container.find('.yith-wcwl-popup-form'),
                    popup = form.closest( '.pp_pic_holder' );

                if( form.length ){
                    var new_content = $( '<div/>', {
                        class: 'yith-wcwl-popup-feedback'
                    } );

                    new_content.append( $( '<i/>', { class: 'fa fa-check heading-icon' } ) );
                    new_content.append( $( '<p/>', { class: 'feedback', html: message } ) );
                    new_content.css( 'display', 'none' );

                    content.css( 'height', 'auto' );

                    form.after( new_content );
                    form.fadeOut( 200, function(){
                        new_content.fadeIn();
                    } );

                    popup.addClass( 'feedback' );
                    popup.css( 'left', ( ( $( window ).innerWidth() / 2 ) - ( popup.outerWidth() / 2 ) ) + 'px' );

                    setTimeout( close_pretty_photo, yith_wcwl_l10n.popup_timeout );
                }
            }
            else{
                try {
                    $.prettyPhoto.close();
                }
                catch( e ){ /* do nothing, no popup to close */ }
            }
        }
    }

    /**
     * Print wishlist message for the user
     *
     * @var response_message string Message to print
     * @return void
     * @since 3.0.0
     */
    function print_message( response_message ) {
        var msgPopup = $( '#yith-wcwl-popup-message' ),
            msg = $( '#yith-wcwl-message' ),
            timeout = typeof yith_wcwl_l10n.popup_timeout != 'undefined' ? yith_wcwl_l10n.popup_timeout : 3000;

        if( typeof yith_wcwl_l10n.enable_notices != 'undefined' && ! yith_wcwl_l10n.enable_notices ){
            return;
        }

        msg.html( response_message );
        msgPopup.css( 'margin-left', '-' + $( msgPopup ).width() + 'px' ).fadeIn();
        window.setTimeout( function() {
            msgPopup.fadeOut();
        }, timeout );
    }

    /**
     * Update lists after a new list is added
     *
     * @param wishlists array Array of wishlists
     * @return void
     * @since 3.0.0
     */
    function update_wishlists( wishlists ) {
        var wishlist_select = $( 'select.wishlist-select' ),
            wishilst_dropdown = $( 'ul.yith-wcwl-dropdown' );

        // update options for all wishlist selects
        wishlist_select.each( function(){
            var t = $(this),
                wishlist_options = t.find( 'option' ),
                new_option = wishlist_options.filter( '[value="new"]' );

            wishlist_options.not(new_option ).remove();

            $.each( wishlists, function( i, v ){
                $('<option>', { value: v.id, html: v.wishlist_name } ).appendTo(t);
            } );

            t.append( new_option );
        } );

        // update options for all wishlist dropdown
        wishilst_dropdown.each( function(){
            var t = $(this),
                wishlist_options = t.find( 'li' ),
                container = t.closest( '.yith-wcwl-add-button' ),
                default_button = container.children( 'a.add_to_wishlist' ),
                product_id = default_button.attr('data-product-id'),
                product_type = default_button.attr('data-product-type');

            wishlist_options.remove();
            $.each( wishlists, function( i, v ) {
                $('<li>').append( $('<a>', {
                    rel: 'nofollow',
                    html: v.wishlist_name,
                    class: 'add_to_wishlist',
                    href: v.add_to_this_wishlist_url,
                    'data-product-id': product_id,
                    'data-product-type': product_type,
                    'data-wishlist-id': v.id
                } ) ).appendTo(t);
            } );
        } );
    }

    /**
     * Block item if possible
     *
     * @param item jQuery object
     * @return void
     * @since 3.0.0
     */
    function block( item ) {
        if( typeof $.fn.block != 'undefined' ) {
            item.fadeTo('400', '0.6').block( {
                message: null,
                overlayCSS : {
                    background    : 'transparent url(' + yith_wcwl_l10n.ajax_loader_url + ') no-repeat center',
                    backgroundSize: '40px 40px',
                    opacity       : 1
                }
            } );
        }
    }

    /**
     * Unblock item if possible
     *
     * @param item jQuery object
     * @return void
     * @since 3.0.0
     */
    function unblock( item ) {
        if( typeof $.fn.unblock != 'undefined' ) {
            item.stop(true).css('opacity', '1').unblock();
        }
    }

    /**
     * Check if cookies are enabled
     *
     * @return bool
     * @since 2.0.0
     */
    function is_cookie_enabled() {
        if (navigator.cookieEnabled) return true;

        // set and read cookie
        document.cookie = "cookietest=1";
        var ret = document.cookie.indexOf("cookietest=") !== -1;

        // delete cookie
        document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";

        return ret;
    }

    /**
     * Retrieve fragments that need to be refreshed in the page
     *
     * @param search string Ref to search among all fragments in the page
     * @return object Object containing a property for each fragments that matches search
     * @since 3.0.0
     */
    function retrieve_fragments( search ) {
        var options = {},
            fragments = null;

        if( search ){
            if( typeof search === 'object' ){
                search = $.extend( {
                    s: '',
                    container: $(document),
                    firstLoad: false
                }, search );

                fragments = search.container.find( '.wishlist-fragment' );

                if( search.s ){
                    fragments = fragments.not('[data-fragment-ref]').add(fragments.filter('[data-fragment-ref="' + search.s + '"]'));
                }

                if( search.firstLoad ){
                    fragments = fragments.filter( '.on-first-load' );
                }
            }
            else {
                fragments = $('.wishlist-fragment');

                if (typeof search == 'string' || typeof search == 'number') {
                    fragments = fragments.not('[data-fragment-ref]').add(fragments.filter('[data-fragment-ref="' + search + '"]'));
                }
            }
        }
        else{
            fragments = $('.wishlist-fragment');
        }

        fragments.each( function(){
            var t = $(this),
                id = t.attr('class');

            options[ id ] = t.data('fragment-options');
        } );

        return options;
    }

    /**
     * Load fragments on page loading
     *
     * @param search string Ref to search among all fragments in the page
     * @since 3.0.0
     */
    function load_fragments( search ) {
        if( ! yith_wcwl_l10n.enable_ajax_loading ){
            return;
        }

        search = $.extend( {
            firstLoad: true
        }, search );

        var fragments = retrieve_fragments( search );

        if( ! fragments ){
            return;
        }

        $.ajax( {
            data: {
                action: yith_wcwl_l10n.actions.load_fragments,
                fragments: fragments
            },
            method: 'post',
            success: function( data ){
                if( typeof data.fragments != 'undefined' ){
                    replace_fragments( data.fragments );

                    init_handling_after_ajax();

                    $(document).trigger( 'yith_wcwl_fragments_loaded', [ fragments, data.fragments ] );
                }
            },
            url: yith_wcwl_l10n.ajax_url
        } );
    }

    /**
     * Replace fragments with template received
     *
     * @param fragments array Array of fragments to replace
     * @since 3.0.0
     */
    function replace_fragments( fragments ) {
        $.each( fragments, function( i, v ){
            var itemSelector = '.' + i.split( ' ' ).filter( function(val){ return val.length && val !== 'exists' } ).join( '.' ),
                toReplace = $( itemSelector );

            // find replace tempalte
            var replaceWith = $(v).filter( itemSelector );

            if( ! replaceWith.length ){
                replaceWith = $(v).find( itemSelector );
            }

            if( toReplace.length && replaceWith.length ){
                toReplace.replaceWith( replaceWith );
            }
        } ) ;
    }

    /**
     * Check if device is an IOS device
     * @since 2.2.11
     */
    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }
});
( function( $ ) {

    'use strict';

    if ( typeof wpcf7 === 'undefined' || wpcf7 === null ) {
        return;
    }

    wpcf7 = $.extend( {
        cached: 0,
        inputs: []
    }, wpcf7 );

    $( function() {
        wpcf7.supportHtml5 = ( function() {
            var features = {};
            var input = document.createElement( 'input' );

            features.placeholder = 'placeholder' in input;

            var inputTypes = [ 'email', 'url', 'tel', 'number', 'range', 'date' ];

            $.each( inputTypes, function( index, value ) {
                input.setAttribute( 'type', value );
                features[ value ] = input.type !== 'text';
            } );

            return features;
        } )();

        $( 'div.wpcf7 > form' ).each( function() {
            var $form = $( this );
            wpcf7.initForm( $form );

            if ( wpcf7.cached ) {
                wpcf7.refill( $form );
            }
        } );
    } );

    wpcf7.getId = function( form ) {
        return parseInt( $( 'input[name="_wpcf7"]', form ).val(), 10 );
    };

    wpcf7.initForm = function( form ) {
        var $form = $( form );

        $form.submit( function( event ) {
            if ( ! wpcf7.supportHtml5.placeholder ) {
                $( '[placeholder].placeheld', $form ).each( function( i, n ) {
                    $( n ).val( '' ).removeClass( 'placeheld' );
                } );
            }

            if ( typeof window.FormData === 'function' ) {
                wpcf7.submit( $form );
                event.preventDefault();
            }
        } );

        $( '.wpcf7-submit', $form ).after( '<span class="ajax-loader"></span>' );

        wpcf7.toggleSubmit( $form );

        $form.on( 'click', '.wpcf7-acceptance', function() {
            wpcf7.toggleSubmit( $form );
        } );

        // Exclusive Checkbox
        $( '.wpcf7-exclusive-checkbox', $form ).on( 'click', 'input:checkbox', function() {
            var name = $( this ).attr( 'name' );
            $form.find( 'input:checkbox[name="' + name + '"]' ).not( this ).prop( 'checked', false );
        } );

        // Free Text Option for Checkboxes and Radio Buttons
        $( '.wpcf7-list-item.has-free-text', $form ).each( function() {
            var $freetext = $( ':input.wpcf7-free-text', this );
            var $wrap = $( this ).closest( '.wpcf7-form-control' );

            if ( $( ':checkbox, :radio', this ).is( ':checked' ) ) {
                $freetext.prop( 'disabled', false );
            } else {
                $freetext.prop( 'disabled', true );
            }

            $wrap.on( 'change', ':checkbox, :radio', function() {
                var $cb = $( '.has-free-text', $wrap ).find( ':checkbox, :radio' );

                if ( $cb.is( ':checked' ) ) {
                    $freetext.prop( 'disabled', false ).focus();
                } else {
                    $freetext.prop( 'disabled', true );
                }
            } );
        } );

        // Placeholder Fallback
        if ( ! wpcf7.supportHtml5.placeholder ) {
            $( '[placeholder]', $form ).each( function() {
                $( this ).val( $( this ).attr( 'placeholder' ) );
                $( this ).addClass( 'placeheld' );

                $( this ).focus( function() {
                    if ( $( this ).hasClass( 'placeheld' ) ) {
                        $( this ).val( '' ).removeClass( 'placeheld' );
                    }
                } );

                $( this ).blur( function() {
                    if ( '' === $( this ).val() ) {
                        $( this ).val( $( this ).attr( 'placeholder' ) );
                        $( this ).addClass( 'placeheld' );
                    }
                } );
            } );
        }

        if ( wpcf7.jqueryUi && ! wpcf7.supportHtml5.date ) {
            $form.find( 'input.wpcf7-date[type="date"]' ).each( function() {
                $( this ).datepicker( {
                    dateFormat: 'yy-mm-dd',
                    minDate: new Date( $( this ).attr( 'min' ) ),
                    maxDate: new Date( $( this ).attr( 'max' ) )
                } );
            } );
        }

        if ( wpcf7.jqueryUi && ! wpcf7.supportHtml5.number ) {
            $form.find( 'input.wpcf7-number[type="number"]' ).each( function() {
                $( this ).spinner( {
                    min: $( this ).attr( 'min' ),
                    max: $( this ).attr( 'max' ),
                    step: $( this ).attr( 'step' )
                } );
            } );
        }

        // Character Count
        $( '.wpcf7-character-count', $form ).each( function() {
            var $count = $( this );
            var name = $count.attr( 'data-target-name' );
            var down = $count.hasClass( 'down' );
            var starting = parseInt( $count.attr( 'data-starting-value' ), 10 );
            var maximum = parseInt( $count.attr( 'data-maximum-value' ), 10 );
            var minimum = parseInt( $count.attr( 'data-minimum-value' ), 10 );

            var updateCount = function( target ) {
                var $target = $( target );
                var length = $target.val().length;
                var count = down ? starting - length : length;
                $count.attr( 'data-current-value', count );
                $count.text( count );

                if ( maximum && maximum < length ) {
                    $count.addClass( 'too-long' );
                } else {
                    $count.removeClass( 'too-long' );
                }

                if ( minimum && length < minimum ) {
                    $count.addClass( 'too-short' );
                } else {
                    $count.removeClass( 'too-short' );
                }
            };

            $( ':input[name="' + name + '"]', $form ).each( function() {
                updateCount( this );

                $( this ).keyup( function() {
                    updateCount( this );
                } );
            } );
        } );

        // URL Input Correction
        $form.on( 'change', '.wpcf7-validates-as-url', function() {
            var val = $.trim( $( this ).val() );

            if ( val
                && ! val.match( /^[a-z][a-z0-9.+-]*:/i )
                && -1 !== val.indexOf( '.' ) ) {
                val = val.replace( /^\/+/, '' );
                val = 'http://' + val;
            }

            $( this ).val( val );
        } );
    };

    wpcf7.submit = function( form ) {
        if ( typeof window.FormData !== 'function' ) {
            return;
        }

        var $form = $( form );

        $( '.ajax-loader', $form ).addClass( 'is-active' );

        wpcf7.clearResponse( $form );

        var formData = new FormData( $form.get( 0 ) );

        var detail = {
            id: $form.closest( 'div.wpcf7' ).attr( 'id' ),
            status: 'init',
            inputs: [],
            formData: formData
        };

        $.each( $form.serializeArray(), function( i, field ) {
            if ( '_wpcf7' == field.name ) {
                detail.contactFormId = field.value;
            } else if ( '_wpcf7_version' == field.name ) {
                detail.pluginVersion = field.value;
            } else if ( '_wpcf7_locale' == field.name ) {
                detail.contactFormLocale = field.value;
            } else if ( '_wpcf7_unit_tag' == field.name ) {
                detail.unitTag = field.value;
            } else if ( '_wpcf7_container_post' == field.name ) {
                detail.containerPostId = field.value;
            } else if ( field.name.match( /^_wpcf7_\w+_free_text_/ ) ) {
                var owner = field.name.replace( /^_wpcf7_\w+_free_text_/, '' );
                detail.inputs.push( {
                    name: owner + '-free-text',
                    value: field.value
                } );
            } else if ( field.name.match( /^_/ ) ) {
                // do nothing
            } else {
                detail.inputs.push( field );
            }
        } );

        wpcf7.triggerEvent( $form.closest( 'div.wpcf7' ), 'beforesubmit', detail );

        var ajaxSuccess = function( data, status, xhr, $form ) {
            detail.id = $( data.into ).attr( 'id' );
            detail.status = data.status;
            detail.apiResponse = data;

            var $message = $( '.wpcf7-response-output', $form );

            switch ( data.status ) {
                case 'validation_failed':
                    $.each( data.invalidFields, function( i, n ) {
                        $( n.into, $form ).each( function() {
                            wpcf7.notValidTip( this, n.message );
                            $( '.wpcf7-form-control', this ).addClass( 'wpcf7-not-valid' );
                            $( '[aria-invalid]', this ).attr( 'aria-invalid', 'true' );
                        } );
                    } );

                    $message.addClass( 'wpcf7-validation-errors' );
                    $form.addClass( 'invalid' );

                    wpcf7.triggerEvent( data.into, 'invalid', detail );
                    break;
                case 'acceptance_missing':
                    $message.addClass( 'wpcf7-acceptance-missing' );
                    $form.addClass( 'unaccepted' );

                    wpcf7.triggerEvent( data.into, 'unaccepted', detail );
                    break;
                case 'spam':
                    $message.addClass( 'wpcf7-spam-blocked' );
                    $form.addClass( 'spam' );

                    wpcf7.triggerEvent( data.into, 'spam', detail );
                    break;
                case 'aborted':
                    $message.addClass( 'wpcf7-aborted' );
                    $form.addClass( 'aborted' );

                    wpcf7.triggerEvent( data.into, 'aborted', detail );
                    break;
                case 'mail_sent':
                    $message.addClass( 'wpcf7-mail-sent-ok' );
                    $form.addClass( 'sent' );

                    wpcf7.triggerEvent( data.into, 'mailsent', detail );
                    break;
                case 'mail_failed':
                    $message.addClass( 'wpcf7-mail-sent-ng' );
                    $form.addClass( 'failed' );

                    wpcf7.triggerEvent( data.into, 'mailfailed', detail );
                    break;
                default:
                    var customStatusClass = 'custom-'
                        + data.status.replace( /[^0-9a-z]+/i, '-' );
                    $message.addClass( 'wpcf7-' + customStatusClass );
                    $form.addClass( customStatusClass );
            }

            wpcf7.refill( $form, data );

            wpcf7.triggerEvent( data.into, 'submit', detail );

            if ( 'mail_sent' == data.status ) {
                $form.each( function() {
                    this.reset();
                } );

                wpcf7.toggleSubmit( $form );
            }

            if ( ! wpcf7.supportHtml5.placeholder ) {
                $form.find( '[placeholder].placeheld' ).each( function( i, n ) {
                    $( n ).val( $( n ).attr( 'placeholder' ) );
                } );
            }

            $message.html( '' ).append( data.message ).slideDown( 'fast' );
            $message.attr( 'role', 'alert' );

            $( '.screen-reader-response', $form.closest( '.wpcf7' ) ).each( function() {
                var $response = $( this );
                $response.html( '' ).attr( 'role', '' ).append( data.message );

                if ( data.invalidFields ) {
                    var $invalids = $( '<ul></ul>' );

                    $.each( data.invalidFields, function( i, n ) {
                        if ( n.idref ) {
                            var $li = $( '<li></li>' ).append( $( '<a></a>' ).attr( 'href', '#' + n.idref ).append( n.message ) );
                        } else {
                            var $li = $( '<li></li>' ).append( n.message );
                        }

                        $invalids.append( $li );
                    } );

                    $response.append( $invalids );
                }

                $response.attr( 'role', 'alert' ).focus();
            } );
        };

        $.ajax( {
            type: 'POST',
            url: wpcf7.apiSettings.getRoute(
                '/contact-forms/' + wpcf7.getId( $form ) + '/feedback' ),
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false
        } ).done( function( data, status, xhr ) {
            ajaxSuccess( data, status, xhr, $form );
            $( '.ajax-loader', $form ).removeClass( 'is-active' );
        } ).fail( function( xhr, status, error ) {
            var $e = $( '<div class="ajax-error"></div>' ).text( error.message );
            $form.after( $e );
        } );
    };

    wpcf7.triggerEvent = function( target, name, detail ) {
        var $target = $( target );

        /* DOM event */
        var event = new CustomEvent( 'wpcf7' + name, {
            bubbles: true,
            detail: detail
        } );

        $target.get( 0 ).dispatchEvent( event );

        /* jQuery event */
        $target.trigger( 'wpcf7:' + name, detail );
        $target.trigger( name + '.wpcf7', detail ); // deprecated
    };

    wpcf7.toggleSubmit = function( form, state ) {
        var $form = $( form );
        var $submit = $( 'input:submit', $form );

        if ( typeof state !== 'undefined' ) {
            $submit.prop( 'disabled', ! state );
            return;
        }

        if ( $form.hasClass( 'wpcf7-acceptance-as-validation' ) ) {
            return;
        }

        $submit.prop( 'disabled', false );

        $( '.wpcf7-acceptance', $form ).each( function() {
            var $span = $( this );
            var $input = $( 'input:checkbox', $span );

            if ( ! $span.hasClass( 'optional' ) ) {
                if ( $span.hasClass( 'invert' ) && $input.is( ':checked' )
                    || ! $span.hasClass( 'invert' ) && ! $input.is( ':checked' ) ) {
                    $submit.prop( 'disabled', true );
                    return false;
                }
            }
        } );
    };

    wpcf7.notValidTip = function( target, message ) {
        var $target = $( target );
        $( '.wpcf7-not-valid-tip', $target ).remove();
        $( '<span role="alert" class="wpcf7-not-valid-tip"></span>' )
            .text( message ).appendTo( $target );

        if ( $target.is( '.use-floating-validation-tip *' ) ) {
            var fadeOut = function( target ) {
                $( target ).not( ':hidden' ).animate( {
                    opacity: 0
                }, 'fast', function() {
                    $( this ).css( { 'z-index': -100 } );
                } );
            };

            $target.on( 'mouseover', '.wpcf7-not-valid-tip', function() {
                fadeOut( this );
            } );

            $target.on( 'focus', ':input', function() {
                fadeOut( $( '.wpcf7-not-valid-tip', $target ) );
            } );
        }
    };

    wpcf7.refill = function( form, data ) {
        var $form = $( form );

        var refillCaptcha = function( $form, items ) {
            $.each( items, function( i, n ) {
                $form.find( ':input[name="' + i + '"]' ).val( '' );
                $form.find( 'img.wpcf7-captcha-' + i ).attr( 'src', n );
                var match = /([0-9]+)\.(png|gif|jpeg)$/.exec( n );
                $form.find( 'input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]' ).attr( 'value', match[ 1 ] );
            } );
        };

        var refillQuiz = function( $form, items ) {
            $.each( items, function( i, n ) {
                $form.find( ':input[name="' + i + '"]' ).val( '' );
                $form.find( ':input[name="' + i + '"]' ).siblings( 'span.wpcf7-quiz-label' ).text( n[ 0 ] );
                $form.find( 'input:hidden[name="_wpcf7_quiz_answer_' + i + '"]' ).attr( 'value', n[ 1 ] );
            } );
        };

        if ( typeof data === 'undefined' ) {
            $.ajax( {
                type: 'GET',
                url: wpcf7.apiSettings.getRoute(
                    '/contact-forms/' + wpcf7.getId( $form ) + '/refill' ),
                beforeSend: function( xhr ) {
                    var nonce = $form.find( ':input[name="_wpnonce"]' ).val();

                    if ( nonce ) {
                        xhr.setRequestHeader( 'X-WP-Nonce', nonce );
                    }
                },
                dataType: 'json'
            } ).done( function( data, status, xhr ) {
                if ( data.captcha ) {
                    refillCaptcha( $form, data.captcha );
                }

                if ( data.quiz ) {
                    refillQuiz( $form, data.quiz );
                }
            } );

        } else {
            if ( data.captcha ) {
                refillCaptcha( $form, data.captcha );
            }

            if ( data.quiz ) {
                refillQuiz( $form, data.quiz );
            }
        }
    };

    wpcf7.clearResponse = function( form ) {
        var $form = $( form );
        $form.removeClass( 'invalid spam sent failed' );
        $form.siblings( '.screen-reader-response' ).html( '' ).attr( 'role', '' );

        $( '.wpcf7-not-valid-tip', $form ).remove();
        $( '[aria-invalid]', $form ).attr( 'aria-invalid', 'false' );
        $( '.wpcf7-form-control', $form ).removeClass( 'wpcf7-not-valid' );

        $( '.wpcf7-response-output', $form )
            .hide().empty().removeAttr( 'role' )
            .removeClass( 'wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked' );
    };

    wpcf7.apiSettings.getRoute = function( path ) {
        var url = wpcf7.apiSettings.root;

        url = url.replace(
            wpcf7.apiSettings.namespace,
            wpcf7.apiSettings.namespace + path );

        return url;
    };

} )( jQuery );

/*
 * Polyfill for Internet Explorer
 * See https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
( function () {
    if ( typeof window.CustomEvent === "function" ) return false;

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event,
            params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
} )();
/* global wc_add_to_cart_params */
jQuery( function( $ ) {

    if ( typeof wc_add_to_cart_params === 'undefined' ) {
        return false;
    }

    /**
     * AddToCartHandler class.
     */
    var AddToCartHandler = function() {
        this.requests   = [];
        this.addRequest = this.addRequest.bind( this );
        this.run        = this.run.bind( this );

        $( document.body )
            .on( 'click', '.add_to_cart_button', { addToCartHandler: this }, this.onAddToCart )
            .on( 'click', '.remove_from_cart_button', { addToCartHandler: this }, this.onRemoveFromCart )
            .on( 'added_to_cart', this.updateButton )
            .on( 'added_to_cart removed_from_cart', { addToCartHandler: this }, this.updateFragments );
    };

    /**
     * Add add to cart event.
     */
    AddToCartHandler.prototype.addRequest = function( request ) {
        this.requests.push( request );

        if ( 1 === this.requests.length ) {
            this.run();
        }
    };

    /**
     * Run add to cart events.
     */
    AddToCartHandler.prototype.run = function() {
        var requestManager = this,
            originalCallback = requestManager.requests[0].complete;

        requestManager.requests[0].complete = function() {
            if ( typeof originalCallback === 'function' ) {
                originalCallback();
            }

            requestManager.requests.shift();

            if ( requestManager.requests.length > 0 ) {
                requestManager.run();
            }
        };

        $.ajax( this.requests[0] );
    };

    /**
     * Handle the add to cart event.
     */
    AddToCartHandler.prototype.onAddToCart = function( e ) {
        var $thisbutton = $( this );

        if ( $thisbutton.is( '.ajax_add_to_cart' ) ) {
            if ( ! $thisbutton.attr( 'data-product_id' ) ) {
                return true;
            }

            e.preventDefault();

            $thisbutton.removeClass( 'added' );
            $thisbutton.addClass( 'loading' );

            var data = {};

            $.each( $thisbutton.data(), function( key, value ) {
                data[ key ] = value;
            });

            // Trigger event.
            $( document.body ).trigger( 'adding_to_cart', [ $thisbutton, data ] );

            e.data.addToCartHandler.addRequest({
                type: 'POST',
                url: wc_add_to_cart_params.wc_ajax_url.toString().replace( '%%endpoint%%', 'add_to_cart' ),
                data: data,
                success: function( response ) {
                    if ( ! response ) {
                        return;
                    }

                    if ( response.error && response.product_url ) {
                        window.location = response.product_url;
                        return;
                    }

                    // Redirect to cart option
                    if ( wc_add_to_cart_params.cart_redirect_after_add === 'yes' ) {
                        window.location = wc_add_to_cart_params.cart_url;
                        return;
                    }

                    // Trigger event so themes can refresh other areas.
                    $( document.body ).trigger( 'added_to_cart', [ response.fragments, response.cart_hash, $thisbutton ] );
                },
                dataType: 'json'
            });
        }
    };

    /**
     * Update fragments after remove from cart event in mini-cart.
     */
    AddToCartHandler.prototype.onRemoveFromCart = function( e ) {
        var $thisbutton = $( this ),
            $row        = $thisbutton.closest( '.woocommerce-mini-cart-item' );

        e.preventDefault();

        $row.block({
            message: null,
            overlayCSS: {
                opacity: 0.6
            }
        });

        e.data.addToCartHandler.addRequest({
            type: 'POST',
            url: wc_add_to_cart_params.wc_ajax_url.toString().replace( '%%endpoint%%', 'remove_from_cart' ),
            data: {
                cart_item_key : $thisbutton.data( 'cart_item_key' )
            },
            success: function( response ) {
                if ( ! response || ! response.fragments ) {
                    window.location = $thisbutton.attr( 'href' );
                    return;
                }

                $( document.body ).trigger( 'removed_from_cart', [ response.fragments, response.cart_hash, $thisbutton ] );
            },
            error: function() {
                window.location = $thisbutton.attr( 'href' );
                return;
            },
            dataType: 'json'
        });
    };

    /**
     * Update cart page elements after add to cart events.
     */
    AddToCartHandler.prototype.updateButton = function( e, fragments, cart_hash, $button ) {
        $button = typeof $button === 'undefined' ? false : $button;

        if ( $button ) {
            $button.removeClass( 'loading' );
            $button.addClass( 'added' );

            // View cart text.
            if ( ! wc_add_to_cart_params.is_cart && $button.parent().find( '.added_to_cart' ).length === 0 ) {
                $button.after( ' <a href="' + wc_add_to_cart_params.cart_url + '" class="added_to_cart wc-forward" title="' +
                    wc_add_to_cart_params.i18n_view_cart + '">' + wc_add_to_cart_params.i18n_view_cart + '</a>' );
            }

            $( document.body ).trigger( 'wc_cart_button_updated', [ $button ] );
        }
    };

    /**
     * Update fragments after add to cart events.
     */
    AddToCartHandler.prototype.updateFragments = function( e, fragments ) {
        if ( fragments ) {
            $.each( fragments, function( key ) {
                $( key )
                    .addClass( 'updating' )
                    .fadeTo( '400', '0.6' )
                    .block({
                        message: null,
                        overlayCSS: {
                            opacity: 0.6
                        }
                    });
            });

            $.each( fragments, function( key, value ) {
                $( key ).replaceWith( value );
                $( key ).stop( true ).css( 'opacity', '1' ).unblock();
            });

            $( document.body ).trigger( 'wc_fragments_loaded' );
        }
    };

    /**
     * Init AddToCartHandler.
     */
    new AddToCartHandler();
});
/* global Cookies */
jQuery( function( $ ) {
    // Orderby
    $( '.woocommerce-ordering' ).on( 'change', 'select.orderby', function() {
        $( this ).closest( 'form' ).submit();
    });

    // Target quantity inputs on product pages
    $( 'input.qty:not(.product-quantity input.qty)' ).each( function() {
        var min = parseFloat( $( this ).attr( 'min' ) );

        if ( min >= 0 && parseFloat( $( this ).val() ) < min ) {
            $( this ).val( min );
        }
    });

    var noticeID   = $( '.woocommerce-store-notice' ).data( 'notice-id' ) || '',
        cookieName = 'store_notice' + noticeID;

    // Check the value of that cookie and show/hide the notice accordingly
    if ( 'hidden' === Cookies.get( cookieName ) ) {
        $( '.woocommerce-store-notice' ).hide();
    } else {
        $( '.woocommerce-store-notice' ).show();
    }

    // Set a cookie and hide the store notice when the dismiss button is clicked
    $( '.woocommerce-store-notice__dismiss-link' ).click( function( event ) {
        Cookies.set( cookieName, 'hidden', { path: '/' } );
        $( '.woocommerce-store-notice' ).hide();
        event.preventDefault();
    });

    // Make form field descriptions toggle on focus.
    $( document.body ).on( 'click', function() {
        $( '.woocommerce-input-wrapper span.description:visible' ).prop( 'aria-hidden', true ).slideUp( 250 );
    } );

    $( '.woocommerce-input-wrapper' ).on( 'click', function( event ) {
        event.stopPropagation();
    } );

    $( '.woocommerce-input-wrapper :input' )
        .on( 'keydown', function( event ) {
            var input       = $( this ),
                parent      = input.parent(),
                description = parent.find( 'span.description' );

            if ( 27 === event.which && description.length && description.is( ':visible' ) ) {
                description.prop( 'aria-hidden', true ).slideUp( 250 );
                event.preventDefault();
                return false;
            }
        } )
        .on( 'click focus', function() {
            var input       = $( this ),
                parent      = input.parent(),
                description = parent.find( 'span.description' );

            parent.addClass( 'currentTarget' );

            $( '.woocommerce-input-wrapper:not(.currentTarget) span.description:visible' ).prop( 'aria-hidden', true ).slideUp( 250 );

            if ( description.length && description.is( ':hidden' ) ) {
                description.prop( 'aria-hidden', false ).slideDown( 250 );
            }

            parent.removeClass( 'currentTarget' );
        } );

    // Common scroll to element code.
    $.scroll_to_notices = function( scrollElement ) {
        if ( scrollElement.length ) {
            $( 'html, body' ).animate( {
                scrollTop: ( scrollElement.offset().top - 100 )
            }, 1000 );
        }
    };
});
/*
 * This file is part of the hyyan/woo-poly-integration plugin.
 * (c) Hyyan Abo Fakher <hyyanaf@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * Modified WooCommerce cart-fragments.js script to break HTML5 fragment caching.
 * Useful when switching languages. Adds support new Cart page ajax.
 *
 * Updated in line with WooCommerce 3.6.3 cart-fragments.js,
 * only difference is the additional Polylang lines... and these commments
 **/

/* global wc_cart_fragments_params, Cookies */
jQuery( function( $ ) {

    // wc_cart_fragments_params is required to continue, ensure the object exists
    if ( typeof wc_cart_fragments_params === 'undefined' ) {
        return false;
    }

    /* Storage Handling */
    var $supports_html5_storage = true,
        cart_hash_key           = wc_cart_fragments_params.cart_hash_key;

    try {
        $supports_html5_storage = ( 'sessionStorage' in window && window.sessionStorage !== null );
        window.sessionStorage.setItem( 'wc', 'test' );
        window.sessionStorage.removeItem( 'wc' );
        window.localStorage.setItem( 'wc', 'test' );
        window.localStorage.removeItem( 'wc' );
    } catch( err ) {
        $supports_html5_storage = false;
    }

    /* Cart session creation time to base expiration on */
    function set_cart_creation_timestamp() {
        if ( $supports_html5_storage ) {
            sessionStorage.setItem( 'wc_cart_created', ( new Date() ).getTime() );
        }
    }

    /** Set the cart hash in both session and local storage */
    function set_cart_hash( cart_hash ) {
        if ( $supports_html5_storage ) {
            localStorage.setItem( cart_hash_key, cart_hash );
            sessionStorage.setItem( cart_hash_key, cart_hash );
        }
    }

    /* Get current Polylang language */
    function get_pll_language() {
        var pll_lang = $.cookie('pll_language');

        if (pll_lang === null || pll_lang === undefined || pll_lang === '') {
            pll_lang = '';
        }

        return pll_lang;
    }

    var $fragment_refresh = {
        url: wc_cart_fragments_params.wc_ajax_url.toString().replace( '%%endpoint%%', 'get_refreshed_fragments' ),
        type: 'POST',
        data: {
            time: new Date().getTime()
        },
        timeout: wc_cart_fragments_params.request_timeout,
        success: function( data ) {
            if ( data && data.fragments ) {

                $.each( data.fragments, function( key, value ) {
                    $( key ).replaceWith( value );
                });

                if ( $supports_html5_storage ) {
                    sessionStorage.setItem( wc_cart_fragments_params.fragment_name, JSON.stringify( data.fragments ) );
                    set_cart_hash( data.cart_hash );

                    if ( data.cart_hash ) {
                        set_cart_creation_timestamp();
                    }
                }

                $( document.body ).trigger( 'wc_fragments_refreshed' );
            }
        },
        error: function() {
            $( document.body ).trigger( 'wc_fragments_ajax_error' );
        }
    };

    /* Named callback for refreshing cart fragment */
    function refresh_cart_fragment() {
        $.ajax( $fragment_refresh );
    }

    /* Cart Handling */
    if ( $supports_html5_storage ) {

        var cart_timeout = null,
            day_in_ms    = ( 24 * 60 * 60 * 1000 );

        $( document.body ).on( 'wc_fragment_refresh updated_wc_div', function() {
            refresh_cart_fragment();
        });

        $( document.body ).on( 'added_to_cart removed_from_cart', function( event, fragments, cart_hash ) {
            var prev_cart_hash = sessionStorage.getItem( cart_hash_key );

            if ( prev_cart_hash === null || prev_cart_hash === undefined || prev_cart_hash === '' ) {
                set_cart_creation_timestamp();
            }

            sessionStorage.setItem( wc_cart_fragments_params.fragment_name, JSON.stringify( fragments ) );
            set_cart_hash( cart_hash );
        });

        $( document.body ).on( 'wc_fragments_refreshed', function() {
            clearTimeout( cart_timeout );
            cart_timeout = setTimeout( refresh_cart_fragment, day_in_ms );
        } );

        // Refresh when storage changes in another tab
        $( window ).on( 'storage onstorage', function ( e ) {
            if (
                cart_hash_key === e.originalEvent.key && localStorage.getItem( cart_hash_key ) !== sessionStorage.getItem( cart_hash_key )
            ) {
                refresh_cart_fragment();
            }
        });

        // Refresh when page is shown after back button (safari)
        $( window ).on( 'pageshow' , function( e ) {
            if ( e.originalEvent.persisted ) {
                $( '.widget_shopping_cart_content' ).empty();
                $( document.body ).trigger( 'wc_fragment_refresh' );
            }
        } );

        try {
            var wc_fragments = $.parseJSON( sessionStorage.getItem( wc_cart_fragments_params.fragment_name ) ),
                cart_hash    = sessionStorage.getItem( cart_hash_key ),
                cookie_hash  = Cookies.get( 'woocommerce_cart_hash'),
                cart_created = sessionStorage.getItem( 'wc_cart_created' );

            if ( cart_hash === null || cart_hash === undefined || cart_hash === '' ) {
                cart_hash = '';
            }

            if ( cookie_hash === null || cookie_hash === undefined || cookie_hash === '' ) {
                cookie_hash = '';
            }

            if ( cart_hash && ( cart_created === null || cart_created === undefined || cart_created === '' ) ) {
                throw 'No cart_created';
            }

            if ( cart_created ) {
                var cart_expiration = ( ( 1 * cart_created ) + day_in_ms ),
                    timestamp_now   = ( new Date() ).getTime();
                if ( cart_expiration < timestamp_now ) {
                    throw 'Fragment expired';
                }
                cart_timeout = setTimeout( refresh_cart_fragment, ( cart_expiration - timestamp_now ) );
            }

            if ( wc_fragments && wc_fragments['div.widget_shopping_cart_content'] && cart_hash === cookie_hash ) {

                $.each( wc_fragments, function( key, value ) {
                    $( key ).replaceWith(value);
                });

                $( document.body ).trigger( 'wc_fragments_loaded' );
            } else {
                throw 'No fragment';
            }

            // Refresh when the display language changes
            var prev_pll_lang = sessionStorage.getItem('pll_language'),
                pll_lang = get_pll_language();

            if (prev_pll_lang === null || prev_pll_lang === undefined || prev_pll_lang === '') {
                prev_pll_lang = '';
            }

            if (pll_lang) {
                if (!prev_pll_lang || prev_pll_lang !== pll_lang) {
                    sessionStorage.setItem('pll_language', pll_lang);
                    throw 'Language changed';
                }
            } else {
                throw 'Language not found';
            }

        } catch (err) {
            refresh_cart_fragment();
        }

    } else {
        refresh_cart_fragment();
    }

    /* Cart Hiding */
    if ( Cookies.get( 'woocommerce_items_in_cart' ) > 0 ) {
        $( '.hide_cart_widget_if_empty' ).closest( '.widget_shopping_cart' ).show();
    } else {
        $( '.hide_cart_widget_if_empty' ).closest( '.widget_shopping_cart' ).hide();
    }

    $( document.body ).on( 'adding_to_cart', function() {
        $( '.hide_cart_widget_if_empty' ).closest( '.widget_shopping_cart' ).show();
    });

    // Customiser support.
    var hasSelectiveRefresh = (
        'undefined' !== typeof wp &&
        wp.customize &&
        wp.customize.selectiveRefresh &&
        wp.customize.widgetsPreview &&
        wp.customize.widgetsPreview.WidgetPartial
    );
    if ( hasSelectiveRefresh ) {
        wp.customize.selectiveRefresh.bind( 'partial-content-rendered', function() {
            refresh_cart_fragment();
        } );
    }
});
(function ( $ ) {
    'use strict';

    $( document ).ready( function () {
        $( 'body' ).on( 'adding_to_cart', function ( event, $button, data ) {
            if ( $button && $button.hasClass( 'vc_gitem-link' ) ) {
                $button
                    .addClass( 'vc-gitem-add-to-cart-loading-btn' )
                    .parents( '.vc_grid-item-mini' )
                    .addClass( 'vc-woocommerce-add-to-cart-loading' )
                    .append( $( '<div class="vc_wc-load-add-to-loader-wrapper"><div class="vc_wc-load-add-to-loader"></div></div>' ) );
            }
        } ).on( 'added_to_cart', function ( event, fragments, cart_hash, $button ) {
            if ( 'undefined' === typeof ($button) ) {
                $button = $( '.vc-gitem-add-to-cart-loading-btn' );
            }
            if ( $button && $button.hasClass( 'vc_gitem-link' ) ) {
                $button
                    .removeClass( 'vc-gitem-add-to-cart-loading-btn' )
                    .parents( '.vc_grid-item-mini' )
                    .removeClass( 'vc-woocommerce-add-to-cart-loading' )
                    .find( '.vc_wc-load-add-to-loader-wrapper' ).remove();
            }
        } );
    } );
})( window.jQuery );
/**
 * frontend.js
 *
 * @author Your Inspiration Themes
 * @package YITH WooCommerce Quick View
 * @version 1.0.0
 */

jQuery(document).ready(function($){
    "use strict";

    if( typeof yith_qv === 'undefined' ) {
        return;
    }

    var qv_modal    = $(document).find( '#yith-quick-view-modal' ),
        qv_overlay  = qv_modal.find( '.yith-quick-view-overlay'),
        qv_content  = qv_modal.find( '#yith-quick-view-content' ),
        qv_close    = qv_modal.find( '#yith-quick-view-close' ),
        qv_wrapper  = qv_modal.find( '.yith-wcqv-wrapper'),
        qv_wrapper_w = qv_wrapper.width(),
        qv_wrapper_h = qv_wrapper.height(),
        center_modal = function() {

            var window_w = $(window).width(),
                window_h = $(window).height(),
                width    = ( ( window_w - 60 ) > qv_wrapper_w ) ? qv_wrapper_w : ( window_w - 60 ),
                height   = ( ( window_h - 120 ) > qv_wrapper_h ) ? qv_wrapper_h : ( window_h - 120 );

            qv_wrapper.css({
                'left' : (( window_w/2 ) - ( width/2 )),
                'top' : (( window_h/2 ) - ( height/2 )),
                'width'     : width + 'px',
                'height'    : height + 'px'
            });
        };


    /*==================
     *MAIN BUTTON OPEN
     ==================*/

    $.fn.yith_quick_view = function() {

        $(document).off( 'click', '.yith-wcqv-button' ).on( 'click', '.yith-wcqv-button', function(e){
            e.preventDefault();

            var t           = $(this),
                product_id  = t.data( 'product_id' ),
                is_blocked  = false;

            if ( typeof yith_qv.loader !== 'undefined' ) {
                is_blocked = true;
                t.block({
                    message: null,
                    overlayCSS  : {
                        background: '#fff url(' + yith_qv.loader + ') no-repeat center',
                        opacity   : 0.5,
                        cursor    : 'none'
                    }
                });

                if( ! qv_modal.hasClass( 'loading' ) ) {
                    qv_modal.addClass('loading');
                }

                // stop loader
                $(document).trigger( 'qv_loading' );
            }
            ajax_call( t, product_id, is_blocked );
        });
    };

    /*================
     * MAIN AJAX CALL
     ================*/

    var ajax_call = function( t, product_id, is_blocked ) {

        $.ajax({
            url: yith_qv.ajaxurl,
            data: {
                action: 'yith_load_product_quick_view',
                product_id: product_id,
                lang: yith_qv.lang
            },
            dataType: 'html',
            type: 'POST',
            success: function (data) {

                qv_content.html(data);

                // Variation Form
                var form_variation = qv_content.find('.variations_form');
                form_variation.each( function() {
                    $( this ).wc_variation_form();
                    // add Color and Label Integration
                    if( typeof $.fn.yith_wccl !== 'undefined' ) {
                        $(this).yith_wccl();
                    }
                });

                form_variation.trigger( 'check_variations' );
                form_variation.trigger( 'reset_image' );

                if( typeof $.fn.wc_product_gallery !== 'undefined' ) {
                    qv_content.find('.woocommerce-product-gallery').each(function () {
                        $(this).wc_product_gallery();
                    });
                }

                if (!qv_modal.hasClass('open')) {
                    qv_modal.removeClass('loading').addClass('open');
                    if (is_blocked)
                        t.unblock();
                }

                // stop loader
                $(document).trigger('qv_loader_stop');

            }
        });
    };

    /*===================
     * CLOSE QUICK VIEW
     ===================*/

    var close_modal_qv = function() {

        // Close box by click overlay
        qv_overlay.on( 'click', function(e){
            close_qv();
        });
        // Close box with esc key
        $(document).keyup(function(e){
            if( e.keyCode === 27 )
                close_qv();
        });
        // Close box by click close button
        qv_close.on( 'click', function(e) {
            e.preventDefault();
            close_qv();
        });

        var close_qv = function() {
            qv_modal.removeClass('open').removeClass('loading');

            setTimeout(function () {
                qv_content.html('');
            }, 1000);
        }
    };

    close_modal_qv();


    center_modal();
    $( window ).on( 'resize', center_modal );

    // START
    $.fn.yith_quick_view();

    $( document ).on( 'yith_infs_adding_elem yith-wcan-ajax-filtered', function(){
        // RESTART
        $.fn.yith_quick_view();
    });

});/**
 * jQuery SelectBox
 *
 * v1.2.0
 * github.com/marcj/jquery-selectBox
 */
(function(a){var b=this.SelectBox=function(c,d){if(c instanceof jQuery){if(c.length>0){c=c[0]}else{return}}this.typeTimer=null;this.typeSearch="";this.isMac=navigator.platform.match(/mac/i);d="object"===typeof d?d:{};this.selectElement=c;if(!d.mobile&&navigator.userAgent.match(/iPad|iPhone|Android|IEMobile|BlackBerry/i)){return false}if("select"!==c.tagName.toLowerCase()){return false}this.init(d)};b.prototype.version="1.2.0";b.prototype.init=function(o){var j=a(this.selectElement);if(j.data("selectBox-control")){return false}var f=a('<a class="selectBox" />'),h=j.attr("multiple")||parseInt(j.attr("size"))>1,d=o||{},c=parseInt(j.prop("tabindex"))||0,m=this;f.width(j.outerWidth()).addClass(j.attr("class")).attr("title",j.attr("title")||"").attr("tabindex",c).css("display","inline-block").bind("focus.selectBox",function(){if(this!==document.activeElement&&document.body!==document.activeElement){a(document.activeElement).blur()}if(f.hasClass("selectBox-active")){return}f.addClass("selectBox-active");j.trigger("focus")}).bind("blur.selectBox",function(){if(!f.hasClass("selectBox-active")){return}f.removeClass("selectBox-active");j.trigger("blur")});if(!a(window).data("selectBox-bindings")){a(window).data("selectBox-bindings",true).bind("scroll.selectBox",this.hideMenus).bind("resize.selectBox",this.hideMenus)}if(j.attr("disabled")){f.addClass("selectBox-disabled")}j.bind("click.selectBox",function(p){f.focus();p.preventDefault()});if(h){o=this.getOptions("inline");f.append(o).data("selectBox-options",o).addClass("selectBox-inline selectBox-menuShowing").bind("keydown.selectBox",function(p){m.handleKeyDown(p)}).bind("keypress.selectBox",function(p){m.handleKeyPress(p)}).bind("mousedown.selectBox",function(p){if(1!==p.which){return}if(a(p.target).is("A.selectBox-inline")){p.preventDefault()}if(!f.hasClass("selectBox-focus")){f.focus()}}).insertAfter(j);if(!j[0].style.height){var n=j.attr("size")?parseInt(j.attr("size")):5;var e=f.clone().removeAttr("id").css({position:"absolute",top:"-9999em"}).show().appendTo("body");e.find(".selectBox-options").html("<li><a>\u00A0</a></li>");var l=parseInt(e.find(".selectBox-options A:first").html("&nbsp;").outerHeight());e.remove();f.height(l*n)}this.disableSelection(f)}else{var i=a('<span class="selectBox-label" />'),k=a('<span class="selectBox-arrow" />');i.attr("class",this.getLabelClass()).text(this.getLabelText());o=this.getOptions("dropdown");o.appendTo("BODY");f.data("selectBox-options",o).addClass("selectBox-dropdown").append(i).append(k).bind("mousedown.selectBox",function(p){if(1===p.which){if(f.hasClass("selectBox-menuShowing")){m.hideMenus()}else{p.stopPropagation();o.data("selectBox-down-at-x",p.screenX).data("selectBox-down-at-y",p.screenY);m.showMenu()}}}).bind("keydown.selectBox",function(p){m.handleKeyDown(p)}).bind("keypress.selectBox",function(p){m.handleKeyPress(p)}).bind("open.selectBox",function(q,p){if(p&&p._selectBox===true){return}m.showMenu()}).bind("close.selectBox",function(q,p){if(p&&p._selectBox===true){return}m.hideMenus()}).insertAfter(j);var g=f.width()-k.outerWidth()-parseInt(i.css("paddingLeft"))||0-parseInt(i.css("paddingRight"))||0;i.width(g);this.disableSelection(f)}j.addClass("selectBox").data("selectBox-control",f).data("selectBox-settings",d).hide()};b.prototype.getOptions=function(j){var f;var c=a(this.selectElement);var e=this;var d=function(i,k){i.children("OPTION, OPTGROUP").each(function(){if(a(this).is("OPTION")){if(a(this).length>0){e.generateOptions(a(this),k)}else{k.append("<li>\u00A0</li>")}}else{var l=a('<li class="selectBox-optgroup" />');l.text(a(this).attr("label"));k.append(l);k=d(a(this),k)}});return k};switch(j){case"inline":f=a('<ul class="selectBox-options" />');f=d(c,f);f.find("A").bind("mouseover.selectBox",function(i){e.addHover(a(this).parent())}).bind("mouseout.selectBox",function(i){e.removeHover(a(this).parent())}).bind("mousedown.selectBox",function(i){if(1!==i.which){return}i.preventDefault();if(!c.selectBox("control").hasClass("selectBox-active")){c.selectBox("control").focus()}}).bind("mouseup.selectBox",function(i){if(1!==i.which){return}e.hideMenus();e.selectOption(a(this).parent(),i)});this.disableSelection(f);return f;case"dropdown":f=a('<ul class="selectBox-dropdown-menu selectBox-options" />');f=d(c,f);f.data("selectBox-select",c).css("display","none").appendTo("BODY").find("A").bind("mousedown.selectBox",function(i){if(i.which===1){i.preventDefault();if(i.screenX===f.data("selectBox-down-at-x")&&i.screenY===f.data("selectBox-down-at-y")){f.removeData("selectBox-down-at-x").removeData("selectBox-down-at-y");e.hideMenus()}}}).bind("mouseup.selectBox",function(i){if(1!==i.which){return}if(i.screenX===f.data("selectBox-down-at-x")&&i.screenY===f.data("selectBox-down-at-y")){return}else{f.removeData("selectBox-down-at-x").removeData("selectBox-down-at-y")}e.selectOption(a(this).parent());e.hideMenus()}).bind("mouseover.selectBox",function(i){e.addHover(a(this).parent())}).bind("mouseout.selectBox",function(i){e.removeHover(a(this).parent())});var h=c.attr("class")||"";if(""!==h){h=h.split(" ");for(var g in h){f.addClass(h[g]+"-selectBox-dropdown-menu")}}this.disableSelection(f);return f}};b.prototype.getLabelClass=function(){var c=a(this.selectElement).find("OPTION:selected");return("selectBox-label "+(c.attr("class")||"")).replace(/\s+$/,"")};b.prototype.getLabelText=function(){var c=a(this.selectElement).find("OPTION:selected");return c.text()||"\u00A0"};b.prototype.setLabel=function(){var c=a(this.selectElement);var d=c.data("selectBox-control");if(!d){return}d.find(".selectBox-label").attr("class",this.getLabelClass()).text(this.getLabelText())};b.prototype.destroy=function(){var c=a(this.selectElement);var e=c.data("selectBox-control");if(!e){return}var d=e.data("selectBox-options");d.remove();e.remove();c.removeClass("selectBox").removeData("selectBox-control").data("selectBox-control",null).removeData("selectBox-settings").data("selectBox-settings",null).show()};b.prototype.refresh=function(){var c=a(this.selectElement),e=c.data("selectBox-control"),f=e.hasClass("selectBox-dropdown"),d=e.hasClass("selectBox-menuShowing");c.selectBox("options",c.html());if(f&&d){this.showMenu()}};b.prototype.showMenu=function(){var e=this,d=a(this.selectElement),j=d.data("selectBox-control"),h=d.data("selectBox-settings"),f=j.data("selectBox-options");if(j.hasClass("selectBox-disabled")){return false}this.hideMenus();var g=parseInt(j.css("borderBottomWidth"))||0;f.width(j.innerWidth()).css({top:j.offset().top+j.outerHeight()-g,left:j.offset().left});if(d.triggerHandler("beforeopen")){return false}var i=function(){d.triggerHandler("open",{_selectBox:true})};switch(h.menuTransition){case"fade":f.fadeIn(h.menuSpeed,i);break;case"slide":f.slideDown(h.menuSpeed,i);break;default:f.show(h.menuSpeed,i);break}if(!h.menuSpeed){i()}var c=f.find(".selectBox-selected:first");this.keepOptionInView(c,true);this.addHover(c);j.addClass("selectBox-menuShowing");a(document).bind("mousedown.selectBox",function(k){if(1===k.which){if(a(k.target).parents().andSelf().hasClass("selectBox-options")){return}e.hideMenus()}})};b.prototype.hideMenus=function(){if(a(".selectBox-dropdown-menu:visible").length===0){return}a(document).unbind("mousedown.selectBox");a(".selectBox-dropdown-menu").each(function(){var d=a(this),c=d.data("selectBox-select"),g=c.data("selectBox-control"),e=c.data("selectBox-settings");if(c.triggerHandler("beforeclose")){return false}var f=function(){c.triggerHandler("close",{_selectBox:true})};if(e){switch(e.menuTransition){case"fade":d.fadeOut(e.menuSpeed,f);break;case"slide":d.slideUp(e.menuSpeed,f);break;default:d.hide(e.menuSpeed,f);break}if(!e.menuSpeed){f()}g.removeClass("selectBox-menuShowing")}else{a(this).hide();a(this).triggerHandler("close",{_selectBox:true});a(this).removeClass("selectBox-menuShowing")}})};b.prototype.selectOption=function(d,j){var c=a(this.selectElement);d=a(d);var k=c.data("selectBox-control"),h=c.data("selectBox-settings");if(k.hasClass("selectBox-disabled")){return false}if(0===d.length||d.hasClass("selectBox-disabled")){return false}if(c.attr("multiple")){if(j.shiftKey&&k.data("selectBox-last-selected")){d.toggleClass("selectBox-selected");var e;if(d.index()>k.data("selectBox-last-selected").index()){e=d.siblings().slice(k.data("selectBox-last-selected").index(),d.index())}else{e=d.siblings().slice(d.index(),k.data("selectBox-last-selected").index())}e=e.not(".selectBox-optgroup, .selectBox-disabled");if(d.hasClass("selectBox-selected")){e.addClass("selectBox-selected")}else{e.removeClass("selectBox-selected")}}else{if((this.isMac&&j.metaKey)||(!this.isMac&&j.ctrlKey)){d.toggleClass("selectBox-selected")}else{d.siblings().removeClass("selectBox-selected");d.addClass("selectBox-selected")}}}else{d.siblings().removeClass("selectBox-selected");d.addClass("selectBox-selected")}if(k.hasClass("selectBox-dropdown")){k.find(".selectBox-label").text(d.text())}var f=0,g=[];if(c.attr("multiple")){k.find(".selectBox-selected A").each(function(){g[f++]=a(this).attr("rel")})}else{g=d.find("A").attr("rel")}k.data("selectBox-last-selected",d);if(c.val()!==g){c.val(g);this.setLabel();c.trigger("change")}return true};b.prototype.addHover=function(d){d=a(d);var c=a(this.selectElement),f=c.data("selectBox-control"),e=f.data("selectBox-options");e.find(".selectBox-hover").removeClass("selectBox-hover");d.addClass("selectBox-hover")};b.prototype.getSelectElement=function(){return this.selectElement};b.prototype.removeHover=function(d){d=a(d);var c=a(this.selectElement),f=c.data("selectBox-control"),e=f.data("selectBox-options");e.find(".selectBox-hover").removeClass("selectBox-hover")};b.prototype.keepOptionInView=function(e,d){if(!e||e.length===0){return}var c=a(this.selectElement),j=c.data("selectBox-control"),g=j.data("selectBox-options"),h=j.hasClass("selectBox-dropdown")?g:g.parent(),i=parseInt(e.offset().top-h.position().top),f=parseInt(i+e.outerHeight());if(d){h.scrollTop(e.offset().top-h.offset().top+h.scrollTop()-(h.height()/2))}else{if(i<0){h.scrollTop(e.offset().top-h.offset().top+h.scrollTop())}if(f>h.height()){h.scrollTop((e.offset().top+e.outerHeight())-h.offset().top+h.scrollTop()-h.height())}}};b.prototype.handleKeyDown=function(c){var k=a(this.selectElement),g=k.data("selectBox-control"),l=g.data("selectBox-options"),e=k.data("selectBox-settings"),f=0,h=0;if(g.hasClass("selectBox-disabled")){return}switch(c.keyCode){case 8:c.preventDefault();this.typeSearch="";break;case 9:case 27:this.hideMenus();this.removeHover();break;case 13:if(g.hasClass("selectBox-menuShowing")){this.selectOption(l.find("LI.selectBox-hover:first"),c);if(g.hasClass("selectBox-dropdown")){this.hideMenus()}}else{this.showMenu()}break;case 38:case 37:c.preventDefault();if(g.hasClass("selectBox-menuShowing")){var d=l.find(".selectBox-hover").prev("LI");f=l.find("LI:not(.selectBox-optgroup)").length;h=0;while(d.length===0||d.hasClass("selectBox-disabled")||d.hasClass("selectBox-optgroup")){d=d.prev("LI");if(d.length===0){if(e.loopOptions){d=l.find("LI:last")}else{d=l.find("LI:first")}}if(++h>=f){break}}this.addHover(d);this.selectOption(d,c);this.keepOptionInView(d)}else{this.showMenu()}break;case 40:case 39:c.preventDefault();if(g.hasClass("selectBox-menuShowing")){var j=l.find(".selectBox-hover").next("LI");f=l.find("LI:not(.selectBox-optgroup)").length;h=0;while(0===j.length||j.hasClass("selectBox-disabled")||j.hasClass("selectBox-optgroup")){j=j.next("LI");if(j.length===0){if(e.loopOptions){j=l.find("LI:first")}else{j=l.find("LI:last")}}if(++h>=f){break}}this.addHover(j);this.selectOption(j,c);this.keepOptionInView(j)}else{this.showMenu()}break}};b.prototype.handleKeyPress=function(e){var c=a(this.selectElement),f=c.data("selectBox-control"),d=f.data("selectBox-options");if(f.hasClass("selectBox-disabled")){return}switch(e.keyCode){case 9:case 27:case 13:case 38:case 37:case 40:case 39:break;default:if(!f.hasClass("selectBox-menuShowing")){this.showMenu()}e.preventDefault();clearTimeout(this.typeTimer);this.typeSearch+=String.fromCharCode(e.charCode||e.keyCode);d.find("A").each(function(){if(a(this).text().substr(0,this.typeSearch.length).toLowerCase()===this.typeSearch.toLowerCase()){this.addHover(a(this).parent());this.selectOption(a(this).parent(),e);this.keepOptionInView(a(this).parent());return false}});this.typeTimer=setTimeout(function(){this.typeSearch=""},1000);break}};b.prototype.enable=function(){var c=a(this.selectElement);c.prop("disabled",false);var d=c.data("selectBox-control");if(!d){return}d.removeClass("selectBox-disabled")};b.prototype.disable=function(){var c=a(this.selectElement);c.prop("disabled",true);var d=c.data("selectBox-control");if(!d){return}d.addClass("selectBox-disabled")};b.prototype.setValue=function(f){var c=a(this.selectElement);c.val(f);f=c.val();if(null===f){f=c.children().first().val();c.val(f)}var g=c.data("selectBox-control");if(!g){return}var e=c.data("selectBox-settings"),d=g.data("selectBox-options");this.setLabel();d.find(".selectBox-selected").removeClass("selectBox-selected");d.find("A").each(function(){if(typeof(f)==="object"){for(var h=0;h<f.length;h++){if(a(this).attr("rel")==f[h]){a(this).parent().addClass("selectBox-selected")}}}else{if(a(this).attr("rel")==f){a(this).parent().addClass("selectBox-selected")}}});if(e.change){e.change.call(c)}};b.prototype.setOptions=function(m){var l=a(this.selectElement),f=l.data("selectBox-control"),d=l.data("selectBox-settings"),k;switch(typeof(m)){case"string":l.html(m);break;case"object":l.html("");for(var g in m){if(m[g]===null){continue}if(typeof(m[g])==="object"){var c=a('<optgroup label="'+g+'" />');for(var e in m[g]){c.append('<option value="'+e+'">'+m[g][e]+"</option>")}l.append(c)}else{var h=a('<option value="'+g+'">'+m[g]+"</option>");l.append(h)}}break}if(!f){return}f.data("selectBox-options").remove();k=f.hasClass("selectBox-dropdown")?"dropdown":"inline";m=this.getOptions(k);f.data("selectBox-options",m);switch(k){case"inline":f.append(m);break;case"dropdown":this.setLabel();a("BODY").append(m);break}};b.prototype.disableSelection=function(c){a(c).css("MozUserSelect","none").bind("selectstart",function(d){d.preventDefault()})};b.prototype.generateOptions=function(e,f){var c=a("<li />"),d=a("<a />");c.addClass(e.attr("class"));c.data(e.data());d.attr("rel",e.val()).text(e.text());c.append(d);if(e.attr("disabled")){c.addClass("selectBox-disabled")}if(e.attr("selected")){c.addClass("selectBox-selected")}f.append(c)};a.extend(a.fn,{selectBox:function(e,c){var d;switch(e){case"control":return a(this).data("selectBox-control");case"settings":if(!c){return a(this).data("selectBox-settings")}a(this).each(function(){a(this).data("selectBox-settings",a.extend(true,a(this).data("selectBox-settings"),c))});break;case"options":if(undefined===c){return a(this).data("selectBox-control").data("selectBox-options")}a(this).each(function(){if(d=a(this).data("selectBox")){d.setOptions(c)}});break;case"value":if(undefined===c){return a(this).val()}a(this).each(function(){if(d=a(this).data("selectBox")){d.setValue(c)}});break;case"refresh":a(this).each(function(){if(d=a(this).data("selectBox")){d.refresh()}});break;case"enable":a(this).each(function(){if(d=a(this).data("selectBox")){d.enable(this)}});break;case"disable":a(this).each(function(){if(d=a(this).data("selectBox")){d.disable()}});break;case"destroy":a(this).each(function(){if(d=a(this).data("selectBox")){d.destroy();a(this).data("selectBox",null)}});break;case"instance":return a(this).data("selectBox");default:a(this).each(function(g,f){if(!a(f).data("selectBox")){a(f).data("selectBox",new b(f,e))}});break}return a(this)}})})(jQuery);var mailchimp,mailchimp_cart,mailchimp_billing_email,mailchimp_username_email,mailchimp_registration_email,mailchimp_submitted_email=!1,mailchimpReady=function(e){/in/.test(document.readyState)?setTimeout("mailchimpReady("+e+")",9):e()};function mailchimpGetCurrentUserByHash(e){try{var i=mailchimp_public_data.ajax_url+"?action=mailchimp_get_user_by_hash&hash="+e,a=new XMLHttpRequest;a.open("POST",i,!0),a.onload=function(){if(a.status>=200&&a.status<400){var e=JSON.parse(a.responseText);if(!e)return;mailchimp_cart.valueEmail(e.email)&&mailchimp_cart.setEmail(e.email)}},a.onerror=function(){console.log("mailchimp.get_email_by_hash.request.error",a.responseText)},a.setRequestHeader("Content-Type","application/json"),a.setRequestHeader("Accept","application/json"),a.send()}catch(e){console.log("mailchimp.get_email_by_hash.error",e)}}function mailchimpHandleBillingEmail(e){try{e||(e="#billing_email");var i=document.querySelector(e),a=void 0!==i?i.value:"";if(!mailchimp_cart.valueEmail(a)||mailchimp_submitted_email===a)return!1;mailchimp_cart.setEmail(a);var t=mailchimp_public_data.ajax_url+"?action=mailchimp_set_user_by_email&email="+a,n=new XMLHttpRequest;return n.open("POST",t,!0),n.onload=function(){var e=n.status>=200&&n.status<400,i=e?"mailchimp.handle_billing_email.request.success":"mailchimp.handle_billing_email.request.error";e&&(mailchimp_submitted_email=a),console.log(i,n.responseText)},n.onerror=function(){console.log("mailchimp.handle_billing_email.request.error",n.responseText)},n.setRequestHeader("Content-Type","application/json"),n.setRequestHeader("Accept","application/json"),n.send(),!0}catch(i){console.log("mailchimp.handle_billing_email.error",i),mailchimp_submitted_email=!1}}!function(){"use strict";var e,i,a,t={extend:function(e,i){for(var a in i||{})i.hasOwnProperty(a)&&(e[a]=i[a]);return e},getQueryStringVars:function(){var e=window.location.search||"",i=[],a={};if((e=e.substr(1)).length)for(var t in i=e.split("&")){var n=i[t];if("string"==typeof n){var l=n.split("="),r=l[0],m=l[1];r.length&&(void 0===a[r]&&(a[r]=[]),a[r].push(m))}}return a},unEscape:function(e){return decodeURIComponent(e)},escape:function(e){return encodeURIComponent(e)},createDate:function(e,i){e||(e=0);var a=new Date,t=i?a.getDate()-e:a.getDate()+e;return a.setDate(t),a},arrayUnique:function(e){for(var i=e.concat(),a=0;a<i.length;++a)for(var t=a+1;t<i.length;++t)i[a]===i[t]&&i.splice(t,1);return i},objectCombineUnique:function(e){for(var i=e[0],a=1;a<e.length;a++){var t=e[a];for(var n in t)i[n]=t[n]}return i}},n=(e=document,(a=function(e,i,t){return 1===arguments.length?a.get(e):a.set(e,i,t)}).get=function(i,t){return e.cookie!==a._cacheString&&a._populateCache(),null==a._cache[i]?t:a._cache[i]},a.defaults={path:"/"},a.set=function(t,n,l){switch(l={path:l&&l.path||a.defaults.path,domain:l&&l.domain||a.defaults.domain,expires:l&&l.expires||a.defaults.expires,secure:l&&l.secure!==i?l.secure:a.defaults.secure},n===i&&(l.expires=-1),typeof l.expires){case"number":l.expires=new Date((new Date).getTime()+1e3*l.expires);break;case"string":l.expires=new Date(l.expires)}return t=encodeURIComponent(t)+"="+(n+"").replace(/[^!#-+\--:<-\[\]-~]/g,encodeURIComponent),t+=l.path?";path="+l.path:"",t+=l.domain?";domain="+l.domain:"",t+=l.expires?";expires="+l.expires.toGMTString():"",t+=l.secure?";secure":"",e.cookie=t,a},a.expire=function(e,t){return a.set(e,i,t)},a._populateCache=function(){a._cache={};try{a._cacheString=e.cookie;for(var t=a._cacheString.split("; "),n=0;n<t.length;n++){var l=t[n].indexOf("="),r=decodeURIComponent(t[n].substr(0,l));l=decodeURIComponent(t[n].substr(l+1)),a._cache[r]===i&&(a._cache[r]=l)}}catch(e){console.log(e)}},a.enabled=function(){var e="1"===a.set("cookies.js","1").get("cookies.js");return a.expire("cookies.js"),e}(),a);mailchimp={storage:n,utils:t},mailchimp_cart=new function(){return this.email_types="input[type=email]",this.regex_email=/^([A-Za-z0-9_+\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,this.current_email=null,this.previous_email=null,this.expireUser=function(){this.current_email=null,mailchimp.storage.expire("mailchimp.cart.current_email")},this.expireSaved=function(){mailchimp.storage.expire("mailchimp.cart.items")},this.setEmail=function(e){if(!this.valueEmail(e))return!1;this.setPreviousEmail(this.getEmail()),mailchimp.storage.set("mailchimp.cart.current_email",this.current_email=e)},this.getEmail=function(){if(this.current_email)return this.current_email;var e=mailchimp.storage.get("mailchimp.cart.current_email",!1);return!(!e||!this.valueEmail(e))&&(this.current_email=e)},this.setPreviousEmail=function(e){if(!this.valueEmail(e))return!1;mailchimp.storage.set("mailchimp.cart.previous_email",this.previous_email=e)},this.valueEmail=function(e){return this.regex_email.test(e)},this}}(),mailchimpReady(function(){if(void 0===e)var e={site_url:document.location.origin,defaulted:!0,ajax_url:document.location.origin+"/wp-admin?admin-ajax.php"};try{var i=mailchimp.utils.getQueryStringVars();void 0!==i.mc_cart_id&&mailchimpGetCurrentUserByHash(i.mc_cart_id),mailchimp_username_email=document.querySelector("#username"),mailchimp_billing_email=document.querySelector("#billing_email"),mailchimp_registration_email=document.querySelector("#reg_email"),mailchimp_billing_email&&(mailchimp_billing_email.onblur=function(){mailchimpHandleBillingEmail("#billing_email")},mailchimp_billing_email.onfocus=function(){mailchimpHandleBillingEmail("#billing_email")}),mailchimp_username_email&&(mailchimp_username_email.onblur=function(){mailchimpHandleBillingEmail("#username")},mailchimp_username_email.onfocus=function(){mailchimpHandleBillingEmail("#username")}),mailchimp_registration_email&&(mailchimp_registration_email.onblur=function(){mailchimpHandleBillingEmail("#reg_email")},mailchimp_registration_email.onfocus=function(){mailchimpHandleBillingEmail("#reg_email")})}catch(e){console.log("mailchimp ready error",e)}});/*!
 * Variation Swatches for WooCommerce v1.0.80
 *
 * Author: Emran Ahmed ( emran.bd.08@gmail.com )
 * Date: 4/2/2020, 11:47:32 PM
 * Released under the GPLv3 license.
 */
/******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
        /******/
        /******/ 		// Check if module is in cache
        /******/ 		if(installedModules[moduleId]) {
            /******/ 			return installedModules[moduleId].exports;
            /******/ 		}
        /******/ 		// Create a new module (and put it into the cache)
        /******/ 		var module = installedModules[moduleId] = {
            /******/ 			i: moduleId,
            /******/ 			l: false,
            /******/ 			exports: {}
            /******/ 		};
        /******/
        /******/ 		// Execute the module function
        /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ 		// Flag the module as loaded
        /******/ 		module.l = true;
        /******/
        /******/ 		// Return the exports of the module
        /******/ 		return module.exports;
        /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
        /******/ 		if(!__webpack_require__.o(exports, name)) {
            /******/ 			Object.defineProperty(exports, name, {
                /******/ 				configurable: false,
                /******/ 				enumerable: true,
                /******/ 				get: getter
                /******/ 			});
            /******/ 		}
        /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
        /******/ 		var getter = module && module.__esModule ?
            /******/ 			function getDefault() { return module['default']; } :
            /******/ 			function getModuleExports() { return module; };
        /******/ 		__webpack_require__.d(getter, 'a', getter);
        /******/ 		return getter;
        /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 9);
    /******/ })
    /************************************************************************/
    /******/ ({

        /***/ 10:
        /***/ (function(module, exports, __webpack_require__) {

            jQuery(function ($) {
                Promise.resolve().then(function () {
                    return __webpack_require__(11);
                }).then(function () {
                    // Init on Ajax Popup :)
                    $(document).on('wc_variation_form.wvs', '.variations_form', function () {
                        $(this).WooVariationSwatches();
                    });

                    /*$('.variations_form').each(function () {
                        $(this).on('found_variation', function(e){
                            console.log('found_variation called', $(this))
                        });
                    })*/

                    // Support for Jetpack's Infinite Scroll,
                    $(document.body).on('post-load.wvs', function () {
                        $('.variations_form').each(function () {
                            $(this).wc_variation_form();
                        });
                    });

                    // Support for Yith Infinite Scroll
                    $(document).on('yith_infs_added_elem.wvs', function () {
                        $('.variations_form').each(function () {
                            $(this).wc_variation_form();
                        });
                    });

                    // Support for Yith Ajax Filter
                    $(document).on('yith-wcan-ajax-filtered.wvs', function () {
                        $('.variations_form').each(function () {
                            $(this).wc_variation_form();
                        });
                    });

                    // Support for Woodmart theme
                    $(document).on('wood-images-loaded.wvs', function () {
                        $('.variations_form').each(function () {
                            $(this).wc_variation_form();
                        });
                    });

                    // Support for berocket ajax filters
                    $(document).on('berocket_ajax_products_loaded.wvs', function () {
                        $('.variations_form').each(function () {
                            $(this).wc_variation_form();
                        });
                    });

                    // Flatsome Infinite Scroll Support
                    $('.shop-container .products').on('append.infiniteScroll', function (event, response, path) {
                        $('.variations_form').each(function () {
                            $(this).wc_variation_form();
                        });
                    });

                    // FacetWP Load More
                    $(document).on('facetwp-loaded.wvs', function () {
                        $('.variations_form').each(function () {
                            $(this).wc_variation_form();
                        });
                    });

                    // WooCommerce Filter Nav
                    $('body').on('aln_reloaded.wvs', function () {
                        _.delay(function () {
                            $('.variations_form').each(function () {
                                $(this).wc_variation_form();
                            });
                        }, 100);
                    });
                });
            }); // end of jquery main wrapper

            /***/ }),

        /***/ 11:
        /***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
            Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
            var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

            function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ================================================================
// WooCommerce Variation Change
// ================================================================

            var WooVariationSwatches = function ($) {

                var Default = {};

                var WooVariationSwatches = function () {
                    function WooVariationSwatches(element, config) {
                        _classCallCheck(this, WooVariationSwatches);

                        // Assign
                        this._element = $(element);
                        this._config = $.extend({}, Default, config);
                        this._generated = {};
                        this._out_of_stock = {};
                        this.product_variations = this._element.data('product_variations');
                        this.is_ajax_variation = !this.product_variations;
                        this.product_id = this._element.data('product_id');
                        this.hidden_behaviour = $('body').hasClass('woo-variation-swatches-attribute-behavior-hide');
                        this.is_mobile = $('body').hasClass('woo-variation-swatches-on-mobile');

                        // Call
                        this.init(this.is_ajax_variation, this.hidden_behaviour);
                        this.loaded(this.is_ajax_variation, this.hidden_behaviour);
                        this.update(this.is_ajax_variation, this.hidden_behaviour);
                        this.reset(this.is_ajax_variation, this.hidden_behaviour);

                        // Trigger
                        $(document).trigger('woo_variation_swatches', [this._element]);
                    }

                    _createClass(WooVariationSwatches, [{
                        key: 'init',
                        value: function init(is_ajax, hidden_behaviour) {
                            var _this3 = this;

                            var _this = this;
                            this._element.find('ul.variable-items-wrapper').each(function (i, el) {

                                var select = $(this).siblings('select.woo-variation-raw-select');
                                var li = $(this).find('li');
                                var reselect_clear = $(this).hasClass('reselect-clear');
                                var is_mobile = $('body').hasClass('woo-variation-swatches-on-mobile');
                                // let mouse_event_name = 'touchstart click';
                                var mouse_event_name = 'click';

                                $(this).parent().addClass('woo-variation-items-wrapper');

                                // For Avada FIX
                                if (select.length < 1) {
                                    select = $(this).parent().find('select.woo-variation-raw-select');
                                }

                                if (reselect_clear) {
                                    $(this).on(mouse_event_name, 'li:not(.selected):not(.radio-variable-item):not(.woo-variation-swatches-variable-item-more)', function (e) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        var value = $(this).data('value');
                                        select.val(value).trigger('change');
                                        select.trigger('click');

                                        select.trigger('focusin');

                                        if (is_mobile) {
                                            select.trigger('touchstart');
                                        }

                                        $(this).trigger('focus'); // Mobile tooltip
                                        $(this).trigger('wvs-selected-item', [value, select, _this._element]); // Custom Event for li
                                    });

                                    $(this).on(mouse_event_name, 'li.selected:not(.radio-variable-item)', function (e) {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        var value = $(this).val();

                                        select.val('').trigger('change');
                                        select.trigger('click');

                                        select.trigger('focusin');

                                        if (is_mobile) {
                                            select.trigger('touchstart');
                                        }

                                        $(this).trigger('focus'); // Mobile tooltip

                                        $(this).trigger('wvs-unselected-item', [value, select, _this._element]); // Custom Event for li
                                    });

                                    // RADIO
                                    $(this).on(mouse_event_name, 'input.wvs-radio-variable-item:radio', function (e) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        $(this).trigger('change');
                                    });

                                    $(this).on('change', 'input.wvs-radio-variable-item:radio', function (e) {
                                        var _this2 = this;

                                        e.preventDefault();
                                        e.stopPropagation();

                                        var value = $(this).val();

                                        if ($(this).parent('li.radio-variable-item').hasClass('selected')) {
                                            select.val('').trigger('change');
                                            _.delay(function () {
                                                $(_this2).prop('checked', false);
                                                $(_this2).parent('li.radio-variable-item').trigger('wvs-unselected-item', [value, select, _this._element]); // Custom Event for li
                                            }, 1);
                                        } else {
                                            select.val(value).trigger('change');
                                            $(this).parent('.radio-variable-item').trigger('wvs-selected-item', [value, select, _this._element]); // Custom Event for li
                                        }

                                        select.trigger('click');
                                        select.trigger('focusin');
                                        if (is_mobile) {
                                            select.trigger('touchstart');
                                        }
                                    });
                                } else {
                                    $(this).on(mouse_event_name, 'li:not(.radio-variable-item):not(.woo-variation-swatches-variable-item-more)', function (e) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        var value = $(this).data('value');
                                        select.val(value).trigger('change');
                                        select.trigger('click');
                                        select.trigger('focusin');
                                        if (is_mobile) {
                                            select.trigger('touchstart');
                                        }

                                        $(this).trigger('focus'); // Mobile tooltip

                                        $(this).trigger('wvs-selected-item', [value, select, _this._element]); // Custom Event for li
                                    });

                                    // Radio
                                    $(this).on('change', 'input.wvs-radio-variable-item:radio', function (e) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        var value = $(this).val();

                                        select.val(value).trigger('change');
                                        select.trigger('click');
                                        select.trigger('focusin');

                                        if (is_mobile) {
                                            select.trigger('touchstart');
                                        }

                                        // Radio
                                        $(this).parent('li.radio-variable-item').removeClass('selected disabled').addClass('selected');
                                        $(this).parent('li.radio-variable-item').trigger('wvs-selected-item', [value, select, _this._element]); // Custom Event for li
                                    });
                                }
                            });

                            _.delay(function () {
                                _this3._element.trigger('reload_product_variations');
                                _this3._element.trigger('woo_variation_swatches_init', [_this3, _this3.product_variations]);
                                $(document).trigger('woo_variation_swatches_loaded', [_this3._element, _this3.product_variations]);
                            }, 1);
                        }
                    }, {
                        key: 'loaded',
                        value: function loaded(is_ajax, hidden_behaviour) {
                            if (!is_ajax) {
                                this._element.on('woo_variation_swatches_init', function (event, object, product_variations) {

                                    object._generated = product_variations.reduce(function (obj, variation) {

                                        Object.keys(variation.attributes).map(function (attribute_name) {
                                            if (!obj[attribute_name]) {
                                                obj[attribute_name] = [];
                                            }

                                            if (variation.attributes[attribute_name]) {
                                                obj[attribute_name].push(variation.attributes[attribute_name]);
                                            }
                                        });

                                        return obj;
                                    }, {});

                                    object._out_of_stock = product_variations.reduce(function (obj, variation) {

                                        Object.keys(variation.attributes).map(function (attribute_name) {
                                            if (!obj[attribute_name]) {
                                                obj[attribute_name] = [];
                                            }

                                            if (variation.attributes[attribute_name] && !variation.is_in_stock) {
                                                obj[attribute_name].push(variation.attributes[attribute_name]);
                                            }
                                        });

                                        return obj;
                                    }, {});

                                    // console.log(object._out_of_stock);

                                    $(this).find('ul.variable-items-wrapper').each(function () {
                                        var li = $(this).find('li:not(.woo-variation-swatches-variable-item-more)');
                                        var attribute = $(this).data('attribute_name');
                                        var attribute_values = object._generated[attribute];
                                        var out_of_stock_values = object._out_of_stock[attribute];

                                        //console.log(out_of_stock_values)

                                        li.each(function () {
                                            var attribute_value = $(this).attr('data-value');

                                            // if (!_.isEmpty(attribute_values) && !_.contains(attribute_values, attribute_value)){}

                                            if (!_.isEmpty(attribute_values) && _.indexOf(attribute_values, attribute_value) === -1) {
                                                $(this).removeClass('selected');
                                                $(this).addClass('disabled');

                                                if ($(this).hasClass('radio-variable-item')) {
                                                    $(this).find('input.wvs-radio-variable-item:radio').prop('disabled', true).prop('checked', false);
                                                }
                                            }
                                        });
                                    });
                                });
                            }
                        }
                    }, {
                        key: 'reset',
                        value: function reset(is_ajax, hidden_behaviour) {
                            var _this = this;
                            this._element.on('reset_data', function (event) {
                                $(this).find('ul.variable-items-wrapper').each(function () {
                                    var li = $(this).find('li');
                                    li.each(function () {
                                        if (!is_ajax) {
                                            $(this).removeClass('selected disabled');

                                            if ($(this).hasClass('radio-variable-item')) {
                                                $(this).find('input.wvs-radio-variable-item:radio').prop('disabled', false).prop('checked', false);
                                            }
                                        } else {
                                            if ($(this).hasClass('radio-variable-item')) {
                                                //    $(this).find('input.wvs-radio-variable-item:radio').prop('checked', false);
                                            }
                                        }

                                        $(this).trigger('wvs-unselected-item', ['', '', _this._element]); // Custom Event for li
                                    });
                                });
                            });
                        }
                    }, {
                        key: 'update',
                        value: function update(is_ajax, hidden_behaviour) {

                            this._element.on('__found_variation', function (event, variation) {

                                //console.log(this.$attributeFields);

                                /*  _.delay(() => {
                                      $(this).find('ul.variable-items-wrapper').each(function () {
                                          let attribute_name = $(this).data('attribute_name');
                                           $(this).find('li').each(function () {
                                              let value = $(this).attr('data-value');
                                               console.log(variation)
                                               if (variation.attributes[attribute_name] === value && !variation.is_in_stock) {
                                                  $(this).addClass('disabled');
                                              }
                                           });
                                      });
                                   }, 2)*/
                            });

                            this._element.on('woocommerce_variation_has_changed', function (event) {
                                if (is_ajax) {
                                    $(this).find('ul.variable-items-wrapper').each(function () {
                                        var _this4 = this;

                                        var selected = '',
                                            options = $(this).siblings('select.woo-variation-raw-select').find('option'),
                                            current = $(this).siblings('select.woo-variation-raw-select').find('option:selected'),
                                            eq = $(this).siblings('select.woo-variation-raw-select').find('option').eq(1),
                                            li = $(this).find('li'),
                                            selects = [];

                                        // For Avada FIX
                                        if (options.length < 1) {
                                            options = $(this).parent().find('select.woo-variation-raw-select').find('option');
                                            current = $(this).parent().find('select.woo-variation-raw-select').find('option:selected');
                                            eq = $(this).parent().find('select.woo-variation-raw-select').find('option').eq(1);
                                        }

                                        options.each(function () {
                                            if ($(this).val() !== '') {
                                                selects.push($(this).val());
                                                selected = current ? current.val() : eq.val();
                                            }
                                        });

                                        _.delay(function () {
                                            li.each(function () {
                                                var value = $(this).attr('data-value');
                                                $(this).removeClass('selected disabled');

                                                if (value === selected) {
                                                    $(this).addClass('selected');
                                                    if ($(this).hasClass('radio-variable-item')) {
                                                        $(this).find('input.wvs-radio-variable-item:radio').prop('disabled', false).prop('checked', true);
                                                    }
                                                }
                                            });

                                            // Items Updated
                                            $(_this4).trigger('wvs-items-updated');
                                        }, 1);
                                    });
                                }
                            });

                            // WithOut Ajax Update
                            this._element.on('woocommerce_update_variation_values', function (event) {
                                $(this).find('ul.variable-items-wrapper').each(function () {
                                    var _this5 = this;

                                    var selected = '',
                                        options = $(this).siblings('select.woo-variation-raw-select').find('option'),
                                        current = $(this).siblings('select.woo-variation-raw-select').find('option:selected'),
                                        eq = $(this).siblings('select.woo-variation-raw-select').find('option').eq(1),
                                        li = $(this).find('li:not(.woo-variation-swatches-variable-item-more)'),
                                        selects = [];

                                    // For Avada FIX
                                    if (options.length < 1) {
                                        options = $(this).parent().find('select.woo-variation-raw-select').find('option');
                                        current = $(this).parent().find('select.woo-variation-raw-select').find('option:selected');
                                        eq = $(this).parent().find('select.woo-variation-raw-select').find('option').eq(1);
                                    }

                                    options.each(function () {
                                        if ($(this).val() !== '') {
                                            selects.push($(this).val());
                                            selected = current ? current.val() : eq.val();
                                        }
                                    });

                                    _.delay(function () {
                                        li.each(function () {
                                            var value = $(this).attr('data-value');
                                            $(this).removeClass('selected disabled').addClass('disabled');

                                            // if (_.contains(selects, value))

                                            if (_.indexOf(selects, value) !== -1) {

                                                $(this).removeClass('disabled');

                                                $(this).find('input.wvs-radio-variable-item:radio').prop('disabled', false);

                                                if (value === selected) {

                                                    $(this).addClass('selected');

                                                    if ($(this).hasClass('radio-variable-item')) {
                                                        $(this).find('input.wvs-radio-variable-item:radio').prop('checked', true);
                                                    }
                                                }
                                            } else {

                                                if ($(this).hasClass('radio-variable-item')) {
                                                    $(this).find('input.wvs-radio-variable-item:radio').prop('disabled', true).prop('checked', false);
                                                }
                                            }
                                        });

                                        // Items Updated
                                        $(_this5).trigger('wvs-items-updated');
                                    }, 1);
                                });
                            });
                        }
                    }], [{
                        key: '_jQueryInterface',
                        value: function _jQueryInterface(config) {
                            return this.each(function () {
                                new WooVariationSwatches(this, config);
                            });
                        }
                    }]);

                    return WooVariationSwatches;
                }();

                /**
                 * ------------------------------------------------------------------------
                 * jQuery
                 * ------------------------------------------------------------------------
                 */

                $.fn['WooVariationSwatches'] = WooVariationSwatches._jQueryInterface;
                $.fn['WooVariationSwatches'].Constructor = WooVariationSwatches;
                $.fn['WooVariationSwatches'].noConflict = function () {
                    $.fn['WooVariationSwatches'] = $.fn['WooVariationSwatches'];
                    return WooVariationSwatches._jQueryInterface;
                };

                return WooVariationSwatches;
            }(jQuery);

            /* harmony default export */ __webpack_exports__["default"] = (WooVariationSwatches);

            /***/ }),

        /***/ 9:
        /***/ (function(module, exports, __webpack_require__) {

            module.exports = __webpack_require__(10);


            /***/ })

        /******/ });!function(i){"use strict";"function"==typeof define&&define.amd?define(["jquery"],i):"undefined"!=typeof exports?module.exports=i(require("jquery")):i(jQuery)}(function(i){"use strict";var e=window.Slick||{};(e=function(){var e=0;return function(t,o){var s,n=this;n.defaults={accessibility:!0,adaptiveHeight:!1,appendArrows:i(t),appendDots:i(t),arrows:!0,asNavFor:null,prevArrow:'<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',nextArrow:'<button class="slick-next" aria-label="Next" type="button">Next</button>',autoplay:!1,autoplaySpeed:3e3,centerMode:!1,centerPadding:"50px",cssEase:"ease",customPaging:function(e,t){return i('<button type="button" />').text(t+1)},dots:!1,dotsClass:"slick-dots",draggable:!0,easing:"linear",edgeFriction:.35,fade:!1,focusOnSelect:!1,focusOnChange:!1,infinite:!0,initialSlide:0,lazyLoad:"ondemand",mobileFirst:!1,pauseOnHover:!0,pauseOnFocus:!0,pauseOnDotsHover:!1,respondTo:"window",responsive:null,rows:1,rtl:!1,slide:"",slidesPerRow:1,slidesToShow:1,slidesToScroll:1,speed:500,swipe:!0,swipeToSlide:!1,touchMove:!0,touchThreshold:5,useCSS:!0,useTransform:!0,variableWidth:!1,vertical:!1,verticalSwiping:!1,waitForAnimate:!0,zIndex:1e3},n.initials={animating:!1,dragging:!1,autoPlayTimer:null,currentDirection:0,currentLeft:null,currentSlide:0,direction:1,$dots:null,listWidth:null,listHeight:null,loadIndex:0,$nextArrow:null,$prevArrow:null,scrolling:!1,slideCount:null,slideWidth:null,$slideTrack:null,$slides:null,sliding:!1,slideOffset:0,swipeLeft:null,swiping:!1,$list:null,touchObject:{},transformsEnabled:!1,unslicked:!1},i.extend(n,n.initials),n.activeBreakpoint=null,n.animType=null,n.animProp=null,n.breakpoints=[],n.breakpointSettings=[],n.cssTransitions=!1,n.focussed=!1,n.interrupted=!1,n.hidden="hidden",n.paused=!0,n.positionProp=null,n.respondTo=null,n.rowCount=1,n.shouldClick=!0,n.$slider=i(t),n.$slidesCache=null,n.transformType=null,n.transitionType=null,n.visibilityChange="visibilitychange",n.windowWidth=0,n.windowTimer=null,s=i(t).data("slick")||{},n.options=i.extend({},n.defaults,o,s),n.currentSlide=n.options.initialSlide,n.originalSettings=n.options,void 0!==document.mozHidden?(n.hidden="mozHidden",n.visibilityChange="mozvisibilitychange"):void 0!==document.webkitHidden&&(n.hidden="webkitHidden",n.visibilityChange="webkitvisibilitychange"),n.autoPlay=i.proxy(n.autoPlay,n),n.autoPlayClear=i.proxy(n.autoPlayClear,n),n.autoPlayIterator=i.proxy(n.autoPlayIterator,n),n.changeSlide=i.proxy(n.changeSlide,n),n.clickHandler=i.proxy(n.clickHandler,n),n.selectHandler=i.proxy(n.selectHandler,n),n.setPosition=i.proxy(n.setPosition,n),n.swipeHandler=i.proxy(n.swipeHandler,n),n.dragHandler=i.proxy(n.dragHandler,n),n.keyHandler=i.proxy(n.keyHandler,n),n.instanceUid=e++,n.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/,n.registerBreakpoints(),n.init(!0)}}()).prototype.activateADA=function(){this.$slideTrack.find(".slick-active").attr({"aria-hidden":"false"}).find("a, input, button, select").attr({tabindex:"0"})},e.prototype.addSlide=e.prototype.slickAdd=function(e,t,o){var s=this;if("boolean"==typeof t)o=t,t=null;else if(t<0||t>=s.slideCount)return!1;s.unload(),"number"==typeof t?0===t&&0===s.$slides.length?i(e).appendTo(s.$slideTrack):o?i(e).insertBefore(s.$slides.eq(t)):i(e).insertAfter(s.$slides.eq(t)):!0===o?i(e).prependTo(s.$slideTrack):i(e).appendTo(s.$slideTrack),s.$slides=s.$slideTrack.children(this.options.slide),s.$slideTrack.children(this.options.slide).detach(),s.$slideTrack.append(s.$slides),s.$slides.each(function(e,t){i(t).attr("data-slick-index",e)}),s.$slidesCache=s.$slides,s.reinit()},e.prototype.animateHeight=function(){var i=this;if(1===i.options.slidesToShow&&!0===i.options.adaptiveHeight&&!1===i.options.vertical){var e=i.$slides.eq(i.currentSlide).outerHeight(!0);i.$list.animate({height:e},i.options.speed)}},e.prototype.animateSlide=function(e,t){var o={},s=this;s.animateHeight(),!0===s.options.rtl&&!1===s.options.vertical&&(e=-e),!1===s.transformsEnabled?!1===s.options.vertical?s.$slideTrack.animate({left:e},s.options.speed,s.options.easing,t):s.$slideTrack.animate({top:e},s.options.speed,s.options.easing,t):!1===s.cssTransitions?(!0===s.options.rtl&&(s.currentLeft=-s.currentLeft),i({animStart:s.currentLeft}).animate({animStart:e},{duration:s.options.speed,easing:s.options.easing,step:function(i){i=Math.ceil(i),!1===s.options.vertical?(o[s.animType]="translate("+i+"px, 0px)",s.$slideTrack.css(o)):(o[s.animType]="translate(0px,"+i+"px)",s.$slideTrack.css(o))},complete:function(){t&&t.call()}})):(s.applyTransition(),e=Math.ceil(e),!1===s.options.vertical?o[s.animType]="translate3d("+e+"px, 0px, 0px)":o[s.animType]="translate3d(0px,"+e+"px, 0px)",s.$slideTrack.css(o),t&&setTimeout(function(){s.disableTransition(),t.call()},s.options.speed))},e.prototype.getNavTarget=function(){var e=this.options.asNavFor;return e&&null!==e&&(e=i(e).not(this.$slider)),e},e.prototype.asNavFor=function(e){var t=this.getNavTarget();null!==t&&"object"==typeof t&&t.each(function(){var t=i(this).slick("getSlick");t.unslicked||t.slideHandler(e,!0)})},e.prototype.applyTransition=function(i){var e=this,t={};!1===e.options.fade?t[e.transitionType]=e.transformType+" "+e.options.speed+"ms "+e.options.cssEase:t[e.transitionType]="opacity "+e.options.speed+"ms "+e.options.cssEase,!1===e.options.fade?e.$slideTrack.css(t):e.$slides.eq(i).css(t)},e.prototype.autoPlay=function(){var i=this;i.autoPlayClear(),i.slideCount>i.options.slidesToShow&&(i.autoPlayTimer=setInterval(i.autoPlayIterator,i.options.autoplaySpeed))},e.prototype.autoPlayClear=function(){this.autoPlayTimer&&clearInterval(this.autoPlayTimer)},e.prototype.autoPlayIterator=function(){var i=this,e=i.currentSlide+i.options.slidesToScroll;i.paused||i.interrupted||i.focussed||(!1===i.options.infinite&&(1===i.direction&&i.currentSlide+1===i.slideCount-1?i.direction=0:0===i.direction&&(e=i.currentSlide-i.options.slidesToScroll,i.currentSlide-1==0&&(i.direction=1))),i.slideHandler(e))},e.prototype.buildArrows=function(){var e=this;!0===e.options.arrows&&(e.$prevArrow=i(e.options.prevArrow).addClass("slick-arrow"),e.$nextArrow=i(e.options.nextArrow).addClass("slick-arrow"),e.slideCount>e.options.slidesToShow?(e.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),e.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),e.htmlExpr.test(e.options.prevArrow)&&e.$prevArrow.prependTo(e.options.appendArrows),e.htmlExpr.test(e.options.nextArrow)&&e.$nextArrow.appendTo(e.options.appendArrows),!0!==e.options.infinite&&e.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true")):e.$prevArrow.add(e.$nextArrow).addClass("slick-hidden").attr({"aria-disabled":"true",tabindex:"-1"}))},e.prototype.buildDots=function(){var e,t,o=this;if(!0===o.options.dots){for(o.$slider.addClass("slick-dotted"),t=i("<ul />").addClass(o.options.dotsClass),e=0;e<=o.getDotCount();e+=1)t.append(i("<li />").append(o.options.customPaging.call(this,o,e)));o.$dots=t.appendTo(o.options.appendDots),o.$dots.find("li").first().addClass("slick-active")}},e.prototype.buildOut=function(){var e=this;e.$slides=e.$slider.children(e.options.slide+":not(.slick-cloned)").addClass("slick-slide"),e.slideCount=e.$slides.length,e.$slides.each(function(e,t){i(t).attr("data-slick-index",e).data("originalStyling",i(t).attr("style")||"")}),e.$slider.addClass("slick-slider"),e.$slideTrack=0===e.slideCount?i('<div class="slick-track"/>').appendTo(e.$slider):e.$slides.wrapAll('<div class="slick-track"/>').parent(),e.$list=e.$slideTrack.wrap('<div class="slick-list"/>').parent(),e.$slideTrack.css("opacity",0),!0!==e.options.centerMode&&!0!==e.options.swipeToSlide||(e.options.slidesToScroll=1),i("img[data-lazy]",e.$slider).not("[src]").addClass("slick-loading"),e.setupInfinite(),e.buildArrows(),e.buildDots(),e.updateDots(),e.setSlideClasses("number"==typeof e.currentSlide?e.currentSlide:0),!0===e.options.draggable&&e.$list.addClass("draggable")},e.prototype.buildRows=function(){var i,e,t,o,s,n,r,l=this;if(o=document.createDocumentFragment(),n=l.$slider.children(),l.options.rows>1){for(r=l.options.slidesPerRow*l.options.rows,s=Math.ceil(n.length/r),i=0;i<s;i++){var a=document.createElement("div");for(e=0;e<l.options.rows;e++){var d=document.createElement("div");for(t=0;t<l.options.slidesPerRow;t++){var c=i*r+(e*l.options.slidesPerRow+t);n.get(c)&&d.appendChild(n.get(c))}a.appendChild(d)}o.appendChild(a)}l.$slider.empty().append(o),l.$slider.children().children().children().css({width:100/l.options.slidesPerRow+"%",display:"inline-block"})}},e.prototype.checkResponsive=function(e,t){var o,s,n,r=this,l=!1,a=r.$slider.width(),d=window.innerWidth||i(window).width();if("window"===r.respondTo?n=d:"slider"===r.respondTo?n=a:"min"===r.respondTo&&(n=Math.min(d,a)),r.options.responsive&&r.options.responsive.length&&null!==r.options.responsive){for(o in s=null,r.breakpoints)r.breakpoints.hasOwnProperty(o)&&(!1===r.originalSettings.mobileFirst?n<r.breakpoints[o]&&(s=r.breakpoints[o]):n>r.breakpoints[o]&&(s=r.breakpoints[o]));null!==s?null!==r.activeBreakpoint?(s!==r.activeBreakpoint||t)&&(r.activeBreakpoint=s,"unslick"===r.breakpointSettings[s]?r.unslick(s):(r.options=i.extend({},r.originalSettings,r.breakpointSettings[s]),!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e)),l=s):(r.activeBreakpoint=s,"unslick"===r.breakpointSettings[s]?r.unslick(s):(r.options=i.extend({},r.originalSettings,r.breakpointSettings[s]),!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e)),l=s):null!==r.activeBreakpoint&&(r.activeBreakpoint=null,r.options=r.originalSettings,!0===e&&(r.currentSlide=r.options.initialSlide),r.refresh(e),l=s),e||!1===l||r.$slider.trigger("breakpoint",[r,l])}},e.prototype.changeSlide=function(e,t){var o,s,n=this,r=i(e.currentTarget);switch(r.is("a")&&e.preventDefault(),r.is("li")||(r=r.closest("li")),o=n.slideCount%n.options.slidesToScroll!=0?0:(n.slideCount-n.currentSlide)%n.options.slidesToScroll,e.data.message){case"previous":s=0===o?n.options.slidesToScroll:n.options.slidesToShow-o,n.slideCount>n.options.slidesToShow&&n.slideHandler(n.currentSlide-s,!1,t);break;case"next":s=0===o?n.options.slidesToScroll:o,n.slideCount>n.options.slidesToShow&&n.slideHandler(n.currentSlide+s,!1,t);break;case"index":var l=0===e.data.index?0:e.data.index||r.index()*n.options.slidesToScroll;n.slideHandler(n.checkNavigable(l),!1,t),r.children().trigger("focus");break;default:return}},e.prototype.checkNavigable=function(i){var e,t;if(t=0,i>(e=this.getNavigableIndexes())[e.length-1])i=e[e.length-1];else for(var o in e){if(i<e[o]){i=t;break}t=e[o]}return i},e.prototype.cleanUpEvents=function(){var e=this;e.options.dots&&null!==e.$dots&&(i("li",e.$dots).off("click.slick",e.changeSlide).off("mouseenter.slick",i.proxy(e.interrupt,e,!0)).off("mouseleave.slick",i.proxy(e.interrupt,e,!1)),!0===e.options.accessibility&&e.$dots.off("keydown.slick",e.keyHandler)),e.$slider.off("focus.slick blur.slick"),!0===e.options.arrows&&e.slideCount>e.options.slidesToShow&&(e.$prevArrow&&e.$prevArrow.off("click.slick",e.changeSlide),e.$nextArrow&&e.$nextArrow.off("click.slick",e.changeSlide),!0===e.options.accessibility&&(e.$prevArrow&&e.$prevArrow.off("keydown.slick",e.keyHandler),e.$nextArrow&&e.$nextArrow.off("keydown.slick",e.keyHandler))),e.$list.off("touchstart.slick mousedown.slick",e.swipeHandler),e.$list.off("touchmove.slick mousemove.slick",e.swipeHandler),e.$list.off("touchend.slick mouseup.slick",e.swipeHandler),e.$list.off("touchcancel.slick mouseleave.slick",e.swipeHandler),e.$list.off("click.slick",e.clickHandler),i(document).off(e.visibilityChange,e.visibility),e.cleanUpSlideEvents(),!0===e.options.accessibility&&e.$list.off("keydown.slick",e.keyHandler),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().off("click.slick",e.selectHandler),i(window).off("orientationchange.slick.slick-"+e.instanceUid,e.orientationChange),i(window).off("resize.slick.slick-"+e.instanceUid,e.resize),i("[draggable!=true]",e.$slideTrack).off("dragstart",e.preventDefault),i(window).off("load.slick.slick-"+e.instanceUid,e.setPosition)},e.prototype.cleanUpSlideEvents=function(){var e=this;e.$list.off("mouseenter.slick",i.proxy(e.interrupt,e,!0)),e.$list.off("mouseleave.slick",i.proxy(e.interrupt,e,!1))},e.prototype.cleanUpRows=function(){var i,e=this;e.options.rows>1&&((i=e.$slides.children().children()).removeAttr("style"),e.$slider.empty().append(i))},e.prototype.clickHandler=function(i){!1===this.shouldClick&&(i.stopImmediatePropagation(),i.stopPropagation(),i.preventDefault())},e.prototype.destroy=function(e){var t=this;t.autoPlayClear(),t.touchObject={},t.cleanUpEvents(),i(".slick-cloned",t.$slider).detach(),t.$dots&&t.$dots.remove(),t.$prevArrow&&t.$prevArrow.length&&(t.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),t.htmlExpr.test(t.options.prevArrow)&&t.$prevArrow.remove()),t.$nextArrow&&t.$nextArrow.length&&(t.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),t.htmlExpr.test(t.options.nextArrow)&&t.$nextArrow.remove()),t.$slides&&(t.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function(){i(this).attr("style",i(this).data("originalStyling"))}),t.$slideTrack.children(this.options.slide).detach(),t.$slideTrack.detach(),t.$list.detach(),t.$slider.append(t.$slides)),t.cleanUpRows(),t.$slider.removeClass("slick-slider"),t.$slider.removeClass("slick-initialized"),t.$slider.removeClass("slick-dotted"),t.unslicked=!0,e||t.$slider.trigger("destroy",[t])},e.prototype.disableTransition=function(i){var e=this,t={};t[e.transitionType]="",!1===e.options.fade?e.$slideTrack.css(t):e.$slides.eq(i).css(t)},e.prototype.fadeSlide=function(i,e){var t=this;!1===t.cssTransitions?(t.$slides.eq(i).css({zIndex:t.options.zIndex}),t.$slides.eq(i).animate({opacity:1},t.options.speed,t.options.easing,e)):(t.applyTransition(i),t.$slides.eq(i).css({opacity:1,zIndex:t.options.zIndex}),e&&setTimeout(function(){t.disableTransition(i),e.call()},t.options.speed))},e.prototype.fadeSlideOut=function(i){var e=this;!1===e.cssTransitions?e.$slides.eq(i).animate({opacity:0,zIndex:e.options.zIndex-2},e.options.speed,e.options.easing):(e.applyTransition(i),e.$slides.eq(i).css({opacity:0,zIndex:e.options.zIndex-2}))},e.prototype.filterSlides=e.prototype.slickFilter=function(i){var e=this;null!==i&&(e.$slidesCache=e.$slides,e.unload(),e.$slideTrack.children(this.options.slide).detach(),e.$slidesCache.filter(i).appendTo(e.$slideTrack),e.reinit())},e.prototype.focusHandler=function(){var e=this;e.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick","*",function(t){t.stopImmediatePropagation();var o=i(this);setTimeout(function(){e.options.pauseOnFocus&&(e.focussed=o.is(":focus"),e.autoPlay())},0)})},e.prototype.getCurrent=e.prototype.slickCurrentSlide=function(){return this.currentSlide},e.prototype.getDotCount=function(){var i=this,e=0,t=0,o=0;if(!0===i.options.infinite)if(i.slideCount<=i.options.slidesToShow)++o;else for(;e<i.slideCount;)++o,e=t+i.options.slidesToScroll,t+=i.options.slidesToScroll<=i.options.slidesToShow?i.options.slidesToScroll:i.options.slidesToShow;else if(!0===i.options.centerMode)o=i.slideCount;else if(i.options.asNavFor)for(;e<i.slideCount;)++o,e=t+i.options.slidesToScroll,t+=i.options.slidesToScroll<=i.options.slidesToShow?i.options.slidesToScroll:i.options.slidesToShow;else o=1+Math.ceil((i.slideCount-i.options.slidesToShow)/i.options.slidesToScroll);return o-1},e.prototype.getLeft=function(i){var e,t,o,s,n=this,r=0;return n.slideOffset=0,t=n.$slides.first().outerHeight(!0),!0===n.options.infinite?(n.slideCount>n.options.slidesToShow&&(n.slideOffset=n.slideWidth*n.options.slidesToShow*-1,s=-1,!0===n.options.vertical&&!0===n.options.centerMode&&(2===n.options.slidesToShow?s=-1.5:1===n.options.slidesToShow&&(s=-2)),r=t*n.options.slidesToShow*s),n.slideCount%n.options.slidesToScroll!=0&&i+n.options.slidesToScroll>n.slideCount&&n.slideCount>n.options.slidesToShow&&(i>n.slideCount?(n.slideOffset=(n.options.slidesToShow-(i-n.slideCount))*n.slideWidth*-1,r=(n.options.slidesToShow-(i-n.slideCount))*t*-1):(n.slideOffset=n.slideCount%n.options.slidesToScroll*n.slideWidth*-1,r=n.slideCount%n.options.slidesToScroll*t*-1))):i+n.options.slidesToShow>n.slideCount&&(n.slideOffset=(i+n.options.slidesToShow-n.slideCount)*n.slideWidth,r=(i+n.options.slidesToShow-n.slideCount)*t),n.slideCount<=n.options.slidesToShow&&(n.slideOffset=0,r=0),!0===n.options.centerMode&&n.slideCount<=n.options.slidesToShow?n.slideOffset=n.slideWidth*Math.floor(n.options.slidesToShow)/2-n.slideWidth*n.slideCount/2:!0===n.options.centerMode&&!0===n.options.infinite?n.slideOffset+=n.slideWidth*Math.floor(n.options.slidesToShow/2)-n.slideWidth:!0===n.options.centerMode&&(n.slideOffset=0,n.slideOffset+=n.slideWidth*Math.floor(n.options.slidesToShow/2)),e=!1===n.options.vertical?i*n.slideWidth*-1+n.slideOffset:i*t*-1+r,!0===n.options.variableWidth&&(o=n.slideCount<=n.options.slidesToShow||!1===n.options.infinite?n.$slideTrack.children(".slick-slide").eq(i):n.$slideTrack.children(".slick-slide").eq(i+n.options.slidesToShow),e=!0===n.options.rtl?o[0]?-1*(n.$slideTrack.width()-o[0].offsetLeft-o.width()):0:o[0]?-1*o[0].offsetLeft:0,!0===n.options.centerMode&&(o=n.slideCount<=n.options.slidesToShow||!1===n.options.infinite?n.$slideTrack.children(".slick-slide").eq(i):n.$slideTrack.children(".slick-slide").eq(i+n.options.slidesToShow+1),e=!0===n.options.rtl?o[0]?-1*(n.$slideTrack.width()-o[0].offsetLeft-o.width()):0:o[0]?-1*o[0].offsetLeft:0,e+=(n.$list.width()-o.outerWidth())/2)),e},e.prototype.getOption=e.prototype.slickGetOption=function(i){return this.options[i]},e.prototype.getNavigableIndexes=function(){var i,e=this,t=0,o=0,s=[];for(!1===e.options.infinite?i=e.slideCount:(t=-1*e.options.slidesToScroll,o=-1*e.options.slidesToScroll,i=2*e.slideCount);t<i;)s.push(t),t=o+e.options.slidesToScroll,o+=e.options.slidesToScroll<=e.options.slidesToShow?e.options.slidesToScroll:e.options.slidesToShow;return s},e.prototype.getSlick=function(){return this},e.prototype.getSlideCount=function(){var e,t,o=this;return t=!0===o.options.centerMode?o.slideWidth*Math.floor(o.options.slidesToShow/2):0,!0===o.options.swipeToSlide?(o.$slideTrack.find(".slick-slide").each(function(s,n){if(n.offsetLeft-t+i(n).outerWidth()/2>-1*o.swipeLeft)return e=n,!1}),Math.abs(i(e).attr("data-slick-index")-o.currentSlide)||1):o.options.slidesToScroll},e.prototype.goTo=e.prototype.slickGoTo=function(i,e){this.changeSlide({data:{message:"index",index:parseInt(i)}},e)},e.prototype.init=function(e){var t=this;i(t.$slider).hasClass("slick-initialized")||(i(t.$slider).addClass("slick-initialized"),t.buildRows(),t.buildOut(),t.setProps(),t.startLoad(),t.loadSlider(),t.initializeEvents(),t.updateArrows(),t.updateDots(),t.checkResponsive(!0),t.focusHandler()),e&&t.$slider.trigger("init",[t]),!0===t.options.accessibility&&t.initADA(),t.options.autoplay&&(t.paused=!1,t.autoPlay())},e.prototype.initADA=function(){var e=this,t=Math.ceil(e.slideCount/e.options.slidesToShow),o=e.getNavigableIndexes().filter(function(i){return i>=0&&i<e.slideCount});e.$slides.add(e.$slideTrack.find(".slick-cloned")).attr({"aria-hidden":"true",tabindex:"-1"}).find("a, input, button, select").attr({tabindex:"-1"}),null!==e.$dots&&(e.$slides.not(e.$slideTrack.find(".slick-cloned")).each(function(t){var s=o.indexOf(t);i(this).attr({role:"tabpanel",id:"slick-slide"+e.instanceUid+t,tabindex:-1}),-1!==s&&i(this).attr({"aria-describedby":"slick-slide-control"+e.instanceUid+s})}),e.$dots.attr("role","tablist").find("li").each(function(s){var n=o[s];i(this).attr({role:"presentation"}),i(this).find("button").first().attr({role:"tab",id:"slick-slide-control"+e.instanceUid+s,"aria-controls":"slick-slide"+e.instanceUid+n,"aria-label":s+1+" of "+t,"aria-selected":null,tabindex:"-1"})}).eq(e.currentSlide).find("button").attr({"aria-selected":"true",tabindex:"0"}).end());for(var s=e.currentSlide,n=s+e.options.slidesToShow;s<n;s++)e.$slides.eq(s).attr("tabindex",0);e.activateADA()},e.prototype.initArrowEvents=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.off("click.slick").on("click.slick",{message:"previous"},i.changeSlide),i.$nextArrow.off("click.slick").on("click.slick",{message:"next"},i.changeSlide),!0===i.options.accessibility&&(i.$prevArrow.on("keydown.slick",i.keyHandler),i.$nextArrow.on("keydown.slick",i.keyHandler)))},e.prototype.initDotEvents=function(){var e=this;!0===e.options.dots&&(i("li",e.$dots).on("click.slick",{message:"index"},e.changeSlide),!0===e.options.accessibility&&e.$dots.on("keydown.slick",e.keyHandler)),!0===e.options.dots&&!0===e.options.pauseOnDotsHover&&i("li",e.$dots).on("mouseenter.slick",i.proxy(e.interrupt,e,!0)).on("mouseleave.slick",i.proxy(e.interrupt,e,!1))},e.prototype.initSlideEvents=function(){var e=this;e.options.pauseOnHover&&(e.$list.on("mouseenter.slick",i.proxy(e.interrupt,e,!0)),e.$list.on("mouseleave.slick",i.proxy(e.interrupt,e,!1)))},e.prototype.initializeEvents=function(){var e=this;e.initArrowEvents(),e.initDotEvents(),e.initSlideEvents(),e.$list.on("touchstart.slick mousedown.slick",{action:"start"},e.swipeHandler),e.$list.on("touchmove.slick mousemove.slick",{action:"move"},e.swipeHandler),e.$list.on("touchend.slick mouseup.slick",{action:"end"},e.swipeHandler),e.$list.on("touchcancel.slick mouseleave.slick",{action:"end"},e.swipeHandler),e.$list.on("click.slick",e.clickHandler),i(document).on(e.visibilityChange,i.proxy(e.visibility,e)),!0===e.options.accessibility&&e.$list.on("keydown.slick",e.keyHandler),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().on("click.slick",e.selectHandler),i(window).on("orientationchange.slick.slick-"+e.instanceUid,i.proxy(e.orientationChange,e)),i(window).on("resize.slick.slick-"+e.instanceUid,i.proxy(e.resize,e)),i("[draggable!=true]",e.$slideTrack).on("dragstart",e.preventDefault),i(window).on("load.slick.slick-"+e.instanceUid,e.setPosition),i(e.setPosition)},e.prototype.initUI=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.show(),i.$nextArrow.show()),!0===i.options.dots&&i.slideCount>i.options.slidesToShow&&i.$dots.show()},e.prototype.keyHandler=function(i){var e=this;i.target.tagName.match("TEXTAREA|INPUT|SELECT")||(37===i.keyCode&&!0===e.options.accessibility?e.changeSlide({data:{message:!0===e.options.rtl?"next":"previous"}}):39===i.keyCode&&!0===e.options.accessibility&&e.changeSlide({data:{message:!0===e.options.rtl?"previous":"next"}}))},e.prototype.lazyLoad=function(){function e(e){i("img[data-lazy]",e).each(function(){var e=i(this),t=i(this).attr("data-lazy"),o=i(this).attr("data-srcset"),s=i(this).attr("data-sizes")||n.$slider.attr("data-sizes"),r=document.createElement("img");r.onload=function(){e.animate({opacity:0},100,function(){o&&(e.attr("srcset",o),s&&e.attr("sizes",s)),e.attr("src",t).animate({opacity:1},200,function(){e.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading")}),n.$slider.trigger("lazyLoaded",[n,e,t])})},r.onerror=function(){e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),n.$slider.trigger("lazyLoadError",[n,e,t])},r.src=t})}var t,o,s,n=this;if(!0===n.options.centerMode?!0===n.options.infinite?s=(o=n.currentSlide+(n.options.slidesToShow/2+1))+n.options.slidesToShow+2:(o=Math.max(0,n.currentSlide-(n.options.slidesToShow/2+1)),s=n.options.slidesToShow/2+1+2+n.currentSlide):(o=n.options.infinite?n.options.slidesToShow+n.currentSlide:n.currentSlide,s=Math.ceil(o+n.options.slidesToShow),!0===n.options.fade&&(o>0&&o--,s<=n.slideCount&&s++)),t=n.$slider.find(".slick-slide").slice(o,s),"anticipated"===n.options.lazyLoad)for(var r=o-1,l=s,a=n.$slider.find(".slick-slide"),d=0;d<n.options.slidesToScroll;d++)r<0&&(r=n.slideCount-1),t=(t=t.add(a.eq(r))).add(a.eq(l)),r--,l++;e(t),n.slideCount<=n.options.slidesToShow?e(n.$slider.find(".slick-slide")):n.currentSlide>=n.slideCount-n.options.slidesToShow?e(n.$slider.find(".slick-cloned").slice(0,n.options.slidesToShow)):0===n.currentSlide&&e(n.$slider.find(".slick-cloned").slice(-1*n.options.slidesToShow))},e.prototype.loadSlider=function(){var i=this;i.setPosition(),i.$slideTrack.css({opacity:1}),i.$slider.removeClass("slick-loading"),i.initUI(),"progressive"===i.options.lazyLoad&&i.progressiveLazyLoad()},e.prototype.next=e.prototype.slickNext=function(){this.changeSlide({data:{message:"next"}})},e.prototype.orientationChange=function(){this.checkResponsive(),this.setPosition()},e.prototype.pause=e.prototype.slickPause=function(){this.autoPlayClear(),this.paused=!0},e.prototype.play=e.prototype.slickPlay=function(){var i=this;i.autoPlay(),i.options.autoplay=!0,i.paused=!1,i.focussed=!1,i.interrupted=!1},e.prototype.postSlide=function(e){var t=this;t.unslicked||(t.$slider.trigger("afterChange",[t,e]),t.animating=!1,t.slideCount>t.options.slidesToShow&&t.setPosition(),t.swipeLeft=null,t.options.autoplay&&t.autoPlay(),!0===t.options.accessibility&&(t.initADA(),t.options.focusOnChange&&i(t.$slides.get(t.currentSlide)).attr("tabindex",0).focus()))},e.prototype.prev=e.prototype.slickPrev=function(){this.changeSlide({data:{message:"previous"}})},e.prototype.preventDefault=function(i){i.preventDefault()},e.prototype.progressiveLazyLoad=function(e){e=e||1;var t,o,s,n,r,l=this,a=i("img[data-lazy]",l.$slider);a.length?(t=a.first(),o=t.attr("data-lazy"),s=t.attr("data-srcset"),n=t.attr("data-sizes")||l.$slider.attr("data-sizes"),(r=document.createElement("img")).onload=function(){s&&(t.attr("srcset",s),n&&t.attr("sizes",n)),t.attr("src",o).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading"),!0===l.options.adaptiveHeight&&l.setPosition(),l.$slider.trigger("lazyLoaded",[l,t,o]),l.progressiveLazyLoad()},r.onerror=function(){e<3?setTimeout(function(){l.progressiveLazyLoad(e+1)},500):(t.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),l.$slider.trigger("lazyLoadError",[l,t,o]),l.progressiveLazyLoad())},r.src=o):l.$slider.trigger("allImagesLoaded",[l])},e.prototype.refresh=function(e){var t,o,s=this;o=s.slideCount-s.options.slidesToShow,!s.options.infinite&&s.currentSlide>o&&(s.currentSlide=o),s.slideCount<=s.options.slidesToShow&&(s.currentSlide=0),t=s.currentSlide,s.destroy(!0),i.extend(s,s.initials,{currentSlide:t}),s.init(),e||s.changeSlide({data:{message:"index",index:t}},!1)},e.prototype.registerBreakpoints=function(){var e,t,o,s=this,n=s.options.responsive||null;if("array"===i.type(n)&&n.length){for(e in s.respondTo=s.options.respondTo||"window",n)if(o=s.breakpoints.length-1,n.hasOwnProperty(e)){for(t=n[e].breakpoint;o>=0;)s.breakpoints[o]&&s.breakpoints[o]===t&&s.breakpoints.splice(o,1),o--;s.breakpoints.push(t),s.breakpointSettings[t]=n[e].settings}s.breakpoints.sort(function(i,e){return s.options.mobileFirst?i-e:e-i})}},e.prototype.reinit=function(){var e=this;e.$slides=e.$slideTrack.children(e.options.slide).addClass("slick-slide"),e.slideCount=e.$slides.length,e.currentSlide>=e.slideCount&&0!==e.currentSlide&&(e.currentSlide=e.currentSlide-e.options.slidesToScroll),e.slideCount<=e.options.slidesToShow&&(e.currentSlide=0),e.registerBreakpoints(),e.setProps(),e.setupInfinite(),e.buildArrows(),e.updateArrows(),e.initArrowEvents(),e.buildDots(),e.updateDots(),e.initDotEvents(),e.cleanUpSlideEvents(),e.initSlideEvents(),e.checkResponsive(!1,!0),!0===e.options.focusOnSelect&&i(e.$slideTrack).children().on("click.slick",e.selectHandler),e.setSlideClasses("number"==typeof e.currentSlide?e.currentSlide:0),e.setPosition(),e.focusHandler(),e.paused=!e.options.autoplay,e.autoPlay(),e.$slider.trigger("reInit",[e])},e.prototype.resize=function(){var e=this;i(window).width()!==e.windowWidth&&(clearTimeout(e.windowDelay),e.windowDelay=window.setTimeout(function(){e.windowWidth=i(window).width(),e.checkResponsive(),e.unslicked||e.setPosition()},50))},e.prototype.removeSlide=e.prototype.slickRemove=function(i,e,t){var o=this;if(i="boolean"==typeof i?!0===(e=i)?0:o.slideCount-1:!0===e?--i:i,o.slideCount<1||i<0||i>o.slideCount-1)return!1;o.unload(),!0===t?o.$slideTrack.children().remove():o.$slideTrack.children(this.options.slide).eq(i).remove(),o.$slides=o.$slideTrack.children(this.options.slide),o.$slideTrack.children(this.options.slide).detach(),o.$slideTrack.append(o.$slides),o.$slidesCache=o.$slides,o.reinit()},e.prototype.setCSS=function(i){var e,t,o=this,s={};!0===o.options.rtl&&(i=-i),e="left"==o.positionProp?Math.ceil(i)+"px":"0px",t="top"==o.positionProp?Math.ceil(i)+"px":"0px",s[o.positionProp]=i,!1===o.transformsEnabled?o.$slideTrack.css(s):(s={},!1===o.cssTransitions?(s[o.animType]="translate("+e+", "+t+")",o.$slideTrack.css(s)):(s[o.animType]="translate3d("+e+", "+t+", 0px)",o.$slideTrack.css(s)))},e.prototype.setDimensions=function(){var i=this;!1===i.options.vertical?!0===i.options.centerMode&&i.$list.css({padding:"0px "+i.options.centerPadding}):(i.$list.height(i.$slides.first().outerHeight(!0)*i.options.slidesToShow),!0===i.options.centerMode&&i.$list.css({padding:i.options.centerPadding+" 0px"})),i.listWidth=i.$list.width(),i.listHeight=i.$list.height(),!1===i.options.vertical&&!1===i.options.variableWidth?(i.slideWidth=Math.ceil(i.listWidth/i.options.slidesToShow),i.$slideTrack.width(Math.ceil(i.slideWidth*i.$slideTrack.children(".slick-slide").length))):!0===i.options.variableWidth?i.$slideTrack.width(5e3*i.slideCount):(i.slideWidth=Math.ceil(i.listWidth),i.$slideTrack.height(Math.ceil(i.$slides.first().outerHeight(!0)*i.$slideTrack.children(".slick-slide").length)));var e=i.$slides.first().outerWidth(!0)-i.$slides.first().width();!1===i.options.variableWidth&&i.$slideTrack.children(".slick-slide").width(i.slideWidth-e)},e.prototype.setFade=function(){var e,t=this;t.$slides.each(function(o,s){e=t.slideWidth*o*-1,!0===t.options.rtl?i(s).css({position:"relative",right:e,top:0,zIndex:t.options.zIndex-2,opacity:0}):i(s).css({position:"relative",left:e,top:0,zIndex:t.options.zIndex-2,opacity:0})}),t.$slides.eq(t.currentSlide).css({zIndex:t.options.zIndex-1,opacity:1})},e.prototype.setHeight=function(){var i=this;if(1===i.options.slidesToShow&&!0===i.options.adaptiveHeight&&!1===i.options.vertical){var e=i.$slides.eq(i.currentSlide).outerHeight(!0);i.$list.css("height",e)}},e.prototype.setOption=e.prototype.slickSetOption=function(){var e,t,o,s,n,r=this,l=!1;if("object"===i.type(arguments[0])?(o=arguments[0],l=arguments[1],n="multiple"):"string"===i.type(arguments[0])&&(o=arguments[0],s=arguments[1],l=arguments[2],"responsive"===arguments[0]&&"array"===i.type(arguments[1])?n="responsive":void 0!==arguments[1]&&(n="single")),"single"===n)r.options[o]=s;else if("multiple"===n)i.each(o,function(i,e){r.options[i]=e});else if("responsive"===n)for(t in s)if("array"!==i.type(r.options.responsive))r.options.responsive=[s[t]];else{for(e=r.options.responsive.length-1;e>=0;)r.options.responsive[e].breakpoint===s[t].breakpoint&&r.options.responsive.splice(e,1),e--;r.options.responsive.push(s[t])}l&&(r.unload(),r.reinit())},e.prototype.setPosition=function(){var i=this;i.setDimensions(),i.setHeight(),!1===i.options.fade?i.setCSS(i.getLeft(i.currentSlide)):i.setFade(),i.$slider.trigger("setPosition",[i])},e.prototype.setProps=function(){var i=this,e=document.body.style;i.positionProp=!0===i.options.vertical?"top":"left","top"===i.positionProp?i.$slider.addClass("slick-vertical"):i.$slider.removeClass("slick-vertical"),void 0===e.WebkitTransition&&void 0===e.MozTransition&&void 0===e.msTransition||!0===i.options.useCSS&&(i.cssTransitions=!0),i.options.fade&&("number"==typeof i.options.zIndex?i.options.zIndex<3&&(i.options.zIndex=3):i.options.zIndex=i.defaults.zIndex),void 0!==e.OTransform&&(i.animType="OTransform",i.transformType="-o-transform",i.transitionType="OTransition",void 0===e.perspectiveProperty&&void 0===e.webkitPerspective&&(i.animType=!1)),void 0!==e.MozTransform&&(i.animType="MozTransform",i.transformType="-moz-transform",i.transitionType="MozTransition",void 0===e.perspectiveProperty&&void 0===e.MozPerspective&&(i.animType=!1)),void 0!==e.webkitTransform&&(i.animType="webkitTransform",i.transformType="-webkit-transform",i.transitionType="webkitTransition",void 0===e.perspectiveProperty&&void 0===e.webkitPerspective&&(i.animType=!1)),void 0!==e.msTransform&&(i.animType="msTransform",i.transformType="-ms-transform",i.transitionType="msTransition",void 0===e.msTransform&&(i.animType=!1)),void 0!==e.transform&&!1!==i.animType&&(i.animType="transform",i.transformType="transform",i.transitionType="transition"),i.transformsEnabled=i.options.useTransform&&null!==i.animType&&!1!==i.animType},e.prototype.setSlideClasses=function(i){var e,t,o,s,n=this;if(t=n.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden","true"),n.$slides.eq(i).addClass("slick-current"),!0===n.options.centerMode){var r=n.options.slidesToShow%2==0?1:0;e=Math.floor(n.options.slidesToShow/2),!0===n.options.infinite&&(i>=e&&i<=n.slideCount-1-e?n.$slides.slice(i-e+r,i+e+1).addClass("slick-active").attr("aria-hidden","false"):(o=n.options.slidesToShow+i,t.slice(o-e+1+r,o+e+2).addClass("slick-active").attr("aria-hidden","false")),0===i?t.eq(t.length-1-n.options.slidesToShow).addClass("slick-center"):i===n.slideCount-1&&t.eq(n.options.slidesToShow).addClass("slick-center")),n.$slides.eq(i).addClass("slick-center")}else i>=0&&i<=n.slideCount-n.options.slidesToShow?n.$slides.slice(i,i+n.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"):t.length<=n.options.slidesToShow?t.addClass("slick-active").attr("aria-hidden","false"):(s=n.slideCount%n.options.slidesToShow,o=!0===n.options.infinite?n.options.slidesToShow+i:i,n.options.slidesToShow==n.options.slidesToScroll&&n.slideCount-i<n.options.slidesToShow?t.slice(o-(n.options.slidesToShow-s),o+s).addClass("slick-active").attr("aria-hidden","false"):t.slice(o,o+n.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"));"ondemand"!==n.options.lazyLoad&&"anticipated"!==n.options.lazyLoad||n.lazyLoad()},e.prototype.setupInfinite=function(){var e,t,o,s=this;if(!0===s.options.fade&&(s.options.centerMode=!1),!0===s.options.infinite&&!1===s.options.fade&&(t=null,s.slideCount>s.options.slidesToShow)){for(o=!0===s.options.centerMode?s.options.slidesToShow+1:s.options.slidesToShow,e=s.slideCount;e>s.slideCount-o;e-=1)t=e-1,i(s.$slides[t]).clone(!0).attr("id","").attr("data-slick-index",t-s.slideCount).prependTo(s.$slideTrack).addClass("slick-cloned");for(e=0;e<o+s.slideCount;e+=1)t=e,i(s.$slides[t]).clone(!0).attr("id","").attr("data-slick-index",t+s.slideCount).appendTo(s.$slideTrack).addClass("slick-cloned");s.$slideTrack.find(".slick-cloned").find("[id]").each(function(){i(this).attr("id","")})}},e.prototype.interrupt=function(i){i||this.autoPlay(),this.interrupted=i},e.prototype.selectHandler=function(e){var t=this,o=i(e.target).is(".slick-slide")?i(e.target):i(e.target).parents(".slick-slide"),s=parseInt(o.attr("data-slick-index"));s||(s=0),t.slideCount<=t.options.slidesToShow?t.slideHandler(s,!1,!0):t.slideHandler(s)},e.prototype.slideHandler=function(i,e,t){var o,s,n,r,l,a=null,d=this;if(e=e||!1,!(!0===d.animating&&!0===d.options.waitForAnimate||!0===d.options.fade&&d.currentSlide===i))if(!1===e&&d.asNavFor(i),o=i,a=d.getLeft(o),r=d.getLeft(d.currentSlide),d.currentLeft=null===d.swipeLeft?r:d.swipeLeft,!1===d.options.infinite&&!1===d.options.centerMode&&(i<0||i>d.getDotCount()*d.options.slidesToScroll))!1===d.options.fade&&(o=d.currentSlide,!0!==t?d.animateSlide(r,function(){d.postSlide(o)}):d.postSlide(o));else if(!1===d.options.infinite&&!0===d.options.centerMode&&(i<0||i>d.slideCount-d.options.slidesToScroll))!1===d.options.fade&&(o=d.currentSlide,!0!==t?d.animateSlide(r,function(){d.postSlide(o)}):d.postSlide(o));else{if(d.options.autoplay&&clearInterval(d.autoPlayTimer),s=o<0?d.slideCount%d.options.slidesToScroll!=0?d.slideCount-d.slideCount%d.options.slidesToScroll:d.slideCount+o:o>=d.slideCount?d.slideCount%d.options.slidesToScroll!=0?0:o-d.slideCount:o,d.animating=!0,d.$slider.trigger("beforeChange",[d,d.currentSlide,s]),n=d.currentSlide,d.currentSlide=s,d.setSlideClasses(d.currentSlide),d.options.asNavFor&&(l=(l=d.getNavTarget()).slick("getSlick")).slideCount<=l.options.slidesToShow&&l.setSlideClasses(d.currentSlide),d.updateDots(),d.updateArrows(),!0===d.options.fade)return!0!==t?(d.fadeSlideOut(n),d.fadeSlide(s,function(){d.postSlide(s)})):d.postSlide(s),void d.animateHeight();!0!==t?d.animateSlide(a,function(){d.postSlide(s)}):d.postSlide(s)}},e.prototype.startLoad=function(){var i=this;!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&(i.$prevArrow.hide(),i.$nextArrow.hide()),!0===i.options.dots&&i.slideCount>i.options.slidesToShow&&i.$dots.hide(),i.$slider.addClass("slick-loading")},e.prototype.swipeDirection=function(){var i,e,t,o,s=this;return i=s.touchObject.startX-s.touchObject.curX,e=s.touchObject.startY-s.touchObject.curY,t=Math.atan2(e,i),(o=Math.round(180*t/Math.PI))<0&&(o=360-Math.abs(o)),o<=45&&o>=0?!1===s.options.rtl?"left":"right":o<=360&&o>=315?!1===s.options.rtl?"left":"right":o>=135&&o<=225?!1===s.options.rtl?"right":"left":!0===s.options.verticalSwiping?o>=35&&o<=135?"down":"up":"vertical"},e.prototype.swipeEnd=function(i){var e,t,o=this;if(o.dragging=!1,o.swiping=!1,o.scrolling)return o.scrolling=!1,!1;if(o.interrupted=!1,o.shouldClick=!(o.touchObject.swipeLength>10),void 0===o.touchObject.curX)return!1;if(!0===o.touchObject.edgeHit&&o.$slider.trigger("edge",[o,o.swipeDirection()]),o.touchObject.swipeLength>=o.touchObject.minSwipe){switch(t=o.swipeDirection()){case"left":case"down":e=o.options.swipeToSlide?o.checkNavigable(o.currentSlide+o.getSlideCount()):o.currentSlide+o.getSlideCount(),o.currentDirection=0;break;case"right":case"up":e=o.options.swipeToSlide?o.checkNavigable(o.currentSlide-o.getSlideCount()):o.currentSlide-o.getSlideCount(),o.currentDirection=1}"vertical"!=t&&(o.slideHandler(e),o.touchObject={},o.$slider.trigger("swipe",[o,t]))}else o.touchObject.startX!==o.touchObject.curX&&(o.slideHandler(o.currentSlide),o.touchObject={})},e.prototype.swipeHandler=function(i){var e=this;if(!(!1===e.options.swipe||"ontouchend"in document&&!1===e.options.swipe||!1===e.options.draggable&&-1!==i.type.indexOf("mouse")))switch(e.touchObject.fingerCount=i.originalEvent&&void 0!==i.originalEvent.touches?i.originalEvent.touches.length:1,e.touchObject.minSwipe=e.listWidth/e.options.touchThreshold,!0===e.options.verticalSwiping&&(e.touchObject.minSwipe=e.listHeight/e.options.touchThreshold),i.data.action){case"start":e.swipeStart(i);break;case"move":e.swipeMove(i);break;case"end":e.swipeEnd(i)}},e.prototype.swipeMove=function(i){var e,t,o,s,n,r,l=this;return n=void 0!==i.originalEvent?i.originalEvent.touches:null,!(!l.dragging||l.scrolling||n&&1!==n.length)&&(e=l.getLeft(l.currentSlide),l.touchObject.curX=void 0!==n?n[0].pageX:i.clientX,l.touchObject.curY=void 0!==n?n[0].pageY:i.clientY,l.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(l.touchObject.curX-l.touchObject.startX,2))),r=Math.round(Math.sqrt(Math.pow(l.touchObject.curY-l.touchObject.startY,2))),!l.options.verticalSwiping&&!l.swiping&&r>4?(l.scrolling=!0,!1):(!0===l.options.verticalSwiping&&(l.touchObject.swipeLength=r),t=l.swipeDirection(),void 0!==i.originalEvent&&l.touchObject.swipeLength>4&&(l.swiping=!0,i.preventDefault()),s=(!1===l.options.rtl?1:-1)*(l.touchObject.curX>l.touchObject.startX?1:-1),!0===l.options.verticalSwiping&&(s=l.touchObject.curY>l.touchObject.startY?1:-1),o=l.touchObject.swipeLength,l.touchObject.edgeHit=!1,!1===l.options.infinite&&(0===l.currentSlide&&"right"===t||l.currentSlide>=l.getDotCount()&&"left"===t)&&(o=l.touchObject.swipeLength*l.options.edgeFriction,l.touchObject.edgeHit=!0),!1===l.options.vertical?l.swipeLeft=e+o*s:l.swipeLeft=e+o*(l.$list.height()/l.listWidth)*s,!0===l.options.verticalSwiping&&(l.swipeLeft=e+o*s),!0!==l.options.fade&&!1!==l.options.touchMove&&(!0===l.animating?(l.swipeLeft=null,!1):void l.setCSS(l.swipeLeft))))},e.prototype.swipeStart=function(i){var e,t=this;if(t.interrupted=!0,1!==t.touchObject.fingerCount||t.slideCount<=t.options.slidesToShow)return t.touchObject={},!1;void 0!==i.originalEvent&&void 0!==i.originalEvent.touches&&(e=i.originalEvent.touches[0]),t.touchObject.startX=t.touchObject.curX=void 0!==e?e.pageX:i.clientX,t.touchObject.startY=t.touchObject.curY=void 0!==e?e.pageY:i.clientY,t.dragging=!0},e.prototype.unfilterSlides=e.prototype.slickUnfilter=function(){var i=this;null!==i.$slidesCache&&(i.unload(),i.$slideTrack.children(this.options.slide).detach(),i.$slidesCache.appendTo(i.$slideTrack),i.reinit())},e.prototype.unload=function(){var e=this;i(".slick-cloned",e.$slider).remove(),e.$dots&&e.$dots.remove(),e.$prevArrow&&e.htmlExpr.test(e.options.prevArrow)&&e.$prevArrow.remove(),e.$nextArrow&&e.htmlExpr.test(e.options.nextArrow)&&e.$nextArrow.remove(),e.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden","true").css("width","")},e.prototype.unslick=function(i){var e=this;e.$slider.trigger("unslick",[e,i]),e.destroy()},e.prototype.updateArrows=function(){var i=this;Math.floor(i.options.slidesToShow/2),!0===i.options.arrows&&i.slideCount>i.options.slidesToShow&&!i.options.infinite&&(i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false"),i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false"),0===i.currentSlide?(i.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false")):i.currentSlide>=i.slideCount-i.options.slidesToShow&&!1===i.options.centerMode?(i.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")):i.currentSlide>=i.slideCount-1&&!0===i.options.centerMode&&(i.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")))},e.prototype.updateDots=function(){var i=this;null!==i.$dots&&(i.$dots.find("li").removeClass("slick-active").end(),i.$dots.find("li").eq(Math.floor(i.currentSlide/i.options.slidesToScroll)).addClass("slick-active"))},e.prototype.visibility=function(){var i=this;i.options.autoplay&&(document[i.hidden]?i.interrupted=!0:i.interrupted=!1)},i.fn.slick=function(){var i,t,o=this,s=arguments[0],n=Array.prototype.slice.call(arguments,1),r=o.length;for(i=0;i<r;i++)if("object"==typeof s||void 0===s?o[i].slick=new e(o[i],s):t=o[i].slick[s].apply(o[i].slick,n),void 0!==t)return t;return o}}),function(i){i(window).ready(function(){"use strict";i(".style-horizontal .flex-control-thumbs").each(function(){if(0!=i(this).children().length){var e=[],t=i(this).parent(".woocommerce-product-gallery").data("columns");e.slidesToShow=t,e.infinite=!1,e.focusOnSelect=!0,e.settings="unslick",e.prevArrow='<span class="owl-prev"></span>',e.nextArrow='<span class="owl-next"></span>',e.responsive=[{breakpoint:1025,settings:{slidesToShow:3}}],i("body").hasClass("rtl")&&(e.rtl=!0),i(this).slick(e)}}),i(".style-vertical .flex-control-thumbs").each(function(){if(0!=i(this).children().length){var e=[],t=i(this).parent(".woocommerce-product-gallery").data("columns");e.vertical=!0,e.slidesToShow=t,e.infinite=!1,e.infinite=!1,e.focusOnSelect=!0,e.settings="unslick",e.prevArrow='<span class="owl-prev"></span>',e.nextArrow='<span class="owl-next"></span>',e.responsive=[{breakpoint:1200,settings:{vertical:!1,slidesToShow:3}}],i("body").hasClass("rtl")&&(e.rtl=!0),i(this).slick(e)}})})}(jQuery);!function(e){"use strict";e.fn.SumoSelect=function(t){var l=e.extend({placeholder:"Select Here",csvDispCount:3,captionFormat:"{0} Selected",captionFormatAllSelected:"{0} all selected!",floatWidth:400,forceCustomRendering:!1,nativeOnDevice:["Android","BlackBerry","iPhone","iPad","iPod","Opera Mini","IEMobile","Silk"],outputAsCSV:!1,csvSepChar:",",okCancelInMulti:!1,triggerChangeCombined:!0,selectAll:!1,search:!1,searchText:"Search...",noMatch:'No matches for "{0}"',prefix:"",locale:["OK","Cancel","Select All"],up:!1},t),s=this.each(function(){var t=this;!this.sumo&&e(this).is("select")&&(this.sumo={E:e(t),is_multi:e(t).attr("multiple"),select:"",caption:"",placeholder:"",optDiv:"",CaptionCont:"",ul:"",is_floating:!1,is_opened:!1,mob:!1,Pstate:[],createElems:function(){var t=this;t.E.wrap('<div class="SumoSelect" tabindex="0">'),t.select=t.E.parent(),t.caption=e("<span>"),t.CaptionCont=e('<p class="CaptionCont"><label><i></i></label></p>').addClass("SelectBox").attr("style",t.E.attr("style")).prepend(t.caption),t.select.append(t.CaptionCont),t.is_multi||(l.okCancelInMulti=!1),t.E.attr("disabled")&&t.select.addClass("disabled").removeAttr("tabindex"),l.outputAsCSV&&t.is_multi&&t.E.attr("name")&&(t.select.append(e('<input class="HEMANT123" type="hidden" />').attr("name",t.E.attr("name")).val(t.getSelStr())),t.E.removeAttr("name")),!t.isMobile()||l.forceCustomRendering?(t.E.attr("name")&&t.select.addClass("sumo_"+t.E.attr("name")),t.E.addClass("SumoUnder").attr("tabindex","-1"),t.optDiv=e('<div class="optWrapper '+(l.up?"up":"")+'">'),t.floatingList(),t.ul=e('<ul class="options">'),t.optDiv.append(t.ul),l.selectAll&&t.SelAll(),l.search&&t.Search(),t.ul.append(t.prepItems(t.E.children())),t.is_multi&&t.multiSelelect(),t.select.append(t.optDiv),t.basicEvents(),t.selAllState()):t.setNativeMobile()},prepItems:function(t,l){var i=[],s=this;return e(t).each(function(t,n){n=e(n),i.push(n.is("optgroup")?e('<li class="group '+(n[0].disabled?"disabled":"")+'"><label>'+n.attr("label")+"</label><ul></ul><li>").find("ul").append(s.prepItems(n.children(),n[0].disabled)).end():s.createLi(n,l))}),i},createLi:function(t,l){t.attr("value")||t.attr("value",t.val());let i=e('<li class="opt"><label>'+t.text()+"</label></li>");return i.data("opt",t),t.data("li",i),this.is_multi&&i.prepend("<span><i></i></span>"),(t[0].disabled||l)&&(i=i.addClass("disabled")),this.onOptClick(i),t[0].selected&&i.addClass("selected"),t.attr("class")&&i.addClass(t.attr("class")),i},getSelStr:function(){return sopt=[],this.E.find("option:selected").each(function(){sopt.push(e(this).val())}),sopt.join(l.csvSepChar)},multiSelelect:function(){var t=this;t.optDiv.addClass("multiple"),t.okbtn=e('<p class="btnOk">'+l.locale[0]+"</p>").on("click",function(){l.triggerChangeCombined&&(changed=!1,t.E.find("option:selected").length!=t.Pstate.length?changed=!0:t.E.find("option").each(function(e,l){l.selected&&t.Pstate.indexOf(e)<0&&(changed=!0)}),changed&&(t.callChange(),t.setText())),t.hideOpts()}),t.cancelBtn=e('<p class="btnCancel">'+l.locale[1]+"</p>").on("click",function(){t._cnbtn(),t.hideOpts()}),t.optDiv.append(e('<div class="MultiControls">').append(t.okbtn).append(t.cancelBtn))},_cnbtn:function(){var e=this;e.E.find("option:selected").each(function(){this.selected=!1}),e.optDiv.find("li.selected").removeClass("selected");for(var t=0;t<e.Pstate.length;t++)e.E.find("option")[e.Pstate[t]].selected=!0,e.ul.find("li.opt").eq(e.Pstate[t]).addClass("selected");e.selAllState()},SelAll:function(){var t=this;t.is_multi&&(t.selAll=e('<p class="select-all"><span><i></i></span><label>'+l.locale[2]+"</label></p>"),t.selAll.on("click",function(){t.selAll.toggleClass("selected"),t.optDiv.find("li.opt").not(".hidden").each(function(l,i){i=e(i),t.selAll.hasClass("selected")?i.hasClass("selected")||i.trigger("click"):i.hasClass("selected")&&i.trigger("click")})}),t.optDiv.prepend(t.selAll))},Search:function(){var t=this,i=t.CaptionCont.addClass("search"),s=e('<p class="no-match">');t.ftxt=e('<input type="text" class="search-txt" value="" placeholder="'+l.searchText+'">').on("click",function(e){e.stopPropagation()}),i.append(t.ftxt),t.optDiv.children("ul").after(s),t.ftxt.on("keyup.sumo",function(){var i=t.optDiv.find("ul.options li.opt").each(function(l,i){(i=e(i)).text().toLowerCase().indexOf(t.ftxt.val().toLowerCase())>-1?i.removeClass("hidden"):i.addClass("hidden")}).not(".hidden");s.html(l.noMatch.replace(/\{0\}/g,t.ftxt.val())).toggle(!i.length),t.selAllState()})},selAllState:function(){var t=this;if(l.selectAll){var i=0,s=0;t.optDiv.find("li.opt").not(".hidden").each(function(t,l){e(l).hasClass("selected")&&i++,e(l).hasClass("disabled")||s++}),i==s?t.selAll.removeClass("partial").addClass("selected"):0==i?t.selAll.removeClass("selected partial"):t.selAll.addClass("partial")}},showOpts:function(){var t=this;t.E.attr("disabled")||(t.is_opened=!0,t.select.addClass("open"),t.ftxt?t.ftxt.focus():t.select.focus(),e(document).on("click.sumo",function(e){if(!t.select.is(e.target)&&0===t.select.has(e.target).length){if(!t.is_opened)return;t.hideOpts(),l.okCancelInMulti&&t._cnbtn()}}),t.is_floating&&(H=t.optDiv.children("ul").outerHeight()+2,t.is_multi&&(H+=parseInt(t.optDiv.css("padding-bottom"))),t.optDiv.css("height",H),e("body").addClass("sumoStopScroll")),t.setPstate())},setPstate:function(){var e=this;e.is_multi&&(e.is_floating||l.okCancelInMulti)&&(e.Pstate=[],e.E.find("option").each(function(t,l){l.selected&&e.Pstate.push(t)}))},callChange:function(){this.E.trigger("change").trigger("click")},hideOpts:function(){var t=this;t.is_opened&&(t.is_opened=!1,t.select.removeClass("open").find("ul li.sel").removeClass("sel"),e(document).off("click.sumo"),t.select.focus(),e("body").removeClass("sumoStopScroll"),l.search&&(t.ftxt.val(""),t.optDiv.find("ul.options li").removeClass("hidden"),t.optDiv.find(".no-match").toggle(!1)))},setOnOpen:function(){var e=this,t=e.optDiv.find("li.opt:not(.hidden)").eq(l.search?0:e.E[0].selectedIndex);e.optDiv.find("li.sel").removeClass("sel"),t.addClass("sel"),e.showOpts()},nav:function(e){var t,l=this,i=l.ul.find("li.opt:not(.disabled, .hidden)"),s=l.ul.find("li.opt.sel:not(.hidden)"),n=i.index(s);if(l.is_opened&&s.length){if(e&&n>0)t=i.eq(n-1);else{if(!(!e&&n<i.length-1&&n>-1))return;t=i.eq(n+1)}s.removeClass("sel"),s=t.addClass("sel");var o=l.ul,a=o.scrollTop(),c=s.position().top+a;c>=a+o.height()-s.outerHeight()&&o.scrollTop(c-o.height()+s.outerHeight()),c<a&&o.scrollTop(c)}else l.setOnOpen()},basicEvents:function(){var t=this;t.CaptionCont.on("click",function(e){t.E.trigger("click"),t.is_opened?t.hideOpts():t.showOpts(),e.stopPropagation()}),t.select.on("keydown.sumo",function(e){switch(e.which){case 38:t.nav(!0);break;case 40:t.nav(!1);break;case 32:if(l.search&&t.ftxt.is(e.target))return;case 13:t.is_opened?t.optDiv.find("ul li.sel").trigger("click"):t.setOnOpen();break;case 9:case 27:return l.okCancelInMulti&&t._cnbtn(),void t.hideOpts();default:return}e.preventDefault()}),e(window).on("resize.sumo",function(){t.floatingList()})},onOptClick:function(t){var i=this;t.on("click",function(){var t=e(this);if(t.hasClass("disabled"))return;i.is_multi?(t.toggleClass("selected"),t.data("opt")[0].selected=t.hasClass("selected"),i.selAllState()):(t.parent().find("li.selected").removeClass("selected"),t.toggleClass("selected"),t.data("opt")[0].selected=!0),i.is_multi&&l.triggerChangeCombined&&(i.is_floating||l.okCancelInMulti)||(i.setText(),i.callChange()),i.is_multi||i.hideOpts()})},setText:function(){var t=this;if(t.placeholder="",t.is_multi){for(sels=t.E.find(":selected").not(":disabled"),i=0;i<sels.length;i++){if(i+1>=l.csvDispCount&&l.csvDispCount){sels.length==t.E.find("option").length&&l.captionFormatAllSelected?t.placeholder=l.captionFormatAllSelected.replace(/\{0\}/g,sels.length)+",":t.placeholder=l.captionFormat.replace(/\{0\}/g,sels.length)+",";break}t.placeholder+=e(sels[i]).text()+", "}t.placeholder=t.placeholder.replace(/,([^,]*)$/,"$1")}else t.placeholder=t.E.find(":selected").not(":disabled").text();let s=!1;t.placeholder||(s=!0,t.placeholder=t.E.attr("placeholder"),t.placeholder||(t.placeholder=t.E.find("option:disabled:selected").text())),t.placeholder=t.placeholder?l.prefix+" "+t.placeholder:l.placeholder,t.caption.html(t.placeholder),t.CaptionCont.attr("title",t.placeholder);let n=t.select.find("input.HEMANT123");return n.length&&n.val(t.getSelStr()),s?t.caption.addClass("placeholder"):t.caption.removeClass("placeholder"),t.placeholder},isMobile:function(){for(var e=navigator.userAgent||navigator.vendor||window.opera,t=0;t<l.nativeOnDevice.length;t++)if(e.toString().toLowerCase().indexOf(l.nativeOnDevice[t].toLowerCase())>0)return l.nativeOnDevice[t];return!1},setNativeMobile:function(){var e=this;e.E.addClass("SelectClass"),e.mob=!0,e.E.change(function(){e.setText()})},floatingList:function(){var t=this;t.is_floating=e(window).width()<=l.floatWidth,t.optDiv.toggleClass("isFloating",t.is_floating),t.is_floating||t.optDiv.css("height",""),t.optDiv.toggleClass("okCancelInMulti",l.okCancelInMulti&&!t.is_floating)},vRange:function(e){if(opts=this.E.find("option"),opts.length<=e||e<0)throw"index out of bounds";return this},toggSel:function(t,l){var i=this;"number"==typeof l?(i.vRange(l),opt=i.E.find("option")[l]):opt=i.E.find('option[value="'+l+'"]')[0]||0,opt&&!opt.disabled&&opt.selected!=t&&(opt.selected=t,i.mob||e(opt).data("li").toggleClass("selected",t),i.callChange(),i.setPstate(),i.setText(),i.selAllState())},toggDis:function(e,t){var l=this.vRange(t);l.E.find("option")[t].disabled=e,e&&(l.E.find("option")[t].selected=!1),l.mob||l.optDiv.find("ul.options li").eq(t).toggleClass("disabled",e).removeClass("selected"),l.setText()},toggSumo:function(e){var t=this;return t.enabled=e,t.select.toggleClass("disabled",e),e?(t.E.attr("disabled","disabled"),t.select.removeAttr("tabindex")):(t.E.removeAttr("disabled"),t.select.attr("tabindex","0")),t},toggSelAll:function(t){var l=this;l.E.find("option").each(function(i,s){l.E.find("option")[e(this).index()].disabled||(l.E.find("option")[e(this).index()].selected=t,l.mob||l.optDiv.find("ul.options li").eq(e(this).index()).toggleClass("selected",t),l.setText())}),!l.mob&&l.selAll&&l.selAll.removeClass("partial").toggleClass("selected",t),l.callChange(),l.setPstate()},reload:function(){var t=this.unload();return e(t).SumoSelect(l)},unload:function(){var e=this;return e.select.before(e.E),e.E.show(),l.outputAsCSV&&e.is_multi&&e.select.find("input.HEMANT123").length&&e.E.attr("name",e.select.find("input.HEMANT123").attr("name")),e.select.remove(),delete t.sumo,t},add:function(l,i,s){if(void 0===l)throw"No value to add";var n=this;if(opts=n.E.find("option"),"number"==typeof i&&(s=i,i=l),void 0===i&&(i=l),opt=e("<option></option>").val(l).html(i),opts.length<s)throw"index out of bounds";return void 0===s||opts.length==s?(n.E.append(opt),n.mob||n.ul.append(n.createLi(opt))):(opts.eq(s).before(opt),n.mob||n.ul.find("li.opt").eq(s).before(n.createLi(opt))),t},remove:function(e){var t=this.vRange(e);t.E.find("option").eq(e).remove(),t.mob||t.optDiv.find("ul.options li").eq(e).remove(),t.setText()},selectItem:function(e){this.toggSel(!0,e)},unSelectItem:function(e){this.toggSel(!1,e)},selectAll:function(){this.toggSelAll(!0)},unSelectAll:function(){this.toggSelAll(!1)},disableItem:function(e){this.toggDis(!0,e)},enableItem:function(e){this.toggDis(!1,e)},enabled:!0,enable:function(){return this.toggSumo(!1)},disable:function(){return this.toggSumo(!0)},init:function(){var e=this;return e.createElems(),e.setText(),e}},t.sumo.init())});return 1==s.length?s[0]:s},jQuery(document).ready(function(){e(".dropdown_product_cat").SumoSelect({csvDispCount:3,captionFormatAllSelected:"Yeah, OK, so everything."}),e(".woocommerce-currency-switcher,.woocommerce-fillter >.select, .woocommerce-ordering > .orderby").SumoSelect({csvDispCount:3,captionFormatAllSelected:"Yeah, OK, so everything."})})}(jQuery);!function(e,t,i,n){"use strict";var o=i("html"),a=i(e),r=i(t),s=i.fancybox=function(){s.open.apply(this,arguments)},l=navigator.userAgent.match(/msie/i),c=null,d=void 0!==t.createTouch,p=function(e){return e&&e.hasOwnProperty&&e instanceof i},h=function(e){return e&&"string"===i.type(e)},f=function(e){return h(e)&&e.indexOf("%")>0},u=function(e,t){var i=parseInt(e,10)||0;return t&&f(e)&&(i=s.getViewport()[t]/100*i),Math.ceil(i)},g=function(e,t){return u(e,t)+"px"};i.extend(s,{version:"2.1.5",defaults:{padding:15,margin:20,width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,maxHeight:9999,pixelRatio:1,autoSize:!0,autoHeight:!1,autoWidth:!1,autoResize:!0,autoCenter:!d,fitToView:!0,aspectRatio:!1,topRatio:.5,leftRatio:.5,scrolling:"auto",wrapCSS:"",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,autoPlay:!1,playSpeed:3e3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},iframe:{scrolling:"auto",preload:!0},swf:{wmode:"transparent",allowfullscreen:"true",allowscriptaccess:"always"},keys:{next:{13:"left",34:"up",39:"left",40:"up"},prev:{8:"right",33:"down",37:"right",38:"down"},close:[27],play:[32],toggle:[70]},direction:{next:"left",prev:"right"},scrollOutside:!0,index:0,type:null,href:null,content:null,title:null,tpl:{wrap:'<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen'+(l?' allowtransparency="true"':"")+"></iframe>",error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',next:'<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:250,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:250,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:!0,title:!0},onCancel:i.noop,beforeLoad:i.noop,afterLoad:i.noop,beforeShow:i.noop,afterShow:i.noop,beforeChange:i.noop,beforeClose:i.noop,afterClose:i.noop},group:{},opts:{},previous:null,coming:null,current:null,isActive:!1,isOpen:!1,isOpened:!1,wrap:null,skin:null,outer:null,inner:null,player:{timer:null,isActive:!1},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(e,t){if(e&&(i.isPlainObject(t)||(t={}),!1!==s.close(!0)))return i.isArray(e)||(e=p(e)?i(e).get():[e]),i.each(e,function(n,o){var a,r,l,c,d,f,u,g={};"object"===i.type(o)&&(o.nodeType&&(o=i(o)),p(o)?(g={href:o.data("fancybox-href")||o.attr("href"),title:o.data("fancybox-title")||o.attr("title"),isDom:!0,element:o},i.metadata&&i.extend(!0,g,o.metadata())):g=o),a=t.href||g.href||(h(o)?o:null),r=void 0!==t.title?t.title:g.title||"",!(c=(l=t.content||g.content)?"html":t.type||g.type)&&g.isDom&&((c=o.data("fancybox-type"))||(c=(d=o.prop("class").match(/fancybox\.(\w+)/))?d[1]:null)),h(a)&&(c||(s.isImage(a)?c="image":s.isSWF(a)?c="swf":"#"===a.charAt(0)?c="inline":h(o)&&(c="html",l=o)),"ajax"===c&&(a=(f=a.split(/\s+/,2)).shift(),u=f.shift())),l||("inline"===c?a?l=i(h(a)?a.replace(/.*(?=#[^\s]+$)/,""):a):g.isDom&&(l=o):"html"===c?l=a:c||a||!g.isDom||(c="inline",l=o)),i.extend(g,{href:a,type:c,content:l,title:r,selector:u}),e[n]=g}),s.opts=i.extend(!0,{},s.defaults,t),void 0!==t.keys&&(s.opts.keys=!!t.keys&&i.extend({},s.defaults.keys,t.keys)),s.group=e,s._start(s.opts.index)},cancel:function(){var e=s.coming;e&&!1!==s.trigger("onCancel")&&(s.hideLoading(),s.ajaxLoad&&s.ajaxLoad.abort(),s.ajaxLoad=null,s.imgPreload&&(s.imgPreload.onload=s.imgPreload.onerror=null),e.wrap&&e.wrap.stop(!0,!0).trigger("onReset").remove(),s.coming=null,s.current||s._afterZoomOut(e))},close:function(e){s.cancel(),!1!==s.trigger("beforeClose")&&(s.unbindEvents(),s.isActive&&(s.isOpen&&!0!==e?(s.isOpen=s.isOpened=!1,s.isClosing=!0,i(".fancybox-item, .fancybox-nav").remove(),s.wrap.stop(!0,!0).removeClass("fancybox-opened"),s.transitions[s.current.closeMethod]()):(i(".fancybox-wrap").stop(!0).trigger("onReset").remove(),s._afterZoomOut())))},play:function(e){var t=function(){clearTimeout(s.player.timer)},i=function(){t(),s.current&&s.player.isActive&&(s.player.timer=setTimeout(s.next,s.current.playSpeed))},n=function(){t(),r.unbind(".player"),s.player.isActive=!1,s.trigger("onPlayEnd")};!0===e||!s.player.isActive&&!1!==e?s.current&&(s.current.loop||s.current.index<s.group.length-1)&&(s.player.isActive=!0,r.bind({"onCancel.player beforeClose.player":n,"onUpdate.player":i,"beforeLoad.player":t}),i(),s.trigger("onPlayStart")):n()},next:function(e){var t=s.current;t&&(h(e)||(e=t.direction.next),s.jumpto(t.index+1,e,"next"))},prev:function(e){var t=s.current;t&&(h(e)||(e=t.direction.prev),s.jumpto(t.index-1,e,"prev"))},jumpto:function(e,t,i){var n=s.current;n&&(e=u(e),s.direction=t||n.direction[e>=n.index?"next":"prev"],s.router=i||"jumpto",n.loop&&(e<0&&(e=n.group.length+e%n.group.length),e%=n.group.length),void 0!==n.group[e]&&(s.cancel(),s._start(e)))},reposition:function(e,t){var n,o=s.current,a=o?o.wrap:null;a&&(n=s._getPosition(t),e&&"scroll"===e.type?(delete n.position,a.stop(!0,!0).animate(n,200)):(a.css(n),o.pos=i.extend({},o.dim,n)))},update:function(e){var t=e&&e.type,i=!t||"orientationchange"===t;i&&(clearTimeout(c),c=null),s.isOpen&&!c&&(c=setTimeout(function(){var n=s.current;n&&!s.isClosing&&(s.wrap.removeClass("fancybox-tmp"),(i||"load"===t||"resize"===t&&n.autoResize)&&s._setDimension(),"scroll"===t&&n.canShrink||s.reposition(e),s.trigger("onUpdate"),c=null)},i&&!d?0:300))},toggle:function(e){s.isOpen&&(s.current.fitToView="boolean"===i.type(e)?e:!s.current.fitToView,d&&(s.wrap.removeAttr("style").addClass("fancybox-tmp"),s.trigger("onUpdate")),s.update())},hideLoading:function(){r.unbind(".loading"),i("#fancybox-loading").remove()},showLoading:function(){var e,t;s.hideLoading(),e=i('<div id="fancybox-loading"><div></div></div>').click(s.cancel).appendTo("body"),r.bind("keydown.loading",function(e){27===(e.which||e.keyCode)&&(e.preventDefault(),s.cancel())}),s.defaults.fixed||(t=s.getViewport(),e.css({position:"absolute",top:.5*t.h+t.y,left:.5*t.w+t.x}))},getViewport:function(){var t=s.current&&s.current.locked||!1,i={x:a.scrollLeft(),y:a.scrollTop()};return t?(i.w=t[0].clientWidth,i.h=t[0].clientHeight):(i.w=d&&e.innerWidth?e.innerWidth:a.width(),i.h=d&&e.innerHeight?e.innerHeight:a.height()),i},unbindEvents:function(){s.wrap&&p(s.wrap)&&s.wrap.unbind(".fb"),r.unbind(".fb"),a.unbind(".fb")},bindEvents:function(){var e,t=s.current;t&&(a.bind("orientationchange.fb"+(d?"":" resize.fb")+(t.autoCenter&&!t.locked?" scroll.fb":""),s.update),(e=t.keys)&&r.bind("keydown.fb",function(n){var o=n.which||n.keyCode,a=n.target||n.srcElement;if(27===o&&s.coming)return!1;n.ctrlKey||n.altKey||n.shiftKey||n.metaKey||a&&(a.type||i(a).is("[contenteditable]"))||i.each(e,function(e,a){return t.group.length>1&&void 0!==a[o]?(s[e](a[o]),n.preventDefault(),!1):i.inArray(o,a)>-1?(s[e](),n.preventDefault(),!1):void 0})}),i.fn.mousewheel&&t.mouseWheel&&s.wrap.bind("mousewheel.fb",function(e,n,o,a){for(var r,l=e.target||null,c=i(l),d=!1;c.length&&!(d||c.is(".fancybox-skin")||c.is(".fancybox-wrap"));)d=(r=c[0])&&!(r.style.overflow&&"hidden"===r.style.overflow)&&(r.clientWidth&&r.scrollWidth>r.clientWidth||r.clientHeight&&r.scrollHeight>r.clientHeight),c=i(c).parent();0===n||d||s.group.length>1&&!t.canShrink&&(a>0||o>0?s.prev(a>0?"down":"left"):(a<0||o<0)&&s.next(a<0?"up":"right"),e.preventDefault())}))},trigger:function(e,t){var n,o=t||s.coming||s.current;if(o){if(i.isFunction(o[e])&&(n=o[e].apply(o,Array.prototype.slice.call(arguments,1))),!1===n)return!1;o.helpers&&i.each(o.helpers,function(t,n){n&&s.helpers[t]&&i.isFunction(s.helpers[t][e])&&s.helpers[t][e](i.extend(!0,{},s.helpers[t].defaults,n),o)}),r.trigger(e)}},isImage:function(e){return h(e)&&e.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)},isSWF:function(e){return h(e)&&e.match(/\.(swf)((\?|#).*)?$/i)},_start:function(e){var t,n,o,a,r,l={};if(e=u(e),!(t=s.group[e]||null))return!1;if(a=(l=i.extend(!0,{},s.opts,t)).margin,r=l.padding,"number"===i.type(a)&&(l.margin=[a,a,a,a]),"number"===i.type(r)&&(l.padding=[r,r,r,r]),l.modal&&i.extend(!0,l,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,mouseWheel:!1,keys:null,helpers:{overlay:{closeClick:!1}}}),l.autoSize&&(l.autoWidth=l.autoHeight=!0),"auto"===l.width&&(l.autoWidth=!0),"auto"===l.height&&(l.autoHeight=!0),l.group=s.group,l.index=e,s.coming=l,!1!==s.trigger("beforeLoad")){if(o=l.type,n=l.href,!o)return s.coming=null,!(!s.current||!s.router||"jumpto"===s.router)&&(s.current.index=e,s[s.router](s.direction));if(s.isActive=!0,"image"!==o&&"swf"!==o||(l.autoHeight=l.autoWidth=!1,l.scrolling="visible"),"image"===o&&(l.aspectRatio=!0),"iframe"===o&&d&&(l.scrolling="scroll"),l.wrap=i(l.tpl.wrap).addClass("fancybox-"+(d?"mobile":"desktop")+" fancybox-type-"+o+" fancybox-tmp "+l.wrapCSS).appendTo(l.parent||"body"),i.extend(l,{skin:i(".fancybox-skin",l.wrap),outer:i(".fancybox-outer",l.wrap),inner:i(".fancybox-inner",l.wrap)}),i.each(["Top","Right","Bottom","Left"],function(e,t){l.skin.css("padding"+t,g(l.padding[e]))}),s.trigger("onReady"),"inline"===o||"html"===o){if(!l.content||!l.content.length)return s._error("content")}else if(!n)return s._error("href");"image"===o?s._loadImage():"ajax"===o?s._loadAjax():"iframe"===o?s._loadIframe():s._afterLoad()}else s.coming=null},_error:function(e){i.extend(s.coming,{type:"html",autoWidth:!0,autoHeight:!0,minWidth:0,minHeight:0,scrolling:"no",hasError:e,content:s.coming.tpl.error}),s._afterLoad()},_loadImage:function(){var e=s.imgPreload=new Image;e.onload=function(){this.onload=this.onerror=null,s.coming.width=this.width/s.opts.pixelRatio,s.coming.height=this.height/s.opts.pixelRatio,s._afterLoad()},e.onerror=function(){this.onload=this.onerror=null,s._error("image")},e.src=s.coming.href,!0!==e.complete&&s.showLoading()},_loadAjax:function(){var e=s.coming;s.showLoading(),s.ajaxLoad=i.ajax(i.extend({},e.ajax,{url:e.href,error:function(e,t){s.coming&&"abort"!==t?s._error("ajax",e):s.hideLoading()},success:function(t,i){"success"===i&&(e.content=t,s._afterLoad())}}))},_loadIframe:function(){var e=s.coming,t=i(e.tpl.iframe.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",d?"auto":e.iframe.scrolling).attr("src",e.href);i(e.wrap).bind("onReset",function(){try{i(this).find("iframe").hide().attr("src","//about:blank").end().empty()}catch(e){}}),e.iframe.preload&&(s.showLoading(),t.one("load",function(){i(this).data("ready",1),d||i(this).bind("load.fb",s.update),i(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show(),s._afterLoad()})),e.content=t.appendTo(e.inner),e.iframe.preload||s._afterLoad()},_preloadImages:function(){var e,t,i=s.group,n=s.current,o=i.length,a=n.preload?Math.min(n.preload,o-1):0;for(t=1;t<=a;t+=1)"image"===(e=i[(n.index+t)%o]).type&&e.href&&((new Image).src=e.href)},_afterLoad:function(){var e,t,n,o,a,r,l=s.coming,c=s.current,d="fancybox-placeholder";if(s.hideLoading(),l&&!1!==s.isActive){if(!1===s.trigger("afterLoad",l,c))return l.wrap.stop(!0).trigger("onReset").remove(),void(s.coming=null);switch(c&&(s.trigger("beforeChange",c),c.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove()),s.unbindEvents(),e=l,t=l.content,n=l.type,o=l.scrolling,i.extend(s,{wrap:e.wrap,skin:e.skin,outer:e.outer,inner:e.inner,current:e,previous:c}),a=e.href,n){case"inline":case"ajax":case"html":e.selector?t=i("<div>").html(t).find(e.selector):p(t)&&(t.data(d)||t.data(d,i('<div class="'+d+'"></div>').insertAfter(t).hide()),t=t.show().detach(),e.wrap.bind("onReset",function(){i(this).find(t).length&&t.hide().replaceAll(t.data(d)).data(d,!1)}));break;case"image":t=e.tpl.image.replace("{href}",a);break;case"swf":t='<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="'+a+'"></param>',r="",i.each(e.swf,function(e,i){t+='<param name="'+e+'" value="'+i+'"></param>',r+=" "+e+'="'+i+'"'}),t+='<embed src="'+a+'" type="application/x-shockwave-flash" width="100%" height="100%"'+r+"></embed></object>"}p(t)&&t.parent().is(e.inner)||e.inner.append(t),s.trigger("beforeShow"),e.inner.css("overflow","yes"===o?"scroll":"no"===o?"hidden":o),s._setDimension(),s.reposition(),s.isOpen=!1,s.coming=null,s.bindEvents(),s.isOpened?c.prevMethod&&s.transitions[c.prevMethod]():i(".fancybox-wrap").not(e.wrap).stop(!0).trigger("onReset").remove(),s.transitions[s.isOpened?e.nextMethod:e.openMethod](),s._preloadImages()}},_setDimension:function(){var e,t,n,o,a,r,l,c,d,p,h,m,y,x,v,w,b,k=s.getViewport(),C=0,O=s.wrap,W=s.skin,_=s.inner,S=s.current,T=S.width,L=S.height,E=S.minWidth,R=S.minHeight,j=S.maxWidth,P=S.maxHeight,H=S.scrolling,M=S.scrollOutside?S.scrollbarWidth:0,A=S.margin,I=u(A[1]+A[3]),D=u(A[0]+A[2]);if(O.add(W).add(_).width("auto").height("auto").removeClass("fancybox-tmp"),a=I+(n=u(W.outerWidth(!0)-W.width())),r=D+(o=u(W.outerHeight(!0)-W.height())),l=f(T)?(k.w-a)*u(T)/100:T,c=f(L)?(k.h-r)*u(L)/100:L,"iframe"===S.type){if(w=S.content,S.autoHeight&&1===w.data("ready"))try{w[0].contentWindow.document.location&&(_.width(l).height(9999),b=w.contents().find("body"),M&&b.css("overflow-x","hidden"),c=b.outerHeight(!0))}catch(e){}}else(S.autoWidth||S.autoHeight)&&(_.addClass("fancybox-tmp"),S.autoWidth||_.width(l),S.autoHeight||_.height(c),S.autoWidth&&(l=_.width()),S.autoHeight&&(c=_.height()),_.removeClass("fancybox-tmp"));if(T=u(l),L=u(c),h=l/c,E=u(f(E)?u(E,"w")-a:E),j=u(f(j)?u(j,"w")-a:j),R=u(f(R)?u(R,"h")-r:R),d=j,p=P=u(f(P)?u(P,"h")-r:P),S.fitToView&&(j=Math.min(k.w-a,j),P=Math.min(k.h-r,P)),x=k.w-I,v=k.h-D,S.aspectRatio?(T>j&&(L=u((T=j)/h)),L>P&&(T=u((L=P)*h)),T<E&&(L=u((T=E)/h)),L<R&&(T=u((L=R)*h))):(T=Math.max(E,Math.min(T,j)),S.autoHeight&&"iframe"!==S.type&&(_.width(T),L=_.height()),L=Math.max(R,Math.min(L,P))),S.fitToView)if(_.width(T).height(L),O.width(T+n),m=O.width(),y=O.height(),S.aspectRatio)for(;(m>x||y>v)&&T>E&&L>R&&!(C++>19);)L=Math.max(R,Math.min(P,L-10)),(T=u(L*h))<E&&(L=u((T=E)/h)),T>j&&(L=u((T=j)/h)),_.width(T).height(L),O.width(T+n),m=O.width(),y=O.height();else T=Math.max(E,Math.min(T,T-(m-x))),L=Math.max(R,Math.min(L,L-(y-v)));M&&"auto"===H&&L<c&&T+n+M<x&&(T+=M),_.width(T).height(L),O.width(T+n),m=O.width(),y=O.height(),e=(m>x||y>v)&&T>E&&L>R,t=S.aspectRatio?T<d&&L<p&&T<l&&L<c:(T<d||L<p)&&(T<l||L<c),i.extend(S,{dim:{width:g(m),height:g(y)},origWidth:l,origHeight:c,canShrink:e,canExpand:t,wPadding:n,hPadding:o,wrapSpace:y-W.outerHeight(!0),skinSpace:W.height()-L}),!w&&S.autoHeight&&L>R&&L<P&&!t&&_.height("auto")},_getPosition:function(e){var t=s.current,i=s.getViewport(),n=t.margin,o=s.wrap.width()+n[1]+n[3],a=s.wrap.height()+n[0]+n[2],r={position:"absolute",top:n[0],left:n[3]};return t.autoCenter&&t.fixed&&!e&&a<=i.h&&o<=i.w?r.position="fixed":t.locked||(r.top+=i.y,r.left+=i.x),r.top=g(Math.max(r.top,r.top+(i.h-a)*t.topRatio)),r.left=g(Math.max(r.left,r.left+(i.w-o)*t.leftRatio)),r},_afterZoomIn:function(){var e=s.current;e&&(s.isOpen=s.isOpened=!0,s.wrap.css("overflow","visible").addClass("fancybox-opened"),s.update(),(e.closeClick||e.nextClick&&s.group.length>1)&&s.inner.css("cursor","pointer").bind("click.fb",function(t){i(t.target).is("a")||i(t.target).parent().is("a")||(t.preventDefault(),s[e.closeClick?"close":"next"]())}),e.closeBtn&&i(e.tpl.closeBtn).appendTo(s.skin).bind("click.fb",function(e){e.preventDefault(),s.close()}),e.arrows&&s.group.length>1&&((e.loop||e.index>0)&&i(e.tpl.prev).appendTo(s.outer).bind("click.fb",s.prev),(e.loop||e.index<s.group.length-1)&&i(e.tpl.next).appendTo(s.outer).bind("click.fb",s.next)),s.trigger("afterShow"),e.loop||e.index!==e.group.length-1?s.opts.autoPlay&&!s.player.isActive&&(s.opts.autoPlay=!1,s.play()):s.play(!1))},_afterZoomOut:function(e){e=e||s.current,i(".fancybox-wrap").trigger("onReset").remove(),i.extend(s,{group:{},opts:{},router:!1,current:null,isActive:!1,isOpened:!1,isOpen:!1,isClosing:!1,wrap:null,skin:null,outer:null,inner:null}),s.trigger("afterClose",e)}}),s.transitions={getOrigPosition:function(){var e=s.current,t=e.element,i=e.orig,n={},o=50,a=50,r=e.hPadding,l=e.wPadding,c=s.getViewport();return!i&&e.isDom&&t.is(":visible")&&((i=t.find("img:first")).length||(i=t)),p(i)?(n=i.offset(),i.is("img")&&(o=i.outerWidth(),a=i.outerHeight())):(n.top=c.y+(c.h-a)*e.topRatio,n.left=c.x+(c.w-o)*e.leftRatio),("fixed"===s.wrap.css("position")||e.locked)&&(n.top-=c.y,n.left-=c.x),n={top:g(n.top-r*e.topRatio),left:g(n.left-l*e.leftRatio),width:g(o+l),height:g(a+r)}},step:function(e,t){var i,n,o=t.prop,a=s.current,r=a.wrapSpace,l=a.skinSpace;"width"!==o&&"height"!==o||(i=t.end===t.start?1:(e-t.start)/(t.end-t.start),s.isClosing&&(i=1-i),n=e-("width"===o?a.wPadding:a.hPadding),s.skin[o](u("width"===o?n:n-r*i)),s.inner[o](u("width"===o?n:n-r*i-l*i)))},zoomIn:function(){var e=s.current,t=e.pos,n=e.openEffect,o="elastic"===n,a=i.extend({opacity:1},t);delete a.position,o?(t=this.getOrigPosition(),e.openOpacity&&(t.opacity=.1)):"fade"===n&&(t.opacity=.1),s.wrap.css(t).animate(a,{duration:"none"===n?0:e.openSpeed,easing:e.openEasing,step:o?this.step:null,complete:s._afterZoomIn})},zoomOut:function(){var e=s.current,t=e.closeEffect,i="elastic"===t,n={opacity:.1};i&&(n=this.getOrigPosition(),e.closeOpacity&&(n.opacity=.1)),s.wrap.animate(n,{duration:"none"===t?0:e.closeSpeed,easing:e.closeEasing,step:i?this.step:null,complete:s._afterZoomOut})},changeIn:function(){var e,t=s.current,i=t.nextEffect,n=t.pos,o={opacity:1},a=s.direction;n.opacity=.1,"elastic"===i&&(e="down"===a||"up"===a?"top":"left","down"===a||"right"===a?(n[e]=g(u(n[e])-200),o[e]="+=200px"):(n[e]=g(u(n[e])+200),o[e]="-=200px")),"none"===i?s._afterZoomIn():s.wrap.css(n).animate(o,{duration:t.nextSpeed,easing:t.nextEasing,complete:s._afterZoomIn})},changeOut:function(){var e=s.previous,t=e.prevEffect,n={opacity:.1},o=s.direction;"elastic"===t&&(n["down"===o||"up"===o?"top":"left"]=("up"===o||"left"===o?"-":"+")+"=200px"),e.wrap.animate(n,{duration:"none"===t?0:e.prevSpeed,easing:e.prevEasing,complete:function(){i(this).trigger("onReset").remove()}})}},s.helpers.overlay={defaults:{closeClick:!0,speedOut:200,showEarly:!0,css:{},locked:!d,fixed:!0},overlay:null,fixed:!1,el:i("html"),create:function(e){e=i.extend({},this.defaults,e),this.overlay&&this.close(),this.overlay=i('<div class="fancybox-overlay"></div>').appendTo(s.coming?s.coming.parent:e.parent),this.fixed=!1,e.fixed&&s.defaults.fixed&&(this.overlay.addClass("fancybox-overlay-fixed"),this.fixed=!0)},open:function(e){var t=this;e=i.extend({},this.defaults,e),this.overlay?this.overlay.unbind(".overlay").width("auto").height("auto"):this.create(e),this.fixed||(a.bind("resize.overlay",i.proxy(this.update,this)),this.update()),e.closeClick&&this.overlay.bind("click.overlay",function(e){if(i(e.target).hasClass("fancybox-overlay"))return s.isActive?s.close():t.close(),!1}),this.overlay.css(e.css).show()},close:function(){var e,t;a.unbind("resize.overlay"),this.el.hasClass("fancybox-lock")&&(i(".fancybox-margin").removeClass("fancybox-margin"),e=a.scrollTop(),t=a.scrollLeft(),this.el.removeClass("fancybox-lock"),a.scrollTop(e).scrollLeft(t)),i(".fancybox-overlay").remove().hide(),i.extend(this,{overlay:null,fixed:!1})},update:function(){var e,i="100%";this.overlay.width(i).height("100%"),l?(e=Math.max(t.documentElement.offsetWidth,t.body.offsetWidth),r.width()>e&&(i=r.width())):r.width()>a.width()&&(i=r.width()),this.overlay.width(i).height(r.height())},onReady:function(e,t){var n=this.overlay;i(".fancybox-overlay").stop(!0,!0),n||this.create(e),e.locked&&this.fixed&&t.fixed&&(n||(this.margin=r.height()>a.height()&&i("html").css("margin-right").replace("px","")),t.locked=this.overlay.append(t.wrap),t.fixed=!1),!0===e.showEarly&&this.beforeShow.apply(this,arguments)},beforeShow:function(e,t){var n,o;t.locked&&(!1!==this.margin&&(i("*").filter(function(){return"fixed"===i(this).css("position")&&!i(this).hasClass("fancybox-overlay")&&!i(this).hasClass("fancybox-wrap")}).addClass("fancybox-margin"),this.el.addClass("fancybox-margin")),n=a.scrollTop(),o=a.scrollLeft(),this.el.addClass("fancybox-lock"),a.scrollTop(n).scrollLeft(o)),this.open(e)},onUpdate:function(){this.fixed||this.update()},afterClose:function(e){this.overlay&&!s.coming&&this.overlay.fadeOut(e.speedOut,i.proxy(this.close,this))}},s.helpers.title={defaults:{type:"float",position:"bottom"},beforeShow:function(e){var t,n,o=s.current,a=o.title,r=e.type;if(i.isFunction(a)&&(a=a.call(o.element,o)),h(a)&&""!==i.trim(a)){switch(t=i('<div class="fancybox-title fancybox-title-'+r+'-wrap">'+a+"</div>"),r){case"inside":n=s.skin;break;case"outside":n=s.wrap;break;case"over":n=s.inner;break;default:n=s.skin,t.appendTo("body"),l&&t.width(t.width()),t.wrapInner('<span class="child"></span>'),s.current.margin[2]+=Math.abs(u(t.css("margin-bottom")))}t["top"===e.position?"prependTo":"appendTo"](n)}}},i.fn.fancybox=function(e){var t,n=i(this),o=this.selector||"",a=function(a){var r,l,c=i(this).blur(),d=t;a.ctrlKey||a.altKey||a.shiftKey||a.metaKey||c.is(".fancybox-wrap")||(r=e.groupAttr||"data-fancybox-group",(l=c.attr(r))||(r="rel",l=c.get(0)[r]),l&&""!==l&&"nofollow"!==l&&(d=(c=(c=o.length?i(o):n).filter("["+r+'="'+l+'"]')).index(this)),e.index=d,!1!==s.open(c,e)&&a.preventDefault())};return t=(e=e||{}).index||0,o&&!1!==e.live?r.undelegate(o,"click.fb-start").delegate(o+":not('.fancybox-item, .fancybox-nav')","click.fb-start",a):n.unbind("click.fb-start").bind("click.fb-start",a),this.filter("[data-fancybox-start=1]").trigger("click"),this},r.ready(function(){var t,n,a,r;void 0===i.scrollbarWidth&&(i.scrollbarWidth=function(){var e=i('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),t=e.children(),n=t.innerWidth()-t.height(99).innerWidth();return e.remove(),n}),void 0===i.support.fixedPosition&&(i.support.fixedPosition=(a=i('<div style="position:fixed;top:20px;"></div>').appendTo("body"),r=20===a[0].offsetTop||15===a[0].offsetTop,a.remove(),r)),i.extend(s.defaults,{scrollbarWidth:i.scrollbarWidth(),fixed:i.support.fixedPosition,parent:i("body")}),t=i(e).width(),o.addClass("fancybox-lock-test"),n=i(e).width(),o.removeClass("fancybox-lock-test"),i("<style type='text/css'>.fancybox-margin{margin-right:"+(n-t)+"px;}</style>").appendTo("head")})}(window,document,jQuery);!function(e){"use strict";var t=navigator.userAgent.toLowerCase();(t.indexOf("webkit")>-1||t.indexOf("opera")>-1||t.indexOf("msie")>-1)&&document.getElementById&&window.addEventListener&&window.addEventListener("hashchange",function(){var e=document.getElementById(location.hash.substring(1));e&&(/^(?:a|select|input|button|textarea)$/i.test(e.nodeName)||(e.tabIndex=-1),e.greenmart())},!1)}();!function(e,t){"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports?module.exports=t(require("jquery")):e.jquery_mmenu_all_js=t(e.jQuery)}(this,function(e){var t,n,i,s,a,r,o;return function(e){function t(){e[r].glbl||(a={$wndw:e(window),$docu:e(document),$html:e("html"),$body:e("body")},n={},i={},s={},e.each([n,i,s],function(e,t){t.add=function(e){for(var n=0,i=(e=e.split(" ")).length;n<i;n++)t[e[n]]=t.mm(e[n])}}),n.mm=function(e){return"mm-"+e},n.add("wrapper menu panels panel nopanel navbar listview nolistview listitem btn hidden"),n.umm=function(e){return"mm-"==e.slice(0,3)&&(e=e.slice(3)),e},i.mm=function(e){return"mm-"+e},i.add("parent child title"),s.mm=function(e){return e+".mm"},s.add("transitionend webkitTransitionEnd click scroll resize keydown mousedown mouseup touchstart touchmove touchend orientationchange"),e[r]._c=n,e[r]._d=i,e[r]._e=s,e[r].glbl=a)}var n,i,s,a,r="mmenu",o="7.0.5";e[r]&&e[r].version>o||(e[r]=function(e,t,n){return this.$menu=e,this._api=["bind","getInstance","initPanels","openPanel","closePanel","closeAllPanels","setSelected"],this.opts=t,this.conf=n,this.vars={},this.cbck={},this.mtch={},"function"==typeof this.___deprecated&&this.___deprecated(),this._initHooks(),this._initWrappers(),this._initAddons(),this._initExtensions(),this._initMenu(),this._initPanels(),this._initOpened(),this._initAnchors(),this._initMatchMedia(),"function"==typeof this.___debug&&this.___debug(),this},e[r].version=o,e[r].uniqueId=0,e[r].wrappers={},e[r].addons={},e[r].defaults={hooks:{},extensions:[],wrappers:[],navbar:{add:!0,title:"Menu",titleLink:"parent"},onClick:{setSelected:!0},slidingSubmenus:!0},e[r].configuration={classNames:{divider:"Divider",inset:"Inset",nolistview:"NoListview",nopanel:"NoPanel",panel:"Panel",selected:"Selected",spacer:"Spacer",vertical:"Vertical"},clone:!1,openingInterval:25,panelNodetype:"ul, ol, div",transitionDuration:400},e[r].prototype={getInstance:function(){return this},initPanels:function(e){this._initPanels(e)},openPanel:function(t,s){if(this.trigger("openPanel:before",t),t&&t.length&&(t.is("."+n.panel)||(t=t.closest("."+n.panel)),t.is("."+n.panel))){var a=this;if("boolean"!=typeof s&&(s=!0),t.parent("."+n.listitem+"_vertical").length)t.parents("."+n.listitem+"_vertical").addClass(n.listitem+"_opened").children("."+n.panel).removeClass(n.hidden),this.openPanel(t.parents("."+n.panel).not(function(){return e(this).parent("."+n.listitem+"_vertical").length}).first()),this.trigger("openPanel:start",t),this.trigger("openPanel:finish",t);else{if(t.hasClass(n.panel+"_opened"))return;var o=this.$pnls.children("."+n.panel),l=this.$pnls.children("."+n.panel+"_opened");if(!e[r].support.csstransitions)return l.addClass(n.hidden).removeClass(n.panel+"_opened"),t.removeClass(n.hidden).addClass(n.panel+"_opened"),this.trigger("openPanel:start",t),void this.trigger("openPanel:finish",t);o.not(t).removeClass(n.panel+"_opened-parent");for(var d=t.data(i.parent);d;)(d=d.closest("."+n.panel)).parent("."+n.listitem+"_vertical").length||d.addClass(n.panel+"_opened-parent"),d=d.data(i.parent);o.removeClass(n.panel+"_highest").not(l).not(t).addClass(n.hidden),t.removeClass(n.hidden);var c=function(){l.removeClass(n.panel+"_opened"),t.addClass(n.panel+"_opened"),t.hasClass(n.panel+"_opened-parent")?(l.addClass(n.panel+"_highest"),t.removeClass(n.panel+"_opened-parent")):(l.addClass(n.panel+"_opened-parent"),t.addClass(n.panel+"_highest")),a.trigger("openPanel:start",t)},h=function(){l.removeClass(n.panel+"_highest").addClass(n.hidden),t.removeClass(n.panel+"_highest"),a.trigger("openPanel:finish",t)};s&&!t.hasClass(n.panel+"_noanimation")?setTimeout(function(){a.__transitionend(t,function(){h()},a.conf.transitionDuration),c()},a.conf.openingInterval):(c(),h())}this.trigger("openPanel:after",t)}},closePanel:function(e){this.trigger("closePanel:before",e);var t=e.parent();t.hasClass(n.listitem+"_vertical")&&(t.removeClass(n.listitem+"_opened"),e.addClass(n.hidden),this.trigger("closePanel",e)),this.trigger("closePanel:after",e)},closeAllPanels:function(e){this.trigger("closeAllPanels:before"),this.$pnls.find("."+n.listview).children().removeClass(n.listitem+"_selected").filter("."+n.listitem+"_vertical").removeClass(n.listitem+"_opened");var t=this.$pnls.children("."+n.panel),i=e&&e.length?e:t.first();this.$pnls.children("."+n.panel).not(i).removeClass(n.panel+"_opened").removeClass(n.panel+"_opened-parent").removeClass(n.panel+"_highest").addClass(n.hidden),this.openPanel(i,!1),this.trigger("closeAllPanels:after")},togglePanel:function(e){var t=e.parent();t.hasClass(n.listitem+"_vertical")&&this[t.hasClass(n.listitem+"_opened")?"closePanel":"openPanel"](e)},setSelected:function(e){this.trigger("setSelected:before",e),this.$menu.find("."+n.listitem+"_selected").removeClass(n.listitem+"_selected"),e.addClass(n.listitem+"_selected"),this.trigger("setSelected:after",e)},bind:function(e,t){this.cbck[e]=this.cbck[e]||[],this.cbck[e].push(t)},trigger:function(){var e=Array.prototype.slice.call(arguments),t=e.shift();if(this.cbck[t])for(var n=0,i=this.cbck[t].length;n<i;n++)this.cbck[t][n].apply(this,e)},matchMedia:function(e,t,n){var i={yes:t,no:n};this.mtch[e]=this.mtch[e]||[],this.mtch[e].push(i)},_initHooks:function(){for(var e in this.opts.hooks)this.bind(e,this.opts.hooks[e])},_initWrappers:function(){this.trigger("initWrappers:before");for(var t=0;t<this.opts.wrappers.length;t++){var n=e[r].wrappers[this.opts.wrappers[t]];"function"==typeof n&&n.call(this)}this.trigger("initWrappers:after")},_initAddons:function(){var t;for(t in this.trigger("initAddons:before"),e[r].addons)e[r].addons[t].add.call(this),e[r].addons[t].add=function(){};for(t in e[r].addons)e[r].addons[t].setup.call(this);this.trigger("initAddons:after")},_initExtensions:function(){this.trigger("initExtensions:before");var e=this;for(var t in this.opts.extensions.constructor===Array&&(this.opts.extensions={all:this.opts.extensions}),this.opts.extensions)this.opts.extensions[t]=this.opts.extensions[t].length?n.menu+"_"+this.opts.extensions[t].join(" "+n.menu+"_"):"",this.opts.extensions[t]&&function(t){e.matchMedia(t,function(){this.$menu.addClass(this.opts.extensions[t])},function(){this.$menu.removeClass(this.opts.extensions[t])})}(t);this.trigger("initExtensions:after")},_initMenu:function(){this.trigger("initMenu:before"),this.conf.clone&&(this.$orig=this.$menu,this.$menu=this.$orig.clone(),this.$menu.add(this.$menu.find("[id]")).filter("[id]").each(function(){e(this).attr("id",n.mm(e(this).attr("id")))})),this.$menu.attr("id",this.$menu.attr("id")||this.__getUniqueId()),this.$pnls=e('<div class="'+n.panels+'" />').append(this.$menu.children(this.conf.panelNodetype)).prependTo(this.$menu),this.$menu.addClass(n.menu).parent().addClass(n.wrapper),this.trigger("initMenu:after")},_initPanels:function(t){this.trigger("initPanels:before",t),t=t||this.$pnls.children(this.conf.panelNodetype);var i=e(),s=this,a=function(t){t.filter(s.conf.panelNodetype).each(function(t){var r=s._initPanel(e(this));if(r){s._initNavbar(r),s._initListview(r),i=i.add(r);var o=r.children("."+n.listview).children("li").children(s.conf.panelNodetype).add(r.children("."+s.conf.classNames.panel));o.length&&a(o)}})};a(t),this.trigger("initPanels:after",i)},_initPanel:function(e){if(this.trigger("initPanel:before",e),e.hasClass(n.panel))return e;if(this.__refactorClass(e,this.conf.classNames.panel,n.panel),this.__refactorClass(e,this.conf.classNames.nopanel,n.nopanel),this.__refactorClass(e,this.conf.classNames.inset,n.listview+"_inset"),e.filter("."+n.listview+"_inset").addClass(n.nopanel),e.hasClass(n.nopanel))return!1;var t=e.hasClass(this.conf.classNames.vertical)||!this.opts.slidingSubmenus;e.removeClass(this.conf.classNames.vertical);var s=e.attr("id")||this.__getUniqueId();e.is("ul, ol")&&(e.removeAttr("id"),e.wrap("<div />"),e=e.parent()),e.attr("id",s),e.addClass(n.panel+" "+n.hidden);var a=e.parent("li");return t?a.addClass(n.listitem+"_vertical"):e.appendTo(this.$pnls),a.length&&(a.data(i.child,e),e.data(i.parent,a)),this.trigger("initPanel:after",e),e},_initNavbar:function(t){if(this.trigger("initNavbar:before",t),!t.children("."+n.navbar).length){var s=t.data(i.parent),a=e('<div class="'+n.navbar+'" />'),r=this.__getPanelTitle(t,this.opts.navbar.title),o="";if(s&&s.length){if(s.hasClass(n.listitem+"_vertical"))return;if(s.parent().is("."+n.listview))var l=s.children("a, span").not("."+n.btn+"_next");else l=s.closest("."+n.panel).find('a[href="#'+t.attr("id")+'"]');var d=(s=(l=l.first()).closest("."+n.panel)).attr("id");switch(r=this.__getPanelTitle(t,e("<span>"+l.text()+"</span>").text()),this.opts.navbar.titleLink){case"anchor":o=l.attr("href");break;case"parent":o="#"+d}a.append('<a class="'+n.btn+" "+n.btn+"_prev "+n.navbar+'__btn" href="#'+d+'" />')}else if(!this.opts.navbar.title)return;this.opts.navbar.add&&t.addClass(n.panel+"_has-navbar"),a.append('<a class="'+n.navbar+'__title"'+(o.length?' href="'+o+'"':"")+">"+r+"</a>").prependTo(t),this.trigger("initNavbar:after",t)}},_initListview:function(t){this.trigger("initListview:before",t);var s=this.__childAddBack(t,"ul, ol");this.__refactorClass(s,this.conf.classNames.nolistview,n.nolistview);var a=s.not("."+n.nolistview).addClass(n.listview).children().addClass(n.listitem);this.__refactorClass(a,this.conf.classNames.selected,n.listitem+"_selected"),this.__refactorClass(a,this.conf.classNames.divider,n.listitem+"_divider"),this.__refactorClass(a,this.conf.classNames.spacer,n.listitem+"_spacer");var r=t.data(i.parent);if(r&&r.is("."+n.listitem)&&!r.children("."+n.btn+"_next").length){var o=r.children("a, span").first(),l=e('<a class="'+n.btn+'_next" href="#'+t.attr("id")+'" />').insertBefore(o);o.is("span")&&l.addClass(n.btn+"_fullwidth")}this.trigger("initListview:after",t)},_initOpened:function(){this.trigger("initOpened:before");var e=this.$pnls.find("."+n.listitem+"_selected").removeClass(n.listitem+"_selected").last().addClass(n.listitem+"_selected"),t=e.length?e.closest("."+n.panel):this.$pnls.children("."+n.panel).first();this.openPanel(t,!1),this.trigger("initOpened:after")},_initAnchors:function(){this.trigger("initAnchors:before");var t=this;a.$body.on(s.click+"-oncanvas","a[href]",function(i){var s=e(this),a=s.attr("href"),o=t.$menu.find(s).length,l=s.is("."+n.listitem+" > a"),d=s.is('[rel="external"]')||s.is('[target="_blank"]');if(o&&a.length>1&&"#"==a.slice(0,1))try{var c=t.$menu.find(a);if(c.is("."+n.panel))return t[s.parent().hasClass(n.listitem+"_vertical")?"togglePanel":"openPanel"](c),void i.preventDefault()}catch(e){}var h={close:null,setSelected:null,preventDefault:"#"==a.slice(0,1)};for(var p in e[r].addons){var f=e[r].addons[p].clickAnchor.call(t,s,o,l,d);if(f){if("boolean"==typeof f)return void i.preventDefault();"object"==typeof f&&(h=e.extend({},h,f))}}o&&l&&!d&&(t.__valueOrFn(s,t.opts.onClick.setSelected,h.setSelected)&&t.setSelected(e(i.target).parent()),t.__valueOrFn(s,t.opts.onClick.preventDefault,h.preventDefault)&&i.preventDefault(),t.__valueOrFn(s,t.opts.onClick.close,h.close)&&t.opts.offCanvas&&"function"==typeof t.close&&t.close())}),this.trigger("initAnchors:after")},_initMatchMedia:function(){var e=this;for(var t in this.mtch)!function(){var n=t,i=window.matchMedia(n);e._fireMatchMedia(n,i),i.addListener(function(t){e._fireMatchMedia(n,t)})}()},_fireMatchMedia:function(e,t){for(var n=t.matches?"yes":"no",i=0;i<this.mtch[e].length;i++)this.mtch[e][i][n].call(this)},_getOriginalMenuId:function(){var e=this.$menu.attr("id");return this.conf.clone&&e&&e.length&&(e=n.umm(e)),e},__api:function(){var t=this,n={};return e.each(this._api,function(e){var i=this;n[i]=function(){var e=t[i].apply(t,arguments);return void 0===e?n:e}}),n},__valueOrFn:function(e,t,n){if("function"==typeof t){var i=t.call(e[0]);if(void 0!==i)return i}return"function"!=typeof t&&void 0!==t||void 0===n?t:n},__getPanelTitle:function(t,n){var s;return"function"==typeof this.opts.navbar.title&&(s=this.opts.navbar.title.call(t[0])),void 0===s&&(s=t.data(i.title)),void 0!==s?s:"string"==typeof n?e[r].i18n(n):e[r].i18n(e[r].defaults.navbar.title)},__refactorClass:function(e,t,n){return e.filter("."+t).removeClass(t).addClass(n)},__findAddBack:function(e,t){return e.find(t).add(e.filter(t))},__childAddBack:function(e,t){return e.children(t).add(e.filter(t))},__filterListItems:function(e){return e.not("."+n.listitem+"_divider").not("."+n.hidden)},__filterListItemAnchors:function(e){return this.__filterListItems(e).children("a").not("."+n.btn+"_next")},__openPanelWoAnimation:function(e){e.hasClass(n.panel+"_noanimation")||(e.addClass(n.panel+"_noanimation"),this.__transitionend(e,function(){e.removeClass(n.panel+"_noanimation")},this.conf.openingInterval),this.openPanel(e))},__transitionend:function(e,t,n){var i=!1,a=function(n){void 0!==n&&n.target!=e[0]||(i||(e.off(s.transitionend),e.off(s.webkitTransitionEnd),t.call(e[0])),i=!0)};e.on(s.transitionend,a),e.on(s.webkitTransitionEnd,a),setTimeout(a,1.1*n)},__getUniqueId:function(){return n.mm(e[r].uniqueId++)}},e.fn[r]=function(n,i){t(),n=e.extend(!0,{},e[r].defaults,n),i=e.extend(!0,{},e[r].configuration,i);var s=e();return this.each(function(){var t=e(this);if(!t.data(r)){var a=new e[r](t,n,i);a.$menu.data(r,a.__api()),s=s.add(a.$menu)}}),s},e[r].i18n=function(){var t={};return function(n){switch(typeof n){case"object":return e.extend(t,n),t;case"string":return t[n]||n;case"undefined":default:return t}}}(),e[r].support={touch:"ontouchstart"in window||navigator.msMaxTouchPoints||!1,csstransitions:"undefined"==typeof Modernizr||void 0===Modernizr.csstransitions||Modernizr.csstransitions,csstransforms:"undefined"==typeof Modernizr||void 0===Modernizr.csstransforms||Modernizr.csstransforms,csstransforms3d:"undefined"==typeof Modernizr||void 0===Modernizr.csstransforms3d||Modernizr.csstransforms3d})}(e),o="offCanvas",(t=e)[r="mmenu"].addons[o]={setup:function(){if(this.opts[o]){var e=this.opts[o],i=this.conf[o];a=t[r].glbl,this._api=t.merge(this._api,["open","close","setPage"]),"object"!=typeof e&&(e={}),e=this.opts[o]=t.extend(!0,{},t[r].defaults[o],e),"string"!=typeof i.pageSelector&&(i.pageSelector="> "+i.pageNodetype),this.vars.opened=!1;var s=[n.menu+"_offcanvas"];t[r].support.csstransforms||s.push(n["no-csstransforms"]),t[r].support.csstransforms3d||s.push(n["no-csstransforms3d"]),this.bind("initMenu:after",function(){var e=this;this.setPage(a.$page),this._initBlocker(),this["_initWindow_"+o](),this.$menu.addClass(s.join(" ")).parent("."+n.wrapper).removeClass(n.wrapper),this.$menu[i.menuInsertMethod](i.menuInsertSelector);var t=window.location.hash;if(t){var r=this._getOriginalMenuId();r&&r==t.slice(1)&&setTimeout(function(){e.open()},1e3)}}),this.bind("open:start:sr-aria",function(){this.__sr_aria(this.$menu,"hidden",!1)}),this.bind("close:finish:sr-aria",function(){this.__sr_aria(this.$menu,"hidden",!0)}),this.bind("initMenu:after:sr-aria",function(){this.__sr_aria(this.$menu,"hidden",!0)})}},add:function(){n=t[r]._c,i=t[r]._d,s=t[r]._e,n.add("slideout page no-csstransforms3d"),i.add("style")},clickAnchor:function(e,t){var i=this;if(this.opts[o]){var s=this._getOriginalMenuId();if(s&&e.is('[href="#'+s+'"]')){if(t)return this.open(),!0;var r=e.closest("."+n.menu);if(r.length){var l=r.data("mmenu");if(l&&l.close)return l.close(),i.__transitionend(r,function(){i.open()},i.conf.transitionDuration),!0}return this.open(),!0}if(a.$page)return(s=a.$page.first().attr("id"))&&e.is('[href="#'+s+'"]')?(this.close(),!0):void 0}}},t[r].defaults[o]={blockUI:!0,moveBackground:!0},t[r].configuration[o]={pageNodetype:"div",pageSelector:null,noPageSelector:[],wrapPageIfNeeded:!0,menuInsertMethod:"prependTo",menuInsertSelector:"body"},t[r].prototype.open=function(){if(this.trigger("open:before"),!this.vars.opened){var e=this;this._openSetup(),setTimeout(function(){e._openFinish()},this.conf.openingInterval),this.trigger("open:after")}},t[r].prototype._openSetup=function(){var e=this,r=this.opts[o];this.closeAllOthers(),a.$page.each(function(){t(this).data(i.style,t(this).attr("style")||"")}),a.$wndw.trigger(s.resize+"-"+o,[!0]);var l=[n.wrapper+"_opened"];r.blockUI&&l.push(n.wrapper+"_blocking"),"modal"==r.blockUI&&l.push(n.wrapper+"_modal"),r.moveBackground&&l.push(n.wrapper+"_background"),a.$html.addClass(l.join(" ")),setTimeout(function(){e.vars.opened=!0},this.conf.openingInterval),this.$menu.addClass(n.menu+"_opened")},t[r].prototype._openFinish=function(){var e=this;this.__transitionend(a.$page.first(),function(){e.trigger("open:finish")},this.conf.transitionDuration),this.trigger("open:start"),a.$html.addClass(n.wrapper+"_opening")},t[r].prototype.close=function(){if(this.trigger("close:before"),this.vars.opened){var e=this;this.__transitionend(a.$page.first(),function(){e.$menu.removeClass(n.menu+"_opened");var s=[n.wrapper+"_opened",n.wrapper+"_blocking",n.wrapper+"_modal",n.wrapper+"_background"];a.$html.removeClass(s.join(" ")),a.$page.each(function(){t(this).attr("style",t(this).data(i.style))}),e.vars.opened=!1,e.trigger("close:finish")},this.conf.transitionDuration),this.trigger("close:start"),a.$html.removeClass(n.wrapper+"_opening"),this.trigger("close:after")}},t[r].prototype.closeAllOthers=function(){a.$body.find("."+n.menu+"_offcanvas").not(this.$menu).each(function(){var e=t(this).data(r);e&&e.close&&e.close()})},t[r].prototype.setPage=function(e){this.trigger("setPage:before",e);var i=this,s=this.conf[o];e&&e.length||(e=a.$body.find(s.pageSelector),s.noPageSelector.length&&(e=e.not(s.noPageSelector.join(", "))),e.length>1&&s.wrapPageIfNeeded&&(e=e.wrapAll("<"+this.conf[o].pageNodetype+" />").parent())),e.each(function(){t(this).attr("id",t(this).attr("id")||i.__getUniqueId())}),e.addClass(n.page+" "+n.slideout),a.$page=e,this.trigger("setPage:after",e)},t[r].prototype["_initWindow_"+o]=function(){a.$wndw.off(s.keydown+"-"+o).on(s.keydown+"-"+o,function(e){if(a.$html.hasClass(n.wrapper+"_opened")&&9==e.keyCode)return e.preventDefault(),!1});var e=0;a.$wndw.off(s.resize+"-"+o).on(s.resize+"-"+o,function(t,i){if(1==a.$page.length&&(i||a.$html.hasClass(n.wrapper+"_opened"))){var s=a.$wndw.height();(i||s!=e)&&(e=s,a.$page.css("minHeight",s))}})},t[r].prototype._initBlocker=function(){var e=this;this.opts[o].blockUI&&(a.$blck||(a.$blck=t('<div class="'+n.page+"__blocker "+n.slideout+'" />')),a.$blck.appendTo(a.$body).off(s.touchstart+"-"+o+" "+s.touchmove+"-"+o).on(s.touchstart+"-"+o+" "+s.touchmove+"-"+o,function(e){e.preventDefault(),e.stopPropagation(),a.$blck.trigger(s.mousedown+"-"+o)}).off(s.mousedown+"-"+o).on(s.mousedown+"-"+o,function(t){t.preventDefault(),a.$html.hasClass(n.wrapper+"_modal")||(e.closeAllOthers(),e.close())}))},function(e){var t,n,i="mmenu",s="screenReader";e[i].addons[s]={setup:function(){var a=this,r=this.opts[s],o=this.conf[s];e[i].glbl,"boolean"==typeof r&&(r={aria:r,text:r}),"object"!=typeof r&&(r={}),(r=this.opts[s]=e.extend(!0,{},e[i].defaults[s],r)).aria&&(this.bind("initAddons:after",function(){this.bind("initMenu:after",function(){this.trigger("initMenu:after:sr-aria")}),this.bind("initNavbar:after",function(){this.trigger("initNavbar:after:sr-aria",arguments[0])}),this.bind("openPanel:start",function(){this.trigger("openPanel:start:sr-aria",arguments[0])}),this.bind("close:start",function(){this.trigger("close:start:sr-aria")}),this.bind("close:finish",function(){this.trigger("close:finish:sr-aria")}),this.bind("open:start",function(){this.trigger("open:start:sr-aria")}),this.bind("initOpened:after",function(){this.trigger("initOpened:after:sr-aria")})}),this.bind("updateListview",function(){this.$pnls.find("."+t.listview).children().each(function(){a.__sr_aria(e(this),"hidden",e(this).is("."+t.hidden))})}),this.bind("openPanel:start",function(e){var n=this.$menu.find("."+t.panel).not(e).not(e.parents("."+t.panel)),i=e.add(e.find("."+t.listitem+"_vertical ."+t.listitem+"_opened").children("."+t.panel));this.__sr_aria(n,"hidden",!0),this.__sr_aria(i,"hidden",!1)}),this.bind("closePanel",function(e){this.__sr_aria(e,"hidden",!0)}),this.bind("initPanels:after",function(n){var i=n.find("."+t.btn).each(function(){a.__sr_aria(e(this),"owns",e(this).attr("href").replace("#",""))});this.__sr_aria(i,"haspopup",!0)}),this.bind("initNavbar:after",function(e){var n=e.children("."+t.navbar);this.__sr_aria(n,"hidden",!e.hasClass(t.panel+"_has-navbar"))}),r.text&&(this.bind("initlistview:after",function(e){var n=e.find("."+t.listview).find("."+t.btn+"_fullwidth").parent().children("span");this.__sr_aria(n,"hidden",!0)}),"parent"==this.opts.navbar.titleLink&&this.bind("initNavbar:after",function(e){var n=e.children("."+t.navbar),i=!!n.children("."+t.btn+"_prev").length;this.__sr_aria(n.children("."+t.title),"hidden",i)}))),r.text&&(this.bind("initAddons:after",function(){this.bind("setPage:after",function(){this.trigger("setPage:after:sr-text",arguments[0])})}),this.bind("initNavbar:after",function(n){var s=n.children("."+t.navbar),a=s.children("."+t.title).text(),r=e[i].i18n(o.text.closeSubmenu);a&&(r+=" ("+a+")"),s.children("."+t.btn+"_prev").html(this.__sr_text(r))}),this.bind("initListview:after",function(s){var r=s.data(n.parent);if(r&&r.length){var l=r.children("."+t.btn+"_next"),d=l.nextAll("span, a").first().text(),c=e[i].i18n(o.text[l.parent().is("."+t.listitem+"_vertical")?"toggleSubmenu":"openSubmenu"]);d&&(c+=" ("+d+")"),l.html(a.__sr_text(c))}}))},add:function(){t=e[i]._c,n=e[i]._d,e[i]._e,t.add("sronly")},clickAnchor:function(e,t){}},e[i].defaults[s]={aria:!0,text:!0},e[i].configuration[s]={text:{closeMenu:"Close menu",closeSubmenu:"Close submenu",openSubmenu:"Open submenu",toggleSubmenu:"Toggle submenu"}},e[i].prototype.__sr_aria=function(e,t,n){e.prop("aria-"+t,n)[n?"attr":"removeAttr"]("aria-"+t,n)},e[i].prototype.__sr_role=function(e,t){e.prop("role",t)[t?"attr":"removeAttr"]("role",t)},e[i].prototype.__sr_text=function(e){return'<span class="'+t.sronly+'">'+e+"</span>"}}(e),function(e){var t,n,i="mmenu",s="counters";e[i].addons[s]={setup:function(){var a=this,r=this.opts[s];if(this.conf[s],e[i].glbl,"boolean"==typeof r&&(r={add:r,update:r}),"object"!=typeof r&&(r={}),r=this.opts[s]=e.extend(!0,{},e[i].defaults[s],r),this.bind("initListview:after",function(e){var n=this.conf.classNames[s].counter;this.__refactorClass(e.find("."+n),n,t.counter)}),r.add&&this.bind("initListview:after",function(i){var s;switch(r.addTo){case"panels":s=i;break;default:s=i.filter(r.addTo)}s.each(function(){var i=e(this).data(n.parent);i&&(i.children("."+t.counter).length||i.prepend(e('<em class="'+t.counter+'" />')))})}),r.update){var o=function(i){(i=i||this.$pnls.children("."+t.panel)).each(function(){var i=e(this),s=i.data(n.parent);if(s){var r=s.children("em."+t.counter);r.length&&((i=i.children("."+t.listview)).length&&r.html(a.__filterListItems(i.children()).length))}})};this.bind("initListview:after",o),this.bind("updateListview",o)}},add:function(){t=e[i]._c,n=e[i]._d,e[i]._e,t.add("counter")},clickAnchor:function(e,t){}},e[i].defaults[s]={add:!1,addTo:"panels",count:!1},e[i].configuration.classNames[s]={counter:"Counter"}}(e),function(e){function t(e,t,n){return e<t&&(e=t),e>n&&(e=n),e}function n(n,i,a){var r,o,d,c=this,h={events:"panleft panright",typeLower:"x",typeUpper:"X",open_dir:"right",close_dir:"left",negative:!1},p="width",f=h.open_dir,u=function(e){e<=n.maxStartPos&&(v=1)},_=function(){return e("."+s.slideout)},v=0,m=0,g=0,b=this.opts.extensions.all,C=void 0===b?"left":b.indexOf(s.menu+"_position-right")>-1?"right":b.indexOf(s.menu+"_position-top")>-1?"top":b.indexOf(s.menu+"_position-bottom")>-1?"bottom":"left",w=void 0===b?"back":b.indexOf(s.menu+"_position-top")>-1||b.indexOf(s.menu+"_position-bottom")>-1||b.indexOf(s.menu+"_position-front")>-1?"front":"back";switch(C){case"top":case"bottom":h.events="panup pandown",h.typeLower="y",h.typeUpper="Y",p="height"}switch(C){case"right":case"bottom":h.negative=!0,u=function(e){e>=a.$wndw[p]()-n.maxStartPos&&(v=1)}}switch(C){case"right":h.open_dir="left",h.close_dir="right";break;case"top":h.open_dir="down",h.close_dir="up";break;case"bottom":h.open_dir="up",h.close_dir="down"}switch(w){case"front":_=function(){return c.$menu}}var y,$=this.__valueOrFn(this.$menu,n.node,a.$page);"string"==typeof $&&($=e($));var P=new Hammer($[0],this.opts[l].vendors.hammer);P.on("panstart",function(e){u(e.center[h.typeLower]),y=_(),f=h.open_dir}),P.on(h.events+" panend",function(e){v>0&&e.preventDefault()}),P.on(h.events,function(e){if(r=e["delta"+h.typeUpper],h.negative&&(r=-r),r!=m&&(f=r>=m?h.open_dir:h.close_dir),(m=r)>n.threshold&&1==v){if(a.$html.hasClass(s.wrapper+"_opened"))return;v=2,c._openSetup(),c.trigger("open:start"),a.$html.addClass(s.dragging),g=t(a.$wndw[p]()*i[p].perc,i[p].min,i[p].max)}2==v&&(o=t(m,10,g)-("front"==w?g:0),h.negative&&(o=-o),d="translate"+h.typeUpper+"("+o+"px )",y.css({"-webkit-transform":"-webkit-"+d,transform:d}))}),P.on("panend",function(e){2==v&&(a.$html.removeClass(s.dragging),y.css("transform",""),c[f==h.open_dir?"_openFinish":"close"]()),v=0})}function i(e,t,n,i){var r=this,o=e.data(a.parent);if(o){o=o.closest("."+s.panel);var d=null;new Hammer(e[0],r.opts[l].vendors.hammer).on("panright",function(e){d||(r.openPanel(o),d=setTimeout(function(){clearTimeout(d),d=null},r.conf.openingInterval+r.conf.transitionDuration))})}}var s,a,r,o="mmenu",l="drag";e[o].addons[l]={setup:function(){if(this.opts.offCanvas){var t=this.opts[l],s=this.conf[l];r=e[o].glbl,"boolean"==typeof t&&(t={menu:t,panels:t}),"object"!=typeof t&&(t={}),"boolean"==typeof t.menu&&(t.menu={open:t.menu}),"object"!=typeof t.menu&&(t.menu={}),"boolean"==typeof t.panels&&(t.panels={close:t.panels}),"object"!=typeof t.panels&&(t.panels={}),(t=this.opts[l]=e.extend(!0,{},e[o].defaults[l],t)).menu.open&&this.bind("setPage:after",function(){n.call(this,t.menu,s.menu,r)}),t.panels.close&&this.bind("initPanel:after",function(e){i.call(this,e,t.panels,s.panels,r)})}},add:function(){return"function"!=typeof Hammer||Hammer.VERSION<2?(e[o].addons[l].add=function(){},void(e[o].addons[l].setup=function(){})):(s=e[o]._c,a=e[o]._d,e[o]._e,void s.add("dragging"))},clickAnchor:function(e,t){}},e[o].defaults[l]={menu:{open:!1,maxStartPos:100,threshold:50},panels:{close:!1},vendors:{hammer:{}}},e[o].configuration[l]={menu:{width:{perc:.8,min:140,max:440},height:{perc:.8,min:140,max:880}},panels:{}}}(e),function(e){var t,n,i,s="mmenu",a="iconbar";e[s].addons[a]={setup:function(){var r=this,o=this.opts[a];if(this.conf[a],e[s].glbl,o instanceof Array&&(o={add:!0,top:o}),o.add){var l=null;if(e.each(["top","bottom"],function(n,i){var s=o[i];s instanceof Array||(s=[s]);for(var a=e('<div class="'+t.iconbar+"__"+i+'" />'),r=0,d=s.length;r<d;r++)a.append(s[r]);a.children().length&&(l||(l=e('<div class="'+t.iconbar+'" />')),l.append(a))}),l&&(this.bind("initMenu:after",function(){this.$menu.addClass(t.menu+"_iconbar-"+o.size).prepend(l)}),"tabs"==o.type)){l.addClass(t.iconbar+"_tabs");var d=l.find("a");d.on(i.click+"-"+a,function(n){var i=e(this);if(i.hasClass(t.iconbar+"__tab_selected"))n.stopImmediatePropagation();else try{var s=e(i.attr("href"));s.hasClass(t.panel)&&(n.preventDefault(),n.stopImmediatePropagation(),r.__openPanelWoAnimation(s))}catch(e){}}),this.bind("openPanel:start",function e(i){d.removeClass(t.iconbar+"__tab_selected");var s=d.filter('[href="#'+i.attr("id")+'"]');if(s.length)s.addClass(t.iconbar+"__tab_selected");else{var a=i.data(n.parent);a&&a.length&&e(a.closest("."+t.panel))}})}}},add:function(){t=e[s]._c,n=e[s]._d,i=e[s]._e,t.add(a)},clickAnchor:function(e,t){}},e[s].defaults[a]={add:!1,size:40,top:[],bottom:[]},e[s].configuration[a]={}}(e),function(e){var t,n="mmenu",i="iconPanels";e[n].addons[i]={setup:function(){var s=this,a=this.opts[i],r=(this.conf[i],!1);if(e[n].glbl,"boolean"==typeof a&&(a={add:a}),"number"!=typeof a&&"string"!=typeof a||(a={add:!0,visible:a}),"object"!=typeof a&&(a={}),"first"==a.visible&&(r=!0,a.visible=1),(a=this.opts[i]=e.extend(!0,{},e[n].defaults[i],a)).visible=Math.min(3,Math.max(1,a.visible)),a.visible++,a.add){for(var o="",l=0;l<=a.visible;l++)o+=" "+t.panel+"_iconpanel-"+l;o.length&&(o=o.slice(1));var d=function(n){if(!n.parent("."+t.listitem+"_vertical").length){var i=s.$pnls.children("."+t.panel).removeClass(o);r&&i.removeClass(t.panel+"_iconpanel-first").first().addClass(t.panel+"_iconpanel-first"),i.filter("."+t.panel+"_opened-parent").removeClass(t.hidden).not(function(){return e(this).parent("."+t.listitem+"_vertical").length}).add(n).slice(-a.visible).each(function(n){e(this).addClass(t.panel+"_iconpanel-"+n)})}};this.bind("initMenu:after",function(){var e=[t.menu+"_iconpanel-"+a.size];a.hideNavbar&&e.push(t.menu+"_hidenavbar"),a.hideDivider&&e.push(t.menu+"_hidedivider"),this.$menu.addClass(e.join(" "))}),this.bind("openPanel:start",d),this.bind("initPanels:after",function(e){d.call(s,s.$pnls.children("."+t.panel+"_opened"))}),this.bind("initListview:after",function(e){!a.blockPanel||e.parent("."+t.listitem+"_vertical").length||e.children("."+t.panel+"__blocker").length||e.prepend('<a href="#'+e.closest("."+t.panel).attr("id")+'" class="'+t.panel+'__blocker" />')})}},add:function(){t=e[n]._c,e[n]._d,e[n]._e},clickAnchor:function(e,t){}},e[n].defaults[i]={add:!1,blockPanel:!0,hideDivider:!1,hideNavbar:!0,size:40,visible:3}}(e),function(e){var t,n="mmenu",i="navbars";e[n].addons[i]={setup:function(){var s=this,a=this.opts[i],r=this.conf[i];if(e[n].glbl,void 0!==a){a instanceof Array||(a=[a]);var o={},l={};a.length&&(e.each(a,function(d){var c=a[d];"boolean"==typeof c&&c&&(c={}),"object"!=typeof c&&(c={}),void 0===c.content&&(c.content=["prev","title"]),c.content instanceof Array||(c.content=[c.content]),c=e.extend(!0,{},s.opts.navbar,c);var h=e('<div class="'+t.navbar+'" />'),p=c.height;"number"!=typeof p?p=1:(p=Math.min(4,Math.max(1,p)))>1&&h.addClass(t.navbar+"_size-"+p);var f=c.position;switch(f){case"bottom":break;default:f="top"}o[f]||(o[f]=0),o[f]+=p,l[f]||(l[f]=e('<div class="'+t.navbars+"_"+f+'" />')),l[f].append(h);for(var u=0,_=c.content.length;u<_;u++){var v=e[n].addons[i][c.content[u]]||null;v?v.call(s,h,c,r):((v=c.content[u])instanceof e||(v=e(c.content[u])),h.append(v))}var m=e[n].addons[i][c.type]||null;m&&m.call(s,h,c,r),h.children("."+t.btn).length&&h.addClass(t.navbar+"_has-btns")}),this.bind("initMenu:after",function(){for(var e in o)this.$menu.addClass(t.menu+"_navbar_"+e+"-"+o[e]),this.$menu["bottom"==e?"append":"prepend"](l[e])}))}},add:function(){t=e[n]._c,e[n]._d,e[n]._e,t.add(i)},clickAnchor:function(e,t){}},e[n].configuration[i]={breadcrumbs:{separator:"/",removeFirst:!1}},e[n].configuration.classNames[i]={}}(e),function(e){function t(e,t){if(t)for(var n in t)e.attr(n,t[n])}var n,i,s,a="mmenu",r="searchfield";e[a].addons[r]={setup:function(){var t=this,i=this.opts[r],s=this.conf[r];e[a].glbl,"boolean"==typeof i&&(i={add:i}),"object"!=typeof i&&(i={}),"boolean"==typeof i.panel&&(i.panel={add:i.panel}),"object"!=typeof i.panel&&(i.panel={}),i.add&&("panel"==i.addTo&&(i.panel.add=!0),i.panel.add&&(i.showSubPanels=!1,i.panel.splash&&(i.cancel=!0)),i=this.opts[r]=e.extend(!0,{},e[a].defaults[r],i),s=this.conf[r]=e.extend(!0,{},e[a].configuration[r],s),this.bind("close:start",function(){this.$menu.find("."+n.searchfield).children("input").blur()}),this.bind("initPanels:after",function(n){var s,a=e();switch(i.panel.add&&(a=this._initSearchPanel(n)),i.addTo){case"panels":s=n;break;case"panel":s=a;break;default:s=this.$menu.find(i.addTo)}(s.each(function(){var n=t._initSearchfield(e(this));i.search&&n.length&&t._initSearching(n)}),i.noResults)&&(i.panel.add?a:n).each(function(){t._initNoResultsMsg(e(this))})}))},add:function(){n=e[a]._c,i=e[a]._d,s=e[a]._e,n.add("searchfield"),i.add("searchfield"),s.add("input focus blur")},clickAnchor:function(e,t){if(e.hasClass(n.searchfield+"__btn")){if(e.hasClass(n.btn+"_clear")){var i=e.closest("."+n.searchfield).find("input");return i.val(""),this.search(i),!0}if(e.hasClass(n.btn+"_next"))return e.closest("."+n.searchfield).submit(),!0}}},e[a].defaults[r]={add:!1,addTo:"panels",noResults:"No results found.",placeholder:"Search",panel:{add:!1,dividers:!0,fx:"none",id:null,splash:null,title:"Search"},search:!0,showTextItems:!1,showSubPanels:!0},e[a].configuration[r]={clear:!1,form:!1,input:!1,submit:!1},e[a].prototype._initSearchPanel=function(t){var i=this.opts[r];if(this.conf[r],this.$pnls.children("."+n.panel+"_search").length)return e();var s=e('<div class="'+n.panel+'_search " />').append("<ul />").appendTo(this.$pnls);switch(i.panel.id&&s.attr("id",i.panel.id),i.panel.title&&s.attr("data-mm-title",i.panel.title),i.panel.fx){case!1:break;case"none":s.addClass(n.panel+"_noanimation");break;default:s.addClass(n.panel+"_fx-"+i.panel.fx)}return i.panel.splash&&s.append('<div class="'+n.panel+'__searchsplash">'+i.panel.splash+"</div>"),this._initPanels(s),s},e[a].prototype._initSearchfield=function(i){var s=this.opts[r],o=this.conf[r];if(i.parent("."+n.listitem+"_vertical").length)return e();if(i.find("."+n.searchfield).length)return e();var l=e("<"+(o.form?"form":"div")+' class="'+n.searchfield+'" />'),d=e('<div class="'+n.searchfield+'__input" />'),c=e('<input placeholder="'+e[a].i18n(s.placeholder)+'" type="text" autocomplete="off" />');return d.append(c).appendTo(l),i.hasClass(n.searchfield)?i.replaceWith(l):(i.prepend(l),i.hasClass(n.panel)&&i.addClass(n.panel+"_has-searchfield")),t(c,o.input),o.clear&&e('<a class="'+n.btn+" "+n.btn+"_clear "+n.searchfield+'__btn" href="#" />').appendTo(d),t(l,o.form),o.form&&o.submit&&!o.clear&&e('<a class="'+n.btn+" "+n.btn+"_next "+n.searchfield+'__btn" href="#" />').appendTo(d),s.cancel&&e('<a href="#" class="'+n.searchfield+'__cancel">'+e[a].i18n("cancel")+"</a>").appendTo(l),l},e[a].prototype._initSearching=function(t){var a=this,o=this.opts[r],l=(this.conf[r],{});t.closest("."+n.panel+"_search").length?(l.$pnls=this.$pnls.find("."+n.panel),l.$nrsp=t.closest("."+n.panel)):t.closest("."+n.panel).length?(l.$pnls=t.closest("."+n.panel),l.$nrsp=l.$pnls):(l.$pnls=this.$pnls.find("."+n.panel),l.$nrsp=this.$menu),o.panel.add&&(l.$pnls=l.$pnls.not("."+n.panel+"_search"));var d=t.find("input"),c=t.find("."+n.searchfield+"__cancel"),h=this.$pnls.children("."+n.panel+"_search"),p=l.$pnls.find("."+n.listitem);l.$itms=p.not("."+n.listitem+"_divider"),l.$dvdr=p.filter("."+n.listitem+"_divider"),o.panel.add&&o.panel.splash&&d.off(s.focus+"-"+r+"-splash").on(s.focus+"-"+r+"-splash",function(e){a.openPanel(h)}),o.cancel&&(d.off(s.focus+"-"+r+"-cancel").on(s.focus+"-"+r+"-cancel",function(e){c.addClass(n.searchfield+"__cancel-active")}),c.off(s.click+"-"+r+"-splash").on(s.click+"-"+r+"-splash",function(t){t.preventDefault(),e(this).removeClass(n.searchfield+"__cancel-active"),h.hasClass(n.panel+"_opened")&&a.openPanel(a.$pnls.children("."+n.panel+"_opened-parent").last())})),o.panel.add&&"panel"==o.addTo&&this.bind("openPanel:finish",function(e){e[0]===h[0]&&d.focus()}),d.data(i.searchfield,l).off(s.input+"-"+r).on(s.input+"-"+r,function(e){(function(e){switch(e){case 9:case 16:case 17:case 18:case 37:case 38:case 39:case 40:return!0}return!1})(e.keyCode)||a.search(d)}),this.search(d)},e[a].prototype._initNoResultsMsg=function(t){var i=this.opts[r];if(this.conf[r],t.closest("."+n.panel).length||(t=this.$pnls.children("."+n.panel).first()),!t.children("."+n.panel+"__noresultsmsg").length){var s=t.children("."+n.listview).first(),o=e('<div class="'+n.panel+"__noresultsmsg "+n.hidden+'" />').append(e[a].i18n(i.noResults));s.length?o.insertAfter(s):o.prependTo(t)}},e[a].prototype.search=function(t,s){var a=this,o=this.opts[r];this.conf[r],t=t||this.$menu.find("."+n.searchfield).chidren("input").first(),s=(s=s||t.val()).toLowerCase().trim();var l=t.data(i.searchfield),d=t.closest("."+n.searchfield).find("."+n.btn),c=this.$pnls.children("."+n.panel+"_search"),h=l.$pnls,p=l.$itms,f=l.$dvdr,u=l.$nrsp;if(p.removeClass(n.listitem+"_nosubitems").find("."+n.btn+"_fullwidth-search").removeClass(n.btn+"_fullwidth-search "+n.btn+"_fullwidth"),c.children("."+n.listview).empty(),h.scrollTop(0),s.length){if(p.add(f).addClass(n.hidden),p.each(function(){var t=e(this),i="a";(o.showTextItems||o.showSubPanels&&t.find("."+n.btn+"_next"))&&(i="a, span"),t.children(i).not("."+n.btn+"_next").text().toLowerCase().indexOf(s)>-1&&t.removeClass(n.hidden)}),o.panel.add){var _=e();h.each(function(){var t=a.__filterListItems(e(this).find("."+n.listitem)).clone(!0);t.length&&(o.panel.dividers&&(_=_.add('<li class="'+n.listitem+" "+n.listitem+'_divider">'+e(this).find("."+n.navbar+"__title").text()+"</li>")),_=_.add(t))}),_.find("."+n.mm("toggle")).remove().end().find("."+n.mm("check")).remove().end().find("."+n.btn).remove(),c.children("."+n.listview).append(_),this.openPanel(c)}else o.showSubPanels&&h.each(function(t){var s=e(this);a.__filterListItems(s.find("."+n.listitem)).each(function(){var t=e(this).data(i.child);t&&t.find("."+n.listview).children().removeClass(n.hidden)})}),e(h.get().reverse()).each(function(s){var r=e(this),o=r.data(i.parent);o&&(a.__filterListItems(r.find("."+n.listitem)).length?o.hasClass(n.hidden)&&o.removeClass(n.hidden).children("."+n.btn+"_next").not("."+n.btn+"_fullwidth").addClass(n.btn+"_fullwidth").addClass(n.btn+"_fullwidth-search"):t.closest("."+n.panel).length||((r.hasClass(n.panel+"_opened")||r.hasClass(n.panel+"_opened-parent"))&&setTimeout(function(){a.openPanel(o.closest("."+n.panel))},(s+1)*(1.5*a.conf.openingInterval)),o.addClass(n.listitem+"_nosubitems")))}),this.__filterListItems(h.find("."+n.listitem)).each(function(){e(this).prevAll("."+n.listitem+"_divider").first().removeClass(n.hidden)});d.removeClass(n.hidden),u.find("."+n.panel+"__noresultsmsg")[p.not("."+n.hidden).length?"addClass":"removeClass"](n.hidden),o.panel.add&&(o.panel.splash&&c.find("."+n.panel+"__searchsplash").addClass(n.hidden),p.add(f).removeClass(n.hidden))}else p.add(f).removeClass(n.hidden),d.addClass(n.hidden),u.find("."+n.panel+"__noresultsmsg").addClass(n.hidden),o.panel.add&&(o.panel.splash?c.find("."+n.panel+"__searchsplash").removeClass(n.hidden):t.closest("."+n.panel+"_search").length||this.openPanel(this.$pnls.children("."+n.panel+"_opened-parent").last()));this.trigger("updateListview")}}(e),function(e){var t,n,i="mmenu",s="setSelected";e[i].addons[s]={setup:function(){var a=this,r=this.opts[s];if(this.conf[s],e[i].glbl,"boolean"==typeof r&&(r={hover:r,parent:r}),"object"!=typeof r&&(r={}),"detect"==(r=this.opts[s]=e.extend(!0,{},e[i].defaults[s],r)).current){var o=function(e){e=e.split("?")[0].split("#")[0];var t=a.$menu.find('a[href="'+e+'"], a[href="'+e+'/"]');t.length?a.setSelected(t.parent(),!0):(e=e.split("/").slice(0,-1)).length&&o(e.join("/"))};this.bind("initMenu:after",function(){o(window.location.href)})}else r.current||this.bind("initListview:after",function(e){e.find("."+t.listview).children("."+t.listitem+"_selected").removeClass(t.listitem+"_selected")});r.hover&&this.bind("initMenu:after",function(){this.$menu.addClass(t.menu+"_selected-hover")}),r.parent&&(this.bind("openPanel:finish",function(e){this.$pnls.find("."+t.listview).find("."+t.listitem+"_selected-parent").removeClass(t.listitem+"_selected-parent");for(var i=e.data(n.parent);i;)i.not("."+t.listitem+"_vertical").addClass(t.listitem+"_selected-parent"),i=i.closest("."+t.panel).data(n.parent)}),this.bind("initMenu:after",function(){this.$menu.addClass(t.menu+"_selected-parent")}))},add:function(){t=e[i]._c,n=e[i]._d,e[i]._e},clickAnchor:function(e,t){}},e[i].defaults[s]={current:!0,hover:!1,parent:!1}}(e),function(e){var t="mmenu",n="navbars";e[t].addons[n].prev=function(i,s){var a,r,o,l=e[t]._c,d=e('<a class="'+l.btn+" "+l.btn+"_prev "+l.navbar+'__btn" href="#" />').appendTo(i);this.bind("initNavbar:after",function(e){e.removeClass(l.panel+"_has-navbar")}),this.bind("openPanel:start",function(e){e.parent("."+l.listitem+"_vertical").length||((a=e.find("."+this.conf.classNames[n].panelPrev)).length||(a=e.children("."+l.navbar).children("."+l.btn+"_prev")),r=a.attr("href"),o=a.html(),r?d.attr("href",r):d.removeAttr("href"),d[r||o?"removeClass":"addClass"](l.hidden),d.html(o))}),this.bind("initNavbar:after:sr-aria",function(e){var t=e.children("."+l.navbar);this.__sr_aria(t,"hidden",!0)}),this.bind("openPanel:start:sr-aria",function(e){this.__sr_aria(d,"hidden",d.hasClass(l.hidden)),this.__sr_aria(d,"owns",(d.attr("href")||"").slice(1))})},e[t].configuration.classNames[n].panelPrev="Prev"}(e),function(e){var t="mmenu";e[t].addons.navbars.searchfield=function(n,i){var s=e[t]._c,a=e('<div class="'+s.searchfield+'" />').appendTo(n);"object"!=typeof this.opts.searchfield&&(this.opts.searchfield={}),this.opts.searchfield.add=!0,this.opts.searchfield.addTo=a}}(e),function(e){var t="mmenu",n="navbars";e[t].addons[n].tabs=function(i,s,a){var r=e[t]._c,o=e[t]._d,l=e[t]._e,d=this,c=i.children("a");i.addClass(r.navbar+"_tabs").parent().addClass(r.navbars+"_has-tabs"),c.on(l.click+"-"+n,function(t){t.preventDefault();var n=e(this);if(n.hasClass(r.navbar+"__tab_selected"))t.stopImmediatePropagation();else try{d.__openPanelWoAnimation(e(n.attr("href"))),t.stopImmediatePropagation()}catch(e){}}),this.bind("openPanel:start",function e(t){c.removeClass(r.navbar+"__tab_selected");var n=c.filter('[href="#'+t.attr("id")+'"]');if(n.length)n.addClass(r.navbar+"__tab_selected");else{var i=t.data(o.parent);i&&i.length&&e(i.closest("."+r.panel))}})}}(e),!0}),function(e){"use strict";e(window).load(function(){!function(){e("body").hasClass("admin-bar")&&e("html").addClass("html-mmenu"),e.mmenu.i18n({cancel:greenmart_settings.cancel});var t=e("#tbay-mobile-smartmenu"),n=t.data("themes"),i=Boolean(t.data("enablesearch")),s="",a="",r="";i&&(s=t.data("textsearch"),a=t.data("searchnoresults"),r=t.data("searchsplash"));var o=t.data("title"),l=Boolean(t.data("counters")),d=Boolean(t.data("enabletabs")),c="",h="",p="",f="";d&&(c=t.data("tabone"),h=t.data("taboneicon"),p=t.data("tabsecond"),f=t.data("tabsecondicon"));var u=Boolean(t.data("enablesocial")),_="",v="",m="";Boolean(t.data("enableeffects"))&&(v=t.data("effectspanels"),m=t.data("effectslistitems"));var g={offCanvas:!0,navbar:{title:o},counters:l,extensions:[n,v,m]},b={navbars:[],searchfield:{}};if(i&&(b.navbars.push({position:["top"],content:["searchfield"]}),b.searchfield={placeholder:s,noResults:a,panel:{add:!0,splash:r,title:greenmart_settings.search},showTextItems:!0,clear:!0}),d&&b.navbars.push({type:"tabs",content:['<a href="#main-mobile-menu-mmenu"><i class="'+h+'"></i> <span>'+c+"</span></a>",'<a href="#mobile-menu-second-mmenu"><i class="'+f+'"></i> <span>'+p+"</span></a>"]}),u){_=JSON.parse(t.data("socialjsons").replace(/'/g,'"'));var C=e.map(_,function(e,t){return`<a class="${e.icon}" href="${e.url}" target="_blank"></a>`});b.navbars.push({position:"bottom",content:C})}g=Object.assign(b,g),e("#tbay-mobile-menu-navbar").mmenu(g,{offCanvas:{pageSelector:"#wrapper-container"},searchfield:{clear:!0}})}()}),e(window).ready(function(){}),e(window).resize(function(){})}(jQuery);!function(a){a.extend(a.fn,{swapClass:function(a,e){var l=this.filter("."+a);return this.filter("."+e).removeClass(e).addClass(a),l.removeClass(a).addClass(e),this},replaceClass:function(a,e){return this.filter("."+a).removeClass(a).addClass(e).end()},hoverClass:function(e){return e=e||"hover",this.on("hover",function(){a(this).addClass(e)},function(){a(this).removeClass(e)})},heightToggle:function(a,e){a?this.animate({height:"toggle"},a,e):this.each(function(){jQuery(this)[jQuery(this).is(":hidden")?"show":"hide"](),e&&e.apply(this,arguments)})},heightHide:function(a,e){a?this.animate({height:"hide"},a,e):(this.hide(),e&&this.each(e))},prepareBranches:function(a){return a.prerendered||this.filter(":last-child:not(ul)").addClass(e.last),this.filter(":has(>ul),:has(>.dropdown-menu)")},applyClasses:function(l,s){this.filter(":has(>ul):not(:has(>a))").find(">span").on("click",function(e){s.apply(a(this).next())}).add(a("a",this)).hoverClass(),l.prerendered||(this.filter(":has(>ul:hidden),:has(>.dropdown-menu:hidden)").addClass(e.expandable).replaceClass(e.last,e.lastExpandable),this.not(":has(>ul:hidden),:has(>.dropdown-menu:hidden)").addClass(e.collapsable).replaceClass(e.last,e.lastCollapsable),this.prepend('<div class="'+e.hitarea+'"/>').find("div."+e.hitarea).each(function(){var e="";a.each(a(this).parent().attr("class").split(" "),function(){e+=this+"-hitarea "}),a(this).addClass(e)})),this.find("div."+e.hitarea).on("click",s)},treeview:function(l){if((l=a.extend({cookieId:"treeview"},l)).add)return this.trigger("add",[l.add]);if(l.toggle){var s=l.toggle;l.toggle=function(){return s.apply(a(this).parent()[0],arguments)}}function t(){a(this).parent().find(">.hitarea").swapClass(e.collapsableHitarea,e.expandableHitarea).swapClass(e.lastCollapsableHitarea,e.lastExpandableHitarea).end().swapClass(e.collapsable,e.expandable).swapClass(e.lastCollapsable,e.lastExpandable).find(">ul,>.dropdown-menu").heightToggle(l.animated,l.toggle),l.unique&&a(this).parent().siblings().find(">.hitarea").replaceClass(e.collapsableHitarea,e.expandableHitarea).replaceClass(e.lastCollapsableHitarea,e.lastExpandableHitarea).end().replaceClass(e.collapsable,e.expandable).replaceClass(e.lastCollapsable,e.lastExpandable).find(">ul,>.dropdown-menu").heightHide(l.animated,l.toggle)}this.addClass("treeview");var i=this.find("li").prepareBranches(l);switch(l.persist){case"cookie":var n=l.toggle;l.toggle=function(){var e;e=[],i.each(function(l,s){e[l]=a(s).is(":has(>ul:visible)")?1:0}),a.cookie(l.cookieId,e.join("")),n&&n.apply(this,arguments)},function(){var e=a.cookie(l.cookieId);if(e){var s=e.split("");i.each(function(e,l){a(l).find(">ul")[parseInt(s[e])?"show":"hide"]()})}}();break;case"location":var r=this.find("a").filter(function(){return this.href.toLowerCase()==location.href.toLowerCase()});r.length&&r.addClass("selected").parents("ul, li").add(r.next()).show()}return i.applyClasses(l,t),l.control&&(!function(l,s){function i(s){return function(){return t.apply(a("div."+e.hitarea,l).filter(function(){return!s||a(this).parent("."+s).length})),!1}}a("a:eq(0)",s).on("click",i(e.collapsable)),a("a:eq(1)",s).on("click",i(e.expandable)),a("a:eq(2)",s).on("click",i())}(this,l.control),a(l.control).show()),this.bind("add",function(s,i){a(i).prev().removeClass(e.last).removeClass(e.lastCollapsable).removeClass(e.lastExpandable).find(">.hitarea").removeClass(e.lastCollapsableHitarea).removeClass(e.lastExpandableHitarea),a(i).find("li").andSelf().prepareBranches(l).applyClasses(l,t)})}});var e=a.fn.treeview.classes={open:"open1",closed:"closed",expandable:"expandable",expandableHitarea:"expandable-hitarea",lastExpandableHitarea:"lastExpandable-hitarea",collapsable:"collapsable",collapsableHitarea:"collapsable-hitarea",lastCollapsableHitarea:"lastCollapsable-hitarea",lastCollapsable:"lastCollapsable",lastExpandable:"lastExpandable",last:"last",hitarea:"hitarea"};a.fn.Treeview=a.fn.treeview}(jQuery);if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");!function(t){"use strict";var e=t.fn.jquery.split(" ")[0].split(".");if(e[0]<2&&e[1]<9||1==e[0]&&9==e[1]&&e[2]<1)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher")}(jQuery),function(t){"use strict";t.fn.emulateTransitionEnd=function(e){var i=!1,o=this;t(this).one("bsTransitionEnd",function(){i=!0});return setTimeout(function(){i||t(o).trigger(t.support.transition.end)},e),this},t(function(){t.support.transition=function(){var t=document.createElement("bootstrap"),e={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var i in e)if(void 0!==t.style[i])return{end:e[i]};return!1}(),t.support.transition&&(t.event.special.bsTransitionEnd={bindType:t.support.transition.end,delegateType:t.support.transition.end,handle:function(e){return t(e.target).is(this)?e.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),function(t){"use strict";var e='[data-dismiss="alert"]',i=function(i){t(i).on("click",e,this.close)};i.VERSION="3.3.5",i.TRANSITION_DURATION=150,i.prototype.close=function(e){function o(){r.detach().trigger("closed.bs.alert").remove()}var n=t(this),s=n.attr("data-target");s||(s=(s=n.attr("href"))&&s.replace(/.*(?=#[^\s]*$)/,""));var r=t(s);e&&e.preventDefault(),r.length||(r=n.closest(".alert")),r.trigger(e=t.Event("close.bs.alert")),e.isDefaultPrevented()||(r.removeClass("in"),t.support.transition&&r.hasClass("fade")?r.one("bsTransitionEnd",o).emulateTransitionEnd(i.TRANSITION_DURATION):o())};var o=t.fn.alert;t.fn.alert=function(e){return this.each(function(){var o=t(this),n=o.data("bs.alert");n||o.data("bs.alert",n=new i(this)),"string"==typeof e&&n[e].call(o)})},t.fn.alert.Constructor=i,t.fn.alert.noConflict=function(){return t.fn.alert=o,this},t(document).on("click.bs.alert.data-api",e,i.prototype.close)}(jQuery),function(t){"use strict";function e(e){return this.each(function(){var o=t(this),n=o.data("bs.button"),s="object"==typeof e&&e;n||o.data("bs.button",n=new i(this,s)),"toggle"==e?n.toggle():e&&n.setState(e)})}var i=function(e,o){this.$element=t(e),this.options=t.extend({},i.DEFAULTS,o),this.isLoading=!1};i.VERSION="3.3.5",i.DEFAULTS={loadingText:"loading..."},i.prototype.setState=function(e){var i="disabled",o=this.$element,n=o.is("input")?"val":"html",s=o.data();e+="Text",null==s.resetText&&o.data("resetText",o[n]()),setTimeout(t.proxy(function(){o[n](null==s[e]?this.options[e]:s[e]),"loadingText"==e?(this.isLoading=!0,o.addClass(i).attr(i,i)):this.isLoading&&(this.isLoading=!1,o.removeClass(i).removeAttr(i))},this),0)},i.prototype.toggle=function(){var t=!0,e=this.$element.closest('[data-toggle="buttons"]');if(e.length){var i=this.$element.find("input");"radio"==i.prop("type")?(i.prop("checked")&&(t=!1),e.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==i.prop("type")&&(i.prop("checked")!==this.$element.hasClass("active")&&(t=!1),this.$element.toggleClass("active")),i.prop("checked",this.$element.hasClass("active")),t&&i.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var o=t.fn.button;t.fn.button=e,t.fn.button.Constructor=i,t.fn.button.noConflict=function(){return t.fn.button=o,this},t(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(i){var o=t(i.target);o.hasClass("btn")||(o=o.closest(".btn")),e.call(o,"toggle"),t(i.target).is('input[type="radio"]')||t(i.target).is('input[type="checkbox"]')||i.preventDefault()}).on("greenmart.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(e){t(e.target).closest(".btn").toggleClass("greenmart",/^greenmart(in)?$/.test(e.type))})}(jQuery),function(t){"use strict";function e(e){return this.each(function(){var o=t(this),n=o.data("bs.carousel"),s=t.extend({},i.DEFAULTS,o.data(),"object"==typeof e&&e),r="string"==typeof e?e:s.slide;n||o.data("bs.carousel",n=new i(this,s)),"number"==typeof e?n.to(e):r?n[r]():s.interval&&n.pause().cycle()})}var i=function(e,i){this.$element=t(e),this.$indicators=this.$element.find(".carousel-indicators"),this.options=i,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",t.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",t.proxy(this.pause,this)).on("mouseleave.bs.carousel",t.proxy(this.cycle,this))};i.VERSION="3.3.5",i.TRANSITION_DURATION=600,i.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},i.prototype.keydown=function(t){if(!/input|textarea/i.test(t.target.tagName)){switch(t.which){case 37:this.prev();break;case 39:this.next();break;default:return}t.preventDefault()}},i.prototype.cycle=function(e){return e||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(t.proxy(this.next,this),this.options.interval)),this},i.prototype.getItemIndex=function(t){return this.$items=t.parent().children(".item"),this.$items.index(t||this.$active)},i.prototype.getItemForDirection=function(t,e){var i=this.getItemIndex(e);if(("prev"==t&&0===i||"next"==t&&i==this.$items.length-1)&&!this.options.wrap)return e;var o=(i+("prev"==t?-1:1))%this.$items.length;return this.$items.eq(o)},i.prototype.to=function(t){var e=this,i=this.getItemIndex(this.$active=this.$element.find(".item.active"));return t>this.$items.length-1||0>t?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){e.to(t)}):i==t?this.pause().cycle():this.slide(t>i?"next":"prev",this.$items.eq(t))},i.prototype.pause=function(e){return e||(this.paused=!0),this.$element.find(".next, .prev").length&&t.support.transition&&(this.$element.trigger(t.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},i.prototype.next=function(){return this.sliding?void 0:this.slide("next")},i.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},i.prototype.slide=function(e,o){var n=this.$element.find(".item.active"),s=o||this.getItemForDirection(e,n),r=this.interval,a="next"==e?"left":"right",l=this;if(s.hasClass("active"))return this.sliding=!1;var h=s[0],d=t.Event("slide.bs.carousel",{relatedTarget:h,direction:a});if(this.$element.trigger(d),!d.isDefaultPrevented()){if(this.sliding=!0,r&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var p=t(this.$indicators.children()[this.getItemIndex(s)]);p&&p.addClass("active")}var c=t.Event("slid.bs.carousel",{relatedTarget:h,direction:a});return t.support.transition&&this.$element.hasClass("slide")?(s.addClass(e),s[0].offsetWidth,n.addClass(a),s.addClass(a),n.one("bsTransitionEnd",function(){s.removeClass([e,a].join(" ")).addClass("active"),n.removeClass(["active",a].join(" ")),l.sliding=!1,setTimeout(function(){l.$element.trigger(c)},0)}).emulateTransitionEnd(i.TRANSITION_DURATION)):(n.removeClass("active"),s.addClass("active"),this.sliding=!1,this.$element.trigger(c)),r&&this.cycle(),this}};var o=t.fn.carousel;t.fn.carousel=e,t.fn.carousel.Constructor=i,t.fn.carousel.noConflict=function(){return t.fn.carousel=o,this};var n=function(i){var o,n=t(this),s=t(n.attr("data-target")||(o=n.attr("href"))&&o.replace(/.*(?=#[^\s]+$)/,""));if(s.hasClass("carousel")){var r=t.extend({},s.data(),n.data()),a=n.attr("data-slide-to");a&&(r.interval=!1),e.call(s,r),a&&s.data("bs.carousel").to(a),i.preventDefault()}};t(document).on("click.bs.carousel.data-api","[data-slide]",n).on("click.bs.carousel.data-api","[data-slide-to]",n),t(window).on("load",function(){t('[data-ride="carousel"]').each(function(){var i=t(this);e.call(i,i.data())})})}(jQuery),function(t){"use strict";function e(e){var i,o=e.attr("data-target")||(i=e.attr("href"))&&i.replace(/.*(?=#[^\s]+$)/,"");return t(o)}function i(e){return this.each(function(){var i=t(this),n=i.data("bs.collapse"),s=t.extend({},o.DEFAULTS,i.data(),"object"==typeof e&&e);!n&&s.toggle&&/show|hide/.test(e)&&(s.toggle=!1),n||i.data("bs.collapse",n=new o(this,s)),"string"==typeof e&&n[e]()})}var o=function(e,i){this.$element=t(e),this.options=t.extend({},o.DEFAULTS,i),this.$trigger=t('[data-toggle="collapse"][href="#'+e.id+'"],[data-toggle="collapse"][data-target="#'+e.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};o.VERSION="3.3.5",o.TRANSITION_DURATION=350,o.DEFAULTS={toggle:!0},o.prototype.dimension=function(){return this.$element.hasClass("width")?"width":"height"},o.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var e,n=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(n&&n.length&&(e=n.data("bs.collapse"),e&&e.transitioning))){var s=t.Event("show.bs.collapse");if(this.$element.trigger(s),!s.isDefaultPrevented()){n&&n.length&&(i.call(n,"hide"),e||n.data("bs.collapse",null));var r=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[r](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var a=function(){this.$element.removeClass("collapsing").addClass("collapse in")[r](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!t.support.transition)return a.call(this);var l=t.camelCase(["scroll",r].join("-"));this.$element.one("bsTransitionEnd",t.proxy(a,this)).emulateTransitionEnd(o.TRANSITION_DURATION)[r](this.$element[0][l])}}}},o.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var e=t.Event("hide.bs.collapse");if(this.$element.trigger(e),!e.isDefaultPrevented()){var i=this.dimension();this.$element[i](this.$element[i]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var n=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return t.support.transition?void this.$element[i](0).one("bsTransitionEnd",t.proxy(n,this)).emulateTransitionEnd(o.TRANSITION_DURATION):n.call(this)}}},o.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},o.prototype.getParent=function(){return t(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(t.proxy(function(i,o){var n=t(o);this.addAriaAndCollapsedClass(e(n),n)},this)).end()},o.prototype.addAriaAndCollapsedClass=function(t,e){var i=t.hasClass("in");t.attr("aria-expanded",i),e.toggleClass("collapsed",!i).attr("aria-expanded",i)};var n=t.fn.collapse;t.fn.collapse=i,t.fn.collapse.Constructor=o,t.fn.collapse.noConflict=function(){return t.fn.collapse=n,this},t(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(o){var n=t(this);n.attr("data-target")||o.preventDefault();var s=e(n),r=s.data("bs.collapse")?"toggle":n.data();i.call(s,r)})}(jQuery),function(t){"use strict";function e(e){var i=e.attr("data-target");i||(i=(i=e.attr("href"))&&/#[A-Za-z]/.test(i)&&i.replace(/.*(?=#[^\s]*$)/,""));var o=i&&t(i);return o&&o.length?o:e.parent()}function i(i){i&&3===i.which||(t(o).remove(),t(n).each(function(){var o=t(this),n=e(o),s={relatedTarget:this};n.hasClass("open")&&(i&&"click"==i.type&&/input|textarea/i.test(i.target.tagName)&&t.contains(n[0],i.target)||(n.trigger(i=t.Event("hide.bs.dropdown",s)),i.isDefaultPrevented()||(o.attr("aria-expanded","false"),n.removeClass("open").trigger("hidden.bs.dropdown",s))))}))}var o=".dropdown-backdrop",n='[data-toggle="dropdown"]',s=function(e){t(e).on("click.bs.dropdown",this.toggle)};s.VERSION="3.3.5",s.prototype.toggle=function(o){var n=t(this);if(!n.is(".disabled, :disabled")){var s=e(n),r=s.hasClass("open");if(i(),!r){"ontouchstart"in document.documentElement&&!s.closest(".navbar-nav").length&&t(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(t(this)).on("click",i);var a={relatedTarget:this};if(s.trigger(o=t.Event("show.bs.dropdown",a)),o.isDefaultPrevented())return;n.trigger("greenmart").attr("aria-expanded","true"),s.toggleClass("open").trigger("shown.bs.dropdown",a)}return!1}},s.prototype.keydown=function(i){if(/(38|40|27|32)/.test(i.which)&&!/input|textarea/i.test(i.target.tagName)){var o=t(this);if(i.preventDefault(),i.stopPropagation(),!o.is(".disabled, :disabled")){var s=e(o),r=s.hasClass("open");if(!r&&27!=i.which||r&&27==i.which)return 27==i.which&&s.find(n).trigger("greenmart"),o.trigger("click");var a=s.find(".dropdown-menu li:not(.disabled):visible a");if(a.length){var l=a.index(i.target);38==i.which&&l>0&&l--,40==i.which&&l<a.length-1&&l++,~l||(l=0),a.eq(l).trigger("greenmart")}}}};var r=t.fn.dropdown;t.fn.dropdown=function(e){return this.each(function(){var i=t(this),o=i.data("bs.dropdown");o||i.data("bs.dropdown",o=new s(this)),"string"==typeof e&&o[e].call(i)})},t.fn.dropdown.Constructor=s,t.fn.dropdown.noConflict=function(){return t.fn.dropdown=r,this},t(document).on("click.bs.dropdown.data-api",i).on("click.bs.dropdown.data-api",".dropdown form",function(t){t.stopPropagation()}).on("click.bs.dropdown.data-api",n,s.prototype.toggle).on("keydown.bs.dropdown.data-api",n,s.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",s.prototype.keydown)}(jQuery),function(t){"use strict";function e(e,o){return this.each(function(){var n=t(this),s=n.data("bs.modal"),r=t.extend({},i.DEFAULTS,n.data(),"object"==typeof e&&e);s||n.data("bs.modal",s=new i(this,r)),"string"==typeof e?s[e](o):r.show&&s.show(o)})}var i=function(e,i){this.options=i,this.$body=t(document.body),this.$element=t(e),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,t.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};i.VERSION="3.3.5",i.TRANSITION_DURATION=300,i.BACKDROP_TRANSITION_DURATION=150,i.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},i.prototype.toggle=function(t){return this.isShown?this.hide():this.show(t)},i.prototype.show=function(e){var o=this,n=t.Event("show.bs.modal",{relatedTarget:e});this.$element.trigger(n),this.isShown||n.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',t.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){o.$element.one("mouseup.dismiss.bs.modal",function(e){t(e.target).is(o.$element)&&(o.ignoreBackdropClick=!0)})}),this.backdrop(function(){var n=t.support.transition&&o.$element.hasClass("fade");o.$element.parent().length||o.$element.appendTo(o.$body),o.$element.show().scrollTop(0),o.adjustDialog(),n&&o.$element[0].offsetWidth,o.$element.addClass("in"),o.enforcegreenmart();var s=t.Event("shown.bs.modal",{relatedTarget:e});n?o.$dialog.one("bsTransitionEnd",function(){o.$element.trigger("greenmart").trigger(s)}).emulateTransitionEnd(i.TRANSITION_DURATION):o.$element.trigger("greenmart").trigger(s)}))},i.prototype.hide=function(e){e&&e.preventDefault(),e=t.Event("hide.bs.modal"),this.$element.trigger(e),this.isShown&&!e.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),t(document).off("greenmartin.bs.modal"),this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),t.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",t.proxy(this.hideModal,this)).emulateTransitionEnd(i.TRANSITION_DURATION):this.hideModal())},i.prototype.enforcegreenmart=function(){t(document).off("greenmartin.bs.modal").on("greenmartin.bs.modal",t.proxy(function(t){this.$element[0]===t.target||this.$element.has(t.target).length||this.$element.trigger("greenmart")},this))},i.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",t.proxy(function(t){27==t.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},i.prototype.resize=function(){this.isShown?t(window).on("resize.bs.modal",t.proxy(this.handleUpdate,this)):t(window).off("resize.bs.modal")},i.prototype.hideModal=function(){var t=this;this.$element.hide(),this.backdrop(function(){t.$body.removeClass("modal-open"),t.resetAdjustments(),t.resetScrollbar(),t.$element.trigger("hidden.bs.modal")})},i.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},i.prototype.backdrop=function(e){var o=this,n=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var s=t.support.transition&&n;if(this.$backdrop=t(document.createElement("div")).addClass("modal-backdrop "+n).appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",t.proxy(function(t){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(t.target===t.currentTarget&&("static"==this.options.backdrop?this.$element[0].greenmart():this.hide()))},this)),s&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!e)return;s?this.$backdrop.one("bsTransitionEnd",e).emulateTransitionEnd(i.BACKDROP_TRANSITION_DURATION):e()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var r=function(){o.removeBackdrop(),e&&e()};t.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",r).emulateTransitionEnd(i.BACKDROP_TRANSITION_DURATION):r()}else e&&e()},i.prototype.handleUpdate=function(){this.adjustDialog()},i.prototype.adjustDialog=function(){var t=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&t?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!t?this.scrollbarWidth:""})},i.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},i.prototype.checkScrollbar=function(){var t=window.innerWidth;if(!t){var e=document.documentElement.getBoundingClientRect();t=e.right-Math.abs(e.left)}this.bodyIsOverflowing=document.body.clientWidth<t,this.scrollbarWidth=this.measureScrollbar()},i.prototype.setScrollbar=function(){var t=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",t+this.scrollbarWidth)},i.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},i.prototype.measureScrollbar=function(){var t=document.createElement("div");t.className="modal-scrollbar-measure",this.$body.append(t);var e=t.offsetWidth-t.clientWidth;return this.$body[0].removeChild(t),e};var o=t.fn.modal;t.fn.modal=e,t.fn.modal.Constructor=i,t.fn.modal.noConflict=function(){return t.fn.modal=o,this},t(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(i){var o=t(this),n=o.attr("href"),s=t(o.attr("data-target")||n&&n.replace(/.*(?=#[^\s]+$)/,"")),r=s.data("bs.modal")?"toggle":t.extend({remote:!/#/.test(n)&&n},s.data(),o.data());o.is("a")&&i.preventDefault(),s.one("show.bs.modal",function(t){t.isDefaultPrevented()||s.one("hidden.bs.modal",function(){o.is(":visible")&&o.trigger("greenmart")})}),e.call(s,r,this)})}(jQuery),function(t){"use strict";var e=function(t,e){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",t,e)};e.VERSION="3.3.5",e.TRANSITION_DURATION=150,e.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover greenmart",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},e.prototype.init=function(e,i,o){if(this.enabled=!0,this.type=e,this.$element=t(i),this.options=this.getOptions(o),this.$viewport=this.options.viewport&&t(t.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,greenmart:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var n=this.options.trigger.split(" "),s=n.length;s--;){var r=n[s];if("click"==r)this.$element.on("click."+this.type,this.options.selector,t.proxy(this.toggle,this));else if("manual"!=r){var a="hover"==r?"mouseenter":"greenmartin",l="hover"==r?"mouseleave":"greenmartout";this.$element.on(a+"."+this.type,this.options.selector,t.proxy(this.enter,this)),this.$element.on(l+"."+this.type,this.options.selector,t.proxy(this.leave,this))}}this.options.selector?this._options=t.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.getOptions=function(e){return(e=t.extend({},this.getDefaults(),this.$element.data(),e)).delay&&"number"==typeof e.delay&&(e.delay={show:e.delay,hide:e.delay}),e},e.prototype.getDelegateOptions=function(){var e={},i=this.getDefaults();return this._options&&t.each(this._options,function(t,o){i[t]!=o&&(e[t]=o)}),e},e.prototype.enter=function(e){var i=e instanceof this.constructor?e:t(e.currentTarget).data("bs."+this.type);return i||(i=new this.constructor(e.currentTarget,this.getDelegateOptions()),t(e.currentTarget).data("bs."+this.type,i)),e instanceof t.Event&&(i.inState["greenmartin"==e.type?"greenmart":"hover"]=!0),i.tip().hasClass("in")||"in"==i.hoverState?void(i.hoverState="in"):(clearTimeout(i.timeout),i.hoverState="in",i.options.delay&&i.options.delay.show?void(i.timeout=setTimeout(function(){"in"==i.hoverState&&i.show()},i.options.delay.show)):i.show())},e.prototype.isInStateTrue=function(){for(var t in this.inState)if(this.inState[t])return!0;return!1},e.prototype.leave=function(e){var i=e instanceof this.constructor?e:t(e.currentTarget).data("bs."+this.type);return i||(i=new this.constructor(e.currentTarget,this.getDelegateOptions()),t(e.currentTarget).data("bs."+this.type,i)),e instanceof t.Event&&(i.inState["greenmartout"==e.type?"greenmart":"hover"]=!1),i.isInStateTrue()?void 0:(clearTimeout(i.timeout),i.hoverState="out",i.options.delay&&i.options.delay.hide?void(i.timeout=setTimeout(function(){"out"==i.hoverState&&i.hide()},i.options.delay.hide)):i.hide())},e.prototype.show=function(){var i=t.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(i);var o=t.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(i.isDefaultPrevented()||!o)return;var n=this,s=this.tip(),r=this.getUID(this.type);this.setContent(),s.attr("id",r),this.$element.attr("aria-describedby",r),this.options.animation&&s.addClass("fade");var a="function"==typeof this.options.placement?this.options.placement.call(this,s[0],this.$element[0]):this.options.placement,l=/\s?auto?\s?/i,h=l.test(a);h&&(a=a.replace(l,"")||"top"),s.detach().css({top:0,left:0,display:"block"}).addClass(a).data("bs."+this.type,this),this.options.container?s.appendTo(this.options.container):s.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var d=this.getPosition(),p=s[0].offsetWidth,c=s[0].offsetHeight;if(h){var f=a,u=this.getPosition(this.$viewport);a="bottom"==a&&d.bottom+c>u.bottom?"top":"top"==a&&d.top-c<u.top?"bottom":"right"==a&&d.right+p>u.width?"left":"left"==a&&d.left-p<u.left?"right":a,s.removeClass(f).addClass(a)}var g=this.getCalculatedOffset(a,d,p,c);this.applyPlacement(g,a);var m=function(){var t=n.hoverState;n.$element.trigger("shown.bs."+n.type),n.hoverState=null,"out"==t&&n.leave(n)};t.support.transition&&this.$tip.hasClass("fade")?s.one("bsTransitionEnd",m).emulateTransitionEnd(e.TRANSITION_DURATION):m()}},e.prototype.applyPlacement=function(e,i){var o=this.tip(),n=o[0].offsetWidth,s=o[0].offsetHeight,r=parseInt(o.css("margin-top"),10),a=parseInt(o.css("margin-left"),10);isNaN(r)&&(r=0),isNaN(a)&&(a=0),e.top+=r,e.left+=a,t.offset.setOffset(o[0],t.extend({using:function(t){o.css({top:Math.round(t.top),left:Math.round(t.left)})}},e),0),o.addClass("in");var l=o[0].offsetWidth,h=o[0].offsetHeight;"top"==i&&h!=s&&(e.top=e.top+s-h);var d=this.getViewportAdjustedDelta(i,e,l,h);d.left?e.left+=d.left:e.top+=d.top;var p=/top|bottom/.test(i),c=p?2*d.left-n+l:2*d.top-s+h,f=p?"offsetWidth":"offsetHeight";o.offset(e),this.replaceArrow(c,o[0][f],p)},e.prototype.replaceArrow=function(t,e,i){this.arrow().css(i?"left":"top",50*(1-t/e)+"%").css(i?"top":"left","")},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle();t.find(".tooltip-inner")[this.options.html?"html":"text"](e),t.removeClass("fade in top bottom left right")},e.prototype.hide=function(i){function o(){"in"!=n.hoverState&&s.detach(),n.$element.removeAttr("aria-describedby").trigger("hidden.bs."+n.type),i&&i()}var n=this,s=t(this.$tip),r=t.Event("hide.bs."+this.type);return this.$element.trigger(r),r.isDefaultPrevented()?void 0:(s.removeClass("in"),t.support.transition&&s.hasClass("fade")?s.one("bsTransitionEnd",o).emulateTransitionEnd(e.TRANSITION_DURATION):o(),this.hoverState=null,this)},e.prototype.fixTitle=function(){var t=this.$element;(t.attr("title")||"string"!=typeof t.attr("data-original-title"))&&t.attr("data-original-title",t.attr("title")||"").attr("title","")},e.prototype.hasContent=function(){return this.getTitle()},e.prototype.getPosition=function(e){var i=(e=e||this.$element)[0],o="BODY"==i.tagName,n=i.getBoundingClientRect();null==n.width&&(n=t.extend({},n,{width:n.right-n.left,height:n.bottom-n.top}));var s=o?{top:0,left:0}:e.offset(),r={scroll:o?document.documentElement.scrollTop||document.body.scrollTop:e.scrollTop()},a=o?{width:t(window).width(),height:t(window).height()}:null;return t.extend({},n,r,a,s)},e.prototype.getCalculatedOffset=function(t,e,i,o){return"bottom"==t?{top:e.top+e.height,left:e.left+e.width/2-i/2}:"top"==t?{top:e.top-o,left:e.left+e.width/2-i/2}:"left"==t?{top:e.top+e.height/2-o/2,left:e.left-i}:{top:e.top+e.height/2-o/2,left:e.left+e.width}},e.prototype.getViewportAdjustedDelta=function(t,e,i,o){var n={top:0,left:0};if(!this.$viewport)return n;var s=this.options.viewport&&this.options.viewport.padding||0,r=this.getPosition(this.$viewport);if(/right|left/.test(t)){var a=e.top-s-r.scroll,l=e.top+s-r.scroll+o;a<r.top?n.top=r.top-a:l>r.top+r.height&&(n.top=r.top+r.height-l)}else{var h=e.left-s,d=e.left+s+i;h<r.left?n.left=r.left-h:d>r.right&&(n.left=r.left+r.width-d)}return n},e.prototype.getTitle=function(){var t=this.$element,e=this.options;return t.attr("data-original-title")||("function"==typeof e.title?e.title.call(t[0]):e.title)},e.prototype.getUID=function(t){do{t+=~~(1e6*Math.random())}while(document.getElementById(t));return t},e.prototype.tip=function(){if(!this.$tip&&(this.$tip=t(this.options.template),1!=this.$tip.length))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},e.prototype.enable=function(){this.enabled=!0},e.prototype.disable=function(){this.enabled=!1},e.prototype.toggleEnabled=function(){this.enabled=!this.enabled},e.prototype.toggle=function(e){var i=this;e&&((i=t(e.currentTarget).data("bs."+this.type))||(i=new this.constructor(e.currentTarget,this.getDelegateOptions()),t(e.currentTarget).data("bs."+this.type,i))),e?(i.inState.click=!i.inState.click,i.isInStateTrue()?i.enter(i):i.leave(i)):i.tip().hasClass("in")?i.leave(i):i.enter(i)},e.prototype.destroy=function(){var t=this;clearTimeout(this.timeout),this.hide(function(){t.$element.off("."+t.type).removeData("bs."+t.type),t.$tip&&t.$tip.detach(),t.$tip=null,t.$arrow=null,t.$viewport=null})};var i=t.fn.tooltip;t.fn.tooltip=function(i){return this.each(function(){var o=t(this),n=o.data("bs.tooltip"),s="object"==typeof i&&i;(n||!/destroy|hide/.test(i))&&(n||o.data("bs.tooltip",n=new e(this,s)),"string"==typeof i&&n[i]())})},t.fn.tooltip.Constructor=e,t.fn.tooltip.noConflict=function(){return t.fn.tooltip=i,this}}(jQuery),function(t){"use strict";var e=function(t,e){this.init("popover",t,e)};if(!t.fn.tooltip)throw new Error("Popover requires tooltip.js");e.VERSION="3.3.5",e.DEFAULTS=t.extend({},t.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),e.prototype=t.extend({},t.fn.tooltip.Constructor.prototype),e.prototype.constructor=e,e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle(),i=this.getContent();t.find(".popover-title")[this.options.html?"html":"text"](e),t.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof i?"html":"append":"text"](i),t.removeClass("fade top bottom left right in"),t.find(".popover-title").html()||t.find(".popover-title").hide()},e.prototype.hasContent=function(){return this.getTitle()||this.getContent()},e.prototype.getContent=function(){var t=this.$element,e=this.options;return t.attr("data-content")||("function"==typeof e.content?e.content.call(t[0]):e.content)},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var i=t.fn.popover;t.fn.popover=function(i){return this.each(function(){var o=t(this),n=o.data("bs.popover"),s="object"==typeof i&&i;(n||!/destroy|hide/.test(i))&&(n||o.data("bs.popover",n=new e(this,s)),"string"==typeof i&&n[i]())})},t.fn.popover.Constructor=e,t.fn.popover.noConflict=function(){return t.fn.popover=i,this}}(jQuery),function(t){"use strict";function e(i,o){this.$body=t(document.body),this.$scrollElement=t(t(i).is(document.body)?window:i),this.options=t.extend({},e.DEFAULTS,o),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",t.proxy(this.process,this)),this.refresh(),this.process()}function i(i){return this.each(function(){var o=t(this),n=o.data("bs.scrollspy"),s="object"==typeof i&&i;n||o.data("bs.scrollspy",n=new e(this,s)),"string"==typeof i&&n[i]()})}e.VERSION="3.3.5",e.DEFAULTS={offset:10},e.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},e.prototype.refresh=function(){var e=this,i="offset",o=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),t.isWindow(this.$scrollElement[0])||(i="position",o=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var e=t(this),n=e.data("target")||e.attr("href"),s=/^#./.test(n)&&t(n);return s&&s.length&&s.is(":visible")&&[[s[i]().top+o,n]]||null}).sort(function(t,e){return t[0]-e[0]}).each(function(){e.offsets.push(this[0]),e.targets.push(this[1])})},e.prototype.process=function(){var t,e=this.$scrollElement.scrollTop()+this.options.offset,i=this.getScrollHeight(),o=this.options.offset+i-this.$scrollElement.height(),n=this.offsets,s=this.targets,r=this.activeTarget;if(this.scrollHeight!=i&&this.refresh(),e>=o)return r!=(t=s[s.length-1])&&this.activate(t);if(r&&e<n[0])return this.activeTarget=null,this.clear();for(t=n.length;t--;)r!=s[t]&&e>=n[t]&&(void 0===n[t+1]||e<n[t+1])&&this.activate(s[t])},e.prototype.activate=function(e){this.activeTarget=e,this.clear();var i=this.selector+'[data-target="'+e+'"],'+this.selector+'[href="'+e+'"]',o=t(i).parents("li").addClass("active");o.parent(".dropdown-menu").length&&(o=o.closest("li.dropdown").addClass("active")),o.trigger("activate.bs.scrollspy")},e.prototype.clear=function(){t(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var o=t.fn.scrollspy;t.fn.scrollspy=i,t.fn.scrollspy.Constructor=e,t.fn.scrollspy.noConflict=function(){return t.fn.scrollspy=o,this},t(window).on("load.bs.scrollspy.data-api",function(){t('[data-spy="scroll"]').each(function(){var e=t(this);i.call(e,e.data())})})}(jQuery),function(t){"use strict";function e(e){return this.each(function(){var o=t(this),n=o.data("bs.tab");n||o.data("bs.tab",n=new i(this)),"string"==typeof e&&n[e]()})}var i=function(e){this.element=t(e)};i.VERSION="3.3.5",i.TRANSITION_DURATION=150,i.prototype.show=function(){var e=this.element,i=e.closest("ul:not(.dropdown-menu)"),o=e.data("target");if(o||(o=(o=e.attr("href"))&&o.replace(/.*(?=#[^\s]*$)/,"")),!e.parent("li").hasClass("active")){var n=i.find(".active:last a"),s=t.Event("hide.bs.tab",{relatedTarget:e[0]}),r=t.Event("show.bs.tab",{relatedTarget:n[0]});if(n.trigger(s),e.trigger(r),!r.isDefaultPrevented()&&!s.isDefaultPrevented()){var a=t(o);this.activate(e.closest("li"),i),this.activate(a,a.parent(),function(){n.trigger({type:"hidden.bs.tab",relatedTarget:e[0]}),e.trigger({type:"shown.bs.tab",relatedTarget:n[0]})})}}},i.prototype.activate=function(e,o,n){function s(){r.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),e.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),a?(e[0].offsetWidth,e.addClass("in")):e.removeClass("fade"),e.parent(".dropdown-menu").length&&e.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),n&&n()}var r=o.find("> .active"),a=n&&t.support.transition&&(r.length&&r.hasClass("fade")||!!o.find("> .fade").length);r.length&&a?r.one("bsTransitionEnd",s).emulateTransitionEnd(i.TRANSITION_DURATION):s(),r.removeClass("in")};var o=t.fn.tab;t.fn.tab=e,t.fn.tab.Constructor=i,t.fn.tab.noConflict=function(){return t.fn.tab=o,this};var n=function(i){i.preventDefault(),e.call(t(this),"show")};t(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',n).on("click.bs.tab.data-api",'[data-toggle="pill"]',n)}(jQuery),function(t){"use strict";function e(e){return this.each(function(){var o=t(this),n=o.data("bs.affix"),s="object"==typeof e&&e;n||o.data("bs.affix",n=new i(this,s)),"string"==typeof e&&n[e]()})}var i=function(e,o){this.options=t.extend({},i.DEFAULTS,o),this.$target=t(this.options.target).on("scroll.bs.affix.data-api",t.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",t.proxy(this.checkPositionWithEventLoop,this)),this.$element=t(e),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};i.VERSION="3.3.5",i.RESET="affix affix-top affix-bottom",i.DEFAULTS={offset:0,target:window},i.prototype.getState=function(t,e,i,o){var n=this.$target.scrollTop(),s=this.$element.offset(),r=this.$target.height();if(null!=i&&"top"==this.affixed)return i>n&&"top";if("bottom"==this.affixed)return null!=i?!(n+this.unpin<=s.top)&&"bottom":!(t-o>=n+r)&&"bottom";var a=null==this.affixed,l=a?n:s.top;return null!=i&&i>=n?"top":null!=o&&l+(a?r:e)>=t-o&&"bottom"},i.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(i.RESET).addClass("affix");var t=this.$target.scrollTop(),e=this.$element.offset();return this.pinnedOffset=e.top-t},i.prototype.checkPositionWithEventLoop=function(){setTimeout(t.proxy(this.checkPosition,this),1)},i.prototype.checkPosition=function(){if(this.$element.is(":visible")){var e=this.$element.height(),o=this.options.offset,n=o.top,s=o.bottom,r=Math.max(t(document).height(),t(document.body).height());"object"!=typeof o&&(s=n=o),"function"==typeof n&&(n=o.top(this.$element)),"function"==typeof s&&(s=o.bottom(this.$element));var a=this.getState(r,e,n,s);if(this.affixed!=a){null!=this.unpin&&this.$element.css("top","");var l="affix"+(a?"-"+a:""),h=t.Event(l+".bs.affix");if(this.$element.trigger(h),h.isDefaultPrevented())return;this.affixed=a,this.unpin="bottom"==a?this.getPinnedOffset():null,this.$element.removeClass(i.RESET).addClass(l).trigger(l.replace("affix","affixed")+".bs.affix")}"bottom"==a&&this.$element.offset({top:r-e-s})}};var o=t.fn.affix;t.fn.affix=e,t.fn.affix.Constructor=i,t.fn.affix.noConflict=function(){return t.fn.affix=o,this},t(window).on("load",function(){t('[data-spy="affix"]').each(function(){var i=t(this),o=i.data();o.offset=o.offset||{},null!=o.offsetBottom&&(o.offset.bottom=o.offsetBottom),null!=o.offsetTop&&(o.offset.top=o.offsetTop),e.call(i,o)})})}(jQuery);/*!
 * WPBakery Page Builder v6.0.0 (https://wpbakery.com)
 * Copyright 2011-2019 Michael M, WPBakery
 * License: Commercial. More details: http://go.wpbakery.com/licensing
 */

// jscs:disable
// jshint ignore: start

document.documentElement.className+=" js_active ",document.documentElement.className+="ontouchstart"in document.documentElement?" vc_mobile ":" vc_desktop ",function(){for(var prefix=["-webkit-","-moz-","-ms-","-o-",""],i=0;i<prefix.length;i++)prefix[i]+"transform"in document.documentElement.style&&(document.documentElement.className+=" vc_transform ")}(),function($){"function"!=typeof window.vc_js&&(window.vc_js=function(){"use strict";vc_toggleBehaviour(),vc_tabsBehaviour(),vc_accordionBehaviour(),vc_teaserGrid(),vc_carouselBehaviour(),vc_slidersBehaviour(),vc_prettyPhoto(),vc_pinterest(),vc_progress_bar(),vc_plugin_flexslider(),vc_gridBehaviour(),vc_rowBehaviour(),vc_prepareHoverBox(),vc_googleMapsPointer(),vc_ttaActivation(),jQuery(document).trigger("vc_js"),window.setTimeout(vc_waypoints,500)}),"function"!=typeof window.vc_plugin_flexslider&&(window.vc_plugin_flexslider=function($parent){($parent?$parent.find(".wpb_flexslider"):jQuery(".wpb_flexslider")).each(function(){var this_element=jQuery(this),sliderTimeout=1e3*parseInt(this_element.attr("data-interval"),10),sliderFx=this_element.attr("data-flex_fx"),slideshow=!0;0===sliderTimeout&&(slideshow=!1),this_element.is(":visible")&&this_element.flexslider({animation:sliderFx,slideshow:slideshow,slideshowSpeed:sliderTimeout,sliderSpeed:800,smoothHeight:!0})})}),"function"!=typeof window.vc_googleplus&&(window.vc_googleplus=function(){0<jQuery(".wpb_googleplus").length&&function(){var po=document.createElement("script");po.type="text/javascript",po.async=!0,po.src="https://apis.google.com/js/plusone.js";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(po,s)}()}),"function"!=typeof window.vc_pinterest&&(window.vc_pinterest=function(){0<jQuery(".wpb_pinterest").length&&function(){var po=document.createElement("script");po.type="text/javascript",po.async=!0,po.src="https://assets.pinterest.com/js/pinit.js";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(po,s)}()}),"function"!=typeof window.vc_progress_bar&&(window.vc_progress_bar=function(){void 0!==jQuery.fn.vcwaypoint&&jQuery(".vc_progress_bar").each(function(){var $el=jQuery(this);$el.vcwaypoint(function(){$el.find(".vc_single_bar").each(function(index){var bar=jQuery(this).find(".vc_bar"),val=bar.data("percentage-value");setTimeout(function(){bar.css({width:val+"%"})},200*index)})},{offset:"85%"})})}),"function"!=typeof window.vc_waypoints&&(window.vc_waypoints=function(){void 0!==jQuery.fn.vcwaypoint&&jQuery(".wpb_animate_when_almost_visible:not(.wpb_start_animation)").each(function(){var $el=jQuery(this);$el.vcwaypoint(function(){$el.addClass("wpb_start_animation animated")},{offset:"85%"})})}),"function"!=typeof window.vc_toggleBehaviour&&(window.vc_toggleBehaviour=function($el){function event(e){e&&e.preventDefault&&e.preventDefault();var element=jQuery(this).closest(".vc_toggle"),content=element.find(".vc_toggle_content");element.hasClass("vc_toggle_active")?content.slideUp({duration:300,complete:function(){element.removeClass("vc_toggle_active")}}):content.slideDown({duration:300,complete:function(){element.addClass("vc_toggle_active")}})}$el?$el.hasClass("vc_toggle_title")?$el.unbind("click").on("click",event):$el.find(".vc_toggle_title").off("click").on("click",event):jQuery(".vc_toggle_title").off("click").on("click",event)}),"function"!=typeof window.vc_tabsBehaviour&&(window.vc_tabsBehaviour=function($tab){if(jQuery.ui){var $call=$tab||jQuery(".wpb_tabs, .wpb_tour"),ver=jQuery.ui&&jQuery.ui.version?jQuery.ui.version.split("."):"1.10",old_version=1===parseInt(ver[0],10)&&parseInt(ver[1],10)<9;$call.each(function(index){var $tabs,interval=jQuery(this).attr("data-interval"),tabs_array=[];if($tabs=jQuery(this).find(".wpb_tour_tabs_wrapper").tabs({show:function(event,ui){wpb_prepare_tab_content(event,ui)},activate:function(event,ui){wpb_prepare_tab_content(event,ui)}}),interval&&0<interval)try{$tabs.tabs("rotate",1e3*interval)}catch(err){window.console&&window.console.warn&&console.warn("tabs behaviours error",err)}jQuery(this).find(".wpb_tab").each(function(){tabs_array.push(this.id)}),jQuery(this).find(".wpb_tabs_nav li").on("click",function(e){return e&&e.preventDefault&&e.preventDefault(),old_version?$tabs.tabs("select",jQuery("a",this).attr("href")):$tabs.tabs("option","active",jQuery(this).index()),!1}),jQuery(this).find(".wpb_prev_slide a, .wpb_next_slide a").on("click",function(e){var index,length;e&&e.preventDefault&&e.preventDefault(),old_version?(index=$tabs.tabs("option","selected"),jQuery(this).parent().hasClass("wpb_next_slide")?index++:index--,index<0?index=$tabs.tabs("length")-1:index>=$tabs.tabs("length")&&(index=0),$tabs.tabs("select",index)):(index=$tabs.tabs("option","active"),length=$tabs.find(".wpb_tab").length,index=jQuery(this).parent().hasClass("wpb_next_slide")?length<=index+1?0:index+1:index-1<0?length-1:index-1,$tabs.tabs("option","active",index))})})}}),"function"!=typeof window.vc_accordionBehaviour&&(window.vc_accordionBehaviour=function(){jQuery(".wpb_accordion").each(function(index){var $tabs,active_tab,collapsible,$this=jQuery(this);$this.attr("data-interval"),collapsible=!1===(active_tab=!isNaN(jQuery(this).data("active-tab"))&&0<parseInt($this.data("active-tab"),10)&&parseInt($this.data("active-tab"),10)-1)||"yes"===$this.data("collapsible"),$tabs=$this.find(".wpb_accordion_wrapper").accordion({header:"> div > h3",autoHeight:!1,heightStyle:"content",active:active_tab,collapsible:collapsible,navigation:!0,activate:vc_accordionActivate,change:function(event,ui){void 0!==jQuery.fn.isotope&&ui.newContent.find(".isotope").isotope("layout"),vc_carouselBehaviour(ui.newPanel)}}),!0===$this.data("vcDisableKeydown")&&($tabs.data("uiAccordion")._keydown=function(){})})}),"function"!=typeof window.vc_teaserGrid&&(window.vc_teaserGrid=function(){var layout_modes={fitrows:"fitRows",masonry:"masonry"};jQuery(".wpb_grid .teaser_grid_container:not(.wpb_carousel), .wpb_filtered_grid .teaser_grid_container:not(.wpb_carousel)").each(function(){var $container=jQuery(this),$thumbs=$container.find(".wpb_thumbnails"),layout_mode=$thumbs.attr("data-layout-mode");$thumbs.isotope({itemSelector:".isotope-item",layoutMode:void 0===layout_modes[layout_mode]?"fitRows":layout_modes[layout_mode]}),$container.find(".categories_filter a").data("isotope",$thumbs).on("click",function(e){e&&e.preventDefault&&e.preventDefault();var $thumbs=jQuery(this).data("isotope");jQuery(this).parent().parent().find(".active").removeClass("active"),jQuery(this).parent().addClass("active"),$thumbs.isotope({filter:jQuery(this).attr("data-filter")})}),jQuery(window).bind("load resize",function(){$thumbs.isotope("layout")})})}),"function"!=typeof window.vc_carouselBehaviour&&(window.vc_carouselBehaviour=function($parent){($parent?$parent.find(".wpb_carousel"):jQuery(".wpb_carousel")).each(function(){var $this=jQuery(this);if(!0!==$this.data("carousel_enabled")&&$this.is(":visible")){$this.data("carousel_enabled",!0);getColumnsCount(jQuery(this));jQuery(this).hasClass("columns_count_1")&&900;var carousel_li=jQuery(this).find(".wpb_thumbnails-fluid li");carousel_li.css({"margin-right":carousel_li.css("margin-left"),"margin-left":0});var fluid_ul=jQuery(this).find("ul.wpb_thumbnails-fluid");fluid_ul.width(fluid_ul.width()+300),jQuery(window).on("resize",function(){screen_size!=(screen_size=getSizeName())&&window.setTimeout(function(){location.reload()},20)})}})}),"function"!=typeof window.vc_slidersBehaviour&&(window.vc_slidersBehaviour=function(){jQuery(".wpb_gallery_slides").each(function(index){var $imagesGrid,this_element=jQuery(this);if(this_element.hasClass("wpb_slider_nivo")){var sliderTimeout=1e3*this_element.attr("data-interval");0===sliderTimeout&&(sliderTimeout=9999999999),this_element.find(".nivoSlider").nivoSlider({effect:"boxRainGrow,boxRain,boxRainReverse,boxRainGrowReverse",slices:15,boxCols:8,boxRows:4,animSpeed:800,pauseTime:sliderTimeout,startSlide:0,directionNav:!0,directionNavHide:!0,controlNav:!0,keyboardNav:!1,pauseOnHover:!0,manualAdvance:!1,prevText:"Prev",nextText:"Next"})}else this_element.hasClass("wpb_image_grid")&&(jQuery.fn.imagesLoaded?$imagesGrid=this_element.find(".wpb_image_grid_ul").imagesLoaded(function(){$imagesGrid.isotope({itemSelector:".isotope-item",layoutMode:"fitRows"})}):this_element.find(".wpb_image_grid_ul").isotope({itemSelector:".isotope-item",layoutMode:"fitRows"}))})}),"function"!=typeof window.vc_prettyPhoto&&(window.vc_prettyPhoto=function(){try{jQuery&&jQuery.fn&&jQuery.fn.prettyPhoto&&jQuery('a.prettyphoto, .gallery-icon a[href*=".jpg"]').prettyPhoto({animationSpeed:"normal",hook:"data-rel",padding:15,opacity:.7,showTitle:!0,allowresize:!0,counter_separator_label:"/",hideflash:!1,deeplinking:!1,modal:!1,callback:function(){-1<location.href.indexOf("#!prettyPhoto")&&(location.hash="")},social_tools:""})}catch(err){window.console&&window.console.warn&&window.console.warn("vc_prettyPhoto initialize error",err)}}),"function"!=typeof window.vc_google_fonts&&(window.vc_google_fonts=function(){return window.console&&window.console.warn&&window.console.warn("function vc_google_fonts is deprecated, no need to use it"),!1}),window.vcParallaxSkroll=!1,"function"!=typeof window.vc_rowBehaviour&&(window.vc_rowBehaviour=function(){var vcSkrollrOptions,callSkrollInit,$=window.jQuery;function fullWidthRow(){var $elements=$('[data-vc-full-width="true"]');$.each($elements,function(key,item){var $el=$(this);$el.addClass("vc_hidden");var $el_full=$el.next(".vc_row-full-width");if($el_full.length||($el_full=$el.parent().next(".vc_row-full-width")),$el_full.length){var padding,paddingRight,el_margin_left=parseInt($el.css("margin-left"),10),el_margin_right=parseInt($el.css("margin-right"),10),offset=0-$el_full.offset().left-el_margin_left,width=$(window).width();if("rtl"===$el.css("direction")&&(offset-=$el_full.width(),offset+=width,offset+=el_margin_left,offset+=el_margin_right),$el.css({position:"relative",left:offset,"box-sizing":"border-box",width:width}),!$el.data("vcStretchContent"))"rtl"===$el.css("direction")?((padding=offset)<0&&(padding=0),(paddingRight=offset)<0&&(paddingRight=0)):((padding=-1*offset)<0&&(padding=0),(paddingRight=width-padding-$el_full.width()+el_margin_left+el_margin_right)<0&&(paddingRight=0)),$el.css({"padding-left":padding+"px","padding-right":paddingRight+"px"});$el.attr("data-vc-full-width-init","true"),$el.removeClass("vc_hidden"),$(document).trigger("vc-full-width-row-single",{el:$el,offset:offset,marginLeft:el_margin_left,marginRight:el_margin_right,elFull:$el_full,width:width})}}),$(document).trigger("vc-full-width-row",$elements)}function fullHeightRow(){var windowHeight,offsetTop,fullHeight,$element=$(".vc_row-o-full-height:first");$element.length&&(windowHeight=$(window).height(),(offsetTop=$element.offset().top)<windowHeight&&(fullHeight=100-offsetTop/(windowHeight/100),$element.css("min-height",fullHeight+"vh")));$(document).trigger("vc-full-height-row",$element)}$(window).off("resize.vcRowBehaviour").on("resize.vcRowBehaviour",fullWidthRow).on("resize.vcRowBehaviour",fullHeightRow),fullWidthRow(),fullHeightRow(),(0<window.navigator.userAgent.indexOf("MSIE ")||navigator.userAgent.match(/Trident.*rv\:11\./))&&$(".vc_row-o-full-height").each(function(){"flex"===$(this).css("display")&&$(this).wrap('<div class="vc_ie-flexbox-fixer"></div>')}),vc_initVideoBackgrounds(),callSkrollInit=!1,window.vcParallaxSkroll&&window.vcParallaxSkroll.destroy(),$(".vc_parallax-inner").remove(),$("[data-5p-top-bottom]").removeAttr("data-5p-top-bottom data-30p-top-bottom"),$("[data-vc-parallax]").each(function(){var skrollrSize,skrollrStart,$parallaxElement,parallaxImage,youtubeId;callSkrollInit=!0,"on"===$(this).data("vcParallaxOFade")&&$(this).children().attr("data-5p-top-bottom","opacity:0;").attr("data-30p-top-bottom","opacity:1;"),skrollrSize=100*$(this).data("vcParallax"),($parallaxElement=$("<div />").addClass("vc_parallax-inner").appendTo($(this))).height(skrollrSize+"%"),parallaxImage=$(this).data("vcParallaxImage"),(youtubeId=vcExtractYoutubeId(parallaxImage))?insertYoutubeVideoAsBackground($parallaxElement,youtubeId):void 0!==parallaxImage&&$parallaxElement.css("background-image","url("+parallaxImage+")"),skrollrStart=-(skrollrSize-100),$parallaxElement.attr("data-bottom-top","top: "+skrollrStart+"%;").attr("data-top-bottom","top: 0%;")}),callSkrollInit&&window.skrollr&&(vcSkrollrOptions={forceHeight:!1,smoothScrolling:!1,mobileCheck:function(){return!1}},window.vcParallaxSkroll=skrollr.init(vcSkrollrOptions),window.vcParallaxSkroll)}),"function"!=typeof window.vc_gridBehaviour&&(window.vc_gridBehaviour=function(){jQuery.fn.vcGrid&&jQuery("[data-vc-grid]").vcGrid()}),"function"!=typeof window.getColumnsCount&&(window.getColumnsCount=function(el){for(var find=!1,i=1;!1===find;){if(el.hasClass("columns_count_"+i))return find=!0,i;i++}});var screen_size=getSizeName();function getSizeName(){var screen_w=jQuery(window).width();return 1170<screen_w?"desktop_wide":960<screen_w&&screen_w<1169?"desktop":768<screen_w&&screen_w<959?"tablet":300<screen_w&&screen_w<767?"mobile":screen_w<300?"mobile_portrait":""}"function"!=typeof window.wpb_prepare_tab_content&&(window.wpb_prepare_tab_content=function(event,ui){var $ui_panel,$google_maps,panel=ui.panel||ui.newPanel,$pie_charts=panel.find(".vc_pie_chart:not(.vc_ready)"),$round_charts=panel.find(".vc_round-chart"),$line_charts=panel.find(".vc_line-chart"),$carousel=panel.find('[data-ride="vc_carousel"]');if(vc_carouselBehaviour(),vc_plugin_flexslider(panel),ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").length&&ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function(){var grid=jQuery(this).data("vcGrid");grid&&grid.gridBuilder&&grid.gridBuilder.setMasonry&&grid.gridBuilder.setMasonry()}),panel.find(".vc_masonry_media_grid, .vc_masonry_grid").length&&panel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function(){var grid=jQuery(this).data("vcGrid");grid&&grid.gridBuilder&&grid.gridBuilder.setMasonry&&grid.gridBuilder.setMasonry()}),$pie_charts.length&&jQuery.fn.vcChat&&$pie_charts.vcChat(),$round_charts.length&&jQuery.fn.vcRoundChart&&$round_charts.vcRoundChart({reload:!1}),$line_charts.length&&jQuery.fn.vcLineChart&&$line_charts.vcLineChart({reload:!1}),$carousel.length&&jQuery.fn.carousel&&$carousel.carousel("resizeAction"),$ui_panel=panel.find(".isotope, .wpb_image_grid_ul"),$google_maps=panel.find(".wpb_gmaps_widget"),0<$ui_panel.length&&$ui_panel.isotope("layout"),$google_maps.length&&!$google_maps.is(".map_ready")){var $frame=$google_maps.find("iframe");$frame.attr("src",$frame.attr("src")),$google_maps.addClass("map_ready")}panel.parents(".isotope").length&&panel.parents(".isotope").each(function(){jQuery(this).isotope("layout")})}),"function"!=typeof window.vc_ttaActivation&&(window.vc_ttaActivation=function(){jQuery("[data-vc-accordion]").on("show.vc.accordion",function(e){var $=window.jQuery,ui={};ui.newPanel=$(this).data("vc.accordion").getTarget(),window.wpb_prepare_tab_content(e,ui)})}),"function"!=typeof window.vc_accordionActivate&&(window.vc_accordionActivate=function(event,ui){if(ui.newPanel.length&&ui.newHeader.length){var $pie_charts=ui.newPanel.find(".vc_pie_chart:not(.vc_ready)"),$round_charts=ui.newPanel.find(".vc_round-chart"),$line_charts=ui.newPanel.find(".vc_line-chart"),$carousel=ui.newPanel.find('[data-ride="vc_carousel"]');void 0!==jQuery.fn.isotope&&ui.newPanel.find(".isotope, .wpb_image_grid_ul").isotope("layout"),ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").length&&ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function(){var grid=jQuery(this).data("vcGrid");grid&&grid.gridBuilder&&grid.gridBuilder.setMasonry&&grid.gridBuilder.setMasonry()}),vc_carouselBehaviour(ui.newPanel),vc_plugin_flexslider(ui.newPanel),$pie_charts.length&&jQuery.fn.vcChat&&$pie_charts.vcChat(),$round_charts.length&&jQuery.fn.vcRoundChart&&$round_charts.vcRoundChart({reload:!1}),$line_charts.length&&jQuery.fn.vcLineChart&&$line_charts.vcLineChart({reload:!1}),$carousel.length&&jQuery.fn.carousel&&$carousel.carousel("resizeAction"),ui.newPanel.parents(".isotope").length&&ui.newPanel.parents(".isotope").each(function(){jQuery(this).isotope("layout")})}}),"function"!=typeof window.initVideoBackgrounds&&(window.initVideoBackgrounds=function(){return window.console&&window.console.warn&&window.console.warn("this function is deprecated use vc_initVideoBackgrounds"),vc_initVideoBackgrounds()}),"function"!=typeof window.vc_initVideoBackgrounds&&(window.vc_initVideoBackgrounds=function(){jQuery("[data-vc-video-bg]").each(function(){var youtubeUrl,youtubeId,$element=jQuery(this);$element.data("vcVideoBg")?(youtubeUrl=$element.data("vcVideoBg"),(youtubeId=vcExtractYoutubeId(youtubeUrl))&&($element.find(".vc_video-bg").remove(),insertYoutubeVideoAsBackground($element,youtubeId)),jQuery(window).on("grid:items:added",function(event,$grid){$element.has($grid).length&&vcResizeVideoBackground($element)})):$element.find(".vc_video-bg").remove()})}),"function"!=typeof window.insertYoutubeVideoAsBackground&&(window.insertYoutubeVideoAsBackground=function($element,youtubeId,counter){if("undefined"==typeof YT||void 0===YT.Player)return 100<(counter=void 0===counter?0:counter)?void console.warn("Too many attempts to load YouTube api"):void setTimeout(function(){insertYoutubeVideoAsBackground($element,youtubeId,counter++)},100);var $container=$element.prepend('<div class="vc_video-bg vc_hidden-xs"><div class="inner"></div></div>').find(".inner");new YT.Player($container[0],{width:"100%",height:"100%",videoId:youtubeId,playerVars:{playlist:youtubeId,iv_load_policy:3,enablejsapi:1,disablekb:1,autoplay:1,controls:0,showinfo:0,rel:0,loop:1,wmode:"transparent"},events:{onReady:function(event){event.target.mute().setLoop(!0)}}}),vcResizeVideoBackground($element),jQuery(window).bind("resize",function(){vcResizeVideoBackground($element)})}),"function"!=typeof window.vcResizeVideoBackground&&(window.vcResizeVideoBackground=function($element){var iframeW,iframeH,marginLeft,marginTop,containerW=$element.innerWidth(),containerH=$element.innerHeight();containerW/containerH<16/9?(iframeW=containerH*(16/9),iframeH=containerH,marginLeft=-Math.round((iframeW-containerW)/2)+"px",marginTop=-Math.round((iframeH-containerH)/2)+"px"):(iframeH=(iframeW=containerW)*(9/16),marginTop=-Math.round((iframeH-containerH)/2)+"px",marginLeft=-Math.round((iframeW-containerW)/2)+"px"),iframeW+="px",iframeH+="px",$element.find(".vc_video-bg iframe").css({maxWidth:"1000%",marginLeft:marginLeft,marginTop:marginTop,width:iframeW,height:iframeH})}),"function"!=typeof window.vcExtractYoutubeId&&(window.vcExtractYoutubeId=function(url){if(void 0===url)return!1;var id=url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);return null!==id&&id[1]}),"function"!=typeof window.vc_googleMapsPointer&&(window.vc_googleMapsPointer=function(){var $=window.jQuery,$wpbGmapsWidget=$(".wpb_gmaps_widget");$wpbGmapsWidget.on("click",function(){$("iframe",this).css("pointer-events","auto")}),$wpbGmapsWidget.on("mouseleave",function(){$("iframe",this).css("pointer-events","none")}),$(".wpb_gmaps_widget iframe").css("pointer-events","none")}),"function"!=typeof window.vc_setHoverBoxPerspective&&(window.vc_setHoverBoxPerspective=function(hoverBox){hoverBox.each(function(){var $this=jQuery(this),perspective=4*$this.width()+"px";$this.css("perspective",perspective)})}),"function"!=typeof window.vc_setHoverBoxHeight&&(window.vc_setHoverBoxHeight=function(hoverBox){hoverBox.each(function(){var $this=jQuery(this),hoverBoxInner=$this.find(".vc-hoverbox-inner");hoverBoxInner.css("min-height",0);var frontHeight=$this.find(".vc-hoverbox-front-inner").outerHeight(),backHeight=$this.find(".vc-hoverbox-back-inner").outerHeight(),hoverBoxHeight=backHeight<frontHeight?frontHeight:backHeight;hoverBoxHeight<250&&(hoverBoxHeight=250),hoverBoxInner.css("min-height",hoverBoxHeight+"px")})}),"function"!=typeof window.vc_prepareHoverBox&&(window.vc_prepareHoverBox=function(){var hoverBox=jQuery(".vc-hoverbox");vc_setHoverBoxHeight(hoverBox),vc_setHoverBoxPerspective(hoverBox)}),jQuery(document).ready(window.vc_prepareHoverBox),jQuery(window).resize(window.vc_prepareHoverBox),jQuery(document).ready(function($){window.vc_js()})}(window.jQuery);!function(t){"use strict";var e,i,s;function n(e){t(".owl-carousel[data-carousel=owl]:visible").each(function(){var i='<span class="'+t(this).data("navleft")+'"></span>',s='<span class="'+t(this).data("navright")+'"></span>',n={loop:!1,nav:t(this).data("nav"),dots:t(this).data("pagination"),items:4,stagePadding:0,navText:[i,s]},o=jQuery(window).width(),r=t(this);if(t(this).data("items")){n.items=t(this).data("items");var a=t(this).data("items")}if(t(this).data("large"))var h=t(this).data("large");else h=n.items;if(t(this).data("medium"))var l=t(this).data("medium");else l=n.items;if(t(this).data("smallmedium"))var c=t(this).data("smallmedium");else c=n.items;if(t(this).data("extrasmall"))var d=t(this).data("extrasmall");else d=2;if(t(this).data("verysmall"))var p=t(this).data("verysmall");else p=1;n.responsive={0:{items:d},480:{items:c},768:{items:l},1280:{items:h},1600:{items:a}},"rtl"==t("html").attr("dir")&&(n.rtl=!0),t(this).data("loop")&&(n.loop=t(this).data("loop")),t(this).data("auto")&&(n.autoplay=t(this).data("auto")),t(this).data("autospeed")&&(n.autoplaySpeed=t(this).data("autospeed")),t(this).owlCarousel(n),!r.data("uncarouselmobile")||o>=767?(t(this).owlCarousel(n),e&&r.trigger("refresh.owl.carousel")):(t(this).trigger("destroy.owl.carousel").removeClass("owl-loaded"),t(this).find(".owl-stage-outre").children().unwrap(),t(this).find(".item").children().unwrap());var u=jQuery(window).width(),g=jQuery(".owl-item",t(this)).length;(u>=1600&&g<=a||u>=1280&&u<1600&&g<=h||u>=980&&u<1280&&g<=l||u>=768&&u<980&&g<=c||u>=320&&u<768&&g<=d||u<320&&g<=p)&&t(this).find(".owl-prev, .owl-next").hide()})}!function(t,e,i,s){function n(e,i){this.settings=null,this.options=t.extend({},n.Defaults,i),this.$element=t(e),this._handlers={},this._plugins={},this._supress={},this._current=null,this._speed=null,this._coordinates=[],this._breakpoint=null,this._width=null,this._items=[],this._clones=[],this._mergers=[],this._widths=[],this._invalidated={},this._pipe=[],this._drag={time:null,target:null,pointer:null,stage:{start:null,current:null},direction:null},this._states={current:{},tags:{initializing:["busy"],animating:["busy"],dragging:["interacting"]}},t.each(["onResize","onThrottledResize"],t.proxy(function(e,i){this._handlers[i]=t.proxy(this[i],this)},this)),t.each(n.Plugins,t.proxy(function(t,e){this._plugins[t.charAt(0).toLowerCase()+t.slice(1)]=new e(this)},this)),t.each(n.Workers,t.proxy(function(e,i){this._pipe.push({filter:i.filter,run:t.proxy(i.run,this)})},this)),this.setup(),this.initialize()}n.Defaults={items:3,loop:!1,center:!1,rewind:!1,checkVisibility:!0,mouseDrag:!0,touchDrag:!0,pullDrag:!0,freeDrag:!1,margin:0,stagePadding:0,merge:!1,mergeFit:!0,autoWidth:!1,startPosition:0,rtl:!1,smartSpeed:250,fluidSpeed:!1,dragEndSpeed:!1,responsive:{},responsiveRefreshRate:200,responsiveBaseElement:e,fallbackEasing:"swing",slideTransition:"",info:!1,nestedItemSelector:!1,itemElement:"div",stageElement:"div",refreshClass:"owl-refresh",loadedClass:"owl-loaded",loadingClass:"owl-loading",rtlClass:"owl-rtl",responsiveClass:"owl-responsive",dragClass:"owl-drag",itemClass:"owl-item",stageClass:"owl-stage",stageOuterClass:"owl-stage-outer",grabClass:"owl-grab"},n.Width={Default:"default",Inner:"inner",Outer:"outer"},n.Type={Event:"event",State:"state"},n.Plugins={},n.Workers=[{filter:["width","settings"],run:function(){this._width=this.$element.width()}},{filter:["width","items","settings"],run:function(t){t.current=this._items&&this._items[this.relative(this._current)]}},{filter:["items","settings"],run:function(){this.$stage.children(".cloned").remove()}},{filter:["width","items","settings"],run:function(t){var e=this.settings.margin||"",i=!this.settings.autoWidth,s=this.settings.rtl,n={width:"auto","margin-left":s?e:"","margin-right":s?"":e};!i&&this.$stage.children().css(n),t.css=n}},{filter:["width","items","settings"],run:function(t){var e=(this.width()/this.settings.items).toFixed(3)-this.settings.margin,i=null,s=this._items.length,n=!this.settings.autoWidth,o=[];for(t.items={merge:!1,width:e};s--;)i=this._mergers[s],i=this.settings.mergeFit&&Math.min(i,this.settings.items)||i,t.items.merge=i>1||t.items.merge,o[s]=n?e*i:this._items[s].width();this._widths=o}},{filter:["items","settings"],run:function(){var e=[],i=this._items,s=this.settings,n=Math.max(2*s.items,4),o=2*Math.ceil(i.length/2),r=s.loop&&i.length?s.rewind?n:Math.max(n,o):0,a="",h="";for(r/=2;r>0;)e.push(this.normalize(e.length/2,!0)),a+=i[e[e.length-1]][0].outerHTML,e.push(this.normalize(i.length-1-(e.length-1)/2,!0)),h=i[e[e.length-1]][0].outerHTML+h,r-=1;this._clones=e,t(a).addClass("cloned").appendTo(this.$stage),t(h).addClass("cloned").prependTo(this.$stage)}},{filter:["width","items","settings"],run:function(){for(var t=this.settings.rtl?1:-1,e=this._clones.length+this._items.length,i=-1,s=0,n=0,o=[];++i<e;)s=o[i-1]||0,n=this._widths[this.relative(i)]+this.settings.margin,o.push(s+n*t);this._coordinates=o}},{filter:["width","items","settings"],run:function(){var t=this.settings.stagePadding,e=this._coordinates,i={width:Math.ceil(Math.abs(e[e.length-1]))+2*t,"padding-left":t||"","padding-right":t||""};this.$stage.css(i)}},{filter:["width","items","settings"],run:function(t){var e=this._coordinates.length,i=!this.settings.autoWidth,s=this.$stage.children();if(i&&t.items.merge)for(;e--;)t.css.width=this._widths[this.relative(e)],s.eq(e).css(t.css);else i&&(t.css.width=t.items.width,s.css(t.css))}},{filter:["items"],run:function(){this._coordinates.length<1&&this.$stage.removeAttr("style")}},{filter:["width","items","settings"],run:function(t){t.current=t.current?this.$stage.children().index(t.current):0,t.current=Math.max(this.minimum(),Math.min(this.maximum(),t.current)),this.reset(t.current)}},{filter:["position"],run:function(){this.animate(this.coordinates(this._current))}},{filter:["width","position","items","settings"],run:function(){var t,e,i,s,n=this.settings.rtl?1:-1,o=2*this.settings.stagePadding,r=this.coordinates(this.current())+o,a=r+this.width()*n,h=[];for(i=0,s=this._coordinates.length;i<s;i++)t=this._coordinates[i-1]||0,e=Math.abs(this._coordinates[i])+o*n,(this.op(t,"<=",r)&&this.op(t,">",a)||this.op(e,"<",r)&&this.op(e,">",a))&&h.push(i);this.$stage.children(".active").removeClass("active"),this.$stage.children(":eq("+h.join("), :eq(")+")").addClass("active"),this.$stage.children(".center").removeClass("center"),this.settings.center&&this.$stage.children().eq(this.current()).addClass("center")}}],n.prototype.initializeStage=function(){this.$stage=this.$element.find("."+this.settings.stageClass),this.$stage.length||(this.$element.addClass(this.options.loadingClass),this.$stage=t("<"+this.settings.stageElement+">",{class:this.settings.stageClass}).wrap(t("<div/>",{class:this.settings.stageOuterClass})),this.$element.append(this.$stage.parent()))},n.prototype.initializeItems=function(){var e=this.$element.find(".owl-item");if(e.length)return this._items=e.get().map(function(e){return t(e)}),this._mergers=this._items.map(function(){return 1}),void this.refresh();this.replace(this.$element.children().not(this.$stage.parent())),this.isVisible()?this.refresh():this.invalidate("width"),this.$element.removeClass(this.options.loadingClass).addClass(this.options.loadedClass)},n.prototype.initialize=function(){var t,e,i;(this.enter("initializing"),this.trigger("initialize"),this.$element.toggleClass(this.settings.rtlClass,this.settings.rtl),this.settings.autoWidth&&!this.is("pre-loading"))&&(t=this.$element.find("img"),e=this.settings.nestedItemSelector?"."+this.settings.nestedItemSelector:s,i=this.$element.children(e).width(),t.length&&i<=0&&this.preloadAutoWidthImages(t));this.initializeStage(),this.initializeItems(),this.registerEventHandlers(),this.leave("initializing"),this.trigger("initialized")},n.prototype.isVisible=function(){return!this.settings.checkVisibility||this.$element.is(":visible")},n.prototype.setup=function(){var e=this.viewport(),i=this.options.responsive,s=-1,n=null;i?(t.each(i,function(t){t<=e&&t>s&&(s=Number(t))}),"function"==typeof(n=t.extend({},this.options,i[s])).stagePadding&&(n.stagePadding=n.stagePadding()),delete n.responsive,n.responsiveClass&&this.$element.attr("class",this.$element.attr("class").replace(new RegExp("("+this.options.responsiveClass+"-)\\S+\\s","g"),"$1"+s))):n=t.extend({},this.options),this.trigger("change",{property:{name:"settings",value:n}}),this._breakpoint=s,this.settings=n,this.invalidate("settings"),this.trigger("changed",{property:{name:"settings",value:this.settings}})},n.prototype.optionsLogic=function(){this.settings.autoWidth&&(this.settings.stagePadding=!1,this.settings.merge=!1)},n.prototype.prepare=function(e){var i=this.trigger("prepare",{content:e});return i.data||(i.data=t("<"+this.settings.itemElement+"/>").addClass(this.options.itemClass).append(e)),this.trigger("prepared",{content:i.data}),i.data},n.prototype.update=function(){for(var e=0,i=this._pipe.length,s=t.proxy(function(t){return this[t]},this._invalidated),n={};e<i;)(this._invalidated.all||t.grep(this._pipe[e].filter,s).length>0)&&this._pipe[e].run(n),e++;this._invalidated={},!this.is("valid")&&this.enter("valid")},n.prototype.width=function(t){switch(t=t||n.Width.Default){case n.Width.Inner:case n.Width.Outer:return this._width;default:return this._width-2*this.settings.stagePadding+this.settings.margin}},n.prototype.refresh=function(){this.enter("refreshing"),this.trigger("refresh"),this.setup(),this.optionsLogic(),this.$element.addClass(this.options.refreshClass),this.update(),this.$element.removeClass(this.options.refreshClass),this.leave("refreshing"),this.trigger("refreshed")},n.prototype.onThrottledResize=function(){e.clearTimeout(this.resizeTimer),this.resizeTimer=e.setTimeout(this._handlers.onResize,this.settings.responsiveRefreshRate)},n.prototype.onResize=function(){return!!this._items.length&&this._width!==this.$element.width()&&!!this.isVisible()&&(this.enter("resizing"),this.trigger("resize").isDefaultPrevented()?(this.leave("resizing"),!1):(this.invalidate("width"),this.refresh(),this.leave("resizing"),void this.trigger("resized")))},n.prototype.registerEventHandlers=function(){t.support.transition&&this.$stage.on(t.support.transition.end+".owl.core",t.proxy(this.onTransitionEnd,this)),!1!==this.settings.responsive&&this.on(e,"resize",this._handlers.onThrottledResize),this.settings.mouseDrag&&(this.$element.addClass(this.options.dragClass),this.$stage.on("mousedown.owl.core",t.proxy(this.onDragStart,this)),this.$stage.on("dragstart.owl.core selectstart.owl.core",function(){return!1})),this.settings.touchDrag&&(this.$stage.on("touchstart.owl.core",t.proxy(this.onDragStart,this)),this.$stage.on("touchcancel.owl.core",t.proxy(this.onDragEnd,this)))},n.prototype.onDragStart=function(e){var s=null;3!==e.which&&(t.support.transform?s={x:(s=this.$stage.css("transform").replace(/.*\(|\)| /g,"").split(","))[16===s.length?12:4],y:s[16===s.length?13:5]}:(s=this.$stage.position(),s={x:this.settings.rtl?s.left+this.$stage.width()-this.width()+this.settings.margin:s.left,y:s.top}),this.is("animating")&&(t.support.transform?this.animate(s.x):this.$stage.stop(),this.invalidate("position")),this.$element.toggleClass(this.options.grabClass,"mousedown"===e.type),this.speed(0),this._drag.time=(new Date).getTime(),this._drag.target=t(e.target),this._drag.stage.start=s,this._drag.stage.current=s,this._drag.pointer=this.pointer(e),t(i).on("mouseup.owl.core touchend.owl.core",t.proxy(this.onDragEnd,this)),t(i).one("mousemove.owl.core touchmove.owl.core",t.proxy(function(e){var s=this.difference(this._drag.pointer,this.pointer(e));t(i).on("mousemove.owl.core touchmove.owl.core",t.proxy(this.onDragMove,this)),Math.abs(s.x)<Math.abs(s.y)&&this.is("valid")||(e.preventDefault(),this.enter("dragging"),this.trigger("drag"))},this)))},n.prototype.onDragMove=function(t){var e=null,i=null,s=null,n=this.difference(this._drag.pointer,this.pointer(t)),o=this.difference(this._drag.stage.start,n);this.is("dragging")&&(t.preventDefault(),this.settings.loop?(e=this.coordinates(this.minimum()),i=this.coordinates(this.maximum()+1)-e,o.x=((o.x-e)%i+i)%i+e):(e=this.settings.rtl?this.coordinates(this.maximum()):this.coordinates(this.minimum()),i=this.settings.rtl?this.coordinates(this.minimum()):this.coordinates(this.maximum()),s=this.settings.pullDrag?-1*n.x/5:0,o.x=Math.max(Math.min(o.x,e+s),i+s)),this._drag.stage.current=o,this.animate(o.x))},n.prototype.onDragEnd=function(e){var s=this.difference(this._drag.pointer,this.pointer(e)),n=this._drag.stage.current,o=s.x>0^this.settings.rtl?"left":"right";t(i).off(".owl.core"),this.$element.removeClass(this.options.grabClass),(0!==s.x&&this.is("dragging")||!this.is("valid"))&&(this.speed(this.settings.dragEndSpeed||this.settings.smartSpeed),this.current(this.closest(n.x,0!==s.x?o:this._drag.direction)),this.invalidate("position"),this.update(),this._drag.direction=o,(Math.abs(s.x)>3||(new Date).getTime()-this._drag.time>300)&&this._drag.target.one("click.owl.core",function(){return!1})),this.is("dragging")&&(this.leave("dragging"),this.trigger("dragged"))},n.prototype.closest=function(e,i){var n=-1,o=this.width(),r=this.coordinates();return this.settings.freeDrag||t.each(r,t.proxy(function(t,a){return"left"===i&&e>a-30&&e<a+30?n=t:"right"===i&&e>a-o-30&&e<a-o+30?n=t+1:this.op(e,"<",a)&&this.op(e,">",r[t+1]!==s?r[t+1]:a-o)&&(n="left"===i?t+1:t),-1===n},this)),this.settings.loop||(this.op(e,">",r[this.minimum()])?n=e=this.minimum():this.op(e,"<",r[this.maximum()])&&(n=e=this.maximum())),n},n.prototype.animate=function(e){var i=this.speed()>0;this.is("animating")&&this.onTransitionEnd(),i&&(this.enter("animating"),this.trigger("translate")),t.support.transform3d&&t.support.transition?this.$stage.css({transform:"translate3d("+e+"px,0px,0px)",transition:this.speed()/1e3+"s"+(this.settings.slideTransition?" "+this.settings.slideTransition:"")}):i?this.$stage.animate({left:e+"px"},this.speed(),this.settings.fallbackEasing,t.proxy(this.onTransitionEnd,this)):this.$stage.css({left:e+"px"})},n.prototype.is=function(t){return this._states.current[t]&&this._states.current[t]>0},n.prototype.current=function(t){if(t===s)return this._current;if(0===this._items.length)return s;if(t=this.normalize(t),this._current!==t){var e=this.trigger("change",{property:{name:"position",value:t}});e.data!==s&&(t=this.normalize(e.data)),this._current=t,this.invalidate("position"),this.trigger("changed",{property:{name:"position",value:this._current}})}return this._current},n.prototype.invalidate=function(e){return"string"===t.type(e)&&(this._invalidated[e]=!0,this.is("valid")&&this.leave("valid")),t.map(this._invalidated,function(t,e){return e})},n.prototype.reset=function(t){(t=this.normalize(t))!==s&&(this._speed=0,this._current=t,this.suppress(["translate","translated"]),this.animate(this.coordinates(t)),this.release(["translate","translated"]))},n.prototype.normalize=function(t,e){var i=this._items.length,n=e?0:this._clones.length;return!this.isNumeric(t)||i<1?t=s:(t<0||t>=i+n)&&(t=((t-n/2)%i+i)%i+n/2),t},n.prototype.relative=function(t){return t-=this._clones.length/2,this.normalize(t,!0)},n.prototype.maximum=function(t){var e,i,s,n=this.settings,o=this._coordinates.length;if(n.loop)o=this._clones.length/2+this._items.length-1;else if(n.autoWidth||n.merge){if(e=this._items.length)for(i=this._items[--e].width(),s=this.$element.width();e--&&!((i+=this._items[e].width()+this.settings.margin)>s););o=e+1}else o=n.center?this._items.length-1:this._items.length-n.items;return t&&(o-=this._clones.length/2),Math.max(o,0)},n.prototype.minimum=function(t){return t?0:this._clones.length/2},n.prototype.items=function(t){return t===s?this._items.slice():(t=this.normalize(t,!0),this._items[t])},n.prototype.mergers=function(t){return t===s?this._mergers.slice():(t=this.normalize(t,!0),this._mergers[t])},n.prototype.clones=function(e){var i=this._clones.length/2,n=i+this._items.length,o=function(t){return t%2==0?n+t/2:i-(t+1)/2};return e===s?t.map(this._clones,function(t,e){return o(e)}):t.map(this._clones,function(t,i){return t===e?o(i):null})},n.prototype.speed=function(t){return t!==s&&(this._speed=t),this._speed},n.prototype.coordinates=function(e){var i,n=1,o=e-1;return e===s?t.map(this._coordinates,t.proxy(function(t,e){return this.coordinates(e)},this)):(this.settings.center?(this.settings.rtl&&(n=-1,o=e+1),i=this._coordinates[e],i+=(this.width()-i+(this._coordinates[o]||0))/2*n):i=this._coordinates[o]||0,i=Math.ceil(i))},n.prototype.duration=function(t,e,i){return 0===i?0:Math.min(Math.max(Math.abs(e-t),1),6)*Math.abs(i||this.settings.smartSpeed)},n.prototype.to=function(t,e){var i=this.current(),s=null,n=t-this.relative(i),o=(n>0)-(n<0),r=this._items.length,a=this.minimum(),h=this.maximum();this.settings.loop?(!this.settings.rewind&&Math.abs(n)>r/2&&(n+=-1*o*r),(s=(((t=i+n)-a)%r+r)%r+a)!==t&&s-n<=h&&s-n>0&&(i=s-n,t=s,this.reset(i))):this.settings.rewind?t=(t%(h+=1)+h)%h:t=Math.max(a,Math.min(h,t)),this.speed(this.duration(i,t,e)),this.current(t),this.isVisible()&&this.update()},n.prototype.next=function(t){t=t||!1,this.to(this.relative(this.current())+1,t)},n.prototype.prev=function(t){t=t||!1,this.to(this.relative(this.current())-1,t)},n.prototype.onTransitionEnd=function(t){if(t!==s&&(t.stopPropagation(),(t.target||t.srcElement||t.originalTarget)!==this.$stage.get(0)))return!1;this.leave("animating"),this.trigger("translated")},n.prototype.viewport=function(){var s;return this.options.responsiveBaseElement!==e?s=t(this.options.responsiveBaseElement).width():e.innerWidth?s=e.innerWidth:i.documentElement&&i.documentElement.clientWidth?s=i.documentElement.clientWidth:console.warn("Can not detect viewport width."),s},n.prototype.replace=function(e){this.$stage.empty(),this._items=[],e&&(e=e instanceof jQuery?e:t(e)),this.settings.nestedItemSelector&&(e=e.find("."+this.settings.nestedItemSelector)),e.filter(function(){return 1===this.nodeType}).each(t.proxy(function(t,e){e=this.prepare(e),this.$stage.append(e),this._items.push(e),this._mergers.push(1*e.find("[data-merge]").addBack("[data-merge]").attr("data-merge")||1)},this)),this.reset(this.isNumeric(this.settings.startPosition)?this.settings.startPosition:0),this.invalidate("items")},n.prototype.add=function(e,i){var n=this.relative(this._current);i=i===s?this._items.length:this.normalize(i,!0),e=e instanceof jQuery?e:t(e),this.trigger("add",{content:e,position:i}),e=this.prepare(e),0===this._items.length||i===this._items.length?(0===this._items.length&&this.$stage.append(e),0!==this._items.length&&this._items[i-1].after(e),this._items.push(e),this._mergers.push(1*e.find("[data-merge]").addBack("[data-merge]").attr("data-merge")||1)):(this._items[i].before(e),this._items.splice(i,0,e),this._mergers.splice(i,0,1*e.find("[data-merge]").addBack("[data-merge]").attr("data-merge")||1)),this._items[n]&&this.reset(this._items[n].index()),this.invalidate("items"),this.trigger("added",{content:e,position:i})},n.prototype.remove=function(t){(t=this.normalize(t,!0))!==s&&(this.trigger("remove",{content:this._items[t],position:t}),this._items[t].remove(),this._items.splice(t,1),this._mergers.splice(t,1),this.invalidate("items"),this.trigger("removed",{content:null,position:t}))},n.prototype.preloadAutoWidthImages=function(e){e.each(t.proxy(function(e,i){this.enter("pre-loading"),i=t(i),t(new Image).one("load",t.proxy(function(t){i.attr("src",t.target.src),i.css("opacity",1),this.leave("pre-loading"),!this.is("pre-loading")&&!this.is("initializing")&&this.refresh()},this)).attr("src",i.attr("src")||i.attr("data-src")||i.attr("data-src-retina"))},this))},n.prototype.destroy=function(){for(var s in this.$element.off(".owl.core"),this.$stage.off(".owl.core"),t(i).off(".owl.core"),!1!==this.settings.responsive&&(e.clearTimeout(this.resizeTimer),this.off(e,"resize",this._handlers.onThrottledResize)),this._plugins)this._plugins[s].destroy();this.$stage.children(".cloned").remove(),this.$stage.unwrap(),this.$stage.children().contents().unwrap(),this.$stage.children().unwrap(),this.$stage.remove(),this.$element.removeClass(this.options.refreshClass).removeClass(this.options.loadingClass).removeClass(this.options.loadedClass).removeClass(this.options.rtlClass).removeClass(this.options.dragClass).removeClass(this.options.grabClass).attr("class",this.$element.attr("class").replace(new RegExp(this.options.responsiveClass+"-\\S+\\s","g"),"")).removeData("owl.carousel")},n.prototype.op=function(t,e,i){var s=this.settings.rtl;switch(e){case"<":return s?t>i:t<i;case">":return s?t<i:t>i;case">=":return s?t<=i:t>=i;case"<=":return s?t>=i:t<=i}},n.prototype.on=function(t,e,i,s){t.addEventListener?t.addEventListener(e,i,s):t.attachEvent&&t.attachEvent("on"+e,i)},n.prototype.off=function(t,e,i,s){t.removeEventListener?t.removeEventListener(e,i,s):t.detachEvent&&t.detachEvent("on"+e,i)},n.prototype.trigger=function(e,i,s,o,r){var a={item:{count:this._items.length,index:this.current()}},h=t.camelCase(t.grep(["on",e,s],function(t){return t}).join("-").toLowerCase()),l=t.Event([e,"owl",s||"carousel"].join(".").toLowerCase(),t.extend({relatedTarget:this},a,i));return this._supress[e]||(t.each(this._plugins,function(t,e){e.onTrigger&&e.onTrigger(l)}),this.register({type:n.Type.Event,name:e}),this.$element.trigger(l),this.settings&&"function"==typeof this.settings[h]&&this.settings[h].call(this,l)),l},n.prototype.enter=function(e){t.each([e].concat(this._states.tags[e]||[]),t.proxy(function(t,e){this._states.current[e]===s&&(this._states.current[e]=0),this._states.current[e]++},this))},n.prototype.leave=function(e){t.each([e].concat(this._states.tags[e]||[]),t.proxy(function(t,e){this._states.current[e]--},this))},n.prototype.register=function(e){if(e.type===n.Type.Event){if(t.event.special[e.name]||(t.event.special[e.name]={}),!t.event.special[e.name].owl){var i=t.event.special[e.name]._default;t.event.special[e.name]._default=function(t){return!i||!i.apply||t.namespace&&-1!==t.namespace.indexOf("owl")?t.namespace&&t.namespace.indexOf("owl")>-1:i.apply(this,arguments)},t.event.special[e.name].owl=!0}}else e.type===n.Type.State&&(this._states.tags[e.name]?this._states.tags[e.name]=this._states.tags[e.name].concat(e.tags):this._states.tags[e.name]=e.tags,this._states.tags[e.name]=t.grep(this._states.tags[e.name],t.proxy(function(i,s){return t.inArray(i,this._states.tags[e.name])===s},this)))},n.prototype.suppress=function(e){t.each(e,t.proxy(function(t,e){this._supress[e]=!0},this))},n.prototype.release=function(e){t.each(e,t.proxy(function(t,e){delete this._supress[e]},this))},n.prototype.pointer=function(t){var i={x:null,y:null};return(t=(t=t.originalEvent||t||e.event).touches&&t.touches.length?t.touches[0]:t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:t).pageX?(i.x=t.pageX,i.y=t.pageY):(i.x=t.clientX,i.y=t.clientY),i},n.prototype.isNumeric=function(t){return!isNaN(parseFloat(t))},n.prototype.difference=function(t,e){return{x:t.x-e.x,y:t.y-e.y}},t.fn.owlCarousel=function(e){var i=Array.prototype.slice.call(arguments,1);return this.each(function(){var s=t(this),o=s.data("owl.carousel");o||(o=new n(this,"object"==typeof e&&e),s.data("owl.carousel",o),t.each(["next","prev","to","destroy","refresh","replace","add","remove"],function(e,i){o.register({type:n.Type.Event,name:i}),o.$element.on(i+".owl.carousel.core",t.proxy(function(t){t.namespace&&t.relatedTarget!==this&&(this.suppress([i]),o[i].apply(this,[].slice.call(arguments,1)),this.release([i]))},o))})),"string"==typeof e&&"_"!==e.charAt(0)&&o[e].apply(o,i)})},t.fn.owlCarousel.Constructor=n}(window.Zepto||window.jQuery,window,document),e=window.Zepto||window.jQuery,i=window,document,(s=function(t){this._core=t,this._interval=null,this._visible=null,this._handlers={"initialized.owl.carousel":e.proxy(function(t){t.namespace&&this._core.settings.autoRefresh&&this.watch()},this)},this._core.options=e.extend({},s.Defaults,this._core.options),this._core.$element.on(this._handlers)}).Defaults={autoRefresh:!0,autoRefreshInterval:500},s.prototype.watch=function(){this._interval||(this._visible=this._core.isVisible(),this._interval=i.setInterval(e.proxy(this.refresh,this),this._core.settings.autoRefreshInterval))},s.prototype.refresh=function(){this._core.isVisible()!==this._visible&&(this._visible=!this._visible,this._core.$element.toggleClass("owl-hidden",!this._visible),this._visible&&this._core.invalidate("width")&&this._core.refresh())},s.prototype.destroy=function(){var t,e;for(t in i.clearInterval(this._interval),this._handlers)this._core.$element.off(t,this._handlers[t]);for(e in Object.getOwnPropertyNames(this))"function"!=typeof this[e]&&(this[e]=null)},e.fn.owlCarousel.Constructor.Plugins.AutoRefresh=s,function(t,e,i,s){var n=function(e){this._core=e,this._loaded=[],this._handlers={"initialized.owl.carousel change.owl.carousel resized.owl.carousel":t.proxy(function(e){if(e.namespace&&this._core.settings&&this._core.settings.lazyLoad&&(e.property&&"position"==e.property.name||"initialized"==e.type)){var i=this._core.settings,s=i.center&&Math.ceil(i.items/2)||i.items,n=i.center&&-1*s||0,o=(e.property&&void 0!==e.property.value?e.property.value:this._core.current())+n,r=this._core.clones().length,a=t.proxy(function(t,e){this.load(e)},this);for(i.lazyLoadEager>0&&(s+=i.lazyLoadEager,i.loop&&(o-=i.lazyLoadEager,s++));n++<s;)this.load(r/2+this._core.relative(o)),r&&t.each(this._core.clones(this._core.relative(o)),a),o++}},this)},this._core.options=t.extend({},n.Defaults,this._core.options),this._core.$element.on(this._handlers)};n.Defaults={lazyLoad:!1,lazyLoadEager:0},n.prototype.load=function(i){var s=this._core.$stage.children().eq(i),n=s&&s.find(".owl-lazy");!n||t.inArray(s.get(0),this._loaded)>-1||(n.each(t.proxy(function(i,s){var n,o=t(s),r=e.devicePixelRatio>1&&o.attr("data-src-retina")||o.attr("data-src")||o.attr("data-srcset");this._core.trigger("load",{element:o,url:r},"lazy"),o.is("img")?o.one("load.owl.lazy",t.proxy(function(){o.css("opacity",1),this._core.trigger("loaded",{element:o,url:r},"lazy")},this)).attr("src",r):o.is("source")?o.one("load.owl.lazy",t.proxy(function(){this._core.trigger("loaded",{element:o,url:r},"lazy")},this)).attr("srcset",r):((n=new Image).onload=t.proxy(function(){o.css({"background-image":'url("'+r+'")',opacity:"1"}),this._core.trigger("loaded",{element:o,url:r},"lazy")},this),n.src=r)},this)),this._loaded.push(s.get(0)))},n.prototype.destroy=function(){var t,e;for(t in this.handlers)this._core.$element.off(t,this.handlers[t]);for(e in Object.getOwnPropertyNames(this))"function"!=typeof this[e]&&(this[e]=null)},t.fn.owlCarousel.Constructor.Plugins.Lazy=n}(window.Zepto||window.jQuery,window,document),function(t,e,i,s){var n=function(i){this._core=i,this._previousHeight=null,this._handlers={"initialized.owl.carousel refreshed.owl.carousel":t.proxy(function(t){t.namespace&&this._core.settings.autoHeight&&this.update()},this),"changed.owl.carousel":t.proxy(function(t){t.namespace&&this._core.settings.autoHeight&&"position"===t.property.name&&this.update()},this),"loaded.owl.lazy":t.proxy(function(t){t.namespace&&this._core.settings.autoHeight&&t.element.closest("."+this._core.settings.itemClass).index()===this._core.current()&&this.update()},this)},this._core.options=t.extend({},n.Defaults,this._core.options),this._core.$element.on(this._handlers),this._intervalId=null;var s=this;t(e).on("load",function(){s._core.settings.autoHeight&&s.update()}),t(e).resize(function(){s._core.settings.autoHeight&&(null!=s._intervalId&&clearTimeout(s._intervalId),s._intervalId=setTimeout(function(){s.update()},250))})};n.Defaults={autoHeight:!1,autoHeightClass:"owl-height"},n.prototype.update=function(){var e=this._core._current,i=e+this._core.settings.items,s=this._core.settings.lazyLoad,n=this._core.$stage.children().toArray().slice(e,i),o=[],r=0;t.each(n,function(e,i){o.push(t(i).height())}),(r=Math.max.apply(null,o))<=1&&s&&this._previousHeight&&(r=this._previousHeight),this._previousHeight=r,this._core.$stage.parent().height(r).addClass(this._core.settings.autoHeightClass)},n.prototype.destroy=function(){var t,e;for(t in this._handlers)this._core.$element.off(t,this._handlers[t]);for(e in Object.getOwnPropertyNames(this))"function"!=typeof this[e]&&(this[e]=null)},t.fn.owlCarousel.Constructor.Plugins.AutoHeight=n}(window.Zepto||window.jQuery,window,document),function(t,e,i,s){var n=function(e){this._core=e,this._videos={},this._playing=null,this._handlers={"initialized.owl.carousel":t.proxy(function(t){t.namespace&&this._core.register({type:"state",name:"playing",tags:["interacting"]})},this),"resize.owl.carousel":t.proxy(function(t){t.namespace&&this._core.settings.video&&this.isInFullScreen()&&t.preventDefault()},this),"refreshed.owl.carousel":t.proxy(function(t){t.namespace&&this._core.is("resizing")&&this._core.$stage.find(".cloned .owl-video-frame").remove()},this),"changed.owl.carousel":t.proxy(function(t){t.namespace&&"position"===t.property.name&&this._playing&&this.stop()},this),"prepared.owl.carousel":t.proxy(function(e){if(e.namespace){var i=t(e.content).find(".owl-video");i.length&&(i.css("display","none"),this.fetch(i,t(e.content)))}},this)},this._core.options=t.extend({},n.Defaults,this._core.options),this._core.$element.on(this._handlers),this._core.$element.on("click.owl.video",".owl-video-play-icon",t.proxy(function(t){this.play(t)},this))};n.Defaults={video:!1,videoHeight:!1,videoWidth:!1},n.prototype.fetch=function(t,e){var i=t.attr("data-vimeo-id")?"vimeo":t.attr("data-vzaar-id")?"vzaar":"youtube",s=t.attr("data-vimeo-id")||t.attr("data-youtube-id")||t.attr("data-vzaar-id"),n=t.attr("data-width")||this._core.settings.videoWidth,o=t.attr("data-height")||this._core.settings.videoHeight,r=t.attr("href");if(!r)throw new Error("Missing video URL.");if((s=r.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/))[3].indexOf("youtu")>-1)i="youtube";else if(s[3].indexOf("vimeo")>-1)i="vimeo";else{if(!(s[3].indexOf("vzaar")>-1))throw new Error("Video URL not supported.");i="vzaar"}s=s[6],this._videos[r]={type:i,id:s,width:n,height:o},e.attr("data-video",r),this.thumbnail(t,this._videos[r])},n.prototype.thumbnail=function(e,i){var s,n,o,r=i.width&&i.height?"width:"+i.width+"px;height:"+i.height+"px;":"",a=e.find("img"),h="src",l="",c=this._core.settings,d=function(i){n='<div class="owl-video-play-icon"></div>',s=c.lazyLoad?t("<div/>",{class:"owl-video-tn "+l,srcType:i}):t("<div/>",{class:"owl-video-tn",style:"opacity:1;background-image:url("+i+")"}),e.after(s),e.after(n)};if(e.wrap(t("<div/>",{class:"owl-video-wrapper",style:r})),this._core.settings.lazyLoad&&(h="data-src",l="owl-lazy"),a.length)return d(a.attr(h)),a.remove(),!1;"youtube"===i.type?(o="//img.youtube.com/vi/"+i.id+"/hqdefault.jpg",d(o)):"vimeo"===i.type?t.ajax({type:"GET",url:"//vimeo.com/api/v2/video/"+i.id+".json",jsonp:"callback",dataType:"jsonp",success:function(t){o=t[0].thumbnail_large,d(o)}}):"vzaar"===i.type&&t.ajax({type:"GET",url:"//vzaar.com/api/videos/"+i.id+".json",jsonp:"callback",dataType:"jsonp",success:function(t){o=t.framegrab_url,d(o)}})},n.prototype.stop=function(){this._core.trigger("stop",null,"video"),this._playing.find(".owl-video-frame").remove(),this._playing.removeClass("owl-video-playing"),this._playing=null,this._core.leave("playing"),this._core.trigger("stopped",null,"video")},n.prototype.play=function(e){var i,s=t(e.target).closest("."+this._core.settings.itemClass),n=this._videos[s.attr("data-video")],o=n.width||"100%",r=n.height||this._core.$stage.height();this._playing||(this._core.enter("playing"),this._core.trigger("play",null,"video"),s=this._core.items(this._core.relative(s.index())),this._core.reset(s.index()),(i=t('<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>')).attr("height",r),i.attr("width",o),"youtube"===n.type?i.attr("src","//www.youtube.com/embed/"+n.id+"?autoplay=1&rel=0&v="+n.id):"vimeo"===n.type?i.attr("src","//player.vimeo.com/video/"+n.id+"?autoplay=1"):"vzaar"===n.type&&i.attr("src","//view.vzaar.com/"+n.id+"/player?autoplay=true"),t(i).wrap('<div class="owl-video-frame" />').insertAfter(s.find(".owl-video")),this._playing=s.addClass("owl-video-playing"))},n.prototype.isInFullScreen=function(){var e=i.fullscreenElement||i.mozFullScreenElement||i.webkitFullscreenElement;return e&&t(e).parent().hasClass("owl-video-frame")},n.prototype.destroy=function(){var t,e;for(t in this._core.$element.off("click.owl.video"),this._handlers)this._core.$element.off(t,this._handlers[t]);for(e in Object.getOwnPropertyNames(this))"function"!=typeof this[e]&&(this[e]=null)},t.fn.owlCarousel.Constructor.Plugins.Video=n}(window.Zepto||window.jQuery,window,document),function(t,e,i,s){var n=function(e){this.core=e,this.core.options=t.extend({},n.Defaults,this.core.options),this.swapping=!0,this.previous=s,this.next=s,this.handlers={"change.owl.carousel":t.proxy(function(t){t.namespace&&"position"==t.property.name&&(this.previous=this.core.current(),this.next=t.property.value)},this),"drag.owl.carousel dragged.owl.carousel translated.owl.carousel":t.proxy(function(t){t.namespace&&(this.swapping="translated"==t.type)},this),"translate.owl.carousel":t.proxy(function(t){t.namespace&&this.swapping&&(this.core.options.animateOut||this.core.options.animateIn)&&this.swap()},this)},this.core.$element.on(this.handlers)};n.Defaults={animateOut:!1,animateIn:!1},n.prototype.swap=function(){if(1===this.core.settings.items&&t.support.animation&&t.support.transition){this.core.speed(0);var e,i=t.proxy(this.clear,this),s=this.core.$stage.children().eq(this.previous),n=this.core.$stage.children().eq(this.next),o=this.core.settings.animateIn,r=this.core.settings.animateOut;this.core.current()!==this.previous&&(r&&(e=this.core.coordinates(this.previous)-this.core.coordinates(this.next),s.one(t.support.animation.end,i).css({left:e+"px"}).addClass("animated owl-animated-out").addClass(r)),o&&n.one(t.support.animation.end,i).addClass("animated owl-animated-in").addClass(o))}},n.prototype.clear=function(e){t(e.target).css({left:""}).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut),this.core.onTransitionEnd()},n.prototype.destroy=function(){var t,e;for(t in this.handlers)this.core.$element.off(t,this.handlers[t]);for(e in Object.getOwnPropertyNames(this))"function"!=typeof this[e]&&(this[e]=null)},t.fn.owlCarousel.Constructor.Plugins.Animate=n}(window.Zepto||window.jQuery,window,document),function(t,e,i,s){var n=function(e){this._core=e,this._call=null,this._time=0,this._timeout=0,this._paused=!0,this._handlers={"changed.owl.carousel":t.proxy(function(t){t.namespace&&"settings"===t.property.name?this._core.settings.autoplay?this.play():this.stop():t.namespace&&"position"===t.property.name&&this._paused&&(this._time=0)},this),"initialized.owl.carousel":t.proxy(function(t){t.namespace&&this._core.settings.autoplay&&this.play()},this),"play.owl.autoplay":t.proxy(function(t,e,i){t.namespace&&this.play(e,i)},this),"stop.owl.autoplay":t.proxy(function(t){t.namespace&&this.stop()},this),"mouseover.owl.autoplay":t.proxy(function(){this._core.settings.autoplayHoverPause&&this._core.is("rotating")&&this.pause()},this),"mouseleave.owl.autoplay":t.proxy(function(){this._core.settings.autoplayHoverPause&&this._core.is("rotating")&&this.play()},this),"touchstart.owl.core":t.proxy(function(){this._core.settings.autoplayHoverPause&&this._core.is("rotating")&&this.pause()},this),"touchend.owl.core":t.proxy(function(){this._core.settings.autoplayHoverPause&&this.play()},this)},this._core.$element.on(this._handlers),this._core.options=t.extend({},n.Defaults,this._core.options)};n.Defaults={autoplay:!1,autoplayTimeout:5e3,autoplayHoverPause:!1,autoplaySpeed:!1},n.prototype._next=function(s){this._call=e.setTimeout(t.proxy(this._next,this,s),this._timeout*(Math.round(this.read()/this._timeout)+1)-this.read()),this._core.is("interacting")||i.hidden||this._core.next(s||this._core.settings.autoplaySpeed)},n.prototype.read=function(){return(new Date).getTime()-this._time},n.prototype.play=function(i,s){var n;this._core.is("rotating")||this._core.enter("rotating"),i=i||this._core.settings.autoplayTimeout,n=Math.min(this._time%(this._timeout||i),i),this._paused?(this._time=this.read(),this._paused=!1):e.clearTimeout(this._call),this._time+=this.read()%i-n,this._timeout=i,this._call=e.setTimeout(t.proxy(this._next,this,s),i-n)},n.prototype.stop=function(){this._core.is("rotating")&&(this._time=0,this._paused=!0,e.clearTimeout(this._call),this._core.leave("rotating"))},n.prototype.pause=function(){this._core.is("rotating")&&!this._paused&&(this._time=this.read(),this._paused=!0,e.clearTimeout(this._call))},n.prototype.destroy=function(){var t,e;for(t in this.stop(),this._handlers)this._core.$element.off(t,this._handlers[t]);for(e in Object.getOwnPropertyNames(this))"function"!=typeof this[e]&&(this[e]=null)},t.fn.owlCarousel.Constructor.Plugins.autoplay=n}(window.Zepto||window.jQuery,window,document),function(t,e,i,s){var n=function(e){this._core=e,this._initialized=!1,this._pages=[],this._controls={},this._templates=[],this.$element=this._core.$element,this._overrides={next:this._core.next,prev:this._core.prev,to:this._core.to},this._handlers={"prepared.owl.carousel":t.proxy(function(e){e.namespace&&this._core.settings.dotsData&&this._templates.push('<div class="'+this._core.settings.dotClass+'">'+t(e.content).find("[data-dot]").addBack("[data-dot]").attr("data-dot")+"</div>")},this),"added.owl.carousel":t.proxy(function(t){t.namespace&&this._core.settings.dotsData&&this._templates.splice(t.position,0,this._templates.pop())},this),"remove.owl.carousel":t.proxy(function(t){t.namespace&&this._core.settings.dotsData&&this._templates.splice(t.position,1)},this),"changed.owl.carousel":t.proxy(function(t){t.namespace&&"position"==t.property.name&&this.draw()},this),"initialized.owl.carousel":t.proxy(function(t){t.namespace&&!this._initialized&&(this._core.trigger("initialize",null,"navigation"),this.initialize(),this.update(),this.draw(),this._initialized=!0,this._core.trigger("initialized",null,"navigation"))},this),"refreshed.owl.carousel":t.proxy(function(t){t.namespace&&this._initialized&&(this._core.trigger("refresh",null,"navigation"),this.update(),this.draw(),this._core.trigger("refreshed",null,"navigation"))},this)},this._core.options=t.extend({},n.Defaults,this._core.options),this.$element.on(this._handlers)};n.Defaults={nav:!1,navText:['<span aria-label="Previous">&#x2039;</span>','<span aria-label="Next">&#x203a;</span>'],navSpeed:!1,navElement:'button type="button" role="presentation"',navContainer:!1,navContainerClass:"owl-nav",navClass:["owl-prev","owl-next"],slideBy:1,dotClass:"owl-dot",dotsClass:"owl-dots",dots:!0,dotsEach:!1,dotsData:!1,dotsSpeed:!1,dotsContainer:!1},n.prototype.initialize=function(){var e,i=this._core.settings;for(e in this._controls.$relative=(i.navContainer?t(i.navContainer):t("<div>").addClass(i.navContainerClass).appendTo(this.$element)).addClass("disabled"),this._controls.$previous=t("<"+i.navElement+">").addClass(i.navClass[0]).html(i.navText[0]).prependTo(this._controls.$relative).on("click",t.proxy(function(t){this.prev(i.navSpeed)},this)),this._controls.$next=t("<"+i.navElement+">").addClass(i.navClass[1]).html(i.navText[1]).appendTo(this._controls.$relative).on("click",t.proxy(function(t){this.next(i.navSpeed)},this)),i.dotsData||(this._templates=[t('<button role="button">').addClass(i.dotClass).append(t("<span>")).prop("outerHTML")]),this._controls.$absolute=(i.dotsContainer?t(i.dotsContainer):t("<div>").addClass(i.dotsClass).appendTo(this.$element)).addClass("disabled"),this._controls.$absolute.on("click","button",t.proxy(function(e){var s=t(e.target).parent().is(this._controls.$absolute)?t(e.target).index():t(e.target).parent().index();e.preventDefault(),this.to(s,i.dotsSpeed)},this)),this._overrides)this._core[e]=t.proxy(this[e],this)},n.prototype.destroy=function(){var t,e,i,s,n;for(t in n=this._core.settings,this._handlers)this.$element.off(t,this._handlers[t]);for(e in this._controls)"$relative"===e&&n.navContainer?this._controls[e].html(""):this._controls[e].remove();for(s in this.overides)this._core[s]=this._overrides[s];for(i in Object.getOwnPropertyNames(this))"function"!=typeof this[i]&&(this[i]=null)},n.prototype.update=function(){var t,e,i=this._core.clones().length/2,s=i+this._core.items().length,n=this._core.maximum(!0),o=this._core.settings,r=o.center||o.autoWidth||o.dotsData?1:o.dotsEach||o.items;if("page"!==o.slideBy&&(o.slideBy=Math.min(o.slideBy,o.items)),o.dots||"page"==o.slideBy)for(this._pages=[],t=i,e=0,0;t<s;t++){if(e>=r||0===e){if(this._pages.push({start:Math.min(n,t-i),end:t-i+r-1}),Math.min(n,t-i)===n)break;e=0,0}e+=this._core.mergers(this._core.relative(t))}},n.prototype.draw=function(){var e,i=this._core.settings,s=this._core.items().length<=i.items,n=this._core.relative(this._core.current()),o=i.loop||i.rewind;this._controls.$relative.toggleClass("disabled",!i.nav||s),i.nav&&(this._controls.$previous.toggleClass("disabled",!o&&n<=this._core.minimum(!0)),this._controls.$next.toggleClass("disabled",!o&&n>=this._core.maximum(!0))),this._controls.$absolute.toggleClass("disabled",!i.dots||s),i.dots&&(e=this._pages.length-this._controls.$absolute.children().length,i.dotsData&&0!==e?this._controls.$absolute.html(this._templates.join("")):e>0?this._controls.$absolute.append(new Array(e+1).join(this._templates[0])):e<0&&this._controls.$absolute.children().slice(e).remove(),this._controls.$absolute.find(".active").removeClass("active"),this._controls.$absolute.children().eq(t.inArray(this.current(),this._pages)).addClass("active"))},n.prototype.onTrigger=function(e){var i=this._core.settings;e.page={index:t.inArray(this.current(),this._pages),count:this._pages.length,size:i&&(i.center||i.autoWidth||i.dotsData?1:i.dotsEach||i.items)}},n.prototype.current=function(){var e=this._core.relative(this._core.current());return t.grep(this._pages,t.proxy(function(t,i){return t.start<=e&&t.end>=e},this)).pop()},n.prototype.getPosition=function(e){var i,s,n=this._core.settings;return"page"==n.slideBy?(i=t.inArray(this.current(),this._pages),s=this._pages.length,e?++i:--i,i=this._pages[(i%s+s)%s].start):(i=this._core.relative(this._core.current()),s=this._core.items().length,e?i+=n.slideBy:i-=n.slideBy),i},n.prototype.next=function(e){t.proxy(this._overrides.to,this._core)(this.getPosition(!0),e)},n.prototype.prev=function(e){t.proxy(this._overrides.to,this._core)(this.getPosition(!1),e)},n.prototype.to=function(e,i,s){var n;!s&&this._pages.length?(n=this._pages.length,t.proxy(this._overrides.to,this._core)(this._pages[(e%n+n)%n].start,i)):t.proxy(this._overrides.to,this._core)(e,i)},t.fn.owlCarousel.Constructor.Plugins.Navigation=n}(window.Zepto||window.jQuery,window,document),function(t,e,i,s){var n=function(i){this._core=i,this._hashes={},this.$element=this._core.$element,this._handlers={"initialized.owl.carousel":t.proxy(function(i){i.namespace&&"URLHash"===this._core.settings.startPosition&&t(e).trigger("hashchange.owl.navigation")},this),"prepared.owl.carousel":t.proxy(function(e){if(e.namespace){var i=t(e.content).find("[data-hash]").addBack("[data-hash]").attr("data-hash");if(!i)return;this._hashes[i]=e.content}},this),"changed.owl.carousel":t.proxy(function(i){if(i.namespace&&"position"===i.property.name){var s=this._core.items(this._core.relative(this._core.current())),n=t.map(this._hashes,function(t,e){return t===s?e:null}).join();if(!n||e.location.hash.slice(1)===n)return;e.location.hash=n}},this)},this._core.options=t.extend({},n.Defaults,this._core.options),this.$element.on(this._handlers),t(e).on("hashchange.owl.navigation",t.proxy(function(t){var i=e.location.hash.substring(1),s=this._core.$stage.children(),n=this._hashes[i]&&s.index(this._hashes[i]);void 0!==n&&n!==this._core.current()&&this._core.to(this._core.relative(n),!1,!0)},this))};n.Defaults={URLhashListener:!1},n.prototype.destroy=function(){var i,s;for(i in t(e).off("hashchange.owl.navigation"),this._handlers)this._core.$element.off(i,this._handlers[i]);for(s in Object.getOwnPropertyNames(this))"function"!=typeof this[s]&&(this[s]=null)},t.fn.owlCarousel.Constructor.Plugins.Hash=n}(window.Zepto||window.jQuery,window,document),function(t,e,i,s){function n(e,i){var n=!1,o=e.charAt(0).toUpperCase()+e.slice(1);return t.each((e+" "+a.join(o+" ")+o).split(" "),function(t,e){if(r[e]!==s)return n=!i||e,!1}),n}function o(t){return n(t,!0)}var r=t("<support>").get(0).style,a="Webkit Moz O ms".split(" "),h={transition:{end:{WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",transition:"transitionend"}},animation:{end:{WebkitAnimation:"webkitAnimationEnd",MozAnimation:"animationend",OAnimation:"oAnimationEnd",animation:"animationend"}}},l=function(){return!!n("transform")},c=function(){return!!n("perspective")},d=function(){return!!n("animation")};(function(){return!!n("transition")})()&&(t.support.transition=new String(o("transition")),t.support.transition.end=h.transition.end[t.support.transition]),d()&&(t.support.animation=new String(o("animation")),t.support.animation.end=h.animation.end[t.support.animation]),l()&&(t.support.transform=new String(o("transform")),t.support.transform3d=c())}(window.Zepto||window.jQuery,window,document),t(window).load(function(){n(!0)}),t(document).ready(function(){n(),t("ul.nav-tabs li a").on("shown.bs.tab",function(e){var i=t(t(e.target).attr("href")).find(".owl-carousel[data-carousel=owl]:visible"),s=t(t(e.relatedTarget).attr("href")).find(".owl-carousel[data-carousel=owl]");layzyLoadImage(),s.hasClass("owl-loaded")&&s.trigger("destroy.owl.carousel").removeClass("owl-loaded"),i.hasClass("owl-loaded")||n()})}),t(window).resize(function(){n()})}(jQuery);!function(t){"use strict";var a=null;function e(t,a,e){var r=new Date;r.setTime(r.getTime()+24*e*60*60*1e3);var i="expires="+r.toUTCString();document.cookie=t+"="+a+"; "+i+";path=/"}function r(t){for(var a=t+"=",e=document.cookie.split(";"),r=0;r<e.length;r++){for(var i=e[r];" "==i.charAt(0);)i=i.substring(1);if(0==i.indexOf(a))return i.substring(a.length,i.length)}return""}jQuery("body").on("adding_to_cart",function(t,e,r){a=r}),jQuery(document).ready(function(){jQuery("body").hasClass("tbay-disable-ajax-popup-cart")||jQuery("body").on("added_to_cart",function(t,e){if(void 0===a.page){jQuery("#tbay-cart-modal").modal();var r=greenmart_ajax.ajaxurl+"?action=greenmart_add_to_cart_product&product_id="+a.product_id;jQuery.get(r,function(t,a){jQuery("#tbay-cart-modal .modal-body .modal-body-content").html(t)}),jQuery("#tbay-cart-modal").on("hidden.bs.modal",function(){jQuery(this).find(".modal-body .modal-body-content").empty()})}}),t("#productvideo").tbayIframe(),t(document).on("added_to_wishlist removed_from_wishlist",function(){var a=t(".count_wishlist");t.ajax({url:yith_wcwl_l10n.ajax_url,data:{action:"yith_wcwl_update_wishlist_count"},dataType:"json",success:function(t){a.html(t.count)},beforeSend:function(){a.block()},complete:function(){a.unblock()}})}),t(document).on("click",".mini_cart_content a.remove",function(a){a.preventDefault();var e=t(this).attr("data-product_id"),r=t(this).attr("data-cart_item_key"),i=t(this).parents(".mini_cart_item"),d=t(this).closest(".widget_shopping_cart_content");i.block({message:null,overlayCSS:{cursor:"none"}}),t.ajax({type:"POST",dataType:"json",url:wc_add_to_cart_params.ajax_url,data:{action:"product_remove",product_id:e,cart_item_key:r},beforeSend:function(){d.find(".mini_cart_content").append('<div class="ajax-loader-wapper"><div class="ajax-loader"></div></div>'),d.find(".mini_cart_content").fadeTo("slow",.3),a.stopPropagation()},success:function(a){if(a&&!a.error){var r=a.fragments;r&&t.each(r,function(a,e){t(a).replaceWith(e)}),t(".add_to_cart_button.added").each(function(a){t(this).data("product_id")==e&&(t(this).removeClass("added"),t(this).next(".wc-forward").remove())})}}})})}),t(document).on("click",".single_add_to_cart_button",function(a){if(!greenmart_settings.ajax_single_add_to_cart)return;if(t(this).closest("form.cart").find('input[name="greenmart_buy_now"]').length>0&&"1"===t(this).closest("form.cart").find('input[name="greenmart_buy_now"]').val())return;let e=t(this),r=e.closest("form.cart");if(r.hasClass("grouped_form")||0==r.find("input[name=quantity]").length)return;let i=e.val(),d=r.find("input[name=quantity]").val()||1,n=r.find("input[name=product_id]").val()||i,o=r.find("input[name=variation_id]").val()||0;if(n&&!e.is(".disabled")){a.preventDefault();var s={action:"woocommerce_ajax_add_to_cart",page:"single",product_id:n,product_sku:"",quantity:d,variation_id:o};return t(document.body).trigger("adding_to_cart",[e,s]),t.ajax({type:"post",url:wc_add_to_cart_params.ajax_url,data:s,beforeSend:function(t){e.removeClass("added").addClass("loading")},complete:function(t){e.addClass("added").removeClass("loading")},success:function(a){a.error&a.product_url?window.location=a.product_url:(t(document.body).trigger("added_to_cart",[a.fragments,a.cart_hash,e]),t(".woocommerce-notices-wrapper").empty().append(a.notices))}}),!1}}),t(document).on("click",".plus, .minus",function(){var a=t(this).closest(".quantity").find(".qty"),e=parseFloat(a.val()),r=a.data("max"),i=a.data("min"),d=a.data("step");e&&""!==e&&"NaN"!==e||(e=0),""!==r&&"NaN"!==r||(r=""),""!==i&&"NaN"!==i||(i=0),"any"!==d&&""!==d&&void 0!==d&&"NaN"!==parseFloat(d)||(d=1),t(this).is(".plus")?r&&(r==e||e>r)?a.val(r):a.val(e+parseFloat(d)):i&&(i==e||e<i)?a.val(i).trigger("change"):e>0&&a.val(e-parseFloat(d)),a.change()}),t('.tbay-body-woocommerce-quantity-mod .quantity input[type="number"]').change(function(){var a=parseFloat(t(this).val()),e=t(this).data("max"),r=t(this).data("min");a<r?(t(this).val(r),t(this).change()):""!=e&&a>e&&(t(this).val(e),t(this).change()),jQuery(this).parents(".product-content").find(".add_to_cart_button").attr("data-quantity",a)}),t(".thumbnails-image .thumb-link").on("click",function(a){a.preventDefault();var e=t(this).attr("href"),r=t(this).data("image");t(".woocommerce-main-image .featured-image").attr("href",r),t(".woocommerce-main-image .featured-image img").attr("src",e),t(".cloud-zoom").CloudZoom()}),t("body").on("click",".tbay-buy-now",function(a){a.preventDefault();let e=t(this).closest("form.cart"),r=e.find('[type="submit"]'),i=e.find('input[name="greenmart_buy_now"]');r.is(".disabled")?r.trigger("click"):(i.val("1"),e.find(".single_add_to_cart_button").click())}),t("form.cart").change(function(){t(this).find('[type="submit"]').is(".disabled")?t(".tbay-buy-now").addClass("disabled"):t(".tbay-buy-now").removeClass("disabled")}),t.fn.tbayIframe=function(a){var e=this,r=t.extend({classBtn:".tbay-modalButton",defaultW:640,defaultH:360},a);return t(r.classBtn).on("click",function(a){var i=t(this).attr("data-tbayVideoFullscreen")||!1,d={src:t(this).attr("data-tbaySrc"),height:t(this).attr("data-tbayHeight")||r.defaultH,width:t(this).attr("data-tbayWidth")||r.defaultW};i&&(d.allowfullscreen=""),t(e).find("iframe").attr(d)}),this.on("hidden.bs.modal",function(){t(this).find("iframe").html("").attr("src","")}),this},t(document).on("click","#display-mode-grid",function(a){return a.preventDefault(),t(a.currentTarget).addClass("active").next().removeClass("active"),e("display_mode","grid",.1),t(a.currentTarget).parents("#primary").find("div.products").hasClass("products-grid")||(t(a.currentTarget).parents("#primary").find("div.products").fadeOut(0,function(){t(this).addClass("products-grid").removeClass("products-list").fadeIn(300)}),t(a.currentTarget).parents("#primary").find("div.products").find(".product-block").removeClass("list").fadeIn(300).addClass("grid")),!1}),t(document).on("click","#display-mode-list",function(a){return a.preventDefault(),t(a.currentTarget).addClass("active").prev().removeClass("active"),e("display_mode","list",.1),t(a.currentTarget).parents("#primary").find("div.products").hasClass("products-list")||(t(a.currentTarget).parents("#primary").find("div.products").fadeOut(0,function(){t(this).addClass("products-list").removeClass("products-grid").fadeIn(300)}),t(a.currentTarget).parents("#primary").find("div.products").find(".product-block").removeClass("grid").fadeIn(300).addClass("list")),!1}),void 0!=r("display_mode")&&("grid"==r("display_mode")&&(t(".tbay-filter").next("div.products").removeClass("products-list").fadeIn(300),t(".display-mode-warpper").find("#display-mode-grid").addClass("active").next().removeClass("active"),t(".tbay-filter").parents("#primary").find("div.products").find(".product-block").removeClass("list").fadeIn(300).addClass("grid")),"list"==r("display_mode")&&(t(".tbay-filter").parents("#primary").find("div.products").removeClass("products-grid").fadeIn(300),t(".display-mode-warpper").find("#display-mode-list").addClass("active").prev().removeClass("active"),t(".tbay-filter").parents("#primary").find("div.products").find(".product-block").removeClass("grid").fadeIn(300).addClass("list")),t(".tbay-filter").parents("#primary").find("div.products").addClass("products-"+r("display_mode")))}(jQuery);!function(t){"use strict";t.fn.tbayCountDown=function(e){return this.each(function(){new t.tbayCountDown(this,e)})},t.tbayCountDown=function(e,n){if(this.options=t.extend({autoStart:!0,LeadingZero:!0,DisplayFormat:"<div>%%D%% Days</div><div>%%H%% Hours</div><div>%%M%% Minutes</div><div>%%S%% Seconds</div>",FinishMessage:"Expired",CountActive:!0,TargetDate:null},n||{}),null==this.options.TargetDate||""==this.options.TargetDate)return;this.timer=null,this.element=e,this.CountStepper=-1,this.CountStepper=Math.ceil(this.CountStepper),this.SetTimeOutPeriod=1e3*(Math.abs(this.CountStepper)-1)+990;let a=new Date(this.options.TargetDate),i=new Date,o=new Date(a-i);this.CountStepper>0&&(o=new Date(i-a));let s=Math.floor(o.valueOf()/1e3);this.CountBack(s,this)},t.tbayCountDown.fn=t.tbayCountDown.prototype,t.tbayCountDown.fn.extend=t.tbayCountDown.extend=t.extend,t.tbayCountDown.fn.extend({calculateDate:function(t,e,n){var a=(Math.floor(t/e)%n).toString();return this.options.LeadingZero&&a.length<2&&(a="0"+a),"<span>"+a+"</span>"},CountBack:function(t,e){if(t<0)return void(e.element.innerHTML='<div class="lof-labelexpired"> '+e.options.FinishMessage+"</div>");clearInterval(e.timer);let n=e.options.DisplayFormat.replace(/%%D%%/g,e.calculateDate(t,86400,1e5));n=(n=(n=n.replace(/%%H%%/g,e.calculateDate(t,3600,24))).replace(/%%M%%/g,e.calculateDate(t,60,60))).replace(/%%S%%/g,e.calculateDate(t,1,60)),e.element.innerHTML=n,e.options.CountActive&&(e.timer=null,e.timer=setTimeout(function(){e.CountBack(t+e.CountStepper,e)},e.SetTimeOutPeriod))}}),t(document).ready(function(){t('[data-time="timmer"]').each(function(e,n){var a=t(this),i=a.data("date").split("-"),o=a.data("days"),s=a.data("hours"),u=a.data("mins"),r=a.data("secs");a.tbayCountDown({TargetDate:i[0]+"/"+i[1]+"/"+i[2]+" "+i[3]+":"+i[4]+":"+i[5],DisplayFormat:'<div class="times"><div class="day">%%D%% '+o+' </div><div class="hours">%%H%% '+s+' </div><div class="minutes">%%M%% '+u+' </div><div class="seconds">%%S%% '+r+" </div></div>",FinishMessage:""})})})}(jQuery);!function(u){"use strict";jQuery(document).ready(function(u){})}(jQuery);jQuery(document).ready(function ($) {
    'use strict';

    //Block cart on fragment refresh
    $(document.body).on('wc_fragment_refresh', block_cart);

    //Unblock cart
    $(document.body).on('wc_fragments_refreshed wc_fragments_loaded', function () {
        content_height();
    });

    // refresh fragment on document load
    if (!rh_wsc_localize.added_to_cart) {
        $(document.body).trigger('wc_fragment_refresh');
    }

    function update_cartChk() {
        //Refresh checkout page
        if (window.wc_checkout_params && wc_checkout_params.is_checkout === "1") {
            if ($('form.checkout').length === 0) {
                location.reload();
                return;
            }
            $(document.body).trigger("update_checkout");
        }

        //Refresh Cart page
        if (window.wc_add_to_cart_params && window.wc_add_to_cart_params.is_cart && wc_add_to_cart_params.is_cart === "1") {
            $(document.body).trigger("wc_update_cart");
        }
    }

    $(document.body).on('rh_wsc_cart_updated', update_cartChk);


    //Toggle Side Cart
    function toggle_sidecart(toggle_type) {
        // var toggle_element = $('.xoo-wsc-modal , body, html'),
        var toggle_element = $('.xoo-wsc-modal'),
            toggle_class = 'xoo-wsc-active';

        if (toggle_type == 'show') {
            toggle_element.addClass(toggle_class);
        } else if (toggle_type == 'hide') {
            toggle_element.removeClass(toggle_class);
        } else {
            toggle_element.toggleClass('xoo-wsc-active');
        }

        unblock_cart();
    }

    $('.xoo-wsc-basket').on('click', toggle_sidecart);

    if (rh_wsc_localize.trigger_class) {
        $('.' + rh_wsc_localize.trigger_class).on('click', toggle_sidecart);
    }


    //Set Cart content height
    function content_height() {
        var header = $('.xoo-wsc-header').outerHeight(),
            footer = $('.xoo-wsc-footer').outerHeight(),
            screen = $(window).height();

        if (rh_wsc_localize.cont_height == "auto_adjust") {
            var body_height = 'calc(100% - ' + (header + footer) + 'px)';
            if ($('.xoo-wsc-container').outerHeight() > screen) {
                $('.xoo-wsc-container').css({"top": "0", "bottom": "0"});
            }
        } else {
            var body_height = screen - (header + footer);
        }

        $('.xoo-wsc-body').css('height', body_height);

    };

    content_height();

    $(window).resize(function () {
        content_height();
    });


    //Reset cart button/form
    function reset_cart(atc_btn) {
        $('.xoo-wsc-icon-atc', atc_btn).remove();
        var qty_elem = atc_btn.parents('form.cart').find('.qty');
        if (qty_elem.length > 0) qty_elem.val(qty_elem.attr('min') || 1);
        $('.added_to_cart').remove();
    }

    //Auto open Side Cart when item added to cart without ajax
    (function () {
        if (rh_wsc_localize.added_to_cart) {
            var toggled = false;
            $(document).on('wc_fragments_refreshed', function () {
                if (!toggled) {
                    setTimeout(toggle_sidecart, 1, 'show');
                    toggled = true;
                }
            });
        }
    }());


    //Auto open with ajax & reset cart form
    $(document).on('added_to_cart', function (event, fragments, cart_hash, atc_btn) {
        if (rh_wsc_localize.auto_open_cart == 1) {
            setTimeout(toggle_sidecart, 1, 'show');
        }

        if (rh_wsc_localize.atc_reset == 1) {
            reset_cart(atc_btn);
        }

        update_cartChk();
    });


    //Block Cart
    function block_cart() {
        $('.xoo-wsc-updating').show();
    }

    //Unblock cart
    function unblock_cart() {
        $('.xoo-wsc-updating').hide();
    }


    //Close Side Cart
    function close_sidecart(e) {
        $.each(e.target.classList, function (key, value) {
            if (value != 'xoo-wsc-container' && (value == 'xoo-wsc-close' || value == 'xoo-wsc-opac' || value == 'xoo-wsc-basket' || value == 'xoo-wsc-cont')) {
                $('.xoo-wsc-modal , body, html').removeClass('xoo-wsc-active');
            }
        });
    }

    $('body').on('click', '.rhCloseBtn', function (e) {
        e.preventDefault();
        $('.xoo-wsc-modal , body, html').removeClass('xoo-wsc-active');
    });

    $('body').on('click', '.xoo-wsc-close , .xoo-wsc-opac', function (e) {
        e.preventDefault();
        close_sidecart(e);
    });

    $('body').on('click', '.xoo-wsc-cont', function (e) {
        var link = $.trim($(this).attr('href'));
        if (link == "#" || !link) {
            e.preventDefault();
            close_sidecart(e);
        }
    });


    //Add to cart function
    function add_to_cart(atc_btn, product_data) {

        // Trigger event.
        $(document.body).trigger('adding_to_cart', [atc_btn, product_data]);

        $.ajax({
            url: rh_wsc_localize.wc_ajax_url.toString().replace('%%endpoint%%', 'rh_wsc_add_to_cart'),
            type: 'POST',
            data: $.param(product_data),
            success: function (response) {

                add_to_cart_button_check_icon(atc_btn);

                if (response.fragments) {
                    // Trigger event so themes can refresh other areas.
                    $(document.body).trigger('added_to_cart', [response.fragments, response.cart_hash, atc_btn]);
                } else if (response.error) {
                    show_notice('error', response.error);
                    toggle_sidecart('show');
                } else {
                    console.log(response);
                }

            }
        });
    }

    //Update cart
    function update_cart(cart_key, new_qty) {
        block_cart();

        var endpoint = 'rh_wsc_update_cart';
        endpoint += new_qty > 0 ? '&xoo_wsc_qty_update' : '';
        $.ajax({
            url: rh_wsc_localize.wc_ajax_url.toString().replace('%%endpoint%%', endpoint),
            type: 'POST',
            data: {
                cart_key: cart_key,
                new_qty: new_qty
            },
            success: function (response) {
                if (response.fragments) {
                    var fragments = response.fragments,
                        cart_hash = response.cart_hash;

                    //Set fragments
                    $.each(response.fragments, function (key, value) {
                        $(key).replaceWith(value);
                        $(key).stop(true).css('opacity', '1').unblock();
                    });

                    if (wc_cart_fragments_params) {
                        var cart_hash_key = wc_cart_fragments_params.ajax_url.toString() + '-wc_cart_hash';
                        //Set cart hash
                        sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(fragments));
                        localStorage.setItem(cart_hash_key, cart_hash);
                        sessionStorage.setItem(cart_hash_key, cart_hash);
                    }

                    $(document.body).trigger('wc_fragments_loaded');
                    $(document.body).trigger('rh_wsc_cart_updated');

                } else {
                    //Print error
                    show_notice('error', response.error);
                }
            }

        });
    }

    //Remove item from cart
    $(document).on('click', '.xoo-wsc-remove', function (e) {
        e.preventDefault();
        block_cart();
        var product_row = $(this).parents('.xoo-wsc-product');
        var cart_key = product_row.data('xoo_wsc');

        var product_id = $(this).parents('.xoo-wsc-product').data('product_id');

        update_cart(cart_key, 0);

        $('.plusMinusBox_' + product_id).addClass('hidden');
        $('.addToCart_' + product_id).removeClass('added');
    })

    //Add to cart on single page

    $(document).on('submit', 'form.cart', function (e) {

        if (rh_wsc_localize.ajax_atc != 1) return;

        e.preventDefault();
        block_cart();
        var form = $(this), product_id = null;
        var atc_btn = form.find('button[type="submit"]');

        add_to_cart_button_loading_icon(atc_btn);

        var product_data = form.serializeArray();

        //Check for woocommerce custom quantity code
        //https://docs.woocommerce.com/document/override-loop-template-and-show-quantities-next-to-add-to-cart-buttons/
        var has_product_id = false;
        $.each(product_data, function (key, form_item) {
            if (form_item.name === 'product_id' || form_item.name === 'add-to-cart') {
                if (form_item.value) {
                    has_product_id = true;
                    return false;
                }
            }
        })

        //If no product id found , look for the form action URL
        if (!has_product_id) {
            var is_url = form.attr('action').match(/add-to-cart=([0-9]+)/);
            product_id = is_url ? is_url[1] : false;
        }

        // if button as name add-to-cart get it and add to form
        if (atc_btn.attr('name') && atc_btn.attr('name') == 'add-to-cart' && atc_btn.attr('value')) {
            product_id = atc_btn.attr('value');
        }

        if (product_id) {
            product_data.push({name: 'add-to-cart', value: product_id});
        }


        product_data.push({name: 'action', value: 'rh_wsc_add_to_cart'});

        add_to_cart(atc_btn, product_data);//Ajax add to cart
    });

    //Notice Function
    function show_notice(notice_type, notice) {
        $('.xoo-wsc-notice').html(notice).attr('class', 'xoo-wsc-notice').addClass('xoo-wsc-nt-' + notice_type);
        $('.xoo-wsc-notice-box').fadeIn('fast');
        clearTimeout(fadenotice);
        var fadenotice = setTimeout(function () {
            $('.xoo-wsc-notice-box').fadeOut('slow');
        }, 2000);
    }

    //Add to cart preloader
    function add_to_cart_button_loading_icon(atc_btn) {
        if (rh_wsc_localize.atc_icons != 1) return;

        if (atc_btn.find('.xoo-wsc-icon-atc').length !== 0) {
            atc_btn.find('.xoo-wsc-icon-atc').attr('class', 'xoo-wsc-icon-spinner2 xoo-wsc-icon-atc xoo-wsc-active');
        } else {
            atc_btn.append('<span class="xoo-wsc-icon-spinner2 xoo-wsc-icon-atc xoo-wsc-active"></span>');
        }
    }

    //Add to cart check icon
    function add_to_cart_button_check_icon(atc_btn) {
        if (rh_wsc_localize.atc_icons != 1) return;
        // Check icon
        atc_btn.find('.xoo-wsc-icon-atc').attr('class', 'xoo-wsc-icon-checkmark xoo-wsc-icon-atc');
    }

// rhossain area
    // pro version area
    //Plus minus buttons
    $(document).on('click', '.xoo-wsc-chng', function () {
        var _this = $(this), new_qty = 0;
        var qty_element = _this.siblings('.xoo-wsc-qty');
        qty_element.trigger('focusin');
        var input_qty = parseFloat(qty_element.val());

        var step = parseFloat(qty_element.attr('step'));
        var min_value = parseFloat(qty_element.attr('min'));
        var max_value = parseFloat(qty_element.attr('max'));

        var cart_key = _this.parents('.xoo-wsc-product').data('xoo_wsc');
        var product_id = _this.parents('.xoo-wsc-product').data('product_id');

        if (_this.hasClass('xoo-wsc-plus')) {
            new_qty = input_qty + step;

            if (new_qty > max_value && max_value > 0) {
                alert('Maximum Quantity: ' + max_value);
                return;
            }
        } else if (_this.hasClass('xoo-wsc-minus')) {

            new_qty = input_qty - step;
            if (new_qty === 0) {
                _this.parents('.xoo-wsc-product').find('.xoo-wsc-remove').trigger('click');
                $('.plusMinusBox_' + product_id).addClass('hidden');
                $('.addToCart_' + product_id).removeClass('added');
                return;
            } else if (new_qty < min_value) {
                return;
            } else if (input_qty < 0) {
                alert('Invalid');
                return;
            }
        }

        $('.xoo-wsc-qtybox #product_id_' + product_id).val(new_qty);


        let lang = $('.xoo-wsc-qtybox #product_id_' + product_id).data('lang');
        let new_qty_lang = (lang === 'bn') ? convertNumToBn(new_qty.toString()) : new_qty;
        $('.xoo-wsc-qtybox .product_qty_' + product_id).text(new_qty_lang);

        update_cart(cart_key, new_qty);
    });

    function convertNumToBn(input) {
        let bengali = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

        function convert(input) {
            var output = '';
            for (var i = 0; i < input.length; ++i) {
                output += bengali[input[i]];
            }
            return output;
        }

        return convert(input);
    }

    //Show Promo input
    $(document).on('click', '.xoo-wsc-coupon-trigger', function () {
        $('.xoo-wsc-coupon').css('display', 'block');
        $('.xoo-wsc-coupon').toggleClass('active');
        $(this).toggleClass('active');
        $('span.couponArrowIcon').html('<i class="fa fa-angle-down"></i>');
    });
    //Hide Promo input
    $(document).on('click', '.xoo-wsc-coupon-close', function () {
        $('.xoo-wsc-coupon').css('display', 'none');
        $('.xoo-wsc-coupon').toggleClass(' ');
        $(this).toggleClass(' ');
        $('span.couponArrowIcon').html('<i class="fa fa-angle-up"></i>');
    });

    //Remove promo code
    $(document).on('click', '.xoo-wsc-remove-coupon', function (e) {

        var coupon = $(this).attr('data-coupon');

        if (!coupon.length) {
            e.preventDefault();
        }

        $(this).css("pointer-events", "none");

        block_cart();

        var data = {
            security: rh_wsc_localize.remove_coupon_nonce,
            coupon: coupon
        }

        $.ajax({
            url: rh_wsc_localize.wc_ajax_url.toString().replace('%%endpoint%%', 'remove_coupon'),
            type: 'POST',
            data: data,
            success: function (response) {
                show_notice('error', response);
                $(document.body).trigger('removed_coupon', [coupon]);
                $(document.body).trigger('wc_fragment_refresh');

            },
            complete: function () {
                $('.xoo-wsc-block-cart').hide();
            }
        });

    });

    //coupon submitting
    $(document).on('click', '.rh-wsc-coupon-submit', function (ev) {
        ev.preventDefault();
        var resultElem = $('div.rh-wsc-coupon-result');

        // Get the coupon code
        var code = $('input#xoo-wsc-coupon-code').val();
        if (code == '') {
            var error = '<ul class="woocommerce-error" role="alert"><li>Code text field can not be empty.</li></ul>';
            resultElem.html(error);
            return;
        }

        // We are going to send this for processing
        var data = {
            action: 'spyr_coupon_redeem_handler',
            coupon_code: code
        };

        $('.rh-wsc-updating').show();
        // Send it over to WordPress.
        $.post(woocommerce_params.ajax_url, data, function (returned_data) {
            resultElem.html(returned_data.notices);
            var totalMoney = returned_data.totalMoneyCount;
            $('span.totalMoneyCount').html(totalMoney);
            $('span.rh-wsc-items-subtotal').html(totalMoney);
            $('span.rh-cart-discount-coupons').html(returned_data.coupons);
            $('.rh-wsc-updating').hide();
        });
    });

    //after added to cart
    $(document.body).on('added_to_cart', function (e, fragments, cart_hash, this_button) {
        var product_id = this_button.context.dataset.product_id;
        $('.plusMinusBox_' + product_id).removeClass('hidden');
    });
});