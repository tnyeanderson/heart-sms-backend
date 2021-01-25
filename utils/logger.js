let logger = {

    cycleCount: 0,

    maxCount: 5, 

    cycleSeconds: 3,

    recoverySeconds: 10,

    cycleInterval: setInterval(function () {
        console.log("Cycling");
        if (!logger.floodWait) {
            logger.cycleCount = 0;
        }
    }, this.cycleSeconds * 1000),

    skipped: function () {
        return this.cycleCount - this.maxCount;
    },

    floodReset: function () {
        if (logger.skipped() > 0) {
            console.log("Resumed logging after skipping " + logger.skipped() + " messages to prevent flooding");
        }
        logger.cycleCount = 0;
    },

    startFloodPrevent: function () {
        console.log("Too many logs. Waiting for " + this.recoverySeconds + " seconds...");
        this.floodWait = setTimeout(this.floodReset, this.recoverySeconds * 1000);
    },

    floodWait: null,

    log: function () {
        console.log(this.cycleCount);
        if (this.cycleCount > this.maxCount) {
            if (!this.floodWait) {
                this.startFloodPrevent();
            }
        } else {
            this.printToLog(arguments);
        }
        this.cycleCount++;
    },

    printToLog: function (args) {
        console.log.apply(null, args);
    }

}

module.exports = logger;