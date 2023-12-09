class HexaStatMatrix {
    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD) {
        HexaStatNode.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);
    }

    static simulateHexaStatNodes(numTrials) {
        let hexaStatNodesResults = [];
        let totalFDFragmentRatio = 0;

        for (let i = 0; i < numTrials; i++) {
            let hexaStatNode = new HexaStatNode();
            hexaStatNode.levelUpTo(20);
            hexaStatNode.optimise();
            hexaStatNodesResults.push(hexaStatNode);

            totalFDFragmentRatio += hexaStatNode.getTotalFDPercent() / hexaStatNode.additionalFragmentsCost;
        }
        let fdFragmentRatioAvg = formatNumberForPrint(totalFDFragmentRatio / numTrials);

        // Sort by FD per fragment ratio
        hexaStatNodesResults.sort(function (a, b) { return a.getTotalFDPercent() / a.additionalFragmentsCost - b.getTotalFDPercent() / b.additionalFragmentsCost });
        let minFdFragmentRatio = formatNumberForPrint(hexaStatNodesResults[0].getFdFragmentRatio());
        let maxFdFragmentRatio = formatNumberForPrint(hexaStatNodesResults[numTrials - 1].getFdFragmentRatio());

        let hexaStatNodeMedian = percentileFromSortedArray(hexaStatNodesResults, 50);
        // We want the worse case, so take 25th percentile from smallest to biggest
        let hexaStatNode75th = percentileFromSortedArray(hexaStatNodesResults, 100 - 75);
        let hexaStatNode85th = percentileFromSortedArray(hexaStatNodesResults, 100 - 85);
        let hexaStatNode95th = percentileFromSortedArray(hexaStatNodesResults, 100 - 95);

        let fdFragmentRatioMedian = formatNumberForPrint(hexaStatNodeMedian.getFdFragmentRatio());
        let fdFragmentRatio75th = formatNumberForPrint(hexaStatNode75th.getFdFragmentRatio());
        let fdFragmentRatio85th = formatNumberForPrint(hexaStatNode85th.getFdFragmentRatio());
        let fdFragmentRatio95th = formatNumberForPrint(hexaStatNode95th.getFdFragmentRatio());

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
                            <p style="border-width:1px; border-style:solid;">${hexaStatNodeMedian.getInfo(true)}</p>
                            Range: <b>${minFdFragmentRatio}</b> to <b>${maxFdFragmentRatio}</b>
                        </center>
                    </td>
                    <td>
                        <center>
                            75% chance for: <b>${fdFragmentRatio75th}</b> at
                            <p style="border-width:1px; border-style:solid;">${hexaStatNode75th.getInfo(true)}</p>
                            85% chance for: <b>${fdFragmentRatio85th}</b> at
                            <p style="border-width:1px; border-style:solid;">${hexaStatNode85th.getInfo(true)}</p>
                            95% chance for: <b>${fdFragmentRatio95th}</b> at
                            <p style="border-width:1px; border-style:solid;">${hexaStatNode95th.getInfo(true)}</p>
                        </center>
                    </td>
                </tr>
            </tbody>
        </table>
        `;
    }

    static optimiseGivenHexaStatNode(mainLevel, addStat1Level, addStat2Level) {
        let currHexaStatNode = new HexaStatNode();
        currHexaStatNode.setLevels(mainLevel, addStat1Level, addStat2Level);
        currHexaStatNode.optimise();

        // Don't overwrite the values of the current node
        let tempHexaStatNode = new HexaStatNode();
        tempHexaStatNode.setLevels(5, 7, 8);
        let minFD = tempHexaStatNode.getTotalFDPercent();
        let minFDHexaStatNode = tempHexaStatNode;
        let maxFD = minFD;
        let maxFDHexaStatNode = minFDHexaStatNode;

        // t stands for theoretical
        for (let tMainLevel = 0; tMainLevel <= HexaStatLine.MAX_LEVEL; tMainLevel++) {
            // If the sum of all levels is 20,
            // If main=0, addStat1 can only be 10
            // If main=1, addStat1 can be 9 to 10
            for (let tAddStat1Level = HexaStatLine.MAX_LEVEL - tMainLevel; tAddStat1Level <= HexaStatLine.MAX_LEVEL; tAddStat1Level++) {
                let tAddStat2Level = HexaStatNode.MAX_LEVEL_SUM - tMainLevel - tAddStat1Level;
                // Don't overwrite the values of the other nodes
                let tempHexaStatNode = new HexaStatNode();
                tempHexaStatNode.setLevels(tMainLevel, tAddStat1Level, tAddStat2Level);
                tempHexaStatNode.optimise();
                let tempFD = tempHexaStatNode.getTotalFDPercent();

                if (tempFD < minFD) {
                    minFD = tempFD;
                    minFDHexaStatNode = tempHexaStatNode;
                }
                else if (tempFD > maxFD) {
                    maxFD = tempFD;
                    maxFDHexaStatNode = tempHexaStatNode;
                }
            }
        }

        return `
        <table class="table table-bordered" style="width: auto;">
            <tbody>
                <tr>
                    <td style="vertical-align: middle;">
                        Current optimised FD:<br>
                        (node level ${mainLevel + addStat1Level + addStat2Level})
                    </td>
                    <td>
                        ${currHexaStatNode.getInfo(false)}
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: middle;">
                        Theoretical min optimised FD:<br>
                        (node level ${HexaStatNode.MAX_LEVEL_SUM})
                    </td>
                    <td>
                        ${minFDHexaStatNode.getInfo(false)}
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: middle;">
                        Theoretical max optimised FD:<br>
                        (node level ${HexaStatNode.MAX_LEVEL_SUM})
                    </td>
                    <td>
                        ${maxFDHexaStatNode.getInfo(false)}
                    </td>
                </tr>
            </tbody>
        </table>
        `;
    }
}