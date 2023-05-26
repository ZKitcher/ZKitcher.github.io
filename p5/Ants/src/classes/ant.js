class Ant extends Motion {
    constructor(x, y, colour) {
        super(x, y)

        this.viewCone = radians(75);

        this.id = 'ant-' + Math.random();

        this.status = {
            alive: true,
            producingPheromones: true,
            hasFood: false
        }

        this.colour = colour;

        this.maxPheromone = 30;
        this.pheromoneCount = this.maxPheromone;

        this.lifetime = 120;
    }

    run(ants, pheromones, food, hill) {
        this.updateAnt(ants, pheromones, food, hill);
        this.render();
    }

    updateAnt(ants, pheromones, food, hill) {
        if (frameCount % 60 === 0) {
            this.lifetime--;
            if (this.lifetime < 1) {
                this.status.alive = false;
            }
        }

        this.updatePheromones(pheromones)

        const search = this.search();


        this.activity(ants, pheromones, food, hill)


        // Collisions with other Ants
        this.applyForce(
            this.collision(
                this.getObjectsInRadius(ants, this.r)
            ).mult(0.7)
        );

        this.updateMotion();
    }

    activity(ants, pheromones, food, hill) {
        if (this.status.hasFood) {

            // Collisions with Food
            this.applyForce(
                this.collision(
                    this.getObjectsInRadius(food, this.r * 2)
                ).mult(5)
            );

            // Ant follows home pheromone
            this.applyForce(
                this.followPath(
                    this.getObjectsInRadius(pheromones.toHome)
                ).mult(0.5)
            );


            // Ant move towards AntHill
            const hillForce = this.followClosest(
                this.getObjectsInRadius([hill])
            )
            this.applyForce(hillForce.force.mult(2));
            if (hillForce.distanceTo < this.r) {
                this.status.hasFood = false;
                this.enablePheromones();
                hill.health++;
            }

        } else {

            // Ant follows food pheromone
            this.applyForce(
                this.followPath(
                    this.getObjectsInRadius(pheromones.toFood)
                ).mult(0.5)
            );


            // Ant move towards Food
            const foodForce = this.followClosest(
                this.getObjectsInRadius(food)
            )
            this.applyForce(foodForce.force);
            if (foodForce.distanceTo < this.r) {
                foodForce.object.stockpile--;
                this.status.hasFood = true;
                this.enablePheromones()
            }
        }
    }

    updatePheromones(pheromones) {
        if (this.status.producingPheromones && frameCount % 45 === 0) {

            if (this.status.hasFood) {
                if (this.getObjectsInRadius(pheromones.toFood, this.r * 2).length > 10) {
                    return;
                }
                pheromones.toFood.push(new Pheromone(this.position, 'TOFOOD'))
            } else {
                if (this.getObjectsInRadius(pheromones.toHome, this.r * 2).length > 10) {
                    return;
                }
                pheromones.toHome.push(new Pheromone(this.position, 'TOHOME'))
            }

            this.pheromoneCount--;

            if (!this.pheromoneCount) {
                this.disablePheromones();
            }
        }
    }

    disablePheromones() {
        this.status.producingPheromones = false;
        this.pheromoneCount = this.maxPheromone;
    }

    enablePheromones(strength) {
        this.status.producingPheromones = true;
        this.pheromoneCount = this.maxPheromone;
    }

    getObjectsInRadius(list, range = this.perceptionRadius) {
        const res = [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const sight = range / 2;

            if (item.id === this.id) continue;
            if (
                item.position.x > this.position.x - sight &&
                item.position.x < this.position.x + sight &&

                item.position.y > this.position.y - sight &&
                item.position.y < this.position.y + sight
            ) {
                res.push(item)
            }
        }

        return res;
    }

    search() {
        let newDir = p5.Vector.fromAngle(this.velocity.heading() + random(-0.25, 0.25));
        let steer = p5.Vector.sub(newDir, this.velocity);
        steer.limit(this.maxforce);
        this.applyForce(steer);
    }

    render() {
        push()
        angleMode(RADIANS);
        fill(this.colour);
        if (this.status.hasFood) {
            // fill(0, 255, 0);
        }
        stroke(200);

        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + radians(-90));
        ellipse(0, 0, 2, 4)

        pop()
    }
}
