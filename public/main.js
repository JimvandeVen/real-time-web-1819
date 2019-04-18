const socket = io();
// const form = document.querySelector("#form");
// const message = document.querySelector("#m");
// const nameForm = document.querySelector("#nameForm");

// if (form) {
//     form.addEventListener("submit", e => {
//         e.preventDefault();
//         socket.emit("chat message", {
//             message: m.value
//         });
//         m.value = "";
//         return false;
//     });
// }

// if (nameForm) {
//     nameForm.addEventListener("submit", e => {
//         e.preventDefault();
//         socket.emit("setUserName", nickname.value);
//         nickname.value = "";
//         nameForm.remove()
//         return false;
//     });
// }

// socket.on('newName', function (nickname) {
//     console.log("new username for user: " + nickname);

//     document.querySelector("#messages").innerHTML += "<li>" + nickname.toUpperCase() + " just joined the chatroom" + " </li>";
// });

// socket.on("chat message", function (msg) {
//     console.log(msg);

//     document.querySelector("#messages").innerHTML += "<li>" + msg.username.toUpperCase() + ":" + msg.message + " </li>";
// });

socket.on("tweet", function (tweets) {

    // document.querySelector(".positive").innerHTML = "<h2>Most Positive Tweet</h2>" + '<div class="tweet"> <h3>' + tweets[tweets.length - 1].author + '<h3>' + "<p>" + tweets[tweets.length - 1].body + "</p> </div>";
    document.querySelector(".positive").innerHTML = `<h2>Most Positive Tweet</h2><div class="tweet"><h3>${tweets[tweets.length - 1].author}</h3><img class="avatar" src="${tweets[tweets.length - 1].avatar}"></img><p>${tweets[tweets.length - 1].body}</p></div>`;
    document.querySelector(".negative").innerHTML = `<h2>Most Negative Tweet</h2><div class="tweet"><h3>${tweets[0].author}</h3><img class="avatar" src="${tweets[0].avatar}"></img><p>${tweets[0].body}</p></div>`;

    // if (tweets.length < 10) {

    // document.querySelector(".feed").innerHTML = tweets.foreach(tweet => {
    //     `<div class="tweet"><h3>${tweet.author}<h3><p>${tweets.body}</p></div>`
    // })


    // console.log(tweets)
})

socket.on("autoFeed", function (tweets) {
    console.log(tweets)
    tweets.forEach(tweet => {
        document.querySelector(".feed").innerHTML += `<div class="tweet"><h3>${tweet.author}</h3><img class="avatar" src="${tweet.avatar}"></img><p>${tweet.body}</p></div>`
    });

})

