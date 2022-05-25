class Path {
    constructor(pos, type) {
        this.position = createVector(pos.x, pos.y);
        this.time = 20;
        this.lifeSpan = frameCount + (60 * this.time);
        this.isGone = false;
        this.type = type;
    }
    run() {
        if (frameCount > this.lifeSpan) this.isGone = true;
        //this.render();
    }

    render() {
        //push();
        
        if (this.type === 'TOHOME') {
            fill(135, 135, 255, 0.25);
        }
        if (this.type === 'TOFOOD') {
            fill(135, 255, 135, 0.25);
        }
        
        point(this.position.x, this.position.y)
        //pop();
    }
}