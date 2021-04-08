class Ball {

    static x = okno.ln / 2;
    static y = okno.lp / 2;

    static Size = 12;
    static velX = this.x;
    static velY = this.y;
    static SpeedX = this.Random();
    static SpeedY = this.Random();

    static Render() {
        ctx.beginPath();
        ctx.fillStyle = "#ecf0f1";
        ctx.arc(this.velX, this.velY, this.Size, 0, 2 * Math.PI);
        ctx.fill();
        this.Collision();
        this.Move();
    }
    static Move() {
        this.velX -= this.SpeedX;
        this.velY += 0;
    }
    static Collision() {
        if ((this.velX + this.Size) >= okno.ln) {
            this.Start();
        }
        if ((this.velX - this.Size) <= 0) {
            this.Start();
        }

        if ((this.velY + this.Size) >= okno.lp) {
            this.SpeedY = -(this.SpeedY);
        }
        if ((this.velY - this.Size) <= 0) {
            this.SpeedY = -(this.SpeedY);
        }    
    }
    static Start() {
        this.velX = this.x;
        this.velY = this.y;
        this.SpeedX = this.Random();
        this.SpeedY = this.Random();
    }

    static Random() {
        return Math.round(Math.random()) ? 7 : -7;
    }
}