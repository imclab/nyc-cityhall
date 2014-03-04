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
SELECT * FROM data_overview('cdfdbcb0e4ed8ce3604c8f9fe7d6b1a7') 
```

#### Example response

```json
rows: [
{
agency: "NYPD",
indicator_name: "robbery ",
indicator_id: "robbery",
frequency: "weekly",
full_green_percent: -2.5,
change: -4.5
},
{
agency: "NYPD",
indicator_name: "major felony crime",
indicator_id: "major_felony_crime",
frequency: "weekly",
full_green_percent: 50,
change: -1.1
}
]
```


