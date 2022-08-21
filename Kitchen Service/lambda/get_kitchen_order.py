import json

import boto3

client = boto3.client('dynamodb')


def lambda_handler(event, context):
    table_name = 'kitchen_orders'
    print('HI')
    results = []
    last_evaluated_key = None
    while True:
        print('in here')
        if last_evaluated_key:
            response = client.scan(
                TableName=table_name,
                ExclusiveStartKey=last_evaluated_key
            )
            print(f'RES: {response}')
        else: 
            response = client.scan(TableName=table_name)
            print(f'RES: {response}')
        last_evaluated_key = response.get('LastEvaluatedKey')
        
        results.extend(response['Items'])
        
        if not last_evaluated_key:
            break
    
    processed_results = []
    
    for result in results:
        new_dict = {}
        # new_dict['user_id'] = result['user_id']['S']
        # new_dict['status'] = result['status']['S']
        
        # new_dict['timestamp_confirmed'] = result['timestamps']['M']['confirmed']['S']
        # new_dict['timestamp_created'] = result['timestamps']['M']['created']['S']
        # new_dict['timestamp_delivered'] = result['timestamps']['M']['delivered']['S']
        # new_dict['timestamp_failed'] = result['timestamps']['M']['failed']['S']
        items = []
        for item in result['items']['L']:
            nd = {}
            nd['name'] = item['M']['name']['S']
            nd['cost'] = item['M']['cost']['N']
            nd['quantity'] = item['M']['quantity']['N']
            nd['_id'] = item['M']['_id']['S']
            items.append(nd)
        processed_results.append(items)
    return {
        'data': processed_results
    }