import os
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
import boto3

session = boto3.Session(
    aws_access_key_id=os.environ["ACCESS_KEY"],
    aws_secret_access_key=os.environ["SECRET_KEY"],
    aws_session_token=os.environ["SESSION_TOKEN"]
)
dynamodb = session.resource('dynamodb')
table = dynamodb.Table('RoomBooking')


def lambda_handler(event, context):
    print(f'EVENT: {event}')
    event_details = event['Records'][0]['dynamodb']['NewImage']
    amount = event_details['cost']['N']
    type = 'Food'
    items = event_details['items']['L']
    BookingNumber = event_details['BookingNumber']['S']
    s = ''
    for item in items:
        ss = item['M']['name']['S']
        s = s+ss+', '
    response = table.scan(
        FilterExpression=Attr('BookingNumber').eq(BookingNumber)
    )['Items'][0]
    print(f'RESPONSE: {response}')
    invoice_lines = response['InvoiceLines']
    print("IL: ", invoice_lines)
    invoice_lines.append(
        {'Amount': int(amount), 'Description': s, 'Type': type})
    print("IL: ", invoice_lines)
    key = response['Id']
    response['InvoiceLines'] = invoice_lines
    table.put_item(Item=response)

    return {
        'success': True,
        'response': response
    }
