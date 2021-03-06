/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

/* TODO
 this.addOptionalCharacteristic(Characteristic.StatusActive);
 this.addOptionalCharacteristic(Characteristic.StatusFault);
 this.addOptionalCharacteristic(Characteristic.StatusTampered);
 */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_SmokeSensor(acc, settings) {
        acc.addService(Service.SmokeSensor)
            .getCharacteristic(Characteristic.SmokeDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'SmokeDetected');
                const smoke = mqttStatus[settings.topic.statusSmokeDetected] === settings.payload.onSmokeDetected ?
                    Characteristic.SmokeDetected.SMOKE_DETECTED :
                    Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;

                log.debug('> hap re_get', settings.name, 'SmokeDetected', smoke);
                callback(null, smoke);
            });

        mqttSub(settings.topic.statusSmokeDetected, val => {
            const smoke = val === settings.payload.onSmokeDetected ?
                Characteristic.SmokeDetected.SMOKE_DETECTED :
                Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;
            log.debug('> hap update', settings.name, 'SmokeDetected', smoke);
            acc.getService(Service.SmokeSensor)
                .updateCharacteristic(Characteristic.SmokeDetected, smoke);
        });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            acc.getService(Service.SmokeSensor)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] !== settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val !== settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                log.debug('> hap update', settings.name, 'StatusLowBattery', bat);
                acc.getService(Service.SmokeSensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }
    };
};
