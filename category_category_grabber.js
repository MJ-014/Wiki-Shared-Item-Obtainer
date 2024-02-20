async function getJason(url) {
    var arr = [];
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

    return arr
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

async function getSize(url) {
    var arr = [];
    var response = await fetch("https://siivagunner.fandom.com/api.php?action=query&prop=categoryinfo&titles=" + encodeURIComponent(url) + "&format=json&origin=*");
    var jason = await response.json();
    try {
        return jason.query.pages[Object.keys(jason.query.pages)[0]].categoryinfo.size;
    }
    catch (error) {
        document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
    }
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
    var rips1 = [];
    var rips2 = {};

    if (cat == "") {
        alert("Please provide a category.");
        return;
    }

    if (document.getElementById('size').checked) {
        document.getElementById("output").innerHTML = "Working on your request...";

        rips1 = await getJason("https://siivagunner.fandom.com/api.php?action=query&cmtitle=Category:" + encodeURIComponent(cat) + "&list=categorymembers&cmlimit=500&origin=*&format=json");

        document.getElementById("output").innerHTML = "Input category fetched...";

        for (let item of rips1) {
            if (!item.includes("Category:")) {
                rips1.splice(rips1.indexOf(item), 1);
                continue;
            }
            var size = await getSize(item);
            document.getElementById("output").innerHTML = "Counting category items %" + Math.floor((rips1.indexOf(item) / rips1.length) * 100) + " [" + rips1.indexOf(item) + "/" + rips1.length + "]" + "...";
            //rips1[rips1.indexOf(item)] = size + " - " + item;
            rips2[item] = size;
        }

        document.getElementById("output").innerHTML = await dictionaryToString(rips2);
    }
    else {
        var catFilter = "Category:" + document.getElementById("fil").value.split("\n");
        var catNeg = "Category:" + document.getElementById("neg").value.split("\n");

        var rips2 = [];
        var rips3 = [];

        document.getElementById("output").innerHTML = "Working on your request...";

        rips1 = await getJason("https://siivagunner.fandom.com/api.php?action=query&cmtitle=Category:" + encodeURIComponent(cat) + "&list=categorymembers&cmlimit=500&origin=*&format=json");

        document.getElementById("output").innerHTML = "Input category fetched...";

        for (let item of rips1) {
            rips2 = await getCategories(item);
            document.getElementById("output").innerHTML = "Storing inner categories %" + Math.floor((rips1.indexOf(item) / rips1.length) * 100) + " [" + rips1.indexOf(item) + "/" + rips1.length + "]" + "...";
            rips3 = rips3.concat(rips2);
        }

        document.getElementById("output").innerHTML = "Inner categories fetched...";


        if (catFilter != "Category:" || catNeg != "Category:") {
            tempRips = rips3.filter((item, index) => rips3.indexOf(item) === index)
            for (let secondCat of tempRips) {
                document.getElementById("output").innerHTML = "Applying filter %" + Math.floor((tempRips.indexOf(secondCat) / tempRips.length) * 100) + " [" + tempRips.indexOf(secondCat) + "/" + tempRips.length + "]" + "...";
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
        var x = await countOccurrences(rips3);
        document.getElementById("output").innerHTML = await dictionaryToString(x);
    }
}

function checkboxCheck() {
    var x = document.getElementById("extra");
    if (x.style.display === "none") {
        x.style.display = "block";
        document.getElementById("output").innerHTML = "Enter a category in the \"Category\" field.<br>This tool will go through the pages in your inputted category, and count all of their categories<br>So you can see how many categories are in the pages of your desired category!<br><br>The Filter category allows you to filter the result by their own category<br>For example, you can enter the following into that field to get your desired results!<br> <b>&emsp;&emsp;- Playlists:</b> Will show you only the games<br> <b>&emsp;&emsp;- Albums:</b> Will show you only the albums<br> <b>&emsp;&emsp;- Rips by author:</b> Will show you only the rippers<br> <b>&emsp;&emsp;- Rips by month:</b> Will show you only the months<br> And so on!<br>The Negative category will do the opposite, and will remove the category you don't want to see";
    } else {
        x.style.display = "none";
        document.getElementById("output").innerHTML = "Enter a category in the \"Category\" field.<br>This tool will go through the items in your inputted category, and if there are categories in it, will output the size of those categories";
    }
}
