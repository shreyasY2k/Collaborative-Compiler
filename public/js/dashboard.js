document.getElementById("openProject").addEventListener("click", function() {
  //create a socket connection
  const socket = io();


  socket.on("connect", () => {
   console.log(socket.id);

    socket.emit("whoami", username => {
      console.log(username);
    });
  });
})