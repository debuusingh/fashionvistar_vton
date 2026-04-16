let selectedShirt = null;

const photoInput =
    document.getElementById("photoInput");

const previewBox = document.querySelector(".preview-box");

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

const progressFill = document.getElementById("progressFill");

let isWomen = false;

function toggleGender() {
    isWomen = !isWomen;

    
    const slider = document.getElementById('toggleSlider');
    const textMan = document.getElementById('textMan');
    const textWomen = document.getElementById('textWomen');
    const menGrid = document.getElementById('menGrid');
    const womenGrid = document.getElementById('womenGrid');

    if (isWomen) {
        slider.style.transform = 'translateX(125px)';
        textWomen.classList.add('active');
        textMan.classList.remove('active');
        menGrid.style.display = 'none';
        womenGrid.style.display = 'block';

        userImage.src = "assets/person/default_girl.jpg"
    } else {
        slider.style.transform = 'translateX(0px)';
        textMan.classList.add('active');
        textWomen.classList.remove('active');
        menGrid.style.display = 'block';
        womenGrid.style.display = 'none';

        userImage.src = "assets/person/elon-musk.jpg"
    }

    // Reset selection on toggle
    selectedShirt = null;
    // photoInput.value = ""; // Clears the uploaded file so it resets to default
    document.getElementById('generateBtn').style.display = 'none';
    document.querySelectorAll('.shirts-grid img').forEach(i => i.classList.remove('selected'));
}

// Keep your existing selectShirt and generateTryOn functions below this
    


/* Upload Preview */

previewBox.addEventListener("click", () => {
    photoInput.click();
});


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
    const currentImageUrl = userImage.src;

    if (!selectedShirt) {
        alert("Please select a shirt first!");
        return;
    }

    generateBtn.innerText = "Generating...";
    generateBtn.disabled = true;

    showLoader();

    const form = new FormData();
    
    // Check: If user uploaded a file, send the file. 
    // Otherwise, send the path of the default image.
    if (file) {
        form.append("image", file);
    } else {
        // Sending the filename of the default photo (elon-musk.jpg or default_girl.jpg)
        const defaultFileName = currentImageUrl.split('/').pop();
        form.append("default_image", defaultFileName);
        console.log("Using default image:", defaultFileName);
    }

    form.append("shirt", selectedShirt);
    form.append("gender", isWomen ? "female" : "male");

    try {
        const response = await fetch("upload.php", {
            method: "POST",
            body: form
        });

        const result = await response.text();
        console.log(result);

        hideLoader();

        // Show new image instantly
        userImage.src = "results/result.png?t=" + new Date().getTime();
    }
    catch (error) {
        console.error(error);
        hideLoader();
        alert("Error generating image");
    }

    generateBtn.innerText = "Generate Virtual Try-On";
    generateBtn.disabled = false;
}