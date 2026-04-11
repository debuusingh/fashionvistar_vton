<?php

echo "UPLOAD STARTED<br>";

if ($_FILES) {
    echo "FILE RECEIVED<br>";
} else {
    echo "NO FILE RECEIVED<br>";
}

$ngrok_url = "https://lustiness-patriarch-figure.ngrok-free.dev/tryon";

echo "CALLING NGROK...<br>";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $ngrok_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

if ($response === false) {
    echo "CURL ERROR: " . curl_error($ch);
} else {
    echo "RESPONSE FROM NGROK:<br>";
    echo $response;
}

curl_close($ch);

?>