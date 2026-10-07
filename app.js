const inputDialogue = document.querySelector("#inputDialogue");
const convertButton = document.querySelector("#convertButton");
const copyButton    = document.querySelector("#copyButton");
const dwnldButton   = document.querySelector("#downloadButton");

var result = [];

dwnldButton.addEventListener('click', downloadOutput);
convertButton.addEventListener('click', convertDialogueToJSON);
copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    alert('Output copied to clipboard!');
});


// const KEYBOILERPLATE = 'dialogue.npctravelers';


function convertDialogueToJSON() {
    
    let inputDialogueValue = inputDialogue.value;

    const ar = reformatInput(inputDialogueValue); 
    
    result = new Array();

    var currentDialogue;
    var lastProperty;

    var currentQuestion = null;
    var options = new Array();

    for (let line of ar) {

        if (line === ''){
            continue;
        }

        const elements = line.split('.');
        const id = elements[2];
        const dialogueType = elements[3];
        const entry = findIfIdPresent(id, result);

        if (entry) {

            // Entry with given ID already exists, appending stuff to original entry

            currentDialogue = entry;
        }
        else {

            // Entry with given ID doesn't exist, first instance for given ID

            currentDialogue = {};
            result.push(currentDialogue);
            currentDialogue.id = id;
            currentDialogue.start = elements[3];
            currentDialogue.nodes = {};
            lastProperty = null;
            currentQuestion = null;
            options = new Array();
        }

        if (currentQuestion === null) {
            currentDialogue.nodes[dialogueType] = { textKey: line };
            
            if (lastProperty && !dialogueType.includes('option')) {

                if (dialogueType.includes('response')) {
                    if ((dialogueType.includes(lastProperty.split('_')[1]))){
                        currentDialogue.nodes[lastProperty].next = dialogueType;
                    }
                }
                else {
                    currentDialogue.nodes[lastProperty].next = dialogueType;
                }
            }

            lastProperty = dialogueType;

            if (dialogueType.includes('question')) {
                currentQuestion = dialogueType;
            }
        }
        else {
            if (dialogueType.includes('option')) {
                // currentDialogue.nodes[currentQuestion][dialogueType] = { textKey: line };
                options.push({
                    textKey: line,
                    next: dialogueType.replace('option', 'response')
                });
            }
            else {
                options = options.reverse();
                currentDialogue.nodes[currentQuestion]["choices"] = options;
                options = new Array();
                currentQuestion = null;
                currentDialogue.nodes[dialogueType] = { textKey: line };
            }
        }
    }

    var resultStr = "";

    result.forEach(element => {
        resultStr += JSON.stringify(element, null, 2) + "\n\n";
    });

    document.querySelector("#output").value = resultStr;

}


function reformatInput(input) {
    input = input.replace(/ |"|,/g,'');
    input = input.replace(/:[^\s]+(?=\n)/g,'');
    input = input.replace(/:[^\s]+/g,'');
    input = input.replace(/_0/g, '');
    return String(input).split(/\r?\n/);
}


function findIfIdPresent(id, arr) {
    for (let item of arr) {
        if (item.id !== null && item.id === id) {
            return item;
        }
    }

    return false;
}


function downloadOutput() {
    result.forEach(element => {
        const idArr = element.id.split('_').splice(1);
        var fileName = idArr.join('_');
        downloadObjectAsJson(element, fileName);
    });
}


// Source - https://stackoverflow.com/a/30800715
// Posted by mlimper, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-07, License - CC BY-SA 4.0

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}