import { seededRandom } from './utils';
export declare enum TransferfunctionType {
    Linear = "tf_linear",
    Sigmoid = "tf_sigmoid",
}
export declare class networkhelper {
    currentTF: TransferfunctionType;
    weight: number[];
    bias: number[];
    tresh: number[];
    use_random: boolean;
    random: seededRandom;
    constructor(random: boolean, base_data?: number[], seed?: number);
    nextWeight(): number;
    nextBias(): number;
    nextThreshold(): number;
    private rngNext(min?, max?);
    private rngNextBool(p?);
    transferfunction(input: number, threshold: number): number;
    private compareLayers(layer1, layer2);
    compareNetworks(network1: neuralnetwork, network2: neuralnetwork): boolean;
    mutateNetwork(network: neuralnetwork, factor: number, p: number): void;
    private mutateValue(variable, factor, p);
    private mutateLayer(layer, factor, p);
    cloneNetwork(network1: neuralnetwork): neuralnetwork;
    private cloneLayer(layer1, layer2);
    breedNetworks(network1: neuralnetwork, network2: neuralnetwork, factor: number, p: number): neuralnetwork;
    private breedLayers(layer1, layer2);
    saveNetwork(network: neuralnetwork): string;
    loadNetwork(data: string): neuralnetwork;
}
export declare class networklayer {
    inputs: neuralconnection[];
    outputs: neuralconnection[];
    neurons: neuron[];
    private layersize;
    private inputsize;
    private outputsize;
    helper: networkhelper;
    constructor(inputsize: number, layersize: number, outputsize: number, helper: networkhelper);
    private initLayer();
    setInputs(inputs: neuralconnection[]): void;
    getOutputs(): neuralconnection[];
    work(): void;
    getLayersize(): number;
}
export declare class neuron {
    helper: networkhelper;
    private bias;
    private threshold;
    private inputs;
    private output;
    n: number;
    constructor(bias: number, threshold: number, helper: networkhelper);
    setInputs(inputs: neuralconnection[]): void;
    setBias(bias: number): void;
    getBias(): number;
    setThreshold(threshold: number): void;
    getThreshold(): number;
    getOutput(): neuralconnection;
    transferfunction(): void;
}
export declare class neuralconnection {
    private size;
    private weights;
    private input;
    constructor();
    addOutput(weight: number): number;
    getWeight(index: number): number;
    setWeight(index: number, weight: number): void;
    getSize(): number;
    setInput(value: number): void;
    getInput(): number;
    getOutput(index: number): number;
}
export declare class neuralnetwork {
    private helper;
    layerconfig: number[];
    layers: networklayer[];
    networkinput: neuralconnection[];
    networkoutput: neuralconnection[];
    constructor(layerconfig: number[], helper: networkhelper);
    private initNetwork();
    runNetwork(): void;
    setNetworkInput(data: number[]): void;
    getLayerconfig(): number[];
    getHelper(): networkhelper;
    getinputsize(): number;
    getoutputsize(): number;
    getnetworksize(): number;
}
export { networkDrawHelper } from './methyleneblue';
