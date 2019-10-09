var express = require("express");
var cors = require("cors");
const puppeteer = require("puppeteer");
var app = express();
var randomUseragent = require('random-useragent');
app.use(cors());

app.get("/screenshot", (req, res) => {
  const query = req.query;
  const domain = query.domain;
  takeScreenshot(domain)
    .then(screenshot => {
      if (
        screenshot.match(
          "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$"
        )
      ) {
        var img = new Buffer(screenshot, 'base64');
        // res.status(200).json(`data:image/png;base64, ${screenshot}`);
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': img.length
        });
        res.end(img); 
      } else {
        res.status(500).json("Unable to take screenshot");
      }
    })
    .catch(err => {
      res.status(500).json("Image not found!");
    });
});

const takeScreenshot = async url => {
  //heroku deployment fix
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage({ timeout: 0 });
  await page.setViewport({ width: 1080, height: 720 });
  await page.setUserAgent(randomUseragent.getRandom())
  await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
  try {
    const screenshot = await page.screenshot({
      omitBackground: true,
      encoding: "base64",
      type: "png"
    });
    await browser.close();
    return screenshot;
  } catch (error) {
    return error;
  }
};

const port = parseInt(process.env.PORT, 10) || 8080;

app.listen(port, function() {
  console.log("Started on PORT 8080");
});
