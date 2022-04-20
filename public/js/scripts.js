const socket = io( {
  transports: ["websocket"],
  upgrade: false
});

socket.on("disconnect", function () {
  socket.off("disconnect");
  socket.off("addFile");
  socket.off("renameFile");
  socket.off("deleteFile");
  socket.off("getFile");
  socket.off("fileContent");
  removeEditor();
});

function addFile() {
  var fileName = document.querySelector("#fileName").value;
  if (!validateFileName(fileName)) {
    document.querySelector("#fileName").classList.remove("is-valid");
    document.querySelector("#fileName").classList.add("is-invalid");
    document.querySelector("#fileName").placeholder = "Enter valid file name";
    return;
  }
  if (checkAlreadyExists(fileName)) {
    document.querySelector("#fileName").classList.remove("is-valid");
    document.querySelector("#fileName").classList.add("is-invalid");
    document.querySelector("#fileName").placeholder = "File already exists";
    return;
  }
  //send file name and project name to server
  var projectName = document
    .querySelector("#projectName")
    .innerText.toString()
    .trim();

  var userid = document.querySelector("#userid").innerText.toString().trim();
  socket.emit("addFile", {
    userid: userid,
    projectName: projectName,
    fileName: fileName,
    fileContent: ""
  });
}

socket.on("addFile", (projectName, fileName) => {
  var listGroup = document.querySelector(".list-group");
  var span = document.createElement("span");
  span.setAttribute(
    "class",
    "list-group-item list-group-item-action list-group-item-light p-3"
  );
  span.innerHTML = `<i class="fa fa-lg fa-file-code"></i>&nbsp;&nbsp;<a onclick="getFile(this)" class="justify-content-between">${fileName}&nbsp;&nbsp;</a><a><span onclick="editFileName(this)"><i class="fa fa-edit"></i></span></a>&nbsp;&nbsp;<a><span onclick="deleteFile(this)" ><i class="fa fa-trash"></i></span></a></a>`;
  listGroup.appendChild(span);
  document.querySelector("#fileName").value = "";
  document.querySelector("#fileInputContainer").remove();
});

function editFileName(element) {
  if (!document.querySelector("#fileName")) {
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
    <a onclick="updateFileName(this);"><i class="fa fa-lg fa-check"></i></a>&nbsp;&nbsp;
    <a onclick="cancel()"><i class="fa fa-lg fa-times"></i></a>
    `;
    listGroup.insertBefore(
      listGroupItem,
      element.parentElement.parentElement.nextSibling
    );
  }
}
function updateFileName(element) {
  var fileName = document.querySelector("#fileName").value;
  //check if the file name is empty or already exists
  if (!validateFileName(fileName)) {
    document.querySelector("#fileName").classList.remove("is-valid");
    document.querySelector("#fileName").classList.add("is-invalid");
    document.querySelector("#fileName").placeholder = "Enter valid file name";
    return;
  }
  if (checkAlreadyExists(fileName)) {
    document.querySelector("#fileName").classList.remove("is-valid");
    document.querySelector("#fileName").classList.add("is-invalid");
    document.querySelector("#fileName").placeholder = "File already exists";
    return;
  }

  var projectName = document
    .querySelector("#projectName")
    .innerText.toString()
    .trim();
        var userid = document
          .querySelector("#userid")
          .innerText.toString()
          .trim();

  socket.emit("renameFile", {
    userid: userid,

    projectName: projectName,
    newFileName: fileName,
    oldFileName: element.parentElement.previousElementSibling.innerText
      .toString()
      .trim(),
    listElement: element.parentElement.previousElementSibling.outerHTML
  });
}
socket.on("renameFile", (projectName, oldFileName, newFileName) => {
  var oldFileName = oldFileName;
  var projectName = projectName;
  //remove the old filename from the file li containing the old name
  var listGroup = document.querySelector(".list-group");
  var span = document.createElement("span");
  span.setAttribute(
    "class",
    "list-group-item list-group-item-action list-group-item-light p-3"
  );
  span.innerHTML = `<i class="fa fa-file-code"></i>&nbsp;&nbsp;<a onclick="getFile(this)" class="justify-content-between">${newFileName}&nbsp;&nbsp;</a><a><span onclick="editFileName(this)"><i class="fa fa-edit"></i></span></a>&nbsp;&nbsp;<a><span onclick="deleteFile(this)" ><i class="fa fa-trash"></i></span></a></a>`;
  listGroup.appendChild(span);
  document.querySelector("#fileName").value = "";
  document.querySelector("#fileInputContainer").remove();
  deleteFileFromList(oldFileName);
});

function deleteFile(element) {
  if (!document.querySelector("#fileName")) {
    var fileName = element.parentElement.parentElement.innerText
      .toString()
      .trim();
    var projectName = document
      .querySelector("#projectName")
      .innerText.toString()
      .trim();
    var userid = document.querySelector("#userid").innerText.toString().trim();

    //send delete file request to socket on server and then remove the file from the list
    socket.emit("deleteFile", {
      userid: userid,
      projectName: projectName,
      fileName: fileName
    });
  }
}
socket.on("deleteFile", (projectName, fileName) => {
  deleteFileFromList(fileName);
});

//deleteFile function
function deleteFileFromList(fileName) {
  //search for the file name in the list
  var listGroup = document.querySelector(".list-group");
  var listGroupItems = listGroup.querySelectorAll(".list-group-item");
  for (var i = 0; i < listGroupItems.length; i++) {
    if (listGroupItems[i].innerText.toString().trim() === fileName) {
      listGroup.removeChild(listGroupItems[i]);
      break;
    }
  }
}

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
    if (!document.querySelector("#fileName")) {
      var listGroup = document.querySelector(".list-group");
      var listGroupItem = document.createElement("li");
      listGroupItem.id = "fileInputContainer";
      listGroupItem.classList.add("list-group-item");
      listGroupItem.classList.add("d-flex");
      listGroupItem.classList.add("justify-content-between");
      listGroupItem.classList.add("align-items-center");
      listGroupItem.innerHTML = `<input type="text" id="fileName" class="form-control" placeholder="File Name" aria-label="File Name">&nbsp;&nbsp;
        <a onclick="addFile();"><i class="fa fa-lg fa-check"></i></a>&nbsp;&nbsp;
        <a onclick="cancel()"><i class="fa fa-lg fa-times"></i></a>
        `;
      listGroup.prepend(listGroupItem);
    }
  });
  document.querySelector("#compile").addEventListener("click", e => {
    compileIt();
  });
});

function validateFileName(fileName) {
  const fileNameRegex = /^[\w,\s-]+\.[A-Za-z]{1,6}$/;
  if (
    fileName.length > 0 &&
    fileName.length <= 50 &&
    fileNameRegex.test(fileName)
  ) {
    return true;
  }
  return false;
}

function checkAlreadyExists(fileName) {
  const fileList = document.querySelector(".list-group").children;
  for (let i = 0; i < fileList.length; i++) {
    if (fileList[i].innerText.trim() === fileName) {
      return true;
    }
  }
  return false;
}
function cancel() {
  document.querySelector("#fileInputContainer").remove();
}

function getFile(element) {
  var fileName = element.innerText.toString().trim();
  var projectName = document
    .querySelector("#projectName")
    .innerText.toString()
    .trim();
userid = document.querySelector("#userid").innerText.toString().trim();
  //send request through socket to get the file content
  socket.emit("getFile", {
    userid: userid,
    projectName: projectName,
    fileName: fileName
  });
}
var editor;
function removeEditor() {
  if (editor) {
    document.querySelector("#editor").innerHTML = "";
    document.querySelector("#editor").remove();
    editor.getModel().dispose();
  }
}
socket.on("fileContent", function (data) {
  var fileContent = data.fileContent;
  var fileName = data.fileName;
  var projectName = data.projectName;
  //mark the li with file name as active
  var listGroupItems = document.querySelectorAll(".list-group-item");
  for (var i = 0; i < listGroupItems.length; i++) {
    if (listGroupItems[i].innerText.toString().trim() == fileName) {
      listGroupItems[i].classList.add("active");
    } else {
      listGroupItems[i].classList.remove("active");
    }
  }
  removeEditor();
  //create a monaco model
  var model = monaco.editor.createModel(
    fileContent,
    undefined,
    monaco.Uri.file(fileName)
  );
  //create an editor for the model
  //create an element p as the first child of #editor
  var editorElement = document.createElement("p");
  editorElement.id = "editor";
  editorElement.style.height = "580px";
  editorElement.style.width = "700px";
  var editorDiv = document.querySelector("#editordiv");
  editorElement.classList.add("col-lg-9");
  editorDiv.prepend(editorElement);
  document.querySelector("#compiler").classList.remove("d-none");
  document.querySelector("#compiler").classList.add("d-inline");
  //add the model to the editor
  editor = monaco.editor.create(document.querySelector("#editor"), {
    model: model,
    theme: "vs-dark",
    autoClosingBrackets: true,
    fontSize: 14,
    fontFamily: "Consolas, 'Courier New', monospace",
    lightbulb: {
      enabled: true
    },
    matchBrackets: true,
    autoClosingQuotes: "always",
    bracketPairColorization: true
  });

  editor.onDidChangeModelContent(event => {
    sendFileContent();
    //if line starts with // and ends with .
    var lineNumber = editor.getPosition().lineNumber;
    var lineContent = editor.getModel().getLineContent(lineNumber);
    if (lineContent.startsWith("//") && lineContent.endsWith(".")) {
      lineContent = lineContent.substring(2, lineContent.length - 1);
      socket.emit("autoSuggest", {
        lineNumber: lineNumber,
        lineContent: lineContent
      });
    }
  });
});

socket.on("autoSuggest", function (data) {
  if (data.data.answers.length == 0) {
    //get entire editor content and replace the line with the new line an set value
    var editorContent = editor.getModel().getValue();
    var lineNumber = data.lineNumber;
    var lineContent = editor.getModel().getLineContent(lineNumber);
    var newLineContent = "No suggestions found";
    var newEditorContent = editorContent.replace(lineContent, newLineContent);
    editor.getModel().setValue(newEditorContent);
    var cursorPosition = new monaco.Position(lineNumber, newLineContent.length);
    editor.setPosition(cursorPosition);
  } else {
    var editorContent = editor.getModel().getValue();
    var lineNumber = data.lineNumber;
    var lineContent = editor.getModel().getLineContent(lineNumber);
    var newLineContent = data.data.answers[0].answer;
    var newEditorContent = editorContent.replace(lineContent, newLineContent);
    editor.getModel().setValue(newEditorContent);
    var cursorPosition = new monaco.Position(lineNumber, newLineContent.length);
    editor.setPosition(cursorPosition);
  }
});

//on every key press in editor, send the content to the server with the file name and project name
function sendFileContent() {
  //select the name of active file
  var listGroupItems = document.querySelectorAll(".list-group-item");
  for (var i = 0; i < listGroupItems.length; i++) {
    if (listGroupItems[i].classList.contains("active")) {
      var fileName = listGroupItems[i].innerText.toString().trim();
    }
  }

  var editor = monaco.editor.getModels()[0];
  var projectName = document
    .querySelector("#projectName")
    .innerText.toString()
    .trim();
    var userid = document.querySelector("#userid").innerText.toString().trim();
  var fileContent = editor.getValue();
  socket.emit("updateFile", {
        userid: userid,

    projectName: projectName,
    fileName: fileName,
    fileContent: fileContent
  });
}

function compileIt() {
  var editor = monaco.editor.getModels()[0];
  socket.emit("compile", {
    body: JSON.stringify({
      code: editor.getValue(),
      language: document.querySelector("#dropdown-language").value,
      standardIn: document
        .querySelector("#stdin")
        .value.split(/[|]+/)
        .join("\n")
    })
  });
}
socket.on("compileOutput", function (data) {
  document.getElementById("opscreen").style.visibility = "visible";
  document.getElementById("output").innerHTML = data.output;
});
