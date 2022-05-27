class Point {
    constructor(item) {
        this.item = item;
        this.x = item.position.x;
        this.y = item.position.y;
    }
}

class Rectangle {
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

        if (this.x < this.w / 2) {
            rect(this.x + width, this.y, this.w, this.h);
        }
        if (this.x > width - this.w / 2) {
            rect(this.x - width, this.y, this.w, this.h);
        }
        if (this.y < this.h / 2) {
            rect(this.x, this.y + height, this.w, this.h);
        }
        if (this.y > this.h / 2) {
            rect(this.x, this.y - height, this.w, this.h);
        }
        if (this.x < this.w / 2 && this.y < this.h / 2) {
            rect(this.x + width, this.y + height, this.w, this.h);
        }
        if (this.x > width - this.w / 2 && this.y > this.h / 2) {
            rect(this.x - width, this.y - height, this.w, this.h);
        }
        rect(this.x, this.y, this.w, this.h);
    }
}

class QuadTree {
    constructor(boundary, n, nested = 1) {
        this.boundary = boundary;
        this.capacity = n;
        this.points = [];
        this.divided = false;
        this.nested = nested;
        this.maxNesting = 4;
    }

    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;
        let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
        this.northeast = new QuadTree(ne, this.capacity, this.nested + 1);
        let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
        this.northwest = new QuadTree(nw, this.capacity, this.nested + 1);
        let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
        this.southeast = new QuadTree(se, this.capacity, this.nested + 1);
        let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
        this.southwest = new QuadTree(sw, this.capacity, this.nested + 1);
        this.divided = true;
    }

    insert(point) {
        this.addToTree(new Point(point))
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
        let found = this.getItemsInArea(range)

        /*
        if (range.x < range.w / 2) {
            //LEFT
            let wrappingBound = new Rectangle(range.x + width, range.y, range.w, range.h)
            let wrappedPoints = this.getItemsInArea(wrappingBound)
            if (wrappedPoints && wrappedPoints.length) {

                let temp = wrappedPoints.map((e, index) => {
                    const newPos = e.item.position.x - 10//width;
                    return {
                        ...e,
                        item: {
                            ...e.item,
                            ...e.item.position.x = newPos
                        }
                    }
                });

                //temp.forEach(e => e.item.position.x = e.item.position.x - width)
                temp.forEach(e => found.push(e))
            }
        }
        
        if (range.x > width - range.w / 2) {
            //RIGHT
            let wrappingBound = new Rectangle(range.x - width, range.y, range.w, range.h)
            let wrappedPoints = [...this.getItemsInArea(wrappingBound)]
            if (wrappedPoints && wrappedPoints.length) {
                console.log(wrappedPoints)
                wrappedPoints.forEach(e => e.item.position.x = e.item.position.x + width)
                found.push(wrappedPoints)
            }
        }

        if (range.y < range.h / 2) {
            //UP
            let wrappingBound = new Rectangle(range.x, range.y + height, range.w, range.h)
            let wrappedPoints = [...this.getItemsInArea(wrappingBound)]
            if (wrappedPoints && wrappedPoints.length) {
                console.log(wrappedPoints)
                wrappedPoints.forEach(e => e.item.position.y = e.item.position.y - height)
                found.push(wrappedPoints)
            }
        }
        if (range.y > height - range.h / 2) {
            //DOWN
            let wrappingBound = new Rectangle(range.x, range.y - height, range.w, range.h)
            let wrappedPoints = [...this.getItemsInArea(wrappingBound)]
            if (wrappedPoints && wrappedPoints.length) {
                console.log(wrappedPoints)
                wrappedPoints.forEach(e => e.item.position.y = e.item.position.y + height)
                found.push(wrappedPoints)
            }
        }

        if(found.length) console.log(found)
        */

        return found;
    }

    getItemsInArea(range, found) {
        if (!found) {
            found = [];
        }
        if (!this.boundary.intersects(range)) {
            return;
        } else {
            for (let p of this.points) {
                if (range.contains(p)) {
                    found.push(p.item);
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

        for (let p of this.points) {
            found.push(p.item);
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
        for (let p of this.points) {
            p.item.run(...items);
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

        let newTree = new QuadTree(new Rectangle(x, y, w, h), this.capacity);
        tempItems.forEach(e => newTree.insert(e))

        return newTree;
    }


    show() {
        stroke(255);
        noFill();
        strokeWeight(1);
        rectMode(CENTER);
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
        for (let p of this.points) {
            push()
            //strokeWeight(2);
            //point(p.x, p.y);
            pop()
        }

        if (this.divided) {
            this.northeast.show();
            this.northwest.show();
            this.southeast.show();
            this.southwest.show();
        }
    }
}
