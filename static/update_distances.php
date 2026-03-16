<!-- did something go wrong with your distances? fear not! -->
<!-- script sponsored by mypayindia.com -->
<?php
$fileDir = '';
$incm = 0.0;
$inck = 0.0;

echo($argv[1] . ' ' .  $argv[2] . ' ' . $argv[3] . "\n");

if($argc > 1) {
    if(count($argv) == 4){
        $fileDir = $argv[1];
        $incm = $argv[2];
        $inck = $argv[3];
        $path = './us-highways-migration/pages/' . $fileDir . '.php';
        if(file_exists($path)){
            $content = file_get_contents($path);
            $pattern = '/<td class="content text-dark small">([\d.]+) mi \( \+ ([\d.-]+) mi \)<\/td>\s*<td class="content text-dark small">([\d.]+) km \( \+ ([\d.-]+) km \)<\/td>/i';
            $updatedContent = preg_replace_callback($pattern, function ($matches) {
                $miles = floatval($matches[1]);
                $milesChange = floatval($matches[2]);
                $km = floatval($matches[3]);
                $kmChange = floatval($matches[4]);
                $newMiles = $miles + $milesChange;
                $newKm = $km + $kmChange;
                return '<td class="content text-dark small">' . number_format($newMiles + $incm, 2) . ' mi ( + ' . number_format($milesChange, 2) . ' mi )</td>' .
                       '<td class="content text-dark small">' . number_format($newKm + $inck, 2) . ' km ( + ' . number_format($kmChange, 2) . ' km )</td>';
            }, $content);
            file_put_contents($path, $updatedContent);
            echo "Distances updated successfully in '$path'.\n";
        } else {
            echo "Program exited with code 3b - File '$path' does not exist.\n";
        }
    } else {
        echo "Program exited with code 2a - Incorrect number of arguments. Expected 3, got " . ($count($argv) - 1) . ".\n";
    }
} else {
    echo "Program exited with code 1a - No file directory provided.\n";
}