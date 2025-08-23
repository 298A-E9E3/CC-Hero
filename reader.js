/*
Track events that need to be supported:
N (note)
B (tempo change)
Track events that are supported:
*/
//Reads song data
class ChartReader {
    /**
     * @typedef {Object} eventList
     * @property {Array<Array<String>>} indexArr
     * @property {Array<Number>} tickArr
     * @property {Array<Number>} valArr
     */
    /**
     * 
     * @param {String} data The contents of the .chart file
     * @param {String} targetTrack A string in the format <Difficulty><Instrument> specifying which track should be read
     * @returns {void}
     */
    constructor(data, targetTrack) {
        this.data = data;
        this.targetTrack = targetTrack;
    }
    /**
     * Gets the data from a specific section
     * @param {String} sectionName 
     * @returns {RegExpMatchArray}
     */
    #getSectionData(sectionName) {
        const dataRegexTemplate = "(?<=\\[<sectionName>\\]\\n{\\n)[^}]*";
        return (this.data.match(RegExp(dataRegexTemplate.replace("<sectionName>", sectionName))));
    }
    /**
     * Returns the key and value of a specific line
     * @param {String} line the text of the line
     * @returns {Array<String>}
     */
    #getKVpair(line) {
        const keyRegex = RegExp("(?<=\\n([\\t| ])*)\\w+(?=( )*=)")
        const valRegex = RegExp("(?<=\\n([\\t| ])*\\w+( )*=( )*)[^ \\n][^\n]*")
        return ([line.match(keyRegex)[0], line.match(valRegex)[0]])
    }
    /**
     * Gets the type of an event
     * @param {string} event 
     * @returns {string}
     */
    #getEventType(event) {
        const evRegex = RegExp("/^[A-Z]+/g");
        return (event.match(evRegex)[0]);
    }
    #getEventMod(event) {
        const evRegex = RegExp("(?<=^[A-Z]+ )\\d+");
        return (event.match(evRegex)[0]);
    }
    /**
     * Converts a tick value into milliseconds
     * @param {Number} ticks 
     * @returns {Number}
     */
    convertTicksToMilliseconds(ticks) {
        return (this.convertTickListToMilliseconds([ticks])[0])
    }
    /**
     * Converts a list of ticks into milliseconds
     * @param {Array<Number>} tickList 
     * @returns {Array<Number>}
     */
    convertTickListToMilliseconds(tickList) {
        let currentTickList = tickList;
        let secList = [];
        if (this.syncTrackEL == undefined || this.syncTrackEL == null) {
            console.error("Sync Track Array has not been initialised, run this.process() first");
            return
        }
        if (!this.resolution) {
            console.error("this.resolution is not defined. Does notes.chart have a section labeled [Song]?")
            return
        }
        let tempo = 0;
        let currentTime = 0;
        let currentTick = 0;
        /** @type {eventList}*/
        let tempoList = {
            "indexArr": [], 
            "tickArr": [],
            "valArr": []
        }
        /**
         * Gets the tempo from an event value if the event is a tempo change, otherwise returns undefined
         * @param {string} val 
         * @returns {Number|undefined}
         */
        const getTempo = function (val) {

            let tempo = 0;
            if (this.#getEventType(val) == "B") {
                let eventMod = this.#getEventMod(val);
                if (isFinite(eventMod)) {
                    return (Number(eventMod) / 1000)
                }
            }
            return (undefined)
        }
        for (let i = 0; i < this.syncTrackEL.indexArr[0].length; i++) {
            let val = this.syncTrackEL.valArr[this.syncTrackEL.indexArr[0][i]];
            let tempTempo = getTempo(val);
            if (tempTempo !== undefined) {
                tempo = tempTempo;
            }
        }
        for (let i = 0; i < this.syncTrackEL.valArr.length; i++) {
            while (this.syncTrackEL.tickArr[i] >= currentTickList[0]) {
                secList.push(currentTime + (((currentTickList[0] - currentTick / this.resolution) / tempo) * 60000))
                currentTickList.splice(0, 1);
            }
            // if (this.syncTrackEL.tickArr[i] >= ticks) {
            //     return (currentTime + (((ticks - currentTick / this.resolution) / tempo) * 60000));
            // }
            if (getTempo(this.syncTrackEL.valArr[i])) {
                currentTime += (((this.syncTrackEL.tickArr[i] - currentTick / this.resolution) / tempo) * 60000);
                currentTick = this.syncTrackEL.tickArr[i];
                tempo = getTempo(this.syncTrackEL.valArr[u]);
                tempoList.valArr.push(tempo);
                tempoList.tickArr.push(currentTick);
                tempoList.indexArr[currentTick] = [i];
            }
        }
        return (secList);
    }
    /**
     * Processes the .chart data
     */
    process() {
        /**
         * 
         * @param {String} section 
         * @returns {eventList}
         */
        const processSection = function (section) {
            let lines = this.#getSectionData(section)[0].split("\n");
            let indexArr = [];
            let tickArr = [];
            let valArr = [];
            for (let i = 0; i < lines.length; i++) {
                let kvPair = this.#getKVpair(lines[i]);
                let key = kvPair[0];
                let val = kvPair[1];
                if (isFinite(key)) {
                    let keyNum = Number(key);
                    if (indexArr[keyNum] == undefined) {
                        indexArr[keyNum] = i;
                    } else {
                        indexArr[keyNum].push(i)
                    }
                    tickArr.push(keyNum);
                    valArr.push(val);
                }
            }
            return ({
                "indexArr": indexArr,
                "tickArr": tickArr,
                "valArr": valArr
            })
        }
        this.eventEL = processSection("Events");
        this.syncTrackEL = processSection("SyncTrack");
        this.mainTrackEL = processSection(this.targetTrack);
        let songSection = this.#getSectionData("Song");
        for (let i = 0; i < songSection.length; i++) {
            let kvPair = this.#getKVpair(songSection[i]);
            if (kvPair[0] == "Resolution") {
                if (isFinite(kvPair[1])) {
                    this.resolution = Number(kvPair[1]);
                }
            }
        }
    }
}
