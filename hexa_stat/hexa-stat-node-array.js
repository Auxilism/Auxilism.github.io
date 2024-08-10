class HexaStatNodeArray {
    static #hexaStatTypeFDPairs = [];
    static #MAX_NODE_COUNT = 6;

    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD) {
        HexaStatNodeArray.#hexaStatTypeFDPairs = [attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD];
        // Sort the stat types by highest FD to lowest FD, for type optimisation
        HexaStatNodeArray.#hexaStatTypeFDPairs.sort(function (a, b) { return b.fdPerUnit - a.fdPerUnit });
    }

    #hexaStatNodes = [];
    constructor(totalNodeLevel) {
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

    getFragmentsCost() {
        let fragCost = 0;
        for (let i = 0; i < this.#hexaStatNodes.length; i++)
        {
            fragCost += this.#hexaStatNodes[i].additionalFragmentsCost;
        }
        return fragCost;
    }

    getFdFragmentRatio() {
        return this.getTotalFDPercent() / this.getFragmentsCost();
    }

    getTotalFDPercent() {
        // To be reworked to add all the levels of each type, then multiply together
        let totalFDPercent = 0;
        for (let i = 0; i < this.#hexaStatNodes.length; i++)
        {
            totalFDPercent += this.#hexaStatNodes[i].getTotalFDPercent();
        }
        return totalFDPercent;
    }

    optimise() {
        // To be reworked to:
        // 1. Branch if there are lesser than 3 nodes with available levels
        // 2a) Try combinations of main and additionals to get the most levels for descending FD types
        // 2b) Just take the max of the <=2 nodes to assign to current FD type
        // 3. Stop when no more nodes have available levels
        for (let i = 0; i < this.#hexaStatNodes.length; i++)
        {
            this.#hexaStatNodes[i].optimise();
        }
    }

    getInfo(showFragmentsCost) {
        let htmlText = `FD%: ${formatNumberForPrint(this.getTotalFDPercent())}`
        if (showFragmentsCost) {
            htmlText += `, Fragments: ${this.getFragmentsCost()}`
        }
        for (let i = 0; i < this.#hexaStatNodes.length; i++)
        {
            htmlText += this.#hexaStatNodes[i].getInfo(i);
        }
        return htmlText;
    }

    // Not using setter function because this should be used specifically to hijack the leveling system
    setLevels(nodeIndex, mainLevel, addStat1Level, addStat2Level) {
        if (nodeIndex >= this.#hexaStatNodes.length)
        {
            return;
        }

        this.#hexaStatNodes[nodeIndex].setLevels(mainLevel, addStat1Level, addStat2Level);
    }
}