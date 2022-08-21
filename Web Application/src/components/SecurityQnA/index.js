import axios from "axios";
import { useContext, useState } from "react";
import { Form, FormGroup, Input, Button, Alert } from "reactstrap";

import { AuthContext } from "../../providers/AuthProvider";
import { AUTH_LAMBDA_URL } from "../../utility/constants";

import AuthWrapper from "../AuthWrapper";

const SecurityQnA = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [userAnswer, setUserAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAnswerChange = ({ target: { value } }) => {
    setUserAnswer(value);
  };

  const handleSecurityQnAClick = async (e) => {
    e.preventDefault();
    if (!userAnswer) {
      return setErrorMessage("Please provide security answer.");
    }
    setErrorMessage("");

    // verifying security question answer
    try {
      const res = await axios.post(AUTH_LAMBDA_URL, {
        type: "verify",
        userId: currentUser.userId,
        securityAnswer: userAnswer.toLowerCase(),
      });
      if (res.data.statusCode === 200) {
        setCurrentUser((prev) => ({ ...prev, userQnAVerified: true }));
      } else {
        throw new Error();
      }
    } catch (err) {
      setUserAnswer("");
      setErrorMessage(
        "Authentication failed, please provide correct security answer."
      );
    }
  };

  const { question } = currentUser;

  return (
    <AuthWrapper title="Security Question and Answer">
      <Form className="auth-form" onSubmit={handleSecurityQnAClick}>
        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
        <div className="my-2">
          <b>{question}</b>
        </div>
        <FormGroup>
          <Input
            id="answer"
            name="answer"
            type="password"
            placeholder="Your security answer"
            value={userAnswer}
            onChange={handleAnswerChange}
          />
        </FormGroup>
        <Button color="dark" type="submit" className="auth-button">
          Verify
        </Button>
      </Form>
    </AuthWrapper>
  );
};

export default SecurityQnA;
