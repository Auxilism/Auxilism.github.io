class HexaSupernova extends HexaMasteryNode
{
    static #HexaSupernovaMaxLevel = 30;
    static #HexaSupernovaLevelScale = 26;
    static #HexaSupernovaBase = 360 - HexaSupernova.#HexaSupernovaLevelScale;

    #trinityBaseTotalDmg;

    constructor(skillInputTotal, trinityBaseTotal)
    {
        super(HexaSkillName.Supernova, skillInputTotal, HexaSupernova.#HexaSupernovaMaxLevel);
        this.#trinityBaseTotalDmg = trinityBaseTotal;
    }

    #getSupernovaScalingAtLevel(level)
    {
        if (level == 0)
        {
            return HexaSupernova.#HexaSupernovaBase;
        }
        return HexaSupernova.#HexaSupernovaBase + HexaSupernova.#HexaSupernovaLevelScale * level;
    }

    getSkillMultiplierAtLevel(level)
    {
        return this.#getSupernovaScalingAtLevel(level) / this.#getSupernovaScalingAtLevel(1);
    }

    _getScaledUpTotalAtLevel(level)
    {
        let supernovaNewTotal = this._skillBaseTotal * this.getSkillMultiplierAtLevel(level);
        // at lvl 1 supernova, it adds 30% on top of trinity's base 630%
        let trinityAdditional = this.#trinityBaseTotalDmg * HexaSupernova.getTrinityPercentBoost(level) / HexaTrinity.getTrinityPercentBase(0);
        return supernovaNewTotal + trinityAdditional;
    }

    static getTrinityPercentBoost(level)
    {
        if (level == 0)
        {
            return 0;
        }
        return 26 + 4 * level;
    }
}