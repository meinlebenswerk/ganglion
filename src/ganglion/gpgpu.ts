import {neuralnetwork,networkhelper} from "./ganglion"
import * as glsetup from "gl"

export class networkGPUAccelerator{
  dim_output  : number = 0;
  output_x    : number = 0;
  output_y    : number = 0;

  network : neuralnetwork;
  weightmatrices: number[][][] = [];

  gl:any;


  constructor(network: neuralnetwork){
    this.network = network;
    this.dim_output = network.layerconfig[network.layerconfig.length-1];

    //and now try to fit the output-size of the network onto a canvas::
    this.output_x = this.dim_output;
    this.output_y = 1;
    // if(Math.floor(this.output_x) != this.output_x){
    //   this.output_x = Math.floor(this.output_x);
    //   this.output_y = Math.ceil(this.dim_output/this.output_x);
    // }else{
    //   this.output_y = this.output_x;
    // }

    //init the gl context
    this.gl = glsetup.createContext(this.output_x, this.output_y, { preserveDrawingBuffer: true });

    //clear to 0,0,0,1 -> black :)
    this.gl.clearColor(0, 0, 0, 1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  private generateNetworkMatrices() : void{
    let i:number = 0;
    let ii:number = 0;

    let tmp_matrix: number[][] = [];
    let tmp_conns : neuralconnection[] = [];

    //TODO: fix confusion bc. inputlayer

    //loop over all the layers; start at layer1, bc. we dont consider the inputlayer
    for(i=1;i<this.network.layerconfig.length;i++){
      //loop over the neurons in the layers
      tmp_conns = this.network.connectionsAt(i);
      for(ii=0;ii<this.network.layerconfig[i];ii++){
        tmp_matrix.push(tmp_conns[ii]);
      }
      this.weightmatrices.push(tmp_matrix);
    }
  }

  private calculateLayer(inputvector:number[]) : void{
    let i:number = 0;
    let c_a : number[] = [];
    //loop over all the layers;
    for(i=0;i<this.network.layerconfig.length;i++){
      if(i===0){
        c_a = this.calculateMatrixVectorMult(inputvector, this.weightmatrices[i]);
      }else{
        c_a = this.calculateMatrixVectorMult(c_a, this.weightmatrices[i]);
      }
    }

    //c_a now contains the network output :))
  }

  private calculateMatrixVectorMult(vector:number[], matrix:number[][]) : number[]{

  }

  private readPixels() : Uint8Array {
    var pixels  = new Uint8Array(this.output_x * this.output_y * 4)
    this.gl.readPixels(0, 0, this.output_x, this.output_y, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)
    return pixels;
  }


}
