class AntHill {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.foodCount = 0;
    }

    run(ants, antHills) {
        this.update(ants, antHills)
        this.render();
    }

    update(ants, antHills) {
        for (let i = 0; i < ants.length; i++) {
            let ant = ants[i];

            rectMode(CENTER);
            let range = new Rectangle(ant.position.x, ant.position.y, 16, 16);
            let points = antHills.query(range);

            for (let p of points) {
                if (ant.status.hasFood) {
                    ant.status.hasFood = false;
                    this.foodCount++;
                    this.health++;
                    ant.velocity.mult(-1)
                }
                ant.enablePheromones(0);
            }
        }
        if(ants.length < 150) ants.push(new Ant(this.position.x, this.position.y))
    }

    render() {
        push()
        fill(30, 30, 30);
        stroke(200);
        ellipse(this.position.x, this.position.y, 20, 20);
        pop()
    }
}