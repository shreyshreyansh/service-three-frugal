const deviceData = require("../database/model/connect");
const req = require("../functions/request");
module.exports = (channel, msg) => req(channel, msg, deleteDevice);

const deleteDevice = (channel, msg, jsondata) => {
  const content = JSON.parse(msg.content.toString());
  const userID = jsondata.userid;
  deviceData.findOneAndDelete(
    { userID: userID, deviceID: content.deviceID },
    function (err, result) {
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
        var r = null;
        if (result === null)
          r = {
            status: "unsuccessful deletion",
            result: "device not found or device access required",
          };
        else r = { satus: "deletion successful", result: result };
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(r)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      }
    }
  );
};
