document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("calculate").addEventListener('click', (e) => {
        let x = document.getElementById("fdPerAttUnit").value;
        console.log(x);

        let attFD = new HexaStatTypeFDPair(HexaStatLineType.Att, document.getElementById("fdPerAttUnit").value);
        let statFD = new HexaStatTypeFDPair(HexaStatLineType.FlatStat, document.getElementById("fdPerFlatStatUnit").value);
        let critDmgFD = new HexaStatTypeFDPair(HexaStatLineType.CritDmg, document.getElementById("fdPerCritDmgUnit").value);
        let bossDmgFD = new HexaStatTypeFDPair(HexaStatLineType.BossDmg, document.getElementById("fdPerBossDmgUnit").value);
        let dmgFD = new HexaStatTypeFDPair(HexaStatLineType.Dmg, document.getElementById("fdPerDmgUnit").value);
        let iedFD = new HexaStatTypeFDPair(HexaStatLineType.IED, document.getElementById("fdPerIEDUnit").value);

        HexaStatMatrix.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);
        // document.getElementById("xx").hidden = true;

        document.getElementById("result").innerHTML = HexaStatMatrix.simulateHexaStatCores();
    });
});
