class HexaSkillName {
    static GF = new HexaSkillName('Grand Finale', 0);
    static Trinity = new HexaSkillName('Trinity', 1);
    static Spotlight = new HexaSkillName('Spotlight', 2);
    static Mascot = new HexaSkillName('Mascot', 3);
    static SparkleBurst = new HexaSkillName('Sparkle Burst', 4);
    static Fusion = new HexaSkillName('Fusion', 5);
    static HexaStat = new HexaSkillName('Hexa Stat', 6)
    
    static Values = [HexaSkillName.GF, HexaSkillName.Trinity, HexaSkillName.Spotlight,
        HexaSkillName.Mascot, HexaSkillName.SparkleBurst, HexaSkillName.Fusion,
        HexaSkillName.HexaStat
    ];

    #name;
    #index;
    constructor(name, index) {
        this.#name = name;
        this.#index = index
    }

    get name() {
        return this.#name;
    }

    get index() {
        return this.#index;
    }
}

class HexaSkillFDOperationType {
    static Mult = new HexaSkillFDOperationType('Mult');
    static Add = new HexaSkillFDOperationType('Add');

    #name;
    constructor(name) {
        this.#name = name;
    }

    get name() {
        return this.#name;
    }
}

class HexaSkill {
    static #BATotal;

    static init(baTotal) {
        HexaSkill.#BATotal = baTotal;
    }

    #hexaSkillName;
    #maxLevel;
    #skillTotal;
    #otherSkillsTotal;
    #hexaSkillFDOperationType;

    _fdPercentArray;
    _totalFragmentCostArray;
    _totalFDFragmentRatioArray;

    constructor(hexaSkillName, skillTotal, maxLevel, hexaSkillFDOperationType) {
        this.#hexaSkillName = hexaSkillName;
        this.#hexaSkillFDOperationType = hexaSkillFDOperationType;
        this.#maxLevel = maxLevel;
        this.#skillTotal = skillTotal;

        this.#otherSkillsTotal = HexaSkill.#BATotal - this.#skillTotal;
    }

    get hexaSkillName() {
        return this.#hexaSkillName;
    }

    get hexaSkillFDOperationType() {
        return this.#hexaSkillFDOperationType;
    }

    get maxLevel() {
        return this.#maxLevel;
    }

    compute() {
        this._fdPercentArray = [];
        this._totalFragmentCostArray = [];
        this._totalFDFragmentRatioArray = [];
        // Computes the whole array to max lvl
        for (let i = 0; i <= this.#maxLevel; ++i)
        {
            let fdPercent = this.#calcFDPercentAtLevel(i);
            let fragCost = this.#calcTotalFragmentCostForLevel(i);
            this._fdPercentArray.push(fdPercent);
            this._totalFragmentCostArray.push(fragCost);

            // Don't divide by 0
            if (fragCost == 0) {
                fragCost = 1;
            }
            this._totalFDFragmentRatioArray.push(fdPercent / fragCost);
        }
    }

    // Should return 1.something, like 1.1 to mean 10% increase from the base skill
    getSkillMultiplierAtLevel(level) {
        throw new TypeError("Unimplemented function HexaSkill.getSkillMultiplierAtLevel called");
    }

    _getScaledUpTotalAtLevel(level) {
        return this.#skillTotal * this.getSkillMultiplierAtLevel(level);
    }

    #calcFDPercentAtLevel(level) {
        let overallMultiplier = (this._getScaledUpTotalAtLevel(level) + this.#otherSkillsTotal) / HexaSkill.#BATotal;
        return fdMultiplierToPercent(overallMultiplier);
    }

    getFDPercentAtLevel(level) {
        return this._fdPercentArray[level];
    }

    #calcTotalFragmentCostForLevel(level) {
        let totalFragments = 0;
        for (let i = 0; i < level; ++i)
        {
            totalFragments += this.getFragmentCostAtLevel(i);
        }
        return totalFragments;
    }

    getTotalFragmentCostForLevel(level) {
        return this._totalFragmentCostArray[level];
    }

    getFragmentCostAtLevel(level) {
        throw new TypeError("Unimplemented function HexaSkill.getFragmentCostAtLevel called");
    }

    getFDFragmentRatioAtLevel(level) {
        return this._totalFDFragmentRatioArray[level];
    }

    getNextHighestFDFragmentRatioIndex(currLevel) {
        // The current level is the current index, so look at the remaining 1 after it
        let remainingArray = this._totalFDFragmentRatioArray.slice(currLevel + 1);
        let offsetOfRemainingMax = indexOfMax(remainingArray);
        return currLevel + offsetOfRemainingMax + 1;
    }

}