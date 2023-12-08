function fdPercentToMultiplier(fdPercent) {
    // E.g. 20 becomes 1.20
    return fdPercent / 100 + 1;
}

function fdMultiplierToPercent(fdMultiplier) {
    // E.g. 1.02 becomes 2
    return (fdMultiplier - 1) * 100;
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
    return (number).toFixed(5);
}