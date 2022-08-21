import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import React from 'react';
import { AuthProvider } from "./providers/AuthProvider";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const root = document.getElementById("root");
ReactDOM.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
  root
);
