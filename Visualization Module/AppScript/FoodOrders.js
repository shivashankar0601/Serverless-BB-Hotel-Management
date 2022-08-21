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
  //var aggregations = cc.AggregationType;
  
  fields.newDimension()
    .setId('name')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('cost')
    .setType(types.NUMBER);
  
  fields.newDimension()
    .setId('quantity')
    .setType(types.NUMBER);
  
  return fields;
}

function getSchema(request) {
  Logger.log(request);
  var fields = getFields(request).build();
  return { schema: fields };
}

function responseToRows(requestedFields, response) {
  var output = [];
  response.map(function(reponses) {
    
    reponses.map(function(dailyDownload){
      var row = [];
      requestedFields.asArray().forEach(function (field) {
        switch (field.getId()) {
          case 'name':
            return row.push(dailyDownload.name);
          case 'cost':
            return row.push(dailyDownload.cost);
          case 'quantity':
            return row.push(dailyDownload.quantity);
          default:
            return row.push('');
        }
      });
      output.push({ values: row });
    });
  });
  return output;
}

function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  
  var requestedFields = getFields().forIds(requestedFieldIds);
//  var requestedFields = getFields();
  try{
    // Fetch and parse data from API
    var url = 'https://gb4hi5fgpb.execute-api.us-east-1.amazonaws.com/prod/hotel/food';
    var response = UrlFetchApp.fetch(url);
    var newResponse = response.getContentText();
    var parsedResponse = JSON.parse(newResponse).data;
   Logger.log(parsedResponse);
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




