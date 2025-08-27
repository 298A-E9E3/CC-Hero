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
        this.overrideProcessRunLimit = false;
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
        const evRegex = /^[A-Z]+/g
        return (event.match(evRegex)[0]);
    }
    /**
     * Gets the modifier of an event
     * @param {String} event 
     * @returns {String}
     */
    #getEventMod(event) {
        const evRegex = /(?<=[A-Z]+ )[\d| ]+/
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
     * @param {Array<Number>} noteTickList 
     * @returns {Array<Number>}
     */
    convertTickListToMilliseconds(noteTickList) {
        let currentTickList = noteTickList;
        let secList = [];
        if (!this.syncTrackEL) {
            console.error("this.syncTrackEL is falsy, run this.process() first and make sure the chart has a section labeled [SyncTrack]");
            return
        }
        if (!this.resolution) {
            console.error("this.resolution is falsy. Does the chart have a section labeled [Song], and is resolution not 0?")
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
        this.tempoList = tempoList;
        return (secList);
    }
    /**
     * Processes the .chart data
     */
    process() {
        if (this.processRun) {
            console.warn(`WARN: this.process should only be run once!
                If for some reason you want to run it again, set this.overrideProcessRunLimit to true, but know that this is highly discouraged`)
        }
        this.processRun = true;
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
    /** 
     * @typedef {Object} note
     * @property {Number} time the time the note will be hit in milliseconds (-1 if undefined)
     * @property {Number} tick the tick the note will be hit
     * @property {Number} duration the time in ticks the note should be held (0 if not held)
     * @property {Number} button 0: green 1: red 2: yellow 3: blue 4: orange 5: open
     * @property {Boolean} tap Whether the note is a tap note
     * @property {Boolean} HOPO Whether the note is a Hammer-on Pull-off note
     * @property {Boolean} special Whether the note is a special note (star/battle power)
     * @property {Number} phrase The index of the phrase this note belongs to (-1 if none)
     */
    /**
     * @typedef {Object} phrase
     * @property {Number} time The time in MS the phrase starts (-1 if undefined)
     * @property {Number} tick the tick the phrase starts
     * @property {Number} duration the duration of the phrase in ticks
     * @property {Number} type the type of phrase (2 is star/battle power, all others are instrument-specific)
     */
    /**
     * Gets a list of all the notes in the song, and defines this.noteList and this.phraseList
     * @returns {Array<note>}
     */
    getNotes() {
        if (this.getNotesRun) {
            console.warn("WARN: it is not recommended to run this.getNotes more than once, as it is slow");
        }
        this.getNotesRun = true;
        if (!this.resolution) {
            console.error("this.resolution is falsy, run this.process() first and make sure the chart does not have a resolution of 0")
            return
        }
        /**
         * @type {Array<phrase>}
         */
        let phraseList = []
        /**
         * @type {Array<note>}
         */
        let noteList = []
        let noteTickList = []
        let phraseTickList = []
        let prevNote = -1;
        let currentPhraseType = -1;
        let currentPhraseStart = -1;
        let currentPhraseDuration = 0;
        let currentPhraseIndex = -1;
        let currentTick = 0;
        /** @type {Array<note>} */
        let tickNotes = [];
        let tickModifiers = { "tap": false, "HOPO": false }
        /**
         * 
         * @param {String} val 
         * @param {Number} tick 
         * @returns {void}
         */
        const readEv = (val, tick) => {
            let type = this.#getEventType(val);
            let mod = this.#getEventMod(val);
            let inPhrase = (currentPhraseStart + currentPhraseDuration > tick && currentPhraseStart <= tick);
            switch (val) {
                case "N": {
                    let mods = mod.split(" ");
                    if (mods[0] !== 5 && mods[0] !== 6) {
                        let note = { "time": -1, "tick": tick, "duration": mods[1], "button": mods[0], "tap": false, "HOPO": false, "special": inPhrase && (currentPhraseType == 2), "phrase": inPhrase ? currentPhraseIndex : -1 }
                        tickNotes.push(note);
                    } else {
                        if (mods[0] == 5) {
                            tickModifiers.HOPO = true
                        } else {
                            tickModifiers.tap = true
                        }
                    }
                    break;
                }
                case "S": {
                    let mods = mod.split(" ");
                    currentPhraseType = Number(mods[0]);
                    currentPhraseStart = tick;
                    currentPhraseDuration = Number(mods[1]);
                    let phrase = { "time": -1, "tick": tick, "duration": currentPhraseDuration, "type": currentPhraseType }
                    phraseTickList.push(phrase.tick)
                    phraseList.push(phrase)
                    currentPhraseIndex++
                    break;
                }
                default:
                    break;
            }
            return
        }
        for (let i = 0; i < this.mainTrackEL.valArr.length; i++) {
            let thisTick = this.mainTrackEL.tickArr[i];
            let thisVal = this.mainTrackEL.valArr[i];
            if (thisTick != currentTick) {
                let autoHOPO = ((currentTick - prevNote) < (65 / 192) * this.resolution && prevNote >= 0 && tickNotes.length == 1);
                let HOPO = tickModifiers.HOPO ? !autoHOPO : autoHOPO;
                while (tickNotes.length > 0) {
                    let thisNote = tickNotes.pop()
                    thisNote.HOPO = HOPO;
                    thisNote.tap = tickModifiers.tap;
                    prevNote = thisNote.tick
                    noteTickList.push(thisNote.tick);
                    noteList.push(thisNote);
                }
                tickModifiers.HOPO = false;
                tickModifiers.tap = false;
                currentTick = thisTick;
            }
            readEv(thisVal, thisTick);
        }
        let noteMSList = this.convertTickListToMilliseconds(noteTickList);
        for (let i = 0; i < noteMSList.length; i++) {
            noteList[i].time = noteMSList[i];
        }
        let phraseMSList = this.convertTickListToMilliseconds(phraseTickList);
         for (let i = 0; i < phraseMSList.length; i++) {
            phraseList[i].time = phraseMSList[i];
        }
        this.noteList = noteList;
        this.phraseList = phraseList;
        return(noteList)
    }
}
