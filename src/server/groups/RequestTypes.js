'use strict';
var debug = require('debug');
var log = debug('NetsBlox:RequestTypes:log');
var Requests = {
        /**
         * Register the socket's role.
         *
         * @param {WebSocket} socket
         * @param {Array<String>} msg
         * @return {undefined}
         */
        register: function(socket, msg) {
            var role = msg.shift();  // record the roleId
            console.log('registering '+socket.id+' as '+role);
            this.socket2Role[socket.id] = role;
        },

        /**
         * Change the paradigm with in the given GameType.
         *
         * @param {WebSocket} socket
         * @param {Array<String>} msg
         * @return {undefined}
         */
        paradigm: function(socket, msg) {
            // Set the paradigm for this message
            var name = msg.shift();
            if (this.paradigmManager.isValidParadigm(name)) {
                // Leave the current paradigm
                this.leaveParadigmInstance(socket);

                // Join the new one
                this.joinParadigmInstance(socket, null, name);
                log('Moved '+socket.id+' to '+name);
                return;
            }
            // TODO: Log an error
        },

        gameType: function(socket, msg) {
            var name = msg.join(' ');

            this.leaveParadigmInstance(socket);
            this.joinParadigmInstance(socket, name, null);
            log('Moved '+socket.id+' to game type: '+name);
            // TODO: Log an error
        },

        /**
         * Message to be emitted to the user's peers wrt the given paradigm.
         *
         * @param {WebSocket} socket
         * @param {Array<String>} msg
         * @return {undefined}
         */
        message: function(socket, msg) {
            var role,
                peers,
                paradigm;
            // broadcast the message, role to all peers
            paradigm = this.paradigmManager.getParadigmInstance(socket);
            role = this.socket2Role[socket.id];
            msg.push(role);
            log('About to broadcast '+msg.join(' ')+
                        ' from socket #'+socket.id+' ('+role+')');
            peers = paradigm.getGroupMembersToMessage(socket);
            this.broadcast(msg.join(' '), peers);
        }
};
module.exports = Requests;