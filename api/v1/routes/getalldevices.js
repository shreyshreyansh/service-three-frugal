const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["admin"];
module.exports = (channel, msg) => req(channel, msg, getalldevices);

const getalldevices = (channel, msg, jsondata) => {
  if (authorization.includes(jsondata.role)) {
    deviceData.find({}, function (err, doc) {
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
        const r = { count: Object.keys(doc).length, results: doc };
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
