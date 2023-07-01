/*
* Program: sse-microservice 
* This JavaScript application creates a server that uses Server-Sent Events (SSE) 
* to push updates to connected clients. This server also provides several endpoints 
* for managing connections, broadcasting events, and handling system operations.
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
* Other software is provided along with this application to assist in using it:
*	/webClient/SSEclient.js - to be uesed in your user interface web page,
*	/node/Client/SSEClient.js - to be used along with your Node JS application to 
*		call the SSE Server endpoints,
*	/test/main.html - used to test the functionality of the server,
*	/test/test.rest - to be used with the VS Code REST Client for testing.
* These software components are licensed under the GPL 3+ licensing.
*
* See the readme.md for details on using this application and its associated components.
*/

import Express from 'express'
import https from 'https'
import fs from 'fs'

const testing = false

const app = Express()
app.use(Express.json())

// Create an array to store connected SSE clients
const clients = []

// Define a route to handle SSE client connections
app.get('/sse', (req, res) => {
	// Create a new SSE client
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Add the client to the array
	res.ip = req.ip
	res.req = null
	clients.push(res)

	// Send initial SSE message to the client
	res.write('event: service\n')
	const msg = "You are now connected to the SSE server."
	res.write(`data: ${msg}\n\n`)
	console.log("SSE Connection from ", res.ip)

	// Register the close event listener
	res.on('close', () => {
		clearInterval(res.interval);
		CloseHandler(res)
		console.log("SSE Disconnection from ", res.ip)
	})
})

// Define a route to receive REST input
app.post('/bcast', IsLocal, (req, res) => {
	// Get the data from the request body
	const event = req.body.event || null
	Bcast(req.body, event)
	res.send({ success: true })
})

app.get('/clients', IsLocal, (req, res) => {
	res.status(200).send(`${clients.length}`)
})

app.get('/exit', IsLocal, (req, res) => {
	if (clients.length === 0) {
		setTimeout(() => process.exit(0), 500)
		return res.send("OK")
	}
	res.status(503).end()
})

if (testing) {
	app.get("/client", (req, res) => {
		let cwd = process.cwd()
		res.sendFile(`${cwd}/webClient/SSEclient.js`)
	})

	app.get("/", (req, res) => {
		let cwd = process.cwd()
		res.sendFile(`${cwd}/test/main.html`)
	})
}


function IsLocal(req, res, next) {
	if (req.ip !== '127.0.0.1' && req.ip !== '::1') {
		return res.status(403).send('Forbidden')
	}
	next()
}

function Bcast(data, type) {
	let output = ""
	// Process the data or perform any necessary operations
	if (typeof data === 'object')
		data = JSON.stringify(data)
	// create the output
	if (type)
		output = `event: ${type}\n`
	else
		output = "event: message\n"
	output += `data: ${data}\n\n`
	// Send the data as SSE message to all connected clients
	clients.forEach((client) => {
		client.write(output)
	})
}


function CloseHandler(res) {
	// Remove the client from the array when disconnected
	clearInterval(res.interval)
	const index = clients.indexOf(res)
	if (index !== -1) {
		clients.splice(index, 1)
	}
}

const interval = setInterval(() => {
	Bcast({ 'type': 'ping', 'data': '' }, 'ping')
}, 10000);


// Start the server
async function start() {
	const options = {
		key: fs.readFileSync('./ssl/server.key'),
		cert: fs.readFileSync('./ssl/server.cert')
	}
	try {
		const split = process.argv[2] ? process.argv[2].split(":") : ""
		if (split.length && split[0].indexOf("http"))
			clients.splice(0, 1)
		const port = split[1] || 9900
		const host = split[0] || '0.0.0.0'
		const server = https.createServer(options, app);

		server.listen(port, host, () => {
			console.log(`SSE Server listening on ${host} port ${port}`)
		})
		const lhost = "127.0.0.200"
		server.listen(port, host, () => {
			console.log(`SSE Server listening on ${lhost} port ${port}`)
		})

	} catch (err) {
		console.error(err)
		process.exit(1)
	}
}

start()
