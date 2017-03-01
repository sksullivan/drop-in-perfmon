'use strict';

const $ = require('jquery')

const Data = {}

Data.HOST_UP = false
Data.HOST = '141.142.210.5'
const TABLE_ALLOWED_FIELDS = ['pid','user','task','mem%','cpu%']
const MAX_HISTORY_LENGTH = 300

Data.TABLE_ALLOWED_FIELDS = TABLE_ALLOWED_FIELDS

Data.history = Array(MAX_HISTORY_LENGTH).fill(
    [TABLE_ALLOWED_FIELDS
      .map(field => {
        const partialFieldsObject = {}
        partialFieldsObject[field] = 0.0
        return partialFieldsObject
      })
      .reduce((prev,curr) => Object.assign(prev,curr),{})])

Data.addState = stats => {
  Data.history.push(stats)
  if (Data.history.length > MAX_HISTORY_LENGTH) {
    Data.history.shift()
  }
}

Data.sumStat = (stats,statName) => {
	return stats.map(function (statDict) {
		return 0 || parseFloat(statDict[statName])
	}).reduce(function (prev,curr) {
		return prev+curr
	},0)
}

Data.setHost = host => { Data.HOST = host }

Data.load = function (successCallback,failureCallback) {
  $.ajax({
    url: 'http://'+Data.HOST+':5000/api/stats?'+$.param({sort: 'cpu%,mem%'}),
  }).done(function (statsString) {
    const stats = JSON.parse(statsString)
    Data.addState(stats)
    Data.HOST_UP = true;
    successCallback(Data.history[Data.history.length-1])
  }).fail(function (jqxhr,text,e) {
    Data.HOST_UP = false
    failureCallback()
  })
}

export default Data
