const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["adminClient", "adminFlip"];
module.exports = (channel, msg) => req(channel, msg, getalldevices);

const getalldevices = (channel, msg, jsondata) => {
  console.log("test", jsondata);
  if (authorization.includes(jsondata.role)) {
    // find all the device in the database
    var role = jsondata.role === "adminClient" ? "userClient" : "userFlip";
    deviceData.find({ role: role }, function (err, doc) {
      if (err) {
        const r = { status: err };
        // send the result of devices to the queue
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(r)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      } else {
        const r = { count: Object.keys(doc).length, results: doc };
        // send the result to the queue
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(r)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      }
    });
  } else {
    // send the result to the queue
    const r = { error: "admin access required" };
    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(r)),
      {
        correlationId: msg.properties.correlationId,
      }
    );
    channel.ack(msg);
  }
};
