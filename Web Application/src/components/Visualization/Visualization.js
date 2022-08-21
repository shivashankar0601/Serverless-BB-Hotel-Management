import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { Container, Grid } from "@mui/material";

function Visualization() {
  const [num, setNum] = useState(0);

  const graphHandler = (index) => {
    setNum(index);
  };

  useEffect(() => {}, []);
  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: "#eeeeee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto"
        }}
      >
        <Typography variant="h4" noWrap component="div">
          Visualization
        </Typography>
      </Grid>
      <Grid item xs={3}>
        <List>
          {[
            "Customer booking ",
            "Customer food orders",
            "Customer booking preference"
          ].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={() => graphHandler(index)}>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Grid>

      <Grid item xs={9}>
        <Container>
          {num === 0 && (
            <iframe
              width="800"
              height="600"
              title="bar-chart"
              src="https://datastudio.google.com/embed/reporting/da2fccb8-0b05-4f6a-993e-36d1f0b1f184/page/NRXyC"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
            ></iframe>
          )}
          {num === 1 && (
            <iframe
              width="800"
              height="600"
              title="bar-chart"
              src="https://datastudio.google.com/embed/reporting/64fd40ff-745b-4f4c-aea6-f886f26ce56b/page/QTYyC"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
            ></iframe>
          )}
          {num === 2 && (
            <iframe
              width="800"
              height="600"
              title="bar-chart"
              src="https://datastudio.google.com/embed/reporting/02780d41-dced-456e-beb4-acaba59b39e0/page/rQXyC"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
            ></iframe>
          )}
          {num === 3 && (
            <iframe
              width="800"
              height="600"
              title="bar-chart"
              src="https://datastudio.google.com/embed/reporting/eb5084c8-3e41-4de6-929d-99fe821c61a9/page/iRXyC"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
            ></iframe>
          )}
        </Container>
      </Grid>
    </Grid>
  );
}

Visualization.propTypes = {
  window: PropTypes.func,
};

export default Visualization;
