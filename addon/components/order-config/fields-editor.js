import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action, setProperties } from '@ember/object';
import { isArray } from '@ember/array';
import { classify, underscore } from '@ember/string';
import groupBy from '@atomizedev/ember-core/utils/macros/group-by';
import generateUuid from '@atomizedev/ember-core/utils/generate-uuid';

export default class OrderConfigFieldsEditorComponent extends Component {
    constructor() {
        super(...arguments);
        const { orderConfig } = this.args;

        if (isArray(orderConfig.meta.fields)) {
            this.fields = orderConfig.meta.fields;
        }
    }

    @service modalsManager;
    @service notifications;

    @groupBy('fields', 'group') groupedMetaFields;

    @tracked fields = [];
    @tracked metaFieldTypes = [
        {
            label: 'Text Field',
            key: 'text',
        },
        {
            label: 'Boolean',
            description: 'Allows user to toggle a true or false property by checkbox',
            key: 'boolean',
        },
        {
            label: 'Dropdown Select',
            description: 'Allows user to select an option from a dropdown of options',
            key: 'select',
            hasOptions: true,
        },
        {
            label: 'Datetime Selector',
            description: 'Allows user to select a date & time',
            key: 'datetime',
        },
        {
            label: 'Port Selector',
            description: 'Allows user to select a port',
            serialize: 'model:port',
            key: 'port',
        },
        {
            label: 'Vessel Selector',
            description: 'Allows user to select a vessel',
            serialize: 'model:vessel',
            key: 'vessel',
        },
    ];

    @action sendAction(action) {
        const actionName = `on${classify(action)}`;
        const params = [...arguments];

        params.shift();

        if (typeof this.args[actionName] === 'function') {
            this.args[actionName](...params);
        }
    }

    @action moveMetaField(el, target) {
        const { fields } = this;
        const { metaFieldKey } = el.dataset;
        const { metaGroupKey } = target.dataset;

        // get the index of the moved metafield
        const metaFieldIndex = fields.findIndex((field) => field.key === metaFieldKey);

        // get the meta field and update the group
        const metaField = fields[metaFieldIndex];

        if (!metaField) {
            return;
        }

        metaField.group = metaGroupKey;

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(fields);
        }
    }

    @action addMetaFieldGroup() {
        this.modalsManager.show('modals/meta-field-group-form', {
            title: 'Add a new group of meta fields',
            groupName: null,
            confirm: (modal) => {
                const groupName = modal.getOption('groupName');

                if (typeof groupName !== 'string') {
                    return this.notifications.warning('No group name entered.');
                }

                const group = underscore(groupName.toLowerCase());

                modal.startLoading();
                this.addField(group);
                modal.done();
            },
        });
    }

    @action addField(group = '_untitled') {
        this.fields.pushObject({
            id: generateUuid(),
            label: null,
            key: null,
            type: 'text',
            kvOptions: false,
            group,
        });

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(this.fields);
        }
    }

    @action removeField(metaField) {
        const { fields } = this;

        fields.removeObject(metaField);

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(fields);
        }
    }

    @action setFieldLabel(metaField, { target }) {
        const { value } = target;
        const label = value || '';
        const key = underscore(label.toLowerCase());

        setProperties(metaField, { label, key });

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(this.fields);
        }
    }

    @action addMetaFieldOption(metaField) {
        const options = metaField.options || [];
        const option = { id: generateUuid(), value: '' };

        if (metaField.kvOptions) {
            option['key'] = '';
        }

        options.pushObject(option);
        setProperties(metaField, { options });

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(this.fields);
        }
    }

    @action removeMetaFieldOption(metaField, option) {
        if (metaField.options.length === 1) {
            return;
        }

        metaField.options.removeObject(option);

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(this.fields);
        }
    }

    @action toggleMetaFieldKv(metaField, useKvOptions) {
        setProperties(metaField, { useKvOptions, options: [] });

        this.addMetaFieldOption(metaField);

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(this.fields);
        }
    }

    @action toggleMetaFieldHumanizeOptions(metaField, humanizeOptions) {
        setProperties(metaField, { humanizeOptions, options: [] });

        this.addMetaFieldOption(metaField);

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(this.fields);
        }
    }

    /* eslint no-unused-vars: "off" */
    @action sortMetaFieldOptions(metaField, el, target) {
        // console.log(`[sortMetaFieldOptions()]`, ...arguments);
        // const { fields } = this;
        // const { index } = el.dataset;
        // const parentEl = el.parentElement();
        // console.log(parentEl);
        // const { metaGroupKey } = target.dataset;
        // // get the index of the moved metafield
        // const metaFieldIndex = fields.findIndex((field) => field.key === metaFieldKey);
        // // get the meta field and update the group
        // const metaField = fields[metaFieldIndex];
        // if (!metaField) {
        //     return;
        // }
        // metaField.group = metaGroupKey;
        // if (typeof this.args.onFieldsChanged === 'function') {
        //     this.args.onFieldsChanged(fields);
        // }
    }

    @action removeGroup(group) {
        const fields = this.fields.filter((metaField) => metaField.group !== group);
        this.fields = fields;

        if (typeof this.args.onFieldsChanged === 'function') {
            this.args.onFieldsChanged(fields);
        }
    }
}
