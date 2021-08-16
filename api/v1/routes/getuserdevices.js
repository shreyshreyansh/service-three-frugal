const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["admin"];
module.exports = (channel, msg) => req(channel, msg, getuserDevices);

const getuserDevices = (channel, msg, jsondata) => {
  const content = JSON.parse(msg.content.toString());
  // check the authority of the user
  if (
    authorization.includes(jsondata.role) ||
    jsondata.userid === content.userid
  ) {
    // find the device in the database
    deviceData.find({ userID: content.userid }, function (err, result) {
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
        const r = { count: Object.keys(result).length, results: result };
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
    const r = {
      error: "admin access required or given device id not registered",
    };
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
