class HexaStatMatrix {
    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD) {
        HexaStatNodeArray.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);
        HexaStatNode.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);
    }

    static getSimulatedHexaStatNodeArrays(numTrials, targetNodeLevel) {
        let hexaStatNodeArrayResults = [];
        for (let i = 0; i < numTrials; i++) {
            let hexaStatNodeArray = new HexaStatNodeArray(targetNodeLevel);
            hexaStatNodeArray.optimise();
            hexaStatNodeArrayResults.push(hexaStatNodeArray);
        }
        return hexaStatNodeArrayResults;
    }

    static getSimulatedHexaStatNodeArraysStatistics(numTrials, targetNodeLevel) {
        let hexaStatNodeArrayResults = HexaStatMatrix.getSimulatedHexaStatNodeArrays(numTrials, targetNodeLevel);
        let totalFDFragmentRatio = 0;
        let totalFD = 0;
        let totalFragments = 0;

        for (let i = 0; i < numTrials; i++) {
            let hexaStatNodeArray = hexaStatNodeArrayResults[i];
            totalFDFragmentRatio += hexaStatNodeArray.getFdFragmentRatio();
            totalFD += hexaStatNodeArray.getTotalFDPercent();
            totalFragments += hexaStatNodeArray.getFragmentsCost();
        }
        let fdFragmentRatioAvg = formatNumberForPrint(totalFDFragmentRatio / numTrials);
        let fdAvg = formatNumberForPrint(totalFD / numTrials);
        let fragmentsAvg = formatNumberForPrint(totalFragments / numTrials);

        // Sort by FD per fragment ratio
        // FD percent is compared to the current node, so need to convert back and forth
        hexaStatNodeArrayResults.sort(function (a, b) { return a.getFdFragmentRatio() - b.getFdFragmentRatio() });
        let minRatioHexaStatNodeArray = hexaStatNodeArrayResults[0];
        let minFdFragmentRatio = formatNumberForPrint(minRatioHexaStatNodeArray.getFdFragmentRatio());
        let maxRatioHexaStatNodeArray = hexaStatNodeArrayResults[numTrials-1];
        let maxFdFragmentRatio = formatNumberForPrint(maxRatioHexaStatNodeArray.getFdFragmentRatio());

        let ratioHexaStatNodeArrayMedian = percentileFromSortedArray(hexaStatNodeArrayResults, 50);
        let ratioHexaStatNodeArray75th = percentileFromSortedArray(hexaStatNodeArrayResults, 75);
        let ratioHexaStatNodeArray85th = percentileFromSortedArray(hexaStatNodeArrayResults, 85);
        let ratioHexaStatNodeArray95th = percentileFromSortedArray(hexaStatNodeArrayResults, 95);

        let fdFragmentRatioMedian = formatNumberForPrint(ratioHexaStatNodeArrayMedian.getFdFragmentRatio());
        let fdFragmentRatio75th = formatNumberForPrint(ratioHexaStatNodeArray75th.getFdFragmentRatio());
        let fdFragmentRatio85th = formatNumberForPrint(ratioHexaStatNodeArray85th.getFdFragmentRatio());
        let fdFragmentRatio95th = formatNumberForPrint(ratioHexaStatNodeArray95th.getFdFragmentRatio());

        // Sort by raw FD
        hexaStatNodeArrayResults.sort(function (a, b) { return a.getTotalFDPercent() - b.getTotalFDPercent() });
        let minFDHexaStatNodeArray = hexaStatNodeArrayResults[0];
        let minFd = formatNumberForPrint(minFDHexaStatNodeArray.getTotalFDPercent());
        let maxFDHexaStatNodeArray = hexaStatNodeArrayResults[numTrials-1];
        let maxFd = formatNumberForPrint(maxFDHexaStatNodeArray.getTotalFDPercent());

        let fdHexaStatNodeArrayMedian = percentileFromSortedArray(hexaStatNodeArrayResults, 50);
        let fdHexaStatNodeArray75th = percentileFromSortedArray(hexaStatNodeArrayResults, 75);
        let fdHexaStatNodeArray85th = percentileFromSortedArray(hexaStatNodeArrayResults, 85);
        let fdHexaStatNodeArray95th = percentileFromSortedArray(hexaStatNodeArrayResults, 95);

        let fdMedian = formatNumberForPrint(fdHexaStatNodeArrayMedian.getTotalFDPercent());
        let fd75th = formatNumberForPrint(fdHexaStatNodeArray75th.getTotalFDPercent());
        let fd85th = formatNumberForPrint(fdHexaStatNodeArray85th.getTotalFDPercent());
        let fd95th = formatNumberForPrint(fdHexaStatNodeArray95th.getTotalFDPercent());

        return `
        <table class="table table-bordered" style="width: auto;">
            <tbody>
                <th>
                    <center>FD% to fragment ratio statistics</center>
                </th>
                <th>
                    <center>FD% to fragment ratio percentiles</center>
                </th>
                <th>
                    <center>FD% statistics</center>
                </th>
                <th>
                    <center>FD% percentiles</center>
                </th>
                <tr>
                    <td>
                        <center>
                            Average: <b>${fdFragmentRatioAvg}</b><br>
                            Median: <b>${fdFragmentRatioMedian}</b> at<br>
                            <p style="border-width:1px; border-style:solid; padding:5px;">${ratioHexaStatNodeArrayMedian.getInfo(true)}</p>
                            Range: <b>${minFdFragmentRatio}</b> to <b>${maxFdFragmentRatio}</b>
                        </center>
                    </td>
                    <td>
                        <center>
                            75% chance for: <b>${fdFragmentRatio75th}</b> at
                            <p style="border-width:1px; border-style:solid; padding:5px;">${ratioHexaStatNodeArray75th.getInfo(true)}</p>
                            85% chance for: <b>${fdFragmentRatio85th}</b> at
                            <p style="border-width:1px; border-style:solid; padding:5px;">${ratioHexaStatNodeArray85th.getInfo(true)}</p>
                            95% chance for: <b>${fdFragmentRatio95th}</b> at
                            <p style="border-width:1px; border-style:solid; padding:5px;">${ratioHexaStatNodeArray95th.getInfo(true)}</p>
                        </center>
                    </td>
                    <td>
                        <center>
                            Average: <b>${fdAvg}%</b> over ${fragmentsAvg} fragments<br>
                            Median: <b>${fdMedian}%</b> at<br>
                            <p style="border-width:1px; border-style:solid; padding:5px;">${fdHexaStatNodeArrayMedian.getInfo(true)}</p>
                            Range: <b>${minFd}%</b> to <b>${maxFd}%</b>
                        </center>
                    </td>
                    <td>
                        <center>
                            75% chance for: <b>${fd75th}%</b> at
                            <p style="border-width:1px; border-style:solid; padding:5px;">${fdHexaStatNodeArray75th.getInfo(true)}</p>
                            85% chance for: <b>${fd85th}%</b> at
                            <p style="border-width:1px; border-style:solid; padding:5px;">${fdHexaStatNodeArray85th.getInfo(true)}</p>
                            95% chance for: <b>${fd95th}%</b> at
                            <p style="border-width:1px; border-style:solid; padding:5px;">${fdHexaStatNodeArray95th.getInfo(true)}</p>
                        </center>
                    </td>
                </tr>
            </tbody>
        </table>
        `;
    }

    static optimiseCurrentHexaStatNodeArrayFD(currMainLevel, currAddStat1Level, currAddStat2Level) {
        let currHexaStatNodeArray = new HexaStatNodeArray(currMainLevel+currAddStat1Level+currAddStat2Level);
        currHexaStatNodeArray.setLevels(0, currMainLevel, currAddStat1Level, currAddStat2Level);
        currHexaStatNodeArray.optimise();

        return `
        <table class="table table-bordered" style="width: auto;">
            <tbody>
                <tr>
                    <td style="vertical-align: middle;">
                        Current optimised FD:
                        (node level ${currMainLevel + currAddStat1Level + currAddStat2Level})
                    </td>
                    <td>
                        ${currHexaStatNodeArray.getInfo(false)}
                    </td>
                </tr>
            </tbody>
        </table>
        `;
    }
}