const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
require('dotenv').config();

const MQTT_CLIENT = process.env.MQTT_CLIENT
const MQTT_TOPIC = process.env.MQTT_TOPIC

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
app.set('view engine', 'ejs');

// Serve the HTML page
app.get('/', (req, res) => {
  res.render('index',{client: MQTT_CLIENT, topic:MQTT_TOPIC});
});

// Listen for MQTT messages
// mqttClient.on('connect', function () {
//   mqttClient.subscribe(MQTT_TOPIC);
// });

  


mqttClient.on('message', function (topic, message) {
  let str = topic;
  let UserName = str.split("/")[1];
  let macAdd = str.split("/")[2];
  console.log('UserName: ' + UserName);
  console.log('macAdd: ' + macAdd);

  // Emit the received message to all connected clients as an object
  io.emit('message', {topic: topic.toString(), payload: message.toString()});
  console.log('Received message on topic:', topic, 'with payload:', message.toString() );

  //add db link and push to db
});


app.post('/publish', (req, res) => {
  const username = req.query.username;
  const macaddress = req.query.macaddress;
  const topic = `users/${username}/${macaddress}`;
  const message = "This is the msg";

  if (!topic) {
    return res.status(400).send('No MQTT topic provided');
  }


  mqttClient.publish(topic, message, (err) => {
    if (err) {
      console.error(`Error publishing to ${topic}: ${err}`);
      return res.status(500).send('Error publishing to MQTT topic');
    }
    console.log(`Message "${message}" published to ${topic}`);
    return res.status(200).send('Message published to MQTT topic');
  });

  
});

// Listen for socket.io connections
io.on('connection', (socket) => {
  console.log('A user has connected to the socket.io server');

  // Listen for messages from clients
  socket.on('message', (data) => {
    console.log('Message received on socket.io server:', data);
  });
});

// Start the web server
const port = 3000

server.listen(port, function () {
    console.log(`Monitoring Server is up and Running on port:${port}`);
    console.log(`http://localhost:${port}`)

});
