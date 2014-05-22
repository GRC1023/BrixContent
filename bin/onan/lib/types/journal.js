/* **************************************************************************
 * $Workfile:: journal.js                                                   $
 * *********************************************************************/ /**
 *
 * @fileoverview The journal assessmentType is managed herein.
 *
 * Created on       May 21, 2014
 * @author          Seann Ives
 *
 * @copyright (c) 2014 Pearson, All rights reserved.
 *
 *
 * **************************************************************************/


/* **************************************************************************
 * journal class                                                */ /**
 *
 * @constructor
 *
 * @classdesc
 * Assesses multiple choice questions. 
 *
 ****************************************************************************/
function AssessmentHandler() {

	this.addAssessmentSpecificConfig = function(payload, assessmentConfig) {		
		payload.Assessment_Items[0].Assessment_Item_Type_Code = "Journal";

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