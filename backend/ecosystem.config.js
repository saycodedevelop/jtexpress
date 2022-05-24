module.exports = [
  {
    script: './server.js',
    name: 'bot node',
    exec_mode: 'cluster',
    instances: 'max',
    error_file: './log/err.log',
    out_file: './log/out.log',
    log_file: './log/combined.log',
    time: true,
  },
]
