<?php
ini_set('max_execution_time', 300);

// Check if we have a real uploaded file OR a default image name
$defaultImage = isset($_POST['default_image']) ? $_POST['default_image'] : null;
$gender = isset($_POST['gender']) ? $_POST['gender'] : 'male';

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    // User uploaded a photo
    $uploadDir = __DIR__ . "/uploads/";
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
    
    $filename = basename($_FILES["image"]["name"]);
    $target = $uploadDir . $filename;
    if (!move_uploaded_file($_FILES["image"]["tmp_name"], $target)) {
        echo json_encode(["error" => "UPLOAD_FAILED"]);
        exit;
    }
    $personFile = new CURLFile($target);
} 
elseif ($defaultImage) {
    // No upload – use default image from assets/person/
    $defaultImagePath = __DIR__ . "/assets/person/" . $defaultImage;
    if (!file_exists($defaultImagePath)) {
        echo json_encode(["error" => "DEFAULT_IMAGE_NOT_FOUND"]);
        exit;
    }
    $personFile = new CURLFile($defaultImagePath);
}
else {
    echo json_encode(["error" => "NO_IMAGE"]);
    exit;
}

$shirt = isset($_POST['shirt']) ? $_POST['shirt'] : "";
if (!$shirt) {
    echo json_encode(["error" => "NO_SHIRT"]);
    exit;
}

// Your ngrok URL (FastAPI endpoint)
$ngrok_url = "https://lustiness-patriarch-figure.ngrok-free.dev/tryon";

$ch = curl_init();
$data = [
    'person' => $personFile,
    'shirt' => $shirt,
    'gender' => $gender
];
curl_setopt($ch, CURLOPT_URL, $ngrok_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 300);   // short timeout because FastAPI returns immediately

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
    echo json_encode(["error" => "BACKEND_FAILED"]);
    exit;
}

// $result = json_decode($response, true);
// if (isset($result['request_id'])) {
//     echo json_encode(["request_id" => $result['request_id']]);
// } else {
//     echo json_encode(["error" => "INVALID_RESPONSE"]);
// }

$result = json_decode($response, true);

if (isset($result['image_url'])) {
    echo json_encode([
        "success" => true,
        "image_url" => $result["image_url"]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error" => $result["error"] ?? "INVALID_RESPONSE"
    ]);
}
?>
