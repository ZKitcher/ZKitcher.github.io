class Path {
    constructor(pos, type, strength = 1) {
        this.position = createVector(pos.x, pos.y);
        this.time = 20;
        this.lifeSpan = frameCount + (60 * this.time);
        this.isGone = false;
        this.type = type;
        this.strength = strength;
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
            ellipse(this.position.x, this.position.y, this.strength, this.strength);
        }
        
        //point(this.position.x, this.position.y)
        //ellipse(this.position.x, this.position.y, this.strength, this.strength);

        //pop();
    }
}