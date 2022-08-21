package serverless.bnb.lambda;

import com.amazonaws.auth.EnvironmentVariableCredentialsProvider;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;

public class DynamoDB {

    private static String AWS_REGION = System.getenv("AWS_REGION");
    private static String ENDPOINT_URL = String.format("dynamodb.%s.amazonaws.com", AWS_REGION);

    public static AmazonDynamoDB getDynamoDBClient() {
        return AmazonDynamoDBClientBuilder
                .standard()
                .withCredentials(new EnvironmentVariableCredentialsProvider())
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(ENDPOINT_URL, AWS_REGION))
                .build();
    }

    public static DynamoDBMapper getMapper() {
        AmazonDynamoDB dynamoDB = getDynamoDBClient();
        return new DynamoDBMapper(dynamoDB);
    }

}
