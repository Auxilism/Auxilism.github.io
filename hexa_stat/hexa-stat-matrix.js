class HexaStatMatrix {
    static #attFD;
    static #statFD;
    static #critDmgFD;
    static #bossDmgFD;
    static #dmgFD;
    static #iedFD;

    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD) {
        HexaStatMatrix.#attFD = attFD;
        HexaStatMatrix.#statFD = statFD;
        HexaStatMatrix.#critDmgFD = critDmgFD;
        HexaStatMatrix.#bossDmgFD = bossDmgFD;
        HexaStatMatrix.#dmgFD = dmgFD;
        HexaStatMatrix.#iedFD = iedFD;

        HexaStatCore.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);
    }

    static simulateHexaStatCores() {
        let numTrials = 100;
        let hexaStatCoresByFD = [];
        let hexaStatCoresByFragments = [];

        for (let i = 0; i < numTrials; ++i) {
            let hexaStatCore = new HexaStatCore();
            hexaStatCore.levelUpTo(20);
            hexaStatCore.optimise();
            hexaStatCoresByFD.push(hexaStatCore);
            hexaStatCoresByFragments.push(hexaStatCore);
        }
        hexaStatCoresByFD.sort(function (a, b) { return a.getTotalFDPercent() - b.getTotalFDPercent() });
        hexaStatCoresByFragments.sort(function (a, b) { return a.additionalFragmentsCost - b.additionalFragmentsCost });

        let fdMedian = percentileFromSortedArray(hexaStatCoresByFD, 50);
        let fd75 = percentileFromSortedArray(hexaStatCoresByFD, 20);
        // console.log(percentileFromSortedArray(fdResults, 50), percentileFromSortedArray(fdResults, 25), percentileFromSortedArray(fdResults, 15), percentileFromSortedArray(fdResults, 5));
        // console.log(percentileFromSortedArray(fragmentResults, 50), percentileFromSortedArray(fragmentResults, 75), percentileFromSortedArray(fragmentResults, 85), percentileFromSortedArray(fragmentResults, 95));
        console.log("Median FD");
        fdMedian.printInfo();
        console.log("75% FD");
        fd75.printInfo();

        return `
        <table class="table table-bordered" style="width: auto;">
            <tbody>
                <tr>
                    <td>
                        FD% per 5 att<br>
                        <input id="fdPerAttUnit" type="number" value="${fdMedian.getTotalFDPercent().toFixed(5)}">%
                    </td>
                    <td>
                        FD% per 100 (48 for xenon, 2100 for da) flat stat<br>
                        <input id="fdPerFlatStatUnit" type="number" value="0.15">%
                    </td>
                    <td>
                        FD% per 0.35% crit dmg<br>
                        <input id="fdPerCritDmgUnit" type="number" value="0.11">%
                    </td>
                </tr>
                <tr>
                    <td>
                        FD% per 1% boss dmg<br>
                        <input id="fdPerBossDmgUnit" type="number" value="0.13">%
                    </td>
                    <td>
                        FD% per 0.75% dmg<br>
                        <input id="fdPerDmgUnit" type="number" value="0.0975">%
                    </td>
                    <td>
                        FD% per 1% ied<br>
                        <input id="fdPerIEDUnit" type="number" value="0.01">%
                    </td>
                </tr>
            </tbody>
        </table>
        `
    }
}