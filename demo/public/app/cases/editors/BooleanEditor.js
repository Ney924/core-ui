
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        booleanValue: true
    });

    return new CanvasView({
        view: new core.form.editors.BooleanEditor({
            model,
            key: 'booleanValue',
            changeMode: 'keydown',
            autocommit: true,
            displayText: 'Some Text'
        }),
        presentation: '{{#if booleanValue}}true{{else}}false{{/if}}',
        isEditor: true
    });
}
