import { spawn } from "child_process";
import { isLmRunning } from "../state.js";
let lmProcess = null;
let lmProm;
async function runLm(command, args, { onStderr = console.error, onError = console.error, }) {
    lmProm = new Promise((resolve, reject) => {
        lmProcess = spawn(command, args);
        isLmRunning.value = true;
        let output = '';
        lmProcess.stdout.on('data', (data) => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(data);
            //console.log("Out:", data.toString());
            output += data.toString();
        });
        lmProcess.on("error", (data) => onError(data));
        lmProcess.on("SIGINT", () => {
            //console.log("LM SIGINT");
            process.exit(1);
        });
        lmProcess.on("SIGTERM", () => {
            //console.log("LM SIGTERM");
            process.exit(1);
        });
        lmProcess.on('close', (code) => {
            if (code) {
                if (code === 0) {
                    //console.log("OUT", output);
                    resolve(output);
                }
                else {
                    onError(code);
                    reject(new Error(`Command failed with exit code ${code}`));
                }
            }
            else {
                resolve(output);
            }
        });
    });
}
async function killLm() {
    if (lmProcess !== null) {
        //console.log("Killing lm process");
        lmProcess.kill();
        //console.log("Awaiting process to stop");
        await lmProm;
        //console.log("Process stopped");
        lmProcess = null;
        isLmRunning.value = false;
    } /*else {
      console.log("No lm process to kill")
    }*/
}
export { runLm, killLm };
