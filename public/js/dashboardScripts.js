document.querySelector("#createProject").addEventListener("submit", function(e) {
    e.preventDefault();
    var projectName = document.querySelector("#projectName").value.toString().trim();
    if (projectExists(projectName)) {
        document.querySelector("#projectError").classList.remove("d-none");
        document.querySelector("#projectError").classList.add("d-block");
        document.querySelector("#projectError").innerText = "Project already exists";
        return
    }
    fetch("/user/project/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            projectName: projectName
        })

    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        if (data.success) {
            window.location.href = "/user/dashboard";
        } else {
            document.querySelector("#projectError").classList.remove("d-none");
            document.querySelector("#projectError").classList.remove("d-block");
            document.querySelector("#projectError").innerText = data.message;
        }
    }).catch(function(err) {
        console.log(err);
    });
})

function projectExists(projectName) {
    var projects = document.querySelectorAll("#projectTitle")
    for (var i = 0; i < projects.length; i++) {
        if (projects[i].innerText.toString().trim() === projectName) {
            return true
        }
    }
    return false
}

document.querySelector("#createProject").addEventListener("hidden.bs.modal", function(e) {
    document.querySelector("#projectName").value = "";
    if (document.querySelector("#projectError").classList.contains("d-block")) {
        document.querySelector("#projectError").classList.remove("d-block");
        document.querySelector("#projectError").classList.add("d-none");
    }
})

document.querySelector("#joinRoom").addEventListener("hidden.bs.modal", function(e) {
    document.querySelector("#roomID").value = "";
    if (document.querySelector("#roomError").classList.contains("d-block")) {
        document.querySelector("#roomError").classList.remove("d-block");
        document.querySelector("#roomError").classList.add("d-none");
    }
})

document.querySelector("#joinRoom").addEventListener("submit", function(e) {
    e.preventDefault();
    var roomID = document.querySelector("#roomID").value.toString().trim();
    console.log(roomID);
    fetch("/user/project/joinRoom?roomID=" + roomID).then(function(response) {
        return response;
    }).then(function(data) {
        if (data.status === 200) {
            window.location.href = data.url;
        } else {
            document.querySelector("#roomError").classList.remove("d-none");
            document.querySelector("#roomError").classList.add("d-block");
            document.querySelector("#roomError").innerText = "Room does not exist";
        }
    }).catch(function(err) {
        console.log(err);
    });
})