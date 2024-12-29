class HexaTrinity extends HexaMasteryNode
{
    static #HexaTrinityMaxLevel = 30;
    // Considering dco is on
    static #TrinityBaseScale = 641;
    static #HexaTrinityBaseScale = 630;
    static #HexaTrinityLevelScale = 13;

    constructor(skillInputTotal)
    {
        super(HexaSkillName.Trinity, skillInputTotal, HexaTrinity.#HexaTrinityMaxLevel);
    }

    getSkillMultiplierAtLevel(level)
    {
        return HexaTrinity.getTrinityPercentBase(level) / HexaTrinity.#TrinityBaseScale;
    }

    static getTrinityPercentBase(level)
    {
        if (level == 0)
        {
            return HexaTrinity.#TrinityBaseScale;
        }
        return HexaTrinity.#HexaTrinityBaseScale + HexaTrinity.#HexaTrinityLevelScale * level;
    }
}