var chartRef = null;

document.addEventListener("DOMContentLoaded", function ()
{
    let counter = 0;

    document.getElementById("calculate").addEventListener('click', (e) =>
    {
        try
        {
            counter += 1;

            let baInputTotal = Number(document.getElementById("baInputTotal").value);
            let gfInputTotal = Number(document.getElementById("gfInputTotal").value);
            let cbInputTotal = Number(document.getElementById("cbInputTotal").value);
            let trinityInputTotal = Number(document.getElementById("trinityInputTotal").value);
            let seekerInputTotal = Number(document.getElementById("seekerInputTotal").value);

            let spotlightInputTotal = Number(document.getElementById("spotlightInputTotal").value);
            let mascotInputTotal = Number(document.getElementById("mascotInputTotal").value);
            let sbInputTotal = Number(document.getElementById("sbInputTotal").value);
            let tfInputTotal = Number(document.getElementById("tfInputTotal").value);

            let gfCurrLevel = Number(document.getElementById("gfCurrLevel").value);
            let trinityCurrLevel = Number(document.getElementById("trinityCurrLevel").value);
            let seekerCurrLevel = Number(document.getElementById("seekerCurrLevel").value);

            let spotlightCurrLevel = Number(document.getElementById("spotlightCurrLevel").value);
            let mascotCurrLevel = Number(document.getElementById("mascotCurrLevel").value);
            let sbCurrLevel = Number(document.getElementById("sbCurrLevel").value);
            let tfCurrLevel = Number(document.getElementById("tfCurrLevel").value);

            let fdPerAttUnit = Number(document.getElementById("fdPerAttUnit").value);
            let fdPerFlatStatUnit = Number(document.getElementById("fdPerFlatStatUnit").value);
            let fdPerCritDmgUnit = Number(document.getElementById("fdPerCritDmgUnit").value);
            let fdPerBossDmgUnit = Number(document.getElementById("fdPerBossDmgUnit").value);
            let fdPerDmgUnit = Number(document.getElementById("fdPerDmgUnit").value);
            let fdPerIEDUnit = Number(document.getElementById("fdPerIEDUnit").value);

            let attFD = new HexaStatTypeFDPair(HexaStatLineType.Att, fdPerAttUnit);
            let statFD = new HexaStatTypeFDPair(HexaStatLineType.FlatStat, fdPerFlatStatUnit);
            let critDmgFD = new HexaStatTypeFDPair(HexaStatLineType.CritDmg, fdPerCritDmgUnit);
            let bossDmgFD = new HexaStatTypeFDPair(HexaStatLineType.BossDmg, fdPerBossDmgUnit);
            let dmgFD = new HexaStatTypeFDPair(HexaStatLineType.Dmg, fdPerDmgUnit);
            let iedFD = new HexaStatTypeFDPair(HexaStatLineType.IED, fdPerIEDUnit);
            HexaStatMatrix.init(attFD, statFD, critDmgFD, bossDmgFD, dmgFD, iedFD);
            let numTrials = Number(document.getElementById("numTrialsInput").value);
            ConvertedHexaStatToSkill.init(numTrials);

            HexaSkillMatrix.init(baInputTotal, gfInputTotal, cbInputTotal, gfCurrLevel,
                trinityInputTotal, trinityCurrLevel, spotlightInputTotal, spotlightCurrLevel,
                mascotInputTotal, mascotCurrLevel, sbInputTotal, sbCurrLevel, tfInputTotal, tfCurrLevel,
                fdPerBossDmgUnit, fdPerIEDUnit, seekerInputTotal, seekerCurrLevel);
            HexaSkillMatrix.computeOptimalPaths();

            document.getElementById("result").hidden = false;
            if (chartRef != null)
            {
                chartRef.destroy()
            }
            chartRef = new Chart("resultsChart", {
                type: "scatter",
                data: {
                    datasets: [
                        {
                            label: "Highest remaining skill ratio",
                            borderColor: "orange",
                            data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.HighestRemainingSkillRatio)
                        },
                        {
                            label: "KMS hijack",
                            borderColor: "purple",
                            data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.BoostyHijack)
                        },
                        // {
                        //     label: "Mascot no bug",
                        //     borderColor: "black",
                        //     data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.BoostySingleOriginal)
                        // },
                        // {
                        //     label: "Minimum loss in overall ratio",
                        //     borderColor: "green",
                        //     data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.MinRatioLoss)
                        // },
                        // {
                        //     label: "Next overall ratio",
                        //     borderColor: "blue",
                        //     data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.NextOverallRatio)
                        // },
                        // {
                        //     label: "Best remaining overall ratio",
                        //     borderColor: "red",
                        //     data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.BestRemainingOverallRatio)
                        // },
                    ]
                },
                options: {
                    showLine: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Fragments"
                            }
                        },
                        y: {
                            min: 0,
                            title: {
                                display: true,
                                text: "FD%"
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                footer: function (context)
                                {
                                    return "";
                                }
                            }
                        },
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'xy',
                            },
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'xy',
                            }
                        }
                    }
                }
            });

            document.getElementById("resultPaths").innerHTML = `
                <b><font color='orange'>Highest remaining skill ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.HighestRemainingSkillRatio)}
                <br><br>
                <b><font color='purple'>KMS hijack:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.BoostyHijack)}
            `;
            document.getElementById("debugCounter").innerHTML = `Response counter: ${counter}`;
        }
        // <br><br>
        // <b><font color='black'>Mascot no bug:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.BoostySingleOriginal)}
        // <br><br>
        // <b><font color='green'>Minimum loss in overall ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.MinRatioLoss)}
        // <br><br>
        // <b><font color='blue'>Next overall ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.NextOverallRatio)}
        // <br><br>
        // <b><font color='red'>Best remaining overall ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.BestRemainingOverallRatio)}
        catch (err)
        {
            alert(err);
            throw err;
        }
    });

    document.getElementById("resetZoom").addEventListener('click', (e) =>
    {
        chartRef.resetZoom();
    });
});