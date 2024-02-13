async function getJason(url, arr) {
    var response = await fetch(url);
    var jason = await response.json();
    if (jason.continue !== undefined) {
        var cat = await jason.continue.cmcontinue
        try {
            jason.query.categorymembers.forEach(element => {
                arr.push(element.title);
            })
        }
        catch (error) {
            document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
        }
        while (true) {
            var response = await fetch(url + "&cmcontinue=" + cat, { method: 'GET' });
            var jason = await response.json();
            if (jason["continue"] !== undefined) {
                var cat = jason.continue.cmcontinue
            }
            else {
                try {
                    jason.query.categorymembers.forEach(element => {
                        arr.push(element.title);
                    })
                }
                catch (error) {
                    document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
                }
                break;
            }
            try {
                jason.query.categorymembers.forEach(element => {
                    arr.push(element.title);
                })
            }
            catch (error) {
                document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
            }

        }
    }
    else {
        try {
            jason.query.categorymembers.forEach(element => {
                arr.push(element.title);
            })
        }
        catch (error) {
            document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
        }
    }

}

async function getCategories(url, arr) {
    var response = await fetch("https://siivagunner.fandom.com/api.php?action=query&prop=categories&titles=" + encodeURIComponent(url) + "&format=json&origin=*&cllimit=500");
    var jason = await response.json();
    try {
        jason.query.pages[Object.keys(jason.query.pages)[0]].categories.forEach(element => {
            arr.push(element.title);
        });
    }
    catch (error) {
        document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
    }
    /*     while (true) {
            var response = await fetch(url + "&cmcontinue=" + cat, { method: 'GET' });
            var jason = await response.json();
            try {
                var number = jason.query.pages;
                jason.query.pages[number].categories.forEach(element => {
                    arr.push(element.title);
                })
            }
            catch (error) {
                document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
            }
    
        } */
}

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
        !isNaN(parseFloat(str))
}

async function countOccurrences(inputList) {
    const dictionary = {};

    for (let rip of inputList) {
        var x2 = []
        await getCategories(rip, x2);
        for (let item of x2) {
            if (isNumeric(item)) {
                key += '‌';
            }
            if (dictionary[item]) {
                dictionary[item]++;
            } else {
                dictionary[item] = 1;
            }
        }
    };

    console.log(dictionary);
    return dictionary;
}

async function sort_object(obj) {
    var obj = await countOccurrences(obj);
    const entries = Object.entries(obj);
    entries.sort((a, b) => b[1] - a[1]);
    const sortedDictionary = Object.fromEntries(entries);

    return sortedDictionary;
}

async function dictionaryToString(obj) {
    let resultString = '';

    var obj = await sort_object(obj);

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            resultString += `${obj[key]} - ${key.replace('‌', '')}<br>`;
        }
    }

    return resultString.trim();
}

async function main() {
    var cat = document.getElementById("cat").value;
    if (cat == "") {
        alert("Please provide a category.");
        return;
    }

    var rips1 = [];

    document.getElementById("output").innerHTML = "Working on your request...";

    await getJason("https://siivagunner.fandom.com/api.php?action=query&cmtitle=Category:" + encodeURIComponent(cat) + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips1);

    document.getElementById("output").innerHTML = await dictionaryToString(rips1);
}
