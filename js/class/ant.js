class Ant {
    constructor(x, y) {
        this.acceleration = createVector(0, 0);
        this.velocity = p5.Vector.random2D();
        this.position = createVector(x, y);
        this.maxspeed = random(1.5, 2);
        this.maxforce = 0.3;
        this.perceptionRadius = 150;
        this.r = 7;
        this.maxPheromone = 100;
        this.pheromoneCount = this.maxPheromone;
        this.status = {
            producingPheromones: true,
            hasFood: false
        }
        this.viewCone = radians(75); 

    }

    run() {
        this.borders();
        this.activity(foods, paths);
        this.update();
        this.render();
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    activity(foods, paths) {
        if (this.status.producingPheromones && frameCount % 45 == 0) {
            this.status.hasFood ?
                paths.toFood.insert(new Point(new Path(this.position, 'TOFOOD'))) :
                paths.toHome.insert(new Point(new Path(this.position, 'TOHOME')));
            this.pheromoneCount--;
        }

        if (!this.pheromoneCount) {
            this.disablePheromones();
        }

        if (this.status.hasFood) {
            let followPathHome = this.followPath(paths.toHome).mult(0.5);
            let foundHome = this.followClosest(antHills, 250).mult(1);
            let foodCollision = this.collision(foods).mult(5)

            this.applyForce(foodCollision);
            this.applyForce(followPathHome);
            this.applyForce(foundHome);
        } else {
            let followPathFood = this.followPath(paths.toFood).mult(0.4);
            let foundFood = this.followClosest(foods).mult(1);
            this.applyForce(foundFood);
            this.applyForce(followPathFood);
        }

        let search = this.search().mult(0.4);
        this.applyForce(search);

        let hillCollision = this.collision(antHills, 10).mult(5)
        this.applyForce(hillCollision);
        
        let antCollision = this.collision(antsTree).mult(0.7)
        this.applyForce(antCollision);
    }

    disablePheromones() {
        this.status.producingPheromones = false;
        this.pheromoneCount = this.maxPheromone;
    }
    enablePheromones() {
        this.status.producingPheromones = true;
        this.pheromoneCount = this.maxPheromone;
    }

    search() {
        let sum = createVector(0, 0);

        let newDir = p5.Vector.fromAngle(this.velocity.heading() + random(-0.25, 0.25));

        sum
            .add(newDir)
            .div(1)
            .normalize()
            .mult(this.maxspeed)

        let steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    }

    followClosest(items, distanceTo = this.perceptionRadius) {
        let sum = createVector(0, 0);

        let closest = {
            distance: distanceTo,
            position: null
        };

        rectMode(CENTER);
        let range = new Rectangle(this.position.x, this.position.y, distanceTo, distanceTo);
        let points = items.query(range);

        for (let p of points) {
            let d = p5.Vector.dist(this.position, p.item.position);
            if (d < closest.distance) {
                closest.distance = d;
                closest.position = p.item.position;
            }
        }

        sum.add(closest.position);

        if (closest.position) {
            return this.seek(sum);
        } else {
            return createVector(0, 0);
        }
    }

    followPath(path) {
        let sum = createVector(0, 0);
        let dist = this.perceptionRadius;
        let count = 0;

        rectMode(CENTER);
        let range = new Rectangle(this.position.x, this.position.y, dist, dist);
        let points = path.query(range);

        for (let p of points) {
            let d = p5.Vector.dist(this.position, p.item.position);

            if (d < 20) {
                sum.add(p.item.position);
                count++;
            }

            if (d < dist && d > 20) {
                let vectorToPoint = createVector(p.item.position.x - this.position.x, p.item.position.y - this.position.y);
                let angleBetween = this.velocity.angleBetween(vectorToPoint);

                if (angleBetween > -this.viewCone && angleBetween < this.viewCone) {
                    sum.add(p.item.position)
                    count++;
                    //fill('red');
                    //ellipse(p.item.position.x, p.item.position.y, 5, 5);
                }
            }
        }

        if (count) {
            sum.div(count);
            //line(this.position.x, this.position.y, sum.x, sum.y);
            return this.seek(sum);
        } else {
            return sum;
        }
    }

    collision(items, desiredSeparation = this.r) {
        let steer = createVector(0, 0);
        let count = 0;

        rectMode(CENTER);
        let range = new Rectangle(this.position.x, this.position.y, desiredSeparation, desiredSeparation);

        let points = items.query(range);

        for (let p of points) {
            let diff = p5.Vector.sub(this.position, p.item.position);
            diff.normalize().div(desiredSeparation);
            steer.add(diff);
            count++;
        }

        if (count > 0) {
            steer.div(count);
        }

        if (steer.mag() > 0) {
            steer
                .normalize()
                .mult(this.maxspeed)
                .sub(this.velocity)
                .limit(this.maxforce)
        }

        return steer;
    }

    seek(target) {
        let desired = p5.Vector
            .sub(target, this.position)
            .normalize()
            .mult(this.maxspeed)


        let steer = p5.Vector
            .sub(desired, this.velocity)
            .limit(this.maxforce);

        return steer;
    }

    update() {
        this.velocity
            .add(this.acceleration)
            .limit(this.maxspeed);

        this.position
            .add(this.velocity);

        this.acceleration
            .mult(0);
    }

    borders() {
        let offscreen = 4;
        if (this.position.x < -offscreen) {
            //LEFT
            this.position.x = width + offscreen;
            // let n = createVector(30, 0);
            // let r = this.velocity.copy();
            // r.reflect(n);
            // this.velocity = r
        }
        if (this.position.y < -offscreen) {
            //UP
            this.position.y = height + offscreen;
            // let n = createVector(0, -30);
            // let r = this.velocity.copy();
            // r.reflect(n);
            // this.velocity = r
        }
        if (this.position.x > width + offscreen) {
            //RIGHT
            this.position.x = -offscreen;
            // let n = createVector(-30, 0);
            // let r = this.velocity.copy();
            // r.reflect(n);
            // this.velocity = r
        }
        if (this.position.y > height + offscreen) {
            //DOWN
            this.position.y = -offscreen;
            // let n = createVector(0, 30);
            // let r = this.velocity.copy();
            // r.reflect(n);
            // this.velocity = r
        }
    }

    render() {
        angleMode(RADIANS);

        fill(127, 127);
        stroke(200);
        push();

        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + radians(-90));

        if (this.status.hasFood) {
            //push()
            fill(0, 255, 0);
            //stroke(200);
            //ellipse(0, 15, 10, 10);
            //pop();
        }


        ellipse(0, 0, 2, 4)
        /*
        //Thorax
        ellipse(0, 0, 3, 7);
       
        //Abdomen
        ellipse(0, -7, 7, 8);

        //Legs
        line(2, 3, 6, 7)
        line(-2, 3, -6, 7)

        line(2, 0, 7, 1)
        line(-2, 0, -7, 1)

        line(2, -3, 6, -6)
        line(-2, -3, -6, -6)

        //Head
        ellipse(0, 7, 6, 6);
        line(3, 9, 5, 9)
        line(-3, 9, -5, 9)
        line(5, 9, 4, 15)
        line(-5, 9, -4, 15)
        */

        pop();

    }
}