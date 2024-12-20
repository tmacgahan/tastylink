#!/bin/bash

# this isn't meant to be used as a regular repair script, because you would
# want to verify that you have good objects in cache.  In this case, we failed
# to request the s column, and the fact that we have a response at all indicates
# that these items should have an s: ok
findBrokenFiles() {
	for file in $( find ../cache | grep json ) ; do
		echo "$file $(cat $file | jq .s)"
	done | grep null | sed 's/ null.*$//'
}

findBrokenFiles

exit 0

for file in $(findBrokenFiles) ; do
	cat $file | sed 's/{/{"s":"ok",/' > tmp
	#cat tmp | jq ".optionSymbol[0]" # would be non-null if this thing is actually healthy
	mv tmp $file
done

# cat chain.SPY.2024-12-06_2027-01-15.json | sed 's/{/{"s":"ok"/'
