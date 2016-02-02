/**
 * Developer: Stepan Burguchev
 * Date: 7/6/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import { helpers } from '../utils/utilsApi';
import FadingPanelView from '../views/FadingPanelView';

var state = {};

var classes = {
    HIDDEN: 'hidden'
};

var windowService = {
    initialize: function (options) {
        helpers.ensureOption(options, 'fadingRegion');
        helpers.ensureOption(options, 'popupRegion');

        state.options = options;
        state.fadingRegion = options.fadingRegion;
        state.popupRegion = options.popupRegion;
        state.ui = options.ui;

        state.fadingPanelView = new FadingPanelView();
        state.fadingRegion.show(state.fadingPanelView);
        this.listenTo(state.fadingPanelView, 'click', this.__onFadingPanelClick);
    },

    showPopup: function (view, options) {
        this.fadeIn(options);
        state.ui.popupRegion.removeClass(classes.HIDDEN);
        state.popupRegion.show(view);
    },

    closePopup: function () {
        this.fadeOut();
        state.popupRegion.reset();
        state.ui.popupRegion.addClass(classes.HIDDEN);
    },

    fadeIn: function (options) {
        state.ui.fadingRegion.removeClass(classes.HIDDEN);
        state.fadingPanelView.fadeIn(options);
    },

    fadeOut: function () {
        state.fadingPanelView.fadeOut();
        state.ui.fadingRegion.addClass(classes.HIDDEN);
        this.trigger('fadeOut');
    },

    __onFadingPanelClick: function (view, options) {
        if (!options || options.fadeOut !== false) {
            this.fadeOut();
        }
    }
};

_.extend(windowService, Backbone.Events);

export default windowService;
