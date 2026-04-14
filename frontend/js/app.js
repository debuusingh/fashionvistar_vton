let selectedShirt = null;

const photoInput =
    document.getElementById("photoInput");

const userImage =
    document.getElementById("userImage");

const generateBtn =
    document.getElementById("generateBtn");

const loaderBox =
    document.getElementById("loaderBox");

const slides =
    document.querySelectorAll(".slide");

const statusText =
    document.getElementById("statusText");

const progressFill =
    document.getElementById("progressFill");



/* Upload Preview */

photoInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (file) {

            const reader = new FileReader();

            reader.onload = function (e) {

                userImage.src =
                    e.target.result;

            };

            reader.readAsDataURL(file);

        }

    });



/* Select Shirt */

function selectShirt(img) {

    document
        .querySelectorAll(".shirts-grid img")
        .forEach(i =>
            i.classList.remove("selected")
        );

    img.classList.add("selected");

    selectedShirt =
        img.src.split("/").pop();

    generateBtn.style.display = "block";

}



/* Loader Logic */

let currentSlide = 0;
let progressValue = 0;

let slideTimer;
let progressTimer;
let statusTimer;



function showLoader() {

    loaderBox.style.display = "flex";

    startSlides();
    startProgress();
    startStatus();

}



function hideLoader() {

    loaderBox.style.display = "none";

    clearInterval(slideTimer);
    clearInterval(progressTimer);
    clearInterval(statusTimer);

    progressValue = 0;
    progressFill.style.width = "0%";

}



function startSlides() {

    slideTimer = setInterval(() => {

        slides[currentSlide]
            .classList.remove("active");

        currentSlide =
            (currentSlide + 1)
            % slides.length;

        slides[currentSlide]
            .classList.add("active");

    }, 11000);

}



function startProgress() {

    progressTimer = setInterval(() => {

        progressValue++;

        progressFill.style.width =
            progressValue + "%";

    }, 900);

}



function startStatus() {

    const messages = [

        "Preparing your outfit...",
        "Fitting analysis...",
        "Adjusting clothing...",
        "Rendering look...",
        "Optimizing output...",
        "Almost Ready..."

    ];

    let i = 0;

    statusTimer = setInterval(() => {

        statusText.innerText =
            messages[i];

        i = (i + 1) % messages.length;

    }, 15000);

}



/* Generate */

async function generateTryOn() {

    const file = photoInput.files[0];

    if (!file) {
        alert("Upload photo");
        return;
    }

    if (!selectedShirt) {
        alert("Select shirt");
        return;
    }

    generateBtn.innerText = "Generating...";
    generateBtn.disabled = true;

    showLoader();

    const form = new FormData();
    form.append("image", file);
    form.append("shirt", selectedShirt);

    try {

        const response = await fetch("upload.php", {
            method: "POST",
            body: form
        });

        const result = await response.text();

        console.log(result);

        // 🔥 Stop loader immediately when response comes
        hideLoader();

        // 🔥 Show new image instantly
        userImage.src =
            "results/result.png?t=" +
            new Date().getTime();

    }
    catch (error) {

        console.error(error);

        hideLoader();

        alert("Error generating image");

    }

    generateBtn.innerText =
        "Generate Virtual Try-On";

    generateBtn.disabled = false;
}
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
