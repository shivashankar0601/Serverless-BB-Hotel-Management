package serverless.bnb.lambda.model;

public enum RoomType {

    EXECUTIVE("Executive Room"), DELUXE("Deluxe Room"), SUPER_DELUXE("Super Deluxe Room");

    public final String roomType;

    RoomType(String roomType) {this.roomType = roomType;}

    public static boolean isValid(String value) {
        Boolean isValid = Boolean.FALSE;
        for (RoomType condition : RoomType.values()) {
            if (condition.roomType.equals(value)) {
                isValid = Boolean.TRUE;
            }
        }
        return isValid;
    }

    public static RoomType getRoomType(String value) {
        RoomType roomType = null;
        for (RoomType type : RoomType.values()) {
            if (type.roomType.equals(value)) {
                roomType = type;
            }
        }
        return roomType;
    }

}
