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



// var Players = []
var Players = new Map()




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
        socket.Player = "Hrac1";
        dataSocket.Player = "Hrac2";
        dataSocket.ActivityRoom = roomName;
        dataSocket.join(roomName);
        io.to(roomName).emit("Ready");

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
    var Hrac;
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
        static BallColor = "#ecf0f1";
        static Render() {
            this.PlayerCollision();
            this.Collision();
            this.Move();
        }

        static Move() {
            this.velX -= this.SpeedX;
            this.velY += this.SpeedY;
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

        static PlayerCollision() {

            if ((this.velX - this.Size) <= (Hrac.x + Player.width)) {
                if ((this.velX + this.Size) >= (Hrac.x - Player.heigth)) {
                    this.Reverse();
                }
            }
        }

        static Reverse() {
            this.SpeedY = - (this.SpeedY);
            this.SpeedX = - (this.SpeedX);
        }

        static Random() {
            return Math.round(Math.random()) ? 4 : -4;
        }

        static Start() {
            this.velX = this.x;
            this.velY = this.y;
            this.SpeedX = this.Random();
            this.SpeedY = this.Random();
        }
    }


    class Player {
        static MoveSpeed = 0.65;
        static heigth = 210;
        static width = 10;
        constructor(x) {
            this.y = okno.lp / 2 - Player.heigth / 2;
            this.x = x;
            this.speed = 0;
        }

        Move() {
            this.y += this.speed;
            this.speed *= 0.92;
        }

        MoveUp() {
            this.speed -= Player.MoveSpeed;
        }
        MoveDown() {
            this.speed += Player.MoveSpeed;
        }

    }




    function BallPush() {
        Ball.Render();
        io.to(roomName).emit("BallMove", { velX: Ball.velX, velY: Ball.velY, size: Ball.Size, color: Ball.BallColor });
        PlayerPush();
    }

    socket.on("PingStart", () => {
        const ZoneX = (socket.Player == "Hrac1") ? 100 : (okno.ln - 100);
        Hrac = new Player(ZoneX);
        setInterval(BallPush, 33);
        console.log("reg");
        Players.set(socket.id, Hrac);
        io.to(roomName).emit("START");
    });




    socket.on("PlayerUpdate", () => {
        Hrac.Move();
    });

    socket.on("PlayerMoveUp", () => {
        Hrac.MoveUp();
    });

    socket.on("PlayerMoveDown", () => {
        Hrac.MoveDown();
    });

    function PlayerPush() {
        let PlayersID = io.sockets.adapter.rooms.get(socket.ActivityRoom) //Todo varování když je více 
        const PlayersArray = Array.from(PlayersID);
        if (PlayersArray.length == 2) {
            let Hrac1ID = PlayersArray[0]; //100
            let Hrac2ID = PlayersArray[1]; //1700
            let dataSocket1 = io.sockets.sockets.get(Hrac1ID); //socket.Player: Hrac1
            let dataSocket2 = io.sockets.sockets.get(Hrac2ID); //socket.Player: Hrac2
            let Hrac1 = Players.get(Hrac1ID);
            let Hrac2 = Players.get(Hrac2ID);
            io.to(roomName).emit("PlayerMove", { x: Hrac1.x, y: Hrac1.y, x2: Hrac2.x, y2: Hrac2.y, heigth: Player.heigth, width: Player.width });
        }
    }












    socket.on("disconnect", () => {
        Players.delete(socket.id);
    });
});





