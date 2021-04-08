require("dotenv").config();
const express = require("express");
const app = express();
const crypto = require('crypto');
const server = app.listen(process.env.PORT, () => {
    console.log("Aplikace běží na portu: " + process.env.PORT);
});
function randomString() {
    const size = 5;
    return crypto
        .randomBytes(size)
        .toString('hex')
        .slice(0, size)
}
app.use(express.urlencoded({ extended: false }));
const io = require("socket.io")(server);
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');



app.get("/local", (req, res) => {
    res.render("local");
});

app.get("/global", (req, res) => {
    res.render("global")
});

app.get("/", (req, res) => {
    UserName = "Anonymous";


    res.render("index");
});


io.on("connection", socket => {
    socket.username = "Anonymous"
    let roomName;
    do {
        roomName = randomString();
    } while (io.sockets.adapter.rooms.get(roomName));
    socket.join(roomName);
    socket.emit("id", { id: roomName });



    socket.on("request", data => {
        const clients = io.sockets.adapter.rooms.get(data);

        if (data !== roomName) {
            if (clients.size == 1) {
                for (const id of clients) {
                    // const username = io.sockets.sockets.get(id).username
                    io.to(id).emit("invite", { username: socket.username, id: socket.id });
                }
            } else if (clients.size == 2) {
                //uživatelé již hrajou
            } else {
                //TODO Error
            }
        }
    });

    socket.on("accept", data => {

        console.log(data.id + " " + socket.id);
        // const username = io.sockets.sockets.get(id).username

    });

    socket.on("deny", data => {

    });
    socket.on("setusername", data => {
        socket.username = data.username;
        socket.emit("getusername", socket.username);
    });


    socket.on("idcheck", data => {
        const clients = io.sockets.adapter.rooms.get(data);
        if (clients && data !== roomName) {
            socket.emit("idcheck", { id: true });
        } else {
            socket.emit("idcheck", { id: false });
        }







    });







    socket.on("disconnect", () => {
        //TODO Nazdar 
    });
});














app.post("/api/namechange", (req, res) => {
    res.json("AHoj")
});