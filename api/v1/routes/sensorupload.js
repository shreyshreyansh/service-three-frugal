#!/usr/bin/env node
const deviceData = require("../database/model/connect");

module.exports = (channel, msg1) => {
  msg = JSON.parse(msg1.content.toString());
  var day = new Date();
  var stamp = day.toISOString();
  const type1 = msg.Type1;
  const value1 = msg.Value1;
  const type2 = msg.Type2;
  const value2 = msg.Value2;
  const type3 = msg.Type3;
  const value3 = msg.Value3;
  const type4 = msg.Type4;
  const value4 = msg.Value4;
  var tes = {
    Timestamp: stamp,
    Type1: type1,
    Value1: value1,
    Type2: type2,
    Value2: value2,
    Type3: type3,
    Value3: value3,
    Type4: type4,
    Value4: value4,
  };
  var deviceID = msg.deviceID;
  deviceData.findOne({ deviceID: deviceID }, (err, page) => {
    if (err) console.log({ status: err });
    else {
      if (page) {
        var log = page.datalog;
        log.push(tes);
        deviceData.updateOne(
          { deviceID: deviceID },
          { $set: { datalog: log } },
          function (err, doc) {
            if (err) {
              console.log({ status: err });
              channel.ack(msg1);
            } else {
              console.log({ status: "sensor data uploaded" });
              channel.ack(msg1);
            }
          }
        );
      } else {
        console.log({ status: "Device Id not found" });
        channel.ack(msg1);
      }
    }
  });
};
