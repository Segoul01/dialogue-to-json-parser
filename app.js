const inputDialogue = document.querySelector("#inputDialogue");
const convertButton = document.querySelector("#convertButton");
const copyButton    = document.querySelector("#copyButton");

var result = [];

convertButton.addEventListener('click', convertDialogueToJSON);
copyButton.addEventListener('click', () => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)) });

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
                options.reverse;
                currentDialogue.nodes[currentQuestion]["choices"] = options;
                options = new Array();
                currentQuestion = null;
                currentDialogue.nodes[dialogueType] = { textKey: line };
            }
        }
    }


    document.querySelector("#output").value = JSON.stringify(result, null, 2);

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