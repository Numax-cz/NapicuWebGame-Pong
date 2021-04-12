




class Player {
    static heigth;
    static width;

    static Player1X;
    static Player1Y;

    static Player2X;
    static Player2Y;


    static Render() {
        Player.Get();
        ctx.beginPath();
        ctx.fillStyle = "#ecf0f1"
        ctx.fillRect(Player.Player1X, Player.Player1Y, Player.width, Player.heigth);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#ecf0f1"
        ctx.fillRect(Player.Player2X, Player.Player2Y, Player.width, Player.heigth);
        ctx.fill();
    }

    static Get() {
        socket.on("PlayerMove", data => {
            Player.heigth = data.heigth;
            Player.width = data.width;
            Player.Player1X = data.x;
            Player.Player1Y = data.y;
            Player.Player2X = data.x2;
            Player.Player2Y = data.y2;
        });
    }


}