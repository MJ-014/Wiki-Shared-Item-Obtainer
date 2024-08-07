async function getJason(url, arr) {
    var response = await fetch(url);
    var jason = await response.json();
    if (jason.continue !== undefined) {
        var cont = await jason.continue.cmcontinue
        try {
            jason.query.categorymembers.forEach(element => {
                arr.push(element.title);
            })
        }
        catch (error) {
            document.getElementById("output").innerHTML = "There was a problem. Please check your input.";
        }
        //The rest of pages of results
        while (true) {
            var response = await fetch(url + "&cmcontinue=" + cont, { method: 'GET' });
            var jason = await response.json();
            if (jason["continue"] !== undefined) {
                var cont = jason.continue.cmcontinue
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

function intersection(first, second) {
    var s = new Set(second);
    return first.filter(item => s.has(item));
};

async function main() {
    var wiki = document.getElementById("wiki").value;
    if (wiki == "") {
        alert("Please provide a wiki.");
        return;
    }
    wiki = wiki.replace("https://", "");
    wiki = wiki.replace("http://", "");
    if (wiki.includes('wikipedia')) {
        wiki = wiki + '/w';
    }

    var catName1 = document.getElementById("cat1").value.split("\n");
    var catName2 = document.getElementById("cat2").value.split("\n");
    var nameFilter = document.getElementById("nameFilter").value.split("\n");
    var catNeg = document.getElementById("neg").value.split("\n");
    if (catName2 == "") {
        catName2 = document.getElementById("cat1").value.split("\n");
    }
    var method;
    var rips1 = [];
    var rips2_1 = [];
    var rips2 = [];
    var negRips = [];

    if (document.getElementById("methodAnd").checked) {
        method = "and";
    }

    document.getElementById("output").innerHTML = "Working on your request...";

    for (let cate of [catName1, catName2]) {
        if ([catName1, catName2].indexOf(cate) == 0) {
            for (let item of cate) {
                if (item.includes('%')) {
                    await getJason("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + item + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips1);
                }
                else {
                    await getJason("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + encodeURIComponent(item) + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips1);
                }
            }
        }
        else {
            for (let item of cate) {
                if (item.includes('%')) {
                    await getJason("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + item + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips2_1);
                }
                else {
                    await getJason("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + encodeURIComponent(item) + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips2_1);
                }
                if (method == "and") {
                    if (cate.indexOf(item) == 0) {
                        rips2 = rips2_1;
                    }
                    else {
                        rips2 = intersection(rips2_1, rips2);
                    }
                }
                else {
                    rips2 = rips2.concat(rips2_1);
                }
                rips2_1 = [];
            }
        }
    }
    for (let item of catNeg) {
        if (item.includes('%')) {
            await getJason("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + item + "&list=categorymembers&cmlimit=500&origin=*&format=json", negRips);
        }
        else {
            await getJason("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + encodeURIComponent(item) + "&list=categorymembers&cmlimit=500&origin=*&format=json", negRips);
        }
    }

    rips1_1 = new Set(rips1)
    rips1 = Array.from(rips1_1);

    rips1 = await intersection(rips1, rips2);

    rips1 = rips1.filter(x => !negRips.includes(x));

    if (nameFilter != "") {
        for (let i = rips1.length - 1; i >= 0; i--) {
            if (!rips1[i].includes(nameFilter)) {
                rips1.splice(i, 1);
            }
        }
    }

    if (document.getElementById('linkButton').checked) {
        for (let item of rips1) {
            rips1[rips1.indexOf(item)] = "<a href=\"" + "https://" + wiki + "\\wiki\\" + item + "\">" + item + "</a>";
        }
    }
    if (document.getElementById('number').checked) {
        for (let item of rips1) {
            rips1[rips1.indexOf(item)] = rips1.indexOf(item) + 1 + " - " + item;
        }
    }
    if (document.getElementById('sort').checked) {
        rips1 = rips1.sort();
    }

    document.getElementById("output").innerHTML = rips1.join("<br>");
}
