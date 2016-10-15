type RenderingContext = {
    time : number;
    inCompositionTime: number;
    frame : number;
    inCompositionFrame: number;

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    initialVariables: Object;
    variables: Object;
};
