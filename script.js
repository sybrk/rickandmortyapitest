//globals

let apiResult = {};

//objects

let cache = {
    data: {},
    checkData: function(pageNum) {
        return cache.data[pageNum.toString()] !== undefined;
    },
    addData: function(pageNum, content) {
        let keys = Object.keys(cache.data);
        keys.sort((a,b) => a-b)
        // if there are more than 10 keys, delete the smallest key to avoid having a big cache
        if (keys.length === 10) {
            let smallestKey = keys[0];
            delete cache.data[smallestKey];
            console.log(`deleted the key ${smallestKey}`)
        }
        cache.data[pageNum.toString()] = content;
        

        
    },
    getData: function(pageNum) {
        return cache.data[pageNum.toString()];
    },
    allData: function() {
        let result = [];
        let tmp_values = Object.values(cache.data);
        for (let i = 0; i < tmp_values.length; i++) {
            let item = tmp_values[i].results;
            result.push(...item)
        }
        return result;
    },
    searchData: function() {
        let searchInput = document.getElementById("searchInput").value.toUpperCase()
        let searchTerm = searchInput.toUpperCase();
        // since fillContainerWitdhData accepsts an object we create the same object structure here.
        let filterResult =  {results: cache.allData().filter(item => item.name.toUpperCase().includes(searchTerm))};
        creatingPage.fillContainerWithData(filterResult);
    }
}
let data = {
    // I will use url parameter to get pages dynamically
    getData: function (url = `https://rickandmortyapi.com/api/character`, cb) {
        var xhr = new XMLHttpRequest();
        // we need to set this to false to avoid errors in CORS.
        xhr.withCredentials = false;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                cb(this.responseText);
            }
        });

        xhr.open("GET", url);
        xhr.send();

    },
    getDataAsync : function(){
        return new Promise((resolve, reject )=> {
            try {
                data.getData(function(result){
                    resolve(result);
                });    
            } catch (error) {
                console.log('error', error);
                reject(error);
            }
        });
    }

};

let domHelper = {
    createDOMElement: function (tagname, className, id) {
        let createElement = document.createElement(tagname);
        if (className !== undefined) {
            createElement.classList.add(className);
        }
        if (id !== undefined) {
            createElement.id = id;
        }
        return createElement;
    },
    appendElement: function (parent, child) {
        parent.appendChild(child);
    }
}

let creatingPage = {
    makeDivForCharacterCard: function(characterData){

        let myDiv = domHelper.createDOMElement("div", "character-card");
        myDiv.classList.add("imagecards")
        let myImg = domHelper.createDOMElement("img");
        myImg.setAttribute("src", characterData.image);
        let myH2 = domHelper.createDOMElement("h2");
        myH2.textContent = `${characterData.name} (${characterData.gender})`;
        domHelper.appendElement(myDiv, myImg);
        domHelper.appendElement(myDiv, myH2);
    
        return myDiv;
    },
    fillContainerWithData: function(dataObject){
        let _self = this;
        let myContainer = document.getElementsByClassName('container')[0]
        // we clean container before adding new content.
        myContainer.innerHTML = "";
        for (let i = 0; i < dataObject.results.length; i++) {
            const characterData = dataObject.results[i];
            let myDiv = _self.makeDivForCharacterCard(characterData);
            domHelper.appendElement(myContainer, myDiv);
        }
    },
    generateMylist: function (url){
        let _self = this;
        data.getData(url, function(result){
            apiResult = JSON.parse(result);
            dataToUse = apiResult;
            let showPage = showingPage(apiResult);
            // check if data is available in cache
            if (cache.checkData(showPage) === false) {
                console.log("this is from api")
                cache.addData(showPage, apiResult);
            }
            else {
                dataToUse = cache.getData(showPage)
                console.log("this is from cache")
            }
            _self.fillContainerWithData(apiResult);
            // we disable buttons if next/prev url from api info is null.
            let nextButton = document.getElementById("nextButton");
            let prevButton = document.getElementById("previousButton");
            // we check next/previous urls dynamically from api info.
            dataToUse.info.prev === null ? prevButton.disabled = true : prevButton.disabled = false;
            dataToUse.info.next === null ? nextButton.disabled = true : nextButton.disabled = false;

            let pageNumber = document.getElementById("showingPage");
            pageNumber.textContent = showPage;
        });
    }
}


function next() {
    
    creatingPage.generateMylist(apiResult.info.next);
}

function prev() {

    creatingPage.generateMylist(apiResult.info.prev);
}

function lastPage() {
    creatingPage.generateMylist(`https://rickandmortyapi.com/api/character?page=${apiResult.info.pages}`);
}

function firstPage() {
    creatingPage.generateMylist(`https://rickandmortyapi.com/api/character?page=1`);
}

function showingPage(dataResult) {
    return dataResult.info.next === null ? dataResult.info.pages : dataResult.info.next.split("page=")[1] - 1;
}
//document events
document.addEventListener('DOMContentLoaded', function () {
    creatingPage.generateMylist();
    
})