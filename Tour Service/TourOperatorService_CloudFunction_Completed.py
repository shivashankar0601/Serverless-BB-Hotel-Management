"""
    Author: Shiva Shankar Pandillapalli
    Banner: B00880049
    Task: Tour Operator Service takes the information (Recommended tour information) received from the google pub/sub pushed by tour service cloud function and writes the information as needed to the mongoDB database.
"""

import boto3
from botocore.config import Config
from datetime import date
import base64
import json

dynamoDB = boto3.client(
    'dynamodb',
    config = Config(region_name = 'us-east-1'),
    aws_access_key_id="ASIAUY3T34APMXFIF5BU",
    aws_secret_access_key="oM8+V6So9o2hCRVGfEdouSL5SR4z9/dGf74S2pfz",
    aws_session_token="FwoGZXIvYXdzECwaDOStGK+kmt6Al0Eq+yLAAfeg34PoxIIovnrTJg+dFrfBx1ZwOuAG5n2bNOHh1KQJMdrN1RhhNM9diNa3pAKQaxaloU66doTZRCc9+WFnU7GHaGl7V82RlonR2g+t1ztZtIV82+9+sLeHkTu+luqMgp3HvF4pXj95pE02wRFYKrF7Po1UC946hQ9DFfNZSXfZnFseqMWwsGChXBVS1wR6bq2lZE7jd9LTFO1EtLeWHo/8ogKGoLpuv4Fjo0Ou0M2whQQmvlQp6DD2fI+008ftpiit0uuWBjItYCV4aNnWS/4syY3ezQW/Q9XBOxns7DoVG9Er3BjWn3qag7v4j2HTCKkJTMkg"
    )

# ddb_exceptions = dynamoDB.exceptions

# def createRecommendationsInformationTable():
#     try:
#         res = dynamoDB.create_table(
#             TableName="RecommendationsInfo",
#             AttributeDefinitions=[
#                 {
#                     "AttributeName": "RecID",
#                     "AttributeType": "S"
#                 }
#             ],
#             KeySchema=[
#                 {
#                     "AttributeName": "RecID",
#                     "KeyType": "HASH"
#                 }
#             ],
#             ProvisionedThroughput={
#                 "ReadCapacityUnits": 1,
#                 "WriteCapacityUnits": 1
#             }
#         )

#         res.wait_until_exists()


#         # dynamoDB.put_item(TableName='Recommendations',Item={'RecID':{'S':'1'},'Date':{'S':str(date.today())},'recommendation':{'S':'1'}})
#         # put all recommendations decided here so they could be tagged along from the database


#         print("received response now ",res)
#         return "succeeded"

#     except Exception as e:
#         print("exception raise : ",e)
#         return "failed"






def createUserRecommendationsTableIfNotExists():
    try:
        res = dynamoDB.create_table(
            TableName="Recommendations",
            AttributeDefinitions=[
                {
                    "AttributeName": "userID",
                    "AttributeType": "S"
                }
            ],
            KeySchema=[
                {
                    "AttributeName": "userID",
                    "KeyType": "HASH"
                }
            ],
            ProvisionedThroughput={
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1
            }
        )

        print("received response now ",res)

        waiter = dynamoDB.get_waiter('table_exists')
        waiter.wait(TableName='Recommendations')

        
        return "succeeded"

    except Exception as e:
        print("exception raise : ",e)
        return "failed"


def writeRecommendationToDynamoDB(request, context):
    pubsub_message = base64.b64decode(request['data']).decode('utf-8')
    # print(pubsub_message)
    data = json.loads(pubsub_message)
    # print(type(data))
    # print(data['user'])
    # print(data['tour'])
    # request_json = request.get_json()
    try:
        tables = dynamoDB.list_tables()['TableNames']
        print(tables)
        if 'Recommendations' not in tables:
            print("table does not exists, so creating")
            createUserRecommendationsTableIfNotExists()
            print("table created successfully")

        waiter = dynamoDB.get_waiter('table_exists')
        waiter.wait(TableName='Recommendations')

        print("putting item in the table")
        dynamoDB.put_item(TableName='Recommendations',Item={'userID':{'S':data['user']},'Date':{'S':str(date.today())},'recommendation':{'S':data['tour']},'persons':{'S':data['persons']},'cost':{'S':data['cost']},'duration':{'S':data['duration']}})
        print("item inserted successfully")
        
        
        # return "item inserted successfully"
        # return readRecommendationFromDynamoDB()
    except Exception as e:
        print("exception raised in writing recommendations: ",e)
        return "exception raised in writing recommendations"