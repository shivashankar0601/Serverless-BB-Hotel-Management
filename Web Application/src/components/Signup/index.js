import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { Link } from "react-router-dom";
import { Form, FormGroup, Input, Button, Row, Col, Alert } from "reactstrap";

import AuthWrapper from "../AuthWrapper";
import { AuthContext } from "../../providers/AuthProvider";
import { AUTH_LAMBDA_URL, securityQuestions } from "../../utility/constants";
import { generateCeasarCipherKey } from "../../utility/common";

const Signup = () => {
  const { getUserPool } = useContext(AuthContext);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  useEffect(() => {
    return () => {
      setSuccessMessage("");
    };
  }, []);

  // save user's security question answer
  const postSecurityQnA = async (data) => {
    return await new Promise(async (resolve, reject) => {
      try {
        const res = await axios.post(AUTH_LAMBDA_URL, data);
        resolve(res);
      } catch (err) {
        console.log("postSecurityQnA: ", err);
        reject(err);
      }
    });
  };

  const handleChange = ({ target: { name, value } }) => {
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupClick = async (e) => {
    e.preventDefault();
    if (!firstName) {
      return setErrorMessage("First name is required.");
    }
    if (!lastName) {
      return setErrorMessage("Last name is required.");
    }
    if (!email) {
      return setErrorMessage("Email address is required.");
    }
    if (!password) {
      return setErrorMessage("Password is required.");
    }
    if (!securityQuestion) {
      return setErrorMessage("Security question is required.");
    }
    if (!securityAnswer) {
      return setErrorMessage("Security answer is required.");
    }
    setErrorMessage("");

    const userId = `${firstName}_${lastName}_${new Date().valueOf()}`;
    const ceasarKey = generateCeasarCipherKey();

    const attributeList = [
      new CognitoUserAttribute({
        Name: "custom:userId",
        Value: userId,
      }),
      new CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),
      new CognitoUserAttribute({
        Name: "name",
        Value: firstName,
      }),
      new CognitoUserAttribute({
        Name: "family_name",
        Value: lastName,
      }),
    ];

    const UserPool = getUserPool();
    UserPool.signUp(
      email,
      password,
      attributeList,
      null,
      async (err, result) => {
        if (err) {
          return setErrorMessage(err.message || JSON.stringify(err));
        }
        const cognitoUser = result.user;
        console.log("user name is " + cognitoUser.getUsername());

        try {
          const res = await postSecurityQnA({
            type: "save",
            userId,
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase(),
            ceasarKey,
          });
          if (res.data.statusCode === 201) {
            setSuccessMessage(
              `<div>Your <b>Ceasar Cipher Key</b> for future multi-factor authentication is <b>${ceasarKey}</b>. 
             Please make sure you do not forget it.</div>`
            );
          } else {
            setErrorMessage(
              "Something went wrong, please try again after sometime."
            );
          }
        } catch (err) {
          setErrorMessage(err.message);
        }
      }
    );
  };

  const {
    firstName,
    lastName,
    email,
    password,
    securityQuestion,
    securityAnswer,
  } = userDetails;

  return (
    <AuthWrapper title="Sign up">
      {!!successMessage ? (
        <>
          <h5 className="my-2"></h5>
          <Alert color="success" className="mb-2">
            Success! Your registration has been completed successfully.
            <div
              className="mt-2"
              dangerouslySetInnerHTML={{ __html: successMessage }}
            ></div>
          </Alert>
          <div className="mb-2">
            We have sent you a mail for confirmation of your account, please
            click on the link in the mail to confirm your account.
          </div>
          <div className="mb-2">
            If you have already confirmed your account, please{" "}
            {<Link to="/login">login</Link>} to your account!
          </div>
        </>
      ) : (
        <Form className="auth-form" onSubmit={handleSignupClick}>
          {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
          <Row>
            <Col md={6}>
              <FormGroup>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  type="text"
                  value={firstName}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  type="text"
                  value={lastName}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Input
              id="email"
              name="email"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="password"
              name="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="securityQuestion"
              name="securityQuestion"
              placeholder="Password"
              type="select"
              value={securityQuestion}
              onChange={handleChange}
            >
              <option value="">Select security question</option>
              {securityQuestions.map((que, i) => (
                <option key={i} value={que}>
                  {que}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Input
              id="securityAnswer"
              name="securityAnswer"
              placeholder="Security answer"
              type="password"
              value={securityAnswer}
              onChange={handleChange}
            />
          </FormGroup>
          <Button color="dark" type="submit" className="auth-button">
            Sign up
          </Button>
          <div className="auth-link-wrapper">
            <span></span>
            <Link to="/login">Already have an account? Sign in</Link>
          </div>
        </Form>
      )}
    </AuthWrapper>
  );
};

export default Signup;
