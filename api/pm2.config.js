module.exports = {
    apps: [
        {
            name: 'Api',
            script: 'app.js',
            watch: true,
            ignore_watch: ['node_modules', 'logs', "db", "tmp"],
        },
        {
            name: 'HandshakeMonitor',
            script: 'handshake_monitor.js',
            watch: true,
            ignore_watch: ['node_modules', 'logs', "db", "tmp"],
        },
    ],
};
