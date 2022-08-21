package serverless.bnb.lambda.function;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.core.ApiFuture;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.ProjectTopicName;
import com.google.pubsub.v1.PubsubMessage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import serverless.bnb.lambda.DynamoDB;
import serverless.bnb.lambda.model.Feedback;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * AWS Lambda function that receives customer's feedback from front-end
 * Persists it in Dynamo DB
 * Publishes the feedback to GCP Pub Sub Topic Feedback to perform perform sentiment analysis on the feedback
 * */
public class CaptureFeedback implements
        RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final String GCP_PROJECT_ID = "assignment-352315";
    private static final String FEEDBACK_TOPIC = "Feedback";

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent requestEvent, Context context) {
        Map<String, String> queryParams = requestEvent.getHeaders();
        String contentType = queryParams.get("content-type");
        APIGatewayProxyResponseEvent response;

        if (!contentType.isEmpty() && !contentType.contains("application/json")) {
            return getAPIGatewayResponse(400, "Invalid content type", "text/plain");
        }
        try {
            String jsonRequest = requestEvent.getBody();
            RequestBody requestBody = new ObjectMapper().readValue(jsonRequest, RequestBody.class);
            if (requestBody.isValid()) {
                Feedback feedback = Feedback.builder()
                        .userId(requestBody.getUserId())
                        .header(requestBody.getHeader())
                        .body(requestBody.getBody())
                        .bookingNumber(requestBody.getBookingNumber())
                        .build();
                DynamoDB.getMapper().save(feedback);
                System.out.println("Feedback saved :" + feedback);
                publishFeedback(feedback);
                response = getAPIGatewayResponse(201, "Feedback saved successfully", "text/plain");
            }
            else
            {
                response = getAPIGatewayResponse(400, "Missing required fields", "text/plain");
            }
        }
        catch (Exception exception) {
            System.err.println("An exception occurred while processing the request :" + exception.getMessage());
            exception.printStackTrace();
            response = getAPIGatewayResponse(500,
                    "An error occurred while processing the request", "text/plain");
        }
        return response;
    }

    private void publishFeedback(Feedback feedback) throws Exception {
        ProjectTopicName sentimentAnalysisTopic = ProjectTopicName.newBuilder()
                .setProject(GCP_PROJECT_ID)
                .setTopic(FEEDBACK_TOPIC)
                .build();

        InputStream credentials = this.getClass().getResourceAsStream("/assignment-352315-274fb255a574.json");
        if (Objects.isNull(credentials)) {
            throw new Exception("Cannot publish feedback to GCP");
        }
        FixedCredentialsProvider credentialsProvider = FixedCredentialsProvider.create(GoogleCredentials.fromStream(credentials));
        Publisher sentimentAnalysisPublisher = Publisher.newBuilder(sentimentAnalysisTopic)
                                                        .setCredentialsProvider(credentialsProvider)
                                                        .build();

        System.out.println(sentimentAnalysisPublisher.getBatchingSettings().getRequestByteThreshold());

        PublishMessage message = new PublishMessage(feedback.getId(), feedback.getHeader(), feedback.getBody());
        String jsonMessage = new ObjectMapper().writeValueAsString(message);
        PubsubMessage pubMessage = PubsubMessage.newBuilder()
                                        .setData(ByteString.copyFrom(jsonMessage.getBytes(StandardCharsets.UTF_8)))
                                        .build();
        sentimentAnalysisPublisher.publish(pubMessage).get();
    }

    APIGatewayProxyResponseEvent getAPIGatewayResponse(int statusCode, String responseBody, String contentType) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setBody(responseBody);
        response.setStatusCode(statusCode);
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", contentType);
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Credentials", "true");
        response.setHeaders(headers);
        return response;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class RequestBody {
        private String userId;
        private String header;
        private String body;
        private String bookingNumber;

        @JsonIgnore
        private boolean isValid()
        {
            boolean isValid = true;
            if (Objects.isNull(userId) || userId.isBlank()
                || Objects.isNull(header) || header.isBlank()
                || Objects.isNull(body) || body.isBlank()
                || Objects.isNull(bookingNumber) || bookingNumber.isBlank()) {
                isValid = false;
            }
            return  isValid;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class PublishMessage {
        private String feedbackId;
        private String feedback;

        public PublishMessage(String feedbackId, String header, String body) {
            this.feedbackId = feedbackId;
            this.feedback = header + System.lineSeparator() + body;
        }
    }

}
