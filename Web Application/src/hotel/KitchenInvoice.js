// Author: Akanksha Singh (B00892887)
import { useState, useEffect } from "react";
import {
	Tabs,
	Tab,
	Container,
	Row,
	Col,
	CardGroup,
	Card,
	Table,
} from "react-bootstrap";
import Axios from "axios";
import BookingDetailsCard from "./BookingDetailsCard";
import * as HotelMgmtConstants from "./HotelMgmtConstants";
import { AuthContext } from "../providers/AuthProvider";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

export default function KitchenInvoice() {
	const [pastBookings, setPastBookings] = useState([]);
	const [upcomingBookings, setUpcomingBookings] = useState([]);
	const navigate = useNavigate();
	const { currentUser } = useContext(AuthContext);
	console.log("Current user is " + currentUser);

	useEffect(() => {
		var userId = "";
		if (currentUser) {
			userId = currentUser.userId;
		} else {
			alert("You are not logged-in, please login to proceed further");
			navigate("/login");
		}
		console.log("User Id is :" + userId);
		const getBookingsUri =
			HotelMgmtConstants.apiBaseUrl + `/hotel/bookings?userId=${userId}`;
		Axios.get(getBookingsUri)
			.then((response) => {
				console.log(response);
				if (response.status === 200) {
					processBookings(response.data.bookings);
				} else if (response.status === 404) {
					alert("You have no bookings");
				}
			})
			.catch((error) => {
				console.log("Error in fetching the room bookings");
			});
	}, []);

	const processBookings = (bookings) => {
		const now = new Date();
		let pastBookings = [];
		let upcomingBookings = [];
		bookings.map((booking) => {
			if (booking.checkOut < now) {
				pastBookings.push(booking);
			} else {
				upcomingBookings.push(booking);
			}
		});
		setPastBookings(pastBookings);
		upcomingBookings = upcomingBookings.filter(
			(b) => b.invoiceLines.length > 1
		);
		setUpcomingBookings(upcomingBookings);
		console.log("Total past bookings " + pastBookings.length);
		console.log("Total upcoming bookings " + upcomingBookings.length);
	};

	return (
		<Container md={9}>
			<h2>All Bookings</h2>
			<span>
				*<i>Standard Check-in time is 12 PM and Checkout is 10 AM</i>
			</span>
			<hr />
			<div>
				{console.log(upcomingBookings)}

				{upcomingBookings
					? upcomingBookings.map((b) => (
							<Card style={{ margin: "10px" }}>
								<Card.Header>
									<strong>{b.bookingNumber}</strong>
								</Card.Header>
								<Card.Body>
									<Table striped hover>
										{console.log("B: ", b)}
										<thead>
											<th>Description</th>
											<th>Amount</th>
										</thead>
										<tbody>
											{b.invoiceLines.slice(1).map((order) => (
												<tr>
													<td>{order.description.slice(0, -2)}</td>
													<td>${order.amount}</td>
												</tr>
											))}
										</tbody>
									</Table>
								</Card.Body>
							</Card>
					  ))
					: null}
			</div>

			<hr />
		</Container>
	);
}
