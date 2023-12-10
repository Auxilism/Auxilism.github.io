class HexaStatMatrix {
    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD) {
        HexaStatNode.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);
    }

    static simulateHexaStatNodes(numTrials, needsUnlock, targetNodeLevel, currMainLevel, currAddStat1Level, currAddStat2Level) {
        let currHexaStatNode = new HexaStatNode(needsUnlock);
        currHexaStatNode.setLevels(currMainLevel, currAddStat1Level, currAddStat2Level);
        currHexaStatNode.optimise();

        let hexaStatNodesResults = [];
        let totalFDFragmentRatio = 0;

        for (let i = 0; i < numTrials; i++) {
            let hexaStatNode = new HexaStatNode(needsUnlock);
            hexaStatNode.setLevels(currMainLevel, currAddStat1Level, currAddStat2Level);
            hexaStatNode.levelUpTo(targetNodeLevel);
            hexaStatNode.optimise();
            hexaStatNodesResults.push(hexaStatNode);

            totalFDFragmentRatio += HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, hexaStatNode);
        }
        let fdFragmentRatioAvg = formatNumberForPrint(totalFDFragmentRatio / numTrials);

        // Sort by FD per fragment ratio
        // FD percent is compared to the current node, so need to convert back and forth
        hexaStatNodesResults.sort(function (a, b) { return (HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, a))
            - (HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, b)) });
        let minHexaStatNode = hexaStatNodesResults[0];
        let minFdFragmentRatio = formatNumberForPrint(HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, minHexaStatNode));
        let maxHexaStatNode = hexaStatNodesResults[numTrials-1];
        let maxFdFragmentRatio = formatNumberForPrint(HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, maxHexaStatNode));

        let hexaStatNodeMedian = percentileFromSortedArray(hexaStatNodesResults, 50);
        // We want the worse case, so take 25th percentile from smallest to biggest
        let hexaStatNode75th = percentileFromSortedArray(hexaStatNodesResults, 100 - 75);
        let hexaStatNode85th = percentileFromSortedArray(hexaStatNodesResults, 100 - 85);
        let hexaStatNode95th = percentileFromSortedArray(hexaStatNodesResults, 100 - 95);

        let fdFragmentRatioMedian = formatNumberForPrint(HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, hexaStatNodeMedian));
        let fdFragmentRatio75th = formatNumberForPrint(HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, hexaStatNode75th));
        let fdFragmentRatio85th = formatNumberForPrint(HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, hexaStatNode85th));
        let fdFragmentRatio95th = formatNumberForPrint(HexaStatNode.getFDFragmentRatioBetweenNodes(currHexaStatNode, hexaStatNode95th));

        return `
        <table class="table table-bordered" style="width: auto;">
            <tbody>
                <tr>
                    <td style="vertical-align: middle;">
                        Current optimised FD:<br>
                        (node level ${currMainLevel + currAddStat1Level + currAddStat2Level})
                    </td>
                    <td>
                        ${currHexaStatNode.getInfo(false)}
                    </td>
                </tr>
            </tbody>
        </table>
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

    static calculateTheoreticalHexaStatNodeFDs(currMainLevel, currAddStat1Level, currAddStat2Level) {
        let currHexaStatNode = new HexaStatNode(false);
        currHexaStatNode.setLevels(currMainLevel, currAddStat1Level, currAddStat2Level);
        currHexaStatNode.optimise();

        // Don't overwrite the values of the current node
        let tempHexaStatNode = new HexaStatNode(false);
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
                let tempHexaStatNode = new HexaStatNode(false);
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
                        (node level ${currMainLevel + currAddStat1Level + currAddStat2Level})
                    </td>
                    <td>
                        ${currHexaStatNode.getInfo(false)}
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: middle;">
                        Theoretical min optimised FD:<br>
                        (node level 0->${HexaStatNode.MAX_LEVEL_SUM})
                    </td>
                    <td>
                        ${minFDHexaStatNode.getInfo(false)}
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: middle;">
                        Theoretical max optimised FD:<br>
                        (node level 0->${HexaStatNode.MAX_LEVEL_SUM})
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