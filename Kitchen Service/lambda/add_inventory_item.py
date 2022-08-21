import json

import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('kitchen_inventory')


def lambda_handler(event, context):
    table.put_item(Item=event['item'])
    return {
        'success': True
    }
