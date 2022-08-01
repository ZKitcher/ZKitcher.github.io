class Wall {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.radius = 50;
    }

    run() {
        this.render();
    }

    render() {
        push();
        fill(10, 10, 10);
        stroke(10);
        ellipse(this.position.x, this.position.y, this.radius, this.radius);
        pop();
    }
}