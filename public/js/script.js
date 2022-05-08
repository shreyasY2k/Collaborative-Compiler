var socket;
var projectPath;
var projectRoomID;
var fileRoomID;
var isHost = false;
var userName;

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
    socket.emit("addFile", {
        projectPath: projectPath,
        projectRoomID: projectRoomID,
        projectName: projectName,
        fileName: fileName,
        fileContent: ""
    });
}

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

    socket.emit("renameFile", {
        projectPath: projectPath,
        projectRoomID: projectRoomID,
        projectName: projectName,
        newFileName: fileName,
        oldFileName: element.parentElement.previousElementSibling.innerText
            .toString()
            .trim(),
        listElement: element.parentElement.previousElementSibling.outerHTML
    });
}

function deleteFile(element) {
    if (!document.querySelector("#fileName")) {
        var fileName = element.parentElement.parentElement.innerText
            .toString()
            .trim();
        var projectName = document
            .querySelector("#projectName")
            .innerText.toString()
            .trim();

        //send delete file request to socket on server and then remove the file from the list
        socket.emit("deleteFile", {
            projectPath: projectPath,
            projectRoomID: projectRoomID,
            projectName: projectName,
            fileName: fileName
        });
    }
}

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
    var socketID = document
        .querySelector("#projectRoomID")
        .innerText.toString()
        .trim();
    socket = io.connect();
    socket.on("connect", function() {
        socket.emit("join", {
            projectRoomID: socketID
        });
    });

    socket.on("roomDetails", function(data) {
        userName = data.userName;
        projectPath = data.projectPath;
        projectRoomID = data.projectRoomID;
        isHost = data.isHost;
        document.querySelector("#projectRoomID") ?
            document.querySelector("#projectRoomID").remove() :
            null;
    });
    socket.on("updateFile", function(data) {
        console.log("updateFile", data.fileContent);
    });
    socket.on("addFile", fileName => {
        var listGroup = document.querySelector(".list-group");
        var span = document.createElement("span");
        span.setAttribute(
            "class",
            "list-group-item list-group-item-action list-group-item-light p-3"
        );
        span.innerHTML = `<i class="fa fa-lg fa-file-code"></i>&nbsp;&nbsp;<a onclick="getFile(this)" class="justify-content-between">${fileName}&nbsp;&nbsp;</a><a><span onclick="editFileName(this)"><i class="fa fa-edit"></i></span></a>&nbsp;&nbsp;<a><span onclick="deleteFile(this)" ><i class="fa fa-trash"></i></span></a></a>`;
        listGroup.appendChild(span);
        if (document.querySelector("#fileName")) {
            document.querySelector("#fileName").value = "";
            document.querySelector("#fileInputContainer").remove();
        }
    });
    socket.on("renameFile", data => {
        var oldFileName = data.oldFileName;
        //remove the old filename from the file li containing the old name
        var listGroup = document.querySelector(".list-group");
        var span = document.createElement("span");
        span.setAttribute(
            "class",
            "list-group-item list-group-item-action list-group-item-light p-3"
        );
        span.innerHTML = `<i class="fa fa-file-code"></i>&nbsp;&nbsp;<a onclick="getFile(this)" class="justify-content-between">${data.newFileName}&nbsp;&nbsp;</a><a><span onclick="editFileName(this)"><i class="fa fa-edit"></i></span></a>&nbsp;&nbsp;<a><span onclick="deleteFile(this)" ><i class="fa fa-trash"></i></span></a></a>`;
        listGroup.appendChild(span);
        if (document.querySelector("#fileName")) {
            document.querySelector("#fileName").value = "";
            document.querySelector("#fileInputContainer").remove();
        }
        deleteFileFromList(oldFileName);
    });
    socket.on("deleteFile", fileName => {
        deleteFileFromList(fileName);
    });
    const sidebarToggle = document.body.querySelector("#sidebarToggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", event => {
            event.preventDefault();
            document.body.classList.toggle("sb-sidenav-toggled");
        });
    }

    document.querySelector("#createFile").addEventListener("click", function() {
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
    socket.on("fileContent", function(data) {
        var fileContent = data.fileContent;
        var fileName = data.fileName;
        fileRoomID = data.fileRoomID;
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
                    fileRoomID: fileRoomID,
                    lineNumber: lineNumber,
                    lineContent: lineContent
                });
            }
        });
    });

    socket.on("autoSuggest", function(data) {
        if (data.data.answers.length == 0) {
            //get entire editor content and replace the line with the new line an set value
            var editorContent = editor.getModel().getValue();
            var lineNumber = data.lineNumber;
            var lineContent = editor.getModel().getLineContent(lineNumber);
            var newLineContent = "No suggestions found";
            var newEditorContent = editorContent.replace(lineContent, newLineContent);
            editor.getModel().setValue(newEditorContent);
            var cursorPosition = new monaco.Position(
                lineNumber,
                newLineContent.length
            );
            editor.setPosition(cursorPosition);
        } else {
            var editorContent = editor.getModel().getValue();
            var lineNumber = data.lineNumber;
            var lineContent = editor.getModel().getLineContent(lineNumber);
            var newLineContent = data.data.answers[0].answer;
            var newEditorContent = editorContent.replace(lineContent, newLineContent);
            editor.getModel().setValue(newEditorContent);
            var cursorPosition = new monaco.Position(
                lineNumber,
                newLineContent.length
            );
            editor.setPosition(cursorPosition);
        }
    });
    socket.on("compileOutput", function(data) {
        document.getElementById("opscreen").style.visibility = "visible";
        document.getElementById("output").innerHTML = data.output;
    });
    socket.on("chat", function(data) {
        addResponseMsg(data.message, data.userName, data.isHost);
    });
});

document.getElementById("message").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        send();
    }
});
document.getElementById("chatbot_toggle").onclick = function() {
    if (document.getElementById("chatbot").classList.contains("collapsed")) {
        document.getElementById("chatbot").classList.remove("collapsed")
        document.getElementById("chatbot_toggle").children[0].style.display = "none"
        document.getElementById("chatbot_toggle").children[1].style.display = ""
    } else {
        document.getElementById("chatbot").classList.add("collapsed")
        document.getElementById("chatbot_toggle").children[0].style.display = ""
        document.getElementById("chatbot_toggle").children[1].style.display = "none"
    }
}

function send() {
    var msg = document.getElementById("message").value;
    if (msg == "") return;
    addMsg(msg, userName, isHost);
}

function addMsg(msg, userName, isHost) {
    var currentdate = new Date();
    var time = currentdate.getHours() + ":" +
        currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var div = document.createElement("div");
    div.innerHTML =
        `<span style='flex-grow:1'>
        </span><div class='chat-message-sent'><div>${msg}</div> <span class="username">You ${isHost ? "(Host)" : "(Collaborator)"} &bull; ${time} </span></div>`;
    div.className = "chat-message-div";
    document.getElementById("message-box").appendChild(div);
    document.getElementById("message").value = "";
    document.getElementById("message-box").scrollTop = document.getElementById(
        "message-box"
    ).scrollHeight;
    socket.emit("chat", {
        message: msg,
        projectRoomID: projectRoomID,
        userName: userName,
        isHost: isHost
    });
}

function addResponseMsg(msg, userName, isHost) {
    var currentdate = new Date();
    var time = currentdate.getHours() + ":" +
        currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var div = document.createElement("div");
    div.innerHTML = `<div class='chat-message-received'>
    <div>${msg}</div> <span class="username">${userName} ${isHost ? "(Host)" : "(Collaborator)"} &bull; ${time}</span></div>`;
    div.className = "chat-message-div";
    document.getElementById("message-box").appendChild(div);
    document.getElementById("message-box").scrollTop = document.getElementById(
        "message-box"
    ).scrollHeight;
}

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
    //send request through socket to get the file content
    socket.emit("getFile", {
        projectPath: projectPath,
        projectRoomID: projectRoomID,
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
    var fileContent = editor.getValue();
    socket.emit("updateFile", {
        projectPath: projectPath,
        fileRoomID: fileRoomID,
        projectName: projectName,
        fileName: fileName,
        fileContent: fileContent
    });
}

function compileIt() {
    var editor = monaco.editor.getModels()[0];
    socket.emit("compile", {
        fileRoomID: fileRoomID,
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

function manageCollaboration() {
    fetch("/user/project/startCollaboration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectRoomID: projectRoomID
            })
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.status === "success") {
                initializeCollabStyles();
            }
        });
}

function initializeCollabStyles() {
    document.querySelector("#manageCollaboration").innerText =
        "Stop Collaboration";
    document.querySelector("#back").style.display = "none";
    document
        .querySelector("#manageCollaboration")
        .setAttribute("onclick", "stopCollaboration()");
    document
        .querySelector("#manageCollaboration")
        .classList.remove("btn-outline-success");
    document
        .querySelector("#manageCollaboration")
        .classList.add("btn-outline-danger");
    var roomIDListItem = document.querySelector("#roomIdLi");
    roomIDListItem.classList.remove("d-none");
    roomIDListItem.classList.add("d-block");
    roomIDListItem.innerHTML = `<div class="clipboard input-group">
<input onclick="copy()" class="copy-input form-control" value="${projectRoomID}" id="copyClipboard" readonly>
<button class="copy-btn btn" id="copyButton" onclick="copy()"><i class="far fa-copy"></i></button>
</div>
<div id="copied-success" class="copied">
  <span>&nbsp&nbspCopied!&nbsp&nbsp</span>
</div>`;
}

function stopCollaboration() {
    fetch("/user/project/stopCollaboration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectRoomID: projectRoomID
            })
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.status === "success") {
                document.querySelector("#manageCollaboration").innerText =
                    "Start Collaboration";
                document.querySelector("#back").style.display = "block";
                document
                    .querySelector("#manageCollaboration")
                    .setAttribute("onclick", "manageCollaboration()");
                document
                    .querySelector("#manageCollaboration")
                    .classList.remove("btn-outline-danger");
                document
                    .querySelector("#manageCollaboration")
                    .classList.add("btn-outline-success");
                var roomIDListItem = document.querySelector("#roomIdLi");
                roomIDListItem.classList.remove("d-block");
                roomIDListItem.classList.add("d-none");
            }
        });

}

function copy() {
    var copyText = document.getElementById("copyClipboard");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");

    $("#copied-success").fadeIn(800);
    $("#copied-success").fadeOut(800);
}