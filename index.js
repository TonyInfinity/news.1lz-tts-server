require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
var CronJob = require("cron").CronJob;
const app = express();

const feedData = [];
const resData = [];
var text = "";
var audio = "";

const callTTS = async () => {
  const feedURL =
    `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fvietnamnet.vn%2Frss%2Ftin-moi-nhat.rss&api_key=${process.env.FEED_API_KEY}&count=25`;
  await axios
    .get(feedURL)
    .then((res) => feedData.push(res.data))
    .catch((error) => console.log(error));

  let a = 1;
  for (let i = 0; i < 20; i++) {
    text =
      text +
      `Ở bản tin thứ ${a} ` +
      feedData[0].items[i].title +
      " " +
      feedData[0].items[i].description +
      " ";
    a++;
  }

  const options = {
    method: "post",
    url: "https://api.fpt.ai/hmi/tts/v5",
    headers: {
      "api-key": process.env.TTS_API_KEY,
      speed: "-0.5",
      voice: "banmai",
    },
    data: text,
  };
  await axios(options)
    .then((res) => resData.push(res.data))
    .catch((error) => console.log(error));
};

var job = new CronJob(
  "5 5 * * *",
  () => {
    callTTS()
      .then(() => (audio = resData[0].async))
      .then((error) => console.log(error));
    console.log("CRON job ran successfully");
  },
  null,
  false,
  "Asia/Ho_Chi_Minh"
);

// app.get("/api/tts", (req, res) => {
//   callTTS()
//     .then(() => (audio = resData[0].async))
//     .then((error) => console.log(error));
//   res.status(200);
// });

app.get("/api/tts", (req, res) => {
  res.redirect(audio);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.listen(process.env.PORT || 8000, () => job.start());
