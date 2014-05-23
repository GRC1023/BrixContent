/* **************************************************************************
 * $Workfile:: itemSeeder.tests.js                                          $
 * *********************************************************************/ /**
 *
 * @fileoverview Contains unit tests for itemSeeder.js
 *
 *
 * Created on       May 23, 2014
 * @author          Seann Ives
 *
 * @copyright (c) 2014 Pearson, All rights reserved.
 *
 * **************************************************************************/
//force test environment
process.env.NODE_ENV = 'test';

var expect = require('chai').expect;
var config = require('config');
var Q = require('q');
var _ = require('lodash');
var isMock = require('../mock/itemSeeder.mock');
var ItemSeeder = require('../../lib/itemSeeder').ItemSeeder;

// assessmentType Handlers
var assessmentHandlers = {
    'multiplechoice': require('../../lib/types/multiplechoice'),
    'journal': require('../../lib/types/journal')
};

describe('Item Seeder seeding items', function() {
    var itemSeeder = null;

    before(function () {
        itemSeeder = new ItemSeeder();
    });

    it('should build the right payload template with a journal', function (done){
        var assessmentConfig = _.cloneDeep(isMock.journalAssessmentConfig);
        var action = 'Create';
        var guid = '12345';
        itemSeeder.processConfig(assessmentConfig, action, guid)
            .then(function(payload){
                // Make sure the payload returned a real date, then set it to what we expect
                expect(payload.Transaction_Datetime).to.be.a('string');
                expect(payload.Transaction_Datetime).to.not.be.null;
                payload.Transaction_Datetime = isMock.genericPayload.Transaction_Datetime;
                // Check the rest of the payload
                expect(payload).to.deep.equal(isMock.genericPayload);
            })
            .done();
        done();
    });
    it('should build the right payload template with an mcq', function (done){
        var assessmentConfig = _.cloneDeep(isMock.mcq4AssessmentConfig);
        var action = 'Create';
        var guid = '12345';
        itemSeeder.processConfig(assessmentConfig, action, guid)
            .then(function(payload){
                // Make sure the payload returned a real date, then set it to what we expect
                expect(payload.Transaction_Datetime).to.be.a('string');
                expect(payload.Transaction_Datetime).to.not.be.null;
                payload.Transaction_Datetime = isMock.genericPayload.Transaction_Datetime;
                // Check the rest of the payload
                expect(payload).to.deep.equal(isMock.genericPayload);
            })
            .done();
        done();
    });
    it('should build the right payload template with an Update', function (done){
        var assessmentConfig = _.cloneDeep(isMock.mcq4AssessmentConfig);
        var action = 'Update';
        var guid = '12345';
        itemSeeder.processConfig(assessmentConfig, action, guid)
            .then(function(payload){
                expect(payload.Transaction_Type_Code).to.equal('Update');
            })
            .done();
        done();
    }); 
    it('should build the right journal payload with a journal config', function (done){
        var assessmentConfig = _.cloneDeep(isMock.journalAssessmentConfig);
        var action = 'Create';
        var guid = '12345';

        var expectedPayload = _.cloneDeep(isMock.genericPayload);
        expectedPayload.Assessment_Items[0].Assessment_Item_Type_Code = 'Journal';

        var handler = assessmentHandlers['journal'].createAssessmentHandler();

        itemSeeder.processConfig(assessmentConfig, action, guid)
            .then(function(payload){
                // Add the assessment-specific data
                return handler.addAssessmentSpecificConfig(payload, assessmentConfig);
            })
            .then(function(payload){
                // Make sure the payload returned a real date, then set it to what we expect
                expect(payload.Transaction_Datetime).to.be.a('string');
                expect(payload.Transaction_Datetime).to.not.be.null;
                payload.Transaction_Datetime = expectedPayload.Transaction_Datetime;
                // Check the rest of the payload
                expect(payload).to.deep.equal(expectedPayload);
            })
            .done();
        done();
    });
    it('should build the right mcq4 payload with an mcq4 config', function (done){
        var assessmentConfig = _.cloneDeep(isMock.mcq4AssessmentConfig);
        var action = 'Create';
        var guid = '12345';

        var expectedPayload = _.cloneDeep(isMock.mcq4Payload);

        var handler = assessmentHandlers['multiplechoice'].createAssessmentHandler();

        itemSeeder.processConfig(assessmentConfig, action, guid)
            .then(function(payload){
                // Add the assessment-specific data
                return handler.addAssessmentSpecificConfig(payload, assessmentConfig);
            })
            .then(function(payload){
                // Make sure the payload returned a real date, then set it to what we expect
                expect(payload.Transaction_Datetime).to.be.a('string');
                expect(payload.Transaction_Datetime).to.not.be.null;
                payload.Transaction_Datetime = expectedPayload.Transaction_Datetime;
                // Check the rest of the payload
                expect(payload).to.deep.equal(expectedPayload);
            })
            .done();
        done();
    });
    it('should build the right mcq3 payload with an mcq3 config', function (done){
        var assessmentConfig = _.cloneDeep(isMock.mcq3AssessmentConfig);
        var action = 'Create';
        var guid = '12345';

        var expectedPayload = _.cloneDeep(isMock.mcq3Payload);

        var handler = assessmentHandlers['multiplechoice'].createAssessmentHandler();

        itemSeeder.processConfig(assessmentConfig, action, guid)
            .then(function(payload){
                // Add the assessment-specific data
                return handler.addAssessmentSpecificConfig(payload, assessmentConfig);
            })
            .then(function(payload){
                // Make sure the payload returned a real date, then set it to what we expect
                expect(payload.Transaction_Datetime).to.be.a('string');
                expect(payload.Transaction_Datetime).to.not.be.null;
                payload.Transaction_Datetime = expectedPayload.Transaction_Datetime;
                // Check the rest of the payload
                expect(payload).to.deep.equal(expectedPayload);
            })
            .done();
        done();
    });     

});
