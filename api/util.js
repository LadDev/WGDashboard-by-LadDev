import { execSync } from 'child_process';

/**
 * Helper Functions
 */

// Regex Match
function regex_match(regex, text) {
    const pattern = new RegExp(regex);
    return pattern.test(text);
}

// Check IP format
function check_IP(ip) {
    const ip_patterns = [
        '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.|$)){4}',
        '[0-9a-fA-F]{0,4}(:([0-9a-fA-F]{0,4})){1,7}$'
    ];
    for (const match_pattern of ip_patterns) {
        const match_result = regex_match(match_pattern, ip);
        if (match_result) {
            return match_result;
        }
    }
    return null;
}

// Clean IP
function clean_IP(ip) {
    return ip.replace(' ', '');
}

// Clean IP with range
function clean_IP_with_range(ip) {
    return clean_IP(ip).split(',');
}

// Check IP with range
function check_IP_with_range(ip) {
    const ip_patterns = [
        '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.|\\/)){4}([0-9]{1,2})(,|$)',
        '[0-9a-fA-F]{0,4}(:([0-9a-fA-F]{0,4})){1,7}\\/([0-9]{1,3})(,|$)'
    ];
    for (const match_pattern of ip_patterns) {
        const match_result = regex_match(match_pattern, ip);
        if (match_result) {
            return match_result;
        }
    }
    return null;
}

// Check allowed ips list
function check_Allowed_IPs(ip) {
    ip = clean_IP_with_range(ip);
    for (const i of ip) {
        if (!check_IP_with_range(i)) {
            return false;
        }
    }
    return true;
}

// Check DNS
function check_DNS(dns) {
    dns = dns.replace(' ', '').split(',');
    for (const i of dns) {
        if (
            !(
                check_IP(i) ||
                regex_match('(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z][a-z]{0,61}[a-z]', i)
            )
        ) {
            return false;
        }
    }
    return true;
}

// Check remote endpoint
function check_remote_endpoint(address) {
    return (
        check_IP(address) ||
        regex_match('(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z][a-z]{0,61}[a-z]', address)
    );
}

// function deletePeers(config_name, delete_keys, cur, db) {
//     const sql_command = [];
//     const wg_command = ['wg', 'set', config_name];
//     for (const delete_key of delete_keys) {
//         if (!dashboard.get_conf_peer_key(config_name).includes(delete_key)) {
//             return 'This key does not exist';
//         }
//         sql_command.push(`DELETE FROM ${config_name} WHERE id = '${delete_key}';`);
//         wg_command.push('peer', delete_key, 'remove');
//     }
//     try {
//         console.log('deleting...');
//         const remove_wg = execSync(wg_command.join(' '), { shell: true, stdio: 'pipe' });
//         const save_wg = execSync(`wg-quick save ${config_name}`, { shell: true, stdio: 'pipe' });
//         cur.executescript(sql_command.join(' '));
//         db.commit();
//     } catch (error) {
//         return error.output.toString().trim();
//     }
//     return 'true';
// }

// function checkJSONAllParameter(required, data) {
//     if (Object.keys(data).length === 0) {
//         return false;
//     }
//     for (const i of required) {
//         if (!(i in data) || data[i].length === 0) {
//             return false;
//         }
//     }
//     return true;
// }

export {
    check_Allowed_IPs,
    check_DNS,
    check_IP,
    check_IP_with_range,
    check_remote_endpoint,
    clean_IP,
    clean_IP_with_range,
    // deletePeers,
    // checkJSONAllParameter
};
