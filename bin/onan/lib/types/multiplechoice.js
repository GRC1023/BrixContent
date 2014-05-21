/* **************************************************************************
 * $Workfile:: multiplechoice.js                                            $
 * *********************************************************************/ /**
 *
 * @fileoverview The multiplechoice assessmentType is managed herein.
 *
 * Created on       May 21, 2014
 * @author          Seann Ives
 *
 * @copyright (c) 2014 Pearson, All rights reserved.
 *
 *
 * **************************************************************************/
var _ = require('lodash');
var template = require('../../resources/assessment_item_type_template.json');

/* **************************************************************************
 * multiplechoice class                                                */ /**
 *
 * @constructor
 *
 * @classdesc
 * Assesses multiple choice questions. 
 *
 ****************************************************************************/
function AssessmentHandler() {

	/* **************************************************************************
	 * processConfig                                                       */ /**
	 * 
	 * Fill out the basic template information
	 * 
	 * @param  {Object} assessmentConfig brixConfig for this assessment
	 * @param  {string} action           Create, Update, Delete (uppercase first)
	 * @param  {string} guid             Activity GUID (sans URL)
	 * @return {Object}                  The payload to be sent to SubPub
	 */
	this.processConfig = function(assessmentConfig, action, guid) {
		// Start with the template
		var payload = _.cloneDeep(template);

		// Add Transaction_Type_Code
		payload.Transaction_Type_Code = action;

		// Add Transaction_Datetime
		var now = new Date().toISOString();
		payload.Transaction_Datetime = now;

		// Assessment_Items array will only ever have one value as we're only 
		// going to send one item at a time because Transaction_Type_Code
		// is a top-level property.
		// @todo - we could refactor this later so it sends all Creates in 
		// one message and all Updates in another.

		payload.Assessment_Items[0].Assessment_Item_Source_System_Record_Id = guid;

		// NOTE: from here on down it's 'assessment specific', so let's pull
		// the code out into assessment-specific functions
		payload = this.addMCQConfig(payload, assessmentConfig);

		return payload;
	};

	this.addMCQConfig = function(payload, assessmentConfig) {		
		var answerKeys = _.keys(assessmentConfig.answerKey.answers);
		payload.Assessment_Items[0].Assessment_Item_Type_Code = "MultipleChoice_" + answerKeys.length;

		payload.Assessment_Items[0].Answers = [];
		_(answerKeys).each(function(keyName) {
			var answer = { "Answer_Source_System_Record_Id": keyName};
			payload.Assessment_Items[0].Answers.push(answer);
		});

		return payload;
	};
}

/**
 * Export createAssessmentHandler.  Every Assessment Handler should export this though
 * the details within can vary by assessment type.
 * @param  {Object} options For creation options
 * @return {Object}         AssessmentHandler object
 */
module.exports.createAssessmentHandler = function createAssessmentHandler(options) {
    return new AssessmentHandler(options);
};