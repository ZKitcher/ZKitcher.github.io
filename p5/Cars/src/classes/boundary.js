class Boundary {
    constructor(x1, y1, x2, y2) {
        this.a = createVector(x1, y1);
        this.b = createVector(x2, y2);
        this.position = createVector((x1 + x2) / 2, (y1 + y2) / 2)
    }

    run() {
        this.render();
    }

    flash() {
        stroke(255, 0, 0)
        line(this.a.x, this.a.y, this.b.x, this.b.y)
    }

    render() {
        push()
        stroke(255)
        line(this.a.x, this.a.y, this.b.x, this.b.y)
        pop()
    }
}