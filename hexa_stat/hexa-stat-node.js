class HexaStatLineIndex
{
    static MainStat = new HexaStatLineIndex(0);
    static AddStat1 = new HexaStatLineIndex(1);
    static AddStat2 = new HexaStatLineIndex(2);

    #index;
    constructor(index)
    {
        this.#index = index;
    }

    get index()
    {
        return this.#index;
    }
}

class HexaStatNode
{
    static MAX_LEVEL_SUM = 20;
    static #UNLOCK_COST = 10;
    static #hexaStatTypeFDPairs = [];

    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD)
    {
        HexaStatNode.#hexaStatTypeFDPairs = [attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD];
        // Sort the stat types by highest FD to lowest FD, for type optimisation if the hexa stat line's FD is 0
        HexaStatNode.#hexaStatTypeFDPairs.sort(function (a, b) { return b.fdPerUnit - a.fdPerUnit });
    }

    static getFDPercentBetweenNodes(oldHexaStatNode, newHexaStatNode)
    {
        return getPercentBetweenFdPercents(oldHexaStatNode.getTotalFDPercent(), newHexaStatNode.getTotalFDPercent());
    }

    static getFDFragmentRatioBetweenNodes(oldHexaStatNode, newHexaStatNode)
    {
        return HexaStatNode.getFDPercentBetweenNodes(oldHexaStatNode, newHexaStatNode) / newHexaStatNode.additionalFragmentsCost;
    }

    #hexaStatLines = [new HexaStatLine(HexaStatNode.#hexaStatTypeFDPairs[HexaStatLineIndex.MainStat.index], true),
    new HexaStatLine(HexaStatNode.#hexaStatTypeFDPairs[HexaStatLineIndex.AddStat1.index]),
    new HexaStatLine(HexaStatNode.#hexaStatTypeFDPairs[HexaStatLineIndex.AddStat2.index])];

    #currLevelSum = 0;
    #additionalFragmentsCost = 0;

    constructor()
    {
        this.#additionalFragmentsCost = HexaStatNode.#UNLOCK_COST;
    }

    get additionalFragmentsCost()
    {
        return this.#additionalFragmentsCost;
    }

    getNumUnitsOfLine(lineIndex)
    {
        return this.#hexaStatLines[lineIndex].getTotalUnits();
    }

    getTypeOfLine(lineIndex)
    {
        return this.#hexaStatLines[lineIndex].typeFDPair.type;
    }

    getTotalFDPercent()
    {
        // Check if boss dmg and dmg are together, add those together if so
        let bossDmgLineIndex = -1;
        let dmgLineIndex = -1;
        // Sum of all indexes that can be used to get the stat line
        let totalIndexSum = 0 + 1 + 2;
        // Find indexes of the boss dmg and dmg lines, if they exist
        for (let i = 0; i <= 2; i++)
        {
            if (this.#hexaStatLines[i].typeFDPair.type == HexaStatLineType.BossDmg)
            {
                bossDmgLineIndex = i;
            }
            else if (this.#hexaStatLines[i].typeFDPair.type == HexaStatLineType.Dmg)
            {
                dmgLineIndex = i;
            }
            continue;
        }
        if (bossDmgLineIndex != -1 && dmgLineIndex != -1)
        {
            // Add the FD of boss dmg and dmg
            let dmgFDPercent = this.#hexaStatLines[bossDmgLineIndex].getTotalFDPercent() + this.#hexaStatLines[dmgLineIndex].getTotalFDPercent();
            let dmgMultiplier = fdPercentToMultiplier(dmgFDPercent);
            // Subtract the boss dmg index and dmg index to get the index of the remaining stat
            let remainingStatLineIndex = totalIndexSum - bossDmgLineIndex - dmgLineIndex;
            let otherStatMultiplier = fdPercentToMultiplier(this.#hexaStatLines[remainingStatLineIndex].getTotalFDPercent());
            // Multiply the independent value
            let totalMultiplier = dmgMultiplier * otherStatMultiplier;
            return fdMultiplierToPercent(totalMultiplier);
        }

        // Else, every stat is independent so multiply with each other
        let totalMultiplier = 1;
        for (let i = 0; i <= 2; i++)
        {
            totalMultiplier *= fdPercentToMultiplier(this.#hexaStatLines[i].getTotalFDPercent());
        }

        return fdMultiplierToPercent(totalMultiplier);
    }

    levelUpTo(targetLevelSum)
    {
        if (targetLevelSum > HexaStatNode.MAX_LEVEL_SUM)
        {
            throw new EvalError(`Leveling hexa stat node above known max of ${HexaStatNode.MAX_LEVEL_SUM}`);
        }
        for (let i = this.#currLevelSum; i < targetLevelSum; i++)
        {
            this.levelUp();
        }
    }

    levelUp()
    {
        if (this.#currLevelSum == HexaStatNode.MAX_LEVEL_SUM)
        {
            throw new EvalError("Leveling hexa stat node above known max.");
        }

        this.#additionalFragmentsCost += this.#hexaStatLines[HexaStatLineIndex.MainStat.index].getFragmentCost();

        if (this.#hexaStatLines[HexaStatLineIndex.MainStat.index].canLevelUp())
        {
            let roll = Math.random() * 100;
            let mainStatLevelUpChance = this.#hexaStatLines[HexaStatLineIndex.MainStat.index].getMainLevelUpChance();
            if (roll < mainStatLevelUpChance)
            {
                this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.MainStat.index]);
                return;
            }
        }

        // Else the main did not level up (either due to maxed or failed chance)
        if (!this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].canLevelUp())
        {
            // Additional stat1 is maxed, so level the other
            this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.AddStat2.index]);
            return;
        }
        else if (!this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].canLevelUp())
        {
            // Additional stat2 is maxed, so level the other
            this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.AddStat1.index]);
            return;
        }
        else
        {
            // Try the 50-50 between the two additional stats
            let roll = Math.random() * 100;
            if (roll < 50)
            {
                this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.AddStat1.index]);
            }
            else
            {
                this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.AddStat2.index]);
            }
        }
    }

    optimise()
    {
        // Reset to default type-FD pair first
        for (let i = 0; i < this.#hexaStatLines.length; i++)
        {
            this.#hexaStatLines[i].typeFDPair = HexaStatNode.#hexaStatTypeFDPairs[i];
        }
        let maxFD = this.getTotalFDPercent();
        let maxFDTypeFDCombination = [this.#hexaStatLines[HexaStatLineIndex.MainStat.index].typeFDPair,
        this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].typeFDPair,
        this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].typeFDPair];

        // 6 possibilites
        for (let mainStatTypeIndex = 0; mainStatTypeIndex < HexaStatNode.#hexaStatTypeFDPairs.length; mainStatTypeIndex++)
        {
            // 5 possibilites
            for (let addStat1TypeIndex = 0; addStat1TypeIndex < HexaStatNode.#hexaStatTypeFDPairs.length; addStat1TypeIndex++)
            {
                if (addStat1TypeIndex == mainStatTypeIndex)
                {
                    continue;
                }

                // 4 possibilities
                for (let addStat2TypeIndex = 0; addStat2TypeIndex < HexaStatNode.#hexaStatTypeFDPairs.length; addStat2TypeIndex++)
                {
                    if (addStat2TypeIndex == mainStatTypeIndex || addStat2TypeIndex == addStat1TypeIndex)
                    {
                        continue;
                    }

                    this.#hexaStatLines[HexaStatLineIndex.MainStat.index].typeFDPair = HexaStatNode.#hexaStatTypeFDPairs[mainStatTypeIndex];
                    this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].typeFDPair = HexaStatNode.#hexaStatTypeFDPairs[addStat1TypeIndex];
                    this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].typeFDPair = HexaStatNode.#hexaStatTypeFDPairs[addStat2TypeIndex];
                    let currFD = this.getTotalFDPercent();

                    if (currFD > maxFD)
                    {
                        maxFD = currFD;
                        // Overwrite with the types that would give the most FD
                        for (let i = 0; i < this.#hexaStatLines.length; i++)
                        {
                            maxFDTypeFDCombination[i] = this.#hexaStatLines[i].typeFDPair;
                        }
                    }
                }
            }
        }

        let lowestFdUnitOffset = 1;
        // Use what was determined to be the highest
        for (let i = 0; i < this.#hexaStatLines.length; i++)
        {
            this.#hexaStatLines[i].typeFDPair = maxFDTypeFDCombination[i];

            // Check if any lines give 0 FD, whether because the level is 0 or the FD per unit is 0
            if (this.#hexaStatLines[i].getTotalFDPercent() == 0)
            {
                // Assign the type with the lowest FD per unit, while making sure the types are still unique
                this.#hexaStatLines[i].typeFDPair = HexaStatNode.#hexaStatTypeFDPairs[HexaStatNode.#hexaStatTypeFDPairs.length - lowestFdUnitOffset];
                lowestFdUnitOffset++;
            }
        }
    }

    #levelUpStat(statLine)
    {
        statLine.levelUp();
        this.#currLevelSum += 1;
    }

    getInfo(nodeIndex)
    {
        let nodeCounter = nodeIndex + 1;
        let htmlText = `<br>-----`;
        htmlText += `
            <br>
            Node${nodeCounter}_Main: lvl ${this.#hexaStatLines[HexaStatLineIndex.MainStat.index].level} ${this.#hexaStatLines[HexaStatLineIndex.MainStat.index].typeFDPair.type.name}<br>
            Node${nodeCounter}_Additional Stat1: lvl ${this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].level} ${this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].typeFDPair.type.name}<br>
            Node${nodeCounter}_Additional Stat2: lvl ${this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].level} ${this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].typeFDPair.type.name}
        `;
        return htmlText;
    }

    // Not using setter function because this should be used specifically to hijack the leveling system
    setLevels(mainLevel, addStat1Level, addStat2Level)
    {
        if (mainLevel + addStat1Level + addStat2Level > HexaStatNode.MAX_LEVEL_SUM)
        {
            throw new EvalError(`Leveling hexa stat node above known max of ${HexaStatNode.MAX_LEVEL_SUM}`);
        }
        this.#hexaStatLines[HexaStatLineIndex.MainStat.index].setLevel(mainLevel);
        this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].setLevel(addStat1Level);
        this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].setLevel(addStat2Level);
        this.#currLevelSum = mainLevel + addStat1Level + addStat2Level;
    }

    printInfo()
    {
        console.log("Main:");
        this.#hexaStatLines[0].printInfo();
        console.log("Add1:");
        this.#hexaStatLines[1].printInfo();
        console.log("Add2:");
        this.#hexaStatLines[2].printInfo()
        console.log("Additional fragments needed:", this.#additionalFragmentsCost)
        console.log("Total FD:", this.getTotalFDPercent());
    }
}