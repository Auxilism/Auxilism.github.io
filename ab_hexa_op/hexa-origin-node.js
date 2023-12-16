class HexaOriginNode extends HexaSkill {
    // Taken from https://maplestory.fandom.com/wiki/Grand_Finale
    static #SoundWavesBaseValue = 2400;
    static #SoundWavesLevelScale = 80;
    static #CannonRoarsBaseValue = 3600;
    static #CannonRoarsLevelScale = 120;
    static #CheeringBalloonsBaseValue = 500;
    static #CheeringBalloonsLevelScale = 6;

    static #GFMaxLevel = 30;

    static #fdPerBossDmg;
    static #fdPerIED;

    static init(fdPerBossDmg, fdPerIED) {
        HexaOriginNode.#fdPerBossDmg = fdPerBossDmg;
        HexaOriginNode.#fdPerIED = fdPerIED;
    }

    #gfTotal;
    #cbTotal;
    constructor(hexaSkillName, gfTotal, cbTotal) {
        super(hexaSkillName, gfTotal + cbTotal, HexaOriginNode.#GFMaxLevel, HexaSkillFDOperationType.Add);

        this.#gfTotal = gfTotal;
        this.#cbTotal = cbTotal;
    }

    #getSoundWavesScalingAtLevel(level) {
        if (level == 0) {
            return 0;
        }
        return (HexaOriginNode.#SoundWavesBaseValue + HexaOriginNode.#SoundWavesLevelScale * level) * 8 * 3;
    }

    #getCannonRoarsScalingAtLevel(level) {
        if (level == 0) {
            return 0;
        }
        return (HexaOriginNode.#CannonRoarsBaseValue + HexaOriginNode.#CannonRoarsLevelScale * level) * 14 * 7;
    }

    #getGFSkillMultiplierAtLevel(level) {
        let baseScale = this.#getSoundWavesScalingAtLevel(1) + this.#getCannonRoarsScalingAtLevel(1);
        let newScale = this.#getSoundWavesScalingAtLevel(level) + this.#getCannonRoarsScalingAtLevel(level);
        return newScale / baseScale;
    }

    #getCheeringBalloonsScalingAtLevel(level) {
        if (level == 0) {
            return 0;
        }
        return HexaOriginNode.#CheeringBalloonsBaseValue + HexaOriginNode.#CheeringBalloonsLevelScale * level;
    }

    #getCheeringBalloonsSkillMultiplierAtLevel(level) {
        let baseScale = this.#getCheeringBalloonsScalingAtLevel(1);
        let newScale = this.#getCheeringBalloonsScalingAtLevel(level);
        return newScale / baseScale;
    }

    #getAdditionalBossAtLevel(level) {
        if (level == 30) {
            return 20+30;
        }
        else if (level >= 20) {
            return 20;
        }
        return 0;
    }

    #getAdditionalIEDAtLevel(level) {
        if (level == 30) {
            return 20+30;
        }
        else if (level >= 10) {
            return 20;
        }
        return 0;
    }

    #getAdditionalMultiplierAtLevel(level) {
        let additionalBossMult = fdPercentToMultiplier(this.#getAdditionalBossAtLevel(level) * HexaOriginNode.#fdPerBossDmg);
        let additionalIEDMult = fdPercentToMultiplier(this.#getAdditionalIEDAtLevel(level) * HexaOriginNode.#fdPerIED);
        return additionalBossMult * additionalIEDMult;

    }

    _getScaledUpTotalAtLevel(level) {
        let skillRawTotal = this.#gfTotal * this.#getGFSkillMultiplierAtLevel(level) +
            this.#cbTotal * this.#getCheeringBalloonsSkillMultiplierAtLevel(level);
        let additionalMultiplier = this.#getAdditionalMultiplierAtLevel(level);
        return skillRawTotal * additionalMultiplier;
    }

    getFragmentCostAtLevel(level) {
        // Taken from https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#s-2.3
        switch (level) {
            case 0:
                return 0;
            case 1:
                return 30;
            case 2:
                return 35;
            case 3:
                return 40;
            case 4:
                return 45;
            case 5:
                return 50;
            case 6:
                return 55;
            case 7:
                return 60;
            case 8:
                return 65;
            case 9:
                return 200;

            case 10:
                return 80;
            case 11:
                return 90;
            case 12:
                return 100;
            case 13:
                return 110;
            case 14:
                return 120;
            case 15:
                return 130;
            case 16:
                return 140;
            case 17:
                return 150;
            case 18:
                return 160;
            case 19:
                return 350;

            case 20:
                return 170;
            case 21:
                return 180;
            case 22:
                return 190;
            case 23:
                return 200;
            case 24:
                return 210;
            case 25:
                return 220;
            case 26:
                return 230;
            case 27:
                return 240;
            case 28:
                return 250;
            case 29:
                return 500;

            default:
                throw new RangeError("Getting unknown fragment cost");
        }
    }
}