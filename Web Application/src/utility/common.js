import Cookies from "js-cookie";

export const isLoggedIn = () => {
  return (
    !!Cookies.get("accessToken") &&
    !!Cookies.get("idToken") &&
    !!Cookies.get("refreshToken")
  );
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
export const generateCeasarCipherKey = (min = 1, max = 26) => {
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * https://www.w3resource.com/javascript-exercises/javascript-function-exercise-20.php
 */
export const generateRandomLengthString = (len = 4) => {
  let text = "";
  const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < len; i++) {
    const randomIndex = Math.floor(Math.random() * charSet.length);
    text += charSet.charAt(randomIndex);
  }
  return text;
};
