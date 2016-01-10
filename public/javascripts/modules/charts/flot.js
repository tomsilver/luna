luna
    
    // =========================================================================
    // Curved Line Chart 
    // =========================================================================

    .directive('curvedlineChart', function(){
        return {
            restrict: 'A',
            link: function(scope, element) {
                
                var d = [];
                var datum;
                for (var i = 0; i<scope.smartsRatingHistory.length; i++) {
                    datum = scope.smartsRatingHistory[i];
                    d.push([Date.parse(datum.date)*1000, datum.rating]);
                }

                var timeRep = function(x) {
                    var original = new Date(parseInt(x/1000));
                    return original.toLocaleDateString();;
                };
                
                /* Chart Options */
    
                var options = {
                    series: {
                        shadowSize: 0,
                        lines: {
                            show: false,
                            lineWidth: 0,
                        },
                    },
                    grid: {
                        borderWidth: 0,
                        labelMargin:10,
                        hoverable: true,
                        clickable: true,
                        mouseActiveRadius:6,

                    },
                    xaxis: {
                        tickDecimals: 0,
                        ticks: false,
                        mode: "time",
                        timeformat: "%y/%m/%d" 
                    },

                    yaxis: {
                        tickDecimals: 0,
                        ticks: false
                    },

                    legend: {
                        show: false
                    }
                };
    
                /* Let's create the chart */

                $.plot($(element), [
                    {data: d, lines: { show: true, fill: 0.98 }, label: 'Smarts Rating', stack: true, color: '#f1dd2c' }
                ], options);

                /* Tooltips for Flot Charts */

                if ($(".flot-chart")[0]) {
                    $(".flot-chart").bind("plothover", function (event, pos, item) {
                        if (item) {
                            var x = item.datapoint[0].toFixed(2),
                                y = item.datapoint[1].toFixed(2);
                            $(".flot-tooltip").html(item.series.label + " on " + timeRep(x) + " was " + y).css({top: item.pageY+5, left: item.pageX+5}).show();
                        }
                        else {
                            $(".flot-tooltip").hide();
                        }
                    });

                    $("<div class='flot-tooltip' class='chart-tooltip'></div>").appendTo("body");
                }
            }
        }
    })


    
    
