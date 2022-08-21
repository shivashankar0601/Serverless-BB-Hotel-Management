import base64
import json
import uuid
from datetime import datetime
import os

from google.cloud import pubsub_v1
from google.oauth2 import service_account
import boto3
from dotenv import load_dotenv


class InventoryError(Exception):
    pass


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

    PROJECT_ID = 'csci-5410-s22-353123'
    TOPIC_ID = 'cooking_service'
    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    msg_json = json.loads(pubsub_message)
    print(msg_json)

    order_id = str(uuid.uuid4())
    try:
        credentials = service_account.Credentials.from_service_account_file(
            'key.json')
        client = pubsub_v1.PublisherClient(credentials=credentials)

        topic_path = client.topic_path(PROJECT_ID, TOPIC_ID)

        timestamps = msg_json['timestamps']
        timestamps['confirmed'] = datetime.now().isoformat()

        data_json = {
            'items': msg_json['items'],
            'timestamps': timestamps,
            'user_id': msg_json['user_id'],
            'order_id': order_id
        }

        # Validate inventory
        for item in msg_json['items']:
            print(f'ITEM: {item}')
            item_inventory = inventory_table.get_item(
                Key={'_id': item['_id']})['Item']
            delta = item_inventory['inventory_value'] - item['quantity']

            if delta < 0:
                raise InventoryError("insufficient inventory")

        bytes_data = str(json.dumps(data_json)).encode('utf-8')
        api_future = client.publish(topic_path, bytes_data)
        message_id = api_future.result()

        print(f"Published {data_json} to {topic_path}: {message_id}")
        orders_table.put_item(
            Item={"_id": order_id, "items": msg_json['items'], "user_id": msg_json['user_id'], "timestamps": timestamps,
                  "status": "confirmed", "detail": "Success"})

    except InventoryError as e:
        print(f"[error]: {e}")
        order_id = msg_json['order_id']
        timestamps = msg_json['timestamps']
        timestamps['failed'] = datetime.now().isoformat()
        orders_table.put_item(
            Item={"_id": order_id, "items": msg_json['items'], "user_id": msg_json['user_id'], "timestamps": timestamps,
                  "status": "failed", "detail": "Inventory insufficient"})

    except Exception as e:
        print(f"[error]: {e}")
        timestamps = msg_json['timestamps']
        timestamps['failed'] = datetime.now().isoformat()
        orders_table.put_item(
            Item={"_id": order_id, "items": msg_json['items'], "user_id": msg_json['user_id'], "timestamps": timestamps,
                  "status": "failed", "detail": "Something bad has happened"})
