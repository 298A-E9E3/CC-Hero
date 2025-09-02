class inputLog {

    /** 
     * @typedef {Object} inputEvent
     * @property {Boolean} down true for down, false for up
     * @property {Number} button -1 for strum
     * @property {Number} time time since start of game in ms, or -1 if defining the starting state of a log
     */

    /**
     * Tracks the state of inputs over a certain timeframe
     * @param {Array<Number>} currentState the buttons pressed at the start of the log
     * @param {Number} currentTime time since start of game in ms
     */
    constructor(currentState, currentTime) {
        /** @type {Array<inputEvent>} */
        this.log = []
        for (let i = 0; i < currentState.length; i++) {
            this.log.push({ "down": true, "button": currentState[i], "time": -1 })
        }
        this.startTime = currentTime;
        this.state = currentState
    }
    /**
     * Logs a keypress
     * @param {Number} button 
     * @param {Number} currentTime 
     */
    keyDown(button, currentTime) {
        this.log.push({ "down": true, "button": button, "time": currentTime });
        if (!this.state.includes(button)) {
            this.state.push(button);
        } else {
            console.warn(`Button '${button}' double pressed`)
        }
    }
    /**
     * Logs a key release
     * @param {Number} button 
     * @param {Number} currentTime 
     */
    keyUp(button, currentTime) {
        this.log.push({ "down": false, "button": button, "time": currentTime });
        if (this.state.includes(button)) {
            this.state.splice(this.state.indexOf(button), 1);
        } else {
            console.warn(`Button '${button}' double released`)
        }
    }
    /**
     * Gets which buttons were down at a specific time
     * @param {Number} time 
     */
    stateAtTime(time) {
        let currentState = [];
        for (let i = 0; i < this.log.length; i++) {
            let input = this.log[i];
            if(input.time > time){
                return(currentState)
            }
            let button = input.button;
            if (input.down) {
                if (!currentState.includes(button)) {
                    currentState.push(button);
                }
            } else {
                if (currentState.includes(button)) {
                    currentState.splice(currentState.indexOf(button), 1);
                }
            }
        }
        console.warn("Parameter 'time' is greater than the time of the most recent input logged");
        return(currentState)
    }



}