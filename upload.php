<?php

echo "UPLOAD STARTED<br>";

// Check file
if (!isset($_FILES['image'])) {
    echo "NO FILE RECEIVED<br>";
    exit;
}

echo "FILE RECEIVED<br>";

// Create uploads folder path
$uploadDir = __DIR__ . "/uploads/";

// Create folder if not exists
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Save file
$filename = basename($_FILES["image"]["name"]);
$target = $uploadDir . $filename;

if (!move_uploaded_file($_FILES["image"]["tmp_name"], $target)) {
    echo "FILE MOVE FAILED<br>";
    exit;
}

echo "FILE SAVED<br>";

// Get shirt value
$shirt = isset($_POST['shirt']) ? $_POST['shirt'] : "";

if (!$shirt) {
    echo "NO SHIRT SELECTED<br>";
    exit;
}

echo "SHIRT: " . $shirt . "<br>";

// REPLACE WITH YOUR REAL NGROK URL
$ngrok_url = "https://lustiness-patriarch-figure.ngrok-free.dev/tryon";

// Init curl
$ch = curl_init();

// Prepare POST data
$data = [
    'person' => new CURLFile($target),
    'shirt' => $shirt
];

// Curl config
curl_setopt($ch, CURLOPT_URL, $ngrok_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

if ($response === false) {
    echo "CURL ERROR: " . curl_error($ch);
    exit;
}

curl_close($ch);

// SAVE IMAGE FROM BACKEND
$resultDir = __DIR__ . "/results/";
$filename = "result.png";
$resultPath = $resultDir . $filename;

//echo $resultPath

file_put_contents($resultPath, $response);

// DISPLAY IMAGE
echo "<h2>Generated Result:</h2>";
echo "<img src='results/$filename' width='300' />";

?>
