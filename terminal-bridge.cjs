const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const os = require('os');

const wss = new WebSocketServer({ port: 3001 });

console.log('Terminal Bridge running on ws://localhost:3001');

wss.on('connection', (ws) => {
    console.log('Client connected');
    let shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    
    // We'll use -i and try to force some terminal settings
    const proc = spawn(shell, os.platform() === 'win32' ? [] : ['-i'], {
        env: { ...process.env, TERM: 'xterm-256color', PS1: 'nexus> ' },
        shell: true
    });

    const send = (data) => {
        // Convert any stray \n to \r\n to ensure left-alignment in xterm.js
        let formatted = data.toString().replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
        ws.send(formatted);
    };

    proc.stdout.on('data', send);
    proc.stderr.on('data', send);

    ws.on('message', (message) => {
        const char = message.toString();
        
        // Handle input carefully
        if (char === '\u007f' || char === '\b') {
            ws.send('\b \b');
            proc.stdin.write('\b');
        } else if (char === '\r' || char === '\n') {
            ws.send('\r\n');
            proc.stdin.write('\n');
        } else {
            // Only echo if it's a single character (typing)
            if (char.length === 1) {
                ws.send(char);
            }
            proc.stdin.write(char);
        }
    });

    ws.on('close', () => {
        proc.kill();
        console.log('Client disconnected');
    });

    proc.on('exit', () => {
        ws.close();
    });
});
