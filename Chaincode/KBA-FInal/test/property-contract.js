/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { PropertyContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('PropertyContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new PropertyContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"property 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"property 1002 value"}'));
    });

    describe('#propertyExists', () => {

        it('should return true for a property', async () => {
            await contract.propertyExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a property that does not exist', async () => {
            await contract.propertyExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createProperty', () => {

        it('should create a property', async () => {
            await contract.createProperty(ctx, '1003', 'property 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"property 1003 value"}'));
        });

        it('should throw an error for a property that already exists', async () => {
            await contract.createProperty(ctx, '1001', 'myvalue').should.be.rejectedWith(/The property 1001 already exists/);
        });

    });

    describe('#readProperty', () => {

        it('should return a property', async () => {
            await contract.readProperty(ctx, '1001').should.eventually.deep.equal({ value: 'property 1001 value' });
        });

        it('should throw an error for a property that does not exist', async () => {
            await contract.readProperty(ctx, '1003').should.be.rejectedWith(/The property 1003 does not exist/);
        });

    });

    describe('#updateProperty', () => {

        it('should update a property', async () => {
            await contract.updateProperty(ctx, '1001', 'property 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"property 1001 new value"}'));
        });

        it('should throw an error for a property that does not exist', async () => {
            await contract.updateProperty(ctx, '1003', 'property 1003 new value').should.be.rejectedWith(/The property 1003 does not exist/);
        });

    });

    describe('#deleteProperty', () => {

        it('should delete a property', async () => {
            await contract.deleteProperty(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a property that does not exist', async () => {
            await contract.deleteProperty(ctx, '1003').should.be.rejectedWith(/The property 1003 does not exist/);
        });

    });

});
