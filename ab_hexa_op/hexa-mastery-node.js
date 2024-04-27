class HexaMasteryNode extends HexaSkill {
    constructor(hexaSkillName, skillInputTotal, maxLevel) {
        super(hexaSkillName, skillInputTotal, maxLevel, HexaSkillFDOperationType.Add);
    }

    getFragmentCostAtLevel(level) {
        // Taken from https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#s-2.3
        switch (level) {
            case 0:
                return 50;
            case 1:
                return 15;
            case 2:
                return 18;
            case 3:
                return 20;
            case 4:
                return 23;
            case 5:
                return 25;
            case 6:
                return 28;
            case 7:
                return 30;
            case 8:
                return 33;
            case 9:
                return 100;

            case 10:
                return 40;
            case 11:
                return 45;
            case 12:
                return 50;
            case 13:
                return 55;
            case 14:
                return 60;
            case 15:
                return 65;
            case 16:
                return 70;
            case 17:
                return 75;
            case 18:
                return 80;
            case 19:
                return 175;

            case 20:
                return 85;
            case 21:
                return 90;
            case 22:
                return 95;
            case 23:
                return 100;
            case 24:
                return 105;
            case 25:
                return 110;
            case 26:
                return 115;
            case 27:
                return 120;
            case 28:
                return 125;
            case 29:
                return 250;

            default:
                throw new RangeError("Getting unknown fragment cost");
        }
    }
}