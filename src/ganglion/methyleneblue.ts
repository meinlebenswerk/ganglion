import {neuralnetwork} from './ganglion'

//DONE (TODO: fix transfercoloring)

export class networkDrawHelper {
  clearcolor: string;
  offcolor:   string;
  oncolor:    string;

  canvas:   HTMLCanvasElement;
  context:  CanvasRenderingContext2D;

  sx: number = 0;
  sy: number = 0;

  resize: boolean;

  constructor(canvas: HTMLCanvasElement){
    this.canvas = canvas;

    //Color Setup::
    this.clearcolor	= "#282A37";
  	this.offcolor  	= "#54584B";
  	this.oncolor		= "#7DB213";

    this.resize = true;

    this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");
  }

  private updateCanvasSize(){
    this.sx = this.canvas.getBoundingClientRect().width;
  	this.sy = this.canvas.getBoundingClientRect().height;

    this.canvas.setAttribute('width', ""+this.sx);
    this.canvas.setAttribute('height',""+this.sy);
  }

  private clearCanvas(clearcolor: string, context: CanvasRenderingContext2D, x: number,y: number){
  	context.fillStyle = clearcolor;
  	context.fillRect(0,0,x,y);
  }

  public blend_colors(color1: string, color2: string, percentage: number): string{
  	// check input
  	color1 = color1 || '#000000';
  	color2 = color2 || '#ffffff';
  	percentage = percentage || 0.5;

  	// 1: validate input, make sure we have provided a valid hex
  	if (color1.length != 4 && color1.length != 7)
  		//throw new error('colors must be provided as hexes');

  	if (color2.length != 4 && color2.length != 7)
  		//throw new error('colors must be provided as hexes');

  	if (percentage > 1 || percentage < 0)
  		//throw new error('percentage must be between 0 and 1');

  	// 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
  	//      the three character hex is just a representation of the 6 hex where each character is repeated
  	//      ie: #060 => #006600 (green)
  	if (color1.length == 4)
  		color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
  	else
  		color1 = color1.substring(1);
  	if (color2.length == 4)
  		color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
  	else
  		color2 = color2.substring(1);

  	//console.log('valid: c1 => ' + color1 + ', c2 => ' + color2);

  	// 3: we have valid input, convert colors to rgb
  	let color1_tmp = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
  	let color2_tmp = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

  	//console.log('hex -> rgba: c1 => [' + color1.join(', ') + '], c2 => [' + color2.join(', ') + ']');

  	// 4: blend
  	let color3 = [
  		(1 - percentage) * color1_tmp[0] + percentage * color2_tmp[0],
  		(1 - percentage) * color1_tmp[1] + percentage * color2_tmp[1],
  		(1 - percentage) * color1_tmp[2] + percentage * color2_tmp[2]
  		];

  	//console.log('c3 => [' + color3.join(', ') + ']');

  	// 5: convert to hex
  	let color3_tmp = '#' +this.int_to_hex(color3[0]) + this.int_to_hex(color3[1]) + this.int_to_hex(color3[2]);

  	//console.log(color3);

  	// return hex
  	return color3_tmp;
  }

  public int_to_hex(num: number): string{
  	var hex = Math.round(num).toString(16);
  	if (hex.length == 1)
  		hex = '0' + hex;
  	return hex;
  }

  public draw(network: neuralnetwork){
    //console.log('__begin_draw');
    //TODO fix alignment glitch

    if(this.resize){ this.updateCanvasSize(); }

    //begin tmp-var-init::
    let maxn = 0;
    for (let layer of network.layers){
      maxn = Math.max(maxn,layer.getLayersize());
    }
    maxn = Math.max(maxn,network.getinputsize());
    maxn = Math.max(maxn,network.getoutputsize());

    let nsx = this.sx/(1+(2*network.getnetworksize()));
    let nsy = this.sy/(1+(2*maxn));

    let szneuron = Math.min(nsx,nsy);
    let sz = Math.min(this.sx,this.sy);

    let ncolumns = network.getnetworksize()+2;
    //TODO: understand this boii
    let xpad = this.sx ; //- (ncolumns*szneuron)
    xpad/= (1+ncolumns)+1;

    //begin actual drawing process::
    this.clearCanvas(this.clearcolor,this.context,this.sx,this.sy);

    // then draw

    for(let li=0;li<network.getnetworksize();li++){
      let ny   = network.getLayerconfig()[li];
  		let offy = this.sy - (((2*ny)-1)*szneuron);
      offy/=2;

      //temporal tmp-vars
      let radius = szneuron/2;

      for(let ni=0;ni<ny;ni++){
        let x = (network.layers[li].neurons[ni].getOutput().getInput()+1)/2;// activation as a 0-1 parameter
  			this.context.fillStyle = this.blend_colors(this.offcolor, this.oncolor, x);
  			this.context.beginPath();
        this.context.arc(((2+li)*xpad)+((0.5)*szneuron),offy+((2*ni)*szneuron),radius,0,2*Math.PI);
        this.context.fill();
  			}
  		}

      //then draw I/O Layers
      //INPUT
      let ny = network.networkinput.length;
    	let offy = this.sy - (((2*ny)-1)*szneuron);
    	offy/=2;

      for(let ni=0;ni<ny;ni++){
        let x = (network.layers[network.getnetworksize()].neurons[ni].getOutput().getInput()+1)/2;// activation as a 0-1 parameter
        this.context.fillStyle = this.blend_colors(this.offcolor, this.oncolor, x);
        this.context.beginPath();
        this.context.arc( (xpad) + ((0.5)*szneuron), offy+((2*ni)*szneuron), szneuron/2, 0, 2 * Math.PI, false);
        this.context.fill();
    	}
  }
}
