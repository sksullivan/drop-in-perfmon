'use strict';

const d3 = require('d3')
const $ = require('jquery')
window.jQuery = $
window.$ = $

import Data from './data.js'

const App = {}

var HOST_NAME = "rstudio"
const HOSTS = {
  'violet': '141.142.209.140',
  'netshare': '141.142.209.255',
  'iforge-proto': '141.142.209.141',
  'rstudio':'141.142.210.5',
}
var HOST = HOSTS[HOST_NAME]
const TABLE_ALLOWED_FIELDS = Data.TABLE_ALLOWED_FIELDS
const GRAPH_ALLOWED_FIELDS = ['cpu%','mem%']
const HIGHLIGHT_KEY = 'mem%'
const GRAPH_FIELDS = {
  '#top-graph': 'cpu%',
  '#bottom-graph': 'mem%',
}
const GRAPH_IDS = $('.chart').map((i,node) => '#'+$(node).attr('id'))
const STAT_DOMAINS = {
  'mem%': [0,100],
  'cpu%': [0,400],
}
const GRAPH_INTERPOLATION_METHODS = {
  '#top-graph': d3.curveLinear,
  '#bottom-graph': d3.curveStep,
}


App.drawChart = (id,history,statName) => {
	d3.select(id).select('svg').remove()

	const data = history.map(stats => Data.sumStat(stats,statName))

	const m = [20, 20, 20, 20]; // margins
	const w = $(id).width() - m[1] - m[3]; // width
	const h = $(id).height() - m[0] - m[2]; // height

	const x = d3.scaleLinear().domain([0,history.length]).range([0,w])
	const y = d3.scaleLinear().domain(STAT_DOMAINS[statName]).range([h,0])

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
		.curve(GRAPH_INTERPOLATION_METHODS[id])
		.x((d,i) => x(i))
		.y((d,i) => y(d))
  
	graph.append('svg:path')
		.attr('d', line(data))
}

App.drawTable = stats => {
	d3.select('#info-table').select('table').remove()

	const columnNames = Object.keys(stats[0]).filter(field => TABLE_ALLOWED_FIELDS.indexOf(field) != -1)
	const table = d3.select('#info-table').append('table')
	const thead = table.append('thead').append('tr')
		.selectAll('th')
		.data(columnNames).enter().append('th').text(d => d)

	const processColor = d3.scaleLinear().domain([0,50])
        .range(['#D8D9DA', '#E44C3C']);
	const tbody = table.append('tbody')
		.selectAll('tr').data(stats).enter().append('tr').style('color',d => processColor(d[HIGHLIGHT_KEY]))
		.selectAll('td').data(processData => Object.keys(processData).filter(field => TABLE_ALLOWED_FIELDS.indexOf(field) != -1).map(field => processData[field])).enter().append('td').text(d => d)
}

App.setPageTitle = stats => {
	document.title = HOST_NAME+" C:"+Data.sumStat(stats,'cpu%').toFixed(0)+"% M:"+Data.sumStat(stats,'mem%').toFixed(0)+"%"
}

App.setupTitles = _ => {
  $.each($('span h3'),(i,node) => $(node).html(GRAPH_FIELDS['#'+$(node).closest('div').find('.chart').attr('id')]))
  $('.graph-opts').html('<span>'+GRAPH_ALLOWED_FIELDS.join('</span> / <span>')+'</span>')
  $('.graph-opts span').click(e => {
    GRAPH_FIELDS['#'+$(e.target).closest('div').find('.chart').attr('id')] = e.target.textContent
    App.setupTitles()
  })
  $('.host-opts').html('<span>'+Object.keys(HOSTS).join('</span> / <span>')+'</span>')
  $('.host-opts span').click(e => {
    App.enterLoading()
    Data.reset()
    HOST_NAME = e.target.textContent
    HOST = HOSTS[e.target.textContent]
    Data.setHost(HOST)
    App.setupTitles()
  })
}

App.enterLoading = _ => {
  $('table ').html('<tr class="fa"><td><i class="fa fa-cog fa-spin fa-3x fa-fw"></i></td></tr>')
  $('.chart').html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>')
  $('.fa').show()
  App.loading = true
}


App.exitLoading = success => {
  if (success) {
    $('.fa').remove()
  } else {
    $('table ').html('<tr class="fa"><td><i class="fa fa-cog fa-spin fa-3x fa-fw"></i></td></tr>')
    $('.chart').html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>')

    $('.fa-cog').addClass('fa-times')
    $('.fa-cog').removeClass('fa-cog')
    $('.fa-spin').removeClass('fa-spin')
    $('.fa-times').addClass('red')
  }
  App.loading = false
}

App.setupTitles()
App.enterLoading()
Data.setHost(HOST)
setInterval(_ => {
  Data.load(stats => {
    App.exitLoading(true)
    App.drawTable(stats)
  	$('h1').html("PERF: "+HOST_NAME+" ( "+HOST+" )")
		GRAPH_IDS.map((i,id) => App.drawChart(id,Data.history,GRAPH_FIELDS[id]))
		App.setPageTitle(stats)
	},_ => {
    App.exitLoading(false)
    $('h1').html('PERF: '+HOST_NAME+' ( <b class="red">OFFLINE</b> )')
  })
},1000)

export { App }
