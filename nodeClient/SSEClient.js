/*
* Program: SSEclient - for use as a Node JS module 
* This Node.js module allows for interaction with the Server-Sent Events (SSE) 
* server by providing functions to broadcast messages, get the number of connected 
* clients, and initiate a server shutdown.
*
* copyright 2023, C. Christmann
*	 This program is free software: you can redistribute it and/or modify it under
*	 the terms of the GNU General Public License as published by the Free Software 
*	 Foundation, either version 3 of the License, or (at your option) any later version.
*
*	This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
*	without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
*	See the GNU General Public License for more details.
*
*	See <https://www.gnu.org/licenses/gpl-3.0.en.html> for the terms of this license.
*
* See the readme.md for details on using this application and its associated components.
*/

import fetch from 'node-fetch'

const SERVER_URL = 'http://127.0.0.200:9900'

async function broadcastMessage(data, eventType = 'message') {
    const response = await fetch(`${SERVER_URL}/bcast`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event: eventType, data }),
    })
    if (!response.ok) {
        throw new Error('Failed to broadcast message')
    }
    return await response.json()
}

async function getClientsCount() {
    const response = await fetch(`${SERVER_URL}/clients`)
    if (!response.ok) {
        throw new Error('Failed to get clients count')
    }
    return await response.text()
}

async function exitServer() {
    const response = await fetch(`${SERVER_URL}/exit`)
    if (!response.ok) {
        throw new Error('Failed to exit server')
    }
    return await response.text()
}

module.exports = {
    broadcastMessage,
    getClientsCount,
    exitServer,
}
