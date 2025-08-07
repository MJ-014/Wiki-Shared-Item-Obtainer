async function getJason(url, arr) {
    // Get category length
    try {
        var countJason = await fetch("https://" + wiki + "/api.php?action=query&prop=categoryinfo&titles=Category:" + url + "&origin=*&format=json")
        var countJasonJason = await countJason.json();
        var size = countJasonJason.query.pages[Object.keys(countJasonJason.query.pages)[0]].categoryinfo.size;
        var count = 0;
    }
    catch (error) {
        document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
    }

    // Getting category items
    // Getting first set of items
    var response = await fetch("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + url + "&list=categorymembers&cmlimit=500&origin=*&format=json", { method: 'GET' });
    var jason = await response.json();

    try {
        jason.query.categorymembers.forEach(element => {
            count += 1;
            document.getElementById("output").innerHTML = "Getting categories %" + Math.floor((count / size) * 100) + " [" + count + "/" + size + "]" + "...";
            arr.push(element.title);
        })
    }
    catch (error) {
        document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
    }

    // Getting the rest of the items
    while (jason.continue !== undefined) {
        var cont = await jason.continue.cmcontinue
        
        var response = await fetch("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + url + "&list=categorymembers&cmlimit=500&origin=*&format=json&cmcontinue=" + cont, { method: 'GET' });
        var jason = await response.json();
        
        // Checks to see if the new batch has continue or not
        if (jason.continue !== undefined) var cont = jason.continue.cmcontinue

        try {
            jason.query.categorymembers.forEach(element => {
                count += 1;
                document.getElementById("output").innerHTML = "Getting categories %" + Math.floor((count / size) * 100) + " [" + count + "/" + size + "]" + "...";
                arr.push(element.title);
            })
        }
        catch (error) {
            document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
        }

    }
}

async function intersection(first, second) {
    var s = new Set(second);
    return first.filter(item => s.has(item));
};

var wiki
var tempCatName1;
var tempCatName2;
var rips1Temp = [];
var rips2Temp = [];
var methodTemp;

async function main() {
    // Get wiki
    wiki = document.getElementById("wiki").value;
    if (wiki == "") {
        alert("Please provide a wiki.");
        return;
    }
    wiki = wiki.replace("https://", "");
    wiki = wiki.replace("http://", "");

    // Get items
    var catName1 = document.getElementById("cat1").value.split("\n");
    var catName2 = document.getElementById("cat2").value.split("\n");

    // Lists and such
    var rips1 = [];
    var rips2 = [];
    var rips2_1 = [];
    const badCharacters = ['%', '&', '?']

    document.getElementById("output").innerHTML = "Working on your request...";

    // Category 1
    if (JSON.stringify(tempCatName1) != JSON.stringify(catName1)) {
        for (let item of catName1) {
            if (badCharacters.some(el => item.includes(el))) await getJason(encodeURIComponent(item), rips1);
            else await getJason(item, rips1);
        }
        rips1Temp = rips1;
        tempCatName1 = catName1;
    }
    else rips1 = rips1Temp;

    // Category 2
    if (JSON.stringify(tempCatName2) != JSON.stringify(catName2)) {
        if (catName2 == "") rips2 = rips1;
        else {
            for (let item of catName2) {
                if (badCharacters.some(el => item.includes(el))) await getJason(encodeURIComponent(item), rips2_1);
                else await getJason(item, rips2_1);

                rips2 = rips2_1
            }
        }
        rips2Temp = rips2;
        tempCatName2 = catName2;
    }
    else rips2 = rips2Temp;

    // Get rid of duplicate items in rips1
    rips1_1 = new Set(rips1)
    rips1 = Array.from(rips1_1);

    // Intersect rips1 and rips2 and put the result in rips1
    rips1 = await intersection(rips1, rips2);

    // Check boxes
    if (document.getElementById('linkButton').checked) {
        for (let item of rips1) {
            rips1[rips1.indexOf(item)] = "<a href=\"" + "https://" + wiki.replace("/w", "") + "\\wiki\\" + encodeURIComponent(item).replace("#", "") + "\">" + item + "</a>";
        }
    }
    if (document.getElementById('number').checked) {
        for (let item of rips1) {
            rips1[rips1.indexOf(item)] = rips1.indexOf(item) + 1 + " - " + item;
        }
    }

    document.getElementById("output").innerHTML = rips1.join("<br>");
}

function linkItems(cb) {
    var rips1 = document.getElementById("output").innerHTML.split('<br>')
    if (cb.checked) {
        for (let item of rips1) {
            rips1[rips1.indexOf(item)] = "<a href=\"https://" + wiki + "\\wiki\\" + item + "\">" + item + "</a>";
        }
    }
    else {
        const regex = /<[^<>]*>/g;
        for (let item of rips1) {
            rips1[rips1.indexOf(item)] = item.replace(regex, "");
        }
    }
    document.getElementById("output").innerHTML = rips1.join("<br>");
}

function numberItems(cb) {
    var rips1 = document.getElementById("output").innerHTML.split('<br>')
    if (cb.checked) {
        for (let item of rips1) {
            rips1[rips1.indexOf(item)] = rips1.indexOf(item) + 1 + " - " + item;
        }
    }
    else {
        const regex = /^\d+ - /gm;
        for (let item of rips1) {
            rips1[rips1.indexOf(item)] = item.replace(regex, "");
        }
    }
    document.getElementById("output").innerHTML = rips1.join("<br>");
}