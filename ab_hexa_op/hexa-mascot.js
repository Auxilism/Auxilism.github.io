class HexaMascot extends HexaBoostNode {
    static #MascotMaxLevel = 30;

    static #KeyDownBasePercent = 1540;
    static #ExplodeBasePercent = 1815;

    constructor(hexaSkillName, skillInputTotal) {
        super(hexaSkillName, skillInputTotal, HexaMascot.#MascotMaxLevel, HexaSkillFDOperationType.Add);
    }

    #isBugged = false;

    set isBugged(isBuggedIn) {
        this.#isBugged = isBuggedIn;
        this.compute();
    }

    getSkillMultiplierAtLevel(level) {
        if (this.#isBugged == false) {
            return this.#getSupposedMultiplierAtLevel(level);
        }
        else
        {
            let totalKeyDownBase = HexaMascot.#KeyDownBasePercent * 13 * 5;
            let totalExplodeBase = HexaMascot.#ExplodeBasePercent * 7 * 10;
            // The bug makes the hexa boost only affect the keydown part
            return (totalKeyDownBase * this.#getSupposedMultiplierAtLevel(level) + totalExplodeBase) /
                (totalKeyDownBase + totalExplodeBase);
        }
    }

    // Taken from https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#fn-13
    #getSupposedMultiplierAtLevel(level) {
        switch (level) {
            case 0:
                return 1;
            case 1:
                return 1.11;
            case 2:
                return 1.12;
            case 3:
                return 1.13;
            case 4:
                return 1.14;
            case 5:
                return 1.15;
            case 6:
                return 1.16;
            case 7:
                return 1.17;
            case 8:
                return 1.18;
            case 9:
                return 1.19;

            case 10:
                return 1.25;
            case 11:
                return 1.26;
            case 12:
                return 1.27;
            case 13:
                return 1.28;
            case 14:
                return 1.29;
            case 15:
                return 1.30;
            case 16:
                return 1.31;
            case 17:
                return 1.32;
            case 18:
                return 1.33;
            case 19:
                return 1.34;

            case 20:
                return 1.40;
            case 21:
                return 1.41;
            case 22:
                return 1.42;
            case 23:
                return 1.43;
            case 24:
                return 1.44;
            case 25:
                return 1.45;
            case 26:
                return 1.46;
            case 27:
                return 1.47;
            case 28:
                return 1.48;
            case 29:
                return 1.49;

            case 30:
                return 1.60;

            default:
                throw new RangeError("Getting unknown boost multiplier");
        }
    }
}