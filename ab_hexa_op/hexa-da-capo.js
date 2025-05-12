class HexaDaCapo extends HexaMasteryNode
{
    static #HexaDaCapoMaxLevel = 30;
    static #HexaDaCapoLevelScale = 19;
    static #HexaDaCapoBase = 190;

    _skillLevel1Total;
    constructor(skillInputTotal)
    {
        super(HexaSkillName.DaCapo, skillInputTotal, HexaDaCapo.#HexaDaCapoMaxLevel);
        this._skillLevel1Total = skillInputTotal;
    }

    // Since da capo does not exist at lvl 0, the skill base is 0
    calcSkillBaseTotal(inputStartingLevel)
    {
        let skillMultiplier = this.getSkillMultiplierAtLevel(inputStartingLevel);
        if (skillMultiplier > 0)
        {
            this._skillLevel1Total = this._skillLevel1Total / this.getSkillMultiplierAtLevel(inputStartingLevel);
            console.log(HexaSkillName.DaCapo, this._skillLevel1Total);
        }
        this._skillBaseTotal = 0;
        return this._skillBaseTotal;
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

    _getScaledUpTotalAtLevel(level)
    {
        return this._skillLevel1Total * this.getSkillMultiplierAtLevel(level);
    }
}