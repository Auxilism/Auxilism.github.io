class HexaUniqueSkill
{
    static fdPerBossDmg;
    static fdPerIED;

    static init(fdPerBossDmgIn, fdPerIEDIn)
    {
        HexaUniqueSkill.fdPerBossDmg = fdPerBossDmgIn;
        HexaUniqueSkill.fdPerIED = fdPerIEDIn;
    }

    static getFragmentCostAtLevel(level)
    {
        // Taken from https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#s-2.3
        switch (level)
        {
            case 0:
                return 100;
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