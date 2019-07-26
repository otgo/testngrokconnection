var spawn = require('child_process').spawn;
var requestSync = require('sync-request')
var bin_dir = __dirname + '/bin'
/*
--auth               enforce basic auth on tunnel endpoint, 'user:password'
--authtoken          ngrok.com authtoken identifying a user
--bind-tls "both"    listen for http, https or both: true/false/both
--config             path to config files; they are merged if multiple
--host-header        set Host header; if 'rewrite' use local address hostname
--hostname           host tunnel on custom hostname (requires DNS CNAME)
--inspect            enable/disable http introspection
--log "false"        path to log file, 'stdout', 'stderr' or 'false'
--log-format "term"  log record format: 'term', 'logfmt', 'json'
--log-level "info"   logging level
--region             ngrok server region [us, eu, au, ap, sa, jp, in] (default: us)
--subdomain          host tunnel on a custom subdomain
*/

class Ngrok {
    constructor(_) {
        var Success = false;
        var options = [ 'http', '80' ] // default options
        var protocol = 'http'
        if (typeof(_) == 'object') {
            Object.keys(_).forEach(function(variable) {
                var value = _[variable]
                if (value != null) {
                    switch (variable) {
                        case 'protocol':
                            var protocol = value;
                            switch (protocol) {
                                case 'http':
                                case 'tcp':
                                case 'tls':
                                    options[0] = protocol;
                                    break;
                                default:
                                    throw `Protocol ${protocol} not supported`;
                            }
                            break;
                        case 'port':
                            var port = value;
                            if (typeof(port) != 'number') {
                                throw 'Port must be a number'
                            } else {
                                options[1] = port;
                            }
                            break;
                        case 'hostname':
                            var hostname = value;
                            options.push('--hostname=' + hostname);
                            break;
                        case 'auth':
                            var auth = value;
                            if (typeof(auth) != 'object') {
                                throw 'Auth must be an object: {user:your_user, password:\'123456\'}';
                            } else {
                                if (! auth.user || ! auth.password) {
                                    throw 'Auth must contains user and password: {user:your_user, password:\'123456\'}';
                                } else {
                                    options.push('--auth=' + auth.user + ':' + auth.password);
                                }
                            }
                            break;
                        case 'authtoken':
                            var authtoken = value;
                            options.push('--authtoken=' + authtoken);
                            break;
                        case 'bind_tls':
                            var bind_tls = value;
                            if (typeof(bind_tls) != 'boolean') {
                                throw 'Option bind_tls must be: true, false or both';
                            }
                            options.push('--bind-tls=' + bind_tls.toString());
                            break;
                        case 'config':
                            var config = value;
                            options.push('--config=' + config);
                            break;
                        case 'host_header':
                            var host_header = value;
                            options.push('--host-header=' + host_header);
                            break;
                        case 'inspect':
                            var inspect = value;
                            if (typeof(inspect) != 'boolean') {
                                throw 'Option inspect must be: true or false';
                            }
                            options.push('--inspect=' + inspect.toString());
                            break;
                        case 'region':
                            var region = value;
                            switch (region) {
                                case 'us':
                                case 'eu':
                                case 'au':
                                case 'ap':
                                case 'sa':
                                case 'jp':
                                case 'in':
                                    options.push('--region=' + region);
                                    break;
                                default:
                                    throw 'Region not supported, must be: us, eu, au, ap, sa, jp or in';
                            }
                            break;
                        case 'subdomain':
                            var subdomain = value;
                            options.push('--subdomain=' + subdomain);
                            break;
                        case 'path':
                            var path = value;
                            bin_dir = path;
                            break;
                        default:
                            throw `Option ${variable} not supported`;
                    }
                }
                console.log(variable + ' = ' + value);
            });
        }
        var ngrok  = spawn('./ngrok', options, {cwd:bin_dir});
        ngrok.stdout.on('data', (data) => {
            console.log("DATAA")
            var stdout_text = data.toString().trim();
            var got_error = stdout_text.search(/[Ee][Rr][Rr][Oo][Rr]/);
            if (got_error) {
                var error_text = stdout_text.substring(got_error);
                var error = new Error(error_text);
                throw error;
            }
            console.log(stdout_text);
        });
        ngrok.stderr.on('data', (data) => {
            var stderr_text = data.toString().trim();
            throw stderr_text;
        });
        process.on('SIGINT', () => {
            ngrok.kill();
        })
        process.on('exit', () => {
            ngrok.kill();
        });
    }
}


const ngrok = new Ngrok({
        protocol: 'http'
});
