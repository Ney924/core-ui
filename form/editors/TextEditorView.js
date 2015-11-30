/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib', 'text!./templates/textEditor.html', './base/BaseItemEditorView', 'core/services/LocalizationService', 'core/utils/utilsApi'],
    function (lib, template, BaseItemEditorView, LocalizationService, utilsApi) {
        'use strict';

        var changeMode = {
            blur: 'change',
            keydown: 'keydown',
            input: 'input'
        };

        var defaultOptions = {
            changeMode: 'blur',
            emptyPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.TEXTEDITOR.PLACEHOLDER'),
            readonlyPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.TEXTEDITOR.READONLYPLACEHOLDER'),
            disablePlaceholder: LocalizationService.get('CORE.FORM.EDITORS.TEXTEDITOR.DISABLEPLACEHOLDER'),
            maxLength: null,
            readonly: false,
            mask: null,
            maskPlaceholder: '_',
            maskOptions: {}
        };

        /**
         * Some description for initializer
         * @name TextEditorView
         * @memberof module:core.form.editors
         * @class TextEditorView
         * @description TextArea editor
         * @extends module:core.form.editors.base.BaseItemEditorView {@link module:core.form.editors.base.BaseItemEditorView}
         * @param {Object} options Constructor
         * @param {Object} [options.schema] Scheme
         * @param {String} [options.changeMode=blur] Определяет, в какой момент происходит обновления значения (keydown/blur/input)
         * @param {Boolean} [options.enabled=true] Доступ к редактору разрешен
         * @param {Boolean} [options.forceCommit=false] Обновлять значение независимо от ошибок валидации
         * @param {String} [options.mask] Маска ввода
         * @param {String} [options.maxLength] Максимальное количество символов
         * @param {String} [options.maskOptions] Опции маски
         * @param {String} [options.maskPlaceholder=_] placeholder маски
         * @param {Boolean} [options.readonly=false] Редактор доступен только для просмотра
         * @param {Array(Function1,Function2,...)} [options.validators] Массив функций валидации
         * */
        Backbone.Form.editors.Text = BaseItemEditorView.extend({
            initialize: function (options) {
                options = options || {};
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.placeholder = this.options.emptyPlaceholder;
            },

            onShow: function() {
                if (this.options.mask) {
                    this.ui.input.inputmask(_.extend({
                        mask: this.options.mask,
                        placeholder: this.options.maskPlaceholder,
                        autoUnmask: true
                    }, this.options.maskOptions || {}));
                }
            },

            focusElement: '.js-input',

            ui: {
                input: '.js-input'
            },

            className: 'l-field',

            template: Handlebars.compile(template),

            templateHelpers: function () {
                return this.options;
            },

            events: {
                'keyup @ui.input': '__keyup',
                'change @ui.input': '__change',
                'input @ui.input': '__change'
            },

            __keyup: function () {
                if (this.options.changeMode === changeMode.keydown) {
                    this.__value(this.ui.input.val(), false, true);
                }

                this.trigger('keyup', this);
            },
            
            __change: function () {
                this.__value(this.ui.input.val(), false, true);
            },

            setValue: function (value) {
                this.__value(value, true, false);
            },

            setPermissions: function (enabled, readonly) {
                BaseItemEditorView.prototype.setPermissions.call(this, enabled, readonly);
                this.setPlaceholder();
            },

            setPlaceholder: function () {
                if (!this.getEnabled() || this.getReadonly()) {
                    this.placeholder = '';
                } else {
                    this.placeholder = this.options.emptyPlaceholder;
                }

                this.ui.input.prop('placeholder', this.placeholder);
            },

            __setEnabled: function (enabled) {
                BaseItemEditorView.prototype.__setEnabled.call(this, enabled);
                this.ui.input.prop('disabled', !enabled);
            },

            __setReadonly: function (readonly) {
                BaseItemEditorView.prototype.__setReadonly.call(this, readonly);
                if (this.getEnabled()) {
                    this.ui.input.prop('readonly', readonly);
                }
            },

            onRender: function () {
                this.ui.input.val(this.getValue() || '');
                
                // Keyboard shortcuts listener
                if (this.keyListener) {
                    this.keyListener.reset();
                }
                this.keyListener = new lib.keypress.Listener(this.ui.input[0]);
            },

            addKeyboardListener: function (key, callback) {
                if (!this.keyListener) {
                    utilsApi.helpers.throwInvalidOperationError('You must apply keyboard listener after \'render\' event has happened.');
                }
                var keys = key.split(',');
                _.each(keys, function (k) {
                    this.keyListener.simple_combo(k, callback);
                }, this);
            },

            __value: function (value, updateUi, triggerChange) {
                if (this.value === value) {
                    return;
                }
                this.value = value;
                if (updateUi) {
                    this.ui.input.val(value);
                }
                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            select: function () {
                this.ui.input.select();
            },

            deselect: function () {
                this.ui.input.deselect();
            }
        });

        return Backbone.Form.editors.Text;
    });
