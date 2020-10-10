import {AfterViewInit, Component, HostListener, Inject, ViewEncapsulation} from "@angular/core";
import * as d3 from "d3";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Category} from "../classes/categoryClass";

@Component({
    selector: 'grade-trend-dialog',
    templateUrl: './gradetrenddialog.component.html',
    styleUrls: ['./gradetrenddialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GradeTrendDialog implements AfterViewInit {

    private categories;
    private dataset;
    private histBins;

    private height: number;
    private width: number;

    private x;
    private xAxis;
    private y;
    private yAxis;

    private afterInit = false;

    private margin = {top: 50, right: 50, bottom: 50, left: 50};
    // private gapWidth;
    private dataPointRadius = 5;

    constructor(dialogRef: MatDialogRef<GradeTrendDialog>,
                @Inject(MAT_DIALOG_DATA) data: DataObject) {
        this.categories = data.categories;
        this.createDataset();
    }

    // d3.line()
    // .x((d: any) => this.x((d.x1 - d.x0)/2))
    // .y((d: any) => this.y((d[d.length - 1] != undefined) ? d[d.length - 1].curGrade : 0));

    ngAfterViewInit(): void {
        this.getScreenSize();
        this.afterInit = true;
        this.drawChart();
    }

    @HostListener('window:resize', ['$event'])
    getScreenSize() {
        // Scaled down to 80% of w/h
        let graphDiv = d3.select("#trendGraphDiv")
            .node() as HTMLDivElement;
        this.height = graphDiv.getBoundingClientRect().height;
        this.width = graphDiv.getBoundingClientRect().width;
        if (this.afterInit) {
            this.updateChart(0);
        }
    }

    private dataLine = function (bins) {
        let finalStr = ``;
        let self = this;
        for (let i = 0; i < bins.length; i++) {
            let data: any = bins[i];
            if (data.length > 0) {
                finalStr += `
                    L(${self.x((data.x1 - data.x0) / 2)}, ${self.y(data[data.length - 1].curGrade)})
                `;
            }
        }
        return finalStr;
    };

    private drawChart() {
        console.log("draw chart");
        this.dataPointRadius = 5;

        // Set axis domains

        this.x = d3.scaleTime()
            .range([this.margin.left, this.width - this.margin.right])
            .domain([
                d3.min(this.dataset, (d: Data) => d.date.getTime()),
                d3.max(this.dataset, (d: Data) => d.date.getTime())
            ])
            .nice();

        let minGrade = d3.min(this.dataset, (d: Data) => d.curGrade);
        let maxGrade = d3.max(this.dataset, (d: Data) => d.curGrade);

        this.y = d3.scaleLinear()
            .range([this.height - this.margin.bottom, this.margin.top])
            .domain([
                minGrade - 0.1 * (maxGrade - minGrade),
                maxGrade + 0.1 * (maxGrade - minGrade)
            ])
            .nice();

        // Set axis

        this.xAxis = g => g
            .attr("transform", `translate(0, ${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.x)
                .ticks(null)
                .tickSize(-this.height + this.margin.bottom + this.margin.top))
            .call(g => g.select(".domain").remove());

        this.yAxis = g => g
            .attr("transform", `translate(${this.margin.left}, 0)`)
            .call(d3.axisLeft(this.y)
                .ticks(null)
                .tickSize(-this.width + this.margin.left + this.margin.right))
            .call(g => g.select(".domain").remove());

        // Tooltip div

        let tooltip = d3.select('#trendGraphDiv')
            .append("div")
            .attr("class", "trendGraphTooltip")
            .style("opacity", 0);

        // Bins
// debugger;
        this.histBins = d3.histogram<Data, Date>()
            .domain(this.x.domain)
            .thresholds(this.x.ticks())
            .value((d: Data) => d.date)
            (this.dataset);

        console.log("histbins");
        console.log(this.histBins);

        // SVG

        let svg = d3.select('#trendGraphSvg')
            .attr("width", '100%')
            .attr("height", "100%");

        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .call(this.xAxis)
            .each(function () {
                let firstChild = this.parentNode.firstChild;
                if (firstChild) {
                    this.parentNode.insertBefore(this, firstChild);
                }
            });

        // y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis)
            .each(function () {
                let firstChild = this.parentNode.firstChild;
                if (firstChild) {
                    this.parentNode.insertBefore(this, firstChild);
                }
            });

        svg.append("path")
            .attr("class", "trendLine")
            .attr("d", this.dataLine(this.dataset));

        let g = svg.append("g")
            .attr("class", "chartElement")
            .selectAll("g")
            .data(this.dataset)
            .enter();

        g.append("circle")
            .attr("class", "trendPoint")
            .attr("cx", (d: Data) => {
                console.log(d.date);
                console.log(this.x(d.date));
                return `${this.x(d.date)}`
            })
            .attr("cy", (d: Data) => `${this.y(d.curGrade)}`)
            .attr("r", this.dataPointRadius)
            .on("mousemove", event => {
                tooltip.transition()
                    .duration(0)
                    .style("opacity", .9);
                tooltip.html(this.getTooltipHTML(event.target.__data__))
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - +tooltip.style('height').slice(0, -2) - 15) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(0)
                    .style("opacity", 0);
                tooltip.style("left", -tooltip.style('width').slice(0, -2) - 50 + "px")
                    .style("top", -tooltip.style('height').slice(0, -2) - 50 + "px");
            });

    }

    private getTooltipHTML(d: any) {
        let formatDate = d3.timeFormat("%x");
        let finalStr = "";
        for (let i = 0; i < d.length; i++) {
            finalStr += `
            <h4>${d.name}</h4>
            Score: ${Number.parseFloat(d.score.toFixed(4))}% <br>
            Date: ${formatDate(d.date)} <br>
            Cumulative Grade: ${Number.parseFloat(d.curGrade.toFixed(4))}%
        `;
        }
        return finalStr;
    }

    private updateChart(transitionDuration) {
        this.createDataset();

        // Update x and y axis/scale
        this.x = d3.scaleTime()
            .range([this.margin.left, this.width - this.margin.right])
            .domain([
                d3.min(this.dataset, (d: Data) => d.date.getTime()),
                d3.max(this.dataset, (d: Data) => d.date.getTime())
            ]);

        let minGrade = d3.min(this.dataset, (d: Data) => d.curGrade);
        let maxGrade = d3.max(this.dataset, (d: Data) => d.curGrade);

        this.y = d3.scaleLinear()
            .range([this.height - this.margin.bottom, this.margin.top])
            .domain([
                minGrade - 0.1 * (maxGrade - minGrade),
                maxGrade + 0.1 * (maxGrade - minGrade)
            ]);

        // Update SVG size
        d3.select('#trendGraphSvg')
            .attr("width", '100%')
            .attr("height", "100%");

        // Update x and y axis
        d3.select(".x")
            .transition().duration(transitionDuration)
            .call(this.xAxis);
        d3.select(".y")
            .transition().duration(transitionDuration)
            .call(this.yAxis);

        // Update trend line
        d3.select("#trendGraphSvg")
            .selectAll(".trendLine")
            .transition().duration(transitionDuration)
            .attr("d", this.dataLine(this.dataset));

        // Update tooltip

        let tooltip = d3.select('#trendGraphDiv').select('.trendGraphTooltip');
        d3.selectAll(".trendPoint")
            .data(this.dataset)
            .attr("cx", (d: Data) => `${this.x(d.date)}`)
            .attr("cy", (d: Data) => `${this.y(d.curGrade)}`)
            .on("mousemove", event => {
                tooltip.transition()
                    .duration(0)
                    .style("opacity", .9);
                tooltip.html(this.getTooltipHTML(event.target.__data__))
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - +tooltip.style('height').slice(0, -2) - 15) + "px");
            });
    }

    private createDataset() {
        console.log("create dataset");
        this.dataset = [];
        let dateParser = d3.timeParse("%b %-d %I:%M%p");
        let dateParserNoMin = d3.timeParse("%b %-d %I%p");

        this.categories.forEach(cat => {
            let catName = cat.name;
            cat.assignments.forEach(asgnmt => {
                let newData: Data = {
                    name: asgnmt.name,
                    score: undefined,
                    scoreArr: undefined,
                    date: undefined,
                    curGrade: undefined,
                    categoryName: catName
                };

                let curDate = asgnmt.due;
                if (curDate != undefined) {
                    if (curDate.includes("Due")) {
                        curDate = curDate.split(' ').slice(1, 4).join(' ');
                    }

                    curDate = curDate.replace(" at ", " ").replace(" by ", " ");

                    if (curDate.includes(":")) {
                        newData.date = dateParser(curDate);
                    } else {
                        newData.date = dateParserNoMin(curDate);
                    }

                    if (newData.date != null) {
                        // Adjust year
                        newData.date.setFullYear(new Date().getFullYear());
                        if (newData.date.getTime() > (new Date()).getTime()) {
                            // Assignment is after current date, so subtract one from year
                            newData.date.setFullYear(newData.date.getFullYear() - 1);
                        }
                    }

                    console.log(curDate);
                } else {
                    newData.date = new Date();
                }

                if (asgnmt.getTotalPoints() != null && asgnmt.getRecievedPoints() != null) {
                    newData.score = 100 * asgnmt.getRecievedPoints() / asgnmt.getTotalPoints();
                    newData.scoreArr = asgnmt.score;
                }

                if (newData.date != undefined && newData.score != undefined) {
                    this.dataset.push(newData);
                }
            })
        });

        // Add cumulative scores for each assignment
        this.dataset.sort((d1: Data, d2: Data) => d1.date.getTime() - d2.date.getTime());
        console.log(this.dataset);

        this.calculateCumulativeGrade();
    }

    private calculateCumulativeGrade() {
        let catBuckets = {};
        let catWeights = {};
        this.categories.forEach(cat => {
            catBuckets[cat.name] = [];
            catWeights[cat.name] = cat.weight;
        });

        this.dataset.forEach((d: Data) => {
            catBuckets[d.categoryName].push(d.scoreArr);

            // Calculate grade and set to data
            let catGrades = {};
            Object.getOwnPropertyNames(catBuckets).forEach(catName => {
                let curPts = 0;
                let curTotal = 0;
                catBuckets[catName].forEach(arr => {
                    curPts += arr[0];
                    curTotal += arr[1];
                });
                catGrades[catName] = ((curTotal == 0 ? null : catWeights[catName] * curPts / curTotal));
            });

            let totalWeights = 0;
            let totalGrade = 0;
            Object.getOwnPropertyNames(catGrades).forEach(catName => {
                if (catGrades[catName] != null) {
                    totalWeights += catWeights[catName];
                    totalGrade += catGrades[catName];
                }
            });

            d.curGrade = 100 * totalGrade / totalWeights;
        });

        console.log(this.dataset);
    }

}

class DataObject {
    public categories: Category[];
}

class Data {
    public name: string;
    public date: Date;
    public scoreArr: number[];
    public score: number;
    public categoryName: string;
    public curGrade: number;
}
