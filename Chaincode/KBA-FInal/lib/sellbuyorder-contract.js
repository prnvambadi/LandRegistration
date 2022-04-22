/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const  PropertyContract  = require('./lib/property-contract-contract');


async function getCollectionName(ctx) {
    const collectionName = `CollectionOrder`;
    return collectionName;
}

class SellbuyorderContract extends Contract {

    async sellbuyorderExists(ctx, sellbuyorderId) {
        const collectionName = await getCollectionName(ctx);
        const data = await ctx.stub.getPrivateDataHash(collectionName, sellbuyorderId);
        return (!!data && data.length > 0);
    }

    async createSellbuyorder(ctx, sellbuyorderId) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'buyer-blockland-com') {
            const exists = await this.sellbuyorderExists(ctx, sellbuyorderId);
            if (exists) {
                throw new Error(`The order ${sellbuyorderId} already exists`);
            }
            const orderAsset = {};
            const transientData = ctx.stub.getTransient();
            if (
                transientData.size === 0 ||
                !transientData.has('propertyDetails') ||
                !transientData.has('propertyLoc') ||
                !transientData.has('buyerName') ||
                !transientData.has('buyerOffer')
            ) {
                throw new Error(
                    'The privateValue key was not specified in transient data. Please try again.'
                );
            }
            orderAsset.propertyDetails = transientData.get('propertyDetails').toString();
            orderAsset.propertyLoc = transientData.get('propertyLoc').toString();
            orderAsset.buyerName = transientData.get('buyerName').toString();
            orderAsset.buyerOffer = transientData.get('buyerOffer').toString();
            orderAsset.assetType = 'buyorder';

            const collectionName = await getCollectionName(ctx);
            await ctx.stub.putPrivateData(
                collectionName,
                sellbuyorderId,
                Buffer.from(JSON.stringify(orderAsset))
            );
        } else {
            return `Under following MSP: ${mspID} cannot able to perform this action`;
        }
    }


    async readSellbuyorder(ctx, sellbuyorderId) {
        const exists = await this.sellbuyorderExists(ctx, sellbuyorderId);
        if (!exists) {
            throw new Error(`The asset sellbuyorder ${sellbuyorderId} does not exist`);
        }
        let privateDataString;
        const collectionName = await getCollectionName(ctx);
        const privateData = await ctx.stub.getPrivateData(collectionName, sellbuyorderId);
        privateDataString = JSON.parse(privateData.toString());
        return privateDataString;
    }

    async deleteSellbuyorder(ctx, sellbuyorderId) {
        const mspId = ctx.clientIdentity.getMSPID();
        if (mspId === 'seller-blockchannel-com') {
            const exists = await this.sellbuyorderExists(ctx, sellbuyorderId);
            if (!exists) {
                throw new Error(`The asset sellbuyorder ${sellbuyorderId} does not exist`);
            }
            const collectionName = await getCollectionName(ctx);
            await ctx.stub.deletePrivateData(collectionName, sellbuyorderId);
        } else {
            return `not authorized `;
        }

    }

    async queryAllOrders(ctx, queryString) {
        if (queryString.length === 0) {
            queryString = JSON.stringify({
                selector: {
                    assetType: 'buyorder',
                },
            });
        }

        const collectionName = await getCollectionName(ctx);
        let resultsIterator = await ctx.stub.getPrivateDataQueryResult(collectionName,queryString);

        //let propertyContract = new PropertyContract();
        let result = await this.getAllResults(resultsIterator.iterator);

        return JSON.stringify(result);


    }
    async getAllResults(iterator) {
        let allResult = [];

        for (
            let res = await iterator.next();
            !res.done;
            res = await iterator.next()
        ) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                jsonRes.Key = res.value.key;
                jsonRes.Record = JSON.parse(res.value.value.toString());
                allResult.push(jsonRes);
            }
        }
        await iterator.close();
        return allResult;
    }
    async getOrdersByRange(ctx, startKey, endKey) {
        const collectionName = await getCollectionName(ctx);
        let resultsIterator = await ctx.stub.getPrivateDataByRange(
            collectionName,
            startKey,
            endKey
        );
        let result = await this.getAllResults(resultsIterator.iterator);
        return JSON.stringify(result);
    } 
     async getAllResults(iterator) {
        let allResult = [];

        for (
             let res = await iterator.next();
            !res.done;
            res = await iterator.next()
        ) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                jsonRes.Key = res.value.key;
                jsonRes.Record = JSON.parse(res.value.value.toString());
                 allResult.push(jsonRes);
             }
         }
         await iterator.close();
         return allResult;
     }


}

module.exports = SellbuyorderContract;
