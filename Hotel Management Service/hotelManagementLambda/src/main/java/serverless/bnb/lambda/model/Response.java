package serverless.bnb.lambda.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Response {

    private boolean success;
    private String data;

    public void setResponseData(Object object, String defaultMessage) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            data = mapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            System.err.println("Error forming response body");
            data = defaultMessage;
        }
    }

}
