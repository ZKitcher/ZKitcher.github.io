const rand = (a, b) => a === undefined ? Math.random() : a instanceof Array ? a[floor(rand(a.length))] : b === undefined ? Math.random(1) * a : Math.random(1) * (b - a) + a;
const exp = x => Math.exp(x);
const abs = x => Math.abs(x);
const log = x => Math.log(x);
const pow = (x, e) => Math.pow(x, e);
const round = x => Math.round(x);
const sqrt = x => Math.sqrt(x);
const cosh = x => (exp(x) + exp(-x)) / 2;
const floor = x => Math.floor(x);
const cos = x => Math.cos(x);
const sin = x => Math.sin(x);
const max = (...arg) => Math.max(...arg);
const min = (...arg) => Math.min(...arg);
const PI = Math.PI;
const isNumber = x => typeof x === 'number';
const between = (num, minN, maxN) => Math.min(Math.max(num, minN), maxN);
const clog = (...arg) => console.log(...arg);
const boxMuller = () => Math.sqrt(-1 * log(rand())) * cos(1 * PI * rand());
const distanceBetweenPoints = (x1, y1, x2, y2) => sqrt(pow((x2 - x1), 2) + pow((y2 - y1), 2))
const unitVector = (x1, y1, x2, y2, steps, step) => {
    const distance = sqrt(pow((x2 - x1), 2) + pow((y2 - y1), 2));
    return {
        x: x1 + ((distance / steps) * step / distance) * (x2 - x1),
        y: y1 + ((distance / steps) * step / distance) * (y2 - y1)
    };
}

class Matrix {
    constructor(rows = 0, cols = 0, matrix = null) {
        this.rows = rows;
        this.cols = cols;
        let m = [[]];
        for (let i = 0; i < rows; i++) {
            m[i] = [];
            for (let j = 0; j < cols; j++) {
                m[i][j] = 0;
            }
        }
        this.matrix = matrix ? matrix : m;
    };

    print() {
        console.table(this.matrix)
    }

    // --------------------------------------------------------------------------------------------------------------------
    // Create a Number[][] matrix, all values set to 0.
    // { Number } x the x component of the Number[][] matrix.
    // { Number } y the y component of the Number[][] matrix.
    static make(rows = 0, cols = 0) {
        let m = [[]];
        for (let i = 0; i < rows; i++) {
            m[i] = [];
            for (let j = 0; j < cols; j++) {
                m[i][j] = 0;
            }
        }
        return m;
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Add two Matrix objects together.
    // { Number | Matrix } n Number value or Matrix to add to the Matrix object.
    static add(a, b) {
        let ans = new Matrix(a.rows, a.cols);

        if (this.rows !== n.rows || this.cols !== n.cols) {
            NetworkError.error('Matrix dimensions should match', 'Matrix.add');
            return;
        } else {
            for (let i = 0; i < ans.rows; i++) {
                for (let j = 0; j < ans.cols; j++) {
                    ans.matrix[i][j] = a.matrix[i][j] + b.matrix[i][j];
                }
            }
        }
        return ans;
    };

    // Add a value or Matrix to a Matrix object.
    add(n) {
        if (n instanceof Matrix) {
            if (this.rows !== n.rows || this.cols !== n.cols) {
                NetworkError.error('Matrix dimensions should match', '.add');
                return;
            } else {
                for (let i = 0; i < this.rows; i++) {
                    for (let j = 0; j < this.cols; j++) {
                        this.matrix[i][j] += n.matrix[i][j];
                    }
                }
                return this;
            }
        } else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.matrix[i][j] += n;
                }
            }
            return this;
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // { Number } magnitude The scalar applied to the value
    addPercent(scalar) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let w = this.matrix[i][j];
                this.matrix[i][j] += w * scalar;
            }
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // { Number } magnitude The range in which to initiate a random value in the equation.
    // { Number } prob The probability of a value being affected(between 0 and 1)
    addRandom(magnitude, prob) {
        let newMatrix = Matrix.make(this.rows, this.cols);
        if (prob <= 0 || prob > 1) {
            NetworkError.error('Probability argument must be between 0 and 1', '.addRandom');
        } else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    let w = this.matrix[i][j];
                    let ran = rand(0, 1);
                    newMatrix[i][j] = ran < prob ? w + w * rand(-magnitude, magnitude) : w;
                }
            }
        }
        this.set(newMatrix);
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Set a Matrix object.
    // { Number[][] } matrix A matrix with which to set the current Matrix object with.
    set(matrix) {
        if (
            typeof matrix.length === 'number' &&
            typeof matrix[0].length === 'number' &&
            typeof matrix === 'object'
        ) {
            this.rows = matrix.length;
            this.cols = matrix[0].length;

            for (let i = 0; i < this.rows; i++) {
                this.matrix[i] = [...matrix[i]];
            }
        } else {
            NetworkError.error('the argument of set(); must be an array within an array. Here is an example: [[1,0],[0,1]]', '.set');
            return;
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Fill a column of a matrix with a value.
    // { Number } col The column to fill
    // { Number } num The value to fill the column with
    fillCol(col, num) {
        if (col >= this.cols) {
            NetworkError.error('The column index specified is too large for this matrix.', '.fillCol');
            return;
        }
        for (let i = 0; i < this.rows; i++) {
            this.matrix[i][col] = num;
        }
        return this;
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Fill a specific row in a matrix.
    // { Number } row The row index to fill
    // { Number } num The value to fill the row with
    fillRow(row, num) {
        if (row >= this.rows) {
            NetworkError.error('The row index specified is too large for this matrix.', '.fillRow');
            return;
        }
        this.matrix[row].fill(num);
        return this;
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Convert an Array into a Matrix Object
    // { Array } array The array to convert into a Matrix.
    // { Matrix } 1 row, n col Matrix Object
    static fromArray(array) {
        let m = new Matrix(array.length, 1);
        for (let i = 0; i < array.length; i++) {
            m.matrix[i][0] = array[i];
        }
        return m;
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Initiate a matrix with a certain value.
    // { Number } The value to initiate te Matrix with.
    initiate(value = 0) {
        if (value !== undefined) {
            if (isNumber(value)) {
                for (let i = 0; i < this.matrix.length; i++) {
                    for (let j = 0; j < this.matrix[i].length; j++) {
                        this.matrix[i][j] = value;
                    }
                }
                return this;
            } else {
                NetworkError.error('The value entered as an argument is not a number', '.initiate');
                return;
            }
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Set a specific value at a coordinate in the matrix
    // { Number } value The value to be inserted into the specified coordinates in the matrix
    // { Number } x Row index
    // { Number } y Column index
    insert(value, x, y) {
        if (!isNumber(value)) {
            NetworkError.error('Expected Number for "value" argument', '.insert');
            return;
        }
        if (!isNumber(x)) {
            NetworkError.error('Expected Number for "x" argument', '.insert');
            return;
        }
        if (!isNumber(y)) {
            NetworkError.error('Expected Number for "y" argument', '.insert');
            return;
        }
        if (x < this.rows && y < this.cols) {
            this.matrix[x][y] = value;
            return this;
        } else {
            NetworkError.error('x, y arguments exceed the matrix dimensions.', '.insert');
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Map matrix values to a function
    // { Function } fn The function with which to map the matrix values.
    map(fn) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let v = this.matrix[i][j];
                this.matrix[i][j] = fn(v);
            }
        }
        return this;
    };

    // { Function } m The Matrix with which to apply the operation.
    static map(m, fn) {
        if (m instanceof Matrix) {
            for (let i = 0; i < m.rows; i++) {
                for (let j = 0; j < m.cols; j++) {
                    let v = m.matrix[i][j];
                    m.matrix[i][j] = fn(v);
                }
            }
            return m;
        } else {
            NetworkError.error('First argument must be an instance of Matrix', 'Matrix.map');
            return;
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Multiply a Matrix object by an other matrix or a scalar
    // { Matrix | Number } n Scalar or Matrix to multiply to the Matrix object.
    mult(n) {
        if (n instanceof Matrix) {
            if (this.rows !== n.rows || this.cols !== n.cols) {
                NetworkError.error('The matrix dimensions should match in order to multiply their values. If you are looking for dot product, try Matrix.mult', '.mult');
                return;
            } else {
                for (let i = 0; i < this.rows; i++) {
                    for (let j = 0; j < this.cols; j++) {
                        this.matrix[i][j] *= n.matrix[i][j];
                    }
                }
                return this;
            }
        } else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.matrix[i][j] *= n;
                }
            }
            return this;
        }
    };

    // { Matrix } a The first matrix in the operation.
    // { Matrix } b The second matrix in the operation.
    static mult(a, b) {
        let ans = new Matrix(a.rows, b.cols);
        if (a instanceof Matrix && b instanceof Matrix) {
            if (a.cols !== b.rows) {
                NetworkError.error('The rows of B must match the columns of A', 'Matrix.mult');
                return;
            } else {
                for (let i = 0; i < ans.rows; i++) {
                    for (let j = 0; j < ans.cols; j++) {
                        let sum = 0;
                        for (let k = 0; k < a.cols; k++) {
                            sum += a.matrix[i][k] * b.matrix[k][j];
                        }
                        ans.matrix[i][j] = sum;
                    }
                }
            }
            return ans;
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Randomize a Matrix Object's values
    // { Number } min the minimum possible random value.
    // { Number } max the maximum possible random value.
    randomize(min, max) {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j] = rand(min, max);
            }
        }
        return this;
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Subtract a value or Matrix to a matrix object.
    // { Number | Matrix } n Number to subtract to the matrix.
    sub(n) {
        if (n instanceof Matrix) {
            if (this.rows !== n.rows || this.cols !== n.cols) {
                NetworkError.error('Matrix dimensions should match', '.sub');
                return;
            } else {
                for (let i = 0; i < this.rows; i++) {
                    for (let j = 0; j < this.cols; j++) {
                        this.matrix[i][j] -= n.matrix[i][j];
                    }
                }
                return this;
            }
        } else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.matrix[i][j] -= n;
                }
            }
            return this;
        }
    };

    // { Matrix } a The first Matrix object in the operation.
    // { Matrix } b The second Matrix object in the operation.
    static sub(a, b) {
        if (a instanceof Matrix && b instanceof Matrix) {
            if (a.rows !== b.rows || a.cols !== b.cols) {
                NetworkError.error('The matrix dimensions should match', 'Matrix.sub');
                return undefined;
            } else {
                let result = new Matrix(a.rows, a.cols);
                for (let i = 0; i < result.rows; i++) {
                    for (let j = 0; j < result.cols; j++) {
                        result.matrix[i][j] = a.matrix[i][j] - b.matrix[i][j];
                    }
                }
                return result;
            }
        } else {
            NetworkError.error('The arguments should be matrices', 'Matrix.sub');
            return undefined;
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Retun a matrix with averaged object values.
    // { Matrix } a The first Matrix object in the operation.
    // { Matrix } b The second Matrix object in the operation.
    static mean(a, b) {
        if (a instanceof Matrix && b instanceof Matrix) {
            if (a.rows !== b.rows || a.cols !== b.cols) {
                NetworkError.error('The matrix dimensions should match', 'Matrix.sub');
                return undefined;
            } else {
                let result = new Matrix(a.rows, a.cols);
                for (let i = 0; i < result.rows; i++) {
                    for (let j = 0; j < result.cols; j++) {
                        result.matrix[i][j] = (a.matrix[i][j] + b.matrix[i][j]) / 2;
                    }
                }
                return result;
            }
        } else {
            NetworkError.error('The arguments should be matrices', 'Matrix.mean');
            return undefined;
        }
    };

    static merge(a, b) {
        if (a instanceof Matrix && b instanceof Matrix) {
            if (a.rows !== b.rows || a.cols !== b.cols) {
                NetworkError.error('The matrix dimensions should match', 'Matrix.sub');
                return undefined;
            } else {
                let result = new Matrix(a.rows, a.cols);
                for (let i = 0; i < result.rows; i++) {
                    for (let j = 0; j < result.cols; j++) {
                        let ran = rand(0, 1);
                        result.matrix[i][j] = ran < 0.5 ? a.matrix[i][j] : b.matrix[i][j];
                    }
                }
                return result;
            }
        } else {
            NetworkError.error('The arguments should be matrices', 'Matrix.mean');
            return undefined;
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Convert a(1 by n) or(n by 1) Matrix object to an array.
    toArray() {
        let ans = [];
        if (this.cols === 1) {
            for (let i = 0; i < this.rows; i++) {
                ans[i] = this.matrix[i][0];
            }
            return ans;
        } else if (this.rows === 1) {
            ans = this.matrix[0];
            return ans;
        } else {
            NetworkError.error('None of the lengths of the matrix equal 1', '.toArray');
            return undefined;
        }
    };

    static toArray(m) {
        let ans = [];
        if (m.cols === 1) {
            for (let i = 0; i < m.rows; i++) {
                ans[i] = m.matrix[i][0];
            }
            return ans;
        } else if (m.rows === 1) {
            ans = m.matrix[0];
            return ans;
        } else {
            NetworkError.error('None of the lengths of the matrix equal 1', 'Matrix.toArray');
            return undefined;
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Transpose operation of a matrix.Invert row coordinates with column coordinates
    // { Matrix } m The matrix to be transposed.
    static transpose(m) {
        let result = new Matrix(m.cols, m.rows);
        for (let i = 0; i < m.rows; i++) {
            for (let j = 0; j < m.cols; j++) {
                result.matrix[j][i] = m.matrix[i][j];
            }
        }
        return result;
    };

    // --------------------------------------------------------------------------------------------------------------------
    // Boolean for matching dimentions of a given matrices.
    // { Matrix, Matrix } m The matrix to find dimentions.
    static matchingDimentions(a, b) {
        if (a instanceof Matrix && b instanceof Matrix) {
            return a.rows === b.rows && a.cols === b.cols
        } else {
            NetworkError.error('The arguments should be matrices', 'Matrix.matchingDimentions');
            return undefined;
        }
    };

    // --------------------------------------------------------------------------------------------------------------------
    // { Object } [options] Object including specific properties.
    log(options = { table: false, decimals: undefined }) {
        let m = new Matrix(this.rows, this.cols);
        m.set(this.matrix);

        if (options.decimals !== undefined) {
            let dec = 1000;
            if (options.decimals > 21) {
                NetworkError.warn('Maximum number of decimals is 21.', 'Matrix.log');
                dec = pow(10, 21);
            } else {
                dec = pow(10, options.decimals) || dec;
            }
            m.map((x) => round(x * dec) / dec);
        }

        if (options.table) {
            console.table(m.matrix);
        } else {
            console.log(m);
        }
    };
}

const normaliseData = (data, min, max) => {
    if (min === undefined || max === undefined) {
        min = minValue(data);
        max = maxValue(data);
    }
    return data.map(e => (e - min) / (max - min))
}

const maxValue = (arr) => {
    let record = 0;
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        if (arr[i] > record) {
            record = arr[i];
        }
    }
    return record;
}

const minValue = (arr) => {
    let record = Infinity;
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        if (arr[i] < record) {
            record = arr[i];
        }
    }
    return record;
}

const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

const smoothen = (vector, variance = 0.5) => {
    var t_avg = avg(vector) * variance;
    var ret = Array(vector.length);
    for (var i = 0; i < vector.length; i++) {
        var prev = i > 0 ? ret[i - 1] : vector[i];
        var next = i < vector.length ? vector[i] : vector[i - 1];
        ret[i] = avg([t_avg, avg([prev, vector[i], next])]);
    }
    return ret;
}

const lossfuncs = {
    mae(predictions, target) {
        let sum = 0;
        let ans = 0;
        let n = target.length;
        for (let i = 0; i < n; i++) {
            let y = target[i];
            let yHat = predictions[i];
            sum += abs(y - yHat);
        }
        ans = sum / n;
        return ans;
    },
    bce(predictions, target) {
        let sum = 0;
        let ans = 0;
        let n = target.length;
        for (let i = 0; i < n; i++) {
            let y = target[i];
            let yHat = predictions[i];
            sum += y * log(yHat) + (1 - y) * log(1 - yHat);
        }
        ans = -sum / n;
        return ans;
    },
    lcl(predictions, target) {
        let sum = 0;
        let ans = 0;
        let n = target.length;
        for (let i = 0; i < n; i++) {
            let y = target[i];
            let yHat = predictions[i];
            sum += log(cosh(yHat - y));
        }
        ans = sum / n;
        return ans;
    },
    mbe(predictions, target) {
        let sum = 0;
        let ans = 0;
        let n = target.length;
        for (let i = 0; i < n; i++) {
            let y = target[i];
            let yHat = predictions[i];
            sum += y - yHat;
        }
        ans = sum / n;
        return ans;
    },
    mael(predictions, target) {
        let sum = 0;
        let ans = 0;
        let n = target.length;
        for (let i = 0; i < n; i++) {
            let y = target[i];
            let yHat = predictions[i];
            let x = y - yHat;

            let top = -x * (exp(-x) - 1);
            let down = exp(-x) + 1;
            sum += top / down;
        }
        ans = sum / n;
        return ans;
    },
    rmse(predictions, target) {
        let sum = 0;
        let ans = 0;
        let n = target.length;
        for (let i = 0; i < n; i++) {
            let y = target[i];
            let yHat = predictions[i];
            sum += pow(y - yHat, 2);
        }
        ans = sqrt(sum / n);
        return ans;
    },
    mce(predictions, target) {
        let sum = 0;
        let ans = 0;
        let n = target.length;
        for (let i = 0; i < n; i++) {
            let y = target[i];
            let yHat = predictions[i];
            sum += pow(abs(y - yHat), 3);
        }
        ans = sum / n;
        return ans;
    },
    mse(predictions, target) {
        let sum = 0;
        let ans = 0;
        let n = target.length;
        for (let i = 0; i < n; i++) {
            let y = target[i];
            let yHat = predictions[i];
            sum += pow(y - yHat, 2);
        }
        ans = sum / n;
        return ans;
    },
    quantile(predictions, target, percentile) {
        let q = percentile;
        let sum = 0;
        for (let i = 0; i < target.length; i++) {
            if (target[i] - predictions[i] >= 0) {
                sum += q * (target[i] - predictions[i]);
            } else {
                sum += (q - 1) * (target[i] - predictions[i]);
            }
        }
        return sum / target.length;
    },
};

const activations = {
    sigmoid(x) {
        return 1 / (1 + exp(-x));
    },
    sigmoid_d(x) {
        let x1 = 1 / (1 + exp(-x));
        return x1 * (1 - x1);
    },
    silu(x) {
        return x / (1 + exp(-x));
    },
    silu_d(x) {
        let top = 1 + exp(-x) + x * exp(-x);
        let down = pow(1 + exp(-x), 2);
        return top / down;
    },
    tanh(x) {
        let top = exp(x) - exp(-x);
        let down = exp(x) + exp(-x);
        return top / down;
    },
    tanh_d(x) {
        let numer = pow(exp(2 * x) - 1, 2);
        let denom = pow(exp(2 * x) + 1, 2);
        return 1 - numer / denom;
    },
    leakyrelu(x) {
        return max(x, x * 0.01);
    },
    leakyrelu_d(x) {
        if (x >= 0) {
            return 1;
        } else {
            return 0.01;
        }
    },
    relu(x) {
        return max(x, 0);
    },
    relu_d(x) {
        if (x >= 0) {
            return 1;
        } else {
            return 0;
        }
    },
    sinc(x) {
        if (x === 0) {
            return 1;
        } else {
            return sin(x) / x;
        }
    },
    sinc_d(x) {
        if (x === 0) {
            return 0;
        } else {
            return cos(x) / x - sin(x) / (x * x);
        }
    },
    softsign(x) {
        return x / (1 + abs(x));
    },
    softsign_d(x) {
        let down = 1 + abs(x);
        return 1 / (down * down);
    },
    binary(x) {
        if (x <= 0) {
            return 0;
        } else {
            return 1;
        }
    },
    binary_d(x) {
        return 0;
    },
    softplus(x) {
        return log(1 + exp(x));
    },
    softplus_d(x) {
        return 1 / (1 + exp(-x));
    },
    leakyrelucapped(x) {
        if (x >= 0 && x <= 6) {
            return x;
        } else if (x < 0) {
            return 0.1 * x;
        } else {
            return 6;
        }
    },
    leakyrelucapped_d(x) {
        if (x >= 0 && x <= 6) {
            return 1;
        } else if (x < 0) {
            return 0.1;
        } else {
            return 0;
        }
    },
    leakysigmoid(x) {
        return 1 / (1 + exp(-x)) + x / 100;
    },
    leakysigmoid_d(x) {
        return exp(-x) / pow(exp(-x) + 1, 2) + 1 / 100;
    },
};
