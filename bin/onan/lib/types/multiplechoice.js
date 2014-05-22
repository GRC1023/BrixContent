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

	this.addAssessmentSpecificConfig = function(payload, assessmentConfig) {		
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