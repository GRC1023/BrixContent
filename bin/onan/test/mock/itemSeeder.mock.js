/* **************************************************************************
 * $Workfile:: itemSeeder.mock.js                                           $
 * *********************************************************************/ /**
 *
 * @fileoverview Mock data for the seeder. 
 *
 *
 * Created on       May 23, 2014
 * @author          Seann Ives
 *
 * @copyright (c) 2014 Pearson, All rights reserved.
 *
 * **************************************************************************/

/**
 * Assessment config for a journal question
 * @type {Object}
 */
module.exports.journalAssessmentConfig = {
   "answerKey":{
      "assessmentType":"alwayscorrect"
   },
   "bricId":"J1",
   "bricType":"Journal",
   "config":{
      "id":"sampleJ1",
      "title":"What evidence do psychologists have to suggest that people from different cultural groups may differ in their perceptions?"
   },
   "configFixup":[
      {
         "name":"journalId",
         "type":"set-property",
         "value":{
            "domain":"info",
            "refId":"sequenceNodeKey",
            "type":"ref"
         }
      }
   ]
};

/**
 * Assessment config for a 3 option MCQ
 * @type {Object}
 */
module.exports.mcq3AssessmentConfig = {
   "bricId":"q1",
   "bricType":"MultipleChoiceQuestion",
   "config":{
      "id":"QUE57218",
      "question":"In addition to being emotionally intense, many items on both the SRRS and CUSS are stressful because they\n<br />",
      "order":"randomized",
      "presenterType":"RadioGroup",
      "presenterConfig":{
         "numberFormat":"none"
      },
      "choices":[
         {
            "answerKey":"answer_1",
            "content":"involve the most hassles."
         },
         {
            "answerKey":"answer_2",
            "content":"cause heart disease."
         },
         {
            "answerKey":"answer_3",
            "content":"turn into catastrophes."
         }
      ]
   },
   "answerKey":{
      "assessmentType":"multiplechoice",
      "answers":{
         "answer_3":{
            "score":0,
            "response":"Consider this: What kind of stressors do you think you are most likely to experience on a day to day basis? L.O. 11.2: What kinds of external events can cause stress?"
         },
         "answer_2":{
            "score":0,
            "response":"Consider this: What kind of stressors do you think you are most likely to experience on a day to day basis? L.O. 11.2: What kinds of external events can cause stress?"
         },
         "answer_1":{
            "score":1,
            "response":""
         }
      }
   },
   "configFixup":[
      {
         "name":"questionId",
         "type":"set-property",
         "value":{
            "domain":"info",
            "refId":"sequenceNodeKey",
            "type":"ref"
         }
      },
      {
         "name":"maxAttempts",
         "type":"set-property",
         "value":{
            "domain":"info",
            "refId":"maxAttempts",
            "type":"ref"
         }
      }
   ]
};

/**
 * Assessment config for a 4 option MCQ
 * @type {Object}
 */
module.exports.mcq4AssessmentConfig = {
   "bricId":"q1",
   "bricType":"MultipleChoiceQuestion",
   "config":{
      "id":"QUE57219",
      "question":"In addition to being emotionally intense, many items on both the SRRS and CUSS are stressful because they\n<br />",
      "order":"randomized",
      "presenterType":"RadioGroup",
      "presenterConfig":{
         "numberFormat":"none"
      },
      "choices":[
         {
            "answerKey":"answer_1",
            "content":"involve the most hassles."
         },
         {
            "answerKey":"answer_2",
            "content":"cause heart disease."
         },
         {
            "answerKey":"answer_3",
            "content":"turn into catastrophes."
         },
         {
            "answerKey":"answer_4",
            "content":"lead to mild stress disorder."
         }
      ]
   },
   "answerKey":{
      "assessmentType":"multiplechoice",
      "answers":{
         "answer_3":{
            "score":0,
            "response":"Consider this: What kind of stressors do you think you are most likely to experience on a day to day basis? L.O. 11.2: What kinds of external events can cause stress?"
         },
         "answer_2":{
            "score":0,
            "response":"Consider this: What kind of stressors do you think you are most likely to experience on a day to day basis? L.O. 11.2: What kinds of external events can cause stress?"
         },
         "answer_1":{
            "score":1,
            "response":""
         },
         "answer_4":{
            "score":0,
            "response":"Consider this: What kind of stressors do you think you are most likely to experience on a day to day basis? L.O. 11.2: What kinds of external events can cause stress?"
         }
      }
   },
   "configFixup":[
      {
         "name":"questionId",
         "type":"set-property",
         "value":{
            "domain":"info",
            "refId":"sequenceNodeKey",
            "type":"ref"
         }
      },
      {
         "name":"maxAttempts",
         "type":"set-property",
         "value":{
            "domain":"info",
            "refId":"maxAttempts",
            "type":"ref"
         }
      }
   ]
};

/**
 * Generic payload, prior to adding assessment specific information
 * @type {Object}
 */
module.exports.genericPayload = {
   "Message_Type_Code":"Assessment_Item_Type",
   "Message_Version":"1.0",
   "Transaction_Type_Code":"Create",
   "Transaction_Datetime":"2014-05-23T19:37:01.480Z",
   "Answer_Source_System_Code":"Brix",
   "Assessment_Items":[
      {
         "Assessment_Item_Source_System_Record_Id":"12345",
         "Assessment_Item_Source_System_Code":"PAF",
         "Assessment_Item_Type_Code":""
      }
   ]
};

/**
 * Payload for a multiple choice 3 assessment
 * @type {Object}
 */
module.exports.mcq3Payload = {
   "Message_Type_Code":"Assessment_Item_Type",
   "Message_Version":"1.0",
   "Transaction_Type_Code":"Create",
   "Transaction_Datetime":"2014-05-23T19:37:01.480Z",
   "Answer_Source_System_Code":"Brix",
   "Assessment_Items":[
      {
         "Assessment_Item_Source_System_Record_Id":"12345",
         "Assessment_Item_Source_System_Code":"PAF",
         "Assessment_Item_Type_Code":"MultipleChoice_3",
         "Answers":[
            {
               "Answer_Source_System_Record_Id":"answer_3"
            },
            {
               "Answer_Source_System_Record_Id":"answer_2"
            },
            {
               "Answer_Source_System_Record_Id":"answer_1"
            }
         ]
      }
   ]
};

/**
 * Payload for a multiple choice 4 assessment
 * @type {Object}
 */
module.exports.mcq4Payload = {
   "Message_Type_Code":"Assessment_Item_Type",
   "Message_Version":"1.0",
   "Transaction_Type_Code":"Create",
   "Transaction_Datetime":"2014-05-23T19:37:01.480Z",
   "Answer_Source_System_Code":"Brix",
   "Assessment_Items":[
      {
         "Assessment_Item_Source_System_Record_Id":"12345",
         "Assessment_Item_Source_System_Code":"PAF",
         "Assessment_Item_Type_Code":"MultipleChoice_4",
         "Answers":[
            {
               "Answer_Source_System_Record_Id":"answer_3"
            },
            {
               "Answer_Source_System_Record_Id":"answer_2"
            },
            {
               "Answer_Source_System_Record_Id":"answer_1"
            },
            {
               "Answer_Source_System_Record_Id":"answer_4"
            }
         ]
      }
   ]
};
