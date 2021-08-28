//package
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var amqp = require("amqplib/callback_api");

var db_server = process.env.DB_ENV || "primary";

//mongoose
mongoose.connect("mongodb://127.0.0.1:27017/FrugalDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on("connected", function (ref) {
  console.log("Connected to " + db_server + " DB!");

  const app = express();
  app.use(bodyParser.urlencoded({ extended: "false" }));
  app.use(bodyParser.json());
  app.use(express.static("public"));

  //functions
  const setadevice = require("./api/v1/routes/setadevice");
  const getalldevices = require("./api/v1/routes/getalldevices");
  const getuserdevices = require("./api/v1/routes/getuserdevices");
  const getdevice = require("./api/v1/routes/getdevice");
  const deleteDevice = require("./api/v1/routes/deletedevice");
  const sensorupload = require("./api/v1/routes/sensorupload");
  const rechargeDevice = require("./api/v1/routes/recharge");

  // connection to the rabbitmq
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    // creating channel for device queue
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = "device_queue";

      channel.assertQueue(queue, {
        durable: false,
      });
      channel.prefetch(1);
      console.log(" [x] Awaiting RPC requests");
      channel.consume(queue, function reply(msg) {
        console.log(" [x] Received %s", JSON.parse(msg.content.toString()));
        msg1 = JSON.parse(msg.content.toString());
        // serving request though service 3 functions
        const route = msg1.route;
        switch (route) {
          case "setadevice":
            setadevice(channel, msg);
            break;
          case "getalldevices":
            getalldevices(channel, msg);
            break;
          case "getuserdevices":
            getuserdevices(channel, msg);
            break;
          case "getdevice":
            getdevice(channel, msg);
            break;
          case "deletedevice":
            deleteDevice(channel, msg);
            break;
          case "sensorupload":
            sensorupload(channel, msg);
            break;
          case "recharge":
            rechargeDevice(channel, msg);
            break;
          default:
            console.log("Wrong Choice");
        }
      });
    });
  });

  port = process.env.port || 3000;
  ip = process.env.ip;

  app.listen(port, ip, function () {
    console.log("listening on port " + port);
  });
});

// If the connection throws an error
mongoose.connection.on("error", function (err) {
  console.error("Failed to connect to DB " + db_server + " on startup ", err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
  console.log(
    "Mongoose default connection to DB :" + db_server + " disconnected"
  );
});

var gracefulExit = function () {
  mongoose.connection.close(function () {
    console.log(
      "Mongoose default connection with DB :" +
        db_server +
        " is disconnected through app termination"
    );
    process.exit(0);
  });
};

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", gracefulExit).on("SIGTERM", gracefulExit);
