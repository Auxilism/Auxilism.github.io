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
        //4th job does 600% x 3 lines x 14, hexa does 360% x 4 lines x 18
        if (level == 0)
        {
            return 600 * 3 * 14;
        }
        let lineAmt = 4 * 18;
        let skillMult = HexaSupernova.#HexaSupernovaBase + HexaSupernova.#HexaSupernovaLevelScale * level;
        return lineAmt * skillMult;
    }

    getSkillMultiplierAtLevel(level)
    {
        return this.#getSupernovaScalingAtLevel(level) / this.#getSupernovaScalingAtLevel(0);
    }

    _getScaledUpTotalAtLevel(level)
    {
        let supernovaNewTotal = this._skillBaseTotal * this.getSkillMultiplierAtLevel(level);
        // supernova adds a certain% on top of hexa trinity
        let trinityAdditional = this.#trinityBaseTotalDmg * HexaSupernova.getTrinityPercentBoost(level) / HexaTrinity.getTrinityPercentBase(0);
        return supernovaNewTotal + trinityAdditional;
    }

    static getTrinityPercentBoost(level)
    {
        if (level == 0)
        {
            return 0;
        }
        return (20 + 4 * level) * HexaTrinity.HexaTrinityNumHits;
    }
}