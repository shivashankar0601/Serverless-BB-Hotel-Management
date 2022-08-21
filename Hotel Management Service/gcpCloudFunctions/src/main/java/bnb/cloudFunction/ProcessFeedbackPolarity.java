package bnb.cloudFunction;

import bnb.cloudFunction.ProcessFeedbackPolarity.PubSubMessage;
import com.google.cloud.functions.BackgroundFunction;
import com.google.cloud.functions.Context;
import com.google.gson.Gson;
import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.logging.Logger;

/**
 * GCP Cloud function which is a subscriber to GCP Topic
 * which persists the result of sentiment analysis passed to Hotel management service
 * by the Feedback analysis service
 * */
public class ProcessFeedbackPolarity implements BackgroundFunction<PubSubMessage> {
  private static final Logger logger = Logger.getLogger(ProcessFeedbackPolarity.class.getName());
  private static final String ENDPOINT_URL = "dynamodb.us-east-1.amazonaws.com";

  @Override
  public void accept(PubSubMessage message, Context context) {
    try
    {
      if (Objects.isNull(message) || Objects.isNull(message.data) || message.data.isBlank() ) {
        throw new Exception("Null or blank feedback request message");
      }
      String jsonMessage = new String(Base64.getDecoder()
              .decode(message.data.getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8);
      SentimentAnalysisResult request = new Gson().fromJson(jsonMessage, SentimentAnalysisResult.class);
      logger.info("The feedback is :" + request.feedback);
      updateFeedbackPolarity(request);
    }
    catch(Exception exception) {
      logger.severe("An exception occurred while processing Feedback Polarity : " + exception.getLocalizedMessage());
      exception.printStackTrace();
    }
    logger.info("Message processed with Event Id : " + context.eventId());
  }

  private void updateFeedbackPolarity(SentimentAnalysisResult feedbackPolarity) throws Exception {
    DynamoDbClient client = getDynamoDBClient();
    HashMap<String, AttributeValueUpdate> sentimentScore = new HashMap<>();
    sentimentScore.put("Score", AttributeValueUpdate.builder()
                                      .value(AttributeValue.builder().n(String.valueOf(feedbackPolarity.score)).build())
                                      .action(AttributeAction.ADD)
                                      .build());
    HashMap<String,AttributeValue> feedbackId = new HashMap<>();
    feedbackId.put("Id", AttributeValue.builder().s(feedbackPolarity.feedbackId).build());

    UpdateItemRequest request = UpdateItemRequest.builder()
                                                .tableName("Feedback")
                                                .key(feedbackId)
                                                .attributeUpdates(sentimentScore)
                                                .build();
    client.updateItem(request);
  }

  /**
   * Creates an instance of DynamoDbClient for performing operations on DynamoDB tables
   * EnvironmentVariableCredentialsProvider require
   * values of below default environment variables exported
   * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
   **/
  public static DynamoDbClient getDynamoDBClient() throws Exception {
    DynamoDbClient dynamoDbClient = DynamoDbClient.builder()
            .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
            .endpointDiscoveryEnabled(true)
            .region(Region.US_EAST_1)
            .build();

    if (Objects.isNull(dynamoDbClient)) {
      throw new Exception("Unable to create DynamoDB client");
    }
    return dynamoDbClient;
  }

  public static class PubSubMessage {
    String data;
    Map<String, String> attributes;
  }

  public static class SentimentAnalysisResult {
    private String feedbackId;
    private String feedback;
    private float magnitude;
    private float score;
  }

}
