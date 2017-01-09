/**
 * Developer: Ksenia Kartvelishvili
 * Date: 9/9/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

'use strict';

import { Handlebars, $ } from '../../../libApi';
import template from '../templates/PopupStack.hbs';

let classes = {
    POPUP_REGION: 'js-popup-region-',
    POPUP_FADE: 'popup-fade'
};

const POPUP_ID_PREFIX = 'popup-region-';

export default Marionette.LayoutView.extend({
    initialize () {
        this.__stack = [];
        this.__forceFadeBackground = false;
    },

    template: Handlebars.compile(template),

    ui: {
        fadingPanel: '.js-fading-panel'
    },

    showPopup (view, options) {
        let { fadeBackground, transient, hostEl } = options;

        if (!transient) {
            this.__removeTransientPopups();
        }

        let popupId = _.uniqueId(POPUP_ID_PREFIX);
        let regionEl = $(`<div data-popup-id="${popupId}" class="js-core-ui__global-popup-region">`);
        let parentPopupId = null;
        if (hostEl) {
            parentPopupId = $(hostEl).closest('.js-core-ui__global-popup-region').data('popup-id') || null;
        }
        let config = {
            view,
            options,
            regionEl,
            popupId,
            parentPopupId
        };

        if (parentPopupId) {
            // If there is a child popup, it must be closed:
            // 1. There might be nested dropdowns
            // 2. There can't be dropdowns opened on the same level
            let childPopupDef = this.__stack.find(x => x.parentPopupId === parentPopupId);
            if (childPopupDef) {
                this.closePopup(childPopupDef.popupId);
            }
        }

        this.$el.append(regionEl);
        this.addRegion(popupId, { el: regionEl });
        this.getRegion(popupId).show(view);

        if (fadeBackground) {
            let lastFaded = _.last(this.__stack.filter(x => x.options.fadeBackground));
            if (lastFaded) {
                lastFaded.regionEl.removeClass(classes.POPUP_FADE);
            } else {
                this.__toggleFadedBackground(true);
            }
            regionEl.addClass(classes.POPUP_FADE);
        }

        this.__stack.push(config);
        return popupId;
    },

    closePopup (popupId = null) {
        if (this.__stack.length === 0) {
            return;
        }

        let targets;
        let popupDef = this.__stack.find(x => x.popupId === popupId);
        if (popupDef) {
            if (!popupDef.options.transient) {
                this.__removeTransientPopups();
            }
            // All the children of the popup will also be closed
            let index = this.__stack.indexOf(popupDef);
            if (index !== -1) {
                targets = this.__stack.slice(index);
            }
        } else if (popupId) {
            // If we don't find the popup, it must have been closed so the job is done
            targets = [];
        } else {
            // Close all transient popups and the top-most non-transient
            this.__removeTransientPopups();
            let topMostNonTransient = _.last(this.__stack);
            if (topMostNonTransient) {
                targets = [ topMostNonTransient ];
            }
        }
        targets.reverse().forEach(pd => {
            this.__removePopup(pd);
        });

        let lastFaded = _.last(this.__stack.filter(x => x.options.fadeBackground));
        if (lastFaded) {
            lastFaded.regionEl.addClass(classes.POPUP_FADE);
        } else {
            this.__toggleFadedBackground(this.__forceFadeBackground);
        }
    },

    __removeTransientPopups () {
        this.__stack.filter(x => x.options.transient).reverse().forEach(popupDef => {
            this.__removePopup(popupDef);
        });
    },

    __removePopup (popupDef) {
        this.removeRegion(popupDef.popupId);
        popupDef.regionEl.remove();
        this.__stack.splice(this.__stack.indexOf(popupDef), 1);
        this.trigger('popup:close', popupDef.popupId);
    },

    get (popupId) {
        let index = this.__stack.findIndex(x => x.popupId === popupId);
        if (index === -1) {
            return [];
        }
        return this.__stack.slice(index).map(x => x.view);
    },

    fadeBackground (fade) {
        this.__forceFadeBackground = fade;
        this.__toggleFadedBackground(this.__forceFadeBackground || this.__stack.find(x => x.options.fadeBackground));
    },

    __toggleFadedBackground (fade) {
        this.ui.fadingPanel.toggleClass('fadingPanel_open', fade);
    }
});
