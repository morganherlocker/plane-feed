var readline = require('readline');
var fs = require('fs')
var turf = require('turf')
var moment = require('moment')

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

var currentFile = ''
var pings = []
var ping = []
rl.on('line', function (line) {
  if(line === '') {
    var adsb = processChunk(ping)

    var time = moment()
    var year = time.format('YYYY')
    var month = time.format('MM')
    var day = time.format('DD')
    var hours = time.format('HH')

    var file = __dirname + '/out/'+year+'-'+month+'-'+day+'-'+hours+'.geojson'
    if(file !== currentFile) {
      pings = []
      currentFile = file
    }

    if(adsb) pings.push(adsb)

    var routes = createRoutes(pings)

    fs.writeFileSync(file, JSON.stringify(routes))
    ping = []
  } else {
    ping.push(line)
  }
})

function createRoutes(pts) {
  var planes = {}
  pts.forEach(function(pt){
    if(!planes[pt.id]) planes[pt.id] = turf.linestring([], {id: pt.id, alts: [], times: []})
    planes[pt.id].geometry.coordinates.push([pt.lon, pt.lat])
    planes[pt.id].properties.alts.push(pt.alt)
    planes[pt.id].properties.times.push(pt.time)
  })

  var fc = turf.featurecollection([])
  Object.keys(planes).forEach(function(id){
    if(planes[id].geometry.coordinates.length > 1) fc.features.push(planes[id])
  })
  return fc
}

function processChunk (chunk) {
  if(chunk[2].indexOf('ADS-B') !== -1){
    var adsb = {
      id: '',
      lat: 0,
      lon: 0
    }
    chunk.forEach(function(line){
      var key = line.split(':')[0].split(' ').join('')
      if(key === 'ICAOAddress') {
        adsb.id = line.split(':')[1].split(' ').join('')
      } else if(key === 'Latitude' && 
              line.split(':')[1].split(' ').join('').indexOf('(not decoded)') === -1) {
        adsb.lat = parseFloat(line.split(':')[1].split(' ').join(''))
      } else if(key === 'Longitude' && 
              line.split(':')[1].split(' ').join('').indexOf('not') === -1) {
        adsb.lon = parseFloat(line.split(':')[1].split(' ').join(''))
      } else if(key === 'Altitude'){
        adsb.alt = parseFloat(line.split(':')[1].split(' ').join(''))
      }
      adsb.time = moment().format('HH:mm:ss')
    })

    if(adsb.lat && adsb.lon) return adsb
  }
}