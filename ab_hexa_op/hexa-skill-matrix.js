class HexaSkillLevellingInfo {
    static getNewLevellingArray () {
        let currLevels = new Array(HexaSkillName.Values.length);
        for (let i = 0; i < currLevels.length; ++i) {
            currLevels[i] = new HexaSkillLevellingInfo();
        }
        // Always start with 1 GF
        currLevels[HexaSkillName.GF.index].currLevel = 1;
        return currLevels;
    }

    constructor (currLevel = 0, canLevel = true) {
        this.currLevel = currLevel;
        this.canLevel = canLevel;
    }
}

class HexaSkillLevelInfo {
    #hexaSkillName;
    #level;
    constructor (hexaSkillName, level) {
        this.#hexaSkillName = hexaSkillName;
        this.#level = level;
    }

    get hexaSkillName () {
        return this.#hexaSkillName;
    }

    get level () {
        return this.#level;
    }
}

class HexaSkillOptimisationMethod {
    static RemainingBestRatio = new HexaSkillOptimisationMethod('RemainingBestRatio');
    static NextRatio = new HexaSkillOptimisationMethod('NextRatio');
    static MinRatioLoss = new HexaSkillOptimisationMethod('MinRatioLoss');
    static BobOriginal = new HexaSkillOptimisationMethod('BobOriginal');
    static HighestSkillRatio = new HexaSkillOptimisationMethod('HighestSkillRatio');

    #name;
    constructor(name) {
        this.#name = name;
    }

    get name() {
        return this.#name;
    }
}

class HexaSkillMatrix {
    static #HexaSkillArray = [];
    static #remainingBestRatioPath = [];
    static #nextRatioPath = [];
    static #minRatioLossPath = [];
    static #bobOriginalPath = [];
    static #highestSkillRatio = [];

    static init(baTotal, gfTotal, cbTotal, trinityTotal,
        spotlightTotal, mascotTotal, sbTotal, tfTotal,
        fdPerBossDmgUnit, fdPerIEDUnit) {

        HexaSkill.init(baTotal);
        HexaOriginNode.init(fdPerBossDmgUnit, fdPerIEDUnit);
        HexaSkillMatrix.#HexaSkillArray = [];
        HexaSkillMatrix.#HexaSkillArray.push(new HexaOriginNode(HexaSkillName.GF, gfTotal, cbTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaMasteryNode(HexaSkillName.Trinity, trinityTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.Spotlight, spotlightTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.Mascot, mascotTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.SparkleBurst, sbTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.Fusion, tfTotal));

        HexaSkillMatrix.#remainingBestRatioPath = [];
        HexaSkillMatrix.#nextRatioPath = [];
        HexaSkillMatrix.#minRatioLossPath = [];
        HexaSkillMatrix.#bobOriginalPath = [];
        HexaSkillMatrix.#highestSkillRatio = [];
    }

    static computeOptimalPaths() {
        HexaSkillMatrix.#populateBobOriginal();
        let totalMaxLevel = 0;
        let skillIterator = HexaSkillMatrix.#HexaSkillArray.values();
        for (let skill of skillIterator) {
            skill.compute();
            totalMaxLevel += skill.maxLevel;
        }

        let currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // First, compute when searching for highest ratios spanning all levels
        while(HexaSkillMatrix.#getTotalCurrentLevel(currLevels) < totalMaxLevel) {

            let maxFDFragmentRatio = 0;
            let skillToLevel = null;
            let newSkillLevel = 0;

            let skillNameIterator = HexaSkillName.Values.values();
            for (let skillName of skillNameIterator) {
                // Don't try to compute for a skill that can't be levelled
                if (currLevels[skillName.index].canLevel == false) {
                    continue;
                }
                let proposedLevels = Array(currLevels.length);
                for (let i = 0; i < proposedLevels.length; ++i) {
                    proposedLevels[i] = currLevels[i].currLevel;
                }

                // Try to level this specific skillName
                let currSkillLevel = proposedLevels[skillName.index];
                proposedLevels[skillName.index] = HexaSkillMatrix.#HexaSkillArray[skillName.index].getNextHighestFDFragmentRatioIndex(currSkillLevel);
                let currFDFragmentRatio = HexaSkillMatrix.#getTotaFDFragRatioOfProposedLevels(proposedLevels);

                if (currFDFragmentRatio > maxFDFragmentRatio) {
                    maxFDFragmentRatio = currFDFragmentRatio;
                    skillToLevel = skillName;
                    newSkillLevel = proposedLevels[skillName.index];
                }
            }

            let oldSkillLevel = currLevels[skillToLevel.index].currLevel;
            currLevels[skillToLevel.index].currLevel = newSkillLevel;
            if (newSkillLevel == HexaSkillMatrix.#HexaSkillArray[skillToLevel.index].maxLevel) {
                currLevels[skillToLevel.index].canLevel = false;
            }

            // Push each level to the path
            for (let i = oldSkillLevel + 1; i <= newSkillLevel; i++) {
                HexaSkillMatrix.#remainingBestRatioPath.push(new HexaSkillLevelInfo(skillToLevel, i));
            }
        }

        currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // Now search using next ratios only
        // Hijack trinity 1 or it would be hard to pick
        currLevels[HexaSkillName.Trinity.index].currLevel = 1;
        HexaSkillMatrix.#nextRatioPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        while(HexaSkillMatrix.#getTotalCurrentLevel(currLevels) < totalMaxLevel) {
            let maxFDFragmentRatio = 0;
            let skillToLevel = null;
            let newSkillLevel = 0;

            let skillNameIterator = HexaSkillName.Values.values();
            for (let skillName of skillNameIterator) {
                // Don't try to compute for a skill that can't be levelled
                if (currLevels[skillName.index].canLevel == false) {
                    continue;
                }
                let proposedLevels = Array(currLevels.length);
                for (let i = 0; i < proposedLevels.length; ++i) {
                    proposedLevels[i] = currLevels[i].currLevel;
                }

                // Try to level this specific skillName
                // Only look 1 ahead
                proposedLevels[skillName.index] += 1;
                let currFDFragmentRatio = HexaSkillMatrix.#getTotaFDFragRatioOfProposedLevels(proposedLevels);

                if (currFDFragmentRatio > maxFDFragmentRatio) {
                    maxFDFragmentRatio = currFDFragmentRatio;
                    skillToLevel = skillName;
                    newSkillLevel = proposedLevels[skillName.index];
                }
            }

            currLevels[skillToLevel.index].currLevel = newSkillLevel;
            if (newSkillLevel == HexaSkillMatrix.#HexaSkillArray[skillToLevel.index].maxLevel) {
                currLevels[skillToLevel.index].canLevel = false;
            }

            // Push new level to the path
            HexaSkillMatrix.#nextRatioPath.push(new HexaSkillLevelInfo(skillToLevel, newSkillLevel));
        }

        currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // Now search backwards from max, finding the skill with the minimal loss
        for (let i = 0; i < currLevels.length; i++) {
            currLevels[i].currLevel = HexaSkillMatrix.#HexaSkillArray[i].maxLevel;
        }
        // Keep going till we are 1 GF+1 something else only
        while(HexaSkillMatrix.#getTotalCurrentLevel(currLevels) > 2) {
            let maxFDFragmentRatio = 0;
            let skillToLevel = null;
            let newSkillLevel = 0;

            let skillNameIterator = HexaSkillName.Values.values();
            for (let skillName of skillNameIterator) {
                // Don't try to compute for a skill that can't be levelled
                if (currLevels[skillName.index].canLevel == false) {
                    continue;
                }
                let proposedLevels = Array(currLevels.length);
                for (let i = 0; i < proposedLevels.length; ++i) {
                    proposedLevels[i] = currLevels[i].currLevel;
                }

                // Try to delevel this specific skill
                proposedLevels[skillName.index] -= 1;
                let currFDFragmentRatio = HexaSkillMatrix.#getTotaFDFragRatioOfProposedLevels(proposedLevels);

                if (currFDFragmentRatio > maxFDFragmentRatio) {
                    maxFDFragmentRatio = currFDFragmentRatio;
                    skillToLevel = skillName;
                    newSkillLevel = proposedLevels[skillName.index];
                }
            }

            let oldSkillLevel = currLevels[skillToLevel.index].currLevel;
            currLevels[skillToLevel.index].currLevel = newSkillLevel;
            if (skillToLevel == HexaSkillName.GF) {
                // Stop GF at 1
                if (newSkillLevel == 1) {
                    currLevels[skillToLevel.index].canLevel = false;
                }
            }
            // Any other skill at 0
            else if (newSkillLevel == 0) {
                currLevels[skillToLevel.index].canLevel = false;
            }

            // Push old level to the path, since we came down from that
            HexaSkillMatrix.#minRatioLossPath.push(new HexaSkillLevelInfo(skillToLevel, oldSkillLevel));
        }
        HexaSkillMatrix.#minRatioLossPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        // Since we backward computed, reverse the path
        HexaSkillMatrix.#minRatioLossPath.reverse();

        currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // Now search for the highest FD:Fragment ratio within the skills
        // Hijack trinity 1 or it would be hard to pick
        currLevels[HexaSkillName.Trinity.index].currLevel = 1;
        HexaSkillMatrix.#highestSkillRatio.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        while(HexaSkillMatrix.#getTotalCurrentLevel(currLevels) < totalMaxLevel) {
            let maxFDFragmentRatio = 0;
            let skillToLevel = null;
            let newSkillLevel = 0;

            let skillNameIterator = HexaSkillName.Values.values();
            for (let skillName of skillNameIterator) {
                // Don't try to compute for a skill that can't be levelled
                if (currLevels[skillName.index].canLevel == false) {
                    continue;
                }
                let proposedLevels = Array(currLevels.length);
                for (let i = 0; i < proposedLevels.length; ++i) {
                    proposedLevels[i] = currLevels[i].currLevel;
                }

                // Try to level this specific skillName
                // Only look 1 ahead
                let currSkillLevel = proposedLevels[skillName.index];
                proposedLevels[skillName.index] = HexaSkillMatrix.#HexaSkillArray[skillName.index].getNextHighestFDFragmentRatioIndex(currSkillLevel);;
                let currFDFragmentRatio = HexaSkillMatrix.#HexaSkillArray[skillName.index].getFDFragmentRatioAtLevel(proposedLevels[skillName.index]);

                if (currFDFragmentRatio > maxFDFragmentRatio) {
                    maxFDFragmentRatio = currFDFragmentRatio;
                    skillToLevel = skillName;
                    newSkillLevel = proposedLevels[skillName.index];
                }
            }

            let oldSkillLevel = currLevels[skillToLevel.index].currLevel;
            currLevels[skillToLevel.index].currLevel = newSkillLevel;
            if (newSkillLevel == HexaSkillMatrix.#HexaSkillArray[skillToLevel.index].maxLevel) {
                currLevels[skillToLevel.index].canLevel = false;
            }
            // Push each level to the path
            for (let i = oldSkillLevel + 1; i <= newSkillLevel; i++) {
                HexaSkillMatrix.#highestSkillRatio.push(new HexaSkillLevelInfo(skillToLevel, i));
            }

            // Push new level to the path
            //HexaSkillMatrix.#highestSkillRatio.push(new HexaSkillLevelInfo(skillToLevel, newSkillLevel));
        }


        console.log(HexaSkillMatrix.#remainingBestRatioPath);
        console.log(HexaSkillMatrix.#nextRatioPath);
        console.log(HexaSkillMatrix.#minRatioLossPath);
        console.log(HexaSkillMatrix.#bobOriginalPath);
        console.log(HexaSkillMatrix.#highestSkillRatio);
        for (let i = 0; i <= 11; ++i) {
            console.log(i);
            console.log("Spotlight");
            console.log("FD%", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Spotlight.index].getFDPercentAtLevel(i));
            console.log("total frag", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Spotlight.index].getTotalFragmentCostForLevel(i));
            console.log("ratio", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Spotlight.index].getFDFragmentRatioAtLevel(i));
            console.log("Trinity");
            console.log("FD%", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Trinity.index].getFDPercentAtLevel(i));
            console.log("total frag", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Trinity.index].getTotalFragmentCostForLevel(i));
            console.log("ratio", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Trinity.index].getFDFragmentRatioAtLevel(i));
            console.log("GF");
            console.log("FD%", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.GF.index].getFDPercentAtLevel(i));
            console.log("total frag", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.GF.index].getTotalFragmentCostForLevel(i));
            console.log("ratio", HexaSkillMatrix.#HexaSkillArray[HexaSkillName.GF.index].getFDFragmentRatioAtLevel(i));
        }
    }

    static getGraphData (method) {
        let path = null;
        switch (method) {
            case HexaSkillOptimisationMethod.RemainingBestRatio:
                path = HexaSkillMatrix.#remainingBestRatioPath;
                break;
            case HexaSkillOptimisationMethod.NextRatio:
                path = HexaSkillMatrix.#nextRatioPath;
                break;
            case HexaSkillOptimisationMethod.MinRatioLoss:
                path = HexaSkillMatrix.#minRatioLossPath;
                break;
            case HexaSkillOptimisationMethod.BobOriginal:
                path = HexaSkillMatrix.#bobOriginalPath;
                break;
            case HexaSkillOptimisationMethod.HighestSkillRatio:
                path = HexaSkillMatrix.#highestSkillRatio;
                break;
            default:
                alert("Unknown method called in HexaSkillMatrix.getGraphData");
        }

        let xyData = [];
        let currLevels = new Array(HexaSkillName.Values.length).fill(0);
        // Always start with 1 GF
        currLevels[HexaSkillName.GF.index] = 1;

        for (let i = 0; i < path.length; ++i) {
            currLevels[path[i].hexaSkillName.index] = path[i].level;
            let currFD = HexaSkillMatrix.#getFDPercentOfProposedLevels(currLevels);
            let currTotalFragments = HexaSkillMatrix.#getTotalFragmentsOfProposedLevels(currLevels);
            xyData.push({x:currTotalFragments, y:currFD});
        }
        console.log(xyData);
        return xyData;
    }

    // proposedLevels is a list of int
    static #getFDPercentOfProposedLevels (proposedLevels) {
        let totalFDPercent = 0;
        // Do additive types first
        for (let i = 0; i < HexaSkillMatrix.#HexaSkillArray.length; ++i) {
            if (HexaSkillMatrix.#HexaSkillArray[i].hexaSkillFDOperationType == HexaSkillFDOperationType.Add) {
                totalFDPercent += HexaSkillMatrix.#HexaSkillArray[i].getFDPercentAtLevel(proposedLevels[i]);
            }
        }
        let totalFDMult = fdPercentToMultiplier(totalFDPercent);
        // Now multiplicative
        for (let i = 0; i < HexaSkillMatrix.#HexaSkillArray.length; ++i) {
            if (HexaSkillMatrix.#HexaSkillArray[i].hexaSkillFDOperationType == HexaSkillFDOperationType.Mult) {
                totalFDMult *= fdPercentToMultiplier(HexaSkillMatrix.#HexaSkillArray[i].getFDPercentAtLevel(proposedLevels[i]));
            }
        }
        return fdMultiplierToPercent(totalFDMult);
    }

    // proposedLevels is a list of int
    static #getTotalFragmentsOfProposedLevels (proposedLevels) {
        let totalFragments = 0;
        for (let i = 0; i < HexaSkillMatrix.#HexaSkillArray.length; ++i) {
            totalFragments += HexaSkillMatrix.#HexaSkillArray[i].getTotalFragmentCostForLevel(proposedLevels[i]);
        }
        return totalFragments;
    }

    // proposedLevels is a list of int
    static #getTotaFDFragRatioOfProposedLevels (proposedLevels) {
        return HexaSkillMatrix.#getFDPercentOfProposedLevels(proposedLevels) 
        / HexaSkillMatrix.#getTotalFragmentsOfProposedLevels(proposedLevels);
    }

    // currLevels is a list of HexaSkillLevellingInfo
    static #getTotalCurrentLevel (currLevels) {
        let totalLevel = 0;
        for (let i = 0; i < currLevels.length; ++i) {
            totalLevel += currLevels[i].currLevel;
        }
        return totalLevel;
    }

    static #populateBobOriginal() {
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 2));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 3));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 4));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 5));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 6));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 7));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 8));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 9));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 10));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 11));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 12));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 13));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 14));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 15));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 16));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 2));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 17));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 1));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 3));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 18));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 4));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 19));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 2));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 20));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 5));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 21));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 22));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 6));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 23));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 7));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 24));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 25));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 3));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 8));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 26));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 9));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 27));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 28));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 4));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 29));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 1));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 30));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 5));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 1));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 2));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 6));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 10));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 11));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 1));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 12));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 2));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 7));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 13));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 3));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 14));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 15));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 8));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 2));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 3));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 16));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 17));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 4));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 9));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 18));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 10));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 19));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 4));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 3));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 5));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 11));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 5));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 20));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 12));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 4));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 6));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 21));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 22));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 13));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 23));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 6));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 24));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 7));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 5));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 14));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 25));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 26));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 27));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 15));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 7));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 8));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 28));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 6));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 29));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 30));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 16));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 8));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 9));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 17));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 7));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 10));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 9));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 18));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 11));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 8));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 10));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 19));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 20));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 12));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 11));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 9));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 21));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 13));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 22));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 12));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 10));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 23));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 14));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 13));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 11));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 24));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 15));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 25));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 14));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 12));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 26));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 16));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 15));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 13));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 27));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 17));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 28));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 16));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 14));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 29));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 30));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 18));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 17));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 15));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 19));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 20));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 18));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 16));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 21));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 19));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 17));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 20));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 22));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 21));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 18));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 23));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 22));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 24));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 19));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 20));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 23));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 25));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 21));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 24));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 26));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 25));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 22));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 27));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 26));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 28));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 23));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 29));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 30));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 27));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 24));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 28));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 25));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 29));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 30));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 26));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 27));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 28));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 29));
        HexaSkillMatrix.#bobOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 30));
    }
}
