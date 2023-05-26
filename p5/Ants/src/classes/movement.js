class Motion {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector(0, 0);

        this.maxspeed = random(1.5, 2);
        this.maxforce = 0.3;

        this.viewCone = radians(75);

        this.perceptionRadius = 100;

        this.r = 8;
    }

    updateMotion() {
        this.borders();

        this.velocity
            .add(this.acceleration)
            .limit(this.maxspeed);

        this.position
            .add(this.velocity);

        this.acceleration
            .mult(0);
    }

    seek(vectorTarget) {
        let desired = p5.Vector
            .sub(vectorTarget, this.position)
            .normalize()
            .mult(this.maxspeed)

        let steer = p5.Vector
            .sub(desired, this.velocity)
            .limit(this.maxforce);

        return steer;
    }

    collision(points = [], desiredSeparation = this.r) {
        let steer = createVector(0, 0);
        let count = 0;

        for (let i = 0; i < points.length; i++) {
            let diff = p5.Vector.sub(this.position, points[i].position);
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

    followClosest(points = [], distanceTo = this.perceptionRadius) {
        let sum = createVector(0, 0);

        let closest = {
            distance: distanceTo,
            position: null,
            object: null
        };

        for (let i = 0; i < points.length; i++) {
            let d = p5.Vector.dist(this.position, points[i].position);
            if (d < closest.distance) {
                closest.distance = d;
                closest.position = points[i].position;
                closest.object = points[i]
            }
        }

        sum.add(closest.position);

        return {
            force: closest.position ? this.seek(sum) : createVector(0, 0),
            distanceTo: closest.distance,
            object: closest.object
        };

    }

    followPath(points = []) {
        let sum = createVector(0, 0);
        let dist = this.perceptionRadius;
        let count = 0;

        for (let p of points) {
            let d = p5.Vector.dist(this.position, p.position);

            if (d < dist && d > 20) {
                let vectorToPoint = createVector(p.position.x - this.position.x, p.position.y - this.position.y);
                let angleBetween = this.velocity.angleBetween(vectorToPoint);

                if (angleBetween > -this.viewCone && angleBetween < this.viewCone) {
                    sum.add(p.position)
                    count++;
                    // fill('red');
                    // ellipse(p.position.x, p.position.y, 5, 5);
                }
            }
        }

        if (count) {
            sum.div(count);
            // line(this.position.x, this.position.y, sum.x, sum.y);
            return this.seek(sum);
        } else {
            return sum;
        }
    }

    applyForce(force) {
        this.acceleration.add(force);
    }


    borders() {
        let offscreen = 4;
        if (this.position.x < -offscreen) {
            //LEFT
            this.position.x = width + offscreen;
        }
        if (this.position.y < -offscreen) {
            //UP
            this.position.y = height + offscreen;
        }
        if (this.position.x > width + offscreen) {
            //RIGHT
            this.position.x = -offscreen;
        }
        if (this.position.y > height + offscreen) {
            //DOWN
            this.position.y = -offscreen;
        }
    }

    render() {
        push()
        strokeWeight(16);
        stroke(255);
        point(this.position.x, this.position.y);
        pop()
    }
}
