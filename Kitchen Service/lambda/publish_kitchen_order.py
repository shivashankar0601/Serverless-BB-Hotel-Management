import json
from datetime import datetime

from google.cloud import pubsub_v1
from google.oauth2 import service_account
import boto3


dynamodb = boto3.resource('dynamodb')


def lambda_handler(event, context):
    try:
        project_id = event['project_id']
        topic_id = event['topic_id']
        items = event['items']
        user_id = event['user_id']
        cost = event['cost']
        BookingNumber = event['BookingNumber']
        timestamp = datetime.now().isoformat()

        """Publishes a message to a Pub/Sub topic."""
        credentials = service_account.Credentials.from_service_account_file(
            'key.json')
        # Initialize a Publisher client.
        client = pubsub_v1.PublisherClient(credentials=credentials)
        # Create a fully qualified identifier of form `projects/{project_id}/topics/{topic_id}`
        topic_path = client.topic_path(project_id, topic_id)

        # Data sent to Cloud Pub/Sub must be a bytestring.
        data_json = {
            'timestamps': {'created': timestamp},
            'items': items,
            'user_id': user_id,
            'cost': cost,
            'BookingNumber': event['BookingNumber']
        }

        bytes_data = str(json.dumps(data_json)).encode('utf-8')

        # When you publish a message, the client returns a future.
        api_future = client.publish(topic_path, bytes_data)
        message_id = api_future.result()

        print(f"Published {data_json} to {topic_path}: {message_id}")

        return {
            'statusCode': 200,
            'body': json.dumps('Order created successfully')
        }
    except KeyError:
        return {
            'statusCode': 500,
            'err': 'Missing parameters, need <project_id>, <topic_id>, <items>, <user_id> ,<cost>, <BookingNumber>'
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'err': f'Something went wrong: {e}'
        }
