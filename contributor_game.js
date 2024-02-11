async function getJason(url, arr){
    var response = await fetch(url);
    var jason = await response.json();
    if(jason.continue !== undefined){
        var cont = await jason.continue.cmcontinue
        try{
            jason.query.categorymembers.forEach(element => {
                arr.push(element.title);
            })
        }
        catch(error){
            document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
        }
        while(true){
            var response = await fetch(url + "&cmcontinue=" + cont, {method: 'GET'});
            var jason = await response.json();
            if(jason["continue"] !== undefined){
                var cont = jason.continue.cmcontinue
            }
            else{
                try{
                    jason.query.categorymembers.forEach(element => {
                        arr.push(element.title);
                    })
                }
                catch(error){
                    document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
                }
                break;
            }
            try{
                jason.query.categorymembers.forEach(element => {
                    arr.push(element.title);
                })
            }
            catch(error){
                document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
            }
            
        }
    }
    else{
        try{
            jason.query.categorymembers.forEach(element => {
                arr.push(element.title);
            })
        }
        catch(error){
            document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
        }
    }

}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

function countOccurrences(inputList) {
    const dictionary = {};
    const banned = ['Super Goomba Bros. Music', 'Super Mario Bros. Music', 'All Night Nippon Super Mario Bros. Music', 'Super Mario All Stars', 'Super Mario All-Stars', 'Super Mario 3D All Stars', 'Super Mario 3D All-Stars', 'Donkey Kong Music', 'Donkey Kong Jr. Music', 'Donkey Kong Jr. Math Music'];

    inputList.forEach(item => {
        var flag = true;
        banned.forEach(w => {
            if(item.includes(w)){
                if (dictionary[w]) {
                    dictionary[w]++;
                } else {
                    dictionary[w] = 1;
                }
                flag = false;
            }
        })
        if(flag){
            const parts = item.split(' - ');
            var key = parts[1];
            if(isNumeric(key)){
                key += '‌';
            }

            if (dictionary[key]) {
                dictionary[key]++;
            } else {
                dictionary[key] = 1;
            }
        }
    });

    return dictionary;
}

function sort_object(obj) {
    const entries = Object.entries(obj);
    entries.sort((a, b) => b[1] - a[1]);
    const sortedDictionary = Object.fromEntries(entries);

    return sortedDictionary;
}


function dictionaryToString(obj) {
    let resultString = '';

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            resultString += `${obj[key]} - ${key.replace('‌', '')}<br>`;
        }
    }

    return resultString.trim();
}

async function main(){
    var cont = document.getElementById("cont").value;
    if(cont == ""){
        alert("Please provide a contributor.");
        return;
    }

    var rips1 = [];

    document.getElementById("output").innerHTML = "Working on your request...";
    
    await getJason("https://siivagunner.fandom.com/api.php?action=query&cmtitle=Category:" + encodeURIComponent(cont) + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips1); 
    
    document.getElementById("output").innerHTML = dictionaryToString(sort_object(countOccurrences(rips1)));
}
