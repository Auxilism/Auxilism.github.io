class HexaSkillLevellingInfo
{
    static getNewLevellingArray()
    {
        let currLevels = new Array(HexaSkillName.Values.length);
        for (let i = 0; i < currLevels.length; ++i)
        {
            currLevels[i] = new HexaSkillLevellingInfo();
        }
        // Always start with 1 GF
        currLevels[HexaSkillName.GF.index].currLevel = 1;
        return currLevels;
    }

    constructor(currLevel = 0, canLevel = true)
    {
        this.currLevel = currLevel;
        this.canLevel = canLevel;
    }
}

class HexaSkillLevelInfo
{
    #hexaSkillName;
    #level;
    constructor(hexaSkillName, level)
    {
        this.#hexaSkillName = hexaSkillName;
        this.#level = level;
    }

    get hexaSkillName()
    {
        return this.#hexaSkillName;
    }

    get level()
    {
        return this.#level;
    }
}

class HexaSkillOptimisationMethod
{
    static BestRemainingOverallRatio = new HexaSkillOptimisationMethod('RemainingBestRatio');
    static NextOverallRatio = new HexaSkillOptimisationMethod('NextRatio');
    static MinRatioLoss = new HexaSkillOptimisationMethod('MinRatioLoss');
    static BoostyPrevOriginal = new HexaSkillOptimisationMethod('BoostyPrevOriginal');
    static BoostyOverallOriginal = new HexaSkillOptimisationMethod('BoostyOverallOriginal');
    static HighestSkillRatio = new HexaSkillOptimisationMethod('HighestSkillRatio');
    static HighestRemainingSkillRatio = new HexaSkillOptimisationMethod('HighestRemainingSkillRatio');
    static HijackHexaStat = new HexaSkillOptimisationMethod('HijackHexaStat');
    static BoostySingleOriginal = new HexaSkillOptimisationMethod('BoostySingleOriginal');
    static LowestFragmentCost = new HexaSkillOptimisationMethod('LowestFragmentCost');
    static BoostyHijack = new HexaSkillOptimisationMethod('BoostyHijack');

    #name;
    constructor(name)
    {
        this.#name = name;
    }

    get name()
    {
        return this.#name;
    }
}

class HexaSkillMatrix
{
    static #HexaSkillArray = [];
    static #bestRemainingOverallRatioPath = [];
    static #nextOverallRatioPath = [];
    static #minRatioLossPath = [];
    static #boostyPrevOriginalPath = [];
    static #boostyOverallOriginalPath = [];
    static #highestSkillRatioPath = [];
    static #highestRemainingSkillRatioPath = [];
    static #hijackHexaStatPath = [];
    static #boostySingleOriginalPath = [];
    static #lowestFragmentCostPath = [];
    static #boostyHijackPath = [];

    static init(baInputTotal, gfInputTotal, cbInputTotal, gfCurrLevel,
        trinityInputTotal, trinityCurrLevel, spotlightInputTotal, spotlightCurrLevel,
        mascotInputTotal, mascotCurrLevel, sbInputTotal, sbCurrLevel, tfInputTotal, tfCurrLevel,
        fdPerBossDmgUnit, fdPerIEDUnit, seekerInputTotal, seekerCurrLevel)
    {

        HexaOriginNode.init(fdPerBossDmgUnit, fdPerIEDUnit);
        HexaSkillMatrix.#HexaSkillArray = [];
        HexaSkillMatrix.#HexaSkillArray.push(new HexaOriginNode(HexaSkillName.GF, gfInputTotal, cbInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaTrinity(trinityInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.Spotlight, spotlightInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaMascot(HexaSkillName.Mascot, mascotInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.SparkleBurst, sbInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.Fusion, tfInputTotal));
        // Hexa Stat has no base damage
        HexaSkillMatrix.#HexaSkillArray.push(new ConvertedHexaStatToSkill(HexaSkillName.HexaStat, 0));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaSeeker(seekerInputTotal));

        // Scale down the ba total by reverting the hexa skills back to lvl 0 (1 for origin)
        baInputTotal -= (gfInputTotal + cbInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.GF.index].calcSkillBaseTotal(gfCurrLevel));
        baInputTotal -= (trinityInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Trinity.index].calcSkillBaseTotal(trinityCurrLevel));
        baInputTotal -= (spotlightInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Spotlight.index].calcSkillBaseTotal(spotlightCurrLevel));
        baInputTotal -= (mascotInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Mascot.index].calcSkillBaseTotal(mascotCurrLevel));
        baInputTotal -= (sbInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.SparkleBurst.index].calcSkillBaseTotal(sbCurrLevel));
        baInputTotal -= (tfInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Fusion.index].calcSkillBaseTotal(tfCurrLevel));
        baInputTotal -= (seekerInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Seeker.index].calcSkillBaseTotal(seekerCurrLevel));
        // Don't need to revert hexa stat as that is universally applied
        HexaSkill.init(baInputTotal);

        HexaSkillMatrix.#bestRemainingOverallRatioPath = [];
        HexaSkillMatrix.#nextOverallRatioPath = [];
        HexaSkillMatrix.#minRatioLossPath = [];
        HexaSkillMatrix.#boostyPrevOriginalPath = [];
        HexaSkillMatrix.#boostyOverallOriginalPath = [];
        HexaSkillMatrix.#highestSkillRatioPath = [];
        HexaSkillMatrix.#highestRemainingSkillRatioPath = [];
        HexaSkillMatrix.#hijackHexaStatPath = [];
        HexaSkillMatrix.#boostySingleOriginalPath = [];
        HexaSkillMatrix.#lowestFragmentCostPath = [];
        HexaSkillMatrix.#boostyHijackPath = [];
    }

    static async computeOptimalPaths()
    {
        HexaSkillMatrix.#populateBoostyPrevOriginal();
        HexaSkillMatrix.#populateBoostyOverallOriginal();
        // HexaSkillMatrix.#populateBoostySingleOriginal();
        HexaSkillMatrix.#populateBoostyHijack();

        let totalMaxLevel = 0;
        let skillIterator = HexaSkillMatrix.#HexaSkillArray.values();
        for (let skill of skillIterator)
        {
            await skill.compute();
            totalMaxLevel += skill.maxLevel;
        }

        // let currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // HexaSkillMatrix.#computePathForMethod(HexaSkillOptimisationMethod.BestRemainingOverallRatio,
        //     currLevels, HexaSkillMatrix.#forwardLevellingExitCondition,
        //     HexaSkillMatrix.#calculateBestRemainingOverallRatio,
        //     totalMaxLevel, HexaSkillMatrix.#forwardSkillLevellingAndCheck);

        // currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // // Now search using next ratios only
        // // Hijack trinity 1 or it would be hard to pick
        // currLevels[HexaSkillName.Trinity.index].currLevel = 1;
        // HexaSkillMatrix.#nextOverallRatioPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        // HexaSkillMatrix.#computePathForMethod(HexaSkillOptimisationMethod.NextOverallRatio,
        //     currLevels, HexaSkillMatrix.#forwardLevellingExitCondition,
        //     HexaSkillMatrix.#calculateNextOverallRatio,
        //     totalMaxLevel, HexaSkillMatrix.#forwardSkillLevellingAndCheck);

        // currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // // Now search backwards from max, finding the skill with the minimal loss
        // for (let i = 0; i < currLevels.length; i++)
        // {
        //     currLevels[i].currLevel = HexaSkillMatrix.#HexaSkillArray[i].maxLevel;
        // }
        // HexaSkillMatrix.#computePathForMethod(HexaSkillOptimisationMethod.MinRatioLoss,
        //     currLevels, HexaSkillMatrix.#backwardLevellingExitCondition,
        //     HexaSkillMatrix.#calculateMinRatioLoss,
        //     totalMaxLevel, HexaSkillMatrix.#backwardSkillLevellingAndCheck);
        // // Find the last skill that is not delevelled or the total fragment cost would be 0
        // let skillNameIterator = HexaSkillName.Values.values();
        // for (let skillName of skillNameIterator)
        // {
        //     if (skillName != HexaSkillName.GF)
        //     {
        //         let currSkillLevel = currLevels[skillName.index].currLevel;
        //         if (currSkillLevel > 0)
        //         {
        //             HexaSkillMatrix.#minRatioLossPath.push(new HexaSkillLevelInfo(skillName, currSkillLevel));
        //         }
        //     }
        // }
        // // Since we backward computed, reverse the path
        // HexaSkillMatrix.#minRatioLossPath.reverse();

        // currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // // Now search for the highest FD:Fragment ratio within the skills
        // // Hijack trinity 1 or it would be hard to pick
        // currLevels[HexaSkillName.Trinity.index].currLevel = 1;
        // HexaSkillMatrix.#highestSkillRatioPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        // HexaSkillMatrix.#computePathForMethod(HexaSkillOptimisationMethod.HighestSkillRatio,
        //     currLevels, HexaSkillMatrix.#forwardLevellingExitCondition,
        //     HexaSkillMatrix.#calculateHighestSkillRatio,
        //     totalMaxLevel, HexaSkillMatrix.#forwardSkillLevellingAndCheck);

        let currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
         // Now search for the highest remaining FD:Fragment ratio within the skills
         HexaSkillMatrix.#computePathForMethod(HexaSkillOptimisationMethod.HighestRemainingSkillRatio,
             currLevels, HexaSkillMatrix.#forwardLevellingExitCondition,
             HexaSkillMatrix.#calculateHighestRemainingSkillRatio,
             totalMaxLevel, HexaSkillMatrix.#forwardSkillLevellingAndCheck);

        // currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // // Force mascot to not be bugged
        // // HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Mascot.index].isBugged = false;
        // HexaSkillMatrix.#computePathForMethod(HexaSkillOptimisationMethod.BoostySingleOriginal,
        //     currLevels, HexaSkillMatrix.#forwardLevellingExitCondition,
        //     HexaSkillMatrix.#calculateHighestRemainingSkillRatio,
        //     totalMaxLevel, HexaSkillMatrix.#forwardSkillLevellingAndCheck);
        // // Undo mascot forcing
        // // HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Mascot.index].isBugged = true;

        // currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // // Now search for the highest remaining FD:Fragment ratio within the skills
        // HexaSkillMatrix.#computePathForMethod(HexaSkillOptimisationMethod.LowestFragmentCost,
        //     currLevels, HexaSkillMatrix.#forwardLevellingExitCondition,
        //     HexaSkillMatrix.#calculateLowestFragmentCost,
        //     totalMaxLevel, HexaSkillMatrix.#forwardSkillLevellingAndCheck);
    }

    static #getPathForMethod(method)
    {
        switch (method)
        {
            case HexaSkillOptimisationMethod.BestRemainingOverallRatio:
                return HexaSkillMatrix.#bestRemainingOverallRatioPath;
            case HexaSkillOptimisationMethod.NextOverallRatio:
                return HexaSkillMatrix.#nextOverallRatioPath;
            case HexaSkillOptimisationMethod.MinRatioLoss:
                return HexaSkillMatrix.#minRatioLossPath;
            case HexaSkillOptimisationMethod.BoostyPrevOriginal:
                return HexaSkillMatrix.#boostyPrevOriginalPath;
            case HexaSkillOptimisationMethod.BoostyOverallOriginal:
                return HexaSkillMatrix.#boostyOverallOriginalPath;
            case HexaSkillOptimisationMethod.HighestSkillRatio:
                return HexaSkillMatrix.#highestSkillRatioPath;
            case HexaSkillOptimisationMethod.HighestRemainingSkillRatio:
                return HexaSkillMatrix.#highestRemainingSkillRatioPath;
            case HexaSkillOptimisationMethod.HijackHexaStat:
                return HexaSkillMatrix.#hijackHexaStatPath;
            case HexaSkillOptimisationMethod.BoostySingleOriginal:
                return HexaSkillMatrix.#boostySingleOriginalPath;
            case HexaSkillOptimisationMethod.LowestFragmentCost:
                return HexaSkillMatrix.#lowestFragmentCostPath;
            case HexaSkillOptimisationMethod.BoostyHijack:
                return HexaSkillMatrix.#boostyHijackPath;
            default:
                throw new TypeError("Unknown method called in HexaSkillMatrix.getPathForMethod");
        }
    }

    // exitConditionFunction takes (Array<HexaSkillLevellingInfo>, int) to decide when to stop making the path
    // fdFragmentRatioCalculationFunction takes (Array<int>, HexaSkillName) to return the FD:Fragment ratio
    // levelSkillAndCheckFunction takes (Array<HexaSkillLevellingInfo>, HexaSkillName, int, Array<HexaSkillLevelInfo>) to add the skill change and decide when to stop changing that skill
    static #computePathForMethod(method, currLevels, exitConditionFunction, fdFragmentRatioCalculationFunction, totalMaxLevel, levelSkillAndCheckFunction)
    {
        let path = HexaSkillMatrix.#getPathForMethod(method);
        while (exitConditionFunction(currLevels, totalMaxLevel))
        {
            let maxFDFragmentRatio = 0;
            let skillToLevel = null;
            let newSkillLevel = 0;

            let skillNameIterator = HexaSkillName.Values.values();
            for (let skillName of skillNameIterator)
            {
                // Don't try to compute for a skill that can't be levelled
                if (currLevels[skillName.index].canLevel == false)
                {
                    continue;
                }
                // Make a copy so the original levels are not touched until this loop of finding the best skill to level finishes
                let proposedLevels = Array(currLevels.length);
                for (let i = 0; i < proposedLevels.length; ++i)
                {
                    proposedLevels[i] = currLevels[i].currLevel;
                }

                // Try this specific skillName
                let currFDFragmentRatio = fdFragmentRatioCalculationFunction(proposedLevels, skillName);
                if (currFDFragmentRatio >= maxFDFragmentRatio)
                {
                    maxFDFragmentRatio = currFDFragmentRatio;
                    skillToLevel = skillName;
                    newSkillLevel = proposedLevels[skillName.index];
                }
            }

            levelSkillAndCheckFunction(currLevels, skillToLevel, newSkillLevel, path);
        }
    }

    static #calculateBestRemainingOverallRatio(currProposedLevels, skillName)
    {
        let currSkillLevel = currProposedLevels[skillName.index];
        let testArray = currProposedLevels.slice();
        testArray[skillName.index] = HexaSkillMatrix.#HexaSkillArray[skillName.index].getNextHighestFDFragmentRatioIndex(currSkillLevel);
        currProposedLevels[skillName.index] += 1;
        return HexaSkillMatrix.#getTotaFDFragRatioOfProposedLevels(testArray);
    }

    static #calculateNextOverallRatio(currProposedLevels, skillName)
    {
        currProposedLevels[skillName.index] += 1;
        return HexaSkillMatrix.#getTotaFDFragRatioOfProposedLevels(currProposedLevels);
    }

    static #calculateMinRatioLoss(currProposedLevels, skillName)
    {
        currProposedLevels[skillName.index] -= 1;
        return HexaSkillMatrix.#getTotaFDFragRatioOfProposedLevels(currProposedLevels);
    }

    static #calculateHighestSkillRatio(currProposedLevels, skillName)
    {
        let oldLevel = currProposedLevels[skillName.index];
        currProposedLevels[skillName.index] += 1;
        let currFDPercent = HexaSkillMatrix.#calculateFdPercentWithoutMultType(currProposedLevels);

        return HexaSkillMatrix.#HexaSkillArray[skillName.index].getFDFragmentRatioAtLevel(currProposedLevels[skillName.index], oldLevel, currFDPercent);
    }

    static #calculateFdPercentWithoutMultType(currProposedLevels)
    {
        let levelsWithoutMultType = Array(currProposedLevels.length);
        for (let i = 0; i < currProposedLevels.length; i++)
        {
            if (HexaSkillMatrix.#HexaSkillArray[i].hexaSkillFDOperationType == HexaSkillFDOperationType.Mult)
            {
                levelsWithoutMultType[i] = 0;
            }
            else
            {
                levelsWithoutMultType[i] = currProposedLevels[i];
            }
        }
        return HexaSkillMatrix.#getFDPercentOfProposedLevels(levelsWithoutMultType);
    }

    static #calculateHighestRemainingSkillRatio(currProposedLevels, skillName)
    {
        let currSkillLevel = currProposedLevels[skillName.index];
        currProposedLevels[skillName.index] = HexaSkillMatrix.#HexaSkillArray[skillName.index].getNextHighestFDFragmentRatioIndex(currSkillLevel);

        let currFDPercent = HexaSkillMatrix.#calculateFdPercentWithoutMultType(currProposedLevels);

        return HexaSkillMatrix.#HexaSkillArray[skillName.index].getFDFragmentRatioAtLevel(currProposedLevels[skillName.index], currSkillLevel, currFDPercent);
    }

    static #calculateLowestFragmentCost(currProposedLevels, skillName)
    {
        let currSkillLevel = currProposedLevels[skillName.index];
        currProposedLevels[skillName.index] += 1;

        // This function has to return a higher number to be considered more
        // But since now we want the lowest fragment cost to be considered, we subtract it from a huge number
        let MAX_FRAGMENT_COST = 100000;
        // Do it this way instead of getting just for that level because hexa stat does not have a stable table of costs
        let proposedLevelFragmentCost = HexaSkillMatrix.#HexaSkillArray[skillName.index].getTotalFragmentCostForLevel(currProposedLevels[skillName.index]);
        let currLevelFragmentCost = HexaSkillMatrix.#HexaSkillArray[skillName.index].getTotalFragmentCostForLevel(currSkillLevel);
        let levelUpFragmentCost = proposedLevelFragmentCost - currLevelFragmentCost;

        return MAX_FRAGMENT_COST - levelUpFragmentCost;
    }

    static #forwardLevellingExitCondition(currLevels, totalMaxLevel)
    {
        return HexaSkillMatrix.#getTotalCurrentLevel(currLevels) < totalMaxLevel;
    }

    static #backwardLevellingExitCondition(currLevels, totalMaxLevel)
    {
        // Keep going till we are (GF 1)+(something else 1) only
        return HexaSkillMatrix.#getTotalCurrentLevel(currLevels) > 2;
    }

    static #forwardSkillLevellingAndCheck(currLevels, skillToLevel, newSkillLevel, path)
    {
        let oldSkillLevel = currLevels[skillToLevel.index].currLevel;
        currLevels[skillToLevel.index].currLevel = newSkillLevel;

        // Push each new level to the path
        for (let i = oldSkillLevel + 1; i <= newSkillLevel; i++)
        {
            path.push(new HexaSkillLevelInfo(skillToLevel, i));
        }
        if (newSkillLevel == HexaSkillMatrix.#HexaSkillArray[skillToLevel.index].maxLevel)
        {
            currLevels[skillToLevel.index].canLevel = false;
        }
    }

    static #backwardSkillLevellingAndCheck(currLevels, skillToLevel, newSkillLevel, path)
    {
        let oldSkillLevel = currLevels[skillToLevel.index].currLevel;
        currLevels[skillToLevel.index].currLevel = newSkillLevel;

        // Push old level to the path, since we came down from that
        path.push(new HexaSkillLevelInfo(skillToLevel, oldSkillLevel));
        if (skillToLevel == HexaSkillName.GF)
        {
            // Stop GF at 1
            if (newSkillLevel == 1)
            {
                currLevels[skillToLevel.index].canLevel = false;
            }
        }
        // Any other skill at 0
        else if (newSkillLevel == 0)
        {
            currLevels[skillToLevel.index].canLevel = false;
        }
    }

    static getGraphData(method)
    {
        if (method == HexaSkillOptimisationMethod.BoostySingleOriginal)
        {
            // HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Mascot.index].isBugged = false;
        }
        let path = HexaSkillMatrix.#getPathForMethod(method);

        let xyData = [];
        let currLevels = new Array(HexaSkillName.Values.length).fill(0);
        // Always start with 1 GF
        currLevels[HexaSkillName.GF.index] = 1;

        for (let i = 0; i < path.length; ++i)
        {
            currLevels[path[i].hexaSkillName.index] = path[i].level;
            let currFD = HexaSkillMatrix.#getFDPercentOfProposedLevels(currLevels);
            let currTotalFragments = HexaSkillMatrix.#getTotalFragmentsOfProposedLevels(currLevels);
            xyData.push({ x: currTotalFragments, y: currFD });
        }

        if (method == HexaSkillOptimisationMethod.BoostySingleOriginal)
        {
            // HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Mascot.index].isBugged = true;
        }
        return xyData;
    }

    static #hexaSkillLevelInfoToString(hexaSkillLevelInfo)
    {
        return hexaSkillLevelInfo.hexaSkillName.name + " " + hexaSkillLevelInfo.level;
    }

    static getSkillOrder(method)
    {
        let path = HexaSkillMatrix.#getPathForMethod(method);

        let skillOrder = "";
        let prevSkill = path[0].hexaSkillName;

        let currLevels = new Array(HexaSkillName.Values.length).fill(0);
        // Always start with 1 GF
        currLevels[HexaSkillName.GF.index] = 1;

        for (let i = 1; i < path.length; ++i)
        {
            let currSkill = path[i].hexaSkillName;
            // Only want the combined skill number instead of saying X 1 -> X 2, ...
            if (currSkill != prevSkill)
            {
                let prevIndex = i - 1;
                skillOrder += HexaSkillMatrix.#hexaSkillLevelInfoToString(path[prevIndex]);
                currLevels[prevSkill.index] = path[prevIndex].level;
                let currTotalFragments = HexaSkillMatrix.#getTotalFragmentsOfProposedLevels(currLevels);
                skillOrder += " (" + currTotalFragments + ")";
                skillOrder += " -> ";

                prevSkill = currSkill;
            }
        }
        // Add last skill
        let lastIndex = path.length - 1;
        skillOrder += HexaSkillMatrix.#hexaSkillLevelInfoToString(path[lastIndex]);
        currLevels[path[lastIndex].hexaSkillName.index] = path[lastIndex].level;
        let currTotalFragments = HexaSkillMatrix.#getTotalFragmentsOfProposedLevels(currLevels);
        skillOrder += " (" + currTotalFragments + ") ";
        return skillOrder;
    }

    // proposedLevels is a list of int
    static #getFDPercentOfProposedLevels(proposedLevels)
    {
        let totalFDPercent = 0;
        // Do additive types first
        for (let i = 0; i < HexaSkillMatrix.#HexaSkillArray.length; ++i)
        {
            if (HexaSkillMatrix.#HexaSkillArray[i].hexaSkillFDOperationType == HexaSkillFDOperationType.Add)
            {
                totalFDPercent += HexaSkillMatrix.#HexaSkillArray[i].getFDPercentAtLevel(proposedLevels[i]);
            }
        }
        let totalFDMult = fdPercentToMultiplier(totalFDPercent);
        // Now multiplicative
        for (let i = 0; i < HexaSkillMatrix.#HexaSkillArray.length; ++i)
        {
            if (HexaSkillMatrix.#HexaSkillArray[i].hexaSkillFDOperationType == HexaSkillFDOperationType.Mult)
            {
                totalFDMult *= fdPercentToMultiplier(HexaSkillMatrix.#HexaSkillArray[i].getFDPercentAtLevel(proposedLevels[i]));
            }
        }
        return fdMultiplierToPercent(totalFDMult);
    }

    // proposedLevels is a list of int
    static #getTotalFragmentsOfProposedLevels(proposedLevels)
    {
        let totalFragments = 0;
        for (let i = 0; i < HexaSkillMatrix.#HexaSkillArray.length; ++i)
        {
            totalFragments += HexaSkillMatrix.#HexaSkillArray[i].getTotalFragmentCostForLevel(proposedLevels[i]);
        }
        return totalFragments;
    }

    // proposedLevels is a list of int
    static #getTotaFDFragRatioOfProposedLevels(proposedLevels)
    {
        return HexaSkillMatrix.#getFDPercentOfProposedLevels(proposedLevels)
            / HexaSkillMatrix.#getTotalFragmentsOfProposedLevels(proposedLevels);
    }

    // currLevels is a list of HexaSkillLevellingInfo
    static #getTotalCurrentLevel(currLevels)
    {
        let totalLevel = 0;
        for (let i = 0; i < currLevels.length; ++i)
        {
            totalLevel += currLevels[i].currLevel;
        }
        return totalLevel;
    }

    static #populateBoostyPrevOriginal()
    {
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 2));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 3));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 4));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 5));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 6));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 7));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 8));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 9));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 10));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 11));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 12));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 13));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 14));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 15));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 16));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 2));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 17));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 1));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 3));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 18));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 4));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 19));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 2));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 20));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 5));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 21));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 22));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 6));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 23));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 7));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 24));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 25));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 3));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 8));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 26));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 9));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 27));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 28));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 4));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 29));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 1));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 30));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 5));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 1));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 2));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 6));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 10));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 11));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 1));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 12));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 2));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 7));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 13));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 3));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 14));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 15));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 8));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 2));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 3));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 16));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 17));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 4));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 9));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 18));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 10));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 19));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 4));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 3));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 5));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 11));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 5));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 20));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 12));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 4));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 6));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 21));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 22));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 13));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 23));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 6));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 24));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 7));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 5));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 14));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 25));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 26));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 27));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 15));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 7));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 8));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 28));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 6));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 29));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 30));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 16));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 8));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 9));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 17));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 7));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 10));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 9));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 18));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 11));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 8));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 10));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 19));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 20));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 12));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 11));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 9));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 21));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 13));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 22));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 12));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 10));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 23));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 14));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 13));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 11));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 24));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 15));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 25));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 14));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 12));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 26));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 16));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 15));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 13));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 27));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 17));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 28));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 16));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 14));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 29));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 30));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 18));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 17));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 15));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 19));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 20));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 18));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 16));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 21));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 19));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 17));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 20));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 22));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 21));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 18));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 23));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 22));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 24));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 19));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 20));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 23));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 25));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 21));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 24));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 26));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 25));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 22));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 27));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 26));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 28));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 23));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 29));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 30));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 27));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 24));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 28));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 25));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 29));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 30));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 26));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 27));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 28));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 29));
        HexaSkillMatrix.#boostyPrevOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 30));
    }

    static #populateBoostyOverallOriginal()
    {
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 2));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 3));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 4));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 5));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 6));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 7));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 8));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 9));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 10));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 11));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 12));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 13));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 14));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 15));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 16));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 17));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 18));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 1));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 19));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 20));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 21));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 22));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 23));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 2));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 24));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 25));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 26));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 27));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 28));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 29));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 30));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 2));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 3));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 3));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 4));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 4));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 5));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 1));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 1));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 2));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 6));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 3));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 5));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 4));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 1));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 5));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 7));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 6));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 8));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 7));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 2));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 8));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 6));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 9));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 9));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 10));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 1));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 11));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 2));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 12));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 7));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 13));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 3));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 14));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 8));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 15));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 2));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 16));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 3));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 17));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 4));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 18));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 9));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 19));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 10));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 20));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 11));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 10));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 4));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 3));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 12));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 5));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 13));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 11));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 14));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 5));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 12));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 15));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 4));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 6));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 16));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 13));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 17));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 6));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 7));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 18));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 5));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 14));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 19));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 15));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 7));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 8));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 6));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 16));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 8));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 20));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 9));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 21));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 17));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 7));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 22));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 10));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 9));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 23));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 18));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 24));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 11));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 8));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 25));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 10));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 19));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 26));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 20));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 27));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 12));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 11));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 9));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 28));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 21));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 29));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 30));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 13));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 22));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 12));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 10));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 23));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 14));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 13));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 11));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 24));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 15));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 25));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 14));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 12));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 26));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 16));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 15));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 13));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 27));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 17));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 28));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 16));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 14));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 29));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 30));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 18));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 17));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 15));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 19));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 20));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 18));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 16));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 21));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 19));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 17));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 20));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 22));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 21));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 18));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 23));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 22));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 24));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 19));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 20));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 23));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 25));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 21));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 24));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 26));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 25));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 22));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 27));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 26));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 28));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 23));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 29));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 30));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 27));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 24));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 28));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 25));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 29));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 30));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 26));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 27));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 28));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 29));
        HexaSkillMatrix.#boostyOverallOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 30));
    }

    static #populateBoostySingleOriginal()
    {
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 1));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 1));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 2));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 3));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 4));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 5));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 6));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 7));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 8));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 2));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 2));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 1));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 1));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 1));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 3));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 3));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 9));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 4));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 5));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 5));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 5));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 6));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 6));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 7));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 7));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 10));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 8));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 9));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 11));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 10));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 11));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 2));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 12));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 8));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 13));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 12));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 14));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 15));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 13));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 16));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 17));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 9));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 18));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 14));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 3));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 19));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 10));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 15));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 20));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 16));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 21));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 17));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 4));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 18));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 22));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 2));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 19));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 23));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, 20));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 2));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 5));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 24));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 11));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 25));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 2));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 3));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 26));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 6));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 3));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 12));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 27));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 28));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 4));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 13));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 7));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 3));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 29));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 4));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 30));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 14));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 8));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 5));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 4));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 15));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 5));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 9));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 10));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 16));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 6));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 5));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 6));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 17));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 7));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 18));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 6));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 7));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 19));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 20));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 8));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 11));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 7));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 8));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 9));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 12));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 10));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 9));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 8));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 10));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 21));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 13));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 22));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 9));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 10));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 23));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 14));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 24));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 15));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 25));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 11));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 16));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 26));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 11));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 27));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 12));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 17));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 28));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 12));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 18));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 13));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 11));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 29));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 30));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 13));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 19));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 20));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 14));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 12));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 14));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 15));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 13));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 15));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 16));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 14));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 21));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 16));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 17));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 22));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 15));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 23));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 17));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 18));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 16));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 24));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 18));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 19));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 20));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 25));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 17));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 19));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 20));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 26));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 18));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 27));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 19));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 20));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 28));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 21));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 29));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 30));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 22));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 21));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 23));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 22));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 24));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 21));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 23));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 25));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 22));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 24));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 26));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 25));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 23));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 27));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 26));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 24));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 28));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 27));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 25));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 29));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 30));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 28));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 26));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 29));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 30));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 27));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 28));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 29));
        HexaSkillMatrix.#boostySingleOriginalPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 30));
    }

    static #populateBoostyHijack()
    {
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 1));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 2));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 1));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 2));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 3));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 4));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 5));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 6));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 7));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 8));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 9));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 3));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 1));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 4));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 1));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 5));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 6));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 7));
        for (let j = 1; j <= 20; j++)
        {
            HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, j));
        }
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 1));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 8));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 10));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 11));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 12));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 13));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 14));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 15));
        for (let j = 21; j <= 40; j++)
        {
            HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.HexaStat, j));
        }
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 9));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 16));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 1));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 17));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 2));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 18));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 19));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 3));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 4));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 5));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 20));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 21));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 22));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 23));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 24));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 25));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 26));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 10));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 11));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 12));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 13));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 14));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 15));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 27));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 2));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 6));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 28));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 29));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 16));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 7));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 17));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 3));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 2));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 18));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 8));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 19));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 4));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 9));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 3));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 5));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 6));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 7));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 8));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 9));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 10));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 4));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 2));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 5));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 6));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 7));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 8));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 9));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 10));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 20));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 21));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 22));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 23));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 24));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 25));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 26));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 27));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 3));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 28));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 29));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 2));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 10));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 11));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 12));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 13));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 4));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Trinity, 30));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 14));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 5));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 6));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 7));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 8));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 9));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 10));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 3));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 15));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 4));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 11));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 16));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 5));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 6));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 7));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 8));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 9));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 10));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 17));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 12));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 18));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 11));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 13));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 14));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 15));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 16));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 17));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 18));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 19));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 20));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 19));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 20));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 21));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 12));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 22));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 23));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 24));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 25));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 26));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 27));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 28));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 29));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.GF, 30));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 13));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 14));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 15));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 16));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 17));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 18));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 19));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 20));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 21));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 22));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 23));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 24));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 25));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 26));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 27));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 28));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 29));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Mascot, 30));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Seeker, 30));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 11));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 21));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 22));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 23));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 24));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 25));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 26));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 27));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 28));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 29));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Spotlight, 30));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 12));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 13));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 14));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 15));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 16));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 17));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 18));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 19));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 20));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 11));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 12));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 13));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 14));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 15));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 16));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 17));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 18));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 19));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 20));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 21));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 22));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 23));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 24));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 25));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 26));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 27));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 28));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 29));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.SparkleBurst, 30));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 21));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 22));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 23));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 24));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 25));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 26));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 27));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 28));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 29));
        HexaSkillMatrix.#boostyHijackPath.push(new HexaSkillLevelInfo(HexaSkillName.Fusion, 30));
    }
}
