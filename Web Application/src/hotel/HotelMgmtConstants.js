// Author: Akanksha Singh (B00892887)
export const apiBaseUrl = "https://gb4hi5fgpb.execute-api.us-east-1.amazonaws.com/prod";

export const customerApiBaseUrl = "https://q7f1k4nw83.execute-api.us-east-1.amazonaws.com/prod";

export const formatRoom = (roomType) => {
    var formattedRoomType = '';
    if (roomType === 'EXECUTIVE') {
        formattedRoomType = 'Executive Room'
    }
    else if (roomType === 'DELUXE') {
        formattedRoomType = 'Deluxe Room'
    }
    else if (roomType === 'SUPER_DELUXE') {
        formattedRoomType = 'Super Deluxe Room'
    }
    return formattedRoomType;
}

