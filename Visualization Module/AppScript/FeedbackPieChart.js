var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}

function getConfig(request) {
  var config = cc.getConfig();
  
  config.newInfo()
    .setId('instructions')
    .setText('Data is fetching');
  return config.build();
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  
  fields.newDimension()
    .setId('id')
    .setType(types.NUMBER);
  
  fields.newDimension()
    .setId('score')
    .setType(types.TEXT);
 
  return fields;
}

function getSchema(request) {
  Logger.log(request);
  var fields = getFields(request).build();
  return { schema: fields };
}

function responseToRows(requestedFields, response) {
  var output = [];
  var count=0;
  response.map(function(data){
    var row = [];
    row.push(count);
    if(data.Score>0){
      row.push("Positive");
    }
    if(data.Score<0){
      row.push("Negative");
    }
    count++;
    output.push({ values: row });
  });
  Logger.log(output);
  return output;        
}

function getData(request) {
//  var requestedFieldIds = request.fields.map(function(field) {
//    return field.name;
//  });
//  
//  var requestedFields = getFields().forIds(requestedFieldIds);
 var requestedFields = getFields();
  try{
    // Fetch and parse data from API
    var url = 'https://bgtcrsugok.execute-api.us-east-1.amazonaws.com/prod/feedback';
    var response = UrlFetchApp.fetch(url);
    var newResponse = response.getContentText();
    var parsedResponse = JSON.parse(newResponse).body;
   
    var rows = responseToRows(requestedFields, parsedResponse);
  }catch(e){
    cc.newUserError()
    .setDebugText('Error fetching data from API. Exception details:'+e)
    .setText('Tje connector has encountered an unrecoverable error. Please try again later.')
    .throwException();
  }
  Logger.log(rows);
  return {
    "cachedData": false,
    "schema": requestedFields.build(),
    "rows":rows
  };
 
}




