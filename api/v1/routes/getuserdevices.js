const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["admin"];
module.exports = (channel, msg) => req(channel, msg, getuserDevices);

const getuserDevices = (channel, msg, jsondata) => {
  const content = JSON.parse(msg.content.toString());
  if (
    authorization.includes(jsondata.role) ||
    jsondata.userid === content.userid
  ) {
    deviceData.find({ userID: content.userid }, function (err, result) {
      if (err) {
        const r = { status: err };
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
