# plane-feed

Aggregate plane routes from realtime [ads-b](http://en.wikipedia.org/wiki/Automatic_dependent_surveillance_%E2%80%93_broadcast) data generated by [dump1090](https://github.com/MalcolmRobb/dump1090).

![](http://i.imgur.com/6Y0Q0fa.png)

## install

```
git clone git@github.com:morganherlocker/plane-feed.git
cd plane-feed
npm install
```

## run

```
dump1090 | node index.js
```

This will create hourly geojson files with aggregated route data in `./out`. Each LineString has properties containing arrays of altitudes (feet) and times (HH:MM:SS) corresponding to each coordinate.
