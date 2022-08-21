import json
import boto3

client = boto3.client('dynamodb')


def lambda_handler(event, context):
    table_name = 'kitchen_inventory'
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
        new_dict['_id'] = result['_id']['S']
        new_dict['cost'] = result['cost']['N']
        new_dict['inventory_value'] = result['inventory_value']['N']
        new_dict['name'] = result['name']['S']
        new_dict['desc'] = result['desc']['S']
        new_dict['img'] = result['img']['S']

        processed_results.append(new_dict)
    return {
        'data': processed_results
    }
