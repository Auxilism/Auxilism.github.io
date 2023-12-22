class ConvertedHexaStatToSkill extends HexaSkill {
    static #MaxLevel = 20;

    constructor(hexaSkillName, skillTotal) {
        switch (hexaSkillName) {
            case HexaSkillName.HexaStat:
                super(hexaSkillName, skillTotal, ConvertedHexaStatToSkill.#MaxLevel, HexaSkillFDOperationType.Mult);
                break;
            default:
                throw new TypeError("Unknown hexa stat node being processed");
        }
    }

    calcSkillBaseTotal(inputStartingLevel) {
        this._skillBaseTotal = 0;
        return this._skillBaseTotal;
    }

    compute() {
        this._fdPercentArray = [];
        this._totalFragmentCostArray = [];
        this._totalFDFragmentRatioArray = [];

        // For now hardcode from a dataset generated with the hexa stat calculator
        this._fdPercentArray = [
            0,
            0.14900714,
            0.29193836,
            0.43257175,
            0.57245996,
            0.71299405,
            0.85270498,
            0.99287697,
            1.13652382,
            1.28011262,
            1.42705262,
            1.57811686,
            1.7291376,
            1.88310587,
            2.04212,
            2.1987541,
            2.36014906,
            2.52469671,
            2.68972489,
            2.84765171,
            3.01274591,
        ];
        this._totalFragmentCostArray = [
            0,
            20,
            30,
            40,
            50.462,
            61.672,
            74.162,
            87.614,
            102.049,
            117.98,
            134.859,
            152.462,
            169.947,
            188.613,
            208.313,
            227.155,
            247.26,
            267.701,
            289.336,
            309.659,
            331.477,
        ];
        this._totalFDFragmentRatioArray = [
            0,
            0.00745036,
            0.00973134,
            0.01081566,
            0.01136581,
            0.01161016,
            0.01162620,
            0.01150097,
            0.01133395,
            0.01108814,
            0.01085029,
            0.01063318,
            0.01040954,
            0.01024713,
            0.01005205,
            0.00987742,
            0.00972291,
            0.00961507,
            0.00949220,
            0.00923833,
            0.00934531,
        ];
    }
}