class HexaDaCapo extends HexaMasteryNode
{
    static #HexaDaCapoMaxLevel = 30;
    static #HexaDaCapoLevelScale = 15;
    static #HexaDaCapoBase = 125 - HexaDaCapo.#HexaDaCapoLevelScale;

    constructor(skillInputTotal)
    {
        super(HexaSkillName.DaCapo, skillInputTotal, HexaDaCapo.#HexaDaCapoMaxLevel);
    }

    #getDaCapoScalingAtLevel(level)
    {
        if (level == 0)
        {
            return 0;
        }
        return HexaDaCapo.#HexaDaCapoBase + HexaDaCapo.#HexaDaCapoLevelScale * level;
    }

    getSkillMultiplierAtLevel(level)
    {
        return this.#getDaCapoScalingAtLevel(level) / this.#getDaCapoScalingAtLevel(1);
    }
}