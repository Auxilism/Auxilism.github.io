class ConvertedHexaStatToSkill extends HexaSkill
{
    static #MaxLevel = 120;
    static #NumTrials = 1000;

    static init(numTrials)
    {
        ConvertedHexaStatToSkill.#NumTrials = numTrials;
    }

    constructor(hexaSkillName, skillTotal)
    {
        switch (hexaSkillName)
        {
            case HexaSkillName.HexaStat:
                super(hexaSkillName, skillTotal, ConvertedHexaStatToSkill.#MaxLevel, HexaSkillFDOperationType.Mult);
                break;
            default:
                throw new TypeError("Unknown hexa stat node being processed");
        }
    }

    calcSkillBaseTotal(inputStartingLevel)
    {
        this._skillBaseTotal = 0;
        return this._skillBaseTotal;
    }

    async compute()
    {
        // At level 0 there's no fd or cost, also 0 ratio
        this._fdPercentArray = [0];
        this._totalFragmentCostArray = [0];
        this._totalFDFragmentRatioArray = [0];

        for (let i = 1; i <= ConvertedHexaStatToSkill.#MaxLevel; i++)
        {
            let simulatedHexaStatNodeArrays = HexaStatMatrix.getSimulatedHexaStatNodeArrays(ConvertedHexaStatToSkill.#NumTrials, i);
            await new Promise((resolve) => {
                window.requestAnimationFrame(() => {
                    document.getElementById('progress').innerHTML = `Calculating: ${Math.round(i / ConvertedHexaStatToSkill.#MaxLevel * 100)} complete.`
                    resolve();
                })
            })
            let totalFDFragmentRatio = 0;
            let totalFD = 0;
            let totalFragments = 0;

            // Calculate average for fd, fragments and fd:fragment ratio
            for (let j = 0; j < ConvertedHexaStatToSkill.#NumTrials; j++)
            {
                let hexaStatNodeArray = simulatedHexaStatNodeArrays[j];
                totalFD += hexaStatNodeArray.getTotalFDPercent();
                totalFragments += hexaStatNodeArray.getFragmentsCost();
                totalFDFragmentRatio += hexaStatNodeArray.getFdFragmentRatio();
            }

            this._fdPercentArray.push(totalFD / ConvertedHexaStatToSkill.#NumTrials);
            this._totalFragmentCostArray.push(totalFragments / ConvertedHexaStatToSkill.#NumTrials);
            this._totalFDFragmentRatioArray.push(totalFDFragmentRatio / ConvertedHexaStatToSkill.#NumTrials);
        }
    }
}