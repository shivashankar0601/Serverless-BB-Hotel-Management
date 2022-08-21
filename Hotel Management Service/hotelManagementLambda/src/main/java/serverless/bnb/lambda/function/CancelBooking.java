package serverless.bnb.lambda.function;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import serverless.bnb.lambda.DynamoDB;
import serverless.bnb.lambda.model.RoomBooking;
import serverless.bnb.lambda.model.Status;

import java.util.*;

/**
 * Cancel a booking booking
 **/
public class CancelBooking implements
        RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent requestEvent, Context context) {

        Map<String, String> queryParams = requestEvent.getHeaders();
        String contentType = queryParams.get("content-type");
        APIGatewayProxyResponseEvent response;

        if (!contentType.isEmpty() && !contentType.contains("application/json")) {
            return getAPIGatewayResponse(400, "Invalid content type");
        }

        try {
            String requestBody = requestEvent.getBody();
            BookingCancelRequest request = new ObjectMapper().readValue(requestBody, BookingCancelRequest.class);
            if (request.isValid()) {
                RoomBooking booking = getBooking(request.getUserId(), request.getBookingNumber());
                if (Objects.isNull(booking)) {
                    response =  getAPIGatewayResponse(400, "Booking does not exists");
                } else if (booking.getStatus().equals(Status.CANCELLED)) {
                    response =  getAPIGatewayResponse(200, "This booking is cancelled");
                }
                else if (booking.getCheckIn().before(Calendar.getInstance())) {
                    response =  getAPIGatewayResponse(200, "Cannot cancel the booking after check in time");
                }
                else {
                    cancelBooking(booking);
                    System.out.println("Booking cancelled : " + booking.toString());
                    response = getAPIGatewayResponse(200, "Booking cancelled successfully");
                }
            } else {
                response = getAPIGatewayResponse(400, "Invalid input");
            }

        }
        catch (Exception e) {
            System.err.println("An exception occurred while processing the request :" + e.getMessage());
            e.printStackTrace();
            response = getAPIGatewayResponse(500,
                    "An error occurred while processing the request");
        }
        return response;
    }

    private RoomBooking getBooking(String userId, String bookingNumber) {
        Map<String, AttributeValue> roomBookingAttrVal = new HashMap<>();
        roomBookingAttrVal.put(":userId", new AttributeValue().withS(userId));
        roomBookingAttrVal.put(":bookingNumber", new AttributeValue().withS(bookingNumber));
        DynamoDBScanExpression roomBookingExp = new DynamoDBScanExpression()
                .withFilterExpression("UserId = :userId and BookingNumber = :bookingNumber")
                .withExpressionAttributeValues(roomBookingAttrVal);
        List<RoomBooking> roomBookings = DynamoDB.getMapper().scan(RoomBooking.class, roomBookingExp);
        return Optional.ofNullable(roomBookings).isPresent() && roomBookings.size() > 0 ? roomBookings.get(0) : null;
    }

    private void cancelBooking(RoomBooking booking) {
        booking.setStatus(Status.CANCELLED);
        DynamoDB.getMapper().save(booking);
    }

    private APIGatewayProxyResponseEvent getAPIGatewayResponse(int statusCode, String responseBody) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setBody(responseBody);
        response.setStatusCode(statusCode);
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "text/plain");
        headers.put("Access-Control-Allow-Origin", "*");
        response.setHeaders(headers);
        return response;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingCancelRequest {
        private String userId;
        private String bookingNumber;

        @JsonIgnore
        public boolean isValid() {
            return Objects.nonNull(userId)
                    && !userId.isBlank()
                    && Objects.nonNull(bookingNumber)
                    && !bookingNumber.isBlank();
        }
    }
}
