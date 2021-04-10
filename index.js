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
    socket.ActivityRoom = roomName; //Nevím nevím
    socket.Player = "player_1"
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
    // io.to(data.id).emit("requestAccept", "Kokot příjmul tu mrdku")

    socket.on("accept", data => {
        const dataSocket = io.sockets.sockets.get(data.id);
        dataSocket.leave(dataSocket.ActivityRoom);
        socket.Player = "player_1";
        dataSocket.Player = "player_2";
        dataSocket.ActivityRoom = roomName;
        dataSocket.join(roomName);
        io.to(roomName).emit("Ready");
        setInterval(BallPush, 33);
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


    // InGame    
    const okno = {
        lp: 1000,
        ln: 1800
    }

    class Ball {
        static x = okno.ln / 2;
        static y = okno.lp / 2;
    
        static Size = 12;
        static velX = this.x;
        static velY = this.y;
        static SpeedX = this.Random();
        static SpeedY = this.Random();

        static Render() {
            this.Collision();
            this.Move();
        }

        static Move() {
            this.velX -= this.SpeedX;
            this.velY += 0;
        }

        static Collision() {
            if ((this.velX + this.Size) >= okno.ln) {
                this.Start(); //Player? Game Over - -
            }
            if ((this.velX - this.Size) <= 0) {
                this.Start(); //Player? Game Over - -
            }
            if ((this.velY + this.Size) >= okno.lp) {
                this.SpeedY = -(this.SpeedY);
            }
            if ((this.velY - this.Size) <= 0) {
                this.SpeedY = -(this.SpeedY);
            }
        }
        
        static Reverse() {
            this.SpeedY = - (this.SpeedY);
        }
        
        static Random() {
            return Math.round(Math.random()) ? 7 : -7;
        }

        static Start() {
            this.velX = this.x;
            this.velY = this.y;
            this.SpeedX = this.Random();
            this.SpeedY = this.Random();
        }
    }

    
    function BallPush() {
        Ball.Render();
        io.to(roomName).emit("BallMove", { x: Ball.velX, y: Ball.velY });
    }

















    socket.on("disconnect", () => {
        //TODO Nazdar 
    });
});





