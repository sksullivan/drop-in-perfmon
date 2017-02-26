const Data = {}

const ALLOWED_FIELDS = ['pid','user','task','mem%','cpu%']
const MAX_HISTORY_LENGTH = 300

Data.ALLOWED_FIELDS = ALLOWED_FIELDS

Data.history = Array(MAX_HISTORY_LENGTH).fill(
    [ALLOWED_FIELDS
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

Data.load = function (cb) {
 	$.get('api/stats?'+$.param({sort: 'cpu%,mem%'})).done(function (statsString) {
		const stats = JSON.parse(statsString)
    Data.addState(stats)
    cb(Data.history[Data.history.length-1])
	})
}

export default Data
