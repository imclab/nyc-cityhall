## Level 0: Log in 

#### SQL

* username TEXT
* password TEXT
* date TEXT
 

```sql
SELECT log_in('demo','aaa','2014-03-03T00:00:00+00:00') AS token
```

#### Example response

```json
{"time":0.015,
 "fields":{"token":{"type":"text"}},
 "total_rows":1,
 "rows":[{"token":1,"cdfdbcb0e4ed8ce3604c8f9fe7d6b1a7"}]}:
```

## Level 1: Menu

#### SQL

* token TEXT
* cache_buster TEXT

```
select * FROM data_overview('0a6dadd0123676f4830340de8d382cd4', '2014-03-03')
```

#### Example response

```json
rows: [
	{
		agency: "NYPD",
		interest_type: "government",
		measure_type: "basic services",
		indicator_name: "robbery ",
		indicator_id: "robbery",
		geog_type1: "points",
		geog_type2: null,
		frequency: "weekly",
		full_green_percent: -2.5,
		has_historical_geo: true,
		recording_units: "value",
		display_units: "seconds",
		current: 30,
		previous: 12,
		current_fytd: 321,
		previous_fytd: 345,
		previous_year_period: 28,
		date: "03/03/2014"
	},
	{
		agency: "NYPD",
		interest_type: "government",
		measure_type: "basic services",
		indicator_name: "major felony crime",
		indicator_id: "major_felony_crime",
		geog_type1: "nypp",
		geog_type2: "nycd",
		frequency: "weekly",
		full_green_percent: -1.25,
		has_historical_geo: false,
		recording_units: "percent",
		display_units: "percent",
		current: -0.2,
		previous: -1.1,
		current_fytd: 0.1,
		previous_fytd: -0.1,
		previous_year_period: 0.1,
		date: "03/03/2014"
	}
]
```

** Sort by ** 

has_historical_geo when TRUE, means that we can show a % change map. if it is false, only the raw value map is possible.

Always works by the (full_green_percent - "Main value"). I'll show you how to calculate the main value below.

Now, let's look at the Three menu options for 'TIMEFRAME'. These change the values displayed in the cards. 

##### Fiscal Year To Date

*robbery (recording_units = "value")*

| value | calculation |
|:------:|:-------:|
|Main value | 100 * (1.0 - (current_fytd / previous_fytd)) + "%" |
|Bottom left | current_fytd |
|Bottom right | previous_fytd |

*major_felony_crime (recording_units = "percent")*

| value | calculation |
|:------:|:-------:|
|Main value|  (current_fytd - previous_fytd) + "%"|
|Bottom left| current_fytd + "%"|
|Bottom right| previous_fytd + "%"|

##### Same period last year

*robbery (recording_units = "value")*

| value | calculation |
|:------:|:-------:|
|Main value|  100 * (1.0 - (current / previous_year_period)) + "%"|
|Bottom left| current|
|Bottom right| previous_year_period|

*major_felony_crime (recording_units = "percent")*

| value | calculation |
|:------:|:-------:|
|Main value|  (current - previous_year_period) + "%"|
|Bottom left| current + "%"|
|Bottom right| previous_year_period + "%"|

##### Last month/day/year

*robbery (recording_units = "value")*

| value | calculation |
|:------:|:-------:|
|Main value|  100 * (1.0 - (current / previous)) + "%"|
|Bottom left| current|
|Bottom right| previous|

*major_felony_crime (recording_units = "percent")*

| value | calculation |
|:------:|:-------:|
|Main value|  (current - previous) + "%"|
|Bottom left| current + "%"|
|Bottom right| previous + "%"|

## Level 2: Map


#### SQL

* indicator_id TEXT
* geog_type TEXT (verbatum from the geog_type1  or geog_type2 response)
* date TEXT
* token TEXT
* cache_buster TEXT

Date is the date to compare for your data. If NULL, add data is returned. 

```
select * FROM get_agg_geo(indicator_id, geog_type, date, token, buster)
```

#### Example in cartodb.js SQL request

```javascript
      function main() {
        var map = new L.Map('map', { 
          zoomControl: false,
          center: [40.7, -74],
          zoom: 11
        });

        L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
          attribution: 'Stamen'
        }).addTo(map);

        var indicator_id = "robbery",
            geog_type1 = "nypp",
            date = "03/03/2014",
            buster = "03/04/2014",
            token = "a5a35ecf6876cffd1f283780d7bc89a9";

        var sql = "WITH indicator AS (" +
                  "SELECT * FROM get_agg_geo('"+indicator_id+"','"+geog_type1+"','"+date+"','"+token+"','"+buster+"'))" +
                  "SELECT g.cartodb_id, g.the_geom, g.geo_id, g.name, g.the_geom_webmercator, i.value, i.percent_change FROM "+geog_type1+" g LEFT OUTER JOIN indicator i ON (g.geo_id = i.geo_id)";
                  console.log(sql)
        // TODO, cartocss will need to be calculated better..
        var cartocss = '#'+geog_type1+' {polygon-fill: #FF0000; line-color: #000; polygon-opacity: 0.8; [value = null] {polygon-fill: #777;}}';
        // create a layer with 1 sublayer
        cartodb.createLayer(map, {
          user_name: 'nyc-cityhall',
          type: 'cartodb',
          sublayers: [{
            sql: sql,
            cartocss: cartocss
          }]
        }).done(function(layer) {
          // add the layer to our map which already contains 1 sublayer
          map.addLayer(layer);
        });
      }

      window.onload = main;
```




