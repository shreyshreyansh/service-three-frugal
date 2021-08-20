const deviceData = require("../database/model/connect");
const req = require("../functions/request");
const authorization = ["adminClient", "adminFlip"];
module.exports = (channel, msg) => req(channel, msg, getuserDevices);

const getuserDevices = (channel, msg, jsondata) => {
  const content = JSON.parse(msg.content.toString());
  // check the authority of the user
  if (
    authorization.includes(jsondata.role) ||
    jsondata.userid === content.userid
  ) {
    // find the device in the database
    var role = jsondata.role === "adminClient" ? "userClient" : "userFlip";
    if (jsondata.userid === content.userid) {
      role = jsondata.role;
    }
    deviceData.find(
      { userID: content.userid, role: role },
      function (err, result) {
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
      }
    );
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
