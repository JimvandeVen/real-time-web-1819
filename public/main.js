const socket = io();
const form = document.querySelector("#form");
const message = document.querySelector("#m");
const nameForm = document.querySelector("#nameForm");

if (form) {
    form.addEventListener("submit", e => {
        e.preventDefault();
        socket.emit("chat message", {
            message: m.value
        });
        m.value = "";
        return false;
    });
}

if (nameForm) {
    nameForm.addEventListener("submit", e => {
        e.preventDefault();
        socket.emit("setUserName", nickname.value);
        nickname.value = "";
        nameForm.remove()
        return false;
    });
}

socket.on('newName', function (nickname) {
    console.log("new username for user: " + nickname);

    document.querySelector("#messages").innerHTML += "<li>" + nickname.toUpperCase() + " just joined the chatroom" + " </li>";
});

socket.on("chat message", function (msg) {
    console.log(msg);

    document.querySelector("#messages").innerHTML += "<li>" + msg.username.toUpperCase() + ":" + msg.message + " </li>";
});

socket.on("tweet", function (tweet) {

    document.querySelector("#messages").innerHTML += "<li>" + tweet.author + ":" + tweet.body + " </li>";
    console.log(tweet)
})
