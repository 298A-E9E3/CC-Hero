class gameInstance {
    /**
     * 
     * @param {HTMLCanvasElement} canvas the canvas to draw to
     * @param {ChartReader} chart 
     * @param {Number} trackLength The length of the track
     * @param {Number} speed The speed of the notes 
     */
    constructor(canvas, chart, trackLength, speed) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.chart = chart;
        this.trackLength = trackLength;
        this.speed = speed;
        this.time = 0;
        this.deltaTime = 0;
    }
    initiateStep(deltaTime) {
        this.time += deltaTime;
        this.deltaTime = deltaTime;
    }
    
    /**
     * Checks to see which notes were hit, then adds the hit notes to a temporary array
     */
    checkNoteHits() {

    }



}