class HexaSkillName
{
    static GF = new HexaSkillName('Grand Finale', 0);
    static Trinity = new HexaSkillName('Trinity', 1);
    static Spotlight = new HexaSkillName('Spotlight', 2);
    static Mascot = new HexaSkillName('Mascot', 3);
    static SparkleBurst = new HexaSkillName('Sparkle Burst', 4);
    static Fusion = new HexaSkillName('Fusion', 5);
    static HexaStat = new HexaSkillName('Hexa Stat', 6)
    static Seeker = new HexaSkillName('Seeker', 7)

    static Values = [HexaSkillName.GF, HexaSkillName.Trinity, HexaSkillName.Spotlight,
    HexaSkillName.Mascot, HexaSkillName.SparkleBurst, HexaSkillName.Fusion,
    HexaSkillName.HexaStat, HexaSkillName.Seeker
    ];

    #name;
    #index;
    constructor(name, index)
    {
        this.#name = name;
        this.#index = index
    }

    get name()
    {
        return this.#name;
    }

    get index()
    {
        return this.#index;
    }
}

class HexaSkillFDOperationType
{
    static Mult = new HexaSkillFDOperationType('Mult');
    static Add = new HexaSkillFDOperationType('Add');

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

class HexaSkill
{
    static #BABaseTotal;

    static init(baBaseTotal)
    {
        HexaSkill.#BABaseTotal = baBaseTotal;
        console.log("Init total", baBaseTotal);
    }

    #hexaSkillName;
    #maxLevel;
    #skillInputTotal;
    _skillBaseTotal;
    #otherSkillsBaseTotal;
    #hexaSkillFDOperationType;

    _fdPercentArray;
    _totalFragmentCostArray;
    _totalFDFragmentRatioArray;
    #currRemainingFdFragmentRatioArray = [];

    constructor(hexaSkillName, skillInputTotal, maxLevel, hexaSkillFDOperationType)
    {
        this.#hexaSkillName = hexaSkillName;
        this.#skillInputTotal = skillInputTotal;
        this.#maxLevel = maxLevel;
        this.#hexaSkillFDOperationType = hexaSkillFDOperationType;
    }

    get hexaSkillName()
    {
        return this.#hexaSkillName;
    }

    get hexaSkillFDOperationType()
    {
        return this.#hexaSkillFDOperationType;
    }

    get maxLevel()
    {
        return this.#maxLevel;
    }

    calcSkillBaseTotal(inputStartingLevel)
    {
        this._skillBaseTotal = this.#skillInputTotal / this.getSkillMultiplierAtLevel(inputStartingLevel);
        console.log(this.#hexaSkillName, this._skillBaseTotal);
        return this._skillBaseTotal;
    }

    compute()
    {
        this.#otherSkillsBaseTotal = HexaSkill.#BABaseTotal - this._skillBaseTotal;

        this._fdPercentArray = [];
        this._totalFragmentCostArray = [];
        this._totalFDFragmentRatioArray = [];
        this.#currRemainingFdFragmentRatioArray = [];
        // Computes the whole array to max lvl
        for (let i = 0; i <= this.#maxLevel; ++i)
        {
            let fdPercent = this.#calcFDPercentAtLevel(i);
            let fragCost = this.#calcTotalFragmentCostForLevel(i);
            this._fdPercentArray.push(fdPercent);
            this._totalFragmentCostArray.push(fragCost);

            // Don't divide by 0
            if (fragCost == 0)
            {
                fragCost = 1;
            }
            this._totalFDFragmentRatioArray.push(fdPercent / fragCost);
            this.#currRemainingFdFragmentRatioArray.push(fdPercent / fragCost);
        }
    }

    // Should return 1.something, like 1.1 to mean 10% increase from the base skill
    getSkillMultiplierAtLevel(level)
    {
        throw new TypeError("Unimplemented function HexaSkill.getSkillMultiplierAtLevel called");
    }

    _getScaledUpTotalAtLevel(level)
    {
        return this._skillBaseTotal * this.getSkillMultiplierAtLevel(level);
    }

    #calcFDPercentAtLevel(level)
    {
        let overallMultiplier = (this._getScaledUpTotalAtLevel(level) + this.#otherSkillsBaseTotal) / HexaSkill.#BABaseTotal;
        return fdMultiplierToPercent(overallMultiplier);
    }

    getFDPercentAtLevel(level)
    {
        if (level > this.#maxLevel)
        {
            throw new RangeError("Getting " + level, "expected max", this.maxLevel)
        }
        return this._fdPercentArray[level];
    }

    #calcTotalFragmentCostForLevel(level)
    {
        let totalFragments = 0;
        for (let i = 0; i < level; ++i)
        {
            totalFragments += this.getFragmentCostAtLevel(i);
        }
        return totalFragments;
    }

    getTotalFragmentCostForLevel(level)
    {
        return this._totalFragmentCostArray[level];
    }

    getFragmentCostAtLevel(level)
    {
        throw new TypeError("Unimplemented function HexaSkill.getFragmentCostAtLevel called");
    }

    getFDFragmentRatioAtLevel(targetLevel, currLevel, currFDPercent)
    {
        if (targetLevel > this.#maxLevel)
        {
            throw new RangeError("Going above max hexa skill level in HexaSkill.getFDFragmentRatioAtLevel");
        }
        // If this hexa skill's max is 20, the ratio of 'lvl 21' should be the same as 20
        if (targetLevel > this.#maxLevel)
        {
            targetLevel = this.#maxLevel;
        }
        if (targetLevel == currLevel)
        {
            return 0;
        }

        let remainingFdFragmentRatio = (this._fdPercentArray[targetLevel] - this._fdPercentArray[currLevel])
            / (this._totalFragmentCostArray[targetLevel] - this._totalFragmentCostArray[currLevel]);

        switch (this.#hexaSkillFDOperationType)
        {
            case HexaSkillFDOperationType.Add:
                return remainingFdFragmentRatio;
            case HexaSkillFDOperationType.Mult:
                let scaledRatio = remainingFdFragmentRatio * fdPercentToMultiplier(currFDPercent);
                return scaledRatio;
            default:
                throw new TypeError("Unknown operation type in HexaSkill.getFDFragmentRatioAtLevel");
        }
    }

    getNextHighestFDFragmentRatioIndex(currLevel)
    {
        // Recompute the ratio array from currLevel onwards, using currLevel as the reference point
        for (let i = currLevel + 1; i <= this.maxLevel; i++)
        {
            this.#currRemainingFdFragmentRatioArray[i] = (this._fdPercentArray[i] - this._fdPercentArray[currLevel])
                / (this._totalFragmentCostArray[i] - this._totalFragmentCostArray[currLevel]);
        }
        // The current level is the current index, so look at the remaining 1 after it
        let remainingArray = this.#currRemainingFdFragmentRatioArray.slice(currLevel + 1);
        let offsetOfRemainingMax = indexOfMax(remainingArray);
        return currLevel + offsetOfRemainingMax + 1;
    }

}