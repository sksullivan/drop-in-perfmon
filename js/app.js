'use strict';

const d3 = require('d3')
import Data from './data.js'

const App = {}

const HOST = "host"
const ALLOWED_FIELDS = ['pid','user','task','mem%','cpu%']
const HIGHLIGHT_KEY = 'mem%'

App.drawChart = (id,history) => {
	d3.select(id).select('svg').remove()

	const data = history.map(stats => Data.sumStat(stats,'cpu%'))

	const m = [20, 20, 20, 20]; // margins
	const w = $(id).width() - m[1] - m[3]; // width
	const h = $(id).height() - m[0] - m[2]; // height

	const x = d3.scaleLinear().domain([0,history.length]).range([0,w])
	const y = d3.scaleLinear().domain([0,100]).range([h,0])

	const graph = d3.select(id)
    .append('svg:svg')
			.attr("width", w + m[1] + m[3])
			.attr("height", h + m[0] + m[2])
		.append('svg:g')
			.attr("transform", "translate(" + m[3] + "," + m[0] + ")")

	const area = d3.area().x((d,i) => x(i)).y0(h).y1((d) => y(d))
	graph.append('path')
		.datum(data).attr('class','area').attr('d',area)

	const xAxis = d3.axisBottom().scale(x).tickSize(-h)
	graph.append("svg:g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

	const yAxisLeft = d3.axisLeft().scale(y).tickSize(-w)
	graph.append("svg:g")
		.attr("class", "grid")
		.attr("transform", "translate(0,0)")
		.call(yAxisLeft);
	
	const line = d3.line()
		.curve(d3.curveStep)
		.x((d,i) => x(i))
		.y((d,i) => y(d))
  
	graph.append('svg:path')
		.attr('d', line(data))
}

App.drawTable = stats => {
	d3.select('#info-table').select('table').remove()

	const columnNames = Object.keys(stats[0]).filter(field => ALLOWED_FIELDS.indexOf(field) != -1)
	const table = d3.select('#info-table').append('table')
	const thead = table.append('thead').append('tr')
		.selectAll('th')
		.data(columnNames).enter().append('th').text(d => d)

	const processColor = d3.scaleLinear().domain([0,50])
        .range(['#D8D9DA', '#E44C3C']);
	const tbody = table.append('tbody')
		.selectAll('tr').data(stats).enter().append('tr').style('color',d => processColor(d[HIGHLIGHT_KEY]))
		.selectAll('td').data(processData => Object.keys(processData).filter(field => ALLOWED_FIELDS.indexOf(field) != -1).map(field => processData[field])).enter().append('td').text(d => d)
}

App.setPageTitle = stats => {
	document.title = HOST+" C:"+Data.sumStat(stats,'cpu%').toFixed(0)+"% M:"+Data.sumStat(stats,'mem%').toFixed(0)+"%"
}

setInterval(_ => {
	Data.load(stats => {
		App.drawTable(stats)
		App.drawChart('#cpu-graph',Data.history)
		App.setPageTitle(stats)
	})
},1000)

export { App }
