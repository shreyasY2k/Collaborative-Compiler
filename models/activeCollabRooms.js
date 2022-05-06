const mongoose = require("mongoose");
const activeCollabRoomsSchema = new mongoose.Schema({ collabRoomID: String });
const activeCollabRooms = mongoose.model(
  "activeCollabRooms",
  activeCollabRoomsSchema
);
module.exports = activeCollabRooms;
