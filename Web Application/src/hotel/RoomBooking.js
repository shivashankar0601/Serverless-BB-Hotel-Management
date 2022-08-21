// Author: Akanksha Singh (B00892887)
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import Axios from 'axios';
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from './HotelMgmtConstants';
import { formatRoom } from './HotelMgmtConstants';
import { AuthContext } from "../providers/AuthProvider";
import { useContext } from "react";

//To book a room
export default function RoomBooking(props) {
    const room = props.room;
    const checkIn = props.checkIn;
    const checkOut = props.checkOut;
    const show = props.show;
    const handleHide = props.onHide;    
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const bookRoom = () => {
        const cardNumber = document.getElementById("cardNumber");
        console.log("card number " + cardNumber)
        if (!cardNumber.value || cardNumber.value === '') {
            alert("Enter the card number");
            return;
        }
        var userId = '';
        if (currentUser) {
            userId = currentUser.userId;
        }
        else
        {
            alert("You are not logged-in, please login to proceed further");
            navigate("/login");
        }
        console.log("User Id is :" + userId)
        const bookingRequest = {
            checkIn: checkIn,
            checkOut: checkOut,
            userId: userId,
            roomType: formatRoom(room.roomType),
            amountPaid: room.price,
            paidCurrency: room.currency
        }
        console.log("Booking request is ")
        console.log(bookingRequest)

        const bookingUrl = apiBaseUrl + "/hotel/bookings";
        Axios
            .post(bookingUrl, bookingRequest)
            .then((response) => {
                if (response.status === 200) {
                    alert("Your room booking has been completed successfully")        
                    navigate("/user/bookings")       
                }
            })
            .catch((error) => alert("Error in booking the room"));
    }

    const formatDate = (date) => {
        var convertedDate = "";
        const format = "MMMM D, YYYY";
        if (date !== '') {
            convertedDate = moment(date).format(format);
        }
        return convertedDate;
    } 

    return (

        <Modal show={show} onHide={handleHide} centered>
            <Modal.Header closeButton>
                <Modal.Title style={{fontSize:'1.2rem'}}>B & B Hotel Room Booking Request</Modal.Title>
            </Modal.Header>
            <Modal.Body>                         
                <Row>
                    <Col md={4} style={{fontWeight:'bold'}}>Room Type</Col>
                    <Col>{room.roomType}</Col>
                </Row>
                <Row>
                    <Col md={4} style={{fontWeight:'bold'}}>Check In Date</Col>
                    <Col>{formatDate(checkIn)}</Col>
                </Row>
                <Row>
                    <Col md={4} style={{fontWeight:'bold'}}>Check Out Date</Col>
                    <Col>{formatDate(checkOut)}</Col>
                </Row>
                <Row>
                    <Col md={4} style={{fontWeight:'bold'}}>Amount Payable:</Col>
                    <Col>{room.currency} {room.price}</Col>
                </Row>
                <Row style={{marginTop:'0.5rem'}}>
                    <Col>To proceed with the booking enter you card details:</Col>                 
                </Row>
                <Row style={{marginTop:'0.5rem'}}>
                    <Col>
                        <input required
                                id="cardNumber"
                                placeholder="Card Number"                         
                                minlength="16" 
                                maxLength="16" 
                                width="1.8rem" />   
                    </Col>
                </Row>                
            </Modal.Body>
            <Modal.Footer>
                <Container className='text-center'>
                    <Row>                        
                        <Col xs={6} md={6}>
                            <Button id="button-cancel" variant="secondary" onClick={handleHide} style={{width:'6rem'}}>
                                Cancel
                            </Button>
                        </Col>
                        <Col xs={6} md={6}>
                            <Button id="button-confirm" variant="dark" onClick={bookRoom} style={{width:'6rem'}}>
                                Pay
                            </Button>   
                        </Col>
                    </Row>
                </Container>
            </Modal.Footer>
        </Modal>
    );

}