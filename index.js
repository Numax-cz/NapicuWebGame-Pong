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
    socket.emit("getusername", socket.username);
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
        const dataSocket = io.sockets.sockets.get(data.id);
        // io.to(data.id).emit("requestAccept", "Kokot příjmul tu mrdku")



        dataSocket.join(roomName);
        console.log("ROOMKA:   " + roomName);

        console.log(io.sockets.adapter.rooms)


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





