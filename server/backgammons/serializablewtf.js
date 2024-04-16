const prioritetSerial = Symbol("prioritetSerial")
module.exports.serializable = class serializable {
    static prioritetSerial = prioritetSerial;

    get [prioritetSerial]() { return this.json; } //standart links
};