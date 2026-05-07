const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const os = require('os');

const wss = new WebSocketServer({ port: 3001, host: '0.0.0.0' });

process.on('uncaughtException', (err) => {
    require('fs').appendFileSync('bridge-error.log', err.stack + '\n');
    process.exit(1);
});

console.log('Terminal Bridge running on ws://localhost:3001 (using child_process fallback)');

wss.on('connection', (ws) => {
    console.log('Client connected');
    let shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';
    
    // Spawn bash in interactive mode
    const proc = spawn(shell, os.platform() === 'win32' ? [] : ['-i'], {
        env: { ...process.env, TERM: 'xterm-256color', PS1: 'nexus> ', BASH_SILENCE_DEPRECATION_WARNING: '1' },
        cwd: process.cwd()
    });

    const send = (data) => {
        let formatted = data.toString().replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
        ws.send(formatted);
    };

    proc.stdout.on('data', send);
    proc.stderr.on('data', send);

    // Send a clear command to hide the 'no job control' and startup spam
    setTimeout(() => {
        proc.stdin.write('clear\n');
    }, 100);

    ws.on('message', (message) => {
        const char = message.toString();
        
        // If it's a long command (like from the Run button), don't echo it
        // manually, as it will just create 'random text' in the terminal.
        if (char.length < 5) {
            if (char !== '\r' && char !== '\n') {
                ws.send(char);
            }

            if (char === '\u007f' || char === '\b') {
                // Handle backspace echo: move cursor back, space, move cursor back
                ws.send('\b \b');
                proc.stdin.write('\b');
            } else if (char === '\r' || char === '\n') {
                ws.send('\r\n');
                proc.stdin.write('\n');
            } else {
                proc.stdin.write(char);
            }
        } else {
            // It's a command, just write it to stdin
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
