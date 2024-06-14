class HexaOriginNode extends HexaSkill {
    // Taken from https://en.namu.wiki/w/%EC%97%94%EC%A0%A4%EB%A6%AD%EB%B2%84%EC%8A%A4%ED%84%B0/%EC%8A%A4%ED%82%AC
    static #SoundWavesBaseValue = 334;
    static #SoundWavesLevelScale = 12;
    static #CannonRoarsBaseValue = 343;
    static #CannonRoarsLevelScale = 12;
    static #InitialCheeringBalloonsBaseValue = 340;
    static #InitialCheeringBalloonsLevelScale = 5;
    static #PostCheeringBalloonsBaseValue = 433; // Post the initial GF burst
    static #PostCheeringBalloonsLevelScale = 8; // #1 hit of a balloon will do this much
    static #PostCheeringBalloonsConsecutiveHitScale = 1 - 0.43; // #2 to #7 hit suffer 43% FD reduction
    static #ExaltBalloonsScale = 1 - 0.45;

    static #FinaleCheeringBalloonsHits = (25+10)*7; // 10 extra from exalt, all hitting their max of 7 times

    static #NonExaltCheeringBalloonsAvgHits = 6.03325407812;
    // Where 6.03... is 0.05+0.05*0.95*2+0.05*0.95^2*3+0.05*0.95^3*4+0.05*0.95^4*5+0.05*0.95^5*6+0.95^6*7,
    // 5% chance of a balloon hitting once, 95%*5% chance of a balloon hitting twice, etc

    // Fill in how many remaining balloon hits are exalted and non-exalted from BA data:
    // Stopped hitting after exalt ran out, continue to let balloons pop
    static #ExaltCheeringBalloonsHits = 1186 - HexaOriginNode.#FinaleCheeringBalloonsHits;
    // This was the total number of balloon hits, subtract when hitting stopped after exalt
    static #NonExaltCheeringBalloonsHits = 1561 - HexaOriginNode.#ExaltCheeringBalloonsHits - HexaOriginNode.#FinaleCheeringBalloonsHits;

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
        console.log("gfBase", this.#gfBaseTotal);
        console.log("cbBase", this.#cbBaseTotal);
        return this._skillBaseTotal;
    }

    #getSoundWavesScalingAtLevel(level) {
        if (level == 0) {
            return 0;
        }
        return (HexaOriginNode.#SoundWavesBaseValue + HexaOriginNode.#SoundWavesLevelScale * level) * 9 * 12;
    }

    #getCannonRoarsScalingAtLevel(level) {
        if (level == 0) {
            return 0;
        }
        return (HexaOriginNode.#CannonRoarsBaseValue + HexaOriginNode.#CannonRoarsLevelScale * level) * 14 * 38;
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

        let postBalloonsFullScale = HexaOriginNode.#PostCheeringBalloonsBaseValue + HexaOriginNode.#PostCheeringBalloonsLevelScale * level;
        // #1 hit does 100%, #2 to #7 do reduced. Add all together then get average
        let postBalloonsExaltedAvgScale = (postBalloonsFullScale + postBalloonsFullScale * HexaOriginNode.#PostCheeringBalloonsConsecutiveHitScale * 6) / 7;
        let postExaltBalloonsTotal = HexaOriginNode.#ExaltCheeringBalloonsHits * postBalloonsExaltedAvgScale * HexaOriginNode.#ExaltBalloonsScale;
        // #1 hit does 100%, other hits do reduced. Expected hits now is based on the recrecation chance. 
        // If total expected hits is 6, add 5 units of reduced then divide by 6 to get the average scale
        let postBalloonsNonExaltedAvgScale = (postBalloonsFullScale +
            postBalloonsFullScale * HexaOriginNode.#PostCheeringBalloonsConsecutiveHitScale * (HexaOriginNode.#NonExaltCheeringBalloonsAvgHits - 1)) 
            / HexaOriginNode.#NonExaltCheeringBalloonsAvgHits;
        let postNonExaltBalloonsTotal = HexaOriginNode.#NonExaltCheeringBalloonsHits * postBalloonsNonExaltedAvgScale;
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