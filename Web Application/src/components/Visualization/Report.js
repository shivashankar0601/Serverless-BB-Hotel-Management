import { useState } from "react";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { Container, Grid } from "@mui/material";

function Report() {
  const [num, setNum] = useState(0);

  const graphHandler = (index) => {
    setNum(index);
  };

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
          margin: "auto",
        }}
      >
        <Typography variant="h4" noWrap component="div">
          Report
        </Typography>
      </Grid>
      <Grid item xs={3}>
        <List>
          {[
            "User Login Statistics",
            "Feedback analysis",
            "Income",
            "Booking number per day"
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
              width="1000"
              height="1000"
              title="bar-chart"
              src="https://datastudio.google.com/embed/reporting/cc98aeac-d07a-4f39-8e0b-6f352e59fe9e/page/YPXyC"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
            ></iframe>
          )}
          {num === 1 && (
            <iframe
              width="1000"
              height="1000"
              title="bar-chart"
              src="https://datastudio.google.com/embed/reporting/5dbed989-7fcf-4e66-819f-ae2da4eaef6a/page/df1xC"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
            ></iframe>
          )}
          {num === 2 && (
            <iframe
              width="1000"
              height="1000"
              title="bar-chart"
              src="https://datastudio.google.com/embed/reporting/eb5084c8-3e41-4de6-929d-99fe821c61a9/page/iRXyC"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
            ></iframe>
          )}
          {num === 3 && (
            <iframe
              width="1000"
              height="1000"
              title="bar-chart"
              src="https://datastudio.google.com/embed/reporting/26e70154-7af7-4e17-8a0d-e8447fae3ca1/page/JB1xC"
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

Report.propTypes = {
  window: PropTypes.func,
};

export default Report;
