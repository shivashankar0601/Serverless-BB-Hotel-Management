package bnb.cloudFunction;

import bnb.cloudFunction.FeedbackSentimentAnalysis.PubSubMessage;
import com.google.cloud.functions.BackgroundFunction;
import com.google.cloud.functions.Context;
import com.google.cloud.language.v1.*;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.gson.Gson;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.ProjectTopicName;
import com.google.pubsub.v1.PubsubMessage;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.Objects;
import java.util.logging.Logger;

/**
 * GCP Cloud Function to perform Sentiment Analysis on customer's feedback
 * And publish the response to Hotel Management
 **/
public class FeedbackSentimentAnalysis implements BackgroundFunction<PubSubMessage> {
  private static final Logger logger = Logger.getLogger(FeedbackSentimentAnalysis.class.getName());
  private static final String GCP_PROJECT_ID = "assignment-352315";
  private static final String SENTIMENT_RESPONSE_TOPIC = "FeedbackSentimentAnalysis";

  @Override
  public void accept(PubSubMessage message, Context context) {
    try
    {
      if (Objects.isNull(message) || Objects.isNull(message.data) || message.data.isBlank() ) {
        throw new Exception("Null or blank feedback request message");
      }
      String jsonMessage = new String(Base64.getDecoder()
              .decode(message.data.getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8);
      SentimentAnalysisRequest request = new Gson().fromJson(jsonMessage, SentimentAnalysisRequest.class);
      logger.info("The feedback is :" + request.feedback);
      SentimentAnalysisResponse response = performSentimentAnalysis(request.feedback);
      response.feedbackId = request.feedbackId;
      String sentimentResponseJson = new Gson().toJson(response);
      publishSentimentAnalysis(sentimentResponseJson);
    }
    catch(Exception exception) {
      logger.severe("An exception occurred while calculating the sentiment" + exception.getLocalizedMessage());
      exception.printStackTrace();
    }
    logger.info("Message processed with Event Id : " + context.eventId());
  }

  public static class PubSubMessage {
    private String data;
    private Map<String, String> attributes;
    private String publishTime;
  }

  public SentimentAnalysisResponse performSentimentAnalysis(String feedback) throws IOException {
    SentimentAnalysisResponse sentimentResponse;
//  https://cloud.google.com/natural-language/docs/analyzing-sentiment
    try (LanguageServiceClient language = LanguageServiceClient.create()) {
      Document feedbackDoc = Document.newBuilder()
              .setContent(feedback)
              .setLanguage("en")
              .setType(Document.Type.PLAIN_TEXT)
              .build();
      AnalyzeSentimentResponse response = language.analyzeSentiment(feedbackDoc);
      Sentiment sentiment = response.getDocumentSentiment();
      sentimentResponse = new SentimentAnalysisResponse(feedback, sentiment.getMagnitude(), sentiment.getScore());
      logger.info("Sentiment analysis is : " + sentimentResponse.toString());
    }
    return sentimentResponse;
  }

  private void publishSentimentAnalysis(String message) {
//  https://cloud.google.com/functions/docs/calling/pubsub#publishing_a_message_from_within_a_function
    try {
      ProjectTopicName sentimentAnalysisTopic = ProjectTopicName.newBuilder()
                                                                .setProject(GCP_PROJECT_ID)
                                                                .setTopic(SENTIMENT_RESPONSE_TOPIC)
                                                                .build();

      Publisher sentimentAnalysisPublisher = Publisher.newBuilder(sentimentAnalysisTopic).build();
      PubsubMessage pubMessage = PubsubMessage.newBuilder()
                                      .setData(ByteString.copyFrom(message.getBytes(StandardCharsets.UTF_8)))
                                      .build();
      sentimentAnalysisPublisher.publish(pubMessage);
    }
    catch (IOException e) {
      logger.severe("Exception publishing message to Pub/Sub: " + e.getMessage());
    }
  }

  public static class SentimentAnalysisResponse {
    /**
     * Sentiment Score with a value greater than zero indicates positive sentiment
     * Sentiment Score with a value less than zero indicates positive sentiment
     **/
    private String feedbackId;
    private String feedback;
    private float magnitude;
    private float score;

    public SentimentAnalysisResponse(String feedback, float magnitude, float score) {
      this.feedback = feedback;
      this.magnitude = magnitude;
      this.score = score;
    }

    @Override
    public String toString() {
      return "SentimentResponse{" +
              "Feedback: " + feedback +
              ", Sentiment magnitude: " + magnitude +
              ", Sentiment score: " + score +
              '}';
    }
  }

  public static class SentimentAnalysisRequest {
    private String feedbackId;
    private String feedback;
  }

/*  public static void main(String a[]) {

    String jsonMessage = "{\"feedbackId\": \"jsdh8-sdjhs-wdjs8\",\"feedback\": \"It was a good room\"}";
    SentimentAnalysisRequest request = new Gson().fromJson(jsonMessage, SentimentAnalysisRequest.class);
    System.out.println(request.feedback);
    System.out.println(request.feedbackId);
  }*/
}
