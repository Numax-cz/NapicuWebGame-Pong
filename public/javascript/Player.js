class Player {
    static MoveSpeed = 0.65;
    static heigth = 210;
    static width = 10;
    constructor(x) {
        this.y = okno.lp / 2 - Player.heigth / 2;
        this.x = x;
        this.speed = 0;
    }
    Render() {
        ctx.beginPath();
        ctx.fillStyle = "#ecf0f1"
        ctx.fillRect(this.x, this.y, Player.width, Player.heigth);
        ctx.fill();
        this.Move();
        this.CollisionBall();
        this.Collision();



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
    Collision() {
        if (this.y < 0) {
            this.speed = 0;
            this.y = 0;
        }
        if ((this.y + Player.heigth) > okno.lp) {
            this.speed = 0;
            this.y = (okno.lp - Player.heigth);
        }
    }
    CollisionBall() {
        if ((Ball.velX - Ball.Size) <= (this.x + Player.width) && (Ball.velX + Ball.Size) >= (this.x - Player.width)) {
            if ((Ball.velY + Ball.Size) >= this.y && (Ball.velY - Ball.Size) <= (this.y + Player.heigth)) {
                Ball.SpeedX = -(Ball.SpeedX);
                Ball.SpeedY = -(Ball.SpeedY);
            }
        }
    }
}



