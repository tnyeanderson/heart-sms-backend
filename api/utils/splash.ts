import util from "./util.js";

/**
 * The length of the splashText lines
 */
let splashLineLength = 58;

/**
 * Nice lil graphic
 */
let splashText = String.raw`
      _   _      _                     _        _   _     
    /   V   \   | |                   | |     /   V   \   
    |       |   | |__   ___  ____ ____| |_    |       |   
     \     /    |  _ \ / _ \/ _  |  __| __|    \     /    
       \ /      | | | |  __/ (_| | |  | |_       \ /      
        *       |_| |_|\___|\__,_|_|   \__|       *       
`;

/**
 * Output the entire splash sequence to the log
 */
export function splash() {
    fill();
    showSplash();
    fill();
    showVersion();
    showMode();
    fill();
    emptyLine();
}

/**
 * Output the current "mode" (process.env.environment) to the log
 */
function showMode () {
    console.log(padCenter(` ${util.env.pretty()} Mode <3 `));
}

/**
 * Output the version of heart-sms-backend from package.json to the log
 */
function showVersion () {
    console.log(padCenter(` heart-sms-backend v${process.env.npm_package_version} `));
}

/**
 * Outputs a line of lineLength filled with char to the log
 * @param char Character to repeat
 * @param lineLength Amount of times to repeat char
 */
function fill(char: string = '-', lineLength: number = splashLineLength) {
    console.log(char.repeat(lineLength));
}

/**
 * Output the splashText to the log
 */
function showSplash () {
    console.log(splashText);
}

/**
 * Output an empty line to the log
 */
function emptyLine () {
    console.log();
}

/**
 * 
 * @param text Text to center
 * @param lineLength Total length of line to center the text on
 * @param padChar Character to use for padding
 */
function padCenter (text: string, lineLength = splashLineLength, padChar = '-') {
    return text.padStart( Math.round((lineLength/2) + (text.length/2)), padChar ).padEnd(lineLength, padChar)
}