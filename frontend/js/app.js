let selectedShirt = null;

const photoInput = document.getElementById("photoInput");
const userImage = document.getElementById("userImage");
const generateBtn = document.getElementById("generateBtn");


// Preview uploaded photo
photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function (e) {
            userImage.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

});


// Shirt selection
function selectShirt(img) {

    document.querySelectorAll(".shirts-grid img")
        .forEach(i => i.classList.remove("selected"));

    img.classList.add("selected");

    // Save shirt filename only
    selectedShirt = img.src.split("/").pop();

    generateBtn.style.display = "block";

}


// Generate Try-On
async function generateTryOn() {

    const file = photoInput.files[0];

    if (!file) {
        alert("Please upload a photo");
        return;
    }

    if (!selectedShirt) {
        alert("Please select a shirt");
        return;
    }

    generateBtn.innerText = "Generating...";
    generateBtn.disabled = true;

    // Create form data
    const form = new FormData();

    // VERY IMPORTANT — names must match upload.php
    form.append("image", file);
    form.append("shirt", selectedShirt);

    try {

        const response = await fetch("upload.php", {
            method: "POST",
            body: form
        });

        const result = await response.text();

        console.log("Server Response:", result);

        // If success, reload output image
        if (result.includes("SUCCESS") || result.includes("result.png")) {

            userImage.src =
                "results/result.png?t=" + new Date().getTime();
        }

    }
    catch (error) {

        console.error(error);
        alert("Error generating image");

    }

    generateBtn.innerText = "Generate Virtual Try-On";
    generateBtn.disabled = false;

}
