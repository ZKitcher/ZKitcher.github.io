class Checkpoint {
    constructor(x, y) {
        this.position = createVector(x, y);
    }

    run() {
        this.render();
    }

    render() {
        push()
        stroke(255)
        ellipse(this.position.x, this.position.y, 5, 5)
        pop()
    }
}