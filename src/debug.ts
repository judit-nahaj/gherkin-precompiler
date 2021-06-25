import debug = require("debug");

export const getDebugger = (m: string):debug.Debugger => debug(`gherking:${m}`);