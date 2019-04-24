const socket = io.connect(window.location.origin);
const sentimentForm = document.querySelector(".sentimentForm");

if (sentimentForm) {
    sentimentForm.addEventListener("submit", e => {
        e.preventDefault();
        let sentiment = new FormData(sentimentForm)
        let output = ""
        for (const entry of sentiment) {
            output = entry[1];
        };
        console.log(output)
        // socket.emit("setSentiment", output);
        if (output == "pro") {
            socket.emit("joinPro")
            addTitle(output)
            changeBackground(output)
            // socket.join('proBrexit room');
        } else {
            socket.emit("joinCon")
            addTitle(output)
            changeBackground(output)
            // socket.join('conBrexit room');
        }
        sentimentForm.remove()
        // return false;
    });
}

function addTitle(sentiment) {
    let topTweetTitle = document.querySelector("#topTweetTitle")
    if (sentiment == "pro") {
        topTweetTitle.innerHTML = "What do people against Brexit think about tweets rooting for Brexit?"
    } else {
        topTweetTitle.innerHTML = "What do the Brexiteers think about tweets against Brexit?"
    }
}
function changeBackground(sentiment) {
    let body = document.querySelector("body")
    if (sentiment == "pro") {
        body.style.backgroundImage = 'url(https://www.embassyoflibya.eu/wp-content/uploads/2015/04/flag_EU-A.jpg)';
    } else {
        body.style.backgroundImage = 'url(https://i.pinimg.com/originals/01/9c/6a/019c6ae6c2e39f2de7f292e20a5cc74e.jpg)'
            ;
    }
}
// socket.on('newName', function (nickname) {
//     console.log("new username for user: " + nickname);

//     document.querySelector("#messages").innerHTML += "<li>" + nickname.toUpperCase() + " just joined the chatroom" + " </li>";
// });

// socket.on("chat message", function (msg) {
//     console.log(msg);

//     document.querySelector("#messages").innerHTML += "<li>" + msg.username.toUpperCase() + ":" + msg.message + " </li>";
// });

socket.on("likes", function (tweets) {

    document.querySelector(".positive").innerHTML = `<h2>Most Positive Tweet</h2><div class="tweet"><h3>${tweets[tweets.length - 1].author}</h3><img class="avatar" src="${tweets[tweets.length - 1].avatar}"></img><p>${tweets[tweets.length - 1].body}</p></div>`;

    document.querySelector(".negative").innerHTML = `<h2>Most Negative Tweet</h2><div class="tweet"><h3>${tweets[0].author}</h3><img class="avatar" src="${tweets[0].avatar}"></img><p>${tweets[0].body}</p></div>`;
})

socket.on("autoFeed", function (tweet) {
    console.log(tweet)
    document.querySelector(".feed").innerHTML +=
        `<div class="tweet">
            <h3>${tweet.author}</h3>
            <form class="likeForm">
                <input type="radio" data-id="${tweet.twid}" id="like:${tweet.twid}" name="likes" value="like">
                <label for="like:${tweet.twid}">Like</label>
                <input type="radio" data-id="${tweet.twid}" id="dislike:${tweet.twid}" name="likes" value="dislike">
                <label for="dislike:${tweet.twid}">Dislike</label>
            </form>
            <img class="avatar" src="${tweet.avatar}"></img>
            <p>${tweet.body}</p>
        </div>`

    const likeForms = document.querySelectorAll(".likeForm")
    likeForms.forEach(likeForm => {
        likeForm.addEventListener("change", function (e) {
            likeHandler(e)
        })
    })
})

function likeHandler(e) {
    let like = {
        likedId: e.srcElement.dataset.id,
        value: e.srcElement.value
    }


    socket.emit("likeHandler", like)
    console.log(like);

}

