class HexaAscentNode extends HexaSkill
{
    static #HexaAscentNodeMaxLevel = 30;
    static #HeartDrawingBaseValue = 1015;
    static #HeartDrawingLevelScale = 203;
    static #PhotoBaseValue = 990;
    static #PhotoLevelScale = 198;

    _skillLevel1Total;
    constructor(skillInputTotal)
    {
        super(HexaSkillName.Ascent, skillInputTotal, HexaAscentNode.#HexaAscentNodeMaxLevel, HexaSkillFDOperationType.Add);
        this._skillLevel1Total = skillInputTotal;
    }

    // Since ascent does not exist at lvl 0, the skill base is 0
    calcSkillBaseTotal(inputStartingLevel)
    {
        let skillMultiplier = this.getSkillMultiplierAtLevel(inputStartingLevel);
        if (skillMultiplier > 0)
        {
            this._skillLevel1Total = this._skillLevel1Total / this.getSkillMultiplierAtLevel(inputStartingLevel);
            console.log(HexaSkillName.Ascent, this._skillLevel1Total);
        }
        this._skillBaseTotal = 0;
        return this._skillBaseTotal;
    }

    #getHeartDrawingScalingAtLevel(level)
    {
        if (level == 0)
        {
            return 0;
        }
        return (HexaAscentNode.#HeartDrawingBaseValue + HexaAscentNode.#HeartDrawingLevelScale * level) * 13 * 12;
    }

     #getPhotoScalingAtLevel(level)
    {
        if (level == 0)
        {
            return 0;
        }
        return (HexaAscentNode.#PhotoBaseValue + HexaAscentNode.#PhotoLevelScale * level) * 13 * 11;
    }

    #getAscentSkillMultiplierAtLevel(level)
    {
        let baseScale = this.#getHeartDrawingScalingAtLevel(1) + this.#getPhotoScalingAtLevel(1);
        let newScale = this.#getHeartDrawingScalingAtLevel(level) + this.#getPhotoScalingAtLevel(level);
        return newScale / baseScale;
    }

    getSkillMultiplierAtLevel(level)
    {
        return this.#getAscentSkillMultiplierAtLevel(level) / this.#getAscentSkillMultiplierAtLevel(1);
    }

    #getAdditionalBossAtLevel(level)
    {
        if (level >= 20)
        {
            return 10 + 10 ;
        }
        else if (level >= 10)
        {
            return 10;
        }
        return 0;
    }

    #getAdditionalIEDAtLevel(level)
    {
        if (level == 30)
        {
            return 20 + 10 + 10;
        }
        else if (level >= 20)
        {
            return 10 + 10;
        }
        else if (level >= 10)
        {
            return 10;
        }
        return 0;
    }

    #getAdditionalMultiplierAtLevel(level)
    {
        let additionalBossMult = fdPercentToMultiplier(this.#getAdditionalBossAtLevel(level) 
        // Ascent ignores boss% from buffs. Comparing scouter shows the fd% from input boss is about twice of the scouter stat efficiency.
                                * HexaUniqueSkill.fdPerBossDmg * 2);
        let additionalIEDMult = fdPercentToMultiplier(this.#getAdditionalIEDAtLevel(level) * HexaUniqueSkill.fdPerIED);
        return additionalBossMult * additionalIEDMult;
    }

    _getScaledUpTotalAtLevel(level)
    {
        let additionalMultiplier = this.#getAdditionalMultiplierAtLevel(level);
        return this._skillLevel1Total * this.getSkillMultiplierAtLevel(level) * additionalMultiplier;
    }

    getFragmentCostAtLevel(level)
    {
       return HexaUniqueSkill.getFragmentCostAtLevel(level);
    }
}