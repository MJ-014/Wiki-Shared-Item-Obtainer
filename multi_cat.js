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
        //The rest of pages of results
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

function intersection(first, second){
    var s = new Set(second);
    return first.filter(item => s.has(item));
};

async function main(){
    var wiki = document.getElementById("wiki").value;
    if(wiki == ""){
        alert("Please provide a wiki.");
        return;
    }
    var catName1 = document.getElementById("cat1").value.split("\n");
    var catName2 = document.getElementById("cat2").value.split("\n");
    var rips1 = [];
    var rips2 = [];
    
    document.getElementById("output").innerHTML = "Working on your request...";
    
    for (let cate of [catName1, catName2]){
        for (let item of cate){
            if([catName1, catName2].indexOf(cate) == 0){
                await getJason("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + item + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips1); 
            }
            else{
                await getJason("https://" + wiki + "/api.php?action=query&cmtitle=Category:" + item + "&list=categorymembers&cmlimit=500&origin=*&format=json", rips2); 
            }
        }
    }

    rips1 = await intersection(rips1, rips2);
    
    if(document.getElementById('number').checked){
        for(let item of rips1){
            rips1[rips1.indexOf(item)] = rips1.indexOf(item) + 1 + " - " + item;
        }
    }
    
    document.getElementById("output").innerHTML = rips1.join("<br>");
}
