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

            const xyValues = [
                {x:50, y:7},
                {x:65, y:8},
                {x:70, y:8},
                {x:80, y:9},
                {x:90, y:9},
                {x:100, y:9},
                {x:110, y:10},
                {x:120, y:11},
                {x:130, y:14},
                {x:140, y:14},
                {x:150, y:15}
              ];
            var xyValues2 = [
                {x:50, y:8},
                {x:65, y:8},
                {x:70, y:8},
                {x:80, y:9},
                {x:90, y:9},
                {x:100, y:9},
                {x:110, y:10},
                {x:120, y:11},
                {x:130, y:14},
                {x:140, y:14},
                {x:150, y:15}
              ];

            if (chartRef != null) {
                chartRef.destroy()
            }
            chartRef = new Chart("resultsChart", {
            type: "scatter",
            data: {
                datasets: [
                //{
                //    label: "Best remaining ratio",
                //    borderColor: "red",
                //    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.RemainingBestRatio)
                //},
                //{
                //    label: "Next ratio",
                //    borderColor: "blue",
                //    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.NextRatio)
                //},
                //{
                //    label: "Minimum loss in ratio",
                //    borderColor: "green",
                //    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.MinRatioLoss)
                //},
                {
                    label: "red line",
                    borderColor: "red",
                    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.BobOriginal)
                },
                {
                    label: "blue line",
                    borderColor: "blue",
                    data: HexaSkillMatrix.getGraphData(HexaSkillOptimisationMethod.HighestSkillRatio)
                },
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
            document.getElementById("resetZoom").hidden = false;

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