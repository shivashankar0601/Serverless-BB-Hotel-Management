import FilterDramaRoundedIcon from "@mui/icons-material/FilterDramaRounded";
import { Avatar } from "@mui/material";

import "./auth-wrapper.css";

const AuthWrapper = ({ title, children }) => {
  return (
    <main className="auth-wrapper">
      <div className="auth-box">
        <Avatar sx={{ m: 1, bgcolor: "common.black", width: 44, height: 44 }}>
          <FilterDramaRoundedIcon sx={{ width: 34, height: 34 }} />
        </Avatar>
        <h3 className="auth-title">{title}</h3>
        {children}
      </div>
    </main>
  );
};

export default AuthWrapper;
