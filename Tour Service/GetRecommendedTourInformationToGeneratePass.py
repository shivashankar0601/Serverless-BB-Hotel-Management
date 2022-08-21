"""
    Author: Shiva Shankar Pandillapalli
    Banner: B00880049
    Task: Retrieving the recommended tour information from mongoDB to show in passes.
"""


import json
import boto3
from datetime import date, timedelta, datetime as dt
from random import randint


dynamoDB = boto3.client('dynamodb')

def lambda_handler(event, context):
    try:
        print(event,context)
        data = {
            "fromdate": "",
            "todate": "",
            "tour": "",
            "cost": "",
            "persons": ""
        }
        
        
        
        print(event['queryStringParameters']['email'])
        
        res=dynamoDB.get_item(TableName='Recommendations',Key={'userID':{'S':event['queryStringParameters']['email']}})
        # print(res['Item']['recommendation']['S'])
        
        costRanges = {1:(100,250),2:(250,500),3:(500,2500)}
        cost = int(res['Item']['cost']['S'])
        low,high = costRanges[cost]
        cost = randint(low,high)
        data['cost'] = cost
    
        tours  = {2:"Royal Ontario Museum (ROM)",16:"Aga Khan Museum",1:"CN Tower",3:"Ripley's Aquarium of Canada",6:"Show or Dine in the Entertainment District",11:"City Hall & Nathan Philips Square",12:"Shop at Eaton Center",13:"Watch the Action at Yonge Dundas Square",14:"Toronto International Film Festival (TIFF)",25:"Hockey Hall of Fame",26:"Graffiti Alley",28:"Visit to the CNE",7:"Toronto Zoo",17:"Nature at High Park",23:"Harbourfront Centre and Toronto's Waterfront",9:"Dine and Shop in the Distillery District",5:"Day Trip to Niagara Falls",18:"Trip to Toronto Islands",15:"Stroll through Kensington Market",29:"Go Fishing",4:"Art Gallery of Ontario (AGO)",19:"Ontario Science Centre",21:"The Danforth for a Taste of Greece",22:"Bata Shoe Museum",27:"Rogers Centre",8:"St. Lawrence Market",20:"Little Italy",10:"Tour Casa Loma",24:"Black Creek Pioneer Village"}
        data['tour']=tours[int(res['Item']['recommendation']['S'])]
        
        data['fromdate']=res['Item']['Date']['S']
        
        duration=int(res['Item']['duration']['S'])
        fromDate = res['Item']['Date']['S']
        fromDate = dt.strptime(fromDate, "%Y-%m-%d").date()
        toDate = fromDate + timedelta(days=duration)
        data['todate'] = str(toDate)
        
        data['persons'] = res['Item']['persons']['S']
        
        print(data)

        return {
            'statusCode': 200,
            'body': json.dumps(data)
        }
        
    except Exception as e:
        print(e)
        return {
            'statusCode': 200,
            'body': json.dumps('Error in Lambda!')
        }
