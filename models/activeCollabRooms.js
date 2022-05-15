const mongoose = require("mongoose");
const activeCollabRoomsSchema = new mongoose.Schema({
    collabRoomID: String,
    restrictSharing: Boolean,
});
const activeCollabRooms = mongoose.model(
    "activeCollabRooms",
    activeCollabRoomsSchema
);
module.exports = activeCollabRooms;