const ipaddress = require('ip-address');
const fs = require('fs');
const subprocess = require('child_process');

class ManageConfiguration {
    addressCheck(data) {
        let address = data['address'];
        address = address.replace(/\s+/g, '');
        address = address.split(',');
        let amount = 0;
        for (let i of address) {
            try {
                const ips = new ipaddress.Address6(i, false);
                amount += ips.end() - ips.start() + 1;
            } catch (e) {
                return { "status": false, "reason": e.toString() };
            }
        }
        if (amount >= 1) {
            return { "status": true, "reason": "", "data": `Total of ${amount} IPs` };
        } else {
            return { "status": true, "reason": "", "data": "0 available IPs" };
        }
    }

    portCheck(data, configs) {
        const port = data['port'];
        if (!/^\d+$/.test(port) || parseInt(port) < 1 || parseInt(port) > 65535) {
            return { "status": false, "reason": "Invalid port." };
        }
        for (let i of configs) {
            if (i['port'] === port) {
                return { "status": false, "reason": `${port} used by ${i['conf']}.` };
            }
        }
        const checkSystem = subprocess.spawnSync('ss', ['-tulpn', '|', 'grep', `:${port}`], { shell: true });
        if (checkSystem.status !== 1) {
            return { "status": false, "reason": `Port ${port} used by other process in your system.` };
        }
        return { "status": true, "reason": "" };
    }

    nameCheck(data, configs) {
        let name = data['name'];
        name = name.replace(/\s+/g, '');
        for (let i of configs) {
            if (name === i['conf']) {
                return { "status": false, "reason": `${name} already existed.` };
            }
        }
        const illegalFilename = ["(Space)", " ", ".", ",", "/", "?", "<", ">", "\\", ":", "*", '|', '\"', "com1", "com2", "com3",
            "com4", "com5", "com6", "com7", "com8", "com9", "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9", "con", "nul", "prn"];
        for (let i of illegalFilename) {
            name = name.replace(new RegExp(i, 'g'), "");
        }
        if (name.length === 0) {
            return { "status": false, "reason": "Invalid name." };
        }
        return { "status": true, "reason": "" };
    }

    addConfiguration(data, configs, WG_CONF_PATH) {
        const output = ["[Interface]", "SaveConfig = true"];
        const required = ['addConfigurationPrivateKey', 'addConfigurationListenPort',
            'addConfigurationAddress', 'addConfigurationPreUp', 'addConfigurationPreDown',
            'addConfigurationPostUp', 'addConfigurationPostDown'];
        for (let i of required) {
            const e = data[i];
            if (e.length !== 0) {
                const key = i.replace("addConfiguration", "");
                const o = `${key} = ${e}`;
                output.push(o);
            }
        }
        let name = data['addConfigurationName'];
        const illegalFilename = ["(Space)", " ", ".", ",", "/", "?", "<", ">", "\\", ":", "*", '|', '\"', "com1", "com2", "com3",
            "com4", "com5", "com6", "com7", "com8", "com9", "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9", "con", "nul", "prn"];
        for (let i of illegalFilename) {
            name = name.replace(new RegExp(i, 'g'), "");
        }

        try {
            fs.writeFileSync(`${WG_CONF_PATH}/${name}.conf`, output.join('\n'));
        } catch (e) {
            return { "status": false, "reason": e.toString() };
        }
        return { "status": true, "reason": "", "data": name };
    }

    deleteConfiguration(data, config, g, WG_CONF_PATH) {
        const confs = config.map(i => i['conf']);
        console.log(confs);
        if (!confs.includes(data['name'])) {
            return { "status": false, "reason": "Configuration does not exist", "data": "" };
        }
        for (let i of config) {
            if (i['conf'] === data['name']) {
                if (i['status'] === "running") {
                    try {
                        subprocess.spawnSync("wg-quick", ['down', data['name']], { shell: true, stdio: 'inherit' });
                    } catch (exc) {
                        return { "status": false, "reason": "Can't stop peer", "data": exc.output };
                    }
                }

                g.cur.execute(`DROP TABLE ${data["name"]}`);
                g.cur.execute(`DROP TABLE ${data["name"]}_restrict_access`);
                g.db.commit();

                try {
                    fs.unlinkSync(`${WG_CONF_PATH}/${data["name"]}.conf`);
                } catch (e) {
                    return { "status": false, "reason": "Can't delete peer", "data": e.toString() };
                }

                return { "status": true, "reason": "" };
            }
        }
    }

    getConfigurationInfo(configName, WG_CONF_PATH) {
        const conf = new configparser.ConfigParser();
        try {
            conf.read(`${WG_CONF_PATH}/${configName}.conf`);
            if (!conf.has_section("Interface")) {
                return { "status": false, "reason": "No [Interface] in configuration file" };
            }
            const data = {};
            for (let [key, value] of conf.items("Interface")) {
                data[key] = value;
            }
            return { "status": true, "reason": "", "data": data };
        } catch (err) {
            return { "status": false, "reason": err.toString() };
        }
    }
}

module.exports = ManageConfiguration;
