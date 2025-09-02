const helpers = {
    /**
     * 
     * @param {Array<Number|Object>} arr 
     * @param {Number} val 
     * @param {String|undefined} key 
     */
    "findNearest": (arr, val, key) =>
        arr.reduce((acc, obj) => {
            if (key) {
                return (Math.abs(val - obj[key]) < Math.abs(val - acc[key]) ? obj : acc);
            } else {
                return (Math.abs(val - obj) < Math.abs(val - acc) ? obj : acc);
            }
        }
        )

}