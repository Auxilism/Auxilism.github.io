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

    #hexaStatLines = [new HexaStatLine(HexaStatLineType.Unset, true),
    new HexaStatLine(HexaStatLineType.Unset),
    new HexaStatLine(HexaStatLineType.Unset)];
    static NUM_STAT_LINES = 3;

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
        return this.#hexaStatLines[lineIndex].type;
    }

    unsetAllLines()
    {
        for (let i = 0; i < this.#hexaStatLines.length; i++)
        {
            this.#hexaStatLines[i].type = HexaStatLineType.Unset;
        }
    }

    setTypeOfLine(lineIndex, type)
    {
        this.#hexaStatLines[lineIndex].type = type;
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
            Node${nodeCounter}_Main: lvl ${this.#hexaStatLines[HexaStatLineIndex.MainStat.index].level} ${this.#hexaStatLines[HexaStatLineIndex.MainStat.index].type.name}<br>
            Node${nodeCounter}_Additional Stat1: lvl ${this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].level} ${this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].type.name}<br>
            Node${nodeCounter}_Additional Stat2: lvl ${this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].level} ${this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].type.name}
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
        console.log("Additional fragments needed:", this.#additionalFragmentsCost);
    }
}