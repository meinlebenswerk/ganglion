import {seededRandom} from './utils'
import {networkDrawHelper} from './methyleneblue'

export enum TransferfunctionType{
  Linear  = "tf_linear",
  Sigmoid = "tf_sigmoid"
}

//WIP

export class networkhelper{
  currentTF: TransferfunctionType;

  weight: number[];
  bias:   number[];
  tresh:  number[];

  use_random: boolean;
  random: seededRandom;

  constructor(random: boolean, base_data?: number[],  seed?: number){
    this.currentTF = TransferfunctionType.Sigmoid;

    this.weight[0]  = -0.6;
    this.weight[1]  = +0.6;
    this.bias[0]    = -0.9;
    this.bias[1]    = +0.9;
    this.tresh[0]   = -0.0;
    this.tresh[1]   = +0.9;

    seed = seed || 0;

    if(base_data != null && base_data.length>=6){
      this.weight[0]  = base_data[0];
      this.weight[1]  = base_data[1];
      this.bias[0]    = base_data[2];
      this.bias[1]    = base_data[3];
      this.tresh[0]   = base_data[4];
      this.tresh[1]   = base_data[5];
    }
    this.use_random = random || false;
    if(this.use_random){
      this.random = new seededRandom(seed);
    }
  }


  public nextWeight(): number {
    if(this.use_random){
      return this.rngNext(this.weight[0], this.weight[1]);
    }
    return this.weight[1];
  }

  public nextBias(): number {
    if(this.use_random){
      return this.rngNext(this.bias[0], this.bias[1]);
    }
    return this.bias[1];
  }

  public nextThreshold(): number {
    if(this.use_random){
      return this.rngNext(this.tresh[0], this.tresh[1]);
    }
    return this.tresh[1];
  }


  private rngNext(min?: number, max?: number): number{
    return this.random.next(min, max);
  }

  private rngNextBool(p?: number){
    p = p || 0.5;
    return this.rngNext()<=p;
  }


  public transferfunction(input: number, threshold: number): number {
    //TODO: implement this shiet
    switch(this.currentTF){
      case TransferfunctionType.Linear:
      if(input > threshold){
        return 1;
      }else {
        return 0;
      }
      case TransferfunctionType.Sigmoid:
        return Math.tanh(input);
    };
    return 0;
  }


  private compareLayers(layer1: networklayer, layer2: networklayer): boolean {
    //compare Neurons -> assert layer1&layer2 are the same size
    if(layer1.getLayersize() != layer2.getLayersize()) { return false; }
    for (let i=0;i<layer1.neurons.length;i++){
      if(layer1.neurons[i].getBias() != layer2.neurons[i].getBias() || layer1.neurons[i].getThreshold() != layer2.neurons[i].getThreshold()){ return false; }
    }
    //compare connections
    for(let i=0;i<layer1.outputs.length;i++) {
      for(let ii=0;ii<layer1.outputs[i].getSize();ii++) {
        if(layer1.outputs[i].getWeight(ii) != layer2.outputs[i].getWeight(ii)){ return false; }
      }
    }
    return true;
  }

  public compareNetworks(network1: neuralnetwork, network2: neuralnetwork): boolean {
    //Assert same size:
    if(network1.getLayerconfig().length != network2.getLayerconfig().length){ return false; }
    for(let i=0; i<network1.getLayerconfig().length;i++){
      if(network1.getLayerconfig()[i] != network2.getLayerconfig()[i]){ return false; }
    }

    var tmp;
    //do input weights

    for(let i=0;i<network1.networkinput.length;i++) {
      for(let ii=0;ii<network1.networkinput[i].getSize();ii++) {
        if(network1.networkinput[i].getWeight(ii) != network2.networkinput[i].getWeight(ii)) { return false; }
      }
    }

    for (var i=0;i<network1.layers.length;i++) {
      this.compareLayers(network1.layers[i],network2.layers[i]);
    }
    return true;
  }

  //Methods for using artifial evolution

  public mutateNetwork(network: neuralnetwork, factor: number, p: number){
    let tmp: number = 0;
    for (let input of network.networkinput){
      for(let i:number =0;i<input.getSize(); i++){
        tmp = this.mutateValue(input.getWeight(i),factor, p);
        input.setWeight(i, tmp);
      }
    }
		//input connections done
    for (let layer of network.layers){
      this.mutateLayer(layer, factor, p);
    }
  }

  private mutateValue(variable: number, factor: number, p: number): number{
    let tmp: number = 0;
    if(this.rngNextBool(p)){
      if(this.rngNextBool(0.5)){
        tmp = factor;
      }else{
        tmp = -factor;
      }
      tmp += variable;
    }
    return tmp;
  }

  private mutateLayer(layer: networklayer, factor: number, p: number){
    //Mutate Neurons
    let tmp: number = 0;
    for (let neuron of layer.neurons){
      tmp = this.mutateValue(neuron.getBias(), factor, p);
      neuron.setBias(tmp);

      tmp = this.mutateValue(neuron.getThreshold(), factor, p);
      neuron.setThreshold(tmp);
    }

    //mutate connections
    for (let output of layer.outputs){
      for(let i:number = 0;i<output.getSize();i++){
        tmp = this.mutateValue(output.getWeight(i), factor, p);
        output.setWeight(i, tmp);
      }
    }
  }


  public cloneNetwork(network1: neuralnetwork): neuralnetwork{
    //TODO clean up function
    let network2 = new neuralnetwork(network1.getLayerconfig(),network1.getHelper());
    let tmp = 0;

    for (let i=0; i<network2.networkinput.length; i++){
      for (let ii=0; ii<network2.networkinput[i].getSize(); ii++){
        network2.networkinput[i].setWeight(ii,network1.networkinput[i].getWeight(ii));
      }
    }

    //input connections done
    for (var i=0;i<network2.layers.length;i++) {
      this.cloneLayer(network1.layers[i],network2.layers[i]);
  	}
    return network2;
  }

	private cloneLayer(layer1: networklayer, layer2: networklayer){
    //Clone Neurons
    for (let i=0;i<layer1.getLayersize();i++){
      layer2.neurons[i].setBias(layer1.neurons[i].getBias());
      layer2.neurons[i].setThreshold(layer1.neurons[i].getThreshold());
    }

    //Clone connections
    for (let i=0;i<layer1.outputs.length;i++) {
      for(var ii=0;ii<layer2.outputs[i].getSize();ii++) {
        layer2.outputs[i].setWeight(ii,layer1.outputs[i].getWeight(ii));
      }
    }
  }


  public breedNetworks(network1: neuralnetwork, network2: neuralnetwork, factor: number, p: number){
    //The following functions take advantage of the fact that network3 is a clone of network1
    let network3: neuralnetwork = this.cloneNetwork(network1);
    let tmp: number;

    for(var i=0;i<network3.networkinput.length;i++) {
  			for(var ii=0;ii<network3.networkinput[i].getSize();ii++) {
  				if(this.rngNextBool()){
  					network3.networkinput[i].setWeight(ii,network2.networkinput[i].getWeight(ii));
  				}


  			}
  		}
  		//input connections done

  		for (var i=0;i<network3.layers.length;i++) {
  			this.breedLayers(network2.layers[i],network3.layers[i]);
  		}

  		this.mutateNetwork(network3, factor, p);
      return network3;
  }

  private breedLayers(layer1: networklayer, layer2: networklayer){
    //Breed Neurons
    for(var i=0;i<layer1.neurons.length;i++) {
      if(this.rngNextBool()){
        layer1.neurons[i].setBias(layer2.neurons[i].getBias());
        layer1.neurons[i].setThreshold(layer2.neurons[i].getThreshold());
      }
    }
    //Breed connections
    for(var i=0;i<layer1.outputs.length;i++) {
      for(var ii=0;ii<layer1.outputs[i].getSize();ii++) {
        if(this.rngNextBool()){
          layer1.outputs[i].setWeight(ii,layer2.outputs[i].getWeight(ii));
        }
      }
    }
  }

  public saveNetwork(network: neuralnetwork): string{
    let s = JSON.stringify(network);
    return s;
  }

  public loadNetwork(data: string): neuralnetwork{
    let nn = JSON.parse(data);
    return nn;
  }


}

//DONE

export class networklayer{
  public inputs:  neuralconnection[];
  public outputs: neuralconnection[];
  public neurons: neuron[];

  private layersize:  number;
  private inputsize:  number;
  private outputsize: number;

  helper: networkhelper;

  constructor(inputsize: number, layersize: number, outputsize: number, helper: networkhelper){
    this.inputsize = inputsize;
    this.layersize = layersize;
    this.outputsize = outputsize;
    this.helper = helper;

    this.initLayer();
  }

  private initLayer(){
    for(let i=0;i<this.layersize;i++){
      let tmpneuron = new neuron(this.helper.nextBias(), this.helper.nextThreshold(), this.helper);
      this.outputs.push(tmpneuron.getOutput());
      this.neurons.push(tmpneuron);
    }
  }

  public setInputs(inputs: neuralconnection[]){
    this.inputs = inputs;
    for (let neuron of this.neurons){
      neuron.setInputs(this.inputs);
    }
  }

  public getOutputs(): neuralconnection[]{
    return this.outputs;
  }

  public work(){
    for (let neuron of this.neurons){
      neuron.transferfunction();
    }
  }

  public getLayersize(): number{
    return this.layersize;
  }
}

//DONE

export class neuron{
  helper: networkhelper;

  private bias: number;
  private threshold: number;

  private inputs: neuralconnection[];
  private output: neuralconnection;

  //Do we need this:: -TODO: better name, holds the refernce number in the current Layer
  n: number;

  constructor(bias: number, threshold: number, helper: networkhelper){
    this.bias = bias;
    this.threshold = threshold;
    this.output = new neuralconnection();
    this.inputs = [];

    this.helper = helper;
    this.n = 0;
  }

  public setInputs(inputs: neuralconnection[]){
    this.inputs = inputs;
    for (let input of this.inputs){
      //register the output (with weight) in the connection -> n only needs to be set once, but every n should be the same
      this.n = input.addOutput(this.helper.nextWeight());
    }
  }

  public setBias(bias: number){
    this.bias = bias;
  }

  public getBias(){
    return this.bias;
  }

  public setThreshold(threshold: number){
    this.threshold = threshold;
  }

  public getThreshold(){
    return this.threshold;
  }

  public getOutput() : neuralconnection{
    return this.output;
  }

  public transferfunction(){
    let inp = 0, out = 0;
    for(let input of this.inputs){
      //TODO check WTF this n means...
      inp += input.getOutput(this.n);
    }
    inp += this.bias;
  out = this.helper.transferfunction(inp, this.threshold);
	this.output.setInput(out);
  }
  // THIS does not exist anymore
	// 	this.getGenome = function(){
	// 		var genome = "{";
	// 		genome += this.bias		+",";
	// 		genome += this.threshold+"";
	// 		genome += "}"
	// 			return genome;
	// 	}
}

//DONE

export class neuralconnection{
  private size:    number;
  private weights: number[];
  private input:   number;

  constructor(){
    this.input   = 0;
    this.size    = 0;
    this.weights = [];
  }

  public addOutput(weight: number) {
    this.size++;
    this.weights.push(weight);

    return this.size-1;
  }

  public getWeight(index: number){
    return this.weights[index];
  }

  public setWeight(index: number, weight: number){
    this.weights[index] = weight;
  }

  public getSize(){
    return this.size;
  }

  public setInput(value: number){
    this.input = value;
  }

  public getInput(){
    return this.input;
  }

  public getOutput(index: number){
    //bounds check::
    if(index >= this.size){
      return 0;
    }
    return this.input*this.weights[index];
  }
}

//DONE

export class neuralnetwork {
  private helper: networkhelper;
  public layerconfig: number[];

  public layers: networklayer[];
  public networkinput:  neuralconnection[];
  public networkoutput: neuralconnection[];

  constructor(layerconfig: number[], helper: networkhelper) {
    this.layerconfig = layerconfig;
    this.helper = helper;

    this.initNetwork();
  }

  private initNetwork(){
    //make Input Layer::

    for(let ii=0; ii<this.layerconfig[0]; ii++){
      this.networkinput.push(new neuralconnection());
    }

    this.networkoutput = [];

    let tmp: neuralconnection[], tmpLayer: networklayer;
    tmp = this.networkinput;
    for (let i=1; i< this.layerconfig.length; i++){
      //inputsize, layersize, outputsize, nwhelper
      tmpLayer = new networklayer(this.layerconfig[i-1], this.layerconfig[i], this.layerconfig[i+1], this.helper);
      tmpLayer.setInputs(tmp);
      tmp = tmpLayer.getOutputs();
    	this.layers.push(tmpLayer);
    }
    this.networkoutput = tmp;
  }

  public runNetwork(){
    for (let layer of this.layers){
      //TODO: sort rendering...
      // if(draw_self && !no_render)
    	// 			{
    	// 				drawNetwork(this, this.canvas);
    	// 			}
      layer.work();
    }
  }

  public setNetworkInput(data: number[]){
    //Assert the datas len
    if(data.length != this.networkinput.length){ return; }
    for (let i=0; i<this.networkinput.length; i++){
      this.networkinput[i].setInput(data[i]);
    }
  }

  public getLayerconfig(): number[]{
    return this.layerconfig;
  }

  public getHelper(): networkhelper{
    return this.helper;
  }

  public getinputsize(): number{
    return this.networkinput.length;
  }
  public getoutputsize(): number{
    return this.networkoutput.length;
  }
  public getnetworksize(): number{
    //return the number of layers
    return this.layerconfig.length;
  }

}


export {networkDrawHelper} from './methyleneblue'
