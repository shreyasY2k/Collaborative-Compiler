const mongoose = require("mongoose");
const userProjectsFilesRoomsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  roomID: String,
  projectPath: String,
  files: [
    {
      fileName: String,
      fileRoom: String
    }
  ]
});
const userProjectsFilesRooms = mongoose.model(
  "userProjectsFilesRooms",
  userProjectsFilesRoomsSchema
);
module.exports = userProjectsFilesRooms;