/*!
* Start Bootstrap - Simple Sidebar v6.0.5 (https://startbootstrap.com/template/simple-sidebar)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-simple-sidebar/blob/master/LICENSE)
*/
//
// Scripts
//

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
        });
    }

    document
      .querySelector("#createFile")
      .addEventListener("click", function () {
        //create input tick and times as the first element in the list group cclass
        var listGroup = document.querySelector(".list-group");
        var listGroupItem = document.createElement("li");
        listGroupItem.id="fileInputContainer"
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
function checkEmpty(fileName){
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
    if(fileNameExists){
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
  var projectName = document.querySelector("#projectName").innerText.toString().trim();
  var url = `/user/project/addFile?projectname=${projectName}&filename=${fileName}`;
  fetch(url).then(function(response) {
      return response.text();
  }
  ).then(function(data) {

  var span = document.createElement("span");
  span.setAttribute(
    "class",
    "list-group-item list-group-item-action list-group-item-light p-3"
  );

  span.innerHTML = `<i class="fa fa-file"></i>&nbsp;&nbsp;<a onclick="getFile(this)" class="justify-content-between">${fileName}&nbsp;&nbsp;</a><a><span onclick="editFileName(this)"><i class="fa fa-edit"></i></span></a>&nbsp;&nbsp;<a><span onclick="deleteFile(this)" ><i class="fa fa-trash"></i></span></a></a>`;
  listGroup.appendChild(span);
  document.querySelector("#fileName").value = "";
  document.querySelector("#fileInputContainer").remove();
  })
}
function cancel() {
    document.querySelector("#fileInputContainer").remove();
}

function deleteFile(element) {

    var listGroup = document.querySelector(".list-group");
    var fileName = element.parentElement.parentElement.innerText.toString().trim();
    var projectName = document.querySelector("#projectName").innerText.toString().trim();
    var url = `/user/project/deleteFile?projectname=${projectName}&filename=${fileName}`;
    //send delete request
    fetch(url).then(function(response) {
        return response.text();
    }
    ).then(function(data) {
    listGroup.removeChild(element.parentElement.parentElement);})
}
function editFileName(element) {
    var fileName = element.parentElement.parentElement.innerText.toString().trim()
    //create input tick and times as an element next to the file name
    var listGroup = document.querySelector(".list-group");
    var listGroupItem = document.createElement("li");
    listGroupItem.id="fileInputContainer"
    listGroupItem.classList.add("list-group-item");
    listGroupItem.classList.add("d-flex");
    listGroupItem.classList.add("justify-content-between");
    listGroupItem.classList.add("align-items-center");
    listGroupItem.innerHTML = `<input type="text" id="fileName" class="form-control" placeholder="File Name" aria-label="File Name" value="${fileName}">&nbsp;&nbsp;
    <a onclick="updateFileName(this);"><i class="fas fa-check"></i></a>&nbsp;&nbsp;
    <a onclick="cancel()"><i class="fas fa-times"></i></a>
    `;
    listGroup.insertBefore(listGroupItem, element.parentElement.parentElement.nextSibling);
}
function updateFileName(element) {
    var listGroup = document.querySelector(".list-group");
    var fileName = document.querySelector("#fileName").value;
    //check if the file name is empty or already exists
    if(checkEmpty(fileName) || checkAlreadyExists(fileName)){
        return;
    }
    //send old file name and new file name and project name to server
console.log(element.parentElement.previousElementSibling.innerText.toString().trim());

    var projectName = document.querySelector("#projectName").innerText.toString().trim();
    var url = `/user/project/updateFile?projectname=${projectName}&oldfilename=${element.parentElement.previousElementSibling.innerText.toString().trim()}&newfilename=${fileName}`;
    fetch(url).then(function(response) {
        return response.text();
    }
    ).then(function(data) {
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
    })
}
function getFile(element) {
    var fileName = element.innerText.toString().trim();
    var projectName = document.querySelector("#projectName").innerText.toString().trim();
    var url = `/user/project/getFile?projectname=${projectName}&filename=${fileName}`;
    //fetch file content from server and display it in the text area
    fetch(url).then(function(response) {
        return response.text();
    }
    ).then(function(data) {
      //set value inside the monaco editor
      var editor = monaco.editor.getModels()[0];
      editor.setValue(data);
    });
}
