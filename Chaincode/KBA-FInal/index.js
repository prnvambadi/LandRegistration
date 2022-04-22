/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const PropertyContract = require('./lib/property-contract');
const SellbuyorderContract = require('./lib/sellbuyorder-contract');

module.exports.PropertyContract = PropertyContract;
module.exports.SellbuyorderContract = SellbuyorderContract;
module.exports.contracts = [ PropertyContract,SellbuyorderContract ];
