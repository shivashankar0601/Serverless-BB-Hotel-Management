import base64
import json
from datetime import datetime
import os

import boto3
from dotenv import load_dotenv


def hello_pubsub(event, context):
    """Triggered from a message on a Cloud Pub/Sub topic.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    load_dotenv()
    session = boto3.Session(
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        aws_session_token=os.environ.get("AWS_SESSION_TOKEN")
    )
    dynamodb = session.resource('dynamodb', region_name='us-east-1')
    orders_table = dynamodb.Table('kitchen_orders')
    inventory_table = dynamodb.Table('kitchen_inventory')
    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    msg_json = json.loads(pubsub_message)
    print(msg_json)

    try:
        items = msg_json['items']
        timestamps = msg_json['timestamps']
        user_id = msg_json['user_id']
        order_id = msg_json['order_id']

        for item in items:
            print(f'ITEM: {item}')
            item_inventory = inventory_table.get_item(
                Key={'_id': item['_id']})['Item']
            delta = item_inventory['inventory_value'] - item['quantity']

            inventory_table.update_item(
                Key={'_id': item['_id']}, UpdateExpression='SET inventory_value = :val1',
                ExpressionAttributeValues={
                    ':val1': delta
                }
            )

        timestamps['delivered'] = datetime.now().isoformat()
        orders_table.put_item(
            Item={"_id": order_id, "items": msg_json['items'], "user_id": msg_json['user_id'], "timestamps": timestamps,
                  "status": "delivered", "detail": "Success"})

    except Exception as e:
        print(f"[error]: {e}")
        order_id = msg_json['order_id']
        timestamps = msg_json['timestamps']
        timestamps['failed'] = datetime.now().isoformat()
        orders_table.put_item(
            Item={"_id": order_id, "items": msg_json['items'], "user_id": msg_json['user_id'], "timestamps": timestamps,
                  "status": "failed", "detail": "Something bad has happened"})
