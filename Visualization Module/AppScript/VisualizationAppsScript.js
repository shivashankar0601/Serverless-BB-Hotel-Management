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
    .setId('amountPaid')
    .setType(types.NUMBER);
  
  fields.newDimension()
    .setId('checkIn')
    .setType(types.YEAR_MONTH_DAY_SECOND);
  
  fields.newDimension()
    .setId('booking_id')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('userId')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('roomType')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('status')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('checkOut')
    .setType(types.YEAR_MONTH_DAY_SECOND);
  
  fields.newDimension()
    .setId('bookingDate')
    .setType(types.YEAR_MONTH_DAY_SECOND);

  fields.newDimension()
    .setId('bookingNumber')
    .setType(types.TEXT);
  
  
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
        case 'amountPaid':
          return row.push(dailyDownload.AmountPaid);
        case 'checkIn':
          const checkIn = (new Date(dailyDownload.CheckIn)).toISOString().replace(/[^0-9]/g, '').slice(0, -3)
          return row.push(checkIn);
        case 'booking_id':
          return row.push(dailyDownload.Id);
        case 'userId':
          return row.push(dailyDownload.UserId);
        case 'roomType':
          return row.push(dailyDownload.RoomType);
        case 'status':
          return row.push(dailyDownload.BookingStatus);
        case 'checkOut':
           const checkOut = (new Date(dailyDownload.CheckOut)).toISOString().replace(/[^0-9]/g, '').slice(0, -3)
          return row.push(checkOut);
        case 'bookingDate':
          const bookingDate = (new Date(dailyDownload.BookingDate)).toISOString().replace(/[^0-9]/g, '').slice(0, -3)
          return row.push(bookingDate);  
        case 'bookingNumber':
          return row.push(dailyDownload.BookingNumber);    
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
//  var requestedFields = getFields();
  try{
    // Fetch and parse data from API
    var url = 'https://3rkz1hda45.execute-api.us-east-1.amazonaws.com/prod/booking';
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




