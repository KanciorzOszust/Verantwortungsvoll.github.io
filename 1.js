let apiUrl = "https://api.funtranslations.com/translate/minion.json";
let textarea1 = document.querySelector("#textarea1")
let textarea2 = document.querySelector("#textarea2")

textarea1.addEventListener("keydown", function() {
    translate(textarea1, textarea2)
})
textarea2.addEventListener("keydown", function() {
    translate(textarea2, textarea1)
})

function errorHandle(error) {   
    alert('Error occurred')
    console.log("error occurred", error);
}

function translate(input, output) {
    let text = input.value
    let updatedUrl = translate + "?text" + text
    fetch(updatedUrl)
    .then(response => response.json())
    .then(json => output.innerText = (json.contents.translated))
    .catch(errorHandle);
}