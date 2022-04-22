/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const SellbuyorderContract = require('./sellbuyorder-contract')

class PropertyContract extends Contract {

    async propertyExists(ctx, propertyId) {
        const buffer = await ctx.stub.getState(propertyId);
        return (!!buffer && buffer.length > 0);
    }

    async createProperty(
        ctx, 
        propertyId,
        propCo_ordinates,
        propertyLoc,
        propertyDetails,
        sellerprice,
        city,
        state,
        podHash,
        ownerName
        ){
        const mspId = ctx.clientIdentity.getMSPID();
        if(mspId === 'seller-blockland-com') {
            const exists = await this.propertyExists(ctx, propertyId);
            if (exists) {
                throw new Error(`The property ${propertyId} already exists`);
            }
            const propertyAsset = { 
                propCo_ordinates,
                propertyLoc,
                propertyDetails,
                sellerprice,
                city,
                state,
                podHash,
                ownedBy:ownerName,
                assetType: 'property',
                status : '1st Owner'
             };
            const buffer = Buffer.from(JSON.stringify(propertyAsset));
            await ctx.stub.putState(propertyId, buffer);
            let addPropertyEventData = { Type: 'Property Creation', PropertyLoc: propertyLoc };
            await ctx.stub.setEvent('addPropertyEvent',
            Buffer.from(JSON.stringify(addPropertyEventData)));
        }
        else {
            return `not authorized to create a property login as Seller`;
        }
       
    }

    async readProperty(ctx, propertyId) {
        const exists = await this.propertyExists(ctx, propertyId);
        if (!exists) {
            throw new Error(`The property ${propertyId} does not exist`);
        }
        const buffer = await ctx.stub.getState(propertyId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async deleteProperty(ctx, propertyId) {
        const mspId = ctx.clientIdentity.getMSPID();
        if(mspId === 'seller-blockland-com') {
            const exists = await this.propertyExists(ctx, propertyId);
        if (!exists) {
            throw new Error(`The property ${propertyId} does not exist`);
        }
        await ctx.stub.deleteState(propertyId);
        }
        else{
            return `not authorized to perform this action`;
        }
        
    }
    async queryAllProperty(ctx) {
        const queryString = {
            selector: {
                assetType: 'property',
            },
            sort: [{ city: 'asc' }],
        };
        let resultIterator = await ctx.stub.getQueryResult(
            JSON.stringify(queryString)
        );
        let result = await this.getAllResults(resultIterator, false);
        return JSON.stringify(result);
    }
    

    async getAllResults(iterator, isHistory) {
        let allResult = [];

        for (
            let res = await iterator.next();
            !res.done;
            res = await iterator.next()
        ) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.timestamp = res.value.timestamp;
                    jsonRes.Value = JSON.parse(res.value.value.toString());
                } else {
                    jsonRes.Key = res.value.key;
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                }
                allResult.push(jsonRes);
            }
        }
        await iterator.close();
        return allResult;
    } 
    async getPropertyByRange(ctx, startKey, endKey) {
        let resultIterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = await this.getAllResults(resultIterator, false);
        return JSON.stringify(result);
    }
    async getPropertyHistory(ctx,propertyId){
        let resultsIterator = await ctx.stub.getHistoryForKey(propertyId);
        let results = await this.getAllResults(resultsIterator, true);
        return JSON.stringify(results);
    }
   async acceptOrder(ctx,propertyId,sellbuyOrderId) {
       const mspId = ctx.clientIdentity.getMSPID();
       if(mspId === 'seller-blockland-com') {
           const buyorder = new SellbuyorderContract();
           const propertyDetails = await this.readProperty(ctx,propertyId);
           const buyorderDetails = await buyorder.readSellbuyorder(ctx, sellbuyOrderId);

        propertyDetails.ownedBy = buyorderDetails.buyerName;
        propertyDetails.status = 'Assigned to a buyer';

        const newPropertyBuffer = Buffer.from(JSON.stringify(propertyDetails));
        await ctx.stub.putState(propertyId,newPropertyBuffer);

        await buyorder.deleteSellbuyorder(ctx,sellbuyOrderId);
        return `property ${propertyId} is sold to ${buyorderDetails.buyerName}`;
       }
       else{
           return `not authorized to perform this action`
       }
   }
   async registerProperty(ctx,propertyId,ownerName,registrationNumber){
    const mspId = ctx.clientIdentity.getMSPID();
    if(mspId === 'landinspector-blockland-com') {
        const exists = await this.propertyExists(ctx, propertyId);
        if(!exists){
            throw new Error(`Property ${propertyId} is not found`);
        }

        const propertyBuffer = await ctx.stub.getState(propertyId);
        const propertyDetails = JSON.parse(propertyBuffer.toString());

        propertyDetails.status = `Registered to ${ownerName} with Property Sold Id : ${registrationNumber}`
        propertyDetails.ownedBy = ownerName;

        const newPropertyBuffer = Buffer.from(JSON.stringify(propertyDetails));
        await ctx.stub.putState(propertyId, newPropertyBuffer);

        return `Property : ${propertyId} is successfully registered`;
    }
    else{
        return `unauthorized to perform this action`;
    }
   }
  

}
    



module.exports = PropertyContract;
