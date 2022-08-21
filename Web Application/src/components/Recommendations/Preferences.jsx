import "bootstrap/dist/css/bootstrap.css";
import { useState, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utility/common";
import { Stack, Button } from "@mui/material";
import axios from "axios";
import { AuthContext } from "../../providers/AuthProvider";
import swal from "sweetalert";

const Preferences = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState({
        stay: 1,
        activity: 1,
        interest: { natural: true, historical: false, entertainment: false },
        budget: 1,
        distance: 1,
        persons: 1,
    });

    const handleChange = ({ currentTarget: input }) => {
        let pref = { ...preferences };
        if (input.tagName === "SELECT") {
            // console.log(input.name);
            pref[input.name] = parseInt(input.value);
        } else {
            let names = input.name.split(".");
            pref[names[0]][names[1]] = !pref[names[0]][names[1]];
        }
        // console.log(pref);
        setPreferences(pref);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        let req =
            "" +
            preferences.stay +
            "," +
            preferences.activity +
            "," +
            (preferences.interest.natural === false ? "1" : "") +
            (preferences.interest.historical === true ? "2" : "") +
            (preferences.interest.entertainment === true ? "3" : "") +
            "," +
            preferences.budget +
            "," +
            preferences.distance;
        // console.log(req);
        // 3,2,123,3,3
        // duration,activity,interest,budget,distance

        axios
            .post(
                "https://mh990oc3p2.execute-api.us-east-1.amazonaws.com/test/user/tour",
                // { userEmail: currentUser.email, data: req }
                {
                    email: currentUser.email,
                    // email: "shivashanker208@gmail.com",
                    data: req,
                    persons: preferences.persons,
                    cost: preferences.budget,
                    duration: preferences.stay,
                }
            )
            .then((res) => {
                console.log(res);
                if (res.status === 200) {
                    swal({
                        title: "Preferences submitted successfully",
                        text: "Your tour pases will be generated soon... kindly visit TourPasses page to view your latest tour information with passes.",
                        icon: "success",
                        timer: 3000,
                        buttons: false,
                    });
                }
            })
            .catch((error) => {
                swal({
                    title: "Error in submitting preferences",
                    text: "Something went wrong, try again after refreshing the page.",
                    icon: "error",
                    timer: 3000,
                    buttons: false,
                });
            });
    };

    return (
        (isLoggedIn() && currentUser != null && (
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
                            Fill your preferences here to get a tour
                            recommendation and its passes
                        </h3>
                    </div>
                </div>
                <div className="row d-flex justify-content-center">
                    <div className="col-3 p-3 text-end">
                        <label htmlFor="persons" className="form-label p-3">
                            Total no of People :
                        </label>
                    </div>
                    <div className="col-5 p-3">
                        <div className="p-3 px-2">
                            <select
                                name="persons"
                                className="form-select"
                                onChange={handleChange}
                                value={preferences.persons}
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3 or more</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-center">
                    <div className="col-3 p-3 text-end">
                        <label htmlFor="stay" className="form-label p-3">
                            Duration of Stay :
                        </label>
                    </div>
                    <div className="col-5 p-3">
                        <div className="p-3 px-2">
                            <select
                                name="stay"
                                className="form-select"
                                onChange={handleChange}
                                value={preferences.stay}
                            >
                                <option value="1">1 Day</option>
                                <option value="2">2 Days</option>
                                <option value="3">3 or more</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-center">
                    <div className="col-3 p-3 text-end">
                        <label
                            htmlFor="activityType"
                            className="form-label p-3"
                        >
                            Activity Type :
                        </label>
                    </div>
                    <div className="col-5 p-3">
                        <div className="p-3 px-2">
                            <select
                                name="activity"
                                className="form-select"
                                onChange={handleChange}
                                value={preferences.activity}
                            >
                                <option value="1">Outdoor</option>
                                <option value="2">Indore</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row d-flex justify-content-center">
                    <div className="col-3 p-3 text-end">
                        <label
                            htmlFor="InterestType"
                            className="form-label p-3"
                        >
                            Type of Interests :
                        </label>
                    </div>
                    <div className="col-5 p-3">
                        <div id="InterestType" className="p-3">
                            <div className="form-check p-3 pt-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="interest.natural"
                                    onChange={handleChange}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="flexCheckDefault"
                                >
                                    Natural Places
                                </label>
                            </div>
                            <div className="form-check p-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="interest.historical"
                                    onChange={handleChange}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="flexCheckChecked"
                                >
                                    Historical Places
                                </label>
                            </div>
                            <div className="form-check p-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="interest.entertainment"
                                    onChange={handleChange}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="flexCheckDefault"
                                >
                                    Entertainment
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row d-flex justify-content-center">
                    <div className="col-3 p-3 text-end">
                        <label htmlFor="budget" className="form-label p-3">
                            Budget Range :
                        </label>
                    </div>
                    <div className="col-5 p-3">
                        <div className="p-3 px-2">
                            <select
                                className="form-select"
                                name="budget"
                                onChange={handleChange}
                            >
                                <option value="1">100$-250$</option>
                                <option value="2">250$-500$</option>
                                <option value="3">500$ or more</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-center">
                    <div className="col-3 p-3 text-end">
                        <label htmlFor="distance" className="form-label p-3">
                            Distance Range :
                        </label>
                    </div>
                    <div className="col-5 p-3">
                        <div className="p-3 px-2">
                            <select
                                className="form-select"
                                name="distance"
                                onChange={handleChange}
                            >
                                <option value="1">0-25 Miles</option>
                                <option value="2">25-50 Miles</option>
                                <option value="3">50-100 Miles</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div
                    className="form-check-label d-flex justify-content-center mb-5"
                    style={{ paddingLeft: "25px", marginTop: "15px" }}
                >
                    <Stack
                        spacing={5}
                        direction="row"
                        sx={{ width: "fit-content" }}
                    >
                        <Button
                            sx={{
                                backgroundColor: "black",
                                color: "white",
                            }}
                            variant="contained"
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                        <Button
                            sx={{
                                backgroundColor: "gray",
                                color: "white",
                            }}
                            variant="contained"
                            onClick={() => {
                                navigate("/");
                            }}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </div>
            </div>
        )) ||
        (!isLoggedIn() &&
            swal({
                title: "Unauthorized User",
                text: "Please login to check your tour passes",
                icon: "warning",
                timer: 3000,
                buttons: false,
            }) && <Navigate to="/" replace />)
    );
};

export default Preferences;
