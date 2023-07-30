const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const ini = require('ini');

const { getInterfaces } = require('network-interfaces');
const envFilePath = './.env';

const { config } = require('dotenv')


function updateEnvVariable(key, value) {
    fs.readFile(envFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении файла .env:', err);
            return;
        }
        const lines = data.split('\n');
        const index = lines.findIndex(line => line.startsWith(key + '='));
        if (index !== -1) {
            lines[index] = `${key}=${value}`;
        } else {
            lines.push(`${key}=${value}`);
        }
        const updatedContent = lines.join('\n');
        fs.writeFile(envFilePath, updatedContent, 'utf8', err => {
            if (err) {
                console.error('Ошибка при записи файла .env:', err);
            } else {
                console.log(`Значение переменной ${key} успешно обновлено.`);
            }
        });

        config()
    });
}

// Пример использования функции updateEnvVariable
//updateEnvVariable('MY_VARIABLE', 'new_value');


function get_conf_pub_key(config_name) {
    try {
        const confPath = path.join(process.env.WG_CONF_PATH, `${config_name}.conf`);
        //const bufferData = fs.readFileSync(confPath);
        //const conf = config.read(bufferData)
        const config = ini.parse(fs.readFileSync(confPath, 'utf-8'));
        const { Interface: { PrivateKey: pri } } = config
        const pub = execSync(`echo '${pri}' | wg pubkey`).toString().trim();
        return pub;
    } catch (error) {
        console.log(error)
        return "";
    }
}

const read_conf_file_interface = (config_name) => {
    try{

        const confPath = path.join(process.env.WG_CONF_PATH, `${config_name}.conf`);
        const bufferData = fs.readFileSync(confPath, 'utf-8');

        const lines = bufferData.split('\n');
        let currentSection = null;
        const configObject = { Interface: {}, Peer: [] };

        for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines

            if (line.startsWith('[') && line.endsWith(']')) {
                // This line represents a section header
                currentSection = line.slice(1, -1);
                if (currentSection === 'Peer') {
                    configObject.Peer.push({});
                } else {
                    configObject[currentSection] = {};
                }
            } else if (currentSection) {
                // This line represents a key-value pair within a section
                const [key, value] = line.split(' = ').map(item => item.trim());
                if (currentSection === 'Peer') {
                    const currentPeerIndex = configObject.Peer.length - 1;
                    configObject.Peer[currentPeerIndex][key] = value//+add;
                } else {
                    configObject[currentSection][key] = value;
                }
            }
        }

        return configObject;
    }catch (error) {
        console.log(error)
        return {};
    }
}

function get_conf_status(config_name) {
    const ifconfig = getInterfaces();

    for(const interface_name of ifconfig){
        if(interface_name === config_name){
            return 'running';
        }
    }

    return 'stopped';
}

function get_conf_listen_port(configName) {
    const configFile = path.join(process.env.WG_CONF_PATH, `${configName}.conf`);

    if (!fs.existsSync(configFile)) {
        return '';
    }

    try {
        const config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
        const listenPort = config.Interface?.ListenPort || '';

        if (!listenPort && get_conf_status(configName) === 'running') {
            const portOutput = execSync(`wg show ${configName} listen-port`).toString('utf-8').trim();
            return portOutput;
        }

        return listenPort;
    } catch (err) {
        console.error(`Error reading ${configFile}:`, err);
        return '';
    }
}

function get_conf_list() {
    const conf = [];
    const files = fs.readdirSync(process.env.WG_CONF_PATH);

    files.forEach((fileName) => {
        const match = fileName.match(/^(.{1,}).conf$/);
        if (match) {
            const interfaceName = match[1];
            const temp = {
                conf: interfaceName,
                status: get_conf_status(interfaceName),
                public_key: get_conf_pub_key(interfaceName),
                port: get_conf_listen_port(interfaceName),
            };

            if (temp.status === 'running') {
                temp.checked = true;
            } else {
                temp.checked = false;
            }

            conf.push(temp);
        }
    });

    if (conf.length > 0) {
        conf.sort((a, b) => a.conf.localeCompare(b.conf));
    }

    return conf;
}

function checkIP(ip) {
    const ipPatterns = [
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}/,
        /^[0-9a-fA-F]{0,4}(:([0-9a-fA-F]{0,4})){1,7}$/
    ];

    for (const matchPattern of ipPatterns) {
        const matchResult = matchPattern.test(ip);
        if (matchResult) {
            return matchResult;
        }
    }

    return null;
}


function checkDNS(dns) {
    dns = dns.replace(' ', '').split(',');
    let status = true;
    for (let i of dns) {
        if (!(checkIP(i.trim()) || /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z]{0,61}[a-z]$/i.test(i.trim()))) {
            return false;
        }
    }
    return true;
}

function checkIPWithRange(ip) {
    const ipPatterns = [
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|\/)){4}([0-9]{1,2})(,|$)/,
        /^[0-9a-fA-F]{0,4}(:([0-9a-fA-F]{0,4})){1,7}\/([0-9]{1,3})(,|$)/
    ];

    for (const matchPattern of ipPatterns) {
        const matchResult = matchPattern.test(ip);
        if (matchResult) {
            return matchResult;
        }
    }

    return null;
}




module.exports = {get_conf_list, get_conf_pub_key, get_conf_status, get_conf_listen_port, read_conf_file_interface, checkDNS, checkIP, checkIPWithRange, updateEnvVariable}
