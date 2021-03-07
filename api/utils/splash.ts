import util from "./util.js";

let splashText = String.raw`
      _   _      _                     _        _   _     
    /   V   \   | |                   | |     /   V   \   
    |       |   | |__   ___  ____ ____| |_    |       |   
     \     /    |  _ \ / _ \/ _  |  __| __|    \     /    
       \ /      | | | |  __/ (_| | |  | |_       \ /      
        *       |_| |_|\___|\__,_|_|   \__|       *       
`;

/**
 * Display the splash screen in the log
 */
export function splash() {
    console.log(splashText);
    showMode();
}

/**
 * Display the current "mode" (process.env.environment)
 */
function showMode () {
    // The length of the splashText lines
    let lineLength = 58;

    console.log('-'.repeat(lineLength));
    console.log(padCenter(` ${util.env.pretty()} Mode <3 `, lineLength, '-'));
    console.log('-'.repeat(lineLength));
    console.log();
}

/**
 * 
 * @param text Text to center
 * @param lineLength Total length of line to center the text on
 * @param padChar Character to use for padding
 */
function padCenter (text: string, lineLength: number, padChar = ' ') {
    return text.padStart( Math.round((lineLength/2) + (text.length/2)), padChar ).padEnd(lineLength, padChar)
}