class AntHill {
    constructor(x = random(width), y = random(height)) {
        this.position = createVector(x, y);
        this.population = [];
        this.pheromones = {
            toHome: [],
            toFood: []
        };

        this.health = 100;

        this.colour = color(random(255), random(255), random(255))
    }


    run(food) {

        if (frameCount % 15 === 0) {
            if (this.population.length < 400) {
                this.addAnt();
            }
        }

        if (frameCount % 120 === 0) {
            this.health--;
        }

        // if (this.population.length < 150) this.addAnt()

        this.pheromones.toFood.forEach(e => e.run())
        this.pheromones.toHome.forEach(e => e.run())

        this.population.forEach(e => e.run(this.population, this.pheromones, food, this))

        this.removeDeadPheromones();
        this.removeDeadAnts();
        this.render();
    }

    removeDeadPheromones() {

        const pheromoneLimit = 2000;
        this.pheromones = {
            toHome: this.pheromones.toHome.filter((e, i) => e.remove === false && i > this.pheromones.toHome.length - pheromoneLimit),
            toFood: this.pheromones.toFood.filter((e, i) => e.remove === false && i > this.pheromones.toFood.length - pheromoneLimit),
        }
    }
    removeDeadAnts() {
        this.population = this.population.filter(e => e.status.alive === true)
    }

    addAnt(num = 1) {
        for (let i = 0; i < num; i++) {
            this.population.push(new Ant(this.position.x, this.position.y, this.colour));
        }
    }

    render() {
        push()
        fill(0);
        stroke(0);
        translate(this.position.x, this.position.y);
        circle(0, 0, 16)
        fill(255);
        text(this.population.length, 0, 0)
        text(this.health, 0, 15)
        pop()
    }
}
