const cors = require("cors")();
const aws = require("aws-sdk");

const TableName = "users";

exports.ceasarCipher = (req, res) => {
  cors(req, res, async () => {
    const reqBody = req.body;

    // Set the region
    aws.config.update({ region: "us-east-1" });

    // Create the DynamoDB service object
    const ddb = new aws.DynamoDB({
      apiVersion: "2012-08-10",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        sessionToken: process.env.SESSION_TOKEN,
      },
    });

    const getDbItem = async (getParams) => {
      return await new Promise((resolve, reject) => {
        ddb.getItem(getParams, function (err, data) {
          if (err) {
            console.log("Get Item DynamoDB Error", err);
            reject(err);
          } else {
            console.log("Get Item DynamoDB Success", data.Item);
            resolve(data.Item);
          }
        });
      });
    };

    /**
     * https://learnersbucket.com/examples/algorithms/caesar-cipher-in-javascript/
     */
    const generateCeasarCipherText = (plainText, key) => {
      let cipherText = "";
      for (let i = 0; i < plainText.length; i++) {
        cipherText += String.fromCharCode(
          ((plainText.charCodeAt(i) + key - 65) % 26) + 65
        );
      }
      return cipherText;
    };

    const getParams = {
      TableName,
      Key: {
        userId: {
          S: reqBody.userId,
        },
      },
    };

    try {
      const Item = await getDbItem(getParams);
      const cipherText = generateCeasarCipherText(
        reqBody.plainText,
        parseInt(Item.ceasarKey.N)
      );

      if (cipherText === reqBody.cipherText) {
        res.status(200).send("User is authenticated successfully.");
      } else {
        res
          .status(401)
          .send(
            "Authentication failed, please try again and provide correct cipher text."
          );
      }
    } catch (err) {
      res.status(500).send("Something went wrong, please try again.");
    }
  });
};
