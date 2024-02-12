class HexaOriginNode extends HexaSkill {
    // Taken from https://orangemushroom.net/2023/11/23/kms-ver-1-2-384-angelic-busters-comeback/
    static #SoundWavesBaseValue = 2400; // TODO: get this value
    static #SoundWavesLevelScale = 80; // TODO: get this value
    static #CannonRoarsBaseValue = 3600; // TODO: get this value
    static #CannonRoarsLevelScale = 120; // TODO: get this value
    static #InitialCheeringBalloonsBaseValue = 500; // TODO: get this value
    static #InitialCheeringBalloonsLevelScale = 6; // TODO: get this value
    static #PostCheeringBalloonsBaseValue = 395; // TODO: get this value
    static #PostCheeringBalloonsLevelScale = 6; // TODO: get this value
    static #ExaltBalloonsScale = 1 - 0.45;

    static #TotalCheeringBalloonsHits = 1000; // TODO: get this value
    static #FinaleCheeringBalloonsHits = (25+10)*7; // 10 extra from exalt, all hitting their max of 7 times

    // After grand finale animation,
    // Assume 10s remaining of exalt, 20s without exalt for total of 30s of cheering balloons
    // Exalt units: 10*7*2, for twice as many seekers spawned
    // Non-exalt units: 20*6.03325407812
    // Where 6.03... is 0.05+0.05*0.95*2+0.05*0.95^2*3+0.05*0.95^3*4+0.05*0.95^4*5+0.05*0.95^5*6+0.95^6*7,
    // 5% chance of a balloon hitting once, 95%*5% chance of a balloon hitting twice, etc
    static #ExaltCheeringBalloonsHitUnits = 10*7*2;
    static #NonExaltCheeringBalloonsHitUnits = 20*6.03325407812;

    // To calculate how many remaining balloon hits are exalted and non-exalted:
    // Compute the scale according to the units, and apply after subtracting the initial 35 balloon hits
    static #ExaltCheeringBalloonsHits = (HexaOriginNode.#TotalCheeringBalloonsHits - HexaOriginNode.#FinaleCheeringBalloonsHits) *
    HexaOriginNode.#ExaltCheeringBalloonsHitUnits / (HexaOriginNode.#ExaltCheeringBalloonsHitUnits + HexaOriginNode.#NonExaltCheeringBalloonsHitUnits);
    static #NonExaltCheeringBalloonsHits = HexaOriginNode.#TotalCheeringBalloonsHits - HexaOriginNode.#FinaleCheeringBalloonsHits - HexaOriginNode.#ExaltCheeringBalloonsHits;

    static #GFMaxLevel = 30;

    static #fdPerBossDmg;
    static #fdPerIED;

    static init(fdPerBossDmg, fdPerIED) {
        HexaOriginNode.#fdPerBossDmg = fdPerBossDmg;
        HexaOriginNode.#fdPerIED = fdPerIED;
    }

    #gfInputTotal;
    #gfBaseTotal;
    #cbInputTotal;
    #cbBaseTotal;

    constructor(hexaSkillName, gfInputTotal, cbInputTotal) {
        super(hexaSkillName, gfInputTotal + cbInputTotal, HexaOriginNode.#GFMaxLevel, HexaSkillFDOperationType.Add);

        this.#gfInputTotal = gfInputTotal;
        this.#cbInputTotal = cbInputTotal;
    }

    calcSkillBaseTotal(inputStartingLevel) {
        // First revert the additional ied/boss multiplier
        let additionalMultiplier = this.#getAdditionalMultiplierAtLevel(inputStartingLevel);
        let gfInputNoAdditional = this.#gfInputTotal / additionalMultiplier;
        let cbInputNoAdditional = this.#cbInputTotal / additionalMultiplier;

        // Then revert the skill % multipliers
        this.#gfBaseTotal = gfInputNoAdditional / this.#getGFSkillMultiplierAtLevel(inputStartingLevel);
        this.#cbBaseTotal = cbInputNoAdditional / this.#getCheeringBalloonsSkillMultiplierAtLevel(inputStartingLevel);
        this._skillBaseTotal = this.#gfBaseTotal + this.#cbBaseTotal;
        return this._skillBaseTotal;
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
        let initialBalloonsScale = HexaOriginNode.#InitialCheeringBalloonsBaseValue + HexaOriginNode.#InitialCheeringBalloonsLevelScale * level;
        let initialBalloonsTotal = HexaOriginNode.#FinaleCheeringBalloonsHits * initialBalloonsScale;

        let postBalloonsScale = HexaOriginNode.#PostCheeringBalloonsBaseValue + HexaOriginNode.#PostCheeringBalloonsLevelScale * level;
        let postExaltBalloonsTotal = HexaOriginNode.#ExaltCheeringBalloonsHits * postBalloonsScale * HexaOriginNode.#ExaltBalloonsScale;
        let postNonExaltBalloonsTotal = HexaOriginNode.#NonExaltCheeringBalloonsHits * postBalloonsScale;
        return initialBalloonsTotal + postExaltBalloonsTotal + postNonExaltBalloonsTotal;
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
        let skillRawTotal = this.#gfBaseTotal * this.#getGFSkillMultiplierAtLevel(level) +
            this.#cbBaseTotal * this.#getCheeringBalloonsSkillMultiplierAtLevel(level);
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