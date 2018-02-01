import { neuralnetwork } from './ganglion';
export declare class networkDrawHelper {
    clearcolor: string;
    offcolor: string;
    oncolor: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    sx: number;
    sy: number;
    resize: boolean;
    constructor(canvas: HTMLCanvasElement);
    private init();
    private updateCanvasSize();
    private clearCanvas(clearcolor, context, x, y);
    blend_colors(color1: string, color2: string, percentage: number): string;
    int_to_hex(num: number): string;
    draw(network: neuralnetwork): void;
}
