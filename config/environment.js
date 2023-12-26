/* eslint-env node */
'use strict';
const { name, fleetbase } = require('../package');

module.exports = function (environment) {
    let ENV = {
        modulePrefix: name,
        environment,
        mountedEngineRoutePrefix: getMountedEngineRoutePrefix(),

        defaultValues: {
            driverImage: getenv('DEFAULT_DRIVER_IMAGE', 'https://s3.ap-southeast-1.amazonaws.com/flb-assets/static/no-avatar.png'),
            userImage: getenv('DEFAULT_USER_IMAGE', 'https://s3.ap-southeast-1.amazonaws.com/flb-assets/static/no-avatar.png'),
            contactImage: getenv('DEFAULT_CONTACT_IMAGE', 'https://s3.ap-southeast-1.amazonaws.com/flb-assets/static/no-avatar.png'),
            vendorImage: getenv('DEFAULT_VENDOR_IMAGE', 'https://s3.ap-southeast-1.amazonaws.com/flb-assets/static/no-avatar.png'),
            vehicleImage: getenv('DEFAULT_VEHICLE_IMAGE', 'https://s3.ap-southeast-1.amazonaws.com/flb-assets/static/vehicle-placeholder.png'),
            vehicleAvatar: getenv('DEFAUL_VEHICLE_AVATAR', 'https://flb-assets.s3-ap-southeast-1.amazonaws.com/static/vehicle-icons/mini_bus.svg'),
        },
    };

    return ENV;
};

function getMountedEngineRoutePrefix() {
    let mountedEngineRoutePrefix = 'fleet-ops';
    if (fleetbase && typeof fleetbase.route === 'string') {
        mountedEngineRoutePrefix = fleetbase.route;
    }

    return `console.${mountedEngineRoutePrefix}.`;
}

function getenv(variable, defaultValue = null) {
    return process.env[variable] !== undefined ? process.env[variable] : defaultValue;
}
