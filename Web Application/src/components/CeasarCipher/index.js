import { useContext, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Form, FormGroup, Input, Button, Alert } from "reactstrap";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../providers/AuthProvider";
import AuthWrapper from "../AuthWrapper";
import {
  CEASAR_CIPHER_URL,
  AUTH_LAMBDA_URL,
  cookieMeta,
} from "../../utility/constants";

const CeasarCipher = ({ plainText }) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cipherText, setCipherText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCipherChange = ({ target: { value } }) => {
    setCipherText(value);
  };

  const handleCeaserCipherClick = async (e) => {
    e.preventDefault();
    if (!cipherText) {
      return setErrorMessage("Please provide cipher text.");
    }
    setErrorMessage("");

    try {
      const res = await axios.post(CEASAR_CIPHER_URL, {
        plainText,
        cipherText: cipherText.toUpperCase(),
        userId: currentUser.userId,
      });
      if (res.status === 200) {
        axios.post(AUTH_LAMBDA_URL, {
          type: "loginSuccess",
          userId: currentUser.userId,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          timestamp: new Date().toISOString(),
        });
        Cookies.set("accessToken", currentUser.accessToken, cookieMeta);
        Cookies.set("idToken", currentUser.idToken, cookieMeta);
        Cookies.set("refreshToken", currentUser.refreshToken, cookieMeta);
        navigate("/rooms", { replace: true });
      }
    } catch (err) {
      setCipherText("");
      setErrorMessage(
        "Authentication failed, please try again and provide correct cipher text."
      );
    }
  };

  return (
    <AuthWrapper title="Ceasar Cipher">
      <Form className="auth-form" onSubmit={handleCeaserCipherClick}>
        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
        <div
          className="my-3"
          dangerouslySetInnerHTML={{
            __html: `Please encrypt the following plain text <b>${plainText}</b> with Ceasar Cipher with your Ceasar key`,
          }}
        ></div>
        <FormGroup>
          <Input
            id="cipherText"
            name="cipherText"
            type="text"
            placeholder="Cipher text"
            value={cipherText}
            onChange={handleCipherChange}
          />
        </FormGroup>
        <Button color="dark" type="submit" className="auth-button">
          Verify
        </Button>
      </Form>
    </AuthWrapper>
  );
};

export default CeasarCipher;
