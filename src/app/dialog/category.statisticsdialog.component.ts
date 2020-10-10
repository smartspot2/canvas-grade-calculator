import {AfterViewInit, Component, HostListener, Inject, ViewEncapsulation} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Category} from "../classes/categoryClass";
import * as d3 from "d3";

@Component({
    selector: 'statistics-dialog',
    templateUrl: './category.statisticsdialog.component.html',
    styleUrls: ['./category.statisticsdialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class StatisticsDialog implements AfterViewInit {
    private readonly category;
    private dataset;
    private usePercent;

    private height: number;
    private width: number;

    private x;
    private y;
    private yAxis;

    private margin = {top: 20, right: 20, bottom: 20, left: 20};
    private barWidth;
    private handleWidth;
    private crossWidth;
    private wrapperWidth;
    private dataPointRadius;

    constructor(dialogRef: MatDialogRef<StatisticsDialog>,
                @Inject(MAT_DIALOG_DATA) data: DataObject) {
        this.usePercent = data.usePercent;
        this.category = data.category;
        this.createDataset(data.category);
    }

    ngAfterViewInit(): void {
        this.getScreenSize();
        this.drawChart();
    }

    @HostListener('window:resize', ['$event'])
    getScreenSize() {
        // Scaled down to 80% of w/h
        let graphDiv = d3.select("#graphDiv")
            .node() as HTMLDivElement;
        this.height = graphDiv.getBoundingClientRect().height;
        this.width = graphDiv.getBoundingClientRect().width;
        if (this.barWidth != undefined) {
            this.updateChart(0);
        }
    }

    public toggleUsePercent() {
        this.usePercent = !this.usePercent;
        this.updateChart(250);
    }

    public updateChart(transitionDuration) {
        this.createDataset(this.category);

        this.barWidth = Math.round((this.width - this.margin.left - this.margin.right) / this.dataset.length);
        this.crossWidth = 10;
        this.handleWidth = this.barWidth * 0.5;
        this.wrapperWidth = this.barWidth * 0.8;
        this.dataPointRadius = 5;

        this.x.range([this.margin.left + this.barWidth / 2, this.width - this.margin.right - this.barWidth / 2])
            .domain([0, this.dataset.length - 1]);
        this.y.range([this.height - this.margin.bottom, this.margin.top])
            .domain([0, Math.max(
                d3.max(this.dataset, function (d: Data) {
                    return d.totalPoints
                }),
                d3.max(this.dataset, function (d: Data) {
                    return d.max
                })
            )]);

        // Update chart size
        d3.select('#graphSvg')
            .attr("width", '100%')
            .attr("height", "100%");

        // Update axis
        d3.select(".y")
            .transition().duration(transitionDuration)
            .call(this.yAxis);

        // Update range & mean
        d3.select('#graphSvg')
            .selectAll('.statPath')
            .data(this.dataset)
            .transition().duration(transitionDuration)
            .attr("test", (d: Data) => this.y(d.min))
            .attr("d", (d: Data) => this.getSvgPathD(d));

        // Update data points
        d3.selectAll('.statPoint')
            .data(this.dataset)
            .transition().duration(transitionDuration)
            .attr("cx", (d: Data) => `${this.x(d.index)}`)
            .attr("cy", (d: Data) => `${this.y(d.score)}`)
            .attr("r", `${this.dataPointRadius}`);

        // Update wrapper rect
        d3.select('#graphSvg')
            .selectAll('.statWrapper')
            .data(this.dataset)
            .transition().duration(transitionDuration)
            .attr("x", (d: Data) => this.x(d.index) - this.wrapperWidth / 2)
            .attr("y", (d: Data) => this.y(d.totalPoints))
            .attr("width", this.wrapperWidth)
            .attr("height", (d: Data) => this.y(0) - this.y(d.totalPoints))
            .attr("opacity", (this.usePercent) ? 0 : 0.5);

        // Update tooltip values
        let tooltip = d3.select('#graphDiv').select('.statTooltip');
        d3.select('#graphSvg')
            .selectAll('.statBoundBox')
            .data(this.dataset)
            .attr("x", (d: Data) => this.x(d.index) - this.barWidth / 2)
            .attr("y", this.margin.top)
            .attr("width", this.barWidth)
            .attr("height", this.height - this.margin.top - this.margin.bottom)
            .on("mousemove", event => {
                tooltip.transition()
                    .duration(0)
                    .style("opacity", .9);
                tooltip.html(this.getTooltipHTML(event.target.__data__))
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - Number.parseFloat(tooltip.style('height').slice(0, -2)) - 15) + "px");
            });
    }

    private drawChart() {
        this.barWidth = Math.round((this.width - this.margin.left - this.margin.right) / this.dataset.length);
        this.crossWidth = 10;
        this.handleWidth = this.barWidth * 0.5;
        this.wrapperWidth = this.barWidth * 0.8;
        this.dataPointRadius = 5;

        // Set axis domains

        this.x = d3.scaleLinear()
            .range([this.margin.left + this.barWidth / 2, this.width - this.margin.right - this.barWidth / 2])
            .domain([0, this.dataset.length - 1]);

        this.y = d3.scaleLinear()
            .range([this.height - this.margin.bottom, this.margin.top])
            .domain([0, Math.max(
                d3.max(this.dataset, (d: Data) => d.totalPoints),
                d3.max(this.dataset, (d: Data) => d.max)
            )]);

        // Set axis

        this.yAxis = g => g
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.y)
                .ticks(null)
                .tickSize(-this.width))
            .call(g => g.select(".domain").remove());

        // Tooltip div

        let tooltip = d3.select('#graphDiv')
            .append("div")
            .attr("class", "statTooltip")
            .style("opacity", 0);

        // SVG

        let svg = d3.select('#graphSvg')
            .attr("width", '100%')
            .attr("height", "100%");

        let g = svg.append("g")
            .attr("class", "chartElement")
            .selectAll("g")
            .data(this.dataset)
            .enter();

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

        // Data boxes

        if (!this.usePercent) {
            g.append("rect")
                .attr("class", "statWrapper")
                .attr("opacity", 0.5)
                .attr("x", (d: Data) => this.x(d.index) - this.wrapperWidth / 2)
                .attr("y", (d: Data) => this.y(d.totalPoints))
                .attr("width", this.wrapperWidth)
                .attr("height", (d: Data) => this.y(0) - this.y(d.totalPoints));
        }

        g.append("path")
            .attr("class", "statPath")
            .attr("d", d =>
                this.getSvgPathD(d));

        g.append("circle")
            .attr("class", "statPoint statScore")
            .attr("cx", (d: Data) => `${this.x(d.index)}`)
            .attr("cy", (d: Data) => `${this.y(d.score)}`)
            .attr("r", `${this.dataPointRadius}`);

        // Bounding box for tooltip
        g.append("rect")
            .attr("class", "statBoundBox")
            .attr("x", (d: Data) => this.x(d.index) - this.barWidth / 2)
            .attr("y", this.margin.top)
            .attr("width", this.barWidth)
            .attr("height", this.height - this.margin.top - this.margin.bottom)
            .style("opacity", 0)
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

    private createDataset(cat: Category) {
        this.dataset = [];
        cat.assignments.forEach(asgnmt => {
            if (asgnmt.statistics == undefined) return;

            let newData: Data = {
                name: asgnmt.name,
                score: undefined,
                min: asgnmt.statistics.min,
                mean: asgnmt.statistics.mean,
                max: asgnmt.statistics.max,
                totalPoints: asgnmt.getTotalPoints(),
                index: this.dataset.length
            };

            if (this.usePercent && asgnmt.getTotalPoints() != null) {
                if (asgnmt.getRecievedPoints() != null) {
                    newData.score = asgnmt.getRecievedPoints() / asgnmt.getTotalPoints() * 100;
                }
                newData.min *= 100 / asgnmt.getTotalPoints();
                newData.mean *= 100 / asgnmt.getTotalPoints();
                newData.max *= 100 / asgnmt.getTotalPoints();
            } else if (!this.usePercent && asgnmt.getRecievedPoints() != null) {
                newData.score = asgnmt.getRecievedPoints();
            }

            if (newData.score != undefined) {
                this.dataset.push(newData);
            }
        });
    }

    private getTooltipHTML(d: any) {
        return `
            <h4>${d.name}</h4>
            Score: ${Number.parseFloat(d.score.toFixed(4)) + (this.usePercent ? '%' : '')} <br>
            Max: ${Number.parseFloat(d.max.toFixed(4)) + (this.usePercent ? '%' : '')} <br>
            Mean: ${Number.parseFloat(d.mean.toFixed(4)) + (this.usePercent ? '%' : '')} <br>
            Min: ${Number.parseFloat(d.min.toFixed(4)) + (this.usePercent ? '%' : '')}
        `
    }

    private getSvgPathD(d: any) {
        // Range
        return `M ${this.x(d.index)},${this.y(d.min)}
                V ${this.y(d.max)}
                `
            // Min
            + `M ${this.x(d.index) - this.handleWidth / 2},${this.y(d.min)}
                H ${this.x(d.index) + this.handleWidth / 2}
                `
            // Mean
            + `M ${this.x(d.index) - this.crossWidth / 2},${this.y(d.mean) - this.crossWidth / 2}
                l ${this.crossWidth},${this.crossWidth}
                M ${this.x(d.index) + this.crossWidth / 2},${this.y(d.mean) - this.crossWidth / 2}
                l ${-this.crossWidth},${this.crossWidth}
                `
            // Max
            + `M ${this.x(d.index) - this.handleWidth / 2},${this.y(d.max)}
                H ${this.x(d.index) + this.handleWidth / 2}
            `
    }
}

class DataObject {
    public category: Category;
    public usePercent: boolean;
}

class Data {
    public name: string;
    public score: number;
    public min: number;
    public mean: number;
    public max: number;
    public totalPoints: number;
    public index: number;
}
