var express = require("express");
var cors = require("cors");
const puppeteer = require("puppeteer");
var app = express();
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
        res.status(200).json(`data:image/png;base64, ${screenshot}`);
      } else {
        res.status(500).json("Unable to take screenshot");
      }
    })
    .catch(err => {
      res.status(500).json("Image not found!");
    });
});

const takeScreenshot = async url => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 720 });
  await page.goto(url);
  try {
    const screenshot = await page.screenshot({
      omitBackground: true,
      encoding: "base64",
      type: "jpeg",
      quality: 60
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
