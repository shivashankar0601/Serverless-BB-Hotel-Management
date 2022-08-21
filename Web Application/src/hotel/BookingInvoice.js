// Author: Akanksha Singh (B00892887)
import { Row, Col, Modal, Table } from "react-bootstrap";
import { AuthContext } from "../providers/AuthProvider";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import moment from 'moment';

//For viewing the invoice
export default function BookingInvoice(props) {

    const room = props.room;
    const showInvoice = props.show;
    const handleHide = props.onHide;  
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    console.log(room)

    const getGuestName = () => {
        var guestFullName = '';
        if (currentUser) {
            guestFullName = currentUser.firstName.concat(' ').concat(currentUser.lastName) ;             
        }
        else
        {
            alert("You are not logged-in, please login to proceed further");
            navigate("/login");
        }
        return guestFullName;
    }
    
    const convertDate = (timeInMilli, format) => {
        var convertedDate = "";
        if (timeInMilli !== '') {
            var date = new Date(timeInMilli);
            convertedDate = moment(date).format(format);
        }
        return convertedDate;
    }

    const calculateTotal = () => {
        var totalAmount = 0;
        room.invoiceLines.map((line) => totalAmount = totalAmount + line.amount);
        return totalAmount;
    }
    
    return (

        <Modal show={showInvoice} fullscreen={true} onHide={handleHide}>
            <Modal.Header style={{textAlign:'center'}} closeButton>
                <h2>B & B Hotel</h2>
            </Modal.Header>            
            <h3><center>INVOICE</center></h3>           
            <Modal.Body>    
                <Row>
                    <Col>Booking Number</Col>
                    <Col>{room.bookingNumber}</Col>
                    <Col></Col>
                    <Col>Booking Date</Col>
                    <Col>{convertDate(room.bookingDate, "MMMM D, YYYY HH:mm:ss")}</Col>
                </Row>

                <Row style = {{marginTop:'0.3rem'}}>
                    <Col>Check In</Col>
                    <Col>{convertDate(room.checkIn, "MMMM D, YYYY")}</Col>
                    <Col></Col>
                    <Col>Check Out</Col>
                    <Col>{convertDate(room.checkOut, "MMMM D, YYYY")}</Col>
                </Row>

                <Row style = {{marginTop:'0.3rem'}}>
                    <Col>Guest Name</Col>
                    <Col>{getGuestName()}</Col>
                    <Col></Col>
                    <Col></Col>
                    <Col></Col>
                </Row>

                <hr/>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Description</th>
                            <th align="right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            room.invoiceLines.map((line, index) => 
                                <tr key={index}>
                                    <td>{line.type}</td>
                                    <td>{line.description}</td>
                                    <td align="right">{line.amount}</td>
                                </tr>                                    
                            )
                        }
                        <tr>
                            <td><strong>Total</strong></td>
                            <td align="right" colSpan={2}>CAD {calculateTotal()}</td>
                        </tr>
                    </tbody>
                </Table>                 
            </Modal.Body>
        </Modal>

    );

}