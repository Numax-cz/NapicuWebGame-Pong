

class Ball {
    static velX;
    static velY;
    static size;
    static color;
    static Render() {
        Ball.get();
        Ball.MainRender();
    }
    static get() {
        socket.on("BallMove", data => {
            Ball.velX = data.velX;
            Ball.velY = data.velY;
            Ball.size = data.size;
            Ball.color = data.color;
        })
    }
    static MainRender() {
        ctx.beginPath();
        ctx.fillStyle = Ball.color;
        ctx.arc(Ball.velX, Ball.velY, Ball.size, 0, 2 * Math.PI);
        ctx.fill();
    }



}