const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["admin"];
module.exports = (channel, msg) => req(channel, msg, getdevice);

const getdevice = (channel, msg, jsondata) => {
  const content = JSON.parse(msg.content.toString());
  deviceData.findOne({ deviceID: content.deviceID }, (err, page) => {
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
      if (page) {
        if (
          authorization.includes(jsondata.role) ||
          jsondata.userid === page.userID
        ) {
          const r = page;
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(r)),
            {
              correlationId: msg.properties.correlationId,
            }
          );
          channel.ack(msg);
        } else {
          const r = { error: "admin access required or device not registered" };
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(r)),
            {
              correlationId: msg.properties.correlationId,
            }
          );
          channel.ack(msg);
        }
      } else {
        const r = { error: "device not found" };
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
  });
};
