var cmd = require("node-cmd");

init();

function init() {
  setInterval(() => {
    get_cpu_frequency(cpu_data => {
      console.log({ cpu_data });
      if (isAboveLimit(cpu_data)) {
        setOneMinCheckCPU(cpu_data);
      }
    });
  }, 2000);
}

const CPU_LIMIT = 0.61;
function isAboveLimit(cpu) {
  return cpu > CPU_LIMIT;
}

let setOneMinCheckCPUFlag = false;
function setOneMinCheckCPU(current_value) {
  if (setOneMinCheckCPUFlag) return;
  setOneMinCheckCPUFlag = true;
  setTimeout(()=>{
    get_cpu_frequency(cpu_data => {
      if (isAboveLimit(cpu_data)) {
        /* Restart PM2 */
        run_basic_command_and_return_output("sudo reboot", stdOut =>
          console.log(stdOut)
        );
      }
    });
  }, 30000)
}
function get_command(command, res) {
  // console.log('The command is '+command)
  cmd.get(command, function(err, data, stderr) {
    // console.log('data')
    // console.log(data)
    // console.log('err? '+err)
    // console.log('stderr? '+stderr)
    var resp = {};
    resp.output = data;
    resp.err = err;
    resp.stderr = stderr;
    res.send(resp);
  });
}

function get_ip_address(res) {
  var command = "curl ipinfo.io/ip";
  var resp = {};
  cmd.get(command, function(err, data, stderr) {
    // console.log(err)
    // console.log(data)
    // console.log(stderr)
    if (err) {
      // console.log('err')
      // console.log(err)
      resp.err = err;
      res.send(resp);
    } else if (data) {
      // console.log('ip data')
      // console.log(data)
      resp.ip = data;
      res.send(resp);
    }
  });
}

function get_daemon_sevice_list(res) {
  var command = "service --status-all";
  var resp = {};
  cmd.get(command, function(err, data, stderr) {
    if (err) {
      // console.log('err')
      // console.log(err)
      resp.err = err;
      res.send(resp);
    } else if (data) {
      // console.log('ip data')
      // console.log(data)
      resp.service_list = data;
      res.send(resp);
    }
  });
}

function run_multiple_command_and_return_output(command_string, cb) {
  var command = command_string;
  var resp = {};
  cmd.get(command, function(err, data, stderr) {
    if (err) {
      // console.log('err')
      // console.log(err)
      resp.err = err;
      cb(resp);
    } else if (data) {
      // console.log('ip data')
      // console.log(data)
      data = split_lines_of_data(data);
      resp[command_string] = data;
      console.log("resp");
      cb(resp);
    }
  });
}

function run_basic_command_and_return_output(command_string, cb) {
  var command = command_string;
  var resp = {};
  cmd.get(command, function(err, data, stderr) {
    if (err) {
      console.log("err");
      console.log(err);
    } else if (data) {
      // console.log('ip data')
      // data = split_lines_of_data(data)
      cb(data);
    }
  });
}

function split_lines_of_data(data) {
  return data.split("\n");
}
function get_cpu_data(res) {
  run_basic_command_and_return_output("lscpu", data => {
    console.log({ data });
  });
}
function get_mem_data(res) {
  let data_obj = {};
  //5 commands?
  var mem_commands = ["free -m", "sudo dmidecode -t 17"];
  mem_commands.forEach(i => {
    console.log(i);
    run_multiple_command_and_return_output(i, function(mem_details) {
      data_obj[i] = mem_details[i];
      console.log(Object.keys(data_obj).length);
      if (Object.keys(data_obj).length === mem_commands.length) {
        console.log("go");
        res.send(data_obj);
      }
    });
  });
}
function get_cpu_frequency(cb) {
  run_basic_command_and_return_output("uptime", data => {
    data = data.split("average:")[1];
    data = parseFloat(data.split(",")[0]);
    console.log(data);
    cb(data);
  });
  // var data = run_basic_command_and_return_output("cat /proc/cpuinfo | grep 'processor\\|cpu MHz'", (data)=>{
  //   /* get even lines (cpu usage) */
  //   data = data.filter((d, i)=> i%2 !== 0)
  //   data = data.map(d=>d.split(': ')[1])
  //   console.log(data)
  // })
}
function get_cpu_MAX(cb) {
  run_basic_command_and_return_output("lscpu | grep 'CPU max MHz:'", data => {
    cb(data);
  });
}

module.exports = {
  get_command: get_command,
  get_ip_address: get_ip_address,
  get_daemon_sevice_list: get_daemon_sevice_list,
  get_cpu_data: get_cpu_data,
  get_cpu_frequency: get_cpu_frequency,
  get_mem_data: get_mem_data
};
