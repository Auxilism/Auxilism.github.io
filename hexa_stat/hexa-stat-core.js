class HexaStatLineIndex {
    static MainStat = new HexaStatLineIndex(0);
    static AddStat1 = new HexaStatLineIndex(1);
    static AddStat2 = new HexaStatLineIndex(2);

    #index;
    constructor(index) {
        this.#index = index;
    }

    get index() {
        return this.#index;
    }
}

class HexaStatCore {
    static get MAX_LEVEL_SUM() { return 20; }
    #currLevelSum = 0;

    static #hexaStatTypeFDPairs = [];

    #hexaStatLines = [new HexaStatLine(HexaStatCore.#hexaStatTypeFDPairs[HexaStatLineIndex.MainStat.index], true),
    new HexaStatLine(HexaStatCore.#hexaStatTypeFDPairs[HexaStatLineIndex.AddStat1.index]),
    new HexaStatLine(HexaStatCore.#hexaStatTypeFDPairs[HexaStatLineIndex.AddStat2.index])];

    #additionalFragmentsCost = 0;
    get additionalFragmentsCost() {
        return this.#additionalFragmentsCost;
    }

    // All of type HexaStatTypeFDPair
    static init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD) {
        HexaStatCore.#hexaStatTypeFDPairs = [attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD];
    }

    getFdFragmentRatio() {
        return this.getTotalFDPercent() / this.#additionalFragmentsCost;
    }

    getTotalFDPercent() {
        // Check if boss dmg and dmg are together, add those together if so
        let bossDmgLineIndex = -1;
        let dmgLineIndex = -1;
        // Sum of all indexes that can be used to get the stat line
        let totalIndexSum = 0 + 1 + 2;
        // Find indexes of the boss dmg and dmg lines, if they exist
        for (let i = 0; i <= 2; ++i) {
            if (this.#hexaStatLines[i].typeFDPair.type == HexaStatLineType.BossDmg) {
                bossDmgLineIndex = i;
            }
            else if (this.#hexaStatLines[i].typeFDPair.type == HexaStatLineType.Dmg) {
                dmgLineIndex = i;
            }
            continue;
        }
        if (bossDmgLineIndex != -1 && dmgLineIndex != -1) {
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
        for (let i = 0; i <= 2; ++i) {
            totalMultiplier *= fdPercentToMultiplier(this.#hexaStatLines[i].getTotalFDPercent());
        }

        return fdMultiplierToPercent(totalMultiplier);
    }

    levelUpTo(targetLevelSum) {
        if (targetLevelSum > HexaStatCore.MAX_LEVEL_SUM) {
            throw new EvalError("Leveling hexa stat core above known max.");
        }
        for (let i = this.#currLevelSum; i < targetLevelSum; ++i) {
            this.levelUp();
        }
    }

    levelUp() {
        if (this.#currLevelSum == HexaStatCore.MAX_LEVEL_SUM) {
            throw new EvalError("Leveling hexa stat core above known max.");
        }

        this.#additionalFragmentsCost += this.#hexaStatLines[HexaStatLineIndex.MainStat.index].getFragmentCost();

        if (this.#hexaStatLines[HexaStatLineIndex.MainStat.index].canLevelUp()) {
            let roll = Math.random() * 100;
            let mainStatLevelUpChance = this.#hexaStatLines[HexaStatLineIndex.MainStat.index].getMainLevelUpChance();
            if (roll < mainStatLevelUpChance) {
                this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.MainStat.index]);
                return;
            }
        }

        // Else the main did not level up (either due to maxed or failed chance)
        if (!this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].canLevelUp()) {
            // Additional stat1 is maxed, so level the other
            this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.AddStat2.index]);
            return;
        }
        else if (!this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].canLevelUp()) {
            // Additional stat2 is maxed, so level the other
            this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.AddStat1.index]);
            return;
        }
        else {
            // Try the 50-50 between the two additional stats
            let roll = Math.random() * 100;
            if (roll < 50) {
                this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.AddStat1.index]);
            }
            else {
                this.#levelUpStat(this.#hexaStatLines[HexaStatLineIndex.AddStat2.index]);
            }
        }
    }

    optimise() {
        // Reset to default type-FD pair first
        for (let i = 0; i < this.#hexaStatLines.length; ++i) {
            this.#hexaStatLines[i].typeFDPair = HexaStatCore.#hexaStatTypeFDPairs[i];
        }
        let maxFD = this.getTotalFDPercent();
        let maxFDTypeFDCombination = [this.#hexaStatLines[HexaStatLineIndex.MainStat.index].typeFDPair,
        this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].typeFDPair,
        this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].typeFDPair];

        // 6 possibilites
        for (let mainStatTypeIndex = 0; mainStatTypeIndex < HexaStatCore.#hexaStatTypeFDPairs.length; ++mainStatTypeIndex) {
            // 5 possibilites
            for (let addStat1TypeIndex = 0; addStat1TypeIndex < HexaStatCore.#hexaStatTypeFDPairs.length; ++addStat1TypeIndex) {
                if (addStat1TypeIndex == mainStatTypeIndex) {
                    continue;
                }

                // 4 possibilities
                for (let addStat2TypeIndex = 0; addStat2TypeIndex < HexaStatCore.#hexaStatTypeFDPairs.length; ++addStat2TypeIndex) {
                    if (addStat2TypeIndex == mainStatTypeIndex || addStat2TypeIndex == addStat1TypeIndex) {
                        continue;
                    }

                    this.#hexaStatLines[HexaStatLineIndex.MainStat.index].typeFDPair = HexaStatCore.#hexaStatTypeFDPairs[mainStatTypeIndex];
                    this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].typeFDPair = HexaStatCore.#hexaStatTypeFDPairs[addStat1TypeIndex];
                    this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].typeFDPair = HexaStatCore.#hexaStatTypeFDPairs[addStat2TypeIndex];
                    let currFD = this.getTotalFDPercent();

                    if (currFD > maxFD) {
                        maxFD = currFD;
                        // Overwrite with the types that would give the most FD
                        for (let i = 0; i < this.#hexaStatLines.length; ++i) {
                            maxFDTypeFDCombination[i] = this.#hexaStatLines[i].typeFDPair;
                        }
                    }
                }
            }
        }

        // Use what was determined to be the highest
        for (let i = 0; i < this.#hexaStatLines.length; ++i) {
            this.#hexaStatLines[i].typeFDPair = maxFDTypeFDCombination[i];
        }
    }

    #levelUpStat(statLine) {
        statLine.levelUp();
        this.#currLevelSum += 1;
    }

    getInfo() {
        return `
        FD%: ${formatNumberForPrint(this.getTotalFDPercent())}, Fragments: ${this.#additionalFragmentsCost}<br>
        Main: lvl ${this.#hexaStatLines[HexaStatLineIndex.MainStat.index].level} ${this.#hexaStatLines[HexaStatLineIndex.MainStat.index].typeFDPair.type.name}<br>
        Additional Stat1: lvl ${this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].level} ${this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].typeFDPair.type.name}<br>
        Additional Stat2: lvl ${this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].level} ${this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].typeFDPair.type.name}
        `;
    }

    // Not using setter function because this should be used specifically to hijack the leveling system
    setLevels(mainLevel, addStat1Level, addStat2Level) {
        if (mainLevel + addStat1Level + addStat2Level > HexaStatCore.MAX_LEVEL_SUM) {
            throw new EvalError("Leveling hexa stat core above known max.");
        }
        this.#hexaStatLines[HexaStatLineIndex.MainStat.index].setLevel(mainLevel);
        this.#hexaStatLines[HexaStatLineIndex.AddStat1.index].setLevel(addStat1Level);
        this.#hexaStatLines[HexaStatLineIndex.AddStat2.index].setLevel(addStat2Level);
    }

    printInfo() {
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