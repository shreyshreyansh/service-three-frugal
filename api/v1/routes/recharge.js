const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["adminClient"];
module.exports = (channel, msg) => req(channel, msg, recharge);

const nextRechargeDate = (num, date) => {
  var currTime = new Date().getTime();
  var prevTime = date.getTime();
  var time = Math.max(currTime, prevTime);
  return new Date(time + num * 24 * 60 * 60 * 1000);
};

const recharge = (channel, msg, jsondata) => {
  const content = JSON.parse(msg.content.toString());
  // find the device in the database
  if (
    authorization.includes(jsondata.role) ||
    (jsondata.role == "userClient" && jsondata.userid == content.userid)
  ) {
    deviceData.findOne({ deviceID: content.deviceID }, (err, page) => {
      if (err) {
        const r = { status: err };
        // send the result of device to the queue
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
            deviceData.findOneAndUpdate(
              { deviceID: content.deviceID, userID: content.userid },
              {
                $set: {
                  nextRecharge: nextRechargeDate(
                    content.days,
                    page.nextRecharge
                  ),
                },
              },
              (err, page1) => {
                if (err) {
                  const r = { status: err };
                  // send the result of device to the queue
                  channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(r)),
                    {
                      correlationId: msg.properties.correlationId,
                    }
                  );
                  channel.ack(msg);
                } else {
                  if (page1) {
                    const r = page1;
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
              }
            );
          } else {
            const r = {
              error: "admin access required or device not registered",
            };
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
        } else {
          // send the result to the queue
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
  } else {
    const r = { error: "admin access required or device not registered" };
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
};
