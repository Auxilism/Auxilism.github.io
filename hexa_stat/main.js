document.addEventListener("DOMContentLoaded", function ()
{
    let counter = 0;

    const calculationTypeKey = "calculationType";
    const simulateKey = "simulate";
    const optimiseCurrentKey = "optimiseCurrent";

    document.getElementById("calculate").addEventListener('click', (e) =>
    {
        try
        {
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
            let node1MainLevel = Number(document.getElementById("node1MainLevelInput").value);
            let node1AddStat1Level = Number(document.getElementById("node1AddStat1LevelInput").value);
            let node1AddStat2Level = Number(document.getElementById("node1AddStat2LevelInput").value);

            let node2MainLevel = Number(document.getElementById("node2MainLevelInput").value);
            let node2AddStat1Level = Number(document.getElementById("node2AddStat1LevelInput").value);
            let node2AddStat2Level = Number(document.getElementById("node2AddStat2LevelInput").value);

            let node3MainLevel = Number(document.getElementById("node3MainLevelInput").value);
            let node3AddStat1Level = Number(document.getElementById("node3AddStat1LevelInput").value);
            let node3AddStat2Level = Number(document.getElementById("node3AddStat2LevelInput").value);

            let node4MainLevel = Number(document.getElementById("node4MainLevelInput").value);
            let node4AddStat1Level = Number(document.getElementById("node4AddStat1LevelInput").value);
            let node4AddStat2Level = Number(document.getElementById("node4AddStat2LevelInput").value);

            let node5MainLevel = Number(document.getElementById("node5MainLevelInput").value);
            let node5AddStat1Level = Number(document.getElementById("node5AddStat1LevelInput").value);
            let node5AddStat2Level = Number(document.getElementById("node5AddStat2LevelInput").value);

            let node6MainLevel = Number(document.getElementById("node6MainLevelInput").value);
            let node6AddStat1Level = Number(document.getElementById("node6AddStat1LevelInput").value);
            let node6AddStat2Level = Number(document.getElementById("node6AddStat2LevelInput").value);

            if (calculationType == simulateKey)
            {
                let numTrials = Number(document.getElementById("numTrialsInput").value);
                let targetNodeLevel = Number(document.getElementById("targetNodeLevelInput").value);
                responseHTML = HexaStatMatrix.getSimulatedHexaStatNodeArraysStatistics(numTrials, targetNodeLevel);
            }
            else if (calculationType == optimiseCurrentKey)
            {
                responseHTML = HexaStatMatrix.optimiseCurrentHexaStatNodeArrayFD(node1MainLevel, node1AddStat1Level, node1AddStat2Level,
                    node2MainLevel, node2AddStat1Level, node2AddStat2Level,
                    node3MainLevel, node3AddStat1Level, node3AddStat2Level,
                    node4MainLevel, node4AddStat1Level, node4AddStat2Level,
                    node5MainLevel, node5AddStat1Level, node5AddStat2Level,
                    node6MainLevel, node6AddStat1Level, node6AddStat2Level
                );
            }
            document.getElementById("result").innerHTML = responseHTML;
            document.getElementById("debugCounter").innerHTML = `Response counter: ${calculationType} ${counter}`;
        }
        catch (err)
        {
            alert(err);
            throw err;
        }
    });

    document.getElementById(calculationTypeKey).addEventListener('change', (e) =>
    {
        let calculationType = document.getElementById(calculationTypeKey).value;
        let simulateInputsContainer = document.getElementById("simulateInputsContainer");
        let currentNodeLevelsInputContainer = document.getElementById("currentNodeLevelsInputContainer");

        if (calculationType == simulateKey)
        {
            simulateInputsContainer.hidden = false;
            currentNodeLevelsInputContainer.hidden = true;
        }
        else if (calculationType == optimiseCurrentKey)
        {
            simulateInputsContainer.hidden = true;
            currentNodeLevelsInputContainer.hidden = false;
        }
    });
});