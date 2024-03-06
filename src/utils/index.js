'use strict';

const _ = require('lodash');

const getInfoData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds);
    
}
module.exports = {getInfoData}