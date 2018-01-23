
//flow
import NotificationCollectionView from './toastNotification/views/NotificationCollectionView';

const defaultTimeOfShow = 12000;

export default class ToastNotificationService {
    static initialize(options = {}) {
        this.notificationCollection = new Backbone.Collection();
        options.toastNotificationRegion.show(new NotificationCollectionView({
            collection: this.notificationCollection
        }));
        options.toastNotificationRegionEl.show();
        this.notificationTypes = {
            INFO: 'Info',
            ERROR: 'Error',
            SUCCESS: 'Success'
        };
        Object.assign(this, Backbone.Events);
    }

    static add(message, type, time, action) {
        if (!message) {
            return;
        }
        let text = message;
        let title = null;
        if (_.isObject(message)) {
            text = message.text;
            title = message.title;
        }
        this.notificationCollection.add(new Backbone.Model({
            type,
            title,
            text,
            time: time === 0 ? time : time || defaultTimeOfShow,
            action: {
                waitForResponse: action.waitForResponse,
                handler: action.handler
            }
        }), { at: this.notificationCollection.length });

        this.trigger('publish:notification', {
            message: title || text,
            affectedText: title ? text : '',
            severity: type || 'Info'
        });
    }
}
