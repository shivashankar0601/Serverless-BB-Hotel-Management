
import json
import datetime
import time
import os
import dateutil.parser
import logging
import urllib3

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


# --- Helpers that build all of the responses ---


def elicit_slot(session_attributes, intent_name, slots, slot_to_elicit, message):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ElicitSlot',
            'intentName': ViewMenu,
            'slots': slots,
            'slotToElicit': slot_to_elicit,
            'message': message
        }
    }


def confirm_intent(session_attributes, intent_name, slots, message):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ConfirmIntent',
            'intentName': ViewMenu,
            'slots': slots,
            'message': message
        }
    }


def close(fulfillment_state, message):
    response = {
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }

    return response


def delegate(session_attributes, slots):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Delegate',
            'slots': slots
        }
    }


# --- Helper Functions ---


def safe_int(n):
    """
    Safely convert n value to int.
    """
    if n is not None:
        return int(n)
    return n


def try_ex(func):
    """
    Call passed in function in try block. If KeyError is encountered return None.
    This function is intended to be used to safely access dictionary.

    Note that this function would have negative impact on performance.
    """

    try:
        return func()
    except KeyError:
        return None



def build_validation_result(isvalid, violated_slot, message_content):
    return {
        'isValid': isvalid,
        'violatedSlot': violated_slot,
        'message': {'contentType': 'PlainText', 'content': message_content}
    }



def viewRoom(intent_request):
    checkin = try_ex(lambda: intent_request['currentIntent']['slots']['checkin'])
    checkout = try_ex(lambda: intent_request['currentIntent']['slots']['checkout'])
    VIEW_ROOMS_API_ENDPOINT = "https://gb4hi5fgpb.execute-api.us-east-1.amazonaws.com/prod/hotel/rooms?checkIn="+str(checkin)+"&checkOut="+str(checkout)
    print("ENDP",VIEW_ROOMS_API_ENDPOINT)
    http = urllib3.PoolManager()
    res = http.request('GET', VIEW_ROOMS_API_ENDPOINT)
    print('Status: ', res.status)
    #print('Response: ', res.data)
    print(json.loads(res.data)['data'])
    data = json.loads(res.data)['data']
    if data is not None:
        finalResponse = "We currently have the following rooms for dates "+str(checkin)+" to "+str(checkout)
    
        for i in data:
            finalResponse += " RoomType: " + i['roomType'] + ", no of beds: "+ str(i['numberOfBeds'])+", price: " + str(i['price']) + ", total rooms available: "+str(i['totalRooms'])
    else:
        finalResponse = "We don't have rooms on specified dates"
    
          
    print(finalResponse)  
    
    
    return close(

        'Fulfilled',
        {
            'contentType': 'PlainText',
            'content': finalResponse
        }
    )

    
def viewBookings(intent_request):
    
    refId = try_ex(lambda: intent_request['currentIntent']['slots']['bookingRef'])
    VIEW_BOOKINGS_API_ENDPOINT = "https://gb4hi5fgpb.execute-api.us-east-1.amazonaws.com/prod/hotel/bookings?bookingNumber="+str(refId) 
    print("ENDP",VIEW_BOOKINGS_API_ENDPOINT)
    http = urllib3.PoolManager()
    res = http.request('GET', VIEW_BOOKINGS_API_ENDPOINT)
    print('Status: ', res.status)
    #print('Response: ', res.data)
    print(json.loads(res.data)['bookings'])
    data = json.loads(res.data)['bookings']
    if data is not None:
        finalResponse = "Your booking details "
    
        for i in data:
            finalResponse += " Booking Number: " + i['bookingNumber'] + ", amount paid: "+ str(i['amountPaid'])+", status: " + i['status'] + ", User ID: "+str(i['userId'])
    else:
        finalResponse = "You dont have any bookings with us"
    
               
    print(finalResponse)  
    
    
    return close(

        'Fulfilled',
        {
            'contentType': 'PlainText',
            'content': finalResponse
        }
    )

    

def dispatch(intent_request):
    """
    Called when the user specifies an intent for this bot.
    """

    logger.debug('dispatch userId={}, intentName={}'.format(intent_request['userId'], intent_request['currentIntent']['name']))

    intent_name = intent_request['currentIntent']['name']

    # Dispatch to your bot's intent handlers
    if intent_name == 'viewRooms':
        return viewRoom(intent_request)  
    elif intent_name == 'viewBookings':
        return viewBookings(intent_request)

    raise Exception('Intent with name ' + intent_name + ' not supported')



# --- Main handler ---


def lambda_handler(event, context):
    """
    Route the incoming request based on intent.
    The JSON body of the request is provided in the event slot.
    """
    # By default, treat the user request as coming from the America/New_York time zone.
    os.environ['TZ'] = 'America/New_York'
    time.tzset()
    print(event['currentIntent']['name'])
    logger.debug('event.bot.name={}'.format(event['bot']['name']))

    return dispatch(event)

