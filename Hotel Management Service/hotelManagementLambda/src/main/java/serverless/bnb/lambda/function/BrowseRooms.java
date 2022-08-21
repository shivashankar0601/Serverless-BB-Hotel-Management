package serverless.bnb.lambda.function;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import serverless.bnb.lambda.DynamoDB;
import serverless.bnb.lambda.model.Room;
import serverless.bnb.lambda.model.RoomBooking;
import serverless.bnb.lambda.model.RoomType;
import serverless.bnb.lambda.model.Status;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * AWS Lambda function to view available rooms
 **/
public class BrowseRooms implements
        RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        Map<String, String> queryParams = input.getQueryStringParameters();
        String checkIn = queryParams.get("checkIn");
        String checkOut = queryParams.get("checkOut");
        SearchCriteria searchCriteria = new SearchCriteria(checkIn, checkOut);

        APIGatewayProxyResponseEvent response;
        if (searchCriteria.validateSearchCriteria()) {
            try {
                Map<RoomType, Long> bookedRoomsByType = getBookedRooms(searchCriteria);
                List<Room> rooms = getAllRooms();
                System.out.println("All rooms :" + rooms.size());
                List<Room> availableRooms = new ArrayList<>();
                for (Room room : rooms) {
                    if (bookedRoomsByType.containsKey(room.getRoomType())
                            && bookedRoomsByType.get(room.getRoomType()) >= room.getTotalRooms()) {
                        continue;
                    } else {
                        availableRooms.add(room);
                    }
                }
                BrowseRoomsResponse browseRoomsResponse = new BrowseRoomsResponse(true, availableRooms);
                String responseBody = new ObjectMapper().writeValueAsString(browseRoomsResponse);
                System.out.println("JSON Response body string :\n" + responseBody);
                response = getAPIGatewayResponse(200, responseBody, "application/json");
            }
            catch (Exception e) {
//            Send internal server error
                System.err.println("An exception occurred while processing the request :" + e.getMessage());
                e.printStackTrace();
                response = getAPIGatewayResponse(500,
                        "An error occurred while processing the request", "text/plain");
            }
        } else {
//            Send bad request 400
            response = getAPIGatewayResponse(400, "Bad request", "text/plain");
        }

        return response;
    }

    public Map<RoomType, Long> getBookedRooms(SearchCriteria criteria) throws ParseException {
        Map<RoomType, Long> bookedRoomsByType = new HashMap<>();
        DynamoDBMapper mapper = DynamoDB.getMapper();

        Map<String, AttributeValue> expression = criteria.getDynamoDBSearchExpressionValues();
        DynamoDBScanExpression scanExpression = new DynamoDBScanExpression()
                .withFilterExpression("CheckIn >= :checkIn and CheckOut <= :checkOut and BookingStatus = :status")
                .withExpressionAttributeValues(expression);

        List<RoomBooking> bookedRooms = mapper.scan(RoomBooking.class, scanExpression);
        if (bookedRooms.size() > 0) {
            System.out.println("bookedRooms" + bookedRooms.size());
            bookedRooms.forEach(room -> System.out.println(room.toString()));
            for (RoomBooking booking : bookedRooms) {
                if (bookedRoomsByType.containsKey(booking.getRoomType())) {
                    bookedRoomsByType.put(booking.getRoomType(), bookedRoomsByType.get(booking.getRoomType()) + 1);
                }
                else
                {
                    bookedRoomsByType.put(booking.getRoomType(), 1L);
                }
            }
        } else {
            System.out.println("No bookings present for dates :" + criteria.getCheckIn() + " & " + criteria.getCheckOut());
        }
        bookedRoomsByType.forEach((k,v) -> System.out.println("Room Type = " + k.name() + " Booked Rooms : " + v));
        return bookedRoomsByType;
    }

    public List<Room> getAllRooms() {
        DynamoDBMapper mapper = DynamoDB.getMapper();
        DynamoDBScanExpression expression = new DynamoDBScanExpression();
        List<Room> rooms = mapper.scan(Room.class, expression);
        return rooms;
    }

    private APIGatewayProxyResponseEvent getAPIGatewayResponse(int statusCode, String responseBody, String contentType) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setBody(responseBody);
        response.setStatusCode(statusCode);
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", contentType);
        headers.put("Access-Control-Allow-Origin", "*");
        response.setHeaders(headers);
        return response;
    }

    @Getter
    public static class SearchCriteria {

        String checkIn;
        String checkOut;

        public SearchCriteria (String checkIn, String checkOut) {
            this.checkIn = checkIn;
            this.checkOut = checkOut;
        }

        public boolean validateSearchCriteria() {
            boolean isValid = true;
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            try {
                dateFormat.parse(checkIn);
                dateFormat.parse(checkOut);
            }
            catch (ParseException exception) {
                isValid = false;
            }
            System.out.println("Is valid search criteria :" + isValid);
            return isValid;
        }

        public Map<String, AttributeValue> getDynamoDBSearchExpressionValues() throws ParseException {

            SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd");
            Date checkInDate = dateFormatter.parse(checkIn);
            checkInDate.setTime(checkInDate.getTime() + 12L * 60L * 60L * 1000L);
            Date checkOutDate = dateFormatter.parse(checkOut);
            checkOutDate.setTime(checkOutDate.getTime() + 10L * 60L * 60L * 1000L);

            SimpleDateFormat dbDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
            dbDateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            String checkInDateString = dbDateFormat.format(checkInDate.getTime());
            String checkOutDateString = dbDateFormat.format(checkOutDate.getTime());
            System.out.println("Parsed checkIn date " + checkInDateString);
            System.out.println("Parsed checkOut date " + checkOutDateString);
            System.out.println("Status " + Status.VALID.name());

            Map<String, AttributeValue> expression = new HashMap<>();
            expression.put(":checkIn", new AttributeValue().withS(checkInDateString));
            expression.put(":checkOut", new AttributeValue().withS(checkOutDateString));
            expression.put(":status", new AttributeValue().withS(Status.VALID.name()));
            return expression;
        }

    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BrowseRoomsResponse {
        private boolean success;
        private Object data;
    }

}
