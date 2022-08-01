class QuadPoint {
    constructor(item) {
        this.item = item;
        this.x = item.position.x;
        this.y = item.position.y;
    }
}

class BoundingBox {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return (point.x >= this.x - this.w &&
            point.x < this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y < this.y + this.h);
    }

    intersects(range) {
        return !(
            range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h
        );
    }

    show() {
        stroke(255);
        noFill();
        strokeWeight(1);
        rectMode(CENTER);
    }
}

class QuadTree {
    constructor(boundary, n, nested = 1) {
        this.boundary = boundary;
        this.capacity = n;
        this.points = [];
        this.divided = false;
        this.nested = nested;
        this.maxNesting = Infinity;
    }

    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;
        let ne = new BoundingBox(x + w / 2, y - h / 2, w / 2, h / 2);
        this.northeast = new QuadTree(ne, this.capacity, this.nested + 1);
        let nw = new BoundingBox(x - w / 2, y - h / 2, w / 2, h / 2);
        this.northwest = new QuadTree(nw, this.capacity, this.nested + 1);
        let se = new BoundingBox(x + w / 2, y + h / 2, w / 2, h / 2);
        this.southeast = new QuadTree(se, this.capacity, this.nested + 1);
        let sw = new BoundingBox(x - w / 2, y + h / 2, w / 2, h / 2);
        this.southwest = new QuadTree(sw, this.capacity, this.nested + 1);
        this.divided = true;
    }

    insert(point) {
        if (point.position === undefined) {
            console.error('Point missing .position')
            return false;
        }
        this.addToTree(new QuadPoint(point))
    }

    addToTree(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        } else {
            if (this.nested > this.maxNesting) return true;

            if (!this.divided) this.subdivide();

            if (this.northeast.addToTree(point)) {
                return true;
            } else if (this.northwest.addToTree(point)) {
                return true;
            } else if (this.southeast.addToTree(point)) {
                return true;
            } else if (this.southwest.addToTree(point)) {
                return true;
            }
        }
    }

    query(range) {
        if (!(range instanceof BoundingBox)) {
            console.error('"BoundingBox" missing')
            return false;
        }
        return this.getItemsInArea(range) || [];
    }

    getItemsInArea(range, found) {
        if (!found) {
            found = [];
        }
        if (!this.boundary.intersects(range)) {
            return;
        } else {
            for (let i = 0; i < this.points.length; i++) {
                if (range.contains(this.points[i])) {
                    found.push(this.points[i].item);
                }
            }
            if (this.divided) {
                this.northwest.getItemsInArea(range, found);
                this.northeast.getItemsInArea(range, found);
                this.southwest.getItemsInArea(range, found);
                this.southeast.getItemsInArea(range, found);
            }
        }
        return found;
    }

    getEachItem(found) {
        if (!found) {
            found = [];
        }
        for (let i = 0; i < this.points.length; i++) {
            found.push(this.points[i].item);
        }
        if (this.divided) {
            this.northwest.getEachItem(found);
            this.northeast.getEachItem(found);
            this.southwest.getEachItem(found);
            this.southeast.getEachItem(found);
        }
        return found;
    }

    runEachItem(...items) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].item.run(...items);
        }
        if (this.divided) {
            this.northwest.runEachItem(...items);
            this.northeast.runEachItem(...items);
            this.southwest.runEachItem(...items);
            this.southeast.runEachItem(...items);
        }
    }

    filterTree(parameter, condition) {
        let filteredTemp = this.points.filter(e => e.item[parameter] !== condition);

        if (this.divided) {
            this.northwest.filterTree(parameter, condition);
            this.northeast.filterTree(parameter, condition);
            this.southwest.filterTree(parameter, condition);
            this.southeast.filterTree(parameter, condition);
        }

        if (filteredTemp.length === this.points.length) return this;

        this.points = filteredTemp;
        const tempItems = this.getEachItem()
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;

        let newTree = new QuadTree(new BoundingBox(x, y, w, h), this.capacity);
        tempItems.forEach(e => newTree.insert(e))

        return newTree;
    }


    show() {
        push()
        stroke(255);
        noFill();
        strokeWeight(1);
        rectMode(CENTER);
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);

        if (this.divided) {
            this.northeast.show();
            this.northwest.show();
            this.southeast.show();
            this.southwest.show();
        }
        pop()
    }
}
