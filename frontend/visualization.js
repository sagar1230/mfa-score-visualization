// Global variables for scales, data, SVG elements, and state management
var musicPerformanceIndividualScaleX, musicPerformanceEnsembleScaleX, musicPerformanceAverageScaleX, visualPerformanceIndividualScaleX, visualPerformanceEnsembleScaleX, visualPerformanceAverageScaleX, generalEffectMusic1ScaleX, generalEffectMusic2ScaleX, generalEffectMusicTotalScaleX, generalEffectVisualScaleX, generalEffectTotalScaleX, totalScaleX;
var musicPerformanceIndividualScaleY, musicPerformanceEnsembleScaleY, musicPerformanceAverageScaleY, visualPerformanceIndividualScaleY, visualPerformanceEnsembleScaleY, visualPerformanceAverageScaleY, generalEffectMusic1ScaleY, generalEffectMusic2ScaleY, generalEffectMusicTotalScaleY, generalEffectVisualScaleY, generalEffectTotalScaleY, totalScaleY;
var classNumberScale;
var data, svg, tooltip;
var xAxisSelection = "xAxisMusicPerformanceIndividual";
var yAxisSelection = "yAxisTotal";
var highSchoolNames;
var previousTickValues;
var originalTableHTML;

document.addEventListener("DOMContentLoaded", function() {
    originalTableHTML = d3.select("#details").html();
});

var clicked_array = [];
var click_type = "normal";
var fixed_y_offset = 452;
var fixed_x_offset = 58;
var transitionTime = 500;

/**
 * Update the X-axis based on the user's selection.
 * This function updates the scale, axis, and repositioning of circles on the X-axis.
 */
function updatexAxis() {
    var select = d3.select('#xAxisSelect').node();
    xAxisSelection = select.options[select.selectedIndex].value;

    var config = {
        "xAxisMusicPerformanceIndividual": { scale: musicPerformanceIndividualScaleX, label: "Music Performance Individual Score", accessor: d => d.musicPerformanceIndividual },
        "xAxisMusicPerformanceEnsemble":   { scale: musicPerformanceEnsembleScaleX, label: "Music Performance Ensemble Score", accessor: d => d.musicPerformanceEnsemble },
        "xAxisMusicPerformanceAverage":    { scale: musicPerformanceAverageScaleX, label: "Music Performance Average Score", accessor: d => d.musicPerformanceAverage },
        "xAxisVisualPerformanceIndividual":{ scale: visualPerformanceIndividualScaleX, label: "Visual Performance Individual Score", accessor: d => d.visualPerformanceIndividual },
        "xAxisVisualPerformanceEnsemble":  { scale: visualPerformanceEnsembleScaleX, label: "Visual Performance Ensemble Score", accessor: d => d.visualPerformanceEnsemble },
        "xAxisVisualPerformanceAverage":   { scale: visualPerformanceAverageScaleX, label: "Visual Performance Average Score", accessor: d => d.visualPerformanceAverage },
        "xAxisGeneralEffectMusic1":        { scale: generalEffectMusic1ScaleX, label: "General Effect Music 1 Score", accessor: d => d.generalEffectMusic1 },
        "xAxisGeneralEffectMusic2":        { scale: generalEffectMusic2ScaleX, label: "General Effect Music 2 Score", accessor: d => d.generalEffectMusic2 },
        "xAxisGeneralEffectMusicTotal":    { scale: generalEffectMusicTotalScaleX, label: "General Effect Music Total Score", accessor: d => d.generalEffectMusicTotal },
        "xAxisGeneralEffectVisual":        { scale: generalEffectVisualScaleX, label: "General Effect Visual Score", accessor: d => d.generalEffectVisual },
        "xAxisGeneralEffectTotal":         { scale: generalEffectTotalScaleX, label: "General Effect Total Score", accessor: d => d.generalEffectTotal },
        "xAxisTotal":                      { scale: totalScaleX, label: "Total Score", accessor: d => d.total }
    }[xAxisSelection];
    
    if (!config) return;
    
    var newScale = config.scale;
    var newLabel = config.label;
    var newxAxis = d3.axisBottom(newScale);

    // Helper function to compare arrays of tick values
    function arraysAreEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    }    

    if (!arraysAreEqual(previousTickValues, newxAxis.scale().ticks())) {
        svg.select(".xAxis")
            .transition().duration(transitionTime)
            .call(newxAxis)
            .selectAll("text")
            .style("font-size", "10px")
            .style("font-family", "Avenir");

        previousTickValues = newxAxis.scale().ticks();
    }

    svg.select(".xAxisLabel")
        .transition().duration(transitionTime)
        .text(newLabel);

    svg.selectAll("circle")
        .transition().duration(transitionTime)
        .attr("cx", function(d) {
            return newScale(config.accessor(d));
        });

    setTimeout(() => {
        svg.select(".xAxis").selectAll(".tick")
            .each(function(d) {
                var tick = d3.select(this);
                var textElement = tick.select("text").node();
                if (textElement) {
                    var bbox = textElement.getBoundingClientRect();
                    if (bbox.left <= 115) {
                        tick.remove();
                    }
                }
            });
    }, transitionTime);

    if (clicked_array.length > 0) {
        d3.select('.clicked_circle').dispatch('click');
        click_type = "search";
    }
}

/**
 * Update the Y-axis based on the user's selection.
 * This function adjusts the scale, axis, and repositions circles on the Y-axis.
 */
function updateyAxis() {
    var select = d3.select('#yAxisSelect').node();
    yAxisSelection = select.options[select.selectedIndex].value;

    var config = {
        "yAxisMusicPerformanceIndividual": { scale: musicPerformanceIndividualScaleY, label: "Music Performance Individual Score", accessor: d => d.musicPerformanceIndividual },
        "yAxisMusicPerformanceEnsemble":   { scale: musicPerformanceEnsembleScaleY, label: "Music Performance Ensemble Score", accessor: d => d.musicPerformanceEnsemble },
        "yAxisMusicPerformanceAverage":    { scale: musicPerformanceAverageScaleY, label: "Music Performance Average Score", accessor: d => d.musicPerformanceAverage },
        "yAxisVisualPerformanceIndividual":{ scale: visualPerformanceIndividualScaleY, label: "Visual Performance Individual Score", accessor: d => d.visualPerformanceIndividual },
        "yAxisVisualPerformanceEnsemble":  { scale: visualPerformanceEnsembleScaleY, label: "Visual Performance Ensemble Score", accessor: d => d.visualPerformanceEnsemble },
        "yAxisVisualPerformanceAverage":   { scale: visualPerformanceAverageScaleY, label: "Visual Performance Average Score", accessor: d => d.visualPerformanceAverage },
        "yAxisGeneralEffectMusic1":        { scale: generalEffectMusic1ScaleY, label: "General Effect Music 1 Score", accessor: d => d.generalEffectMusic1 },
        "yAxisGeneralEffectMusic2":        { scale: generalEffectMusic2ScaleY, label: "General Effect Music 2 Score", accessor: d => d.generalEffectMusic2 },
        "yAxisGeneralEffectMusicTotal":    { scale: generalEffectMusicTotalScaleY, label: "General Effect Music Total Score", accessor: d => d.generalEffectMusicTotal },
        "yAxisGeneralEffectVisual":        { scale: generalEffectVisualScaleY, label: "General Effect Visual Score", accessor: d => d.generalEffectVisual },
        "yAxisGeneralEffectTotal":         { scale: generalEffectTotalScaleY, label: "General Effect Total Score", accessor: d => d.generalEffectTotal },
        "yAxisTotal":                      { scale: totalScaleY, label: "Total Score", accessor: d => d.total }
    }[yAxisSelection];
    
    if (!config) return;
    
    var newScale = config.scale;
    var newLabel = config.label;
    var newyAxis = d3.axisLeft(newScale);

    svg.select(".yAxis")
        .transition().duration(transitionTime)
        .call(newyAxis)
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Avenir");

    svg.select(".yAxisLabel")
        .transition().duration(transitionTime)
        .text(newLabel);

    svg.selectAll("circle")
        .transition().duration(transitionTime)
        .attr("cy", function(d) {
            return newScale(config.accessor(d));
        });

    if (clicked_array.length > 0) {
        d3.select('.clicked_circle').dispatch('click');
        click_type = "normal";
    }
}

/**
 * Update the domains of all scales based on the filtered data.
 * Scales for both axes are adjusted using specific multipliers.
 *
 * @param {Array} filteredData - Array of data objects after filtering.
 */
function updateScales(filteredData) {
    var scale20Values = filteredData.flatMap(d => [
        d.musicPerformanceIndividual,
        d.musicPerformanceEnsemble,
        d.visualPerformanceIndividual,
        d.visualPerformanceEnsemble,
        d.generalEffectMusic1,
        d.generalEffectMusic2,
        d.generalEffectVisual
    ]);

    var scale20Min = d3.min(scale20Values);
    var scale20Max = d3.max(scale20Values);

    const xScaleMappings = {
        musicPerformanceIndividualScaleX: { scale: musicPerformanceIndividualScaleX, multiplier: 1 },
        musicPerformanceEnsembleScaleX:   { scale: musicPerformanceEnsembleScaleX, multiplier: 1 },
        musicPerformanceAverageScaleX:    { scale: musicPerformanceAverageScaleX, multiplier: 1 },
        visualPerformanceIndividualScaleX:{ scale: visualPerformanceIndividualScaleX, multiplier: 1 },
        visualPerformanceEnsembleScaleX:  { scale: visualPerformanceEnsembleScaleX, multiplier: 1 },
        visualPerformanceAverageScaleX:   { scale: visualPerformanceAverageScaleX, multiplier: 1 },
        generalEffectMusic1ScaleX:        { scale: generalEffectMusic1ScaleX, multiplier: 1 },
        generalEffectMusic2ScaleX:        { scale: generalEffectMusic2ScaleX, multiplier: 1 },
        generalEffectMusicTotalScaleX:    { scale: generalEffectMusicTotalScaleX, multiplier: 2 },
        generalEffectVisualScaleX:        { scale: generalEffectVisualScaleX, multiplier: 1 },
        generalEffectTotalScaleX:         { scale: generalEffectTotalScaleX, multiplier: 3 },
        totalScaleX:                      { scale: totalScaleX, multiplier: 5 }
    };

    Object.values(xScaleMappings).forEach(({ scale, multiplier }) => {
        scale.domain([scale20Min * multiplier, scale20Max * multiplier]);
    });

    const yScaleMappings = {
        musicPerformanceIndividualScaleY: { scale: musicPerformanceIndividualScaleY, multiplier: 1 },
        musicPerformanceEnsembleScaleY:   { scale: musicPerformanceEnsembleScaleY, multiplier: 1 },
        musicPerformanceAverageScaleY:    { scale: musicPerformanceAverageScaleY, multiplier: 1 },
        visualPerformanceIndividualScaleY:{ scale: visualPerformanceIndividualScaleY, multiplier: 1 },
        visualPerformanceEnsembleScaleY:  { scale: visualPerformanceEnsembleScaleY, multiplier: 1 },
        visualPerformanceAverageScaleY:   { scale: visualPerformanceAverageScaleY, multiplier: 1 },
        generalEffectMusic1ScaleY:        { scale: generalEffectMusic1ScaleY, multiplier: 1 },
        generalEffectMusic2ScaleY:        { scale: generalEffectMusic2ScaleY, multiplier: 1 },
        generalEffectMusicTotalScaleY:    { scale: generalEffectMusicTotalScaleY, multiplier: 2 },
        generalEffectVisualScaleY:        { scale: generalEffectVisualScaleY, multiplier: 1 },
        generalEffectTotalScaleY:         { scale: generalEffectTotalScaleY, multiplier: 3 },
        totalScaleY:                      { scale: totalScaleY, multiplier: 5 }
    };

    Object.values(yScaleMappings).forEach(({ scale, multiplier }) => {
        scale.domain([scale20Min * multiplier, scale20Max * multiplier]);
    });
}

/**
 * Update the chart based on the current filter selections.
 * This includes updating scales, axes, circle positions, and the document title.
 */
function updateChart() {
    var selectedYear = document.getElementById("yearSelect").value;
    var selectedCompetition = document.getElementById("competitionSelect").value;
    var selectedRound = document.getElementById("roundSelect").value;

    var filteredData = data.filter(function(d) {
        return d.date.slice(0, 4) === selectedYear &&
            d.competition === selectedCompetition &&
            d.round === selectedRound;
    });

    document.title = `${selectedYear} ${filteredData[0].competitionNickname} ${selectedRound}`;

    updateScales(filteredData);
    updateSearchOptions(filteredData);
    updatexAxis();
    updateyAxis();

    const xConfig = {
        "xAxisMusicPerformanceIndividual": { scale: musicPerformanceIndividualScaleX, accessor: d => d.musicPerformanceIndividual },
        "xAxisMusicPerformanceEnsemble":   { scale: musicPerformanceEnsembleScaleX, accessor: d => d.musicPerformanceEnsemble },
        "xAxisMusicPerformanceAverage":    { scale: musicPerformanceAverageScaleX, accessor: d => d.musicPerformanceAverage },
        "xAxisVisualPerformanceIndividual":{ scale: visualPerformanceIndividualScaleX, accessor: d => d.visualPerformanceIndividual },
        "xAxisVisualPerformanceEnsemble":  { scale: visualPerformanceEnsembleScaleX, accessor: d => d.visualPerformanceEnsemble },
        "xAxisVisualPerformanceAverage":   { scale: visualPerformanceAverageScaleX, accessor: d => d.visualPerformanceAverage },
        "xAxisGeneralEffectMusic1":        { scale: generalEffectMusic1ScaleX, accessor: d => d.generalEffectMusic1 },
        "xAxisGeneralEffectMusic2":        { scale: generalEffectMusic2ScaleX, accessor: d => d.generalEffectMusic2 },
        "xAxisGeneralEffectMusicTotal":    { scale: generalEffectMusicTotalScaleX, accessor: d => d.generalEffectMusicTotal },
        "xAxisGeneralEffectVisual":        { scale: generalEffectVisualScaleX, accessor: d => d.generalEffectVisual },
        "xAxisGeneralEffectTotal":         { scale: generalEffectTotalScaleX, accessor: d => d.generalEffectTotal },
        "xAxisTotal":                      { scale: totalScaleX, accessor: d => d.total }
    }[xAxisSelection];

    const yConfig = {
        "yAxisMusicPerformanceIndividual": { scale: musicPerformanceIndividualScaleY, accessor: d => d.musicPerformanceIndividual },
        "yAxisMusicPerformanceEnsemble":   { scale: musicPerformanceEnsembleScaleY, accessor: d => d.musicPerformanceEnsemble },
        "yAxisMusicPerformanceAverage":    { scale: musicPerformanceAverageScaleY, accessor: d => d.musicPerformanceAverage },
        "yAxisVisualPerformanceIndividual":{ scale: visualPerformanceIndividualScaleY, accessor: d => d.visualPerformanceIndividual },
        "yAxisVisualPerformanceEnsemble":  { scale: visualPerformanceEnsembleScaleY, accessor: d => d.visualPerformanceEnsemble },
        "yAxisVisualPerformanceAverage":   { scale: visualPerformanceAverageScaleY, accessor: d => d.visualPerformanceAverage },
        "yAxisGeneralEffectMusic1":        { scale: generalEffectMusic1ScaleY, accessor: d => d.generalEffectMusic1 },
        "yAxisGeneralEffectMusic2":        { scale: generalEffectMusic2ScaleY, accessor: d => d.generalEffectMusic2 },
        "yAxisGeneralEffectMusicTotal":    { scale: generalEffectMusicTotalScaleY, accessor: d => d.generalEffectMusicTotal },
        "yAxisGeneralEffectVisual":        { scale: generalEffectVisualScaleY, accessor: d => d.generalEffectVisual },
        "yAxisGeneralEffectTotal":         { scale: generalEffectTotalScaleY, accessor: d => d.generalEffectTotal },
        "yAxisTotal":                      { scale: totalScaleY, accessor: d => d.total }
    }[yAxisSelection];

    svg.selectAll("circle")
        .transition().duration(transitionTime)
        .attr("cx", d => xConfig.scale(xConfig.accessor(d)))
        .attr("cy", d => yConfig.scale(yConfig.accessor(d)))
        .style("display", function(d) {
            return (d.date.slice(0, 4) === selectedYear &&
                d.competition === selectedCompetition &&
                d.round === selectedRound) ? null : "none";
        });
}

/**
 * Update the list of search suggestions for high schools.
 *
 * @param {Array} filteredData - Array of data objects after filtering.
 */
function updateSearchOptions(filteredData) {
    var filteredHighSchools = Array.from(new Set(filteredData.map(d => d.highSchool)))
        .sort((a, b) => a.localeCompare(b));

    var datalist = d3.select("#highSchoolSuggestions");
    datalist.selectAll("option").remove();

    datalist.selectAll("option")
        .data(filteredHighSchools)
        .enter()
        .append("option")
        .attr("value", function(d) { return d; });
}

// Load the performance dataset and initialize the visualization
d3.json('assets/data/processed.json').then(function(loadedData) {
    data = loadedData;

    // Preprocess the loaded data to convert values and rename keys
    data.forEach(d => {
        d.date = d["Date"];
        d.competition = d["Competition"];
        d.round = d["Round"];
        d.city = d["City"];
        d.venue = d["Venue"];
        d.competitionNickname = d["Competition Nickname"];

        d.judgeSystem = d["Judge System"];
        d.musicPerformanceIndividualJudge = d["Music Performance Individual Judge"];
        d.musicPerformanceEnsembleJudge = d["Music Performance Ensemble Judge"];
        d.visualPerformanceIndividualJudge = d["Visual Performance Individual Judge"];
        d.visualPerformanceEnsembleJudge = d["Visual Performance Ensemble Judge"];
        d.generalEffectMusic1Judge = d["General Effect Music 1 Judge"];
        d.generalEffectMusic2Judge = d["General Effect Music 2 Judge"];
        d.generalEffectVisualJudge = d["General Effect Visual Judge"];
        d.fieldTimingJudge = d["Field & Timing Judge"];
        d.headJudge = d["Head Judge"];

        d.performanceNumber = +d["Performance Number"];
        d.highSchool = d["High School"];

        d.musicPerformanceIndividual = +d["Music Performance Individual"];
        d.musicPerformanceEnsemble = +d["Music Performance Ensemble"];
        d.musicPerformanceAverage = +d["Music Performance Average"];
        d.visualPerformanceIndividual = +d["Visual Performance Individual"];
        d.visualPerformanceEnsemble = +d["Visual Performance Ensemble"];
        d.visualPerformanceAverage = +d["Visual Performance Average"];
        d.generalEffectMusic1 = +d["General Effect Music 1"];
        d.generalEffectMusic2 = +d["General Effect Music 2"];
        d.generalEffectMusicTotal = +d["General Effect Music Total"];
        d.generalEffectVisual = +d["General Effect Visual"];
        d.generalEffectTotal = +d["General Effect Total"];

        d.subtotal = +d["Subtotal"];
        d.fieldTiming = +d["Field & Timing"];
        d.total = +d["Total"];
        d.rating = d["Rating"];
        d.classRank = +d["Class Rank"];
        d.class = d["Class"];
        d.overallRank = +d["Overall Rank"];
        d.classNumber = +d["Class Number"];
        d.finalRound = d["Final Round"];

        d.musicPerformanceIndividualRank = +d["Music Performance Individual Rank"];
        d.musicPerformanceIndividualZ = +d["Music Performance Individual Z-Score"];
        d.musicPerformanceIndividualClassRank = +d["Music Performance Individual Class Rank"];
        d.musicPerformanceIndividualClassZ = +d["Music Performance Individual Class Z-Score"];

        d.musicPerformanceEnsembleRank = +d["Music Performance Ensemble Rank"];
        d.musicPerformanceEnsembleZ = +d["Music Performance Ensemble Z-Score"];
        d.musicPerformanceEnsembleClassRank = +d["Music Performance Ensemble Class Rank"];
        d.musicPerformanceEnsembleClassZ = +d["Music Performance Ensemble Class Z-Score"];

        d.musicPerformanceAverageRank = +d["Music Performance Average Rank"];
        d.musicPerformanceAverageZ = +d["Music Performance Average Z-Score"];
        d.musicPerformanceAverageClassRank = +d["Music Performance Average Class Rank"];
        d.musicPerformanceAverageClassZ = +d["Music Performance Average Class Z-Score"];

        d.visualPerformanceIndividualRank = +d["Visual Performance Individual Rank"];
        d.visualPerformanceIndividualZ = +d["Visual Performance Individual Z-Score"];
        d.visualPerformanceIndividualClassRank = +d["Visual Performance Individual Class Rank"];
        d.visualPerformanceIndividualClassZ = +d["Visual Performance Individual Class Z-Score"];

        d.visualPerformanceEnsembleRank = +d["Visual Performance Ensemble Rank"];
        d.visualPerformanceEnsembleZ = +d["Visual Performance Ensemble Z-Score"];
        d.visualPerformanceEnsembleClassRank = +d["Visual Performance Ensemble Class Rank"];
        d.visualPerformanceEnsembleClassZ = +d["Visual Performance Ensemble Class Z-Score"];

        d.visualPerformanceAverageRank = +d["Visual Performance Average Rank"];
        d.visualPerformanceAverageZ = +d["Visual Performance Average Z-Score"];
        d.visualPerformanceAverageClassRank = +d["Visual Performance Average Class Rank"];
        d.visualPerformanceAverageClassZ = +d["Visual Performance Average Class Z-Score"];

        d.generalEffectMusic1Rank = +d["General Effect Music 1 Rank"];
        d.generalEffectMusic1Z = +d["General Effect Music 1 Z-Score"];
        d.generalEffectMusic1ClassRank = +d["General Effect Music 1 Class Rank"];
        d.generalEffectMusic1ClassZ = +d["General Effect Music 1 Class Z-Score"];

        d.generalEffectMusic2Rank = +d["General Effect Music 2 Rank"];
        d.generalEffectMusic2Z = +d["General Effect Music 2 Z-Score"];
        d.generalEffectMusic2ClassRank = +d["General Effect Music 2 Class Rank"];
        d.generalEffectMusic2ClassZ = +d["General Effect Music 2 Class Z-Score"];

        d.generalEffectMusicTotalRank = +d["General Effect Music Total Rank"];
        d.generalEffectMusicTotalZ = +d["General Effect Music Total Z-Score"];
        d.generalEffectMusicTotalClassRank = +d["General Effect Music Total Class Rank"];
        d.generalEffectMusicTotalClassZ = +d["General Effect Music Total Class Z-Score"];

        d.generalEffectVisualRank = +d["General Effect Visual Rank"];
        d.generalEffectVisualZ = +d["General Effect Visual Z-Score"];
        d.generalEffectVisualClassRank = +d["General Effect Visual Class Rank"];
        d.generalEffectVisualClassZ = +d["General Effect Visual Class Z-Score"];

        d.generalEffectTotalRank = +d["General Effect Total Rank"];
        d.generalEffectTotalZ = +d["General Effect Total Z-Score"];
        d.generalEffectTotalClassRank = +d["General Effect Total Class Rank"];
        d.generalEffectTotalClassZ = +d["General Effect Total Class Z-Score"];
    });

    /**
     * Build a structured object containing competition data organized by year.
     *
     * @param {Array} dataArray - Array of data objects.
     * @returns {Object} competitionData - Organized competition data.
     */
    function buildCompetitionData(dataArray) {
        var competitionData = {};

        dataArray.forEach(item => {
            var year = item.date.slice(0, 4);
            var competition = item.competition;
            var round = item.round;
            var date = item.date;

            if (!competitionData[year]) {
                competitionData[year] = {};
            }
            if (!competitionData[year][competition]) {
                competitionData[year][competition] = [];
            }
            var existingEntry = competitionData[year][competition].find(entry => entry.round === round);

            if (!existingEntry) {
                competitionData[year][competition].push({ round: round, date: date });
            }
        });

        return competitionData;
    }

    var competitionData = buildCompetitionData(data);

    /**
     * Build an object mapping competitions to their nicknames.
     *
     * @param {Array} dataArray - Array of data objects.
     * @returns {Object} nicknameData - Mapping of competition to nickname.
     */
    function buildNicknameData(dataArray) {
        var nicknameData = {};

        dataArray.forEach(item => {
            var competition = item.competition;
            var competitionNickname = item.competitionNickname;

            if (!nicknameData[competition]) {
                nicknameData[competition] = { competitionNickname };
            }
        });

        return nicknameData;
    }

    var nicknameData = buildNicknameData(data);

    highSchoolNames = Array.from(new Set(data.map(function(d) {
        return d.highSchool;
    }))).sort((a, b) => a.localeCompare(b));

    d3.select("#highSchoolSuggestions")
        .selectAll("option")
        .data(highSchoolNames)
        .enter()
        .append("option")
        .attr("value", function(d) { return d; });

    var scale20Values = data.flatMap(d => [
        d.musicPerformanceIndividual,
        d.musicPerformanceEnsemble,
        d.visualPerformanceIndividual,
        d.visualPerformanceEnsemble,
        d.generalEffectMusic1,
        d.generalEffectMusic2,
        d.generalEffectVisual
    ]);

    var scale20Min = d3.min(scale20Values);
    var scale20Max = d3.max(scale20Values);

    var xRange = [60, 810];
    var yRange = [450, 20];
    var rRange = [3, 10];

    // Define X-axis scales with initial domains and ranges
    musicPerformanceIndividualScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    musicPerformanceEnsembleScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    musicPerformanceAverageScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    visualPerformanceIndividualScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    visualPerformanceEnsembleScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    visualPerformanceAverageScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    generalEffectMusic1ScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    generalEffectMusic2ScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    generalEffectMusicTotalScaleX = d3.scaleLinear()
        .domain([scale20Min * 2, scale20Max * 2])
        .range(xRange);

    generalEffectVisualScaleX = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(xRange);

    generalEffectTotalScaleX = d3.scaleLinear()
        .domain([scale20Min * 3, scale20Max * 3])
        .range(xRange);

    totalScaleX = d3.scaleLinear()
        .domain([scale20Min * 5, scale20Max * 5])
        .range(xRange);

    // Define Y-axis scales with initial domains and ranges
    musicPerformanceIndividualScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    musicPerformanceEnsembleScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    musicPerformanceAverageScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    visualPerformanceIndividualScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    visualPerformanceEnsembleScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    visualPerformanceAverageScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    generalEffectMusic1ScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    generalEffectMusic2ScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    generalEffectMusicTotalScaleY = d3.scaleLinear()
        .domain([scale20Min * 2, scale20Max * 2])
        .range(yRange);

    generalEffectVisualScaleY = d3.scaleLinear()
        .domain([scale20Min, scale20Max])
        .range(yRange);

    generalEffectTotalScaleY = d3.scaleLinear()
        .domain([scale20Min * 3, scale20Max * 3])
        .range(yRange);

    totalScaleY = d3.scaleLinear()
        .domain([scale20Min * 5, scale20Max * 5])
        .range(yRange);

    // Define a scale for mapping class numbers to circle radii
    classNumberScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.classNumber))
        .range(rRange);

    // Select the main SVG element for rendering the chart
    svg = d3.select('svg');

    // Create an information tooltip (initially hidden)
    var infotip = d3.select('body').append('div')
        .attr('class', 'infotip')
        .style('position', 'absolute')
        .style('opacity', 0);

    // Create a detailed tooltip for performance metrics (initially hidden)
    tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(255, 255, 255, 0.9)')
        .style('padding', '7px')
        .style('border', '1px solid black')
        .style('border-radius', '3px')
        .style('opacity', 0);

    // Append the X-axis group and render the initial axis
    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0, 455)")
        .call(d3.axisBottom(musicPerformanceIndividualScaleX))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Avenir");

    // Append the X-axis label text
    svg.append("text")
        .attr("class", "xAxisLabel")
        .attr("transform", `translate(${(60 + 810) / 2}, 497)`)
        .attr("text-anchor", "middle")
        .text("Music Performance Individual Score")
        .style("font-size", "12px");

    previousTickValues = d3.axisBottom(musicPerformanceIndividualScaleX).scale().ticks();

    svg.select(".xAxis").selectAll(".tick")
        .each(function(d) {
            var tick = d3.select(this);
            var textElement = tick.select("text").node();
            if (textElement) {
                var bbox = textElement.getBoundingClientRect();
                if (bbox.left <= 115) {
                    tick.remove();
                }
            }
        });

    // Append the Y-axis group and render the initial axis
    svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(55, 0)")
        .call(d3.axisLeft(totalScaleY))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Avenir");

    // Append the Y-axis label text
    svg.append("text")
        .attr("class", "yAxisLabel")
        .attr("transform", `rotate(-90) translate(${-(450 + 20) / 2}, 17)`)
        .attr("text-anchor", "middle")
        .text("Total Score")
        .style("font-size", "12px");

    // Append an information symbol that shows chart interaction details on hover
    svg.append("g")
        .attr("transform", "translate(814, 14)")
        .append("text")
        .text("ⓘ")
        .attr("fill", "#777777")
        .on('mouseover', function(event) {
            var tableHtml = ``;
            d3.select('#details').html(tableHtml);
            var info_html = `
                <strong style='color: #000000; font-weight: 550; margin-bottom: 0px; display: block;'>Chart Interaction</strong>
                <div style='color: #777777;'>Hover or click on a point to view its scoring details and <br> 
                                            highlight its band's class. Use the selectors to change the <br> 
                                            competition and scoring categories in view. Use the search <br> 
                                            bar to locate a specific high school. 
                <span style='margin-top: 10px; display: block;'><strong style='color: #000000; font-weight: 550'>Z-Scores (Z)</strong> gauge a band’s performance relative to its <br>
                                                                                                                competitors by measuring standard deviations from the mean. <br>
                                                                                                                This provides a more nuanced comparison than rank or <br>
                                                                                                                raw score alone by reflecting both a band’s position and its <br> 
                                                                                                                degree of difference from the field.
                <span style='margin-top: 10px; display: block;'><strong style='color: #000000; font-weight: 550'>Rank</strong> in a category is shown alongside Z-Score in scoring <br>
                                                                                                                tables when a point is selected. <br>
                <span style='margin-top: 10px; display: block;'><strong style='color: #000000; font-weight: 550'>Raw Scores</strong> are given on their respective axes when a point<br>
                                                                                                                is selected.                                                                                                   
                <span style='margin-top: 10px; display: block;'><strong style='color: #000000; font-weight: 550'>Caption Titles</strong> are colored on scoring tables to aid in <br>
                                                                                                                comparisons. Music captions are purple. Visual captions are <br> 
                                                                                                                yellow. Performance captions are darkly colored. General <br>
                                                                                                                Effect captions are lightly colored.
                                                                                                                <br>                                                                                                                                                                                              
                <span style='margin-top: 10px; display: block;'><strong style='color: #000000; font-weight: 550'>Performance Number (#)</strong> within a round is shown at the <br>
                                                                                                                bottom left of the chart when a point is selected <br>
                <span style='margin-top: 10px; display: block;'><strong style='color: #000000; font-weight: 550'>Overall Placement (P)</strong> for a band is shown at the bottom <br>
                                                                                                                left of the chart when a point is selected <br>
                </div>
            `;
            infotip.html(info_html)
                .style("left", 925 + "px")
                .style("top", 125 + "px")
                .style("opacity", 1);
        }).on('mouseout', function() {
            infotip.style('opacity', 0);
            revert_selection_display();
        });

    /**
     * Extract data and compute positions and content for a clicked or hovered point.
     *
     * @param {Object} d - Data object for the selected point.
     * @returns {Array} Array of computed values and HTML strings for tooltip display.
     */
    function get_point_values(d) {
        const cx = (xAxisSelection === "xAxisMusicPerformanceIndividual" ? musicPerformanceIndividualScaleX(d.musicPerformanceIndividual) :
            xAxisSelection === "xAxisMusicPerformanceEnsemble" ? musicPerformanceEnsembleScaleX(d.musicPerformanceEnsemble) :
            xAxisSelection === "xAxisMusicPerformanceAverage" ? musicPerformanceAverageScaleX(d.musicPerformanceAverage) :
            xAxisSelection === "xAxisVisualPerformanceIndividual" ? visualPerformanceIndividualScaleX(d.visualPerformanceIndividual) :
            xAxisSelection === "xAxisVisualPerformanceEnsemble" ? visualPerformanceEnsembleScaleX(d.visualPerformanceEnsemble) :
            xAxisSelection === "xAxisVisualPerformanceAverage" ? visualPerformanceAverageScaleX(d.visualPerformanceAverage) :
            xAxisSelection === "xAxisGeneralEffectMusic1" ? generalEffectMusic1ScaleX(d.generalEffectMusic1) :
            xAxisSelection === "xAxisGeneralEffectMusic2" ? generalEffectMusic2ScaleX(d.generalEffectMusic2) :
            xAxisSelection === "xAxisGeneralEffectMusicTotal" ? generalEffectMusicTotalScaleX(d.generalEffectMusicTotal) :
            xAxisSelection === "xAxisGeneralEffectVisual" ? generalEffectVisualScaleX(d.generalEffectVisual) :
            xAxisSelection === "xAxisGeneralEffectTotal" ? generalEffectTotalScaleX(d.generalEffectTotal) :
            totalScaleX(d.total));
        const cy = (yAxisSelection === "yAxisMusicPerformanceIndividual" ? musicPerformanceIndividualScaleY(d.musicPerformanceIndividual) :
            yAxisSelection === "yAxisMusicPerformanceEnsemble" ? musicPerformanceEnsembleScaleY(d.musicPerformanceEnsemble) :
            yAxisSelection === "yAxisMusicPerformanceAverage" ? musicPerformanceAverageScaleY(d.musicPerformanceAverage) :
            yAxisSelection === "yAxisVisualPerformanceIndividual" ? visualPerformanceIndividualScaleY(d.visualPerformanceIndividual) :
            yAxisSelection === "yAxisVisualPerformanceEnsemble" ? visualPerformanceEnsembleScaleY(d.visualPerformanceEnsemble) :
            yAxisSelection === "yAxisVisualPerformanceAverage" ? visualPerformanceAverageScaleY(d.visualPerformanceAverage) :
            yAxisSelection === "yAxisGeneralEffectMusic1" ? generalEffectMusic1ScaleY(d.generalEffectMusic1) :
            yAxisSelection === "yAxisGeneralEffectMusic2" ? generalEffectMusic2ScaleY(d.generalEffectMusic2) :
            yAxisSelection === "yAxisGeneralEffectMusicTotal" ? generalEffectMusicTotalScaleY(d.generalEffectMusicTotal) :
            yAxisSelection === "yAxisGeneralEffectVisual" ? generalEffectVisualScaleY(d.generalEffectVisual) :
            yAxisSelection === "yAxisGeneralEffectTotal" ? generalEffectTotalScaleY(d.generalEffectTotal) :
            totalScaleY(d.total));

        const xValue = (xAxisSelection === "xAxisMusicPerformanceIndividual" ? d.musicPerformanceIndividual :
            xAxisSelection === "xAxisMusicPerformanceEnsemble" ? d.musicPerformanceEnsemble :
            xAxisSelection === "xAxisMusicPerformanceAverage" ? d.musicPerformanceAverage :
            xAxisSelection === "xAxisVisualPerformanceIndividual" ? d.visualPerformanceIndividual :
            xAxisSelection === "xAxisVisualPerformanceEnsemble" ? d.visualPerformanceEnsemble :
            xAxisSelection === "xAxisVisualPerformanceAverage" ? d.visualPerformanceAverage :
            xAxisSelection === "xAxisGeneralEffectMusic1" ? d.generalEffectMusic1 :
            xAxisSelection === "xAxisGeneralEffectMusic2" ? d.generalEffectMusic2 :
            xAxisSelection === "xAxisGeneralEffectMusicTotal" ? d.generalEffectMusicTotal :
            xAxisSelection === "xAxisGeneralEffectVisual" ? d.generalEffectVisual :
            xAxisSelection === "xAxisGeneralEffectTotal" ? d.generalEffectTotal :
            d.total);

        const yValue = (yAxisSelection === "yAxisMusicPerformanceIndividual" ? d.musicPerformanceIndividual :
            yAxisSelection === "yAxisMusicPerformanceEnsemble" ? d.musicPerformanceEnsemble :
            yAxisSelection === "yAxisMusicPerformanceAverage" ? d.musicPerformanceAverage :
            yAxisSelection === "yAxisVisualPerformanceIndividual" ? d.visualPerformanceIndividual :
            yAxisSelection === "yAxisVisualPerformanceEnsemble" ? d.visualPerformanceEnsemble :
            yAxisSelection === "yAxisVisualPerformanceAverage" ? d.visualPerformanceAverage :
            yAxisSelection === "yAxisGeneralEffectMusic1" ? d.generalEffectMusic1 :
            yAxisSelection === "yAxisGeneralEffectMusic2" ? d.generalEffectMusic2 :
            yAxisSelection === "yAxisGeneralEffectMusicTotal" ? d.generalEffectMusicTotal :
            yAxisSelection === "yAxisGeneralEffectVisual" ? d.generalEffectVisual :
            yAxisSelection === "yAxisGeneralEffectTotal" ? d.generalEffectTotal :
            d.total);

        var classNumber = d.classNumber;

        var number_html;
        if (d.performanceNumber !== null && d.performanceNumber !== 0) {
            number_html = `
              <tspan class="perf-number">#${d.performanceNumber}</tspan>
              <tspan class="overall-rank">P${d.overallRank}</tspan>
            `;
        } else {
            number_html = `<tspan class="overall-rank">P${d.overallRank}</tspan>`;
        }

        var tooltip_html = `<strong style="font-weight: 550;">${d.highSchool}</strong><br>Class ${d.classNumber}A`;

        var rows = [
            { label: "Music Performance Individual", labelColor: "#674ea7", zValue: d.musicPerformanceIndividualZ, rankValue: d.musicPerformanceIndividualRank },
            { label: "Music Performance Ensemble", labelColor: "#674ea7", zValue: d.musicPerformanceEnsembleZ, rankValue: d.musicPerformanceEnsembleRank },
            { label: "Music Performance Average", labelColor: "#674ea7", zValue: d.musicPerformanceAverageZ, rankValue: d.musicPerformanceAverageRank },
            { label: "Visual Performance Individual", labelColor: "#f1c232", zValue: d.visualPerformanceIndividualZ, rankValue: d.visualPerformanceIndividualRank },
            { label: "Visual Performance Ensemble", labelColor: "#f1c232", zValue: d.visualPerformanceEnsembleZ, rankValue: d.visualPerformanceEnsembleRank },
            { label: "Visual Performance Average", labelColor: "#f1c232", zValue: d.visualPerformanceAverageZ, rankValue: d.visualPerformanceAverageRank },
            { label: "General Effect Music 1", labelColor: "#b4a7d6", zValue: d.generalEffectMusic1Z, rankValue: d.generalEffectMusic1Rank },
            { label: "General Effect Music 2", labelColor: "#b4a7d6", zValue: d.generalEffectMusic2Z, rankValue: d.generalEffectMusic2Rank },
            { label: "General Effect Music Total", labelColor: "#b4a7d6", zValue: d.generalEffectMusicTotalZ, rankValue: d.generalEffectMusicTotalRank },
            { label: "General Effect Visual", labelColor: "#ffe599", zValue: d.generalEffectVisualZ, rankValue: d.generalEffectVisualRank },
            { label: "General Effect Total", labelColor: "#cccccc", zValue: d.generalEffectTotalZ, rankValue: d.generalEffectTotalRank }
        ];

        rows.sort(function(a, b) {
            return b.zValue - a.zValue;
        });

        var minZValue = d3.min(rows, function(r) { return r.zValue; });
        var maxZValue = d3.max(rows, function(r) { return r.zValue; });
        var medianZValue = d3.median(rows, function(r) { return r.zValue; });

        var minRankValue = d3.min(rows, function(r) { return r.rankValue; });
        var maxRankValue = d3.max(rows, function(r) { return r.rankValue; });
        var medianRankValue = d3.median(rows, function(r) { return r.rankValue; });

        var zColorScale = d3.scaleLinear()
            .domain([minZValue, medianZValue, maxZValue])
            .range(["#6d9eeb", "#ffffff", "#f6b26b"]);

        var rankColorScale = d3.scaleLinear()
            .domain([minRankValue, maxRankValue])
            .range(["#57bb8a", "#ffffff"]);

        var tableHeaderHtml = document.querySelector(".details-table thead").outerHTML;

        var tableRowsHtml = rows.map(function(row) {
            return `<tr>
                    <td style="color: ${row.labelColor};">${row.label}</td>
                    <td style="background-color: ${zColorScale(row.zValue)};">
                      ${row.zValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style="background-color: ${rankColorScale(row.rankValue)};">
                      ${row.rankValue.toLocaleString()}
                    </td>
                  </tr>`;
        }).join("");

        var table_html = `
          <table class="details-table">
            ${tableHeaderHtml}
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        `;

        return [d, cx, cy, xValue, yValue, classNumber, number_html, tooltip_html, table_html];
    }

    /**
     * Update the display for the selected point.
     *
     * @param {Object} d - Data object for the selected point.
     * @param {number} cx - Computed x-coordinate.
     * @param {number} cy - Computed y-coordinate.
     * @param {number} xValue - X-axis data value.
     * @param {number} yValue - Y-axis data value.
     * @param {number} classNumber - Class number for scaling.
     * @param {string} number_html - HTML content for performance number display.
     * @param {string} tooltip_html - HTML content for the tooltip.
     * @param {string} table_html - HTML content for the details table.
     */
    function update_selection_display(d, cx, cy, xValue, yValue, classNumber, number_html, tooltip_html, table_html) {
        xAxisValueText.text(xValue)
            .attr("x", cx)
            .attr("y", fixed_y_offset);

        yAxisValueText.text(yValue)
            .attr("x", fixed_x_offset)
            .attr("y", cy + 5 + "px");

        performanceNumberValueText.html(number_html);
        if (!performanceNumberValueText.select("tspan.perf-number").empty()) {
            performanceNumberValueText.select("tspan.perf-number")
                .attr("x", fixed_x_offset)
                .attr("y", fixed_y_offset + 10)
                .attr("dy", 0);

            performanceNumberValueText.select("tspan.overall-rank")
                .attr("x", fixed_x_offset)
                .attr("dy", "1.2em");
        } else {
            performanceNumberValueText.select("tspan.overall-rank")
                .attr("x", fixed_x_offset)
                .attr("y", fixed_y_offset + 10)
                .attr("dy", 0);
        }

        tooltip.html(tooltip_html)
            .style("opacity", 1)
            .style("display", "block");

        tooltip.style("left", cx + 58 - (tooltip.node().getBoundingClientRect().width / 2) + "px")
            .style("top", cy + 70 - classNumberScale(classNumber) + "px");

        svg.selectAll("circle")
            .style("opacity", function(e) {
                return (classNumber == e.classNumber) ? 0.9 : 0.1;
            });

        d3.select('#details').html(table_html);

        svg.selectAll("g.inner-circle").remove();
        var innerRadius = classNumberScale(classNumber) * 0.5;

        var innerCircleGroup = svg.append("g")
            .attr("class", "inner-circle")
            .attr("transform", "translate(" + cx + "," + cy + ")");
            
        innerCircleGroup.append("path")
            .attr("d", d3.symbol().type(d3.symbolCircle).size(Math.PI * innerRadius * innerRadius)())
            .style("fill", "#05ddf6")
            .style("opacity", 1)
            .style("pointer-events", "none");
    }

    /**
     * Revert the display to the default state if no point is selected.
     */
    function revert_selection_display() {
        if (clicked_array.length == 0) {
            tooltip.style('opacity', 0)
                .style('display', 'none');

            svg.selectAll("circle")
                .style("opacity", 0.7);

            xAxisValueText.text("");
            yAxisValueText.text("");
            performanceNumberValueText.html('');

            var details_html = originalTableHTML;
            d3.select('#details').html(details_html);
            svg.selectAll("g.inner-circle").remove();
        } else {
            update_selection_display(...clicked_array);
        }
    }

    // Clear selection when clicking outside circles or UI elements or pressing escape
    function clearSelectionHandler(event) {
        if (event.type === "keydown" && event.key === "Escape") {
            clicked_array = [];
            document.getElementById("highSchoolSearch").value = "";
            svg.selectAll("circle").classed("clicked_circle", false);
            revert_selection_display();
        }

        else if (event.type === "click") {
            if (
                click_type === "normal" &&
                !event.target.closest("circle") && 
                !event.target.closest("#details") && 
                event.target.id !== "highSchoolSearch" && 
                event.target.id !== "xAxisSelect" && 
                event.target.id !== "yAxisSelect" && 
                event.target.id !== "yearSelect" && 
                event.target.id !== "competitionSelect" && 
                event.target.id !== "roundSelect" 
            ) {
                clicked_array = [];
                document.getElementById("highSchoolSearch").value = "";
                svg.selectAll("circle").classed("clicked_circle", false);
                revert_selection_display();
            } else if (click_type === "search") {
                click_type = "normal";
            }
        }

        else if (event.type === "keydown" && event.key === "Backspace") {
            if (d3.select("#highSchoolSearch").property("value").trim().length <= 1) {
                click_type = "normal";
            }
        }
    }

    document.addEventListener("click", clearSelectionHandler);
    document.addEventListener("keydown", clearSelectionHandler);

    // Plot data points as circles and set up interactive event handlers
    svg.selectAll("circle")
        .data(data.sort((a, b) => b.classNumber - a.classNumber))
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            if (xAxisSelection === "xAxisMusicPerformanceIndividual") return musicPerformanceIndividualScaleX(d.musicPerformanceIndividual);
            if (xAxisSelection === "xAxisMusicPerformanceEnsemble") return musicPerformanceEnsembleScaleX(d.musicPerformanceEnsemble);
            if (xAxisSelection === "xAxisMusicPerformanceAverage") return musicPerformanceAverageScaleX(d.musicPerformanceAverage);
            if (xAxisSelection === "xAxisVisualPerformanceIndividual") return visualPerformanceIndividualScaleX(d.visualPerformanceIndividual);
            if (xAxisSelection === "xAxisVisualPerformanceEnsemble") return visualPerformanceEnsembleScaleX(d.visualPerformanceEnsemble);
            if (xAxisSelection === "xAxisVisualPerformanceAverage") return visualPerformanceAverageScaleX(d.visualPerformanceAverage);
            if (xAxisSelection === "xAxisGeneralEffectMusic1") return generalEffectMusic1ScaleX(d.generalEffectMusic1);
            if (xAxisSelection === "xAxisGeneralEffectMusic2") return generalEffectMusic2ScaleX(d.generalEffectMusic2);
            if (xAxisSelection === "xAxisGeneralEffectMusicTotal") return generalEffectMusicTotalScaleX(d.generalEffectMusicTotal);
            if (xAxisSelection === "xAxisGeneralEffectVisual") return generalEffectVisualScaleX(d.generalEffectVisual);
            if (xAxisSelection === "xAxisGeneralEffectTotal") return generalEffectTotalScaleX(d.generalEffectTotal);
            if (xAxisSelection === "xAxisTotal") return totalScaleX(d.total);
        })
        .attr("cy", function(d) {
            if (yAxisSelection === "yAxisMusicPerformanceIndividual") return musicPerformanceIndividualScaleY(d.musicPerformanceIndividual);
            if (yAxisSelection === "yAxisMusicPerformanceEnsemble") return musicPerformanceEnsembleScaleY(d.musicPerformanceEnsemble);
            if (yAxisSelection === "yAxisMusicPerformanceAverage") return musicPerformanceAverageScaleY(d.musicPerformanceAverage);
            if (yAxisSelection === "yAxisVisualPerformanceIndividual") return visualPerformanceIndividualScaleY(d.visualPerformanceIndividual);
            if (yAxisSelection === "yAxisVisualPerformanceEnsemble") return visualPerformanceEnsembleScaleY(d.visualPerformanceEnsemble);
            if (yAxisSelection === "yAxisVisualPerformanceAverage") return visualPerformanceAverageScaleY(d.visualPerformanceAverage);
            if (yAxisSelection === "yAxisGeneralEffectMusic1") return generalEffectMusic1ScaleY(d.generalEffectMusic1);
            if (yAxisSelection === "yAxisGeneralEffectMusic2") return generalEffectMusic2ScaleY(d.generalEffectMusic2);
            if (yAxisSelection === "yAxisGeneralEffectMusicTotal") return generalEffectMusicTotalScaleY(d.generalEffectMusicTotal);
            if (yAxisSelection === "yAxisGeneralEffectVisual") return generalEffectVisualScaleY(d.generalEffectVisual);
            if (yAxisSelection === "yAxisGeneralEffectTotal") return generalEffectTotalScaleY(d.generalEffectTotal);
            if (yAxisSelection === "yAxisTotal") return totalScaleY(d.total);
        })
        .attr("r", function(d) { return classNumberScale(d.classNumber); })
        .style("fill", function(d) { return d.finalRound === "Finals" ? "#DF3128" : d.finalRound === "Semifinals" ? "#0974C4" : "#6CBE69"; })
        .style("opacity", 0.7)
        .on('click', function(event, i) {
            clicked_array = get_point_values(data[i]);
            click_type = "normal";
            if (d3.select(this).classed("clicked_circle")) {
                tooltip.transition().duration(transitionTime)
                    .style("left", clicked_array[1] + 58 - (tooltip.node().getBoundingClientRect().width / 2) + "px")
                    .style("top", clicked_array[2] + 70 - classNumberScale(clicked_array[5]) + "px");

                svg.select("g.inner-circle")
                    .transition()
                    .duration(transitionTime)
                    .attr("transform", "translate(" + clicked_array[1] + "," + clicked_array[2] + ") scale(1)")
                    .transition()
                    .duration(transitionTime)
                    .attr("transform", "translate(" + clicked_array[1] + "," + clicked_array[2] + ") scale(1)");

                xAxisValueText.transition().duration(transitionTime)
                    .text(clicked_array[3])
                    .attr("x", clicked_array[1])
                    .attr("y", fixed_y_offset);

                yAxisValueText.transition().duration(transitionTime)
                    .text(clicked_array[4])
                    .attr("x", fixed_x_offset)
                    .attr("y", clicked_array[2] + 5 + "px");

                setTimeout(function() {
                            update_selection_display(...clicked_array);
                        }, transitionTime);
            } else {
                svg.selectAll("circle").classed("clicked_circle", false);
                svg.selectAll("g.inner-circle").remove();
                d3.select(this).classed("clicked_circle", true);
                update_selection_display(...clicked_array);
            }
        }).on('mouseover', function(event, i) {
            update_selection_display(...get_point_values(data[i]));
        }).on('mouseout', function() {
            revert_selection_display()
        });

    /**
     * Search for high schools by name and highlight matching points.
     */
    function searchHighSchool() {
        const query = d3.select("#highSchoolSearch").node().value.trim().toLowerCase();
        const selectedYear = document.getElementById("yearSelect").value;
        const selectedCompetition = document.getElementById("competitionSelect").value;
        const selectedRound = document.getElementById("roundSelect").value;

        if (query === "") return;

        const matchingCircles = svg.selectAll("circle")
            .filter(function(d) {
                return d.highSchool.toLowerCase().includes(query) && d.date.slice(0, 4) === selectedYear && d.competition === selectedCompetition && d.round === selectedRound;
            }).sort((a, b) => a.localeCompare(b));

        if (!matchingCircles.empty()) {
            matchingCircles.dispatch("click");
            click_type = "search";
        } else {
            if (click_type === "search") {
                clicked_array = [];
            }
            revert_selection_display();
        }
    }

    d3.select("#highSchoolSearch").on("input", function(event) {
        searchHighSchool();
    });

    d3.select("#highSchoolSearch").on("change", function() {
        if (this.value.trim() === "") {
            svg.selectAll("circle").style("opacity", 0.7);
            tooltip.style("opacity", 0).style("display", "none");
            var details_html = originalTableHTML;
            d3.select('#details').html(details_html);
        }
    });

    d3.select(".finalist-key")
        .on('mouseover', function() {
            svg.selectAll("circle")
                .style("opacity", function(d) {
                    return (d.finalRound === "Finals") ? 0.8 : 0.1;
                });
        }).on('mouseout', function() {
            revert_selection_display();
        });

    d3.select(".semifinalist-key")
        .on('mouseover', function() {
            svg.selectAll("circle")
                .style("opacity", function(d) {
                    return (d.finalRound === "Semifinals") ? 0.8 : 0.1;
                });
        }).on('mouseout', function() {
            revert_selection_display();
        });

    d3.select(".prelimist-key")
        .on('mouseover', function() {
            svg.selectAll("circle")
                .style("opacity", function(d) {
                    return (d.finalRound === "Prelims") ? 0.8 : 0.1;
                });
        }).on('mouseout', function() {
            revert_selection_display();
        });

    d3.select(".competition-key")
        .on('mouseover', function(event) {
            var tableHtml = ``;

            const match = svg.selectAll("circle")
                .filter(function(d) {
                    return d.date.slice(0, 4) === yearSelect.value && d.competition === competitionSelect.value && d.round === roundSelect.value;
                })
                .data()[0];

            var competition_details_array = [
                { label: "Full Name", value: match.competition },
                { label: "Nickname", value: match.competitionNickname },
                {
                    label: "Date",
                    value: match.date
                        ? new Date(match.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })
                        : null
                },
                { label: "City", value: match.city },
                { label: "Venue", value: match.venue },
                { label: "Round", value: match.round },
                { label: "Judge System", value: match.judgeSystem },
                { label: "Music Performance Individual Judge", value: match.musicPerformanceIndividualJudge },
                { label: "Music Performance Ensemble Judge", value: match.musicPerformanceEnsembleJudge },
                { label: "Visual Performance Individual Judge", value: match.visualPerformanceIndividualJudge },
                { label: "Visual Performance Ensemble Judge", value: match.visualPerformanceEnsembleJudge },
                { label: "General Effect Music 1 Judge", value: match.generalEffectMusic1Judge },
                { label: "General Effect Music 2 Judge", value: match.generalEffectMusic2Judge },
                { label: "General Effect Visual Judge", value: match.generalEffectVisualJudge },
                { label: "Field & Timing Judge", value: match.fieldTimingJudge },
                { label: "Head Judge", value: match.headJudge }
            ];
            d3.select('#details').html(tableHtml);
            var info_html = competition_details_array
                .filter(function(detail) {
                    if (
                        detail.label === "Judge System" &&
                        match.musicPerformanceIndividualJudge !== null &&
                        match.musicPerformanceIndividualJudge !== undefined
                    ) {
                        return false;
                    }
                    return detail.value !== null && detail.value !== undefined;
                })
                .map(function(detail, index, filteredArray) {
                    var marginStyle = index === 0 ? "margin-top: 0px;" : "margin-top: 10px;";

                    if (detail.label === "Full Name" && detail.value.includes(',')) {
                        detail.value = detail.value.replace(',', ',<br>');
                    }

                    if ((detail.label.indexOf("Full Name") > -1) || (detail.label.indexOf("Nickname") > -1)) {
                        return `
                            <strong style="color: #000000; font-weight: 550; ${marginStyle} display: block;">
                              ${detail.label}:
                            </strong>
                          <div style="color: #777777;">${detail.value}</div>
                        `;
                    } else {
                        return `
                          <div style="${marginStyle}">
                            <strong style="color: #000000; font-weight: 550;">
                              ${detail.label}${(detail.value.includes(',') || detail.value.includes('/')) ? 's' : ''}:
                            </strong>
                            <span style="color: #777777;"> ${detail.value}</span>
                          </div>
                        `;
                    }
                })
                .join('');
            infotip.html(info_html)
                .style("left", 925 + "px")
                .style("top", 125 + "px")
                .style("opacity", 1);
        }).on('mouseout', function() {
            infotip.style('opacity', 0);
            revert_selection_display();
        });

    /**
     * Populate the Year selector dropdown with available years.
     */
    function populateYearSelector() {
        const yearSelect = document.getElementById("yearSelect");
        yearSelect.innerHTML = "";
        Object.keys(competitionData)
            .sort((a, b) => b - a)
            .forEach(year => {
                const option = document.createElement("option");
                option.value = year;
                option.text = year;
                yearSelect.appendChild(option);
            });
    }

    /**
     * Populate the Competition selector dropdown based on the selected year.
     * Preserves the previous competition selection if possible.
     */
    function populateCompetitionSelector() {
        const yearSelect = document.getElementById("yearSelect");
        const competitionSelect = document.getElementById("competitionSelect");
        const previousCompetition = competitionSelect.value;
        competitionSelect.innerHTML = "";
        const selectedYear = yearSelect.value;

        if (competitionData[selectedYear]) {
            let competitions = Object.keys(competitionData[selectedYear]).map(comp => {
                let latestDate = competitionData[selectedYear][comp]
                    .map(entry => new Date(entry.date))
                    .sort((a, b) => b - a)[0];
                return { name: comp, latestDate };
            });

            competitions.sort((a, b) => a.name.localeCompare(b.name));
            competitions.sort((a, b) => b.latestDate - a.latestDate);

            competitions.forEach(({ name }) => {
                const option = document.createElement("option");
                option.value = name;
                option.text = name.replace(/, presented by[^,]*/, '');
                competitionSelect.appendChild(option);
            });
        }

        const competitionOptions = Array.from(competitionSelect.options);

        const nicknameOptions = competitionOptions
            .map(option => ({
                competition: option.value,
                nickname: nicknameData[option.value]?.competitionNickname
            }))
            .filter(entry => entry.nickname);

        const previousNickname = nicknameData[previousCompetition]?.competitionNickname;
        const foundCompetitionNickname = nicknameOptions.find(option => option.nickname === previousNickname);
        const foundCompetition = foundCompetitionNickname ? foundCompetitionNickname.competition : null;

        if (foundCompetition) {
            competitionSelect.value = foundCompetition;
        } else if (competitionSelect.options.length > 0) {
            competitionSelect.selectedIndex = 0;
        }

        populateRoundSelector();
    }

    /**
     * Populate the Round selector dropdown based on the selected year and competition.
     * Preserves the previous round selection if possible.
     */
    function populateRoundSelector() {
        const yearSelect = document.getElementById("yearSelect");
        const competitionSelect = document.getElementById("competitionSelect");
        const roundSelect = document.getElementById("roundSelect");
        const previousRound = roundSelect.value;
        roundSelect.innerHTML = "";
        const selectedYear = yearSelect.value;
        const selectedCompetition = competitionSelect.value;

        if (competitionData[selectedYear] && competitionData[selectedYear][selectedCompetition]) {
            competitionData[selectedYear][selectedCompetition].forEach(entry => {
                const option = document.createElement("option");
                option.value = entry.round;
                option.text = `${entry.round}`;
                roundSelect.appendChild(option);
            });
        }

        const roundOptions = Array.from(roundSelect.options);
        const foundRound = roundOptions.find(option => option.value === previousRound);
        if (foundRound) {
            roundSelect.value = previousRound;
        } else if (roundSelect.options.length > 0) {
            roundSelect.selectedIndex = 0;
        }
    }

    d3.select("#yearSelect").on("input", function() {
        svg.selectAll("circle").classed("clicked_circle", false);
        populateCompetitionSelector();
        clicked_array = [];
        revert_selection_display();
        updateChart();
    });

    d3.select("#competitionSelect").on("input", function() {
        svg.selectAll("circle").classed("clicked_circle", false);
        populateRoundSelector();
        clicked_array = [];
        revert_selection_display();
        updateChart();
    });

    d3.select("#roundSelect").on("input", function() {
        svg.selectAll("circle").classed("clicked_circle", false);
        clicked_array = [];
        revert_selection_display();
        updateChart();
    });

    populateYearSelector();
    populateCompetitionSelector();
    populateRoundSelector();

    var selectedYear = document.getElementById("yearSelect").value;
    var selectedCompetition = document.getElementById("competitionSelect").value;
    var selectedRound = document.getElementById("roundSelect").value;

    let titleUpdated = false;

    svg.selectAll("circle")
        .style("display", function(d) {
            var dYear = d.date.slice(0, 4);
            let isMatch = (dYear === selectedYear &&
                d.competition === selectedCompetition &&
                d.round === selectedRound);
            if (isMatch && !titleUpdated) {
                document.title = `${selectedYear} ${d.competitionNickname} ${selectedRound}`;
                titleUpdated = true;
            }
            return isMatch ? null : "none";
        });

    // Create global text elements for axis value annotations
    var xAxisValueText = svg.append("text")
        .attr("class", "x-axis-value")
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("pointer-events", "none");

    var yAxisValueText = svg.append("text")
        .attr("class", "y-axis-value")
        .attr("text-anchor", "left")
        .style("font-size", "10px")
        .style("pointer-events", "none");

    var performanceNumberValueText = svg.append("text")
        .attr("class", "performance-number-value")
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .style("pointer-events", "none");
});
