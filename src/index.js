require("dotenv").config();

const axios = require("axios");

const express = require("express"),
  app = express(),
  port = process.env.PORT || 4000;

const DiscordOauth2 = require("discord-oauth2");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

async function IsValidToken(token, resolve, reject) {
  let split = token.split(' ');

  if(split.length === 0) {
    reject("invalid format");
  }

  let platform = split[0];
  let code = split[1];

  platform = platform.toLowerCase();

  switch(platform)
  {
    case "discord":
      {
        let data = await new DiscordOauth2({
          clientId: process.env.CLIENTID,
          clientSecret: process.env.CLIENTSECRET,
          redirectUri: process.env.REDIRECTURI
        }).getUser(code);

        if(data === null || data === undefined) {
          reject("invalid token");
        }

        resolve(data);
      }
      break;

      default:
        reject("invalid request");
        break;
  }
}

app.use("/user/:id", (req, res) => {
  
  let token = req.header("Authorization");

  if (token !== undefined) {
    token = token.replace("Bearer ", "");
  }

  new Promise(async (resolve, reject) => {
    await IsValidToken(token, resolve, reject);
  })
  .catch(reason => {
    res.status(400);
    res.contentType("application/json");
    res.send({
      success: false,
      reason: reason
    })
  })
  .then(data => {
    if(data !== undefined) {
      console.log(`Valid Request: ${new Date()}`);
      if(req.params["id"] === data.id) {
        axios.get(`https://api.skuldbot.uk/user/${req.params["id"]}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.APIKEY}`
          }
        })
        .then(result => {
          res.status(200);
          res.contentType("application/json");
          res.send({
            success: true,
            data: result.data.data
          })
        })
      } else {
        res.status(400);
        res.contentType("application/json");
        res.send({
          success:false,
          reason: "invalid request"
        });
      }
    } else {
      console.log(`Invalid Request: ${new Date()}`);
    }
  })
});

app.listen(port, () =>
  console.log(`Skuld.Dashboard.Gateway listening at http://localhost:${port}`)
);
