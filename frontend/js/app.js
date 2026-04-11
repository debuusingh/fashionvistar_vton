let selectedShirt = null

const photoInput = document.getElementById("photoInput")
const userImage = document.getElementById("userImage")
const generateBtn = document.getElementById("generateBtn")

photoInput.addEventListener("change", function(){

const file = this.files[0]

if(file){

const reader = new FileReader()

reader.onload = function(e){

userImage.src = e.target.result

}

reader.readAsDataURL(file)

}

})

function selectShirt(img){
document.querySelectorAll(".shirts-grid img")
.forEach(i=>i.classList.remove("selected"))

img.classList.add("selected")

selectedShirt = img.src.split("/").pop().replace(".png","")

generateBtn.style.display="block"   

}

async function generateTryOn(){

const file = document.getElementById("photoInput").files[0]

if(!file){
alert("Please upload a photo")
return
}

if(!selectedShirt){
alert("Please select a shirt")
return
}

generateBtn.innerText="Generating..."

const form = new FormData()

form.append("person", file)
form.append("shirt", selectedShirt)

const response = await fetch("http://127.0.0.1:5000/tryon",{
method:"POST",
body:form
})

const blob = await response.blob()

const resultURL = URL.createObjectURL(blob)

userImage.src = resultURL

generateBtn.innerText="Generate Virtual Try-On"

}

