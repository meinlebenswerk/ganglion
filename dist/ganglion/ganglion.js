"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var TransferfunctionType;
(function (TransferfunctionType) {
    TransferfunctionType["Linear"] = "tf_linear";
    TransferfunctionType["Sigmoid"] = "tf_sigmoid";
})(TransferfunctionType = exports.TransferfunctionType || (exports.TransferfunctionType = {}));
//WIP
var networkhelper = /** @class */ (function () {
    function networkhelper(random, base_data, seed) {
        this.weight = [];
        this.bias = [];
        this.tresh = [];
        this.use_random = false;
        this.random = new utils_1.seededRandom(0);
        this.currentTF = TransferfunctionType.Sigmoid;
        this.weight[0] = -0.6;
        this.weight[1] = +0.6;
        this.bias[0] = -0.9;
        this.bias[1] = +0.9;
        this.tresh[0] = -0.0;
        this.tresh[1] = +0.9;
        seed = seed || 0;
        if (base_data != null && base_data.length >= 6) {
            this.weight[0] = base_data[0];
            this.weight[1] = base_data[1];
            this.bias[0] = base_data[2];
            this.bias[1] = base_data[3];
            this.tresh[0] = base_data[4];
            this.tresh[1] = base_data[5];
        }
        this.use_random = random || false;
        if (this.use_random) {
            this.random = new utils_1.seededRandom(seed);
        }
    }
    networkhelper.prototype.nextWeight = function () {
        if (this.use_random) {
            return this.rngNext(this.weight[0], this.weight[1]);
        }
        return this.weight[1];
    };
    networkhelper.prototype.nextBias = function () {
        if (this.use_random) {
            return this.rngNext(this.bias[0], this.bias[1]);
        }
        return this.bias[1];
    };
    networkhelper.prototype.nextThreshold = function () {
        if (this.use_random) {
            return this.rngNext(this.tresh[0], this.tresh[1]);
        }
        return this.tresh[1];
    };
    networkhelper.prototype.rngNext = function (min, max) {
        return this.random.next(min, max);
    };
    networkhelper.prototype.rngNextBool = function (p) {
        p = p || 0.5;
        return this.rngNext() <= p;
    };
    networkhelper.prototype.transferfunction = function (input, threshold) {
        //TODO: implement this shiet
        switch (this.currentTF) {
            case TransferfunctionType.Linear:
                if (input > threshold) {
                    return 1;
                }
                else {
                    return 0;
                }
            case TransferfunctionType.Sigmoid:
                return Math.tanh(input);
        }
        ;
        return 0;
    };
    networkhelper.prototype.compareLayers = function (layer1, layer2) {
        //compare Neurons -> assert layer1&layer2 are the same size
        if (layer1.getLayersize() != layer2.getLayersize()) {
            return false;
        }
        for (var i = 0; i < layer1.neurons.length; i++) {
            if (layer1.neurons[i].getBias() != layer2.neurons[i].getBias() || layer1.neurons[i].getThreshold() != layer2.neurons[i].getThreshold()) {
                return false;
            }
        }
        //compare connections
        for (var i = 0; i < layer1.outputs.length; i++) {
            for (var ii = 0; ii < layer1.outputs[i].getSize(); ii++) {
                if (layer1.outputs[i].getWeight(ii) != layer2.outputs[i].getWeight(ii)) {
                    return false;
                }
            }
        }
        return true;
    };
    networkhelper.prototype.compareNetworks = function (network1, network2) {
        //Assert same size:
        if (network1.getLayerconfig().length != network2.getLayerconfig().length) {
            return false;
        }
        for (var i_1 = 0; i_1 < network1.getLayerconfig().length; i_1++) {
            if (network1.getLayerconfig()[i_1] != network2.getLayerconfig()[i_1]) {
                return false;
            }
        }
        var tmp;
        //do input weights
        for (var i_2 = 0; i_2 < network1.networkinput.length; i_2++) {
            for (var ii = 0; ii < network1.networkinput[i_2].getSize(); ii++) {
                if (network1.networkinput[i_2].getWeight(ii) != network2.networkinput[i_2].getWeight(ii)) {
                    return false;
                }
            }
        }
        for (var i = 0; i < network1.layers.length; i++) {
            this.compareLayers(network1.layers[i], network2.layers[i]);
        }
        return true;
    };
    //Methods for using artifial evolution
    networkhelper.prototype.mutateNetwork = function (network, factor, p) {
        var tmp = 0;
        for (var _i = 0, _a = network.networkinput; _i < _a.length; _i++) {
            var input = _a[_i];
            for (var i = 0; i < input.getSize(); i++) {
                tmp = this.mutateValue(input.getWeight(i), factor, p);
                input.setWeight(i, tmp);
            }
        }
        //input connections done
        for (var _b = 0, _c = network.layers; _b < _c.length; _b++) {
            var layer = _c[_b];
            this.mutateLayer(layer, factor, p);
        }
    };
    networkhelper.prototype.mutateValue = function (variable, factor, p) {
        var tmp = 0;
        if (this.rngNextBool(p)) {
            if (this.rngNextBool(0.5)) {
                tmp = factor;
            }
            else {
                tmp = -factor;
            }
            tmp += variable;
        }
        return tmp;
    };
    networkhelper.prototype.mutateLayer = function (layer, factor, p) {
        //Mutate Neurons
        var tmp = 0;
        for (var _i = 0, _a = layer.neurons; _i < _a.length; _i++) {
            var neuron_1 = _a[_i];
            tmp = this.mutateValue(neuron_1.getBias(), factor, p);
            neuron_1.setBias(tmp);
            tmp = this.mutateValue(neuron_1.getThreshold(), factor, p);
            neuron_1.setThreshold(tmp);
        }
        //mutate connections
        for (var _b = 0, _c = layer.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            for (var i = 0; i < output.getSize(); i++) {
                tmp = this.mutateValue(output.getWeight(i), factor, p);
                output.setWeight(i, tmp);
            }
        }
    };
    networkhelper.prototype.cloneNetwork = function (network1) {
        //TODO clean up function
        var network2 = new neuralnetwork(network1.getLayerconfig(), network1.getHelper());
        var tmp = 0;
        for (var i_3 = 0; i_3 < network2.networkinput.length; i_3++) {
            for (var ii = 0; ii < network2.networkinput[i_3].getSize(); ii++) {
                network2.networkinput[i_3].setWeight(ii, network1.networkinput[i_3].getWeight(ii));
            }
        }
        //input connections done
        for (var i = 0; i < network2.layers.length; i++) {
            this.cloneLayer(network1.layers[i], network2.layers[i]);
        }
        return network2;
    };
    networkhelper.prototype.cloneLayer = function (layer1, layer2) {
        //Clone Neurons
        for (var i = 0; i < layer1.getLayersize(); i++) {
            layer2.neurons[i].setBias(layer1.neurons[i].getBias());
            layer2.neurons[i].setThreshold(layer1.neurons[i].getThreshold());
        }
        //Clone connections
        for (var i = 0; i < layer1.outputs.length; i++) {
            for (var ii = 0; ii < layer2.outputs[i].getSize(); ii++) {
                layer2.outputs[i].setWeight(ii, layer1.outputs[i].getWeight(ii));
            }
        }
    };
    networkhelper.prototype.breedNetworks = function (network1, network2, factor, p) {
        //The following functions take advantage of the fact that network3 is a clone of network1
        var network3 = this.cloneNetwork(network1);
        var tmp;
        for (var i = 0; i < network3.networkinput.length; i++) {
            for (var ii = 0; ii < network3.networkinput[i].getSize(); ii++) {
                if (this.rngNextBool()) {
                    network3.networkinput[i].setWeight(ii, network2.networkinput[i].getWeight(ii));
                }
            }
        }
        //input connections done
        for (var i = 0; i < network3.layers.length; i++) {
            this.breedLayers(network2.layers[i], network3.layers[i]);
        }
        this.mutateNetwork(network3, factor, p);
        return network3;
    };
    networkhelper.prototype.breedLayers = function (layer1, layer2) {
        //Breed Neurons
        for (var i = 0; i < layer1.neurons.length; i++) {
            if (this.rngNextBool()) {
                layer1.neurons[i].setBias(layer2.neurons[i].getBias());
                layer1.neurons[i].setThreshold(layer2.neurons[i].getThreshold());
            }
        }
        //Breed connections
        for (var i = 0; i < layer1.outputs.length; i++) {
            for (var ii = 0; ii < layer1.outputs[i].getSize(); ii++) {
                if (this.rngNextBool()) {
                    layer1.outputs[i].setWeight(ii, layer2.outputs[i].getWeight(ii));
                }
            }
        }
    };
    networkhelper.prototype.saveNetwork = function (network) {
        var s = JSON.stringify(network);
        return s;
    };
    networkhelper.prototype.loadNetwork = function (data) {
        var nn = JSON.parse(data);
        return nn;
    };
    return networkhelper;
}());
exports.networkhelper = networkhelper;
//DONE
var networklayer = /** @class */ (function () {
    function networklayer(inputsize, layersize, outputsize, helper) {
        this.inputs = [];
        this.outputs = [];
        this.neurons = [];
        this.layersize = 0;
        this.inputsize = 0;
        this.outputsize = 0;
        this.inputsize = inputsize;
        this.layersize = layersize;
        this.outputsize = outputsize;
        this.helper = helper;
        this.initLayer();
    }
    networklayer.prototype.initLayer = function () {
        if (this.helper == null) {
            return;
        }
        for (var i = 0; i < this.layersize; i++) {
            var tmpneuron = new neuron(this.helper.nextBias(), this.helper.nextThreshold(), this.helper);
            this.outputs.push(tmpneuron.getOutput());
            this.neurons.push(tmpneuron);
        }
    };
    networklayer.prototype.setInputs = function (inputs) {
        this.inputs = inputs;
        for (var _i = 0, _a = this.neurons; _i < _a.length; _i++) {
            var neuron_2 = _a[_i];
            neuron_2.setInputs(this.inputs);
        }
    };
    networklayer.prototype.getOutputs = function () {
        return this.outputs;
    };
    networklayer.prototype.work = function () {
        for (var _i = 0, _a = this.neurons; _i < _a.length; _i++) {
            var neuron_3 = _a[_i];
            neuron_3.transferfunction();
        }
    };
    networklayer.prototype.getLayersize = function () {
        return this.layersize;
    };
    return networklayer;
}());
exports.networklayer = networklayer;
//DONE
var neuron = /** @class */ (function () {
    function neuron(bias, threshold, helper) {
        this.bias = bias;
        this.threshold = threshold;
        this.output = new neuralconnection();
        this.inputs = [];
        this.helper = helper;
        this.n = 0;
    }
    neuron.prototype.setInputs = function (inputs) {
        this.inputs = inputs;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            //register the output (with weight) in the connection -> n only needs to be set once, but every n should be the same
            this.n = input.addOutput(this.helper.nextWeight());
        }
    };
    neuron.prototype.setBias = function (bias) {
        this.bias = bias;
    };
    neuron.prototype.getBias = function () {
        return this.bias;
    };
    neuron.prototype.setThreshold = function (threshold) {
        this.threshold = threshold;
    };
    neuron.prototype.getThreshold = function () {
        return this.threshold;
    };
    neuron.prototype.getOutput = function () {
        return this.output;
    };
    neuron.prototype.transferfunction = function () {
        var inp = 0, out = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            //TODO check WTF this n means...
            inp += input.getOutput(this.n);
        }
        inp += this.bias;
        out = this.helper.transferfunction(inp, this.threshold);
        this.output.setInput(out);
    };
    return neuron;
}());
exports.neuron = neuron;
//DONE
var neuralconnection = /** @class */ (function () {
    function neuralconnection() {
        this.input = 0;
        this.size = 0;
        this.weights = [];
    }
    neuralconnection.prototype.addOutput = function (weight) {
        this.size++;
        this.weights.push(weight);
        return this.size - 1;
    };
    neuralconnection.prototype.getWeight = function (index) {
        return this.weights[index];
    };
    neuralconnection.prototype.getWeights = function () {
        return this.weights;
    };
    neuralconnection.prototype.setWeight = function (index, weight) {
        this.weights[index] = weight;
    };
    neuralconnection.prototype.getSize = function () {
        return this.size;
    };
    neuralconnection.prototype.setInput = function (value) {
        this.input = value;
    };
    neuralconnection.prototype.getInput = function () {
        return this.input;
    };
    neuralconnection.prototype.getOutput = function (index) {
        //bounds check::
        if (index >= this.size) {
            return 0;
        }
        return this.input * this.weights[index];
    };
    return neuralconnection;
}());
exports.neuralconnection = neuralconnection;
//DONE
var neuralnetwork = /** @class */ (function () {
    function neuralnetwork(layerconfig, helper) {
        this.layerconfig = [];
        this.layers = [];
        this.networkinput = [];
        this.networkoutput = [];
        this.layerconfig = layerconfig;
        this.helper = helper;
        this.initNetwork();
    }
    neuralnetwork.prototype.initNetwork = function () {
        //make Input Layer::
        for (var ii = 0; ii < this.layerconfig[0]; ii++) {
            this.networkinput.push(new neuralconnection());
        }
        this.networkoutput = [];
        var tmp, tmpLayer;
        tmp = this.networkinput;
        for (var i = 1; i < this.layerconfig.length; i++) {
            //inputsize, layersize, outputsize, nwhelper
            tmpLayer = new networklayer(this.layerconfig[i - 1], this.layerconfig[i], this.layerconfig[i + 1], this.helper);
            tmpLayer.setInputs(tmp);
            tmp = tmpLayer.getOutputs();
            this.layers.push(tmpLayer);
        }
        this.networkoutput = tmp;
    };
    neuralnetwork.prototype.runNetwork = function () {
        for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            //TODO: sort rendering...
            // if(draw_self && !no_render)
            // 			{
            // 				drawNetwork(this, this.canvas);
            // 			}
            layer.work();
        }
    };
    neuralnetwork.prototype.setNetworkInput = function (data) {
        //Assert the datas len
        if (data.length != this.networkinput.length) {
            return;
        }
        for (var i = 0; i < this.networkinput.length; i++) {
            this.networkinput[i].setInput(data[i]);
        }
    };
    neuralnetwork.prototype.getLayerconfig = function () {
        return this.layerconfig;
    };
    neuralnetwork.prototype.getHelper = function () {
        return this.helper;
    };
    neuralnetwork.prototype.getinputsize = function () {
        return this.networkinput.length;
    };
    neuralnetwork.prototype.getoutputsize = function () {
        return this.networkoutput.length;
    };
    neuralnetwork.prototype.getnetworksize = function () {
        //return the number of layers
        return this.layerconfig.length;
    };
    neuralnetwork.prototype.connectionsAt = function (i) {
        if (i === 0) {
            return this.networkinput;
        }
        else if (i <= this.layers.length) {
            return this.layers[i - 1].inputs;
        }
        else {
            return this.networkoutput;
        }
    };
    return neuralnetwork;
}());
exports.neuralnetwork = neuralnetwork;
var methyleneblue_1 = require("./methyleneblue");
exports.networkDrawHelper = methyleneblue_1.networkDrawHelper;
