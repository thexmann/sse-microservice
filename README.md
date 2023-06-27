# Server-Sent Events (SSE) Server Documentation

This JavaScript application creates a server that uses Server-Sent Events (SSE) to push updates to connected clients. This server also provides several endpoints for managing connections, broadcasting events, and handling system operations.

## Features

    - SSE Connections
    - Connection monitoring
    - Broadcasting events
    - Access control
    - SSL support

## License

Copyright 2023, C. Christmann.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software 
Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
See the GNU General Public License for more details.

See <https://www.gnu.org/licenses/gpl-3.0.en.html> for the terms of this license.

## Prerequisites

The following packages should be installed to run the server:

    - express
    - https
    - fs

You also need to have the SSL certificate files (server.key and server.cert) in the ./ssl directory.

## Code Walkthrough
### Server Configuration

The code starts by importing required modules and initializing an Express app:


> import Express from 'express'
> import https from 'https'
> import fs from 'fs'
> 
> const app = Express()
> app.use(Express.json())

### SSE Connection Handling

Clients can connect to the server by sending a GET request to the '/sse' endpoint. The server then adds the client to its array of connections and begins to send them events:

> app.get('/sse', (req, res) => {
>   // ...
> })

### Event Broadcasting

The server can broadcast events to all connected clients by sending a POST request to the '/bcast' endpoint:

> app.post('/bcast', IsLocal, (req, res) => {
>   // ...
> })

### Connection Monitoring and System Operations

The server provides additional endpoints for monitoring connections and handling system operations:

    GET '/clients' returns the number of connected clients.
    GET '/exit' tries to close the server if there are no connected clients.
    GET '/client' serves the SSEclient.js file.
    GET '/' serves the main.html file.

The '/client' and the '/' endpoints are for testing the server and are only available if the 
'testing' constant global variable is set to true in server.js:

> const testing = true

## Usage
### Server Start

To start the server, run the following command:

> node server.js

You can also specify a host and port number:

> node server.js host:port

For example:

> node server.js xx.xx.xx.xx:9900

### Client Connection

Clients can connect to the SSE server using JavaScript's EventSource object. Here's an example:

> const es = new EventSource('http://serverIP:9900/sse');
> 
> res.addEventListener('service', function (event) { console.log(event.data )}, false); // You are now connected to the SSE server.
> 
> res.addEventListener('message', function (event) { console.log(event.data) }, false); // Logs broadcasted messages.
> 
> res.addEventListener('ping', function (event) { console.log('Ping!') }, false); // Logs when a ping event is received.

### Broadcasting Messages

You can send a POST request to the '/bcast' endpoint to broadcast a message to all clients. Here's an example using fetch:

> fetch('http://localhost:9900/bcast', {
> method: 'POST',
>   headers: {
>     'Content-Type': 'application/json'
>   },
>   body: JSON.stringify({
>     event: 'myEvent',
>     data: 'Hello, world!'
>   })
> });

In this example, a message with the data 'Hello, world!' is broadcasted and the event name is 'myEvent'. The client listening for 'myEvent' will receive this data.

Note: The /bcast endpoint can only be accessed from the local machine (localhost).

### Security

This script checks if the request is from a local IP ('127.0.0.1' or '::1') for the '/bcast', '/clients', and '/exit'.

## Endpoint Definitions

### /sse

A GET request to this endpoint sets up a new SSE client. The server sets up the headers required for SSE and stores the client's details. If the client closes the connection, it will be removed from the server's clients list.

### /bcast

This POST endpoint allows for broadcasting messages to all connected SSE clients. The request body must include the data to be broadcasted. Optionally, the event key can be used to specify the type of the event.

    Note: The /bcast endpoint can only be accessed from the local machine (localhost).

### /clients

This GET endpoint returns the number of currently connected clients.

    Note: This endpoint can only be accessed from the local machine (localhost).

### /exit

This GET endpoint allows the server to be safely shut down if there are no connected clients.

    Note: This endpoint can only be accessed from the local machine (localhost).

### /client

A GET request to this endpoint serves the SSEclient.js file from the server's current working directory.

    Note: This end point can only be access if the global constant 'testing' is set to true.

### /

This endpoint serves a main.html file from the test directory in the server's current working directory.

    Note: This end point can only be access if the global constant 'testing' is set to true.

## Helper Functions

### IsLocal(req, res, next)

This middleware function checks if the request is from a local IP ('127.0.0.1' or '::1') and returns a 403 status code if not.

### Bcast(data, type)

This function broadcasts a message to all connected clients. It formats the data as an SSE message and writes it to all clients.

### CloseHandler(res)

This function removes a client from the server's clients list when the client's connection is closed.

### Server Start

The server listens on the port specified in the command line argument or defaults to port 9900 if no argument is provided. It also sets up a secure HTTPS server using the SSL certificate files (server.key and server.cert) in the ./ssl directory.

> async function start() {  
>   // ... server setup  
> }

## Summary

This server provides a simple yet effective way of managing SSE connections, broadcasting messages, and monitoring connections. It is also equipped with security measures to ensure that certain operations can only be carried out from the local machine.

# Node.js SSEClient Module Documentation

This Node.js module allows for interaction with the Server-Sent Events (SSE) server by providing functions to broadcast messages, get the number of connected clients, and initiate a server shutdown.

## License

Copyright 2023, C. Christmann.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software 
Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
See the GNU General Public License for more details.

See <https://www.gnu.org/licenses/gpl-3.0.en.html> for the terms of this license.

## Prerequisites

    - node-fetch package should be installed in the environment where this module is used.

## Module Functions

This module exports three functions:

    - broadcastMessage(data, eventType): Allows broadcasting messages to the connected clients.
    - getClientsCount(): Retrieves the number of currently connected clients.
    - exitServer(): Initiates a safe server shutdown if there are no connected clients.

### broadcastMessage(data, eventType)

This function sends a POST request to the '/bcast' endpoint of the server with a JSON body containing the data to be sent and the event type. The data parameter can be any JSON serializable data and eventType is an optional string parameter that defaults to 'message'. The function returns a Promise that resolves to the server's response.

### getClientsCount()

This function sends a GET request to the '/clients' endpoint of the server. It returns a Promise that resolves to the number of currently connected clients as a string.

### exitServer()

This function sends a GET request to the '/exit' endpoint of the server. It returns a Promise that resolves to the server's response.

## Usage

First, you need to import the module:

> import { broadcastMessage, getClientsCount, exitServer } from './SSEClient.js'

Assuming the module is saved as 'SSEClient.js'.

Here is an example of how to use these functions:

> 
> async function test() {  // Broadcast a message
>       
>     const bcastResponse = await broadcastMessage('Hello, world!', 'myEvent')  
>     console.log(bcastResponse)  // { success: true }  
> 
>     // Get the number of clients  
>     const clientsCount = await getClientsCount()  
>     console.log(clientsCount)  // The number of clients
> 
>     // Exit the server  
>     const exitResponse = await exitServer()  
>     console.log(exitResponse)  // 'OK' or an error message  
> }
> 
> test()

## Error Handling

Each of the functions in this module uses error handling to throw an error if the fetch request to the server is unsuccessful (response status is not OK). Therefore, when using these functions, make sure to use try-catch blocks to handle potential errors.

For example:

> async function test() {  
>     try {  
>         const bcastResponse = await broadcastMessage('Hello, world!', 'myEvent')  
>         console.log(bcastResponse)  
>     } catch (error) {  
>         console.error('Failed to broadcast message:', error)  
>     }  
> }
> 
> test()

## Security

All function calls in this module will only work when the client is on the same machine as the server. This is due to the access control on the server's endpoints '/bcast', '/clients', and '/exit' to ensure the requests are from a local IP ('127.0.0.1' or '::1').

# JavaScript Web SSEClient Class Documentation

This JavaScript class, SSEClient, provides a framework to create Server-Sent Events (SSE) clients. The client logs incoming messages and handles certain types of events, such as 'message', 'error', 'open', 'close', and 'ping'. If the server fails to send a ping event every 10 seconds, the client logs a warning message.

## License

Copyright 2023, C. Christmann.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software 
Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
See the GNU General Public License for more details.

See <https://www.gnu.org/licenses/gpl-3.0.en.html> for the terms of this license.


## Class Methods

The SSEClient class includes the following methods:

    - constructor(): Initializes a new instance of the SSEClient class.

    - _pvt_initializeEventListeners(): Sets up the event listeners for the SSE connection.

    - logIt(s): Logs a string s to the console.

    - _pvt_handleEvent(type, data): Handles incoming SSE events.

    - RegisterMessageHandler(type, handler): Registers a custom event handler function for a specific event type.

### constructor()

This constructor initializes an instance of the SSEClient class. It creates a new EventSource instance to connect to the '/sse' endpoint of the SSE server. It also sets up default event handlers for 'message', 'error', 'open', 'close', and 'ping' events. Finally, it starts a periodic check every 10 seconds to see if a 'ping' event has been received from the server.

### _pvt_initializeEventListeners()

This method sets up event listeners for the 'error', 'open', 'close', 'message', and 'ping' events on the EventSource instance. Each event listener uses the _pvt_handleEvent(type, data) method to handle the events.

### logIt(s)

This method simply logs the provided string s to the console.

### _pvt_handleEvent(type, data)

This method is used by the event listeners to handle incoming events. It parses the event data from JSON and calls the corresponding event handler function with the parsed data. If there's no handler function for an event type, it logs the event type and data to the console.

### RegisterMessageHandler(type, handler)

This method allows the registration of custom event handler functions for specific event types. If the specified event type does not have an existing listener, it adds one. The provided handler function will be called with the event data when an event of the specified type is received.

## Usage

Here's an example of how to use the SSEClient class:

> // Instantiate the client  
> const client = new SSEClient();
> 
> // Register a custom event handler  
> client.RegisterMessageHandler('myEvent', (data) => {  
>     console.log(`Received myEvent with data: ${data}`);  
> });
> 
> // Now, when the server sends an event of type 'myEvent',   
> // the client will log the event data to the console.

## Error Handling

The _pvt_handleEvent(type, data) method uses a try-catch block to handle potential errors that may occur when parsing the event data from JSON. If parsing fails, the original event data is used instead.

## Note

This class uses private class fields, which are denoted by a _pvt_ prefix. These fields are meant to be accessed only within the class itself and should not be accessed directly from an instance of the class.

# SSE Test Web Page Documentation

This HTML file serves as a test page for the Server-Sent Events (SSE) server. It uses a JavaScript SSE client to connect to the server and handle incoming SSE messages. The page will output the received messages to both the console and an HTML "div" element.

## HTML Structure

The "head" section includes the "title" of the page and a link to the SSE client JavaScript file via a "script" tag. It also includes some minimal CSS styles for the "div" element where the messages are displayed.

The "body" section includes a heading, a "script" tag for initializing the SSE client and registering event handlers, and a "div" element for displaying the received SSE messages.

## JavaScript

The "script" tag in the <body> section initializes a new SSE client and registers event handlers for various types of SSE messages. The 'message', 'service', 'error', 'open', 'close', 'ping', and 'update' event types are handled. The event handler function, Out(s), takes the event data as an argument, converts it to a string if necessary, and appends it to the inner HTML of the "div" element.

## Usage

When loaded in a web browser, this page will connect to the SSE server, listen for incoming messages, and display them in the "div" element. Each new message will be added as a new "p" element, allowing you to see all received messages in chronological order.

## Important Note

Before using this test page, ensure that the constant testing is set to true in the server script. This ensures the server is in test mode and can properly serve the HTML page.
