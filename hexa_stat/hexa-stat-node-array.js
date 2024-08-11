class HexaStatNodeArray
{
    static #hexaStatTypeFDPairs = [];
    static #MAX_NODE_COUNT = 6;

    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD)
    {
        HexaStatNodeArray.#hexaStatTypeFDPairs = [attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD];
        // Sort the stat types by highest FD to lowest FD, for type optimisation
        HexaStatNodeArray.#hexaStatTypeFDPairs.sort(function (a, b) { return b.fdPerUnit - a.fdPerUnit });
    }

    #hexaStatNodes = [];
    constructor(totalNodeLevel)
    {
        if (totalNodeLevel > HexaStatNodeArray.#MAX_NODE_COUNT * HexaStatNode.MAX_LEVEL_SUM)
        {
            throw new EvalError("Too many levels for hexa stat nodes");
        }

        let numNodes = totalNodeLevel / HexaStatNode.MAX_LEVEL_SUM;
        for (let i = 0; i < numNodes; i++)
        {
            this.#hexaStatNodes.push(new HexaStatNode);
        }

        // level up each node up to its max, or the total levels have been reached
        for (let currNodeIndex = 0, currLevelCount = 0; currLevelCount < totalNodeLevel;)
        {
            this.#hexaStatNodes[currNodeIndex].levelUp();
            currLevelCount++;
            // If the current node has reached max level
            if (currLevelCount % HexaStatNode.MAX_LEVEL_SUM == 0)
            {
                // go to the next node
                currNodeIndex += 1;
            }
        }
    }

    getFragmentsCost()
    {
        let fragCost = 0;
        for (let i = 0; i < this.#hexaStatNodes.length; i++)
        {
            fragCost += this.#hexaStatNodes[i].additionalFragmentsCost;
        }
        return fragCost;
    }

    getFdFragmentRatio()
    {
        return this.getTotalFDPercent() / this.getFragmentsCost();
    }

    getTotalFDPercent()
    {
        let numUnitsArray = Array(HexaStatNodeArray.#hexaStatTypeFDPairs.length).fill(0);

        // Fill in how many units each node gives to its specified type
        for (let i = 0; i < this.#hexaStatNodes.length; i++)
        {
            // Go through each line per node
            for (let j = 0; j < HexaStatNode.NUM_STAT_LINES; j++)
            {
                let currLineType = this.#hexaStatNodes[i].getTypeOfLine(j);
                // Find out which type matches when comapared to the static type-FD pair
                for (let k = 0; k < HexaStatNodeArray.#hexaStatTypeFDPairs.length; k++)
                {
                    if (currLineType == HexaStatNodeArray.#hexaStatTypeFDPairs[k].type)
                    {
                        // Add the units of the line to this type's slot
                        numUnitsArray[k] += this.#hexaStatNodes[i].getNumUnitsOfLine(j);
                        break;
                    }
                }
            }
        }

        let totalFD = 0;
        // Add up the boss dmg and dmg lines first since they are additive while the other types are multiplicative
        for (let i = 0; i < HexaStatNodeArray.#hexaStatTypeFDPairs.length; i++)
        {
            if (HexaStatNodeArray.#hexaStatTypeFDPairs[i].type == HexaStatLineType.Unset)
            {
                continue;
            }

            if (HexaStatNodeArray.#hexaStatTypeFDPairs[i].type == HexaStatLineType.BossDmg ||
                HexaStatNodeArray.#hexaStatTypeFDPairs[i].type == HexaStatLineType.Dmg)
            {
                totalFD += numUnitsArray[i] * HexaStatNodeArray.#hexaStatTypeFDPairs[i].fdPerUnit;
            }
        }

        // Convert to multiplication now
        totalFD = fdPercentToMultiplier(totalFD);
        // Go through everything that isn't boss dmg or dmg now
        for (let i = 0; i < HexaStatNodeArray.#hexaStatTypeFDPairs.length; i++)
        {
            if (HexaStatNodeArray.#hexaStatTypeFDPairs[i].type == HexaStatLineType.Unset)
            {
                continue;
            }

            if (HexaStatNodeArray.#hexaStatTypeFDPairs[i].type != HexaStatLineType.BossDmg &&
                HexaStatNodeArray.#hexaStatTypeFDPairs[i].type != HexaStatLineType.Dmg)
            {
                let typeFDPercent = numUnitsArray[i] * HexaStatNodeArray.#hexaStatTypeFDPairs[i].fdPerUnit;
                totalFD *= fdPercentToMultiplier(typeFDPercent);
            }
        }

        // Final result is 1.034...
        // We want the returned value to be 3.4...%
        return fdMultiplierToPercent(totalFD);
    }

    optimise()
    {
        // To be reworked to:
        // 1. Branch if there are lesser than 3 nodes with available levels
        // 2a) Try combinations of main and additionals to get the most levels for descending FD types
        // 2b) Just take the max of the <=2 nodes to assign to current FD type
        // 3. Stop when no more nodes have available levels
        // Check calc:
        // (1+0.001607074106*15)*(1+0.001337792374*9)*(1+0.001271455817*7)

        // Clear all previous set lines to start with clean slate
        for (let i = 0; i < this.#hexaStatNodes.length; i++)
        {
            this.#hexaStatNodes[i].unsetAllLines();
        }

        // Temp, assign the highest fd to the highest unit
        // Start with the highest fd, which was already sorted during init
        for (let typeFDPairIndex = 0; typeFDPairIndex < HexaStatNodeArray.#hexaStatTypeFDPairs.length; typeFDPairIndex++)
        {
            let numLinesAvailable = 0;
            let nodeLineUnitsArray = [];
            for (let i = 0; i < this.#hexaStatNodes.length; i++)
            {
                // Each node starts with each line being -1, meaning they are already set so cannot be considered again
                nodeLineUnitsArray.push(Array(HexaStatNode.NUM_STAT_LINES).fill(-1));

                for (let j = 0; j < HexaStatNode.NUM_STAT_LINES; j++)
                {
                    if (this.#hexaStatNodes[i].getTypeOfLine(j) == HexaStatLineType.Unset)
                    {
                        // This line can be set, update the units available
                        nodeLineUnitsArray[i][j] = this.#hexaStatNodes[i].getNumUnitsOfLine(j);
                        numLinesAvailable += 1;
                    }
                }
            }

            if (numLinesAvailable == 0)
            {
                // Nothing more to set since all lines already have a type
                break;
            }

            // Find the line with the highest number of units
            for (let i = 0; i < this.#hexaStatNodes.length; i++)
            {
                let highestLineUnits = -1;
                let highestLineUnitsIndex = -1;
                
                for (let j = 0; j < HexaStatNode.MAX_LEVEL_SUM; j++)
                {
                    if (nodeLineUnitsArray[i][j] > highestLineUnits)
                    {
                        highestLineUnits = nodeLineUnitsArray[i][j];
                        highestLineUnitsIndex = j;
                    }
                }

                // Assign the current fd type to the line with the highest amount of units
                if (highestLineUnitsIndex != -1)
                {
                    this.#hexaStatNodes[i].setTypeOfLine(highestLineUnitsIndex, HexaStatNodeArray.#hexaStatTypeFDPairs[typeFDPairIndex].type);
                }
            }
        }
    }

    getInfo(showFragmentsCost)
    {
        let htmlText = `FD%: ${formatNumberForPrint(this.getTotalFDPercent())}`
        if (showFragmentsCost)
        {
            htmlText += `, Fragments: ${this.getFragmentsCost()}`
        }
        for (let i = 0; i < this.#hexaStatNodes.length; i++)
        {
            htmlText += this.#hexaStatNodes[i].getInfo(i);
        }
        return htmlText;
    }

    // Not using setter function because this should be used specifically to hijack the leveling system
    setLevels(nodeIndex, mainLevel, addStat1Level, addStat2Level)
    {
        if (nodeIndex >= this.#hexaStatNodes.length)
        {
            return;
        }

        this.#hexaStatNodes[nodeIndex].setLevels(mainLevel, addStat1Level, addStat2Level);
    }
}