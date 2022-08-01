if (!document.getElementById('d3js')) {
    const D3JS = 'https://d3js.org/d3.v2.min.js';
    const script = document.createElement('script');
    script.id = 'd3js';
    script.setAttribute('src', D3JS);
    document.head.appendChild(script);
}

class NEATPopulation {
    constructor(constructor, popSize = 25) {
        this.popSize = popSize;
        this.agents = [];
        this.matingPool = [];
        this.datacollection = [];
        this.generation = 1;
        this.constructor = constructor;

        this.mutationRate = 0.1;
        this.averageFitness = 0;
        this.timerEnabled = true;
        this.timerCount = 30;
        this.timer = this.timerCount;

        this.topAgent = null;
        this.topFitness = 0;
        this.eliteAgents = 5;

        this.showBrain = true;
        this.TopAgentsView = false;

        this.generateAgentsPool()

        if (typeof completedGeneration === 'undefined') {
            NetworkError.warn('completedGeneration(topAgent) not set to fire after each generation.', 'MLObject.constructor')
        }

        this.styling = {
            fontColour: null,
        }

        this.pause = false;
    }

    generateAgentsPool() {
        for (let i = 0; i < this.popSize; i++) {
            this.agents.push(this.buildAgent(i))
            this.agents[i].brain.generateNetwork();
            this.agents[i].brain.mutate();
        }
    }

    buildAgent(...arg) {
        return new this.constructor(...arg)
    }

    run() {
        if (!this.pause) {
            this.runTimer();
            this.checkDone();

            for (let i = 0; i < this.popSize; i++) {
                this.agents[i].run();
                if (this.TopAgentsView && this.topAgent) {
                    if (this.agents[i].topAgent || this.agents[i].eliteAgent) {
                        this.agents[i].render()
                    }
                } else {
                    this.agents[i].render()
                }
            }

        } else {
            this.agents.forEach(e => e.render());
        }

        this.render();
    }

    runTimer() {
        if (!this.timerEnabled) return;

        if (frameCount % 60 === 0) this.timer--;

        if (!this.timer) this.reset()

        push()
        fill(this.styling.fontColour ?? '#000000');
        text(this.timer, width - 20, 15);
        pop()

    }

    checkDone() {
        for (let i = 0; i < this.popSize; i++) {
            if (!this.agents[i].done) return false;
        }
        this.reset();
        return true;
    }

    evaluate() {
        let max = -Infinity;
        let min = Infinity;

        this.agents.forEach(e => {
            e.calculateFitness()

            if (e.fitness > max) {
                max = e.fitness;
                this.topAgent = e;
                this.topAgent.brain.id = 'topAgent';
            }
            if (e.fitness < min) min = e.fitness;
        })

        this.topFitness = max;
        this.normaliseFitness(min, max)
        this.getAverageFitness();
        this.fillMatingPool();
        this.renderAgentBrain(this.topAgent);
        this.selection();
    }

    selection() {
        this.agents = this.agents.map((e, i) => {
            let newChild = this.buildAgent(
                i < this.eliteAgents + 1 ?
                    e.brain.copy() :
                    NEATAgent
                        .crossover(
                            this.selectAgent(),
                            this.selectAgent(),
                            this.mutationRate
                        )
            )

            if (i < this.eliteAgents + 1) {
                if (i === 0) {
                    newChild.topAgent = true;
                } else {
                    newChild.eliteAgent = true;
                }
            }

            return newChild;
        })

        this.generation++;

        if (typeof completedGeneration !== 'undefined') {
            completedGeneration(this.topAgent)
        }
    }

    fillMatingPool() {
        this.matingPool = [];
        this.agents
            .sort((a, b) => b.fitness - a.fitness)
            .forEach((e, index) => {
                if (!e.topAgent && !e.eliteAgent) {
                    if (e.fitness >= this.averageFitness) {
                        let n = e.fitness * 100;
                        for (let i = 0; i < n; i++) {
                            this.matingPool.push(index);
                        }
                    }
                }
            });
        if (this.matingPool.length === 0) {
            for (let i = 0; i < this.popSize; i++) {
                this.matingPool.push(i);
            }
        }
    }

    normaliseFitness(min, max) {
        this.agents.forEach(e => e.fitness = (min === max ? (e.fitness / max) : ((e.fitness - min) / (max - min))));
    }

    selectAgent() {
        return this.agents[rand(this.matingPool)]
    }

    getAverageFitness() {
        let avSum = 0;
        this.agents.forEach((e) => avSum += e.fitness);
        this.averageFitness = avSum / this.agents.length;
    }

    collectData(input, target) {
        this.datacollection.push(
            {
                input: input instanceof Array ? input : [input],
                target: target instanceof Array ? target : [target]
            }
        );
    }

    setTimer(time) {
        if (typeof time === 'boolean') {
            this.timerEnabled = time;
            if (this.timerEnabled) this.setTimer(this.timerCount);
        } else if (isNumber(time) && time > 0) {
            this.timerCount = time;
            this.timer = time;
            this.timerEnabled = true;
            this.rerun();
        } else {
            NetworkError.error('Neither a bool or number provided.')
        }
    }

    mutateOutputActivation(activation, percentage) {
        if (isNumber(percentage)) {
            if (percentage > 1) {
                NetworkError.warn('Percentage is between 0 and 1, setting value to 1', 'NEATPopulation.mutateOutputActivation');
                percentage = 1;
            }
            if (percentage < 0) {
                NetworkError.warn('Percentage is between 0 and 1, setting value to 0', 'NEATPopulation.mutateOutputActivation');
                percentage = 0;
            }
        }
        if (percentage === undefined) percentage = false;
        this.agents.forEach(e => {
            e.brain.nodes.forEach(f => {
                if (f.output) {
                    if (rand() < (percentage !== false ? percentage : e.brain.mutationRates.activationRate)) {
                        f.mutateActivation(activation)
                    }
                }
            })
        })
    }

    downloadDataset(title = 'Dataset') {
        download(title, JSON.stringify(this.datacollection));
    }

    reset() {
        this.evaluate()
        this.timer = this.timerCount
    }

    rerun() {
        this.agents = this.agents.map(e => {
            let newChild = this.buildAgent(e.brain.copy());
            if (e.topAgent) {
                newChild.topAgent = true;
            } else if (e.eliteAgents) {
                newChild.eliteAgent = true;
            }
            return newChild
        })
        this.timer = this.timerCount;
    }

    restart() {
        this.agents = [];
        this.datacollection = [];
        this.topFitness = 0;
        this.generateAgentsPool();
        this.generation = 1;
        this.rerun();
        const element = document.getElementById(this.topAgent?.brain.id);
        if (element) element.parentNode.removeChild(element);
    }

    togglePause() {
        this.pause = !this.pause;
    }

    toggleTopAgentsView() {
        this.TopAgentsView = !this.TopAgentsView;
    }

    toggleBrainRender() {
        this.showBrain = !this.showBrain;
        if (!this.showBrain) {
            const element = document.getElementById(this.topAgent.brain.id);
            if (element) element.parentNode.removeChild(element);
        } else {
            this.renderAgentBrain(this.topAgent)
        }
    }

    fastForward(targetGeneration = 1) {
        const epoch = () => {
            tik = 0;
            this.reset();
            clog('Generation', this.generation, `${(performance.now() - genTimer).toFixed(2)}/ms`);
        }
        this.rerun();
        let target = this.generation + targetGeneration;
        this.pause = true;
        let tik = 0;
        let limit = this.timerCount * 60;
        const start = performance.now();
        let genTimer;
        while (this.generation < target) {
            genTimer = performance.now();
            while (tik < limit) {
                for (let i = 0; i < this.popSize; i++) this.agents[i].run();
                tik++;
            }
            epoch();
        }
        if (targetGeneration !== 1) {
            clog('Fast Forward Completed', `${((performance.now() - start) / 1000).toFixed(2)}/s`);
        }
        this.pause = false;
    }

    nextBest() {
        const currentBest = this.topFitness;
        let loops = 0;
        while (currentBest >= this.topFitness && loops < 100) {
            loops++;
            this.fastForward()
        }
        if (currentBest < this.topFitness) {
            clog('Next Top Agent:', loops, 'Generations later.', `+${this.topFitness - currentBest}`);
        } else {
            clog('No New Top Agent:', loops, 'Generations later');
        }
    }

    renderAgentBrain(agent, width = 500, height = 400, container = 'svgBrainContainer') {
        if (!this.showBrain) return;

        if (!(agent instanceof NEATGenome)) {
            agent = agent?.brain;
            if (!(agent instanceof NEATGenome)) {
                NetworkError('NEATGenome not passed into fender function.')
                return;
            }
        }

        const svgElement = document.getElementById(container);
        if (!svgElement) {
            const newSVGContainer = document.createElement('div');
            newSVGContainer.id = container;
            newSVGContainer.style.position = 'absolute';
            newSVGContainer.style.top = '5px';
            newSVGContainer.style.right = '5px';
            document.body.prepend(newSVGContainer);
        }

        let element = document.getElementById(agent.id);
        if (element) element.parentNode.removeChild(element);

        let svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('id', agent.id);


        let force = d3.layout.force()
            .size([width, height]);

        let min = Infinity;
        let max = -Infinity;

        const connections = agent.connections.map(e => {
            if (e.weight > max) max = e.weight;
            if (e.weight < min) min = e.weight;
            return {
                source: agent.getNode(e.fromNode.number),
                target: agent.getNode(e.toNode.number),
                weight: e.weight,
                enabled: e.enabled
            }
        });

        const nodes = agent.nodes.map(e => {
            let node = e.copy();
            if (node.layer === 0) {
                node.fixed = true;
                node.y = height - (height * 0.2);
                node.x = ((width / agent.inputs) * node.number) + (width / agent.inputs) / 2;
            } else if (node.output) {
                node.fixed = true;
                node.y = height * 0.2;
                node.x = ((width / agent.outputs) * (node.number - agent.inputs)) + (width / agent.outputs) / 2;
            }
            return node
        });

        const getColor = (value, min, max) => `hsl(${((1 - (value - min) / (max - min)) * 120).toString(10)},100%,50%)`;

        force.nodes(nodes)
            .links(connections)
            .gravity(0.001)
            .linkStrength(1)
            .start();

        let link = svg.selectAll('.link')
            .data(connections)
            .enter().append('line')
            .attr('class', 'link')
            .style('stroke-width', (d) => { return d.enabled ? abs(d.weight) + 1 : 0 })
            .style('stroke', (d) => { return getColor(d.weight, min, max); })
            .style('opacity', (d) => { return d.source.layer === 0 && d.target.output ? '0.5' : '1' });

        let node = svg.selectAll('.node')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(force.drag);

        node.append('circle')
            .attr('r', '5')
            .attr('fill', (d) => { return d.layer == 0 ? '#00f' : d.output ? '#f00' : '#000' });

        node.append('text')
            .attr('dx', 10)
            .attr('dy', 4)
            .style('fill', this.styling.fontColour ?? '#000000')
            .text((d) => { return (d.output ? `(${d.activation})` : null) })

        force.on('tick', () => {
            link
                .attr('x1', (d) => { return d.source.x; })
                .attr('y1', (d) => { return d.source.y; })
                .attr('x2', (d) => { return d.target.x; })
                .attr('y2', (d) => { return d.target.y; });

            node.attr('transform', (d) => { return `translate(${d.x},${d.y})`; });
        });

        element = document.getElementById(agent.id);
        document.getElementById(container).append(element);
    }

    render() {
        push();
        fill(this.styling.fontColour ?? '#000000');
        text(`Generation: ${this.generation}`, 10, 15);
        text(`Top Fitness: ${this.topFitness.toFixed(2)}`, 100, 15);
        pop();
    }
}

class NEATAgent {
    constructor(brain) {
        if (brain instanceof NEATGenome) {
            this.brain = brain;
        } else if (typeof createMLObjectBrain !== 'undefined') {
            this.brain = createMLObjectBrain(brain);
        } else {
            NetworkError.error('createMLObjectBrain() needed to create a neural netword for the MLObject.', 'MLObject.constructor');
            return;
        }
        this.failed = false;
        this.success = false;
        this.done = false;
        this.topAgent = false;
        this.eliteAgent = false;
        this.fitness = 0;
        this.score = 0;
    }

    static crossover(parent1, parent2, mutationRate = 0.1) {
        let brain;
        if (parent1.fitness > parent2.fitness) {
            brain = parent1.brain.crossover(parent2.brain);
        } else {
            brain = parent2.brain.crossover(parent1.brain);
        }

        brain.mutate(mutationRate);
        return brain;
    }
}