require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const PORT = process.env.port || 8000;

const feedData = [];
const resData = [];
var text = "";

const callTTS = async () => {
  const feedURL =
    "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fvietnamnet.vn%2Frss%2Ftin-moi-nhat.rss&api_key=stmncoubssixfmgyh1rut6onbopfgyac8b5ex4ea&count=25";
  await axios
    .get(feedURL)
    .then((res) => feedData.push(res.data))
    .catch((error) => console.log(error));
  let a = 1;
  // for (let i = 0; i < 25; i++) {
  //   text =
  //     text +
  //     `Ở bản tin thứ ${a}, ` +
  //     feedData[0].items[i].title +
  //     ". " +
  //     feedData[0].items[i].description +
  //     " ";
  //   a++;
  // }
  for (let i = 0; i < 20; i++) {
    text =
      text +
      `Ở bản tin thứ ${a} ` +
      feedData[0].items[i].title + " " +
      feedData[0].items[i].description + " ";
    a++;
  }

  const options = {
    method: "post",
    url: "https://api.fpt.ai/hmi/tts/v5",
    headers: {
      "api-key": process.env.API_KEY,
      "speed": "0",
      "voice": "banmai",
    },
    data: text,
  };
  await axios(options)
    .then((res) => resData.push(res.data))
    .catch((error) => console.log(error));
};

app.get("/api/tts", (req, res) => {
  callTTS()
    .then(() => {
      res.json(resData[0].async);
    })
    .then((error) => console.log(error));
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(PORT);
