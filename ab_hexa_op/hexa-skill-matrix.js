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
        fdPerBossDmgUnit, fdPerIEDUnit, seekerInputTotal, seekerCurrLevel, daCapoInputTotal, daCapoCurrLevel,
        supernovaInputTotal, supernovaCurrLevel)
    {

        HexaOriginNode.init(fdPerBossDmgUnit, fdPerIEDUnit);
        HexaSkillMatrix.#HexaSkillArray = [];
        HexaSkillMatrix.#HexaSkillArray.push(new HexaOriginNode(HexaSkillName.GF, gfInputTotal, cbInputTotal));

        if (supernovaCurrLevel > 0 || seekerCurrLevel > 0)
        {
            // scale down trinity dmg by the amount that hexa supernova/seeker affects trinity
            baInputTotal -= trinityInputTotal;
            let pureTrinityPercent = HexaTrinity.getTrinityPercentBase(trinityCurrLevel);
            let totalTrinityPercent = pureTrinityPercent + HexaSupernova.getTrinityPercentBoost(supernovaCurrLevel) 
                + HexaSeeker.getTrinityPercentBoost(seekerCurrLevel);
            trinityInputTotal = trinityInputTotal * pureTrinityPercent / totalTrinityPercent;
            baInputTotal += trinityInputTotal;
        }
        HexaSkillMatrix.#HexaSkillArray.push(new HexaTrinity(trinityInputTotal));
        let trinityBaseAmt = HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Trinity.index].calcSkillBaseTotal(trinityCurrLevel);

        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.Spotlight, spotlightInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaMascot(HexaSkillName.Mascot, mascotInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.SparkleBurst, sbInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaBoostNode(HexaSkillName.Fusion, tfInputTotal));
        // Hexa Stat has no base damage
        HexaSkillMatrix.#HexaSkillArray.push(new ConvertedHexaStatToSkill(HexaSkillName.HexaStat, 0));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaSeeker(seekerInputTotal, trinityBaseAmt));

        // Give some default value if da capo is lvl 0, or it would be registered as no damage and have no scaling
        if (daCapoCurrLevel == 0)
        {
            daCapoCurrLevel = 1;
            // Default % of BA taken from https://www.inven.co.kr/board/maple/2298/200951
            // After reversing all skills while ignoring da capo, the total ba would be 287647411221286
            // da capo did 37,186,300,000,000 at max, so scale down by 209/760
            // 37186300000000*209/760 / 287647411221286 = 0.03555127597
            daCapoInputTotal = baInputTotal * 0.03555127597;
            baInputTotal += daCapoInputTotal;
        }
        HexaSkillMatrix.#HexaSkillArray.push(new HexaDaCapo(daCapoInputTotal));
        HexaSkillMatrix.#HexaSkillArray.push(new HexaSupernova(supernovaInputTotal, trinityBaseAmt));

        // Scale down the ba total by reverting the hexa skills back to lvl 0 (1 for origin)
        baInputTotal -= (gfInputTotal + cbInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.GF.index].calcSkillBaseTotal(gfCurrLevel));
        baInputTotal -= (trinityInputTotal - trinityBaseAmt);
        baInputTotal -= (spotlightInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Spotlight.index].calcSkillBaseTotal(spotlightCurrLevel));
        baInputTotal -= (mascotInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Mascot.index].calcSkillBaseTotal(mascotCurrLevel));
        baInputTotal -= (sbInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.SparkleBurst.index].calcSkillBaseTotal(sbCurrLevel));
        baInputTotal -= (tfInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Fusion.index].calcSkillBaseTotal(tfCurrLevel));
        baInputTotal -= (seekerInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Seeker.index].calcSkillBaseTotal(seekerCurrLevel));
        baInputTotal -= (daCapoInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.DaCapo.index].calcSkillBaseTotal(daCapoCurrLevel));
        baInputTotal -= (supernovaInputTotal - HexaSkillMatrix.#HexaSkillArray[HexaSkillName.Supernova.index].calcSkillBaseTotal(supernovaCurrLevel));
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
        let totalMaxLevel = 0;
        let skillIterator = HexaSkillMatrix.#HexaSkillArray.values();
        for (let skill of skillIterator)
        {
            await skill.compute();
            totalMaxLevel += skill.maxLevel;
        }

        let currLevels = HexaSkillLevellingInfo.getNewLevellingArray();
        // Now search for the highest remaining FD:Fragment ratio within the skills
        HexaSkillMatrix.#computePathForMethod(HexaSkillOptimisationMethod.HighestRemainingSkillRatio,
            currLevels, HexaSkillMatrix.#forwardLevellingExitCondition,
            HexaSkillMatrix.#calculateHighestRemainingSkillRatio,
            totalMaxLevel, HexaSkillMatrix.#forwardSkillLevellingAndCheck);

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

            // If hexa supernova or seeker was determined to be the most effective, check if hexa trinity has been levelled
            // if hexa trinity is still 0, then force a level for supernova/seeker passive to have an effect since they affect hexa trinity specifically
            if (skillToLevel == HexaSkillName.Supernova ||  skillToLevel == HexaSkillName.Seeker)
            {
                if (currLevels[HexaSkillName.Trinity.index].currLevel == 0)
                {
                    console.log("Invoking hack");
                    skillToLevel = HexaSkillName.Trinity;
                    newSkillLevel = 1;
                }
            }

            levelSkillAndCheckFunction(currLevels, skillToLevel, newSkillLevel, path);
        }
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

    static #forwardLevellingExitCondition(currLevels, totalMaxLevel)
    {
        return HexaSkillMatrix.#getTotalCurrentLevel(currLevels) < totalMaxLevel;
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

    static getGraphData(method)
    {
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
                let currTotalFragments = formatNumberForPrint(HexaSkillMatrix.#getTotalFragmentsOfProposedLevels(currLevels));
                let currFD = formatNumberForPrint(HexaSkillMatrix.#getFDPercentOfProposedLevels(currLevels));
                skillOrder += " (" + currFD + "%, " + currTotalFragments + ")";
                skillOrder += " -> ";

                prevSkill = currSkill;
            }
        }
        // Add last skill
        let lastIndex = path.length - 1;
        skillOrder += HexaSkillMatrix.#hexaSkillLevelInfoToString(path[lastIndex]);
        currLevels[path[lastIndex].hexaSkillName.index] = path[lastIndex].level;
        let currTotalFragments = formatNumberForPrint(HexaSkillMatrix.#getTotalFragmentsOfProposedLevels(currLevels));
        let currFD = formatNumberForPrint(HexaSkillMatrix.#getFDPercentOfProposedLevels(currLevels));
        skillOrder += " (" + currFD + "%, " + currTotalFragments + ")";
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
}
