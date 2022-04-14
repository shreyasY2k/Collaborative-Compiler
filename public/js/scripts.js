const socket = io();
socket.on("hello", arg => {
  console.log(arg); // world
});
window.addEventListener("DOMContentLoaded", event => {
  const sidebarToggle = document.body.querySelector("#sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", event => {
      event.preventDefault();
      document.body.classList.toggle("sb-sidenav-toggled");
    });
  }

  document.querySelector("#createFile").addEventListener("click", function () {
    //create input tick and times as the first element in the list group cclass
    var listGroup = document.querySelector(".list-group");
    var listGroupItem = document.createElement("li");
    listGroupItem.id = "fileInputContainer";
    listGroupItem.classList.add("list-group-item");
    listGroupItem.classList.add("d-flex");
    listGroupItem.classList.add("justify-content-between");
    listGroupItem.classList.add("align-items-center");
    listGroupItem.innerHTML = `<input type="text" id="fileName" class="form-control" placeholder="File Name" aria-label="File Name">&nbsp;&nbsp;
        <a onclick="addFile();"><i class="fas fa-check"></i></a>&nbsp;&nbsp;
        <a onclick="cancel()"><i class="fas fa-times"></i></a>
        `;
    listGroup.prepend(listGroupItem);
  });
});
function checkEmpty(fileName) {
  if (fileName == "") {
    var fileNameInput = document.querySelector("#fileName");
    fileNameInput.classList.add("is-invalid");
    fileNameInput.classList.remove("is-valid");
    fileNameInput.placeholder = "Name is required";
    return true;
  }
}
function checkAlreadyExists(fileName) {
  var fileNameExists = false;
  var listGroupItems = document.querySelectorAll(".list-group-item");
  for (var i = 0; i < listGroupItems.length; i++) {
    if (listGroupItems[i].innerText.includes(fileName)) {
      fileNameExists = true;
      break;
    }
  }
  if (fileNameExists) {
    var fileNameInput = document.querySelector("#fileName");
    fileNameInput.classList.add("is-invalid");
    fileNameInput.classList.remove("is-valid");
    fileNameInput.placeholder = "File already exists";
    return true;
  }
}

function addFile() {
  var listGroup = document.querySelector(".list-group");
  var fileName = document.querySelector("#fileName").value;
  if (checkEmpty(fileName) || checkAlreadyExists(fileName)) {
    return;
  }
  //send file name and project name to server
  var projectName = document
    .querySelector("#projectName")
    .innerText.toString()
    .trim();
    socket.emit("addFile", {
        projectName: projectName,
        fileName: fileName,
        fileContent: ""
        });
        var span = document.createElement("span");
        span.setAttribute(
        "class",
        "list-group-item list-group-item-action list-group-item-light p-3"
        );
        span.innerHTML = `<i class="fa fa-file"></i>&nbsp;&nbsp;<a onclick="getFile(this)" class="justify-content-between">${fileName}&nbsp;&nbsp;</a><a><span onclick="editFileName(this)"><i class="fa fa-edit"></i></span></a>&nbsp;&nbsp;<a><span onclick="deleteFile(this)" ><i class="fa fa-trash"></i></span></a></a>`;
        listGroup.appendChild(span);
        document.querySelector("#fileName").value = "";
        document.querySelector("#fileInputContainer").remove();
}
function cancel() {
  document.querySelector("#fileInputContainer").remove();
}

function deleteFile(element) {
  var listGroup = document.querySelector(".list-group");
  var fileName = element.parentElement.parentElement.innerText
    .toString()
    .trim();
  var projectName = document
    .querySelector("#projectName")
    .innerText.toString()
    .trim();

    //send delete file request to socket on server and then remove the file from the list
    socket.emit("deleteFile", {
        projectName: projectName,
        fileName: fileName
    });
    listGroup.removeChild(element.parentElement.parentElement);
}
function editFileName(element) {
  var fileName = element.parentElement.parentElement.innerText
    .toString()
    .trim();
  //create input tick and times as an element next to the file name
  var listGroup = document.querySelector(".list-group");
  var listGroupItem = document.createElement("li");
  listGroupItem.id = "fileInputContainer";
  listGroupItem.classList.add("list-group-item");
  listGroupItem.classList.add("d-flex");
  listGroupItem.classList.add("justify-content-between");
  listGroupItem.classList.add("align-items-center");
  listGroupItem.innerHTML = `<input type="text" id="fileName" class="form-control" placeholder="File Name" aria-label="File Name" value="${fileName}">&nbsp;&nbsp;
    <a onclick="updateFileName(this);"><i class="fas fa-check"></i></a>&nbsp;&nbsp;
    <a onclick="cancel()"><i class="fas fa-times"></i></a>
    `;
  listGroup.insertBefore(
    listGroupItem,
    element.parentElement.parentElement.nextSibling
  );
}
function updateFileName(element) {
  var listGroup = document.querySelector(".list-group");
  var fileName = document.querySelector("#fileName").value;
  //check if the file name is empty or already exists
  if (checkEmpty(fileName) || checkAlreadyExists(fileName)) {
    return;
  }
  var projectName = document
    .querySelector("#projectName")
    .innerText.toString()
    .trim();
    socket.emit("renameFile", {
        projectName: projectName,
        newFileName: fileName,
        oldFileName: element.parentElement.previousElementSibling.innerText.toString().trim(),
    });
    listGroup.removeChild(element.parentElement.previousElementSibling);
    var span = document.createElement("span");
    span.setAttribute(
      "class",
      "list-group-item list-group-item-action list-group-item-light p-3"
    );
    span.innerHTML = `<i class="fa fa-file"></i>&nbsp;&nbsp;<a onclick="getFile(this)" class="justify-content-between">${fileName}&nbsp;&nbsp;</a><a><span onclick="editFileName(this)"><i class="fa fa-edit"></i></span></a>&nbsp;&nbsp;<a><span onclick="deleteFile(this)" ><i class="fa fa-trash"></i></span></a></a>`;
    listGroup.appendChild(span);
    document.querySelector("#fileName").value = "";
    document.querySelector("#fileInputContainer").remove();
}
function getFile(element) {
  var fileName = element.innerText.toString().trim();
  var projectName = document
    .querySelector("#projectName")
    .innerText.toString()
    .trim();

  //send request through socket to get the file content
  socket.emit("getFile", {
    projectName: projectName,
    fileName: fileName
  });

}
var editor;
function removeEditor() {
  if(editor) {
    editor.getModel().dispose();
  }
}
socket.on("fileContent", function(data) {
  console.log(data);
  var fileContent = data.fileContent;
  var fileName = data.fileName;
  var projectName = data.projectName;
  removeEditor()
  editor = monaco.editor.create(document.getElementById("editor"), {
  value: fileContent,
  language: "javascript",
  theme: "vs-dark"
});
editor.onDidChangeModelContent(event => {
  sendFileContent();
});
})

//on every key press in editor, send the content to the server with the file name and project name
function sendFileContent() {
    var editor = monaco.editor.getModels()[0];
    var fileName = "c.py"
    var projectName = document
        .querySelector("#projectName")
        .innerText.toString()
        .trim();
    var fileContent = editor.getValue();
    socket.emit("updateFile", {
        projectName: projectName,
        fileName: fileName,
        fileContent: fileContent
    });
}



//listen for onDidChangeContent event and send the content to the server
// monaco.editor.onDidChangeModelContent(sendFileContent);



