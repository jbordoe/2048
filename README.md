# 2048-AI
So I've forked [2048](https://github.com/gabrielecirulli/2048)

My aim is to train a few AI players and see how high a score I can get

You can watch a **very stupid** AI playing [here](http://jbordoe.github.io/2048/)

### Overview
Each 'player' will use an evaluation function which analyses the current grid
state in order to decide it's next move.
The training code will therfore attempt to optimise this evaluation function with respect
to one of three desired outcomes
* Achieving 2048 in as few moves as possible
* Reaching as large a number as possible
* Achieving as high a score as possible


I'll probably be using a GA for this. Perhaps not ideal for js but I want to
play around with node, and there's [potential for distributing the workload with it](http://jj.github.io/js-ga-fosdem/#/home) 


