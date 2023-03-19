const express = require("express");
const http = require("http");
const mqtt = require("mqtt");
const socketio = require("socket.io");
const bodyParser = require("body-parser");
require("dotenv").config();

const MQTT_CLIENT = process.env.MQTT_CLIENT;
const MQTT_TOPIC = process.env.MQTT_TOPIC;

// var con = require("./connection");
// const { connect, query } = require("./connection");
// const { redirect } = require("express/lib/response");
// const { setCharset } = require("express/lib/utils");

// Set up the MQTT client
const mqttClient = mqtt.connect(MQTT_CLIENT);

// Set up the web server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Configure body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// View engine setup
app.use(express.static("public"));
app.set("view engine", "ejs");

// Serve the HTML page
app.get("/", (req, res) => {
  res.render("index", { client: MQTT_CLIENT, topic: MQTT_TOPIC });
});

// Listen for MQTT messages
mqttClient.on("connect", function () {
  mqttClient.subscribe(MQTT_TOPIC);
});

// mqttClient.on("message", function (topic, message) {
//   let str = topic;
//   let UserName = str.split("/")[1];
//   let macAdd = str.split("/")[2];

//   // Get the current date and time formatted as a string
//   const date = new Date().toLocaleString();

//   console.log("UserName: " + UserName);
//   console.log("macAdd: " + macAdd);

//   // Emit the received message to all connected clients as an object
//   io.emit("message", {
//     date: date,
//     topic: topic.toString(),
//     payload: message.toString(),
//   });
//   console.log(
//     "Received message on topic:",
//     topic,
//     "with payload:",
//     message.toString()
//   );
// });

mqttClient.on("message", function (topic, message) {
  let str = topic;
  let UserName = str.split("/")[1];
  let macAdd = str.split("/")[2];

  // Get the current date and time formatted as a string
  const date = new Date().toLocaleString();

  console.log("UserName: " + UserName);
  console.log("macAdd: " + macAdd);

  // Check if the message is "offline"
  if (message.toString().toLowerCase() === "offline") {
    // Emit the received message as "OFFLINE" to all connected clients as an object
    io.emit("message", {
      date: date,
      topic: topic.toString(),
      payload: "OFFLINE",
    });
    console.log("Received message: OFFLINE");
  } else {
    // Emit the received message to all connected clients as an object
    io.emit("message", {
      date: date,
      topic: topic.toString(),
      payload: message.toString(),
    });
    console.log(
      "Received message on topic:",
      topic,
      "with payload:",
      message.toString()
    );
  }
});



app.get("/publish", (req, res) => {
  const username = req.query.username;
  const macaddress = req.query.macaddress;
  const topic = `users/${username}/${macaddress}`;
  const message = "This is the msg";

  if (!topic) {
    return res.status(400).send("No MQTT topic provided");
  }

  mqttClient.publish(topic, message, (err) => {
    if (err) {
      console.error(`Error publishing to ${topic}: ${err}`);
      return res.status(500).send("Error publishing to MQTT topic");
    }
    console.log(`Message "${message}" published to ${topic}`);
    return res.status(200).send("Message published to MQTT topic");
  });
});

//routes for app Php -> Nodejs
//walls

app.post("/insertWalls", (req, res) => {
  const {
    name,
    v1,
    v2,
    v3,
    v4,
    innerWallColourNormal,
    innerWallColourLit,
    outerWallColourNormal,
    outerWallColourLit,
    tileColourNormal,
    tileColourLit,
  } = req.body;
  const sql = `INSERT INTO walls(name, v1, v2, v3, v4, innerWallColourNormal, innerWallColourLit, outerWallColourNormal, outerWallColourLit, tileColourNormal, tileColourLit) 
  VALUES ('${name}', '${v1}', '${v2}', '${v3}', '${v4}', '${innerWallColourNormal}', '${innerWallColourLit}', '${outerWallColourNormal}', '${outerWallColourLit}', '${tileColourNormal}', '${tileColourLit}')`;
  con.query(sql, (err, result) => {
    if (err) {
      console.log("Error inserting data into walls table: ", err);
      return res.status(500).send("Error inserting data into walls table");
    }
    console.log("Data inserted successfully into walls table");
    return res.status(200).send("Data inserted successfully into walls table");
  });
});

app.post("/deleteWalls", (req, res) => {
  const { wlname } = req.body;
  const sql = `DELETE FROM walls WHERE name = '${wlname}'`;
  con.query(sql, (err, result) => {
    if (err) {
      console.log("Error deleting data from walls table: ", err);
      return res.status(500).send("Error deleting data from walls table");
    }
    console.log("Data deleted successfully from walls table");
    return res.status(200).send("Data deleted successfully from walls table");
  });
});

app.get("/getWalls", (req, res) => {
  const sql =
    "SELECT name,v1,v2,v3,v4,innerWallColourNormal,innerWallColourLit,outerWallColourNormal,outerWallColourLit,tileColourNormal,tileColourLit FROM walls";
  con.query(sql, (err, result) => {
    if (err) {
      console.log("Error fetching data from walls table: ", err);
      return res.status(500).send("Error fetching data from walls table");
    }
    console.log("Data fetched successfully from walls table");
    return res.status(200).send({ Items: result });
  });
});

app.post("/updateobject", (req, res) => {
  const { name, v1, v2, v3, v4 } = req.body;
  const sql = `UPDATE objects SET v1='${v1}', v2='${v2}', v3='${v3}', v4='${v4}' WHERE name='${name}'`;
  con.query(sql, (error, results) => {
    if (error) {
      console.error("Error updating object:", error);
      res.status(500).send("Error updating object");
    } else {
      console.log("Object updated successfully");
      res.status(200).send("Object updated successfully");
    }
  });
});

//walls

//object
// Route to delete an object
app.post("/deleteobject", (req, res) => {
  const object_id = req.body.object_id;
  const sql = `DELETE FROM objects WHERE name = '${object_id}'`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Route to add an object
app.post("/addobject", (req, res) => {
  const name = req.body.name;
  const baseType = req.body.baseType;
  const position = req.body.position;
  const rotation = req.body.rotation;
  const roomName = req.body.roomName;
  const sql = `INSERT INTO objects(name, baseType, position, rotation, roomName) VALUES ('${name}', '${baseType}', '${position}', '${rotation}', '${roomName}')`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Route to get all objects
app.get("/getobjects", (req, res) => {
  const sql = `SELECT name, baseType, position, rotation, roomName FROM objects`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Route to update an object
app.post("/updateobject", (req, res) => {
  const name = req.body.name;
  const position = req.body.position;
  const rotation = req.body.rotation;
  const roomName = req.body.roomName;
  const sql = `UPDATE objects SET position='${position}', rotation=${rotation}, roomName='${roomName}' WHERE name ='${name}'`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

//object
//routes for app Php -> Nodejs

// Listen for socket.io connections
io.on("connection", (socket) => {
  console.log("A user has connected to the socket.io server");

  // Listen for messages from clients
  socket.on("message", (data) => {
    console.log("Message received on socket.io server:", data);
  });
});

// Start the web server
const port = 3000 || process.env.PORT;

server.listen(port, function () {
  console.log(`Monitoring Server is up and Running on port:${port}`);
  console.log(`http://localhost:${port}`);
});
