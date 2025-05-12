class HexaSeeker extends HexaMasteryNode
{
    static #HexaSeekerMaxLevel = 30;

    static #SeekerBaseScale = 320;
    static #HexaSeekerBaseScale = 342;
    static #HexaSeekerLevelScale = 3;

    #trinityBaseTotalDmg;

    constructor(skillInputTotal, trinityBaseTotal)
    {
        super(HexaSkillName.Seeker, skillInputTotal, HexaSeeker.#HexaSeekerMaxLevel);
        this.#trinityBaseTotalDmg = trinityBaseTotal;
    }

    #getSeekerScalingAtLevel(level)
    {
        if (level == 0)
        {
            return HexaSeeker.#SeekerBaseScale;
        }
        return HexaSeeker.#HexaSeekerBaseScale + HexaSeeker.#HexaSeekerLevelScale * level;
    }

    getSkillMultiplierAtLevel(level)
    {
        if (this.hexaSkillName == HexaSkillName.Seeker)
        {
            return this.#getSeekerScalingAtLevel(level) / this.#getSeekerScalingAtLevel(0);
        }
        throw new TypeError("Unknown mastery node being processed");
    }

    _getScaledUpTotalAtLevel(level)
    {
        let seekerNewTotal = this._skillBaseTotal * this.getSkillMultiplierAtLevel(level);
        // seeker adds a certain% on top of hexa trinity
        let trinityAdditional = this.#trinityBaseTotalDmg * HexaSeeker.getTrinityPercentBoost(level) / HexaTrinity.getTrinityPercentBase(0);
        return seekerNewTotal + trinityAdditional;
    }

    static getTrinityPercentBoost(level)
    {
        if (level == 0)
        {
            return 0;
        }
        return (15 + 3 * level) * HexaTrinity.HexaTrinityNumHits;
    }
}