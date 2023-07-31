const cron = require('node-cron');
const {exec} = require("child_process");
const {DateTime} = require("luxon");
const Interfaces = require("./models/Interfaces");
const InterfacesTransfer = require("./models/InterfacesTransfer");
const Peers = require("./models/Peers");
const PeersTransfer = require("./models/PeersTransfer");
const IPLogs = require("./models/IPLogs");
const { config } = require('dotenv')
const mongoose = require("mongoose");
config()

async function start(){
    try{
        mongoose.set('strictQuery', false);
        // Устанавливаем соединение с базой данных MongoDB
        await mongoose.connect(process.env.DATABASE, {
            useUnifiedTopology: true,
        })

    }catch (e){
        // В случае ошибки выводим сообщение об ошибке в консоль
        console.log("Server Error:", e.message)
        process.exit(0)
    }
}

start().then(()=>{

})

function getConfHandshakePeerInfo(configName) {
    config()

    const now = DateTime.local();
    const timeDelta = { minutes: 2 };
    let runningPeers = 0;

    return new Promise((resolve, reject) => {

        exec(`wg show ${configName} latest-handshakes`, async (error, stdout, stderr) => {
            if (error) {
                await Peers.updateMany({},{status: "offline"},{});
                await Interfaces.updateMany({name: configName},{runnedClients: 0},{});
                reject()
                //reject(new Error(`Command execution error: ${error.message}`));
                return;
            }
            if (stderr) {
                reject(new Error(`Command error output: ${stderr}`));
                return;
            }

            const peers = stdout.trim().split("\n");

            for(const peer of peers){
                const peerArr = peer.split("\t")

                const peerPublicKey = peerArr[0]

                const peerDB = await Peers.findOne({interface_name: configName, public_key: peerPublicKey})

                if(peerDB){
                    const timestamp = parseInt(peerArr[1], 10);
                    //console.log(timestamp)
                    const handshakeTime = DateTime.fromMillis(timestamp * 1000);

                    peerDB.latest_handshake = `${timestamp}`

                    if (handshakeTime > now.minus(timeDelta)) {
                        peerDB.status = "online"
                        runningPeers += 1
                    }else{
                        peerDB.status = "offline"
                    }

                    await peerDB.save()
                }


            }

            await Interfaces.updateMany({name: configName},{runnedClients: runningPeers},{});

            resolve(runningPeers);
        });

        exec(`wg show ${configName} endpoints`, async (error, stdout, stderr) => {
            if (error) {
                reject()
                //reject(new Error(`Command execution error: ${error.message}`));
                return;
            }
            if (stderr) {
                reject(new Error(`Command error output: ${stderr}`));
                return;
            }

            const peers = stdout.trim().split("\n");

            for(const peer of peers){
                const peerArr = peer.split("\t")

                const peerPublicKey = peerArr[0]

                const peerDB = await Peers.findOne({interface_name: configName, public_key: peerPublicKey})

                if(peerDB){
                    peerDB.endpoint = `${peerArr[1]}`

                    const ipsDB = await IPLogs.findOne({peerID: peerDB.id})
                    const ips = peerArr[1].split(":")
                    if(!ipsDB){
                        const ipsDBNew = new IPLogs({
                            peerID: peerDB.id,
                            ips: [ips[0]]
                        })
                        await ipsDBNew.save()
                    }else{
                        const newIPS = ipsDB.ips.filter((iptmp)=> iptmp !== ips[0])
                        ipsDB.ips = [...newIPS,ips[0]]
                        await ipsDB.save()
                    }

                    await peerDB.save()
                }
            }

            resolve(runningPeers);
        });

        exec(`wg show ${configName} transfer`, async (error, stdout, stderr) => {
            if (error) {
                reject()
                //reject(new Error(`Command execution error: ${error.message}`));
                return;
            }
            if (stderr) {
                reject(new Error(`Command error output: ${stderr}`));
                return;
            }

            const peers = stdout.trim().split("\n");

            let total_sent = 0
            let total_receive = 0

            let intr_sent_calc = 0
            let intr_receive_calc = 0

            for(const peer of peers){
                const peerArr = peer.split("\t")

                const peerPublicKey = peerArr[0]

                const peerDB = await Peers.findOne({interface_name: configName, public_key: peerPublicKey})

                let peer_sent_calc = 0
                let peer_receive_calc = 0

                total_sent += Number(peerArr[2])
                total_receive += Number(peerArr[1])

                if(peerDB){

                    let ts = Number(peerArr[2])
                    let tr = Number(peerArr[1])

                    peer_sent_calc = ts- Number(peerDB.total_sent)
                    peer_receive_calc = tr - Number(peerDB.total_receive)

                    if(peer_sent_calc < 0){
                        peer_sent_calc = 0
                    }
                    if(peer_receive_calc < 0){
                        peer_receive_calc = 0
                    }


                    if(ts < Number(peerDB.total_sent) && tr < Number(peerDB.total_receive)){
                        peerDB.last_transfer = {
                            total_sent: Number(peerDB.last_transfer.total_sent) + Number(peerDB.total_sent),
                            total_receive: Number(peerDB.last_transfer.total_receive) + Number(peerDB.total_receive),
                            total_data: Number(peerDB.last_transfer.total_data) + (Number(peerDB.total_sent) + Number(peerDB.total_receive))
                        }
                        await peerDB.save()
                    }



                    peerDB.total_sent = `${ts}`
                    peerDB.total_receive = `${tr}`
                    await peerDB.save()
                }

                if(peer_sent_calc !== 0 || peer_receive_calc !== 0){

                    intr_sent_calc += peer_sent_calc
                    intr_receive_calc += peer_receive_calc

                    const peerTransferDB = await PeersTransfer.findOne({interface_name: configName, public_key: peerPublicKey})
                    if(!peerTransferDB){
                        const newPeerTransferDB = new PeersTransfer({
                            interface_name: configName,
                            public_key: peerPublicKey,
                            transfers: [
                                {sent: Number(peer_sent_calc), receive: Number(peer_receive_calc), time: Date.now()}
                            ]
                        })
                        await newPeerTransferDB.save()
                    }else{
                        let trans = [...peerTransferDB.transfers]
                        if(trans.length >= 50){
                            trans.splice(0, 1);
                        }
                        trans.push(
                            {sent: Number(peer_sent_calc), receive: Number(peer_receive_calc), time: Date.now()}
                        )

                        peerTransferDB.transfers = trans
                        await peerTransferDB.save()
                    }
                }

            }

            const intrDB = await Interfaces.findOne({name: configName})

            if(intrDB){
                //intr_sent_calc = Number(total_sent) - Number(intrDB.total_sent)
                //intr_receive_calc = Number(total_receive) - Number(intrDB.total_receive)

                intrDB.total_receive = !isNaN(total_receive)?total_receive:0
                intrDB.total_sent = !isNaN(total_sent)?total_receive:0
                intrDB.total_data = !isNaN(total_sent + total_receive)?total_sent + total_receive:0
                await intrDB.save()

                if(intr_sent_calc > 0 || intr_receive_calc > 0){
                    const intrTransferDB = await InterfacesTransfer.findOne({interface_name: configName})
                    if(!intrTransferDB){
                        const newInterTransferDB = new InterfacesTransfer({
                            interface_name: configName,
                            transfers: [
                                {sent: Number(intr_sent_calc), receive: Number(intr_receive_calc), time: Date.now()}
                            ]
                        })
                        await newInterTransferDB.save()
                    }else{
                        let trans = [...intrTransferDB.transfers]
                        if(trans.length >= 50){
                            trans.splice(0, 1);
                        }

                        trans.push(
                            {sent: Number(intr_sent_calc), receive: Number(intr_receive_calc), time: Date.now()}
                        )

                        intrTransferDB.transfers = trans
                        await intrTransferDB.save()
                    }
                }
            }

            resolve(runningPeers);
        });

        exec(`wg show ${configName} allowed-ips`, async (error, stdout, stderr) => {
            if (error) {
                reject()
                //reject(new Error(`Command execution error: ${error.message}`));
                return;
            }
            if (stderr) {
                reject(new Error(`Command error output: ${stderr}`));
                return;
            }

            const peers = stdout.trim().split("\n");

            for(const peer of peers){
                const peerArr = peer.split("\t")

                const peerPublicKey = peerArr[0]

                const peerDB = await Peers.findOne({interface_name: configName, public_key: peerPublicKey})

                if(peerDB){

                    const ips = peerArr[1].split(" ")

                    peerDB.allowed_ip = `${ips.join(", ")}`

                    await peerDB.save()
                }
            }

            resolve(runningPeers);
        });
    });
}


const yourTask = async () => {
    try{
        const interfaces = await Interfaces.find({})
        if(interfaces && interfaces.length > 0){
            for(const intrDB of interfaces){
                await getConfHandshakePeerInfo(intrDB.name)
            }
        }
    }catch (error) {
        console.error(error)
    }
}

// Создайте задачу, которая будет выполняться каждые 10 секунд
const task = cron.schedule('*/15 * * * * *', ()=>{
    return yourTask();
});

// Запустите задачу
task.start();
