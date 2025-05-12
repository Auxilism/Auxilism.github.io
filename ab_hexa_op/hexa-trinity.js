class HexaTrinity extends HexaMasteryNode
{
    static #HexaTrinityMaxLevel = 30;
    // Considering dco is on
    static #TrinityBaseScale = 641;
    // considering hyper where trinity hits+1 is taken
    static #TrinityNumHits = 7;
    static HexaTrinityNumHits = 8;
    static #HexaTrinityBaseScale = 600;
    static #HexaTrinityLevelScale = 12;

    constructor(skillInputTotal)
    {
        super(HexaSkillName.Trinity, skillInputTotal, HexaTrinity.#HexaTrinityMaxLevel);
    }

    getSkillMultiplierAtLevel(level)
    {
        return HexaTrinity.getTrinityPercentBase(level) / HexaTrinity.getTrinityPercentBase(0);
    }

    static getTrinityPercentBase(level)
    {
        if (level == 0)
        {
            return HexaTrinity.#TrinityBaseScale * HexaTrinity.#TrinityNumHits;
        }
        return (HexaTrinity.#HexaTrinityBaseScale + HexaTrinity.#HexaTrinityLevelScale * level)
         * HexaTrinity.HexaTrinityNumHits;
    }
}