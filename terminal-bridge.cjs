const { WebSocketServer } = require('ws');
const pty = require('node-pty');
const os = require('os');

const wss = new WebSocketServer({ port: 3001 });

console.log('Terminal Bridge running on ws://localhost:3001 (using node-pty)');

wss.on('connection', (ws) => {
    console.log('Client connected');
    let shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';

    let ptyProcess;
    try {
        ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME || process.cwd(),
            env: process.env
        });
    } catch (err) {
        console.error("Primary shell failed to spawn, falling back to /bin/sh", err);
        ptyProcess = pty.spawn('/bin/sh', [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: process.cwd(),
            env: process.env
        });
    }

    ptyProcess.onData((data) => {
        ws.send(data);
    });

    ws.on('message', (message) => {
        ptyProcess.write(message.toString());
    });

    ws.on('close', () => {
        ptyProcess.kill();
        console.log('Client disconnected');
    });
});
