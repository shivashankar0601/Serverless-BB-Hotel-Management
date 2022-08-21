import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

import {
  cookieMeta,
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
} from "../../utility/constants";

const AuthContext = createContext();

const AuthProvider = (props) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const res = await getSession();
      setCurrentUser({
        userId: res["custom:userId"],
        email: res.email,
        firstName: res.name,
        lastName: res.family_name,
        accessToken: res.accessToken.jwtToken,
        idToken: res.idToken.jwtToken,
        refreshToken: res.refreshToken.token,
      });
    } catch (err) {
      console.log("getUserData: ", "user is not logged in.");
    }
  };

  const getUserPool = () => {
    const poolData = {
      UserPoolId: USER_POOL_ID,
      ClientId: USER_POOL_CLIENT_ID,
    };
    const userPool = new CognitoUserPool(poolData);
    return userPool;
  };

  const getSession = async () => {
    return await new Promise((resolve, reject) => {
      const Pool = getUserPool();
      const user = Pool.getCurrentUser();
      if (user) {
        user.getSession(async (err, session) => {
          if (err) {
            reject();
          } else {
            const attributes = await new Promise((resolve, reject) => {
              user.getUserAttributes(function (err, attributes) {
                if (err) {
                  reject(err);
                } else {
                  const results = {};
                  attributes.forEach(
                    ({ Name, Value }) => (results[Name] = Value)
                  );
                  resolve(results);
                }
              });
            });
            resolve({ user, ...session, ...attributes });
          }
        });
      } else {
        reject();
      }
    });
  };

  const getCognitoUser = (Username) => {
    const Pool = getUserPool();
    const user = new CognitoUser({ Username, Pool });
    return user;
  };

  const authenticate = async (Username, Password) => {
    return await new Promise((resolve, reject) => {
      const user = getCognitoUser(Username);

      const authDetails = new AuthenticationDetails({ Username, Password });

      user.authenticateUser(authDetails, {
        onSuccess: (data) => {
          setCurrentUser({
            userId: data.idToken.payload["custom:userId"],
            email: data.idToken.payload.email,
            firstName: data.idToken.payload.name,
            lastName: data.idToken.payload.family_name,
            accessToken: data.accessToken.jwtToken,
            idToken: data.idToken.jwtToken,
            refreshToken: data.refreshToken.token,
          });
          resolve(data);
        },
        onFailure: (err) => {
          console.log("onFailure", err);
          reject(err);
        },
        newPasswordRequired: (data) => {
          resolve(data);
        },
      });
    });
  };

  const logout = () => {
    const Pool = getUserPool();
    const user = Pool.getCurrentUser();
    if (user) {
      removeCookies();
      setCurrentUser(null);
      user.signOut();
    }
  };

  const removeCookies = () => {
    Cookies.remove("accessToken", cookieMeta);
    Cookies.remove("idToken", cookieMeta);
    Cookies.remove("refreshToken", cookieMeta);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authenticate,
        getSession,
        logout,
        removeCookies,
        getCognitoUser,
        getUserPool,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
