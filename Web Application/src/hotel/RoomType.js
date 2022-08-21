// Author: Akanksha Singh (B00892887)
import { Card, Row, Col, Button } from "react-bootstrap";
import RoomBooking from "./RoomBooking";
import { useState } from "react";
import { isLoggedIn } from "../utility/common";
import { useNavigate } from "react-router-dom";
import { formatRoom } from './HotelMgmtConstants';

export default function RoomType (props) {

    const room = props.room;
    const checkIn = props.checkIn;
    const checkOut = props.checkOut;
    const amenityCategory = Object.keys(room.amenities);
    const [showBookRoom, setshowBookRoom] = useState(false);
    const navigate = useNavigate();
    
    const bookNowHandler = () => {
        if (!isLoggedIn()) {
            alert("Please login to proceed with the room booking")
            navigate("/login")
        } else {
            setshowBookRoom(true);
        }        
    }

    const handleHide = () => {
        setshowBookRoom(false);
    }

    return (
        <Card>
            <Card.Header><strong>{formatRoom(room.roomType)}</strong></Card.Header>
            <Card.Body>
                <Row>
                    <Col md={10}>
                        <Row>
                            <Col md={3}>Number of Beds</Col>
                            <Col md={9}>{room.numberOfBeds}</Col>
                        </Row>
                        <Row>
                            <Col md={3}>Room area</Col>
                            <Col md={9}>{room.roomArea}</Col>
                        </Row>
                        <Row style={{marginTop:'0.5rem'}}>
                            <Col md={3}>Amenities</Col>
                            <Col md={9}>
                                <Row>
                                    {amenityCategory
                                        .map(key =>                                                           
                                            <Col md={4} key={key}>
                                                <strong>{key}</strong>
                                                {room.amenities[key].map(a => 
                                                    <ul key={a}>{a}</ul>)
                                                }
                                            </Col>                                                                        
                                    )}
                                </Row>  
                            </Col>
                        </Row>
                    </Col>
                    <Col md={2} align="right">
                        <span style={{color:'green'}}>
                            {room.currency} {room.price}                            
                        </span>
                        <br/>
                        <span>
                            <small style={{fontStyle:'italic'}}>per night</small>
                        </span>
                        <br/><br/>
                        <Button variant="dark" onClick={bookNowHandler} >
                            Book Now
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
            {
                showBookRoom && 
                <RoomBooking room={room} 
                                checkIn={checkIn} 
                                checkOut={checkOut} 
                                show={showBookRoom} 
                                onHide={handleHide} />
            }
        </Card>
    );

}

