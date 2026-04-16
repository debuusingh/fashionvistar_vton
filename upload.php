<?php

ini_set('max_execution_time', 300);

// Check file
if (!isset($_FILES['image'])) {
    echo "NO_FILE";
    exit;
}

// Upload folder
$uploadDir = __DIR__ . "/uploads/";

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Save uploaded file
$filename = basename($_FILES["image"]["name"]);
$target = $uploadDir . $filename;

if (!move_uploaded_file($_FILES["image"]["tmp_name"], $target)) {
    echo "UPLOAD_FAILED";
    exit;
}

// Get shirt
$shirt = isset($_POST['shirt']) ? $_POST['shirt'] : "";


if (!$shirt) {
    echo "NO_SHIRT";
    exit;
}

echo $_POST;
$gender = isset($_POST['gender']) ? $_POST['gender'] : "male";

if ($gender == "female") {
    $clothPath = __DIR__ . "/assets/women/" . $shirt;
}
else {
    $clothPath = __DIR__ . "/assets/man/" . $shirt;
}

// Check cloth exists
if (!file_exists($clothPath)) {
    echo "CLOTH_NOT_FOUND";
    exit;
}

// 🔴 Your ngrok URL
$ngrok_url = "https://lustiness-patriarch-figure.ngrok-free.dev/tryon";

// CURL call
$ch = curl_init();

$data = [
    'person' => new CURLFile($target),
    'shirt' => $shirt,
    'gender' => $gender
];

curl_setopt($ch, CURLOPT_URL, $ngrok_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//curl_setopt($ch, CURLOPT_TIMEOUT, 300);

$response = curl_exec($ch);

if ($response === false) {
    echo "CURL_ERROR";
    exit;
}

//curl_close($ch);

// Save result
$resultDir = __DIR__ . "/results/";

if (!file_exists($resultDir)) {
    mkdir($resultDir, 0777, true);
}

$resultPath = $resultDir . "result.png";

file_put_contents($resultPath, $response);

// 🔥 Return simple response
echo "OK";

?>