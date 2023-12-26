document.addEventListener("DOMContentLoaded", function () {
    let counter = 0;

    const calculationTypeKey = "calculationType";
    const simulateKey = "simulate";
    const calculateTheoreticalKey = "calculateTheoretical";
    const needsUnlockInputKey = "needsUnlockInput";

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
            // Do all casting to numbers or javascript would say 5+8+7 = 587
            let currMainLevel = Number(document.getElementById("currentMainLevelInput").value);
            let currAddStat1Level = Number(document.getElementById("currentAddStat1LevelInput").value);
            let currAddStat2Level = Number(document.getElementById("currentAddStat2LevelInput").value);

            if (calculationType == simulateKey) {
                let numTrials = Number(document.getElementById("numTrialsInput").value);
                let needsUnlock = document.getElementById(needsUnlockInputKey).checked;
                let targetNodeLevel = Number(document.getElementById("targetNodeLevelInput").value);
                if (needsUnlock) {
                    currMainLevel = 0;
                    currAddStat1Level = 0;
                    currAddStat2Level = 0;
                }
                responseHTML = HexaStatMatrix.getSimulatedHexaStatNodesStatistics(numTrials, needsUnlock, targetNodeLevel, currMainLevel, currAddStat1Level, currAddStat2Level);
            }
            else if (calculationType == calculateTheoreticalKey) {
                responseHTML = HexaStatMatrix.calculateTheoreticalHexaStatNodeFDs(currMainLevel, currAddStat1Level, currAddStat2Level);
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
        let currentNodeLevelsInputContainer = document.getElementById("currentNodeLevelsInputContainer");

        if (calculationType == simulateKey) {
            simulateInputsContainer.hidden = false;
            currentNodeLevelsInputContainer.hidden = document.getElementById(needsUnlockInputKey).checked;
        }
        else if (calculationType == calculateTheoreticalKey) {
            simulateInputsContainer.hidden = true;
            currentNodeLevelsInputContainer.hidden = false;
        }
    });

    document.getElementById(needsUnlockInputKey).addEventListener('change', (e) => {
        let currentNodeLevelsInputContainer = document.getElementById("currentNodeLevelsInputContainer");
        currentNodeLevelsInputContainer.hidden = document.getElementById(needsUnlockInputKey).checked;
    });
});