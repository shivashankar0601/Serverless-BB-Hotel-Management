import "bootstrap/dist/css/bootstrap.css";
import { useState, useContext } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { isLoggedIn } from "../../utility/common";
import * as HotelMgmtConstants from '../../hotel/HotelMgmtConstants';
import Axios from "axios";
import {
    TextField,
    Stack,
    Button,
} from "@mui/material";


const Feedback = () => {
    const navigate = useNavigate();
    const [fields, setFields] = useState({
        title: "",
        description: "",
    });

    let param = useParams();
    const bookingNumber = param.bookingNumber;
    console.log("The booking Number is " + bookingNumber);

    const handleFieldsChange = (e) => {
        const { currentTarget: input } = e;
        let fieldsObj = { ...fields };
        if (input === undefined || input === null)
            fieldsObj[e.target.name] = e.target.value;
        else fieldsObj[input.name] = input.value;
        setFields(fieldsObj);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const userId = "Akanksha_Singh_2022-07-20T21:58:12.553Z";        
        const createFeedbackUrl = HotelMgmtConstants.customerApiBaseUrl + "/user/feedback";
        const feedback = {
            userId: userId,
            header: fields.title,
            body: fields.description,
            bookingNumber: bookingNumber
        }
        console.log(feedback);

        Axios
        .post(createFeedbackUrl, feedback)
        .then((response) => {
            if (response.status === 201) {
                alert("Feedback saved successfully") 
                navigate("/user/bookings")
            }
        })
        .catch((error) => alert("Error in saving the feedback, please try again later"));
    };

    return (
        <div className="container">
            <div className="row d-flex justify-content-center">
                <div
                    className="bg-dark p-2 mt-5"
                    style={{
                        borderRadius: "15px",
                    }}
                >
                    <h3
                        style={{
                            color: "white",
                            textAlign: "center",
                        }}
                    >
                        Your Feedback is valuable for us to improve our services
                        to serve you better
                    </h3>
                </div>
            </div>
            <br />
            <br />
            <div style={{ paddingLeft: "25px", marginTop: "15px" }}>

                <TextField sx={{
                        width: "100%",
                    }}
                    disabled
                    id="filled-disabled"
                    label="Booking Number"
                    defaultValue={bookingNumber}
                
                />
            </div>
            <br />
            <div style={{ paddingLeft: "25px", marginTop: "15px" }}>
                <TextField
                    id="title"
                    name="title"
                    label="Feedback Title"
                    variant="outlined"
                    placeholder="Ex: Good Food services from kitchen"
                    fullWidth
                    value={fields.name}
                    onChange={handleFieldsChange}
                />
            </div>
            <br />
            <div style={{ paddingLeft: "25px", marginTop: "15px" }}>
                <TextField
                    id="description"
                    name="description"
                    label="Detailed Feedback"
                    multiline
                    rows={6}
                    placeholder="Ex: Kitchen is fully loaded with a wide variety of food items. especially the italian cuisine is the best"
                    fullWidth
                    value={fields.description}
                    onChange={handleFieldsChange}
                />
            </div>
            <br />
            <br />
            <div
                className="d-flex justify-content-center"
                style={{ paddingLeft: "25px", marginTop: "15px" }}
            >
                <Stack
                    spacing={5}
                    direction="row"
                    sx={{ width: "fit-content" }}
                >
                    <Button
                        sx={{ backgroundColor: "black", color: "white" }}
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                    <Button
                        sx={{ backgroundColor: "gray", color: "white" }}
                        variant="contained"
                        onClick={() => {
                            navigate("/feed/posts");
                        }}
                    >
                        Cancel
                    </Button>
                </Stack>
            </div>
            <br />
            <br />
        </div>
    );
};

export default Feedback;
