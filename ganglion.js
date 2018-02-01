/**
 * A tiny JavaScript Neural Network Library
 */

var ganglion = (function()
		{
	/**
	 * A tiny JavaScript Neural Network Library - Main Wrapper Method^
	 * Currently built for use with a genetic algorithm
	 */


	//Static Variables

	this.version = 0.1;

	//graphics
	var clearcolor	= "#282A37";
	var offcolor	= "#54584B";
	var oncolor		= "#7DB213";

	TransferfunctionType = {
			Linear : {
				value : 0,
				name : "tf_linear",
				code : "L"
			},
			Sigmoid : {
				value : 1,
				name : "tf_sigmoid",
				code : "S"
			}
	}

	var currentTF = TransferfunctionType.Sigmoid;

	var base_weight = 0.6;
	var base_bias = 0.9;
	var base_tresh = 0.9;

	var mbw = base_weight;	//max base weight
	var mbb = base_bias;	//max base bias
	var mbt = base_tresh;	//max base treshold

	var no_render = false;

	//Private /Internal Methods

	function networkLayer(inputsize, layersize, outputsize, rand) {
		var random = rand != null;

		this.inputs = [];
		this.outputs = [];
		this.neurons = [];

		for (var i = 0; i < layersize; i++) {
			var tmpneuron;
			if(random)
			{
				tmpneuron = new neuron(rand.next(-mbb,mbb), rand.next(-mbt,mbt),rand);
			}else
			{
				tmpneuron = new neuron(base_bias, base_tresh);
			}
			this.outputs.push(tmpneuron.getOutput());
			this.neurons.push(tmpneuron);
		}

		this.setInputs = function(inputs) {
			this.inputs = inputs;
			for (i = 0; i < this.neurons.length; i++) {
				//console.log(this.neurons[i]);
				// neuron.getOutput();
				this.neurons[i].setInputs(inputs);
			}
		}

		this.getOutputs = function() {
			return this.outputs;
		}

		this.work = function(){
			// this.setInputs(inputs);
			for(var i=0;i<this.neurons.length;i++) {
				this.neurons[i].transferfunction();
			}
		}
	}

	function neuron(bias, threshold, rand) {
		var random = rand != null;
		this.rand = rand;
		this.bias = bias;
		this.threshold = threshold;

		var n = 0;

		var inputs = [];
		this.output = new connection();

		this.setInputs = function(inputs) {
			this.inputs = inputs;

			for(var i=0;i<inputs.length;i++){
				if(random)
				{
					n = inputs[i].addOutput(this.rand.next(-mbw,mbw));
				}else
				{
					n = inputs[i].addOutput(base_weight);
				}

			}
		}

		this.setBias = function(b) {
			this.bias = b;
		}

		this.getBias = function() {
			return this.bias;
		}

		this.setThreshold = function(th) {
			this.threshold = th;
		}

		this.getThreshold = function() {
			return this.threshold;
		}

		this.getOutput = function() {
			return this.output;
		}

		this.transferfunction = function() {
			var inp = 0, out = 0;
			if (this.inputs != undefined) {
				for (var i=0;i<this.inputs.length;i++) {
					inp += this.inputs[i].getOutput(n);
				}
			}

			inp += this.bias;

			switch (currentTF) {
			case TransferfunctionType.Linear:
				if(input > this.threshold)
				{
					output = 1;
				}else {
					output = 0;
				}
				break;
			case TransferfunctionType.Sigmoid:
				out = Math.tanh(inp);
				break;
			};
			//console.log(out);
			this.output.setInput(out);
		}

		this.getGenome = function(){
			var genome = "{";
			genome += this.bias		+",";
			genome += this.threshold+"";
			genome += "}"
				return genome;
		}

	}

	function connection()
	{
		var sz = 0;
		var weights = [];
		this.input = 0;

		this.addOutput = function(weight)
		{
			sz++;
			weights.push(weight);

			return sz-1;
		}

		this.getWeight = function(i)
		{
			return weights[i];
		}

		this.setWeight = function(i,wg)
		{
			weights[i] = wg;
		}


		this.getSize = function()
		{
			return sz;
		}



		this.setInput = function(inp)
		{
			this.input = inp;
		}

		this.getInput = function()
		{
			return this.input;
		}

		this.getOutput = function(i)
		{
			if(i>sz)
			{
				return 0;
			}
			return this.input*weights[i];
		}
	}



	//Public Methods

	function setRendering(render)
	{
		no_render = !render;
	}

	function setBaseWeight(wg)
	{
		base_weight = wg;
		mbw = base_weight;
	}

	function setBaseBias(bi)
	{
		base_bias = bi;
		mbb = base_bias;
	}

	function setBaseThreshold(th)
	{
		base_tresh = th;
		mbt = base_tresh;
	}



	function setTransferFunction(tf)
	{
		currentTF = tf;
	}

	function neuralNetwork(layerconfig, canvas, rand) {
		this.layerconfig = layerconfig;
		var random = rand != null;
		var draw_self = canvas != null;

		this.canvas = canvas;
		this.layers = [];

		this.networkinput = [];
		for (var ii = 0; ii < layerconfig[0]; ii++)
		{
			this.networkinput.push(new connection());
		}
		this.networkoutput = [];

		// NetworkSetup
		var tmp;
		for (var i = 1; i < layerconfig.length; i++) {

			var tmpLayer = new networkLayer(layerconfig[i - 1], layerconfig[i],
					layerconfig[i + 1],rand);
			if (i == 1) {
				tmpLayer.setInputs(this.networkinput);
			} else {
				tmpLayer.setInputs(tmp);
			}

			tmp = tmpLayer.getOutputs();
			this.layers.push(tmpLayer);
		}
		this.networkoutput = tmp;

		this.runNetwork = function() {
			for (var i=0;i<this.layers.length;i++) {
				if(draw_self && !no_render)
				{
					drawNetwork(this, this.canvas);
				}
				this.layers[i].work();
			}

		}

		this.setNetworkInput = function(vars)
		{
			if(vars.length != this.networkinput.length)
			{
				return;
			}
			for(var i=0;i<this.networkinput.length;i++)
			{
				this.networkinput[i].setInput(vars[i]);
			}
		}

		this.getLayerconfig = function()
		{
			return this.layerconfig;
		}

		this.setCanvas = function(canvas)
		{
			draw_self = canvas != null;
			this.canvas = canvas;
		}

		this.getCanvas = function()
		{
			return this.canvas;
		}
	}

	function drawNetwork(network, canvas)
	{
		//console.log("Drawing NN")
		//TODO fix alignment glitch

		context = canvas.getContext("2d");

		let sx = canvas.getBoundingClientRect().width;
		let sy = canvas.getBoundingClientRect().height;

		canvas.setAttribute('width', sx);
		canvas.setAttribute('height',sy);

		//--
		var maxn = 0;
		for(var li=0;li<network.layers.length;li++){
			maxn = Math.max(maxn,network.layers[li].neurons.length);
		}
		maxn = Math.max(maxn,network.networkinput.length);
		maxn = Math.max(maxn,network.networkoutput.length);


		var nsx = sx / (1+(2*network.layers.length));
		var nsy = sy / (1+(2*maxn));

		var szneuron = Math.min(nsx,nsy);

		var s = Math.min(sx,sy);

		var n_columns = network.layers.length+2;
		var xpad = sx ; //- (n_columns*szneuron)
		xpad/= (1+n_columns)+1;


		//--DRAW

		// ----clear-----
		clearCanvas(clearcolor, context,sx,sy);

		// then draw
		for(var li=0;li<network.layers.length;li++){
			var ny = network.layers[li].neurons.length;
			var offy = sy - (((2*ny)-1)*szneuron);
			offy/=2;

			for(var ni=0;ni<ny;ni++){
				var x;
				if(currentTF == TransferfunctionType.Sigmoid){
					x = (network.layers[li].neurons[ni].getOutput().getInput()+1)/2;// activation as a 0-1 parameter
				}
				context.fillStyle = blend_colors(offcolor, oncolor, x);

				context.beginPath();
				context.arc( ((2+li)*xpad) + ((0,5)*szneuron), offy+((2*ni)*szneuron), szneuron/2, 0, 2 * Math.PI, false);
				context.fill();

			}
		}

		//then draw I/O Layers

		//INPUT
		var ny = network.networkinput.length;
		var offy = sy - (((2*ny)-1)*szneuron);
		offy/=2;

		for(var ni=0;ni<ny;ni++){
			var x;
			if(currentTF == TransferfunctionType.Sigmoid){
				x = (network.networkinput[ni].getInput()+1)/2;// activation as a 0-1 parameter
			}
			context.fillStyle = blend_colors(offcolor, oncolor, x);

			context.beginPath();
			context.arc( (xpad) + ((0,5)*szneuron), offy+((2*ni)*szneuron), szneuron/2, 0, 2 * Math.PI, false);
			context.fill();

		}
	}


	//Methods for using artifial evolution

	function mutateNetwork(rng, network, factor, p)
	{

		var mut = (function(rng, network, factor, p){
			this.rng = rng;
			this.network = network;
			this.factor = factor;
			this.p = p;

			var m = function mutateValue(variable){
				var tmp = 0;
				if(rng.nextBool(p)) //decide wether or not to mutate
				{
					if(rng.nextBool())
					{
						tmp = factor;
					}else{
						tmp = -factor;
					}
				}
				tmp += variable;
				return tmp;
			}
			return m;
		})(rng, network, factor, p);

		function mutateLayer(layer)
		{

			//Mutate Neurons
			for(var i=0;i<layer.neurons.length;i++) {
				var tmp = mut(layer.neurons[i].getBias());
				layer.neurons[i].setBias(tmp);

				layer.neurons[i].setThreshold(
						mut(layer.neurons[i].getThreshold()));

			}

			//mutate connections

			for(var i=0;i<layer.outputs.length;i++) {
				for(var ii=0;ii<layer.outputs[i].getSize();ii++) {

					layer.outputs[i].setWeight(ii,
							mut(layer.outputs[i].getWeight(ii)));

				}
			}

		}

		var tmp;
		for(var i=0;i<network.networkinput.length;i++) {
			for(var ii=0;ii<network.networkinput[i].getSize();ii++) {

				network.networkinput[i].setWeight(ii,
						mut(network.networkinput[i].getWeight(ii)));

			}
		}
		//input connections done

		for (var i=0;i<network.layers.length;i++) {
			mutateLayer(network.layers[i]);
		}
	}

	function breedNetworks(rng, network1, network2, factor, p)
	{
		//The following functions take advantage of the fact that network3 is a clone of network1

		var network3 = cloneNetwork(network1);

		function breedLayers(layer2,layer3)
		{

			//Breed Neurons
			for(var i=0;i<layer3.neurons.length;i++) {

				if(rng.nextBool())
				{
					layer3.neurons[i].setBias(layer2.neurons[i].getBias());

					layer3.neurons[i].setThreshold(layer2.neurons[i].getThreshold());
				}



			}

			//Breed connections

			for(var i=0;i<layer3.outputs.length;i++) {
				for(var ii=0;ii<layer3.outputs[i].getSize();ii++) {

					if(rng.nextBool())
					{
						layer3.outputs[i].setWeight(ii,layer2.outputs[i].getWeight(ii));
					}
				}
			}

		}

		var tmp;
		for(var i=0;i<network3.networkinput.length;i++) {
			for(var ii=0;ii<network3.networkinput[i].getSize();ii++) {

				if(rng.nextBool())
				{
					network3.networkinput[i].setWeight(ii,network2.networkinput[i].getWeight(ii));
				}


			}
		}
		//input connections done

		for (var i=0;i<network3.layers.length;i++) {
			breedLayers(network2.layers[i],network3.layers[i]);
		}

		mutateNetwork(rng, network3, factor, p);

		return network3;
	}

	function cloneNetwork(network1)
	{
		//TODO clean up function
		var network2 = new neuralNetwork(network1.getLayerconfig(), network1.getCanvas(),null);

		function cloneLayer(layer1,layer2)
		{

			//Clone Neurons
			for(var i=0;i<layer2.neurons.length;i++) {
				layer2.neurons[i].setBias(layer1.neurons[i].getBias());

				layer2.neurons[i].setThreshold(layer1.neurons[i].getThreshold());
			}

			//Clone connections

			for(var i=0;i<layer2.outputs.length;i++) {
				for(var ii=0;ii<layer2.outputs[i].getSize();ii++) {
					layer2.outputs[i].setWeight(ii,layer1.outputs[i].getWeight(ii));
				}
			}

		}

		var tmp;
		for(var i=0;i<network2.networkinput.length;i++) {
			for(var ii=0;ii<network2.networkinput[i].getSize();ii++) {
				network2.networkinput[i].setWeight(ii,network1.networkinput[i].getWeight(ii));
			}
		}
		//input connections done

		for (var i=0;i<network2.layers.length;i++) {
			cloneLayer(network1.layers[i],network2.layers[i]);
		}

		return network2;
	}

	function saveNetwork(network)
	{
		let data = "net:{";

		let tmp = network.getLayerconfig();
		//first save network layerconfig
		data += tmp.length+","; //first add length
		for(let i=0;i<tmp.length;i++){
			data += tmp[i]+",";
		}
		//end of layerconfig part


		function saveLayer(layer)
		{

			//Save Neurons
			for(var i=0;i<layer.neurons.length;i++) {
				data += layer.neurons[i].getBias()+",";
				data += layer.neurons[i].getThreshold()+",";
			}

			//Save connections

			for(var i=0;i<layer.outputs.length;i++) {
				for(var ii=0;ii<layer.outputs[i].getSize();ii++) {
					data += layer.outputs[i].getWeight(ii)+",";
				}
			}

		}

		//input connections
		for(let i=0;i<network.networkinput.length;i++) {
			for(let ii=0;ii<network.networkinput[i].getSize();ii++) {
				data += network.networkinput[i].getWeight(ii)+",";

			}
		}
		//input connections done

		for (var i=0;i<network.layers.length;i++) {
			saveLayer(network.layers[i]);
		}

		return data.replace(/.$/,"")+"}";
	}

	function loadNetwork(data)
	{
		//clean up data and make it an char array
		data = data.replace("net:{", "");
		data = data.replace("}", "");
		data = data.split(",");

		for(let i=0;i<data.length;i++){
			data[i] = parseFloat(data[i]);
		}

		let cpos = 0;

		let tmp = [];
		//first load network layerconfig
		for(let i=0;i<data[0];i++){
			tmp.push(data[i+1]);
		}
		cpos = data[0]+1;
		//end of layerconfig part

		//Then make a new Network (tmp now contains the layerconfig)
		let network = new neuralNetwork(tmp, null,null);


		function loadLayer(layer)
		{

			//Load Neurons
			for(var i=0;i<layer.neurons.length;i++) {
				layer.neurons[i].setBias(data[cpos]);
				cpos++;
				layer.neurons[i].setThreshold(data[cpos]);
				cpos++;
			}

			//Load connections

			for(var i=0;i<layer.outputs.length;i++) {
				for(var ii=0;ii<layer.outputs[i].getSize();ii++) {
					layer.outputs[i].setWeight(ii,data[cpos]);
					cpos++;
				}
			}

		}

		//input connections
		for(let i=0;i<network.networkinput.length;i++) {
			for(let ii=0;ii<network.networkinput[i].getSize();ii++) {
				network.networkinput[i].setWeight(ii,data[cpos]);
				cpos++;
			}
		}
		//input connections done

		for (var i=0;i<network.layers.length;i++) {
			loadLayer(network.layers[i]);
		}

		if(cpos != data.length)
		{
			console.log("loading error...")
		}
		return network;
	}

	function compareNetworks(network1, network2)
	{
		if(network1.getLayerconfig().length == network2.getLayerconfig().length)
		{
			for(let i=0;i<network1.getLayerconfig().length;i++){
				if(network1.getLayerconfig()[i] != network1.getLayerconfig()[i])
				{
					return false;
				}
			}
		}else
		{
			return false;
		}

		function compareLayers(layer1,layer2)
		{

			//compare Neurons
			for(var i=0;i<layer1.neurons.length;i++) {

				if(layer1.neurons[i].getBias() != layer2.neurons[i].getBias() || layer1.neurons[i].getThreshold() != layer2.neurons[i].getThreshold())
				{
					return false;
				}

			}

			//compare connections

			for(var i=0;i<layer1.outputs.length;i++) {
				for(var ii=0;ii<layer1.outputs[i].getSize();ii++) {

					if(layer1.outputs[i].getWeight(ii) != layer2.outputs[i].getWeight(ii))
					{
						return false;
					}

				}
			}

		}

		var tmp;
		//do input weights
		for(let i=0;i<network1.networkinput.length;i++) {
			for(let ii=0;ii<network1.networkinput[i].getSize();ii++) {

				if(network1.networkinput[i].getWeight(ii) != network2.networkinput[i].getWeight(ii))
				{
					return false;
				}

			}
		}

		for (var i=0;i<network1.layers.length;i++) {
			compareLayers(network1.layers[i],network2.layers[i]);
		}

		return true;
	}

	return {
		TransferfunctionType: TransferfunctionType,
		setBaseWeight: setBaseWeight,
		setBaseBias: setBaseBias,
		setBaseThreshold: setBaseThreshold,
		setTransferFunction: setTransferFunction,

		neuralNetwork: neuralNetwork,

		drawNetwork: drawNetwork,
		mutateNetwork: mutateNetwork,
		breedNetworks: breedNetworks,
		cloneNetwork: cloneNetwork,
		saveNetwork: saveNetwork,
		loadNetwork: loadNetwork,
		compareNetworks: compareNetworks
	}
		})();
