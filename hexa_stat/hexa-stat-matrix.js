class HexaStatMatrix {


    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD) {
        HexaStatCore.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);
    }

    static simulateHexaStatCores(numTrials) {
        let hexaStatCoresResults = [];
        let totalFDFragmentRatio = 0;

        for (let i = 0; i < numTrials; ++i) {
            let hexaStatCore = new HexaStatCore();
            hexaStatCore.levelUpTo(20);
            hexaStatCore.optimise();
            hexaStatCoresResults.push(hexaStatCore);

            totalFDFragmentRatio += hexaStatCore.getTotalFDPercent() / hexaStatCore.additionalFragmentsCost;
        }
        let fdFragmentRatioAvg = formatNumberForPrint(totalFDFragmentRatio / numTrials);

        // Sort by FD per fragment ratio
        hexaStatCoresResults.sort(function (a, b) { return a.getTotalFDPercent() / a.additionalFragmentsCost - b.getTotalFDPercent() / b.additionalFragmentsCost });
        let minFdFragmentRatio = formatNumberForPrint(hexaStatCoresResults[0].getFdFragmentRatio());
        let maxFdFragmentRatio = formatNumberForPrint(hexaStatCoresResults[numTrials - 1].getFdFragmentRatio());

        let hexaStatCoreMedian = percentileFromSortedArray(hexaStatCoresResults, 50);
        // We want the worse case, so take 25th percentile from smallest to biggest
        let hexaStatCore75th = percentileFromSortedArray(hexaStatCoresResults, 100 - 75);
        let hexaStatCore85th = percentileFromSortedArray(hexaStatCoresResults, 100 - 85);
        let hexaStatCore95th = percentileFromSortedArray(hexaStatCoresResults, 100 - 95);

        let fdFragmentRatioMedian = formatNumberForPrint(hexaStatCoreMedian.getFdFragmentRatio());
        let fdFragmentRatio75th = formatNumberForPrint(hexaStatCore75th.getFdFragmentRatio());
        let fdFragmentRatio85th = formatNumberForPrint(hexaStatCore85th.getFdFragmentRatio());
        let fdFragmentRatio95th = formatNumberForPrint(hexaStatCore95th.getFdFragmentRatio());

        return `
        <table class="table table-bordered" style="width: auto;">
            <tbody>
                <th>
                    FD% to fragment ratio statistics
                </th>
                <th>
                    FD% to fragment ratio percentiles
                </th>
                <tr>
                    <td>
                        <center>
                            Average: <b>${fdFragmentRatioAvg}</b><br>
                            Median: <b>${fdFragmentRatioMedian}</b> at<br>
                            <p style="border-width:1px; border-style:solid;">${hexaStatCoreMedian.getInfo()}</p>
                            Range: <b>${minFdFragmentRatio}</b> to <b>${maxFdFragmentRatio}</b>
                        </center>
                    </td>
                    <td>
                        <center>
                            75% chance of: <b>${fdFragmentRatio75th}</b> at
                            <p style="border-width:1px; border-style:solid;">${hexaStatCore75th.getInfo()}</p>
                            85% chance of: <b>${fdFragmentRatio85th}</b> at
                            <p style="border-width:1px; border-style:solid;">${hexaStatCore85th.getInfo()}</p>
                            95% chance of: <b>${fdFragmentRatio95th}</b> at
                            <p style="border-width:1px; border-style:solid;">${hexaStatCore95th.getInfo()}</p>
                        </center>
                    </td>
                </tr>
            </tbody>
        </table>
        `;
    }

    static optimiseGivenHexaStatCore(mainLevel, addStat1Level, addStat2Level) {
        let currHexaStatCore = new HexaStatCore();
        currHexaStatCore.setLevels(mainLevel, addStat1Level, addStat2Level);
        currHexaStatCore.optimise();

        let minFD = currHexaStatCore.getTotalFDPercent();
        let minFDHexaStatCore = currHexaStatCore;
        let maxFD = minFD;
        let maxFDHexaStatCore = minFDHexaStatCore;

        // t stands for theoretical
        for (let tMainLevel = 0; tMainLevel <= HexaStatLine.MAX_LEVEL; ++tMainLevel) {
            // If the sum of all levels is 20,
            // If main=0, addStat1 can only be 10
            // If main=1, addStat1 can be 9 to 10
            for (let tAddStat1Level = HexaStatLine.MAX_LEVEL - tMainLevel; tAddStat1Level <= HexaStatLine.MAX_LEVEL; ++tAddStat1Level) {
                let tAddStat2Level = HexaStatCore.MAX_LEVEL_SUM - tMainLevel - tAddStat1Level;
                // Don't overwrite the values of the other cores
                let tempHexaStatCore = new HexaStatCore();
                tempHexaStatCore.setLevels(tMainLevel, tAddStat1Level, tAddStat2Level);
                tempHexaStatCore.optimise();
                let tempFD = tempHexaStatCore.getTotalFDPercent();

                if (tempFD < minFD) {
                    minFD = tempFD;
                    minFDHexaStatCore = tempHexaStatCore;
                }
                else if (tempFD > maxFD) {
                    maxFD = tempFD;
                    maxFDHexaStatCore = tempHexaStatCore;
                }
            }
        }

        return `${currHexaStatCore.getInfo()}<br>
        ${minFDHexaStatCore.getInfo()}<br>
        ${maxFDHexaStatCore.getInfo()}<br>
        `;
    }
}