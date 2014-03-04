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

```
WITH cache_buster AS (SELECT '2014-03-03')
select * FROM data_overview('0a6dadd0123676f4830340de8d382cd4')
```

#### Example response

```json
rows: [
{
agency: "NYPD",
interest_type: "government",
indicator_name: "robbery ",
indicator_id: "robbery",
frequency: "weekly",
full_green_percent: -2.5,
monthly_percent: -4.5,
weekly_percent: -1.2,
yearly_percent: null,
year_ago_percent: null
},
{
agency: "NYPD",
interest_type: "government",
indicator_name: "major felony crime",
indicator_id: "major_felony_crime",
frequency: "weekly",
full_green_percent: -1.25,
monthly_percent: -1.1,
weekly_percent: -0.2,
yearly_percent: -0.1,
year_ago_percent: 0.1
}
]
```


