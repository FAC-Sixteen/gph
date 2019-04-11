const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const postData = require("./queries/postData");

const handlerHome = (request, response) => {
  fs.readFile(
    path.join(__dirname, "..", "public", "index.html"),
    (error, file) => {
      if (error) {
        console.log(error);
        response.writeHead(500, { "Content-Type": "text/html" });
        response.end("<h1>500: server error</h1>");
      } else {
        postData.countFrees((err, res) => {
          if (err) console.log(err);
          const emptyRooms = 10 - parseInt(res.rows[0].sum);
          console.log("empty rooms: ", emptyRooms);
          response.writeHead(200, {
            "Content-Type": "text/html"
          });
          response.end(file);
        });
      }
    }
  );
};

const handlerPublic = (request, response) => {
  const extension = request.url.split(".")[1];
  const extensionType = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    jpg: "image/jpeg",
    png: "image/png",
    ico: "image/x-icon",
    TTF: "font/ttf"
  };

  fs.readFile(path.join(__dirname, "..", request.url), (error, file) => {
    if (error) {
      console.log(error);
      response.writeHead(500, { "Content-Type": "text/html" });
      response.end("<h1>500: server error</h1>");
    } else {
      response.writeHead(200, {
        "Content-Type": extensionType[extension]
      });
      response.end(file);
    }
  });
};

const handleCheckIn = (request, response) => {
  let data = "";
  request.on("data", chunk => {
    data += chunk;
  });
  request.on("end", () => {
    const name = querystring.parse(data).name;
    const colour = querystring.parse(data).colour;
    const gender = querystring.parse(data).gender;
    postData.checkIn(name, colour, gender, (err, res) => {
      if (err) console.log(err);
      response.writeHead(302, { Location: "/" });
      response.end();
    });
  });
};

module.exports = {
  handlerHome,
  handlerPublic,
  handleCheckIn
};
