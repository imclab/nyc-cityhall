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
		recording_units: "value",
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
		recording_units: "percent",
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

Always works by the (full_green_percent - "Main value"). I'll show you how to calculate the main value below.

Now, let's look at the Three menu options for 'TIMEFRAME'. These change the values displayed in the cards. 

##### Fiscal Year To Date

*robbery (recording_units = "value")*

| value | calculation |
|*------*|*-------*|
|Main value | 100 * (1.0 - (current_fytd / previous_fytd)) + "%" |
|Bottom left | current_fytd |
|Bottom right | previous_fytd |

*major_felony_crime (recording_units = "percent")*

Main value:  (current_fytd - previous_fytd) + "%"
Bottom left: current_fytd + "%"
Bottom right: previous_fytd + "%"

##### Same period last year

*robbery (recording_units = "value")*

Main value:  100 * (1.0 - (current / previous_year_period)) + "%"
Bottom left: current
Bottom right: previous_year_period

*major_felony_crime (recording_units = "percent")*

Main value:  (current - previous_year_period) + "%"
Bottom left: current + "%"
Bottom right: previous_year_period + "%"

##### Last month/day/year

*robbery (recording_units = "value")*

Main value:  100 * (1.0 - (current / previous)) + "%"
Bottom left: current
Bottom right: previous

*major_felony_crime (recording_units = "percent")*

Main value:  (current - previous) + "%"
Bottom left: current + "%"
Bottom right: previous + "%"





