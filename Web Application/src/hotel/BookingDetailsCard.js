// Author: Akanksha Singh (B00892887)
import { Card, Row, Col, Dropdown } from "react-bootstrap";
import { useState } from "react";
import moment from 'moment';
import Axios from 'axios';
import * as HotelMgmtConstants from './HotelMgmtConstants';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";
import { useContext } from "react";
import { formatRoom } from './HotelMgmtConstants';
import BookingInvoice from "./BookingInvoice";

//Displays the booking details
//Actions to View invoice and Cancel Bookings
export default function BookingDetailsCard (props) {

    const booking = props.booking;
    const type = props.type;
    const feedbackUrl = `/user/bookings/feedback/${booking.bookingNumber}`;
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    console.log("Current user is " + currentUser)
    const [showRoomInvoice, setShowRoomInvoice] = useState(false);

    const onRoomInvoiceHide = () => {
        setShowRoomInvoice(false);
    }

    const convertDate = (timeInMilli, format) => {
        var convertedDate = "";
        if (timeInMilli !== '') {
            var date = new Date(timeInMilli);
            convertedDate = moment(date).format(format);
        }
        return convertedDate;
    }

    const viewInvoice = () => {
        setShowRoomInvoice(true);
    }

    const cancelBooking = () => {
        console.log("Cancel booking")
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
        const cancelBookingUrl = HotelMgmtConstants.apiBaseUrl + "/hotel/bookings";
        const feedback = {
            userId: userId,
            bookingNumber: booking.bookingNumber
        }
        console.log(feedback);

        Axios
        .put(cancelBookingUrl, feedback)
        .then((response) => {
            if (response.status === 200) {
                alert(response.data)        
                navigate("/user/bookings")       
            }
        })
        .catch((error) => alert("Error in cancelling booking"));
    }
    
    return (
        <Card md={6}>
            <Card.Header>
                <strong>{formatRoom(booking.roomType)}</strong>    
            </Card.Header>
            <Card.Body>
                <Row>        
                    <Col md={8}>
                        <Row>
                            <Col md={3}>Booking Number</Col>
                            <Col md={9}>{booking.bookingNumber}</Col>
                        </Row>
                        <Row>
                            <Col md={3}>Amount Paid</Col>
                            <Col md={9}>CAD {booking.amountPaid}</Col>
                        </Row>
                        <Row>
                            <Col md={3}>Booking Date</Col>
                            <Col md={9}>{convertDate(booking.bookingDate, "MMMM D, YYYY HH:mm:ss")}</Col>
                        </Row>
                        <Row>
                            <Col md={3}>Check In</Col>
                            <Col md={9}>{convertDate(booking.checkIn, "MMMM D, YYYY")}</Col>
                        </Row>
                        <Row>
                            <Col md={3}>Check Out</Col>
                            <Col md={9}>{convertDate(booking.checkOut, "MMMM D, YYYY")}</Col>
                        </Row>
                    </Col>
                    <Col>
                    {
                        type === 'upcoming' &&
                            <Row>
                                <Col>      
                                    <span>
                                        <strong>{booking.status}</strong>
                                        <br/><br/>
                                    </span>                     
                                    
                                    <Dropdown>
                                        <Dropdown.Toggle variant="dark" id="dropdown-basic">
                                            Actions
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={viewInvoice}>
                                                View Invoice
                                            </Dropdown.Item>   
                                            {
                                                (booking.status === 'VALID') && 
                                                <Dropdown.Item onClick={cancelBooking}>Cancel Booking</Dropdown.Item>
                                            }                                                                                     
                                        </Dropdown.Menu>
                                    </Dropdown>                                                        
                                </Col>
                            </Row>
                    }
                    {
                        type === 'past' &&
                        <Row>
                            <Col>                            
                                <Dropdown>
                                    <Dropdown.Toggle variant="dark" id="dropdown-basic">
                                        Actions
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href={feedbackUrl}>
                                            Submit Feedback
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={viewInvoice}>
                                            View Invoice
                                        </Dropdown.Item>                                        
                                    </Dropdown.Menu>
                                </Dropdown>                                                        
                            </Col>
                        </Row>
                    }                                            
                    </Col>
                </Row>
                {
                    showRoomInvoice && 
                        <BookingInvoice room={booking} show={showRoomInvoice} onHide={onRoomInvoiceHide} />
                }
            </Card.Body>
        </Card>

    );

}