class HexaBoostNode extends HexaSkill
{
    static #SpotlightMaxLevel = 30;
    static #MascotMaxLevel = 30;
    static #SparkBurstMaxLevel = 30;
    static #FusionMaxLevel = 30;

    constructor(hexaSkillName, skillInputTotal)
    {
        switch (hexaSkillName)
        {
            case HexaSkillName.Spotlight:
                super(hexaSkillName, skillInputTotal, HexaBoostNode.#SpotlightMaxLevel, HexaSkillFDOperationType.Add);
                break;
            case HexaSkillName.Mascot:
                super(hexaSkillName, skillInputTotal, HexaBoostNode.#MascotMaxLevel, HexaSkillFDOperationType.Add);
                break;
            case HexaSkillName.SparkleBurst:
                super(hexaSkillName, skillInputTotal, HexaBoostNode.#SparkBurstMaxLevel, HexaSkillFDOperationType.Add);
                break;
            case HexaSkillName.Fusion:
                super(hexaSkillName, skillInputTotal, HexaBoostNode.#FusionMaxLevel, HexaSkillFDOperationType.Add);
                break;
            default:
                throw new TypeError("Unknown boost node being processed");
        }
    }

    // Taken from https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#fn-13
    getSkillMultiplierAtLevel(level)
    {
        switch (level)
        {
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

    getFragmentCostAtLevel(level)
    {
        // Taken from https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#s-2.3
        switch (level)
        {
            case 0:
                return 75;
            case 1:
                return 23;
            case 2:
                return 27;
            case 3:
                return 30;
            case 4:
                return 34;
            case 5:
                return 38;
            case 6:
                return 42;
            case 7:
                return 45;
            case 8:
                return 49;
            case 9:
                return 150;

            case 10:
                return 60;
            case 11:
                return 68;
            case 12:
                return 75;
            case 13:
                return 83;
            case 14:
                return 90;
            case 15:
                return 98;
            case 16:
                return 105;
            case 17:
                return 113;
            case 18:
                return 120;
            case 19:
                return 263;

            case 20:
                return 128;
            case 21:
                return 135;
            case 22:
                return 143;
            case 23:
                return 150;
            case 24:
                return 158;
            case 25:
                return 165;
            case 26:
                return 173;
            case 27:
                return 180;
            case 28:
                return 188;
            case 29:
                return 375;

            default:
                throw new RangeError("Getting unknown fragment cost");
        }
    }
}