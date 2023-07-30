module.exports = {
    apps: [
        {
            name: 'Api',
            script: 'app.js',
            watch: false,
            ignore_watch: ['node_modules', 'logs'],
        },
        {
            name: 'HandshakeMonitor',
            script: 'handshake_monitor.js',
            watch: false,
            ignore_watch: ['node_modules', 'logs'],
        },
    ],
};
