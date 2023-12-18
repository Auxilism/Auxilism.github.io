var chartRef = null;

document.addEventListener("DOMContentLoaded", function () {
    let counter = 0;

    document.getElementById("calculate").addEventListener('click', (e) => {
        try {
            counter += 1;

            let baTotal = Number(document.getElementById("baTotal").value);
            let gfTotal = Number(document.getElementById("gfTotal").value);
            let cbTotal = Number(document.getElementById("cbTotal").value);
            let trinityTotal = Number(document.getElementById("trinityTotal").value);

            let spotlightTotal = Number(document.getElementById("spotlightTotal").value);
            let mascotTotal = Number(document.getElementById("mascotTotal").value);
            let sbTotal = Number(document.getElementById("sbTotal").value);
            let tfTotal = Number(document.getElementById("tfTotal").value);

            let fdPerBossDmgUnit = Number(document.getElementById("fdPerBossDmgUnit").value);
            let fdPerIEDUnit = Number(document.getElementById("fdPerIEDUnit").value);

            HexaSkillMatrix.init(baTotal, gfTotal, cbTotal, trinityTotal,
                spotlightTotal, mascotTotal, sbTotal, tfTotal,
                fdPerBossDmgUnit, fdPerIEDUnit);
            HexaSkillMatrix.computeOptimalPaths();

            document.getElementById("result").hidden = false;
            if (chartRef != null) {
                chartRef.destroy()
            }
            chartRef = new Chart("resultsChart", {
            type: "scatter",
            data: {
                datasets: [
                //{
                //    label: "Boosty previous original",
                //    borderColor: "black",
                //    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.BoostyPrevOriginal)
                //},
                {
                    label: "Boosty overall original",
                    borderColor: "black",
                    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.BoostyOverallOriginal)
                },
                {
                    label: "Hijack hexa stat",
                    borderColor: "purple",
                    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.HijackHexaStat)
                },
                {
                    label: "Highest remaining skill ratio",
                    borderColor: "orange",
                    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.HighestRemainingSkillRatio)
                },
                {
                    label: "Boosty single original",
                    borderColor: "red",
                    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.BoostySingleOriginal)
                },
                //{
                //    label: "Next skill ratio",
                //    borderColor: "purple",
                //    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.HighestSkillRatio)
                //},
                //{
                //    label: "Minimum loss in overall ratio",
                //    borderColor: "green",
                //    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.MinRatioLoss)
                //},
                //{
                //    label: "Next overall ratio",
                //    borderColor: "blue",
                //    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.NextOverallRatio)
                //},
                //{
                //    label: "Best remaining overall ratio",
                //    borderColor: "red",
                //    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.BestRemainingOverallRatio)
                //},
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
                            footer: function(context) {
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
                <b><font color='black'>Boosty overall original:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.BoostyOverallOriginal)}
                <br><br>
                <b><font color='purple'>Hijack hexa stat:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.HijackHexaStat)}
                <br><br>
                <b><font color='brown'>Boosty single ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.BoostySingleOriginal)}
                <br><br>
                <b><font color='orange'>Highest remaining skill ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.HighestRemainingSkillRatio)}
                <br><br>
                <b><font color='green'>Minimum loss in overall ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.MinRatioLoss)}
                <br><br>
                <b><font color='blue'>Next overall ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.NextOverallRatio)}
                <br><br>
                <b><font color='red'>Best remaining overall ratio:</font></b> ${HexaSkillMatrix.getSkillOrder(HexaSkillOptimisationMethod.BestRemainingOverallRatio)}
            `;
            document.getElementById("debugCounter").innerHTML = `Response counter: ${counter}`;
        }
        catch (err) {
            alert(err);
            throw err;
        }
    });

    document.getElementById("resetZoom").addEventListener('click', (e) => {
        chartRef.resetZoom();
    });
});