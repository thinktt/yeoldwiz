# /bin/bash
cd dist

for i in {1..100}
do
  echo "$i" >> restartlog
  node main.js
  sleep 10
  echo "RESTARTING RESTARTING RESTARTING"
done
