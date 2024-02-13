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

async function getCategories(url) {
    var arr = [];
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

    return arr;
}

async function countOccurrences(inputList) {
    const dictionary = {};

    var x2 = []
    //x2 = await getCategories(rip);
    for (let item of inputList) {
        if (dictionary[item]) {
            dictionary[item]++;
        } else {
            dictionary[item] = 1;
        }
    }

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
    var catFilter = "Category:" + document.getElementById("fil").value.split("\n");
    var catNeg = "Category:" + document.getElementById("neg").value.split("\n");

    var rips1 = [];
    var rips2 = [];
    var rips3 = [];

    if (cat == "") {
        alert("Please provide a category.");
        return;
    }

    document.getElementById("output").innerHTML = "Working on your request...";

    await getJason("https://siivagunner.fandom.com/api.php?action=query&cmtitle=Category:" + encodeURIComponent(cat) + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips1);

    document.getElementById("output").innerHTML = "Input category fetched...";
    
    for (let item of rips1) {
        rips2 = await getCategories(item);
        document.getElementById("output").innerHTML = "Storing inner categories %" + Math.floor((rips1.indexOf(item)/rips1.length)*100) + "...";
        rips3 = rips3.concat(rips2);
    }

    document.getElementById("output").innerHTML = "Inner categories fetched...";


    if (catFilter != "Category:" || catNeg != "Category:") {
        for (let secondCat of rips3.filter((item, index) => rips3.indexOf(item) === index)) {
            document.getElementById("output").innerHTML = "Applying filter %" + Math.floor((rips3.indexOf(secondCat)/rips3.length)*100) + "...";
            categoryCategory = await getCategories(secondCat);
            if (catFilter != "Category:") {
                if (!categoryCategory.includes(catFilter)) {
                    rips3 = rips3.filter(item => item !== secondCat);
                }
            }
            if (catNeg != "Category:") {
                if (categoryCategory.includes(catNeg)) {
                    rips3 = rips3.filter(item => item !== secondCat);
                }
            }
        }
    }

    document.getElementById("output").innerHTML = await dictionaryToString(rips3);
}
