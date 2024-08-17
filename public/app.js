const searchInput = document.querySelector("#search");
const searchContainer = document.querySelector(".suggestions-wrap");
const suggestionsContainer = document.querySelector(".suggestions");



function showRecommendedList(recommendedList){
    if (recommendedList.length === 0){
        searchContainer.classList.remove("show");
    }

    var x = document.querySelector(".belowSearch");
    x.innerHTML = "";

    // console.log(searchContainer);
    searchContainer.classList.add("show");
    suggestionsContainer.innerHTML = "";
    recommendedList.map(recommendedItem => {
        const li =  document.createElement("li");
        li.textContent = recommendedItem.trackName; //The json key value search
        let x = recommendedItem.duration
        suggestionsContainer.appendChild(li);


        li.addEventListener("click", function(){
            searchContainer.classList.remove("show");

            const container = document.createElement("div");
            let x = document.querySelector(".belowSearch");
            x.appendChild(container);


            const newDiv = document.createElement("div");
            newDiv.classList.add("content");
            container.appendChild(newDiv);

            const newDiv2 = document.createElement("div");
            newDiv2.classList.add("container-fluid");
            newDiv2.classList.add("full-width-box");
            newDiv.appendChild(newDiv2);

            const newDiv3 = document.createElement("div");
            newDiv3.classList.add("row");
            newDiv2.appendChild(newDiv3);
            

            const newDiv4 = document.createElement("div");
            newDiv4.classList.add("col-md-12");
            newDiv3.appendChild(newDiv4);

            const newDiv5 = document.createElement("h1");
            newDiv5.classList.add("inner-element");
            newDiv4.appendChild(newDiv5);


            recommendedItem.duration = Math.floor(recommendedItem.duration/1000);

            let dur = "";
            if (recommendedItem.duration % 60 < 10){
                dur = Math.floor(recommendedItem.duration/60) + ":0" + recommendedItem.duration%60;
            } else{
                dur = Math.floor(recommendedItem.duration/60)+ ":" + recommendedItem.duration%60;
            }

            console.log(dur);

            newDiv5.textContent = recommendedItem.trackName + " (" + dur + ")";

        

            if (recommendedItem.explicit === true){
               const explicitImg = document.createElement("img");
               explicitImg.src = "explicitIcon.png";
               explicitImg.height=50;
               explicitImg.width=50;
               newDiv5.appendChild(explicitImg);
            }

            


            


            
        }
        );


    });
}

async function filterSuggestions(){
    const response = await fetch("../data.json");
    const suggestionsList = await response.json()
    let searchValue = searchInput.value;

    let recommendedList = [];
    if (searchValue.length>0){
        recommendedList = suggestionsList.filter(listItem => listItem.trackName.toLowerCase().includes(searchValue.toLowerCase()));  
    }
    console.log(recommendedList);
    
    showRecommendedList(recommendedList);
}

searchInput.addEventListener("keyup", filterSuggestions);
