package serverless.bnb.lambda.model;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBDocument;
import lombok.*;

import java.util.Calendar;

@DynamoDBDocument
@Setter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceLine {

    public static final String INVOICE_LINE_ROOM = "Room";
    private String type;
    private String description;
    private float amount;
    private Calendar invoiceDate;

    @DynamoDBAttribute(attributeName = "Type")
    public String getType() {
        return type;
    }

    @DynamoDBAttribute(attributeName = "Description")
    public String getDescription() {
        return description;
    }

    @DynamoDBAttribute(attributeName = "Amount")
    public float getAmount() {
        return amount;
    }

    @DynamoDBAttribute(attributeName = "InvoiceDate")
    public Calendar getInvoiceDate() {
        return invoiceDate;
    }

}
