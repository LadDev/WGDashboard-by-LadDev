const {Router} = require("express")
const Admins = require("../models/Admins");
const Interfaces = require("../models/Interfaces");
const Peers = require("../models/Peers");
const InterfacesTransfer = require("../models/InterfacesTransfer");
const PeersTransfer = require("../models/PeersTransfer");
const GlobalConfig = require("../models/GlobalConfig");
const router = Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const auth = require("../middleware/admin.middleware")
const {check} = require("diskusage");
const {cpuUsage} = require("os-utils");
const os = require("os");
const ipaddress = require("ip-address");
const {spawn} = require("child_process")
//const fs = require('fs-extra');
const fs = require('fs');
const isc = require('ip-subnet-calculator');

const ping = require('ping');
const Traceroute = require('nodejs-traceroute');

const {
    get_conf_list,
    get_conf_status,
    read_conf_file_interface,
    get_conf_pub_key, checkIPWithRange, checkDNS, updateEnvVariable
} = require("../middleware/WireGuardConf")

const {exec} = require('child_process');
const {isV4Format, fromLong} = require("ip");
const {config} = require("dotenv");

const getInterfaceData = async (name, interfaceData) => {
    try {
        let response = {code: 0, name, confData: {address: interfaceData.address, port: interfaceData.port}}

        response.confData.public_key = get_conf_pub_key(name) //publicKey

        let peers = []

        const peersDB = await Peers.find({interface_name: name})

        let interfaceTotalSent = 0
        let interfaceTotalReceive = 0

        for (const peerDB of peersDB) {

            const total_sent = Number(peerDB.last_transfer.total_sent) + Number(peerDB.total_sent)
            const total_receive = Number(peerDB.last_transfer.total_receive) + Number(peerDB.total_receive)

            interfaceTotalSent += total_sent
            interfaceTotalReceive += total_receive

            peers.push({
                id: peerDB._id,
                interface_name: peerDB.interface_name,
                private_key: peerDB.private_key,
                public_key: peerDB.public_key,
                dns: peerDB.dns,
                endpoint_allowed_ip: peerDB.endpoint_allowed_ip,
                name: peerDB.name,
                total_receive: total_receive,
                total_sent: total_sent,
                total_data: total_sent + total_receive,
                endpoint: peerDB.endpoint,
                status: peerDB.status,
                latest_handshake: peerDB.latest_handshake,
                allowed_ip: peerDB.allowed_ip,
                cumu_receive: peerDB.cumu_receive,
                cumu_sent: peerDB.cumu_sent,
                cumu_data: peerDB.cumu_data,
                mtu: peerDB.mtu,
                keepalive: peerDB.keepalive,
                remote_endpoint: peerDB.remote_endpoint,
                preshared_key: peerDB.preshared_key,
                enabled: peerDB.enabled,
                time: peerDB.time,
            })
        }

        response.confData.peers = peers
        response.confData.total_receive = interfaceTotalReceive
        response.confData.total_sent = interfaceTotalSent
        response.confData.total_data = interfaceTotalReceive + interfaceTotalSent
        response.confData.runned_clients = interfaceData.runnedClients//await getConfRunningPeerNumber(name)
        response.confData.server_addr = process.env.SERVER_ADDR

        const gc = await GlobalConfig.find({})

        //let globalConfig = {ip: null, dns: null, endpoint: null, mtu: null, keepalive: null, path: null}

        if(gc && gc.length > 0){
            response.confData.server_addr = gc[0].ip
        }



        const configs = get_conf_list();

        for (const conf of configs) {
            if (conf.conf === name && conf.status === "running" && conf.checked === true) {
                response.confData.status = "running"
            } else if (conf.conf === name && (conf.status !== "running" && conf.checked !== true)) {
                response.confData.status = "stopped"
            }
        }

        return response;
    } catch (error) {
        return {code: -1, status: "error", message: error.message};
    }
}

const getAvailableIPs = async (name) => {
    try {
        let available = []
        let existed = []

        const configInterface = read_conf_file_interface(name)
        if (configInterface.Interface && configInterface.Interface.Address) {
            const conf_address = configInterface.Interface.Address
            const addresses = conf_address.split(',')
            for (const address of addresses) {
                const [addr, sub] = address.split("/")
                existed.push(addr.replace(" ", ""))
            }

            const peersDB = await Peers.find({interface_name: name})
            if (peersDB) {
                for (const peerDB of peersDB) {
                    const addrs = peerDB.allowed_ip.split(",")
                    for (const address of addrs) {
                        const [addr, sub] = address.split("/")
                        existed.push(addr.replace(" ", ""))
                    }
                }
            }

            for (const address of addresses) {
                const [addr, sub] = address.split("/")
                const tmpIP = isc.calculateCIDRPrefix(addr.replace(" ", ""), "255.255.255.0");

                if (isV4Format(addr.replace(" ", ""))) {

                    let ipLow = Number(tmpIP.ipLow) + 1
                    let ipHigh = Number(tmpIP.ipHigh)

                    while (ipLow <= ipHigh) {
                        available.push(fromLong(ipLow))
                        ipLow += 1
                    }
                }
            }
        }

        const filteredAvailable = available.filter(item => !existed.includes(item));
        return filteredAvailable

    } catch (error) {
        console.log(error)
        return []
    }
}

function deletePeer(interface_name, public_key) {
    return new Promise((resolve, reject) => {
        exec(`wg set ${interface_name} peer ${public_key} remove`, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Command execution error: ${error.message}`));
                return;
            }
            if (stderr) {
                reject(new Error(`Command error output: ${stderr}`));
                return;
            }

            spawn(`wg-quick`, ['save', interface_name])

            resolve(true)
        });
    });
}

function executeCommandAsync(command, args) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args);

        let stdoutData = '';
        let stderrData = '';

        childProcess.stdout.on('data', data => {
            stdoutData += data.toString();
        });

        childProcess.stderr.on('data', data => {
            stderrData += data.toString();
        });

        childProcess.on('close', code => {
            if (code === 0) {
                resolve(stdoutData);
            } else {
                reject(new Error(`Command '${command}' exited with code ${code}. Error output: ${stderrData}`));
            }
        });

        childProcess.on('error', err => {
            reject(err);
        });
    });
}

async function getCpuUsage() {
    return new Promise((resolve) => {
        cpuUsage(function (usage) {
            resolve(usage * 100);
        });
    });
}

async function getDiskUsage() {
    return new Promise((resolve) => {

        const path = '/'; // Путь к диску, для которого вы хотите получить информацию

        check(path, function (err, info) {
            if (err) {
                console.error(err);
                return;
            }

            const total = info.total;
            const free = info.available;
            const used = total - free;
            const usagePercent = (used / total) * 100;

            resolve(Number(usagePercent.toFixed(2)));
        });
    });
}


router.post("/auth/signin", async (req, res) => {
    try {
        const {username, password, remember} = req.body;
        const hashed_pwd = await bcrypt.hash(password, 12);


        const admin = await Admins.findOne({username})
        if (!admin) {
            return res.status(400).json({
                code: -2,
                message: "User with this username is not registered"
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) {
            return res.status(400).json({code: -2, message: "The user does not exist or the password is incorrect"})
        }

        let token = jwt.sign({userID: admin.id}, process.env.jwtSecret, {expiresIn: "1d"})
        if (remember) {
            token = jwt.sign({userID: admin.id}, process.env.jwtSecret)
        }

        return res.status(200).json({
            code: 0,
            status: "success",
            message: "",
            token: token,
            username: admin.username,
            uid: admin.id,
            lang: admin.lang,
            theme: admin.theme,
            listType: admin.listType,
            intervalTime: admin.intervalTime,
        })
    } catch (e) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"});
    }

})

router.post("/auth/update-data", async (req, res) => {
    try {
        const {username, password, newPassword,retryPassword} = req.body;
        const hashed_pwd = await bcrypt.hash(password, 12);


        const admin = await Admins.findOne({username})
        if (!admin) {
            return res.status(400).json({
                code: -2,
                message: "User with this username is not registered"
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) {
            return res.status(400).json({code: -2, message: "The user does not exist or the password is incorrect"})
        }

        if(newPassword === retryPassword){
            const hashed_pwd = await bcrypt.hash(newPassword, 12);
            admin.password = hashed_pwd
            await admin.save()
        }

        return res.status(200).json({
            code: 0,
            status: "success"
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"});
    }

})

router.post("/admin/change-theme", auth, async (req, res) => {
    try {
        const {theme} = req.body;
        const {userID} = req.admin

        const admin = await Admins.findOne({_id: userID})

        if (admin.theme !== theme) {
            admin.theme = theme
            await admin.save()
        }

        return res.status(200).json({code: 0, message: "Theme changed"});
    } catch (e) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"});
    }
})

router.post("/admin/change-interval-time", auth, async (req, res) => {
    try {
        const {intervalTime} = req.body;
        const {userID} = req.admin

        const admin = await Admins.findOne({_id: userID})

        if (admin.intervalTime !== intervalTime) {
            admin.intervalTime = intervalTime
            await admin.save()
        }

        return res.status(200).json({code: 0, message: "Interval Time changed"});
    } catch (e) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"});
    }
})

router.post("/admin/change-list-type", auth, async (req, res) => {
    try {
        const {listType} = req.body;
        const {userID} = req.admin

        const admin = await Admins.findOne({_id: userID})

        if (admin.listType !== listType) {
            admin.listType = listType
            await admin.save()
        }

        return res.status(200).json({code: 0, message: "List Type changed"});
    } catch (e) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"});
    }
})

router.post("/admin/change-lang", auth, async (req, res) => {
    try {
        const {language} = req.body;
        const {userID} = req.admin

        const admin = await Admins.findOne({_id: userID})

        if (admin.lang !== language) {
            admin.lang = language
            await admin.save()
        }

        return res.status(200).json({code: 0, message: "Language changed"});
    } catch (e) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"});
    }
})

router.get("/show/status", auth, async (req, res) => {
    try {

        const cpuUsage = await getCpuUsage();
        const diskUsage = await getDiskUsage();
        const platform = os.platform()
        const freemem = os.freemem()
        const totalmem = os.totalmem()
        //const status = await occtlExec.status()

        return res.status(200).json({code: 0, system: {platform, freemem, totalmem, cpuUsage, diskUsage}});
    } catch (error) {
        console.error(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.get("/show/configs", auth, async (req, res) => {
    try {

        let configs = []

        const intefacesDB = await Interfaces.find();

        if(intefacesDB){
            for(const interfaceDB of intefacesDB){
                const status = get_conf_status(interfaceDB.name)
                configs.push({
                    conf: interfaceDB.name,
                    status: status,
                    public_key: interfaceDB.public_key,
                    port: interfaceDB.port,
                    checked: status === "running"
                })
            }
        }

        const gc = await GlobalConfig.find({})

        let globalConfig = {ip: null, dns: null, endpoint: null, mtu: null, keepalive: null, path: null}

        if(gc && gc.length > 0){
            globalConfig.ip = gc[0].ip
            globalConfig.dns = gc[0].dns
            globalConfig.endpoint = gc[0].endpoint
            globalConfig.mtu = gc[0].mtu
            globalConfig.keepalive = gc[0].keepalive
            globalConfig.path = gc[0].path
        }

        return res.status(200).json({code: 0, configs, globalConfig});
    } catch (error) {
        console.error(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/server/update/global", auth, async (req, res) => {
    try {

        const {dns,endpoint,mtu,keepalive,ip, path} = req.body

        if(ip){
            updateEnvVariable("SERVER_ADDR",ip)
        }

        config();

        let globalConfig = {ip: null, dns: null, endpoint: null, mtu: null, keepalive: null, path: null}

        const gc = await GlobalConfig.find({})

        if(dns && endpoint && mtu && keepalive){
            if(gc && gc.length > 0) {
                gc[0].ip = ip
                gc[0].dns = dns
                gc[0].endpoint = endpoint
                gc[0].mtu = mtu
                gc[0].keepalive = keepalive
                await gc[0].save()
            }
        }

        if(path){
            if(gc && gc.length > 0) {
                gc[0].path = path
                await gc[0].save()
            }
        }

        if(gc && gc.length > 0){
            globalConfig.ip = gc[0].ip
            globalConfig.dns = gc[0].dns
            globalConfig.endpoint = gc[0].endpoint
            globalConfig.mtu = gc[0].mtu
            globalConfig.keepalive = gc[0].keepalive
            globalConfig.path = gc[0].path
        }

        let configs = []
        const intefacesDB = await Interfaces.find();
        if(intefacesDB){
            for(const interfaceDB of intefacesDB){
                const status = get_conf_status(interfaceDB.name)
                configs.push({
                    conf: interfaceDB.name,
                    status: status,
                    public_key: interfaceDB.public_key,
                    port: interfaceDB.port,
                    checked: status === "running"
                })
            }
        }

        return res.status(200).json({code: 0, configs, globalConfig});
    } catch (error) {
        console.error(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/config/address-check", auth, async (req, res) => {
    try {
        const {address} = req.body

        let addressTMP = address.replace(/\s+/g, '');
        let addressArr = addressTMP.split(',');
        let amount = 0;
        for (let i of addressArr) {
            try {
                const ips = new ipaddress.Address4(i, false);
                const subnetSize = 32 - ips.subnetMask;
                amount += Math.pow(2, subnetSize)
            } catch (e) {
            }
        }
        return res.status(200).json({code: 0, amount});

        //return res.status(200).json({code: 0, system: {platform, freemem, totalmem, cpuUsage, diskUsage}});
    } catch (error) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/config/port-check", auth, async (req, res) => {
    try {
        const {port} = req.body;

        const configs = get_conf_list()

        let portAvailable = true

        let conf = {
            conf: '',
            status: '',
            public_key: '',
            port: '',
            checked: ''
        }

        for (const config of configs) {
            if (Number(config.port) === Number(port)) {
                portAvailable = false
                conf = config
            }
        }

        return res.status(200).json({code: 0, portAvailable, conf});


        //return res.status(200).json({code: 0, system: {platform, freemem, totalmem, cpuUsage, diskUsage}});
    } catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/config/name-check", auth, async (req, res) => {
    try {
        const {name} = req.body;

        const configs = get_conf_list()

        let nameAvailable = true


        for (const config of configs) {
            if (config.conf === name) {
                nameAvailable = false
            }
        }

        return res.status(200).json({code: 0, nameAvailable});


        //return res.status(200).json({code: 0, system: {platform, freemem, totalmem, cpuUsage, diskUsage}});
    } catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/config/new", auth, async (req, res) => {
    try {
        const {private_key, address, config_name, listen_port, preup, predown, postup, postdown} = req.body;

        const output = ["[Interface]"];

        let name = config_name

        const illegal_filename = ["(Space)", " ", ".", ",", "/", "?", "<", ">", "\\", ":", "*", '|', '\"', "com1", "com2",
            "com3",
            "com4", "com5", "com6", "com7", "com8", "com9", "lpt1", "lpt2", "lpt3", "lpt4",
            "lpt5", "lpt6", "lpt7", "lpt8", "lpt9", "con", "nul", "prn"]


        for (const ifn of illegal_filename) {
            name = name.replace(ifn, "")
        }

        output.push(`Address = ${address}`)
        output.push(`ListenPort = ${listen_port}`)
        output.push(`PrivateKey = ${private_key}`)

        if (preup.length !== 0) {
            output.push(`PreUp = ${preup}`)
        }
        if (predown.length !== 0) {
            output.push(`PreDown = ${predown}`)
        }
        if (postup.length !== 0) {
            output.push(`PostUp = ${postup}`)
        }
        if (postdown.length !== 0) {
            output.push(`PostDown = ${postdown}`)
        }

        output.push(``)

        const newInterface = new Interfaces({
            name,
            address,
            private: private_key,
            port: listen_port,
            preup: preup,
            predown: predown,
            postup: postup,
            postdown: postdown
        })

        await newInterface.save()

        try {
            const gc = await GlobalConfig.find({})

            let globalConfig = {ip: null, dns: null, endpoint: null, mtu: null, keepalive: null, path: null}

            if(gc && gc.length > 0){
                globalConfig.ip = gc[0].ip
                globalConfig.dns = gc[0].dns
                globalConfig.endpoint = gc[0].endpoint
                globalConfig.mtu = gc[0].mtu
                globalConfig.keepalive = gc[0].keepalive
                globalConfig.path = gc[0].path
            }


            fs.writeFileSync(`${globalConfig.path}/${name}.conf`, output.join('\n'));
        } catch (e) {
            console.log(e)
            return res.status(500).json({code: -1, message: e.toString()})
        }

        let configs = []

        const intefacesDB = await Interfaces.find();
        if(intefacesDB){
            for(const interfaceDB of intefacesDB){
                const status = get_conf_status(interfaceDB.name)
                configs.push({
                    conf: interfaceDB.name,
                    status: status,
                    public_key: interfaceDB.public_key,
                    port: interfaceDB.port,
                    checked: status === "running"
                })
            }
        }

        return res.status(200).json({code: 0, configs});

    } catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/config/change-status", auth, async (req, res) => {
    try {
        const {name} = req.body;
        const status = get_conf_status(name);

        let resp = null

        if (status === 'running') {
            try {
                spawn(`wg-quick`, ["down", `${name}`]);
                await Peers.updateMany({}, {status: "offline"}, {});
                await Interfaces.updateMany({name}, {runnedClients: 0}, {});
            } catch (err) {
                resp = {
                    status: false,
                    reason: "Can't stop configuration",
                    message: err.message,
                };
            }
        } else if (status === 'stopped') {
            try {
                spawn(`wg-quick`, ["up", `${name}`]);
            } catch (err) {
                resp = {
                    status: false,
                    reason: "Can't turn on configuration",
                    message: err.message,
                };
            }
        }

        let configs = []

        const interfaceData = await Interfaces.findOne({name});
        const intefacesDB = await Interfaces.find();
        if(intefacesDB){
            for(const interfaceDB of intefacesDB){
                const status = get_conf_status(interfaceDB.name)
                configs.push({
                    conf: interfaceDB.name,
                    status: status,
                    public_key: interfaceDB.public_key,
                    port: interfaceDB.port,
                    checked: status === "running"
                })
            }
        }

        const {confData} = await getInterfaceData(name, interfaceData)

        setTimeout(() => {
            return res.status(200).json({code: 0, configs, confData});
        }, 1000)

    } catch (error) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.get("/config/get", auth, async (req, res) => {
    try {
        const {name} = req.query;
        const interfaceData = await Interfaces.findOne({name});

        if (!interfaceData) {
            return res.status(200).json({code: -1, status: "error", message: "Interface Not Found"})
        }

        const response = await getInterfaceData(name, interfaceData)

        return res.status(200).json(response);

    } catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/config/available-ips", auth, async (req, res) => {
    try {
        const {name} = req.body;

        return res.status(200).json({code: 0, availableIps: await getAvailableIPs(name)});

    } catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/peer/new", auth, async (req, res) => {
    try {
        const {
            interface_name,
            private_key,
            public_key,
            peer_name,
            peer_address,
            peer_dns,
            peer_endpoint,
            peer_mtu,
            peer_keepalive,
            preshared_key,
            usePreSharedKey
        } = req.body;

        const interfaceData = await Interfaces.findOne({name: interface_name});

        if (!interfaceData) {
            return res.status(200).json({code: -1, status: "error", message: "Interface Not Found"})
        }

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[-:.]/g, '').replace('T', '_').split('.')[0];
        const keys_name = `${interface_name}_${formattedDate}_Peer_#_1`

        let ipsArrTMP = peer_address.replace(",", "").replace(" ", ",").split(",")

        let ipsArr = []

        for (const ip of ipsArrTMP) {
            ipsArr.push(`${ip}/32`)
        }

        const ips = ipsArr.join(",")

        const newPeer = new Peers({
            interface_name,
            private_key,
            public_key,
            dns: peer_dns,
            endpoint_allowed_ip: peer_endpoint,
            name: peer_name,
            allowed_ip: ips,
            mtu: Number(peer_mtu),
            keepalive: Number(peer_keepalive),
            preshared_key: usePreSharedKey ? preshared_key : "",
        })

        await newPeer.save()

        let wgCommands = ["set", interface_name, "peer", public_key]
        const psk_file = `./tmp/${keys_name}.txt`;
        if (usePreSharedKey && usePreSharedKey) {
            fs.writeFileSync(psk_file, preshared_key);
            wgCommands.push("preshared-key")
            wgCommands.push(psk_file)
        }

        wgCommands.push("allowed-ips")
        wgCommands.push(ips)

        const output = await executeCommandAsync('wg', wgCommands);
        await executeCommandAsync('wg-quick', ["save", interface_name]);

        try {
            fs.unlinkSync(psk_file);
        } catch (e) {
            console.log(e)
        }

        const response = await getInterfaceData(interface_name, interfaceData)

        return res.status(200).json(response);


    } catch (error) {
        console.error(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/peer/delete", auth, async (req, res) => {
    try {
        const {
            interface_name,
            public_key
        } = req.body;

        const interfaceData = await Interfaces.findOne({name: interface_name});

        if (!interfaceData) {
            return res.status(200).json({code: -1, status: "error", message: "Interface Not Found"})
        }

        const peerDB = await Peers.findOne({interface_name, public_key});

        if (!peerDB) {
            return res.status(200).json({code: -1, status: "error", message: "Peer Not Found"})
        }

        await Peers.deleteOne({interface_name, public_key})
        await PeersTransfer.deleteOne({interface_name, public_key})

        await deletePeer(interface_name, public_key)

        const response = await getInterfaceData(interface_name, interfaceData)

        return res.status(200).json(response);


    } catch (error) {
        console.error(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})


router.get("/config/chart-data", auth, async (req, res) => {
    try {

        const {name} = req.query

        const interChartDataDB = await InterfacesTransfer.findOne({interface_name: name})

        let chartData = {sent: [], receive: [], time: []}

        if (interChartDataDB) {
            for (const transf of interChartDataDB.transfers) {
                chartData.sent.push(transf.sent)
                chartData.receive.push(transf.receive)
                chartData.time.push(transf.time)
            }
        }

        return res.status(200).json({code: 0, chartData});

    } catch (error) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.get("/peer/chart-data", auth, async (req, res) => {
    try {

        const {interface_name, public_key} = req.query

        const peerChartDataDB = await PeersTransfer.findOne({interface_name, public_key})

        let peerChartData = {sent: [], receive: [], time: []}

        if (peerChartDataDB) {
            for (const transf of peerChartDataDB.transfers) {
                peerChartData.sent.push(transf.sent)
                peerChartData.receive.push(transf.receive)
                peerChartData.time.push(transf.time)
            }
        }

        return res.status(200).json({code: 0, peerChartData});

    } catch (error) {
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/peer/change-state", auth, async (req, res) => {
    try {

        const {interface_name, public_key} = req.body


        const peerDB = await Peers.findOne({interface_name, public_key});

        if (peerDB) {
            const stateNow = peerDB.enabled

            if (stateNow) {
                await deletePeer(interface_name, public_key)
            } else {
                const currentDate = new Date();
                const formattedDate = currentDate.toISOString().replace(/[-:.]/g, '').replace('T', '_').split('.')[0];
                const keys_name = `${interface_name}_${formattedDate}_Peer_#_1`
                const psk_file = `./tmp/${keys_name}.txt`;
                //f"wg set {data['config']} peer {moveLockToUnlock[0]} allowed-ips {moveLockToUnlock[11]} preshared-key {f_name}",
                let comm = ["set", interface_name, "peer", peerDB.public_key, "allowed-ips", peerDB.allowed_ip]
                if (peerDB.preshared_key && peerDB.preshared_key !== "") {
                    fs.writeFileSync(psk_file, peerDB.preshared_key);
                    comm.push("preshared-key")
                    comm.push(psk_file)

                }
                spawn("wg", comm)
                spawn(`wg-quick`, ['save', interface_name])

                try {
                    fs.unlinkSync(psk_file);
                } catch (e) {
                    console.log(e)
                }
            }

            await Peers.updateMany({interface_name, public_key}, {status: "offline", enabled: !stateNow}, {});
        }


        const interfaceData = await Interfaces.findOne({name: interface_name});
        const response = await getInterfaceData(interface_name, interfaceData)
        return res.status(200).json(response);

    } catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/peer/save-settings", auth, async (req,res)=>{
    try{
        const {id, interface_name, peer_name, private_key, public_key, preshared_key, peer_address, peer_dns, peer_endpoint, peer_mtu, peer_keepalive} = req.body

        const peerDB = await Peers.findOne({_id: id})

        if(!peerDB){
            return res.status(200).json({code: -1, message: "Peer Not Found"})
        }

        if(!checkDNS(peer_address)){
            return res.status(200).json({code: -2, message: "Address format is incorrect."})
        }

        if(!checkIPWithRange(peer_endpoint)){
            return res.status(200).json({code: -3, message: "Endpoint Allowed IPs format is incorrect."})
        }else{
            peerDB.endpoint_allowed_ip = peer_endpoint
        }

        if(!checkDNS(peer_dns)){
            return res.status(200).json({code: -4, message: "DNS format is incorrect."})
        }else{
            peerDB.dns = peer_dns
        }

        if (peer_mtu.length === 0 || !/^\d+$/.test(peer_mtu)) {
            return res.status(200).json({code: -5, message: "MTU format is not correct."})
        }else{
            peerDB.mtu = peer_mtu
        }

        if (peer_keepalive.length === 0 || !/^\d+$/.test(peer_keepalive)) {
            return res.status(200).json({code: -6, message: "Persistent Keepalive format is not correct."})
        }else{
            peerDB.keepalive = peer_keepalive
        }

        const peerDBTMP = await Peers.findOne({interface_name, private_key});
        if(peerDBTMP && peerDBTMP.id !== id){
            return res.status(200).json({code: -7, message: "Private Key already taken by another peer."})
        }

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[-:.]/g, '').replace('T', '_').split('.')[0];
        const keys_name = `${interface_name}_${formattedDate}_Peer_#_1`
        const psk_file = `./tmp/${keys_name}.txt`;

        let comm = ["set", interface_name, "peer", peerDB.public_key]
        fs.writeFileSync(psk_file, preshared_key);
        comm.push("preshared-key")
        comm.push(psk_file)
        //let out = spawn("wg", comm)
        spawn(`wg-quick`, ['save', interface_name])

        try {
            fs.unlinkSync(psk_file);
        } catch (e) {
            console.log(e)
        }
        peerDB.preshared_key = preshared_key
        await peerDB.save()

        const allowed_ip = peer_address.replace(" ","")

        comm = ["set", interface_name, "peer", peerDB.public_key, "allowed-ips", allowed_ip]
        spawn("wg", comm)

        spawn(`wg-quick`, ['save', interface_name])

        peerDB.allowed_ip = peer_address
        peerDB.name = peer_name
        await peerDB.save()



        const interfaceData = await Interfaces.findOne({name: interface_name});
        const response = await getInterfaceData(interface_name, interfaceData)
        return res.status(200).json(response);

    }catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.get("/config/tools", auth, async (req, res) => {
    try{

        let interfaces = []

        const interfacesDB = await Interfaces.find()
        for(const interfaceDB of interfacesDB){
            const status = get_conf_status(interfaceDB.name)
            if(status === "running"){


                const peersDB = await Peers.find({interface_name: interfaceDB.name})
                let peers = []

                for(const peer of peersDB){

                    if(peer.endpoint === "(none)") continue;

                    let ips = []

                    const allowed_ips = peer.allowed_ip.replace(/\s+/g, '').split(",")
                    for(const ipTMP of allowed_ips){
                        const ipArr = ipTMP.split("/")
                        ips.push(ipArr[0])
                    }

                    const endpoint = peer.endpoint.replace(/\s+/g, '').split(":")
                    ips.push(endpoint[0])


                    peers.push({
                        name: peer.name,
                        public_key: peer.public_key,
                        ips
                    })
                }

                interfaces.push({
                    name: interfaceDB.name,
                    peers
                })
            }
        }


        return res.status(200).json({code: 0, interfaces});

    }catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/config/tools/ping", auth, async (req, res) => {
    try{

        const {interface_name, ip, count} = req.body

        const pingData = await ping.promise.probe(ip, {min_reply: Number(count)});


        return res.status(200).json({code: 0, pingData});

    }catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

router.post("/config/tools/traceroute", auth, async (req, res) => {
    try{

        const {interface_name, ip} = req.body

        //const pingData = await ping.promise.probe(ip, {min_reply: Number(count)});

        let traceData = {hop:[]}

        try {
            const tracer = new Traceroute();
            tracer
                .on('pid', (pid) => {
                    traceData.pid = pid
                })
                .on('destination', (destination) => {
                    traceData.destination = destination
                })
                .on('hop', (hop) => {
                    traceData.hop.push(hop)
                })
                .on('close', (code) => {
                    traceData.code = code

                    res.status(200).json({code: 0, traceData: traceData})
                });

            tracer.trace(ip);
        } catch (ex) {
            console.log(ex);
        }

        return;

    }catch (error) {
        console.log(error)
        return res.status(500).json({code: -1, message: "Something went wrong, please try again"})
    }
})

module.exports = router
