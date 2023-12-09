document.addEventListener("DOMContentLoaded", function () {
    let counter = 0;

    const calculationTypeKey = "calculationType";
    const simulateKey = "simulate";
    const optimiseGivenKey = "optimiseGiven";

    document.getElementById("calculate").addEventListener('click', (e) => {
        try {
            counter += 1;

            let attFD = new HexaStatTypeFDPair(HexaStatLineType.Att, Number(document.getElementById("fdPerAttUnit").value));
            let statFD = new HexaStatTypeFDPair(HexaStatLineType.FlatStat, Number(document.getElementById("fdPerFlatStatUnit").value));
            let critDmgFD = new HexaStatTypeFDPair(HexaStatLineType.CritDmg, Number(document.getElementById("fdPerCritDmgUnit").value));
            let bossDmgFD = new HexaStatTypeFDPair(HexaStatLineType.BossDmg, Number(document.getElementById("fdPerBossDmgUnit").value));
            let dmgFD = new HexaStatTypeFDPair(HexaStatLineType.Dmg, Number(document.getElementById("fdPerDmgUnit").value));
            let iedFD = new HexaStatTypeFDPair(HexaStatLineType.IED, Number(document.getElementById("fdPerIEDUnit").value));

            let calculationType = document.getElementById(calculationTypeKey).value;

            HexaStatMatrix.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);

            let responseHTML = "";
            if (calculationType == simulateKey) {
                let numTrials = Number(document.getElementById("numTrials").value);
                responseHTML = HexaStatMatrix.simulateHexaStatNodes(numTrials);
            }
            else if (calculationType == optimiseGivenKey) {
                // Do all casting to numbers or javascript would say 5+8+7 = 587
                let mainLevel = Number(document.getElementById("mainLvlOptimiseGiven").value);
                let addStat1Level = Number(document.getElementById("addStat1LvlOptimiseGiven").value);
                let addStat2Level = Number(document.getElementById("addStat2LvlOptimiseGiven").value);
                responseHTML = HexaStatMatrix.optimiseGivenHexaStatNode(mainLevel, addStat1Level, addStat2Level);
            }
            document.getElementById("result").innerHTML = responseHTML;
            document.getElementById("debugCounter").innerHTML = `Response counter: ${calculationType} ${counter}`;
        }
        catch (err) {
            alert(err);
            throw err;
        }
    });

    document.getElementById(calculationTypeKey).addEventListener('change', (e) => {
        let calculationType = document.getElementById(calculationTypeKey).value;
        let simulateInputsContainer = document.getElementById("simulateInputsContainer");
        let optimiseGivenInputsContainer = document.getElementById("optimiseGivenInputsContainer");

        if (calculationType == simulateKey) {
            simulateInputsContainer.hidden = false;
            optimiseGivenInputsContainer.hidden = true;
        }
        else if (calculationType == optimiseGivenKey) {
            optimiseGivenInputsContainer.hidden = false;
            simulateInputsContainer.hidden = true;
        }
    });
});