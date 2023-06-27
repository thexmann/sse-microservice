/*
* Program: SSEClient - for web page use 
* This JavaScript class, SSEClient, provides a framework to create Server-Sent Events 
* (SSE) clients. The client logs incoming messages and handles certain types of 
* events, such as 'message', 'error', 'open', 'close', and 'ping'. If the server 
* fails to send a ping event every 10 seconds, the client logs a warning message.
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

class SSEClient {
	constructor() {
		this._pvt_ping = true
		this._pvt_messageHandlers = {
			message: (s) => this.logIt(`Message: ${s}`),
			error: (s) => this.logIt(`Error: ${s}`),
			open: (s) => this.logIt(`Open: ${s}`),
			close: (s) => this.logIt(`Close: ${s}`),
			ping: (s) => this.logIt(`Close: ${s}`),
			noping: (s) => { }
		}
		this.eventSource = new EventSource('/sse')
		this._pvt_initializeEventListeners()

		setInterval(() => {
			if (!this._pvt_ping) {
				console.error("No ping detected - server may be down!")
				if (this._pvt_messageHandlers['noping']) this._pvt_messageHandlers['noping']
			}
			this._pvt_ping = false
		}, 10000)
	}

	_pvt_initializeEventListeners() {
		this.eventSource.onerror = (event) => {
			const eventType = event.type;
			const eventData = event.data;
			this._pvt_handleEvent(eventType, eventData);
		}

		this.eventSource.onopen = (event) => {
			const eventType = event.type;
			const eventData = event.data;
			this._pvt_handleEvent(eventType, eventData);
		}

		this.eventSource.onclose = (event) => {
			const eventType = event.type;
			const eventData = event.data;
			this._pvt_handleEvent(eventType, eventData);
		}

		this.eventSource.addEventListener('message', (event) => {
			const eventType = event.type;
			const eventData = event.data;
			this._pvt_handleEvent(eventType, eventData);
		})

		this.eventSource.addEventListener('ping', (event) => {
			const eventType = event.type;
			const eventData = event.data;
			this._pvt_ping = true
			this._pvt_handleEvent(eventType, eventData);
		})
	}

	logIt(s) {
		console.log(s)
	}

	_pvt_handleEvent(type, data) {
		const edata = data || " == "
		try {
			data = JSON.parse(data)
		}
		catch (e) { }

		if (!this._pvt_messageHandlers[type]) {
			return console.log(`** Unknown type: ${type}, DATA: ${edata}`)
		}
		const handler = this._pvt_messageHandlers[type]
		if (handler) {
			handler(edata)
		}
	}

	RegisterMessageHandler(type, handler) {
		if (!this._pvt_messageHandlers[type]) {
			this.eventSource.addEventListener(type, (event) => {
				const eventType = event.type
				const eventData = event.data
				this._pvt_handleEvent(eventType, eventData)
			})
		}
		this._pvt_messageHandlers[type] = handler
	}
}

