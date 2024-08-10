function fdPercentToMultiplier(fdPercent) {
    // E.g. 20 becomes 1.20
    return fdPercent / 100 + 1;
}

function fdMultiplierToPercent(fdMultiplier) {
    // E.g. 1.02 becomes 2
    return (fdMultiplier - 1) * 100;
}

function getPercentBetweenFdPercents(oldFDPercent, newFDPercent) {
    let oldFDMultipler = fdPercentToMultiplier(oldFDPercent);
    let newFDMultiplier = fdPercentToMultiplier(newFDPercent);
    // E.g. oldFDPercent = 10, newFDPercent = 20, returned is 9.0909
    return fdMultiplierToPercent(newFDMultiplier / oldFDMultipler);
}

function percentileFromSortedArray(array, percentileAsWholeNumber) {
    if (percentileAsWholeNumber < 0 || percentileAsWholeNumber > 100) {
        throw new EvalError("Percentile cannot be less than 0% or more than 100%");
    }
    // Lazy implementation for now, not caring about percentiles in the middle of two elements
    let maxIndex = array.length - 1;
    let index = Math.floor(maxIndex * percentileAsWholeNumber / 100);
    return array[index];
}

function formatNumberForPrint(number) {
    // + gets rid of trailing zeros
    return +(number).toFixed(5);
}

function indexOfMax(arr) {
    // init first value as the max
    var max = arr[0];
    var maxIndex = 0;

    // Check every element after the first
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            // Update what to check against
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}