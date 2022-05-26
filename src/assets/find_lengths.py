import json

json1_file = open('big_countries.json')
json1_str = json1_file.read()
countries = json.loads(json1_str)


max_len = 0
min_len = 100

res = []
for c in countries:
    max_len = max( max_len, max(len(c["properties"]["ADMIN"]), len(c["properties"]["capital_city"]) ) )
    min_len = min( min_len, min(len(c["properties"]["ADMIN"]), len(c["properties"]["capital_city"]) ) )

    res.append({
        "max": max(len(c["properties"]["ADMIN"]), len(c["properties"]["capital_city"])),
        "name": c["properties"]["ADMIN"],
        "N len": len(c["properties"]["ADMIN"]),
        "C len": len(c["properties"]["capital_city"])
    })

#print(max_len)
#print(min_len)

res = sorted(res, key=lambda d: d['max']) 

for r in res:
    print(r)

