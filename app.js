document.addEventListener('DOMContentLoaded', () => {

    ////////////////////////////////////column chart 



    var data=[]
    var chartType='column'
    var chartData=[]
    var monthA=["January","February","March","April","May","June","July",
    "August","September","October","November","December"];
    $.getJSON("https://www.json-generator.com/api/json/get/ceGRWQWhaq?indent=2", function(json) {

       
        var json=json.filter(ele=>ele.category_level1 !== "CREDIT CARD PAYMENTS" && ele.category_level1 !== "NULL")
        console.log(json)
        var monthWiseData=[];


        json.forEach((ele,index)=>{

            var tmonth= new Date(ele.data_dt).getMonth()
                
            if(monthWiseData[tmonth]){
                monthWiseData[tmonth].push(ele);
            }else{
                monthWiseData[tmonth]=[];
                monthWiseData[tmonth].push(ele);
            }
        })
      
        
        getMonthWiseData(monthWiseData)
        $('#sel1').on('change', function (e) {
            // var optionSelected = $("option:selected", this);
            var valueSelected = this.value;
            console.log(valueSelected)
            if (valueSelected == 1) {
                getMonthWiseData(monthWiseData)
            } else {
                getWeekWiseData(monthWiseData, 11)
            }


        });
        $('#chartType').on('change', function (e) {
            // var optionSelected = $("option:selected", this);
            var valueSelected = this.value;
            console.log(valueSelected)
            if (valueSelected == 1) {
                chartType="column"
                drawGraph(chartData)
            }else if (valueSelected == 2) {
                chartType="bar"
                drawGraph(chartData)
            } else if (valueSelected == 3) {
                chartType="line"
                drawGraph(chartData)
            } else if (valueSelected == 4) {
                chartType="pie"
                drawGraph(chartData)
                
            } 

        });
        


        console.log(monthWiseData)
       

    })


    function drawGraph(data){
        Highcharts.chart('container', {
            chart: {
                type: chartType
            },
            title: {
                text: 'Total Spending'
            },
            subtitle: {
                // text: 'Click the columns to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>'
            },
            accessibility: {
                announceNewData: {
                    enabled: true
                }
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: 'Total Amount'
                }
        
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}'
                    }
                }
            },
        
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}'
            },
        
            series: [
                {
                    name: "Spending",
                    colorByPoint: true,
                    data: chartData
                }
            ]
        }); 
    
    }



    ///////////////////////// month wise data
    function getMonthWiseData(monthWiseData){
        var data=[]
        monthWiseData.forEach((ele,ind)=>{

            sum=  monthWiseData[ind].reduce((sum, ele) =>{
                // console.log(sum)
             console.log(parseInt(ele.amount))   
             return parseInt(ele.amount) + sum },0)
             console.log(sum)
                console.log('=======================',monthA[ind])
             data.push({
                 name:monthA[ind],
                 y:sum
             })
             console.log(data)  

        })
        chartData=data
        drawGraph(data)
        // return data;
    }


    function getWeekWiseData(monthWiseData,month){
        // console.log(monthWiseData,month-1)
        var dateWiseData=[]
        var data=[]
        monthWiseData[month-1].forEach((ele,index)=>{

            var date= new Date(ele.data_dt).getDate()
            console.log(date)
                
            if(dateWiseData[date]){
                dateWiseData[date].push(ele);
            }else{
                dateWiseData[date]=[];
                dateWiseData[date].push(ele);
            }
        })
        dateWiseData.forEach((ele,ind)=>{

            sum=  dateWiseData[ind].reduce((sum, ele) =>{
                // console.log(sum)
            //  console.log(parseInt(ele.amount))   
             return parseInt(ele.amount) + sum },0)
            //  console.log(sum)
                // console.log('=======================',monthA[ind])
             data.push({
                 name:ind,
                 y:sum
             })
            //  console.log(data)  

        })
        chartData=data
        drawGraph(data)
        // return data



    }


    ///////////////////column chart ends////////////

    $('#sun').on('change', function (e) {
        var valueSelected = this.value;
        d3.select('.sunburst').selectAll('*').remove()
        drawSunGraph(valueSelected)

    });




    // Reset zoom on canvas click

    drawSunGraph(0)






    /////////////////////////////////////


    function drawSunGraph(month) {

        d3.select('.sunburst').selectAll('*').remove()
        const width = window.innerWidth,
            height = window.innerHeight,
            maxRadius = (Math.min(width, height) / 2) - 5;

        const formatNumber = d3.format(',d');

        const x = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .clamp(true);

        const y = d3.scaleSqrt()
            .range([maxRadius * .1, maxRadius]);

        const color = d3.scaleOrdinal(d3.schemeCategory20);

        const partition = d3.partition();

        const arc = d3.arc()
            .startAngle(d => x(d.x0))
            .endAngle(d => x(d.x1))
            .innerRadius(d => Math.max(0, y(d.y0)))
            .outerRadius(d => Math.max(0, y(d.y1)));

        const middleArcLine = d => {
            const halfPi = Math.PI / 2;
            const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
            const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

            const middleAngle = (angles[1] + angles[0]) / 2;
            const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
            if (invertDirection) { angles.reverse(); }

            const path = d3.path();
            path.arc(0, 0, r, angles[0], angles[1], invertDirection);
            return path.toString();
        };

        const textFits = d => {
            const CHAR_SPACE = 6;

            const deltaAngle = x(d.x1) - x(d.x0);
            const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
            const perimeter = r * deltaAngle;

            return d.data.name.length * CHAR_SPACE < perimeter;
        };

        const svg = d3.select('.sunburst').append('svg')
            .style('width', '90vw')
            .style('height', '90vh')
            .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
            .on('click', () => focusOn());
        console.log(month)
        d3.json('data.json', (error, root) => {
            if (error) throw error;
            console.log(root)
            root = root.filter(ele => ele.category_level1 !== "CREDIT CARD PAYMENTS" && ele.category_level1 !== "NULL")



            if (month == 0) {
                root = root
            } else {

                console.log('hola')
                root = root.filter(ele => ele.data_dt)
                root = root.filter(ele => {
                    // var cMonth=new Date().getMonth()-1
                    var tmonth = new Date(ele.data_dt).getMonth() + 1
                    console.log(month)
                    return month == tmonth;
                    // console.log(cMonth+1)
                })

            }
            console.log(root)
            var abc = removeGarbageData(root, month)


            // console.log(abc)
            root = d3.hierarchy(abc);
            root.sum(d => d.size);

            const slice = svg.selectAll('g.slice')
                .data(partition(root).descendants());

            slice.exit().remove();

            const newSlice = slice.enter()
                .append('g').attr('class', 'slice')
                .on('click', d => {
                    d3.event.stopPropagation();
                    focusOn(d);
                });

            newSlice.append('title')
                .text(d => d.data.name + '\n' + formatNumber(d.value));

            newSlice.append('path')
                .attr('class', 'main-arc')
                .style('fill', d => color((d.children ? d : d.parent).data.name))
                .attr('d', arc);

            newSlice.append('path')
                .attr('class', 'hidden-arc')
                .attr('id', (_, i) => `hiddenArc${i}`)
                .attr('d', middleArcLine);

            const text = newSlice.append('text')
                .attr('display', d => textFits(d) ? null : 'none');

            // Add white contour
            //    text.append('textPath')
            //        .attr('startOffset','50%')
            //        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
            //        .text(d => d.data.name)
            //        .style('fill', 'none')
            //        .style('stroke', '#fff')
            //        .style('stroke-width', 5)
            //        .style('stroke-linejoin', 'round');

            text.append('textPath')
                .attr('startOffset', '50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
                .text(d => d.data.name);
        });

        function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
            // Reset to top-level if no data point specified

            const transition = svg.transition()
                .duration(750)
                .tween('scale', () => {
                    const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]);
                    return t => { x.domain(xd(t)); y.domain(yd(t)); };
                });

            transition.selectAll('path.main-arc')
                .attrTween('d', d => () => arc(d));

            transition.selectAll('path.hidden-arc')
                .attrTween('d', d => () => middleArcLine(d));

            transition.selectAll('text')
                .attrTween('display', d => () => textFits(d) ? null : 'none');

            moveStackToFront(d);

            //

            function moveStackToFront(elD) {
                svg.selectAll('.slice').filter(d => d === elD)
                    .each(function (d) {
                        this.parentNode.appendChild(this);
                        if (d.parent) { moveStackToFront(d.parent); }
                    })
            }
        }
    }



    function stringToDate(_date, _format, _delimiter) {
        var formatLowerCase = _format.toLowerCase();
        var formatItems = formatLowerCase.split(_delimiter);
        var dateItems = _date.split(_delimiter);
        var monthIndex = formatItems.indexOf("mm");
        var dayIndex = formatItems.indexOf("dd");
        var yearIndex = formatItems.indexOf("yyyy");
        var month = parseInt(dateItems[monthIndex]);
        month -= 1;
        var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
        return formatedDate;
    }

    function removeGarbageData(json, month) {
        var allA = []
        var allB = []
        console.log(json)

        var c1Data = json.map((ele) => ele.category_level1)
        function uniqq(a) {
            return Array.from(new Set(a));
        }

        let cat1 = uniqq(c1Data)



        var catSubAraay = [];

        for (var i = 0; i < cat1.length; i++) {

            allA[i] = json.filter(ele => ele.category_level1 == cat1[i])
            catSubAraay[i] = []
            var uArray = []
            for (var j = 0; j < allA[i].length; j++) {

                catSubAraay[i][j] = allA[i][j].category_level2
            }



        }

        catSubAraay = catSubAraay.map((ele) => uniqq(ele))


        ///level 3

        var allC = {}
        var lvl2 = []
        for (var i = 0; i < allA.length; i++) {

            for (var j = 0; j < allA[i].length; j++) {
                lvl2 = allA[i].map(ele => ele.category_level2)

            }
            var c = uniqq(lvl2)
            // console.log(c)

            allC[cat1[i]] = []
            for (var j = 0; j < c.length; j++) {
                allC[cat1[i]][c[j]] = allA[i].filter((ele, i) => {
                    return ele.category_level2 == c[j]
                })

            }

        }

        // console.log(allC)

        var globalObject = {
            name: "Total Spending",
            children: []
        }


        for (const property in allC) {


            globalObject.children.push({
                name: property,
                children: []
            })



        }

        globalObject.children.forEach((ele, index) => {
            //   console.log(allC[ele.name])

            for (const p in allC[ele.name]) {
                // console.log(allC[ele.name][p])
                var internal = [];

                for (const o in allC[ele.name][p]) {
                    internal.push({
                        name: allC[ele.name][p][o].benef_name,
                        size: allC[ele.name][p][o].amount
                    })

                }


                globalObject.children[index].children.push({
                    name: p,
                    children: internal
                })
            }

        })

        return globalObject;

    }

})
