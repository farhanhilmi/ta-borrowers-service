import _ from 'underscore';

export const toTitleCase = (str) => {
    return str
        .split(' ')
        .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
        .join(' ');
};

/**
 * Validate request payload for required fields
 * @param {Object} payload - Object of request payload
 * @param {Array} requiredFields - Array of required fields
 * @returns {String} String of error fields
 */
export const validateRequestPayload = (payload, requiredFields = []) => {
    let errorFields = [];
    requiredFields.forEach((field) => {
        if (!payload[field]) {
            errorFields.push(field);
        }
    });

    return errorFields.join(', ');

    // if (errorFields.length > 0) {
    //     return false, errorFields;
    //     // throw new ValidationError(
    //     //     `${errorFields.join(', ')} field(s) are required!`,
    //     // );
    // }

    // return true, errorFields;
};

/**
 * Remove keys from object and return new object without removed keys
 * @param {Object} obj
 * @param {Array} array of keys to be removed
 * @returns {Object} return object without removed keys
 */
export const omit = (obj, keys) => {
    if (typeof obj !== 'object') {
        return _.omit(JSON.parse(obj), keys);
    }
    return _.omit(obj, keys);
};
