# /bin/bash
cd dist

for i in {1..100}
do
  node main.js
  sleep 10
  echo "RESTARTING RESTARTING RESTARTING"
  echo "$i" >> restartlog
done
