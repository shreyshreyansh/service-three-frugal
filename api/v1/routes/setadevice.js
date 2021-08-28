const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["adminClient", "userFlip"];
module.exports = (channel, msg) => req(channel, msg, createDevice);

const nextRechargeDate = (num) => {
  return new Date(new Date().getTime() + num * 24 * 60 * 60 * 1000);
};

const createDevice = (channel, msg, jsondata) => {
  // get device details from the queue
  const content = JSON.parse(msg.content.toString());
  if (authorization.includes(jsondata.role)) {
    const deviceID = content.deviceID;
    const deviceType = content.deviceType;
    const userID = content.userid;
    const userName = content.username;
    const role = "userClient";
    const nextDate = nextRechargeDate(content.days);
    var device;
    if (jsondata.role === "userFlip") {
      device = {
        deviceID: deviceID,
        userID: jsondata.userid,
        username: jsondata.username,
        role: jsondata.role,
        deviceType: deviceType,
        nextRecharge: nextDate,
        datalog: [],
      };
    } else {
      device = {
        deviceID: deviceID,
        userID: userID,
        username: userName,
        role: role,
        deviceType: deviceType,
        nextRecharge: nextDate,
        datalog: [],
      };
    }
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
  }
};
