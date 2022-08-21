import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../utility/common";
import "bootstrap/dist/css/bootstrap.css";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import swal from "sweetalert";

import { AuthContext } from "../../providers/AuthProvider";

const Pass = () => {
    const { currentUser } = useContext(AuthContext);

    const [fields, setFields] = useState({
        fromdate: "",
        todate: "",
        tour: "",
        cost: "",
        persons: "",
    });

    useEffect(() => {
        if (isLoggedIn() && fields.fromdate.length == 0) {
            console.log("calling axios");
            axios({
                method: "get",
                mode: "no-cors",
                url: "https://mh990oc3p2.execute-api.us-east-1.amazonaws.com/test/user/tour",
                method: "get",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "text/plain",
                },
                params: {
                    email: currentUser.email,
                    // email: "shivashanker208@gmail.com",
                },
            })
                .then((res) => {
                    console.log("response", res);
                    setFields(res.data);
                    if (res.data.tour.length > 0) {
                        swal({
                            title: "Tour passes are ready!",
                            text: "kindly check your information and enjoy your tour",
                            icon: "info",
                            timer: 3000,
                            buttons: false,
                        });
                    } else {
                        swal({
                            title: "No tours found",
                            text: "Tour information not found in the database, please submit your preferences to generate a tour pass.",
                            icon: "warning",
                            timer: 3000,
                            buttons: false,
                        });
                    }
                })
                .catch((error) => {
                    console.log("error", error);
                    swal({
                        title: "Unknown error",
                        text: "We faced an error in retrieving your passes, please contact the administrator",
                        icon: "error",
                        timer: 3000,
                        buttons: false,
                    });
                });
        }
    });

    if (!isLoggedIn()) {
        swal({
            title: "Unauthorized User",
            text: "Please login to check your tour passes",
            icon: "warning",
            timer: 3000,
            buttons: false,
        });
        return <Navigate to="/" replace />;
    }

    return (
        (isLoggedIn() && currentUser != null && (
            <div
                className="container"
                style={{ height: "100vh", display: "flex" }}
            >
                <div
                    style={{
                        // height: 756,
                        // width: 1344,
                        // height: 702,
                        // width: 1248,
                        // height: 648,
                        // width: 1152,
                        height: 756,
                        width: 1134,
                        // background: `url("https://res.cloudinary.com/hackerrank/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency//v1658150645/pass_qhmach.jpg")`,
                        background: `url("https://res.cloudinary.com/hackerrank/image/upload/v1658645743/pass-modified_kojfr2.jpg")`,

                        backgroundSize: "1134px 756px",
                        // backgroundSize: "1152px 648px",
                        // backgroundSize: "1248px 702px",
                        // backgroundSize: "960px 540px",

                        // height: 540,
                        // width: 960,
                        margin: "auto",
                        // color: "#FFB93F",
                        color: "#FFF",
                        // marginTop: "100px",
                        // padding: "150px 150px 0 200px",
                        padding: "175px 150px 0 200px",
                        fontSize: 22,
                    }}
                >
                    <div style={{ verticalAlign: "middle" }}>
                        <div className="row mb-5">
                            <div className="col">
                                <div className="form-outline">
                                    <label className="form-label">
                                        First name :
                                        {" " + currentUser.firstName}
                                    </label>
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-outline">
                                    <label className="form-label">
                                        Last name :{" " + currentUser.lastName}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="form-outline mb-5">
                            <label className="form-label">
                                Company name : B&B Tour Services
                            </label>
                        </div>

                        <div className="form-outline mb-5">
                            <label className="form-label">
                                Tour Package : {" " + fields.tour}
                            </label>
                        </div>

                        <div className="form-outline mb-5">
                            <label className="form-label">
                                Total Number of Persons : {" " + fields.persons}
                            </label>
                        </div>

                        <div className="form-outline mb-5">
                            <label className="form-label">
                                Cost : {" " + fields.cost + " per person"}
                            </label>
                        </div>
                        <div className="row">
                            <div className="col">
                                <div className="form-outline">
                                    <label className="form-label">
                                        Valid From : {" " + fields.fromdate}
                                    </label>
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-outline">
                                    <label className="form-label">
                                        Valid To : {" " + fields.todate}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
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

export default Pass;
