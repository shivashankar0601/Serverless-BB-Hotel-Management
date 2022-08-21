import { Link } from "react-router-dom";
import { Navbar } from "reactstrap";

const Footer = () => {
  return (
    <Navbar
      color="dark"
      dark
      expand="md"
      style={{
        position: "fixed",
        width: "100%",
        bottom: "0px",
      }}
    >
      <div className="container">
        <div
          className="text-center p-2 d-flex justify-content-center text-white"
          // style={{ backgroundCcolor: "rgba(0, 0, 0, 0.2)" }}
        >
          <span style={{ marginRight: "5px" }}>© 2022 Copyright : </span>
          <Link className="text-white" to="/">
            B&B Hotel
          </Link>
        </div>
      </div>
    </Navbar>
  );
};

export default Footer;
