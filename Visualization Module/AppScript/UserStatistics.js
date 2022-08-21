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
    .setId('userId')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('name')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('email')
    .setType(types.TEXT);
 
  fields.newDimension()
    .setId('lastLogin')
    .setType(types.TEXT);
  
   fields.newDimension()
    .setId('logincount')
    .setType(types.NUMBER);
  return fields;
}

function getSchema(request) {
  Logger.log(request);
  var fields = getFields(request).build();
  return { schema: fields };
}

function responseToRows(requestedFields, response) {
    return response.map(function(dailyDownload) {
    var row = [];
    requestedFields.asArray().forEach(function (field) {
      switch (field.getId()) {
        case 'userId':
          return row.push(dailyDownload.userId);
        case 'name':
          return row.push(dailyDownload.name);
        case 'email':
          return row.push(dailyDownload.email);
        case 'lastLogin':
          return row.push(dailyDownload.lastLogin);
        case 'logincount':
          return row.push(dailyDownload.logincount);    
        default:
          return row.push('');
      }
    });
    return { values: row };
  });        
}

function getData(request) {
 var requestedFieldIds = request.fields.map(function(field) {
   return field.name;
  });
  
 var requestedFields = getFields().forIds(requestedFieldIds);
// var requestedFields = getFields();
  try{
    // Fetch and parse data from API
    var url = 'https://y9hldb9gt6.execute-api.us-east-1.amazonaws.com/prod/userinfo';
    var response = UrlFetchApp.fetch(url);
    var newResponse = response.getContentText();
    var parsedResponse = JSON.parse(newResponse).body;
   //Logger.log(parsedResponse)
    var rows = responseToRows(requestedFields, parsedResponse);
  }catch(e){
    cc.newUserError()
    .setDebugText('Error fetching data from API. Exception details:'+e)
    .setText('Tje connector has encountered an unrecoverable error. Please try again later.')
    .throwException();
  }

  return {
    "cachedData": false,
    "schema": requestedFields.build(),
    "rows": rows
  };
 
}




