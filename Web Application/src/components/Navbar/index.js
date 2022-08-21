import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
} from "reactstrap";
import { AuthContext } from "../../providers/AuthProvider";

import { isLoggedIn } from "../../utility/common";

const NavbarComponent = () => {
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();
	const { logout } = useContext(AuthContext);

	const toggle = () => setIsOpen(!isOpen);

	return (
		<Navbar color="dark" dark expand="md">
			<NavbarBrand onClick={() => navigate("/")}>Serverless B&B</NavbarBrand>
			<NavbarToggler onClick={toggle} />
			<Collapse isOpen={isOpen} navbar>
				<Nav className="me-auto" navbar>
					<NavItem>
						<NavLink to="/rooms">Rooms</NavLink>
					</NavItem>
					{isLoggedIn() && (
						<>
							<NavItem>
								<NavLink to="/user/bookings">Bookings</NavLink>
							</NavItem>
							<NavItem>
								<NavLink to="/kitchen">Kitchen</NavLink>
							</NavItem>
							<NavItem>
								<NavLink to="/kitchen-invoice">Kitchen Orders</NavLink>
							</NavItem>
						</>
					)}
					<NavItem>
						<NavLink to="/preferences">Tours</NavLink>
					</NavItem>
					<NavItem>
						<NavLink to="/pass">Tour Passes</NavLink>
					</NavItem>
					{isLoggedIn() && (
						<NavItem>
							<NavLink to="/visualization">Visualization</NavLink>
						</NavItem>
					)}
				</Nav>
				{isLoggedIn() ? (
					<NavItem>
						<NavLink to="/login" onClick={() => logout()}>
							Logout
						</NavLink>
					</NavItem>
				) : (
					window.location.pathname !== "/login" && (
						<NavItem>
							<NavLink to="/login">Sign in</NavLink>
						</NavItem>
					)
				)}
			</Collapse>
		</Navbar>
	);
};

export default NavbarComponent;
