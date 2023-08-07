# Ye Old Wizard Deployment Guide
The following are basic instuctions for how to set up the Ye Old Wizard backend
services on your on prem server. These instructions are based ona  fresh 
install of Debian running as root. 

While it would be preferable to completely abstract this to cloud orchestrations
for now it's a challenging prospect since CPU hardware needs to be managed 
explicitly to get consistent moves from the engine. 

### Clone the repo
```
  git clone git@github.com:thinktt/yeoldwiz.git
  cd yeoldwiz/deploy
```
### Get Dependencies
Setting up currently requires Docker and Node. Node is only needed for some 
build scripts.
```
apt update
apt install nodejs
apt instll docker-ce
```
### Turn CPU Turbo Boost Off
For the King engine to make consistent moves we need to keep the cpu speed 
stable across all loads. The following make command will attempt to do this.
It's currently setup for AMD processors. Intel setup will be added later.
```
make offturbo
```
### Setup all Env Files
Each service needs an evn file and place in the `./env` folder. 

How to along with automation coming soon.

### Setup Yow King Compose Yaml File
This file is configured to your system based on the number of CPU cores
you want to dedicate to the yowking service containers. `CPU_START` and 
`CPU_END` should be set based on the number of cores your system has.

Be sure to inlcude the full real cores in your logical CPU selections, as the 
created composse file will map a container to two logical cores in sequence and 
assume they are an actual real core. 
```
make compose-yowking.yaml CPU_START=<logical-core> CPU_END=<logical-core>
```

### Build Local Yowking Container
This container must be built locally and should not be published
for propriatary reasons. For details on buildng this locally see See the 
[Yow King](https://github.com/thinktt/yowking) repo for details.

### Start System
```
make up
```

### Calibrate System
This will calibrate and test the local system at the same time. It will 
determine the speed the engine will run it's moves at for different level 
personalities. This process takes some time. Go play mine sweeper.

#### Enter the Yowcal container:
```
make dexcal

```
#### Start the calibration:
```
./docalibrate.js cal load <number-of-king-containers> 
```
#### Do a load test run:
Once this is done test the calibrated clocks with the following comand.
```
./doclaibrate.js test main <number-of-king-containers>
```
If it's working correctly, when the test is done you should see an `idAccuracy` 
over `80` and a `underAcccuracy` over `90`.

#### Now run the tests without load:
```
./doclaibrate.js test main 0
```
This also should give you an `idAccuracy` over `80` and a `underAcccuracy` 
over `90`.

#### Exit the Yowcal container back to your host system with 
```
`exit`
```

### Start the Yowbot cotnainer
In this final step we turn on the Lichess bot.
```
make botup
```

Now the lichess bot should be online and able to play games. For information on 
how the frontend connects to this system see the [main diagram.](https://github.com/thinktt/yowki)










