var exec = require('child_process').exec;
function execute(command, callback){
  exec(command, function(error, stdout, stderr){ callback(stdout); });
};
const CUTOFF = 60100 //80% used memory

/* Start the memoery check timer */
init()


function init(){
  setInterval(()=>{
    check_free_mem()
  }, 1000*10)//10 seconds?
}


function check_free_mem(){
  execute("free", (stdout)=>console.log(stdout))
  execute("free  | awk '{print $2}' ", (stdout)=>{
    /* get total mem */
//console.log("{print $2}")
  //console.log(stdout)// the one we want is [1]
    var total = parseInt(stdout.split('\n')[1])
   console.log({total})

    execute("free  | awk '{print $4}' ", (stdout)=>{
      /* get used and or free mem */
//console.log("{print $4}")

    //  console.log(stdout)
      var free = parseInt(stdout.split('\n')[1])
      console.log({free})
      console.log({CUTOFF})
      console.log(`free < CUTOFF ? ${free < CUTOFF}`)
      var usage = free/total
     console.log({usage})

     execute("free  | awk '{print $7}' ", (stdout)=>{
      var available = parseInt(stdout.split('\n')[1])

      console.log({available})

      if(free < CUTOFF){


        // execute('pm2 restart all', (stdout)=>console.log(stdout))
        console.log('shut down'  )
//       execute('service apache2 restart', ()=>{console.log('bye?')})
        }

      })
    })
  })
}





/* compare the ratio/ decide what to do */
