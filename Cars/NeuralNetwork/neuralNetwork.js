NetworkError = function NetworkError(msg, method) {
    this.msg = msg;
    this.method = method;
};

NetworkError.prototype.warn = () => {
    console.warn('Warning: ' + this.message);
    console.warn('> ' + this.method);
    console.trace();
};

NetworkError.prototype.error = () => {
    console.error('Error: ' + this.message);
    console.error('> ' + this.method);

    console.trace();
};

NetworkError.warn = (warning, method) => {
    console.warn('Warning: ' + warning);
    console.warn('> ' + method);
    console.trace();
}

NetworkError.error = (error, method) => {
    console.error('Error: ' + error);
    console.error('> ' + method);
    console.trace();
};

const LayerType = {
    input: 'input',
    hidden: 'hidden',
    output: 'output',
}

const actFunc = {
    sigmoid: 'sigmoid',
    silu: 'silu',
    tanH: 'tanh',
    leakyrelu: 'leakyrelu',
    relu: 'relu',
    sinc: 'sinc',
    softsign: 'softsign',
    binary: 'binary',
    softplus: 'softplus',
    leakyrelucapped: 'leakyrelucapped',
    leakysigmoid: 'leakysigmoid',
}
const actFuncNames = [
    'sigmoid',
    'silu',
    'tanh',
    'leakyrelu',
    'relu',
    'sinc',
    'softsign',
    'binary',
    'softplus',
    'leakyrelucapped',
    'leakysigmoid',
]

const lossFunctions = {
    MeanSquareError: lossfuncs.mse,
    MeanAbsoluteError: lossfuncs.mae,
    MeanBiasError: lossfuncs.mbe,
    BinaryCrossEntropy: lossfuncs.bce,
    MinimumClassificationError: lossfuncs.mce,
    RootMeanSquareError: lossfuncs.rmse,
    MeanAbsoluteExponential: lossfuncs.mael,
    LogCoshLoss: lossfuncs.lcl,
    Quantile: lossfuncs.quantile
}

const translateLossFunc = loss => {
    switch (loss) {
        case 'mse':
            return 'Mean Square Error'
        case 'mae':
            return 'Mean Absolute Error'
        case 'mbe':
            return 'Mean Bias Error'
        case 'bce':
            return 'Binary Cross Entropy'
        case 'mce':
            return 'Minimum Classification Error'
        case 'rmse':
            return 'Root Mean Square Error'
        case 'mael':
            return 'Mean Absolute Exponential'
        case 'lcl':
            return 'Log Cosh Loss'
        case 'quantile':
            return 'Quantile'
    }
}

// { String } type A string representing the type of this layer.
// { Number } Size The size of the downsampling layer.
// { Number } Sample The size of the 2d sample iterating trough the array.
// { Number } Stride The number of jumps the sample is going to perform for each iteration.

class Layer {
    constructor(type, size, activationFunction) {
        this.type = type;
        if (this.type === LayerType.hidden || this.type === LayerType.output) {
            this.size = size;
            this.setActivation(activationFunction);
            this.layer = new Matrix(this.size, 1);
        } else if (this.type === LayerType.input) {
            this.size = size;
            this.layer = new Matrix(this.size, 1);
        } else if (typeof this.type === 'string') {
            NetworkError.error(`The Layer type '${this.type}' is not valid.`, 'Layer.constructor');
        } else {
            NetworkError.error('You need to specify a valid type of Layer', 'Layer.constructor');
        }
    }

    setActivation(act) {
        const obj = Layer.stringTofunc(act);
        if (obj !== undefined) {
            this.actname = obj.name;
            this.actname_d = obj.name_d;
            this.actfunc = obj.func;
            this.actfunc_d = obj.func_d;
        } else {
            NetworkError.error('Bad activation information', 'Layer.setActivation');
            return;
        }
    };

    feed(data, options) {
        let showLog = false;
        let table = false;
        let f = this.sampleSize;
        let s = this.stride;
        if (options !== undefined) {
            if (options.log) {
                showLog = options.log;
            }
            if (options.table) {
                table = options.table;
            }
        }
        if (data.length !== this.inputSize) {
            NetworkError.error(`The data you are trying to feed to this ${this.type} layer is not the same length as the number of input this layer has.`, 'Layer.feed');
            return;
        } else {
            let downsampled = this.downsample(data, f, s);
            if (showLog) {
                if (table) {
                    console.table(downsampled);
                } else {
                    clog(downsampled);
                }
            }
            return downsampled;
        }
    };

    print() {
        clog(this);
    };

    getSqIndex(w, i, j) {
        return w * j + i;
    };

    getPrefix() {
        let str = this.type;
        let len = str.length;
        let prefix = str.slice(0, len - 4);
        return prefix;
    };

    static stringTofunc(str) {
        const act = str.toLocaleLowerCase();
        const der = `${act}_d`;
        let func = activations[act];
        let func_d = activations[der];

        if (func !== undefined) {
            if (func_d !== undefined) {
                return {
                    name: act,
                    name_d: der,
                    func: func,
                    func_d: func_d
                };
            } else {
                NetworkError.error(`You need to create the derivative of your custom function. The activation function specified '${str}' does not have a derivative assigned. The activation function was set to the default 'sigmoid'.`, 'Layer.stringTofunc');
                return;
            }
        } else {
            NetworkError.error(`The activation function '${str}' is not a valid activation function. The activation function was set to the default 'sigmoid'.`, 'Layer.stringTofunc');
            return;
        }
    };
};

class NeuralNetwork {
    constructor(i = 1, o = 1) {
        this.i = i;
        this.o = o;

        this.inputs = new Layer(LayerType.input, i);
        this.outputs = new Layer(LayerType.output, o, actFunc.sigmoid);

        this.Layers = [this.inputs, this.outputs];
        this.weights = [];
        this.biases = [];
        this.errors = [];
        this.gradients = [];
        this.dropout = [];

        this.outs = [];
        this.loss = 0;
        this.learningRate = 0.1;
        this.architecture = [i, o];

        this.epoch = 0;
        this.timeTraining = 0;

        this.correctPrediction = 0;
        this.predictionCount = 0;
        this.accuracyThreshold = 0.1;

        this.lossfunc = lossFunctions.MeanSquareError;
        this.lossfuncName = translateLossFunc(this.lossfunc.name);

        this.percentile = 0.5;
    }

    asLabel(array) {
        return array.indexOf(Math.max(...array));
    };

    checkArrayLength(arr, n) {
        return arr.length === n;
    };

    addHiddenLayer(size, act) {
        if (act !== undefined) {
            if (activations[act.toLocaleLowerCase()] === undefined) {
                if (typeof act === 'string') {
                    NetworkError.error(`'${act}' is not a valid activation function, as a result, the activation function was set to 'sigmoid'.`, 'NeuralNetwork.addHiddenLayer');
                }
                act = actFunc.sigmoid;
            }
        } else {
            act = actFunc.sigmoid;
        }

        this.architecture.splice(this.architecture.length - 1, 0, size);
        let layer = new Layer(LayerType.hidden, size, act);
        this.Layers.splice(this.Layers.length - 1, 0, layer);
    };

    makeWeights(x, y) {
        let min = -1;
        let max = 1;
        if (x !== undefined && y !== undefined) {
            min = x;
            max = y;
        }
        for (let i = 0; i < this.Layers.length - 1; i++) {
            let previousLayerObj = this.Layers[i];
            let layerObj = this.Layers[i + 1];

            let weights = new Matrix(layerObj.layer.rows, previousLayerObj.layer.rows);
            let biases = new Matrix(layerObj.layer.rows, 1);
            this.errors[i] = new Matrix(layerObj.layer.rows, 1);
            this.gradients[i] = new Matrix(layerObj.layer.rows, 1);

            this.weights[i] = weights.randomize(min, max);
            this.biases[i] = biases.randomize(1, -1);

            if (layerObj.actfunc === undefined) {
                layerObj.setActivation(actFunc.sigmoid);
            }
        }

        for (let i = 0; i < this.Layers.length; i++) {
            this.architecture[i] = this.Layers[i].layer.rows;
        }

    };

    outputActivation(act) {
        const lowerCaseAct = act.toLocaleLowerCase();
        if (activations[lowerCaseAct] === undefined) {
            if (typeof act === 'string') {
                NetworkError.error(`'${act}' is not a valid activation function, as a result, the activation function is set to 'sigmoid' by default.`, 'NeuralNetwork.outputActivation');
                return;
            } else {
                NetworkError.error(`Did not detect a string value, as a result, the activation function is set to 'sigmoid' by default.`, 'NeuralNetwork.outputActivation');
                return;
            }
        }
        this.Layers[this.Layers.length - 1].setActivation(act);
    };

    ffwDefaults() {
        return {
            log: false,
            table: false,
            decimals: undefined,
            asLabel: false,
        };
    };

    feedForward(inputs, options = this.ffwDefaults()) {
        let roundData = options.decimals !== undefined ? true : false;
        let dec = pow(10, options.decimals) || 1000;

        if (this.checkArrayLength(inputs, this.i)) {
            this.Layers[0].layer = Matrix.fromArray(inputs);
        } else {
            NetworkError.error(`The input array length does not match the number of inputs the js model has.`, 'NeuralNetwork.feedForward');
            return;
        }

        if (this.checkArrayLength(this.weights, 0)) {
            NetworkError.warn('The weights were not initiated. Please use the .makeWeights(); function after the initialization of the layers.', 'NeuralNetwork.feedForward');
            this.makeWeights();
        }

        for (let i = 0; i < this.weights.length; i++) {
            let pLayer = this.Layers[i];
            let layerObj = this.Layers[i + 1];
            layerObj.layer = Matrix.mult(this.weights[i], pLayer.layer);
            layerObj.layer.add(this.biases[i]);
            layerObj.layer.map(layerObj.actfunc);
        }

        this.outs = Matrix.toArray(this.Layers[this.Layers.length - 1].layer);

        let out = this.outs;
        if (roundData && options.asLabel) {
            NetworkError.warn('Cannot round if output is a label', 'NeuralNetwork.feedForward');
        } else if (options.asLabel) {
            out = this.asLabel(out);
        } else if (roundData && !options.asLabel) {
            out = out.map(x => round(x * dec) / dec);
        }

        if (options.log) {
            clog('Prediction: ', out);
        }
        return out;
    };

    predict() {
        return this.feedForward.apply(this, arguments);
    };

    feed(input) {
        clog('Inputs: ', input);
        this.feedForward(input, { log: true, decimals: 3 });
        this.print('---------------------------')
    }

    exhibition(dataset) {
        dataset.forEach(e => {
            if (!e.input) {
                NetworkError.error(`Dataset missing (.input) property.`, 'NeuralNetwork.exhibition');
                return;
            }
            clog('🔢 Inputs:\t\t\t', JSON.stringify(e.input));
            const pred = this.feedForward(e.input, { log: false, decimals: 3 });
            if (e.target) {
                const correct = this.isCorrect(e.target, pred);
                clog('🎯 Target:\t\t\t', JSON.stringify(e.target));
                clog('%c🔮 Prediction:', `background-color: ${correct ? '#bcffa8' : '#ffa8a8'};`, '\t', JSON.stringify(pred), `${correct ? '✔️' : '❌'}`);
            } else {
                clog(`🔮 Prediction:\t\t`, JSON.stringify(pred));
            }
            clog('---------------------------');
        });
    }

    bckDefaults() {
        return {
            log: false,
            mode: 'cpu',
            table: false,
            dropout: undefined,
        };
    };

    backpropagate(inputs, target, options = this.bckDefaults()) {
        let targets;
        if (this.checkArrayLength(target, this.o)) {
            targets = Matrix.fromArray(target);
        } else {
            NetworkError.error(`The target array length does not match the number of ouputs the model has.`, 'NeuralNetwork.backpropagate');
            return;
        }

        if (!this.checkLearningRate()) return;

        if (options.dropout !== undefined) {
            if (!this.checkDropoutRate(options.dropout)) return;
            this.addDropout(options.dropout);
        }

        this.outs = this.feedForward(inputs, { log: false, mode: options.mode });

        this.predictionCount++;
        this.correctPrediction += this.isCorrect(target, this.outs) ? 1 : 0;

        this.errors[this.errors.length - 1] = Matrix.sub(targets, this.Layers[this.Layers.length - 1].layer);

        this.gradients[this.gradients.length - 1] = Matrix.map(this.Layers[this.Layers.length - 1].layer, this.Layers[this.Layers.length - 1].actfunc_d)
            .mult(this.errors[this.errors.length - 1])
            .mult(this.learningRate);

        for (let i = this.weights.length - 1; i > 0; i--) {
            let weights_deltas = Matrix.mult(
                this.gradients[i],
                Matrix.transpose(this.Layers[i].layer)
            );

            if (options.dropout !== undefined) {
                weights_deltas = weights_deltas.mult(this.dropout[i]);
            }

            this.weights[i].add(weights_deltas);
            this.biases[i].add(this.gradients[i]);

            let weights_t = Matrix.transpose(this.weights[i]);
            this.errors[i - 1] = Matrix.mult(weights_t, this.errors[i]);
            this.gradients[i - 1] = Matrix.map(this.Layers[i].layer, this.Layers[i].actfunc_d)
                .mult(this.errors[i - 1])
                .mult(this.learningRate);
        }

        let i_t = Matrix.transpose(this.Layers[0].layer);
        let weights_deltas = Matrix.mult(this.gradients[0], i_t);

        if (options.dropout !== undefined) {
            weights_deltas = weights_deltas.mult(this.dropout[0]);
        }

        this.weights[0].add(weights_deltas);
        this.biases[0].add(this.gradients[0]);

        this.loss = this.lossfunc(this.outs, target, this.percentile);

        if (options.log === true) {
            this.print('Prediction: ');
            this.print(this.outs, options.table);
            this.print('target: ');
            this.print(target, options.table);
            this.print(`Loss: ${this.loss}`);
        }
    };

    isCorrect(target, prediction) {
        return target.filter((e, i) => abs(e - prediction[i]) <= this.accuracyThreshold).length === target.length
    }

    train(generations, dataset, options) {
        dataset.forEach(e => {
            if (!e.input) {
                NetworkError.error(`Dataset missing (.input) property.`, 'NeuralNetwork.train');
                return;
            }
            if (!e.target === undefined) {
                NetworkError.error(`Dataset missing (.target) property.`, 'NeuralNetwork.train');
                return;
            }
        })

        const start = performance.now();
        for (this.epoch; this.epoch < generations; this.epoch++) {
            dataset.forEach(e => this.backpropagate(e.input, e.target, options))
        }
        this.timeTraining += performance.now() - start;
    };

    mapWeights(f) {
        if (typeof f === 'function') {
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i].map(f);
            }
        } else {
            NetworkError.error('Argument must be a function', 'NeuralNetwork.mapWeights');
        }
    };

    logDefaults() {
        return {
            struct: true,
            misc: true,
            weights: false,
            biases: false,
            gradients: false,
            errors: false,
            layers: false,
            table: false,
            decimals: 3,
            details: false,
        };
    };

    log(options = this.logDefaults()) {
        let decimals = 1000;
        if (options.decimals > 21) {
            NetworkError.error('Maximum number of decimals is 21.', 'NeuralNetwork.log');
            decimals = pow(10, 21);
        } else {
            decimals = pow(10, options.decimals) || decimals;
        }

        if (options.details) {
            let v = options.details;
            options.gradients = v;
            options.weights = v;
            options.errors = v;
            options.biases = v;
            options.struct = v;
            options.misc = v;
            options.layers = v;
        }

        if (this.weights.length === 0) {
            this.makeWeights();
        }
        if (options.struct) {
            clog('%c🧠 Network:', 'padding: 0.2em; font-size: 2em;');
            clog('Layers:');

            this.Layers.forEach((e, i) => {
                clog(`\t${i === 0 ? 'Input Layer:' : i === this.Layers.length - 1 ? 'Output Layer:' : 'Hidden Layer:'}\t${e.size}\t${i ? `(${e.actname})` : ''}`)
                if (options.layers) clog(this.Layers[i]);
            })
        }
        if (options.weights) {
            clog('Weights:');
            this.weights.forEach(e => e.log({ decimals: options.decimals, table: options.table }))
        }
        if (options.biases) {
            clog('Biases:');
            this.biases.forEach(e => e.log({ decimals: options.decimals, table: options.table }))
        }
        if (options.errors) {
            clog('Errors:');
            this.errors.forEach(e => e.log({ decimals: options.decimals, table: options.table }))
        }
        if (options.gradients) {
            clog('Gradients:');
            this.gradients.forEach(e => e.log({ decimals: options.decimals, table: options.table }))
        }

        if (options.misc) {
            clog('Other Values: ');
            clog(`\tLearning Rate:\t${this.learningRate}`);
            clog(`\tLoss Function:\t${this.lossfuncName}`);
            clog(`\tCurrent Epoch:\t${(this.epoch).toLocaleString()}`);
            clog(`\tAccuracy:\t\t${((this.correctPrediction / this.predictionCount) * 100).toFixed(2)}%`);
            clog(`\tTime Training:\t${this.timeTraining.toFixed(2)}/ms\t~${(this.timeTraining / this.epoch).toFixed(5)}/ms Per Epoch`);
            clog(`\tLatest Loss:\t${this.loss}`);
            this.print(`---------------------------`);
        }
        clog('\n');
        return;
    };

    print(v, option = false) {
        if (option) {
            console.table(v);
        } else {
            clog(v);
        }
    };

    checkLearningRate() {
        if (!isNumber(this.learningRate)) {
            NetworkError.error('The learning rate specified (.learningRate property) is not a number.', 'NeuralNetwork.backpropagate');
            return false;
        } else {
            if (this.learningRate >= 1) {
                NetworkError.error('The learning rate specified is greater or equal to 1', 'NeuralNetwork.backpropagate');
                return false;
            }
        }
        return true;
    };

    checkDropoutRate(dropout) {
        if (dropout >= 1) {
            NetworkError.error('The probability value can not be bigger or equal to 1', 'NeuralNetwork.backpropagate');
            return false;
        } else if (dropout <= 0) {
            NetworkError.error('The probability value can not be smaller or equal to 0', 'NeuralNetwork.backpropagate');
            return false;
        }
        return true;
    };

    addDropout(rate) {
        if (this.weights.length === 0) {
            NetworkError.error('You need to initialise weights before using this function, use NetworkError.makeWeights();', 'NetworkError.addDropout');
            return;
        }

        let func = (v => Math.floor(Math.random() + (1 - rate)))
            .toString()
            .replace(/rate/gm, rate);

        let randomMap = eval(func);

        let inactive = [];
        for (let i = 0; i < this.Layers.length; i++) {
            let neuronList = new Array(this.Layers[i].size).fill(1).map(randomMap);
            inactive.push(neuronList);
        }

        this.dropout = [];
        for (let i = 0; i < this.weights.length; i++) {
            this.dropout.push(
                new Matrix(this.weights[i].rows, this.weights[i].cols).initiate(1)
            );
        }

        for (let i = 0; i < inactive.length; i++) {
            if (i === 0) {
                for (let j = 0; j < inactive[i].length; j++) {
                    if (inactive[i][j] === 0) {
                        this.dropout[i].fillCol(j, 0);
                    }
                }
            } else if (i === inactive.length - 1) {
                for (let j = 0; j < inactive[i].length; j++) {
                    if (inactive[i][j] === 0) {
                        this.dropout[i - 1].fillRow(j, 0);
                    }
                }
            } else {
                for (let j = 0; j < inactive[i].length; j++) {
                    if (inactive[i][j] === 0) {
                        this.dropout[i - 1].fillRow(j, 0);
                        this.dropout[i].fillCol(j, 0);
                    }
                }
            }
        }
    };

    fromJSON(data) {
        this.i = data.architecture[0];
        this.o = data.architecture[data.architecture.length - 1];
        this.inputs = new Matrix(this.i, 1);
        this.outputs = new Matrix(this.o, 1);
        data.layers.map((e, i) => this.Layers[i] = new Layer(e.type, e.size, e.actname))
        this.makeWeights();

        data.weights.map((e, i) => this.weights[i].set(e))
        data.biases.map((e, i) => this.biases[i].set(e))
        data.errors.map((e, i) => this.errors[i].set(e))
        data.gradients.map((e, i) => this.gradients[i].set(e))

        this.lossfunc = lossfuncs[data.lossFunction];
        this.lossfuncName = data.lossFunctionName;
        this.outs = Matrix.toArray(this.Layers[this.Layers.length - 1].layer);
        this.loss = data.latestLoss;
        this.learningRate = data.learningRate;
        this.architecture = data.architecture;
        this.epoch = data.epoch;
        this.percentile = data.percentile;

        this.timeTraining = data.timeTraining;
        this.correctPrediction = data.correctPrediction;
        this.predictionCount = data.predictionCount;
        this.accuracyThreshold = data.accuracyThreshold;

        return this;
    }

    toJSON() {
        return {
            architecture: this.architecture,
            epoch: this.epoch,
            learningRate: this.learningRate,
            lossFunction: this.lossfunc.name,
            lossFunctionName: this.lossfuncName,
            latestLoss: this.loss,
            percentile: this.percentile,

            timeTraining: this.timeTraining,
            correctPrediction: this.correctPrediction,
            predictionCount: this.predictionCount,
            accuracyThreshold: this.accuracyThreshold,

            layers: this.Layers.map(e => e),
            weights: this.weights.map(e => e.matrix),
            biases: this.biases.map(e => e.matrix),
            gradients: this.gradients.map(e => e.matrix),
            errors: this.errors.map(e => e.matrix),
        };
    };

    static createFromJSON(JSON, options) {
        const model = new NeuralNetwork();
        model.fromJSON(JSON);
        if (options) {
            clog('Network created from JSON', JSON)
        }
        return model;
    }

    downloadNetwork(title = 'Neural Network') {
        download(title, JSON.stringify(this.toJSON()))
    }

    copy() {
        return NeuralNetwork.createFromJSON(this.toJSON());
    }

    mutateAdd(randomFactor) {
        if (typeof randomFactor !== 'number') {
            NetworkError.error('randomFactor argument must be a number.', 'NeuralNetwork.mutateAdd');
            return;
        } else {
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i].addPercent(randomFactor);
            }
        }
    };

    mutateRandom(range, probability) {
        if (typeof range !== 'number') {
            NetworkError.error('Range argument must be a number.', 'NeuralNetwork.mutateRandom');
            return;
        }
        if (probability !== undefined) {
            if (typeof probability !== 'number') {
                NetworkError.error('Probability argument must be a number.', 'NeuralNetwork.mutateRandom');
                return;
            }
        } else {
            probability = 1;
        }
        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i].addRandom(range, probability);
        }
    };

    static mergeNetworks(a, b) {
        if (!(a instanceof NeuralNetwork || b instanceof NeuralNetwork)) {
            NetworkError.error('Inputs must be Neural networrk objects.', 'NeuralNetwork.mergeNetworks');
            return;
        }

        const model = a.copy();

        for (let i = 0; i < model.weights.length; i++) {
            model.weights[i] = Matrix.merge(a.weights[i], b.weights[i])
        }
        for (let i = 0; i < model.biases.length; i++) {
            model.biases[i] = Matrix.merge(a.biases[i], b.biases[i])
        }

        return model
    };
}

//------------------------------------------------------------------------------------------------------
// NeuroEvolution of Augmenting Topologies (NEAT)

class NEATConnection {
    constructor(from, to, weight) {
        this.fromNode = from;
        this.toNode = to;
        this.weight = weight;
        this.enabled = true;
    }

    mutateWeight(magnitude) {
        rand() < 0.05 ? this.weight = rand(-1, 1) : this.weight += rand(-magnitude, magnitude);
    }

    copy() {
        let copy = new NEATConnection(this.fromNode, this.toNode, this.weight);
        copy.enabled = this.enabled;
        return copy;
    }

    getInnovationNumber() {
        let x = this.fromNode.number + this.toNode.number;
        return 0.5 * x * ++x + this.toNode.number;
    }
}

class NEATNode {
    constructor(num, lay, isOutput) {
        this.number = num;
        this.layer = lay;
        this.bias = rand(-1, 1);
        this.output = isOutput || false;
        this.activation = actFuncNames[floor(rand(0, actFuncNames.length))];

        this.inputSum = 0;
        this.outputValue = 0;
        this.outputConnections = [];

        this.id = rand();
    }

    engage() {
        if (this.layer !== 0) this.outputValue = activations[this.activation](this.inputSum + this.bias);
        for (let i = 0; i < this.outputConnections.length; i++) {
            if (this.outputConnections[i].enabled) this.outputConnections[i].toNode.inputSum += this.outputConnections[i].weight * this.outputValue;
        }
    }

    mutateBias(magnitude) {
        rand() < 0.05 ? this.bias = rand(-1, 1) : this.bias += rand(-magnitude, magnitude);
    }

    mutateActivation(actFunc) {
        if (actFunc === undefined) {
            this.activation = actFuncNames[floor(rand(0, actFuncNames.length))];
        } else if (activations[actFunc] !== undefined) {
            this.activation = actFunc;
        } else {
            NetworkError.warn(`Provided Activation function "${actFunc}" not listed, assigning random`, 'NEATNode.mutateActivation');
            this.activation = actFuncNames[floor(rand(0, actFuncNames.length))];
        }
    }


    copy() {
        let node = new NEATNode(this.number, this.layer, this.output);
        node.bias = this.bias;
        node.activation = this.activation;
        return node;
    }
}

class NEATGenome {
    constructor(i = 1, o = 1, id = rand(), offSpring = false) {
        this.inputs = i;
        this.outputs = o;
        this.id = id;
        this.layers = 2;
        this.nextNode = 0;

        this.nodes = [];
        this.connections = [];

        this.mutationRates = {};
        this.rollMutations()

        if (!offSpring) {
            for (let i = 0; i < this.inputs; i++) {
                this.nodes.push(new NEATNode(this.nextNode, 0));
                this.nextNode++;
            }
            for (let i = 0; i < this.outputs; i++) {
                let node = new NEATNode(this.nextNode, 1, true);
                this.nodes.push(node);
                this.nextNode++;
            }
            for (let i = 0; i < this.inputs; i++) {
                for (let j = this.inputs; j < this.outputs + this.inputs; j++) {
                    this.connections.push(new NEATConnection(this.nodes[i], this.nodes[j], rand(-1, 1)));
                }
            }
        }
        this.generateNetwork()
    }

    generateNetwork() {
        //this.nodes.forEach(e => e.outputConnections = []);
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].outputConnections = []
        }

        // this.connections.forEach(e => e.fromNode.outputConnections.push(e));
        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].fromNode.outputConnections.push(this.connections[i])
        }

        this.sortByLayer();
    }

    predict(inputs) {
        return this.feedForward(inputs)
    }

    feedForward(inputValues) {
        let result = [];
        let resIndex = 0;
        for (let i = 0; i < this.nodes.length; i++) {
            if (i < this.inputs) this.nodes[i].outputValue = inputValues[i];
            this.nodes[i].engage();
            if (this.nodes[i].output) {
                result[resIndex] = this.nodes[i].outputValue;
                resIndex++;
            }
            this.nodes[i].inputSum = 0;
        }
        return result;
    }

    crossover(partner) {
        let offSpring = new NEATGenome(this.inputs, this.outputs, rand(), true);

        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i].copy();
            if (node.output) {
                let partnerNode = partner.nodes[partner.getNode(node.number)];
                if (rand() > 0.5) {
                    node.activation = partnerNode.activation;
                    node.bias = partnerNode.bias;
                }
            }
            offSpring.nodes[i] = node;
        }

        for (let i = 0; i < this.connections.length; i++) {
            let index = this.commonConnection(this.connections[i].getInnovationNumber(), partner.connections);

            let conn = index != -1
                ? rand() > 0.5 ? this.connections[i].copy() : partner.connections[index].copy()
                : this.connections[i].copy();

            conn.fromNode = offSpring.nodes[offSpring.getNode(conn.fromNode.number)];
            conn.toNode = offSpring.nodes[offSpring.getNode(conn.toNode.number)];

            if (conn.fromNode && conn.toNode) offSpring.connections.push(conn);
        }

        let p1 = this.mutationRates;
        let p2 = partner.mutationRates;
        offSpring.mutationRates.connectionRate = rand() > 0.5 ? p1.connectionRate : p2.connectionRate;
        offSpring.mutationRates.biasRate = rand() > 0.5 ? p1.biasRate : p2.biasRate;
        offSpring.mutationRates.activationRate = rand() > 0.5 ? p1.activationRate : p2.activationRate;
        offSpring.mutationRates.addConnectionRate = rand() > 0.5 ? p1.addConnectionRate : p2.addConnectionRate;
        offSpring.mutationRates.addNodeRate = rand() > 0.5 ? p1.addNodeRate : p2.addNodeRate;

        offSpring.layers = this.layers;
        offSpring.nextNode = offSpring.nodes.length;

        return offSpring;
    }

    mutate(mutationRate = 0.1) {
        const rates = this.mutationRates;
        // MOD Connections
        this.connections.forEach(e => { if (rand() < rates.connectionRate) e.mutateWeight(mutationRate) })
        // MOD Bias
        this.nodes.forEach(e => { if (rand() < rates.biasRate) e.mutateBias(mutationRate) })
        // MOD Node
        if (rand() < rates.activationRate) this.nodes[floor(rand(this.nodes.length))].mutateActivation();
        // ADD Connections
        if (rand() < rates.addConnectionRate) this.addConnection();
        // ADD Node
        if (rand() < rates.addNodeRate) this.addNode();
        // ADD Node
        if (rand() < rates.rollMutation) this.rollMutations();

        this.generateNetwork();
    }

    rollMutations() {
        this.mutationRates.rollMutation = rand(0.01, 1)
        this.mutationRates.connectionRate = rand(0.8, 0.9)
        this.mutationRates.biasRate = rand(0.5, 0.6)
        this.mutationRates.activationRate = rand(0.05, 0.1)
        this.mutationRates.addConnectionRate = rand(0.05, 0.1)
        this.mutationRates.addNodeRate = rand(0.01, 0.05)
    }

    addNode() {
        let connectionIndex = floor(rand(this.connections.length));
        let pickedConnection = this.connections[connectionIndex];

        if (pickedConnection.fromNode.layer !== 0 && !pickedConnection.toNode.output) {
            connectionIndex = floor(rand(this.connections.length));
            pickedConnection = this.connections[connectionIndex];
        }

        pickedConnection.enabled = false;
        this.connections.splice(connectionIndex, 1);

        let newNode = new NEATNode(this.nextNode, pickedConnection.fromNode.layer + 1);

        // this.nodes.forEach(e => {
        //     if (e.layer > pickedConnection.fromNode.layer) e.layer++;
        // });
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].layer > pickedConnection.fromNode.layer) this.nodes[i].layer++;
        }

        let newConnection1 = new NEATConnection(pickedConnection.fromNode, newNode, 1);
        let newConnection2 = new NEATConnection(newNode, pickedConnection.toNode, pickedConnection.weight);

        this.layers++;
        this.connections.push(newConnection1);
        this.connections.push(newConnection2);
        this.nodes.push(newNode);
        this.nextNode++;
    }

    addConnection() {
        if (this.fullyConnected()) return;

        let node1 = floor(rand(this.nodes.length));
        let node2 = floor(rand(this.nodes.length));

        while (this.nodes[node1].layer === this.nodes[node2].layer || this.nodesConnected(this.nodes[node1], this.nodes[node2])) {
            node1 = floor(rand(this.nodes.length));
            node2 = floor(rand(this.nodes.length));
        }

        if (this.nodes[node1].layer > this.nodes[node2].layer) {
            let temp = node1;
            node1 = node2;
            node2 = temp;
        }

        let newConnection = new NEATConnection(this.nodes[node1], this.nodes[node2], rand(-1, 1));
        this.connections.push(newConnection);
    }

    commonConnection(innN, connections) {
        return connections.findIndex(e => innN === e.getInnovationNumber());
    }

    nodesConnected(node1, node2) {
        for (let i = 0; i < this.connections.length; i++) {
            let conn = this.connections[i];
            if ((conn.fromNode == node1 && conn.toNode == node2) || (conn.fromNode == node2 && conn.toNode == node1)) {
                return true;
            }
        };
        return false;
    }

    fullyConnected() {
        let maxConnections = 0;
        let nodesPerLayer = [];

        for (let i = 0; i < this.nodes.length; i++) {
            if (nodesPerLayer[this.nodes[i].layer] !== undefined) {
                nodesPerLayer[this.nodes[i].layer]++;
            } else {
                nodesPerLayer[this.nodes[i].layer] = 1;
            }
        };

        for (let i = 0; i < this.layers - 1; i++) {
            for (let j = i + 1; j < this.layers; j++) {
                maxConnections += nodesPerLayer[i] * nodesPerLayer[j];
            }
        }

        return maxConnections === this.connections.length;
    }

    sortByLayer() {
        this.nodes.sort((a, b) => a.layer - b.layer);
    }

    copy() {
        let copy = new NEATGenome(this.inputs, this.outputs, this.id);
        copy.mutationRates = this.mutationRates;
        copy.nodes = this.nodes.slice();
        copy.connections = this.connections.slice();
        return copy;
    }

    getNode(x) {
        return this.nodes.findIndex(e => e.number === x)
    }

    downloadNetwork(title = 'NEAT Genome') {
        let copy = new NEATGenome(this.inputs, this.outputs, this.id);
        copy.mutationRates = this.mutationRates;
        copy.nodes = this.nodes.map(e => {
            return {
                activation: e.activation,
                bias: e.bias,
                id: e.id,
                inputSum: e.inputSum,
                layer: e.layer,
                number: e.number,
                output: e.output,
                outputConnections: [],
                outputValue: e.outputValue,
            }
        });
        copy.connections = this.connections.map(e => {
            return {
                enabled: e.enabled,
                fromNode: e.fromNode.id,
                toNode: e.toNode.id,
                weight: e.weight
            }
        });
        download(title, JSON.stringify(copy))
    }

    fromJSON(data) {
        this.inputs = data.inputs;
        this.outputs = data.outputs;
        this.id = data.id;
        this.layers = data.layers;
        this.nextNode = data.nextNode;
        this.mutationRates = data.mutationRates;

        this.nodes = data.nodes.map(e => {
            let newNode = new NEATNode();
            newNode.activation = e.activation;
            newNode.bias = e.bias;
            newNode.id = e.id;
            newNode.inputSum = e.inputSum;
            newNode.layer = e.layer;
            newNode.number = e.number;
            newNode.output = e.output;
            newNode.outputConnections = e.outputConnections;
            newNode.outputValue = e.outputValue;
            return newNode;
        });

        this.connections = data.connections.map(e => {
            let newConn = new NEATConnection()
            newConn.enabled = e.enabled;
            newConn.weight = e.weight;
            newConn.fromNode = this.nodes.find(f => f.id === e.fromNode);
            newConn.toNode = this.nodes.find(f => f.id === e.toNode);
            return newConn;
        });

        this.generateNetwork()
    }

    static createFromJSON(json, options) {
        if (typeof json === 'string') {
            json = JSON.parse(json)
        }
        const model = new NEATGenome();
        model.fromJSON(json);
        if (options) {
            clog('Network created from JSON', json)
        }
        return model;
    }

    render(width = 500, height = 400, container = 'svgBrainContainer') {
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

        const connections = agent.connections.map(e => {
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
                // node.y = ((height / agent.inputs) * node.number) + (height / agent.inputs) / 2;
                // node.x = (width * 0.2);
            }

            if (node.output) {
                node.fixed = true;
                node.y = (height * 0.2);
                node.x = ((width / agent.outputs) * (node.number - agent.inputs)) + (width / agent.outputs) / 2;
                // node.x = width - (width * 0.2);
                // node.y = ((height / agent.outputs) * (node.number - agent.inputs)) + (height / agent.outputs) / 2;
            }
            return node
        });

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
            .style('stroke', (d) => { return d.weight > 0 ? '#0f0' : '#f00'; })
            .style('opacity', (d) => { return d.source.layer === 0 && d.target.output ? '0.2' : '1' });

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
            .text((d) => { return (d.output ? `(${d.activation})` : null) })
            .on('mouseover', function (d) {
                d3.select(this)
                    .text(`${d.number}: (${d.activation})`)
            })
            .on('mouseleave', function (d) {
                d3.select(this)
                    .text(d.output ? `(${d.activation})` : d.layer ? d.number : null)
            });

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
}

//------------------------------------------------------------------------------------------------------


const download = (title, data) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', title + '.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

const XORDemo = () => {
    const dataset = [
        {
            input: [0, 0],
            target: [0]
        },
        {
            input: [1, 1],
            target: [0]
        },
        {
            input: [0, 1],
            target: [1]
        },
        {
            input: [1, 0],
            target: [1]
        }
    ];

    clog('%cXOR Gate Demo', 'font-size: 2em; font-weight: bold;');
    const nn = new NeuralNetwork(2, 1);
    nn.addHiddenLayer(6, actFunc.tanH);
    nn.outputActivation(actFunc.sigmoid);
    nn.makeWeights();
    clog('%c📉 Before Training', 'padding: 0.2em; font-size: 1.5em; background: #FF6E6E;');
    nn.exhibition(dataset);
    nn.train(5000, dataset);
    clog('%c📈 After Training', 'padding: 0.2em; font-size: 1.5em; background: #3BFF72;');
    nn.exhibition(dataset);
    nn.log();
}
