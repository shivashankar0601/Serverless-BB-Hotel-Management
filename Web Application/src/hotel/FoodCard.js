import { useState } from "react";
import { Card, Col } from "react-bootstrap";

export default function FoodCard(props) {
	const [selected, select] = useState(false);
	const [selectError, setSelectError] = useState(false);
	const [selectCount, setSelectCount] = useState(0);

	const handleClick = () => {
		select(true);
		if (props.item.inventory_value - selectCount > 0) {
			props.addItem({ ...props.item, quantity: 1 });
			setSelectCount(selectCount + 1);
		} else {
			setSelectError(true);
		}
	};

	return (
		<Col style={{ width: "18rem", margin: "10px", position: "relative" }}>
			<Card
				style={{
					border: `${selected ? "2px solid green" : ""}`,
					transition: "0.5s ease-in-out",
				}}
				className="pointer"
				onClick={handleClick}
			>
				<Card.Img
					variant="top"
					src={
						props.item.img
							? props.item.img
							: "https://www.rawshorts.com/freeicons/wp-content/uploads/2017/01/Travel-pict-dinner.png"
					}
					style={{ height: "280px", width: "auto" }}
				/>
				<Card.Body style={{ height: "100%" }}>
					<Col>
						<Card.Title>{props.item.name}</Card.Title>
						<Card.Text>{props.item.desc}</Card.Text>
					</Col>
				</Card.Body>
				<Card.Footer>
					<Col>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<span style={{ color: "green" }}>
								<strong>${props.item.cost}</strong>
							</span>
							<span style={{ color: "gray" }}>
								<strong>{props.item.inventory_value - selectCount} left</strong>
							</span>
						</div>
					</Col>
					<Col>{selectError ? "Insufficient inventory" : null}</Col>
				</Card.Footer>
			</Card>
			<div
				style={{
					position: "absolute",
					top: "5px",
					right: "5px",
					borderRadius: "50%",
					backgroundColor: "green",
					height: "20px",
					width: "20px",
					color: "white",
					fontSize: "small",
					textAlign: "center",
					fontWeight: "bold",
				}}
			>
				{selectCount}
			</div>
		</Col>
	);
}
