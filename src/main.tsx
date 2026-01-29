import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import "./styles/fonts"
// Browser polyfills: bare specifiers required for Vite (node: externalized in browser build)
import process from "process"; // NOSONAR typescript:S7772
import { Buffer } from "buffer"; // NOSONAR typescript:S7772
import EventEmitter from "events"; // NOSONAR typescript:S7772
import axios from "axios";

// CWE-352: Send CSRF token with state-changing requests (from server-injected meta tag)
const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
}

globalThis.global = globalThis;
globalThis.process = process;
globalThis.Buffer = Buffer;
globalThis.process = globalThis.process || process;
globalThis.Buffer = globalThis.Buffer || Buffer;
// @ts-ignore
globalThis.EventEmitter = EventEmitter;

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
)
