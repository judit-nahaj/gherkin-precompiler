#!/usr/bin/env node
import { run } from "../cli";
import { getDebugger } from "../debug";
const debug = getDebugger("cli");

run();

process.on("unhandledRejection", error => {
    debug("unhandledRejection:\n%s", error);
    process.exit(1);
});