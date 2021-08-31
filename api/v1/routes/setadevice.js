const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["adminClient", "userFlip"];
module.exports = (channel, msg) => req(channel, msg, createDevice);

const createDevice = (channel, msg, jsondata) => {
  // get device details from the queue
  const content = JSON.parse(msg.content.toString());
  if (authorization.includes(jsondata.role)) {
    const deviceID = content.deviceID;
    var device = {
      deviceID: deviceID,
      datalog: [],
    };
    // create the device
    deviceData.create(device, function (err, result) {
      if (err) {
        const r = { status: err };
        // send the result to the queue
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(r)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      } else {
        // send the result to the queue
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(result)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      }
    });
  } else {
    const r = { error: "Not authorized" };
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
