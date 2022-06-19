var socket;
var peer;
var projectPath;
var fileRoomID;
var isHost = false;
var userName;
var editor;
var fileName;
var remoteCursorManager;
var remoteUserCursor;
var remoteSelectionManager;
var targetContentManager
var restrictSharing = false;
var localStream;
var last_applied_change = null;
var color = "#" + Math.floor(Math.random() * 16777215).toString(16);
const videoGrid = document.getElementById('video-grid')


function addLoader() {
    var loader = document.querySelector("#loader");
    loader.style.display = "block";
}

function removeLoader() {
    var loader = document.querySelector("#loader");
    loader.style.display = "none";
}

function addFile() {
    if (!isHost && restrictSharing) return
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
        fileContent: "",
    });
}

function editFileName(element) {
    if (!isHost && restrictSharing) return

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
    if (!isHost && restrictSharing) return

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
        listElement: element.parentElement.previousElementSibling.outerHTML,
    });
}

function deleteFile(element) {
    if (!isHost && restrictSharing) return

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
            fileName: fileName,
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
            if (listGroupItems[i].classList.contains("active")) {
                //remove the editor if the file is deleted
                removeEditor();
                hideCompiler();
            }
            break;
        }
    }
}

window.addEventListener("DOMContentLoaded", async(event) => {
    addLoader();
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({
        video: false,
        audio: true
    }, function(stream) {
        peer = new Peer(userID)
        peer.on("open", async() => {

            const myVideo = document.createElement('video')
            myVideo.muted = true
            removeLoader()

            localStream = stream
            addVideoStream(myVideo, stream)
            peer.on('call', call => {
                call.answer(stream)
                const video = document.createElement('video')
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream)
                })
            })

            socket.on('userJoinned', data => {
                connectToNewUser(data.id, stream)
            })


        })
    })
    var socketID = projectRoomID
    socket = io.connect();
    socket.on("connect", function() {
        socket.emit("join", {
            projectRoomID: socketID,
        });
    });


    socket.on("newUser", function(data) {
        if (isHost) {
            var dropdownMenu = document.querySelector("#dropdownMenu");
            var dropdownMenuItem = document.createElement("a");
            dropdownMenuItem.classList.add("dropdown-item");
            dropdownMenuItem.id = data.id;
            dropdownMenuItem.innerHTML += `<a id="${data.id}" onclick="removeUser(this.id)">${data.userName}<i class="fa fa-times" style='margin-left:7px;'></i></a>`;
            if (data.isHost) {
                dropdownMenuItem.innerHTML = "";
                dropdownMenuItem.classList.add("disabled");
                dropdownMenuItem.innerText = data.userName;
            }
            dropdownMenu.appendChild(dropdownMenuItem);
        }
    })
    socket.on("roomDetails", function(data) {
        userName = data.userName;
        projectPath = data.projectPath;
        projectRoomID = data.projectRoomID;
        isHost = data.isHost;
        restrictSharing = data.restrictSharing;

        if (!isHost) {
            document.querySelector("#chatbot").classList.remove("d-none")
            document.querySelector("#chatbot").classList.add("d-flex")
            var navBar = document.querySelector("#tutorial")
            navBar.insertAdjacentHTML("beforeend", `<button style="margin-left: 10px;" onclick="muteUnmute()" id="mic" class="btn btn-success"><i class="fa fa-microphone"></i></button>`)
        }
    });
    socket.on("addFile", (fileName) => {
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
    socket.on("renameFile", (data) => {
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
    socket.on("deleteFile", (fileName) => {
        deleteFileFromList(fileName);
    });
    socket.on("restrictEdit", (data) => {
        restrictSharing = data.restrictSharing;
        restrictSharing && !isHost && editor != undefined ? editor.setReadOnly(true) : editor.setReadOnly(false);
    })
    const sidebarToggle = document.body.querySelector("#sidebarToggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", (event) => {
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
    document.querySelector("#compile").addEventListener("click", (e) => {
        compileIt();
    });

    socket.on("editorContentChanged", (data) => {
        var delta = data.delta;
        last_applied_change = delta;
        editor.session.getDocument().applyDeltas([delta]);
    })
    socket.on("cursorPositionChanged", (data) => {
        remoteUserCursor ? remoteCursorManager.clearCursor(data.id) : null;
        if (typeof(remoteCursorManager._cursors[data.id]) === "undefined") {
            remoteUserCursor = remoteCursorManager.addCursor(data.id, data.userName, data.color, { row: data.row, column: data.column });
        } else {
            remoteCursorManager.setCursor(data.id.toString(), { row: data.row, column: data.column });
        }
    })

    socket.on("fileContent", function(data) {

        var fileContent = data.fileContent;
        fileName = data.fileName;
        //get the selected dropdown language
        var select = document.querySelector("#dropdown-language")
        select.value = languageList[data.language];

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
        var editorElement = document.createElement("div");
        editorElement.id = "editor";
        editorElement.style.height = "580px";
        editorElement.style.width = "700px";
        editorElement.style.margin = "auto";
        editorElement.style.marginBottom = "10px";
        var editorDiv = document.querySelector("#editordiv");
        editorElement.classList.add("col-lg-9");
        editorDiv.prepend(editorElement);
        document.querySelector("#compiler").classList.remove("d-none");
        document.querySelector("#compiler").classList.add("d-inline");
        var modelist = ace.require("ace/ext/modelist");
        editor = ace.edit("editor", {
            theme: "ace/theme/chaos",
            mode: modelist.getModeForPath(fileName).mode,
            matchBrackets: true,
            tabSize: 4,
            useSoftTabs: true,
            showGutter: true,
            showPrintMargin: false,
            fontSize: 14,
            wrap: true,
            readOnly: false,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            autoScrollEditorIntoView: true,
            highlightActiveLine: true,
            highlightGutterLine: true,
            showLineNumbers: true,
            showFoldWidgets: true,
            useWorker: false,
            value: fileContent
        });
        restrictSharing && !isHost && editor != undefined ? editor.setReadOnly(true) : editor.setReadOnly(false);
        remoteCursorManager = new AceCollabExt.AceMultiCursorManager(editor.getSession());
        editor.session.selection.on("changeCursor", function(e) {
            socket.emit("cursorPositionChanged", {
                id: userID,
                userName: userName,
                fileRoomID: fileRoomID,
                color: color,
                row: editor.selection.getCursor().row,
                column: editor.selection.getCursor().column,
            })

        })
        editor.session.on("change", (e) => {
            if (!isHost && restrictSharing) return
            sendFileContent();
            var lineContent = editor.session.getLine(e.end.row);
            if (lineContent.startsWith("//") && lineContent.endsWith(".") && last_applied_change != e) {
                socket.emit("autoSuggest", {
                    fileRoomID: fileRoomID,
                    lineNumber: e.end.row + 1,
                    lineContent: lineContent,
                });
            }
            if (last_applied_change != e) {
                socket.emit("onEditorContentChange", {
                    fileRoomID: fileRoomID,
                    delta: e
                });
            }
        }, false)
    });
    socket.on("text", function(data) {
        //get current cursor position
        var position = editor.getPosition();
        editor.setValue(data.text);
        editor.setPosition(position);
    });
    socket.on("autoSuggest", function(data) {
        if (data.data.answers.length == 0) {
            editor.getSession().insert({
                row: data.lineNumber,
                column: 0
            }, "No suggestions found");
        } else {
            editor.getSession().insert({
                row: data.lineNumber,
                column: 0
            }, "\n" + data.data.answers[0].answer);
        }
    });
    socket.on("compileOutput", function(data) {
        document.getElementById("opscreen").style.visibility = "visible";
        document.getElementById("output").innerText = data.output;
    });
    socket.on("chat", function(data) {
        addResponseMsg(data.message, data.userName, data.isHost);
    });
    socket.on("leaveRoom", function(data) {
        if (isHost)
            removeUserFromList(data.userID)
        if (remoteCursorManager ? remoteCursorManager._cursors[data.userID] : false) {
            remoteCursorManager.clearCursor(data.userID);
        }
    })
    socket.on("disconnect", function() {
        cleanupCollabStyles();
        if (isHost) {
            socket.emit("stopCollaboration", {
                projectRoomID: projectRoomID
            })
        } else {
            socket.emit("leaveRoom", {
                projectRoomID: projectRoomID,
                userID: userID
            })
        }
    })
    socket.on("stopCollaboration", function() {
        if (!isHost) {
            peer.destroy();
            if (confirm("Host has stopped collaboration")) {
                window.location.href = "/user/dashboard";

            } else {
                window.location.href = "/user/dashboard";
            }
        }
    })
    socket.on("removeUser", function(data) {
        if (data.userID == userID) {
            peer.destroy();
            alert("You have been removed from collaboration");
            window.location.href = "/user/dashboard";
        }
    })
});

document.getElementById("message").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        send();
    }
});
document.getElementById("chatbot_toggle").onclick = function() {
    if (document.getElementById("chatbot").classList.contains("chat-collapsed")) {
        document.getElementById("chatbot").classList.remove("chat-collapsed");
        document.getElementById("chatbot_toggle").children[0].style.display =
            "none";
        document.getElementById("chatbot_toggle").children[1].style.display = "";
    } else {
        document.getElementById("chatbot").classList.add("chat-collapsed");
        document.getElementById("chatbot_toggle").children[0].style.display = "";
        document.getElementById("chatbot_toggle").children[1].style.display =
            "none";
    }
};

function connectToNewUser(userId, stream) { // This runs when someone joins our room
    const call = peer.call(userId, stream) // Call the user who just joined
        // Add their video
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        // If they leave, remove their video
    call.on('close', () => {
        video.remove()
    })
}


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
            video.play()
        })
        // videoGrid.append(video) 
}

function send() {
    var msg = document.getElementById("message").value;
    if (msg == "") return;
    addMsg(msg, userName, isHost);
}

function addMsg(msg, userName, isHost) {
    var currentdate = new Date();
    var time =
        currentdate.getHours() +
        ":" +
        currentdate.getMinutes() +
        ":" +
        currentdate.getSeconds();
    var div = document.createElement("div");
    div.innerHTML = `<span style='flex-grow:1'>
        </span><div class='chat-message-sent'><div>${msg}</div> <span class="username">You ${
    isHost ? "(Host)" : "(Collaborator)"
  } &bull; ${time} </span></div>`;
    div.className = "chat-message-div";
    document.getElementById("message-box").appendChild(div);
    document.getElementById("message").value = "";
    document.getElementById("message-box").scrollTop =
        document.getElementById("message-box").scrollHeight;
    socket.emit("chat", {
        message: msg,
        projectRoomID: projectRoomID,
        userName: userName,
        isHost: isHost,
    });
}

function addResponseMsg(msg, userName, isHost) {
    var currentdate = new Date();
    var time =
        currentdate.getHours() +
        ":" +
        currentdate.getMinutes() +
        ":" +
        currentdate.getSeconds();
    var div = document.createElement("div");
    div.innerHTML = `<div class='chat-message-received'>
    <div>${msg}</div> <span class="username">${userName} ${
    isHost ? "(Host)" : "(Collaborator)"
  } &bull; ${time}</span></div>`;
    div.className = "chat-message-div";
    document.getElementById("message-box").appendChild(div);
    document.getElementById("message-box").scrollTop =
        document.getElementById("message-box").scrollHeight;
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
    //leave fileRoomID room
    socket.emit("leaveFileRoom", {
        fileRoomID: fileRoomID,
    });
    //send request through socket to get the file content
    socket.emit("getFile", {
        projectPath: projectPath,
        projectRoomID: projectRoomID,
        projectName: projectName,
        fileName: fileName,
    });
}

function leaveRoom() {
    socket.emit("leaveRoom", {
        projectRoomID: projectRoomID,
        userID: userID,
    });
}

function hideCompiler() {
    document.getElementById("compiler").classList.add("d-none");
}

function removeEditor() {
    if (editor) {
        document.querySelector("#editor").innerHTML = "";
        document.querySelector("#editor").remove();
        //remove ace editor
        editor.destroy();
        editor = null;
    }
}

//on every key press in editor, send the content to the server with the file name and project name
function sendFileContent() {
    var projectName = document
        .querySelector("#projectName")
        .innerText.toString()
        .trim();
    var fileContent = editor.getSession().getValue();
    socket.emit("updateFile", {
        projectPath: projectPath,
        fileRoomID: fileRoomID,
        projectName: projectName,
        fileName: fileName,
        fileContent: fileContent,
    });
}

function compileIt() {
    socket.emit("compile", {
        fileRoomID: fileRoomID,
        body: JSON.stringify({
            code: editor.getValue(),
            language: document.querySelector("#dropdown-language").value,
            standardIn: document
                .querySelector("#stdin")
                .value.split(/[|]+/)
                .join("\n"),
        }),
    });
}

function manageCollaboration() {
    addLoader();
    fetch("/user/project/startCollaboration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                projectRoomID: projectRoomID,
            }),
        })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            if (data.status === "success") {
                initializeCollabStyles();
            }
        });
}

function initializeCollabStyles() {
    var navBar = document.querySelector("#tutorial")
    document.querySelector("#dropdownMenuButton").style.display = "block";
    navBar.insertAdjacentHTML("beforeend", `<button style="margin-left: 10px;" onclick="muteUnmute()" id="mic" class="btn btn-success"><i class="fa fa-microphone"></i></button>`)
    document.querySelector("#chatbot").classList.remove("d-none")
    document.querySelector("#chatbot").classList.add("d-flex")
    var ul = document.querySelector(".navbar-nav");
    var li = document.createElement("li");
    li.className = "form-check form-switch nav-item px-lg-1 py-1 py-lg-0";
    li.style.color = "white";
    li.style.margin = 'auto';
    li.innerHTML = `
    <span>
    Restrict Editing</span>
    <input onclick="restrictEdit()" class="form-check-input" style="margin-left:auto;" type="checkbox" role="switch" id="restrictEdit">
    `;
    ul.insertBefore(li, ul.firstChild);
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
<button class="copy-btn" id="copyButton" onclick="copy()"><i class="far fa-copy"></i></button>
</div>
<div id="copied-success" class="copied">
  <span>&nbsp&nbspCopied!&nbsp&nbsp</span>
</div>`;
    removeLoader();
}

function stopBothVideoAndAudio(stream) {
    stream.getTracks().forEach(function(track) {
        if (track.readyState == 'live') {
            track.stop();
        }
    });
}

function restrictEdit() {
    if (document.querySelector("#restrictEdit").checked) {
        restrictSharing = true;
        document.querySelector("#restrictEdit").previousElementSibling.style.color = "#25D366";
        socket.emit("restrictEdit", {
            projectRoomID: projectRoomID,
            restrictSharing: true
        });
    } else {
        restrictSharing = false;
        document.querySelector("#restrictEdit").previousElementSibling.style.color = "white";
        socket.emit("restrictEdit", {
            projectRoomID: projectRoomID,
            restrictSharing: false
        });
    }
}

function stopCollaboration() {
    addLoader();
    fetch("/user/project/stopCollaboration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                projectRoomID: projectRoomID,
            }),
        })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            if (data.status === "success") {
                cleanupCollabStyles();
                socket.emit("stopCollaboration", {
                    projectRoomID: projectRoomID
                })
            }
        });
}

function cleanupCollabStyles() {
    document.querySelector("#mic") ? document.querySelector("#mic").remove() : null;
    document.querySelector("#dropdownMenuButton") ? document.querySelector("#dropdownMenuButton").style.display = "none" : null
    document.querySelector("#dropdownMenu").innerHTML = document.querySelector("#dropdownMenu") ? document.querySelector("#dropdownMenu").firstElementChild ? document.querySelector("#dropdownMenu").firstElementChild.outerHTML : '' : '';
    document.querySelector("#chatbot").classList.remove("d-flex")
    document.querySelector("#chatbot").classList.add("d-none")
    var ul = document.querySelector(".navbar-nav");
    ul ? ul.firstElementChild.remove() : null;
    document.querySelector("#manageCollaboration").innerText =
        "Start Collaboration";
    document.querySelector("#back") ? document.querySelector("#back").style.display = "block" : null;
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
    removeLoader();
}

function copy() {
    var copyText = document.getElementById("copyClipboard");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");

    $("#copied-success").fadeIn(800);
    $("#copied-success").fadeOut(800);
}

window.onbeforeunload = function(e) {
    if (isHost) {
        socket.emit("disconnectusers", {
            projectRoomID: projectRoomID
        });
    } else {
        socket.emit("leaveRoom", {
            projectRoomID: projectRoomID,
            userID: userID
        })
    }
}

function muteUnmute() {
    if (document.querySelector("#mic").classList.contains("btn-success")) {
        document.querySelector("#mic").classList.remove("btn-success");
        document.querySelector("#mic").classList.add("btn-danger");
        document.querySelector("#mic").innerHTML = `<i class="fa fa-microphone-slash"></i>`;
        localStream.getAudioTracks().forEach(function(track) {
            track.enabled = false;
        });
    } else {
        document.querySelector("#mic").classList.remove("btn-danger");
        document.querySelector("#mic").classList.add("btn-success");
        document.querySelector("#mic").innerHTML = `<i class="fa fa-microphone"></i>`;
        localStream.getAudioTracks().forEach(function(track) {
            track.enabled = true;
        });
    }
}

function removeUser(userID) {
    var users = document.querySelector("#dropdownMenu").children;
    if (remoteCursorManager ? remoteCursorManager._cursors[userID] : false) {
        remoteCursorManager.clearCursor(userID);
    }
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == userID) {
            users[i].remove();
        }
    }
    socket.emit("removeUser", {
        projectRoomID: projectRoomID,
        userID: userID
    })
}

function removeUserFromList(userID) {
    var users = document.querySelector("#dropdownMenu").children;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == userID) {
            users[i].remove();
        }
    }
}