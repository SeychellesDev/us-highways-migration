<!-- did something go wrong with your distances? fear not! -->
<!-- script sponsored by mypayindia.com -->
 
<!-- php ./us-highways-migration/static/update_distances.php folder/number mile-increment kilometer-increment start-line end-line -->

<?php
$fileDir = '';
$incm = 0.0;
$inck = 0.0;

echo($argv[1] . ' ' .  $argv[2] . ' ' . $argv[3] . ' ' . $argv[4] . ' ' . $argv[5] ."\n");

if($argc == 6) {
    $fileDir = $argv[1];
    $incm = $argv[2];
    $inck = $argv[3];
    $start = (int)$argv[4];
    $end = (int)$argv[5];
    $path = './us-highways-migration/pages/' . $fileDir . '.php';
    if(file_exists($path)){
        $content = file_get_contents($path);
        $lines = explode("\n", $content);
        $before = implode("\n", array_slice($lines, 0, $start));
        $middle = implode("\n", array_slice($lines, $start, $end - $start));
        $after = implode("\n", array_slice($lines, $end));
        $count = 0;
        $pattern = '/<td class="content text-dark small">([\d.]+) mi \( \+ ([\d.-]+) mi \)<\/td>\s*<td class="content text-dark small">([\d.]+) km \( \+ ([\d.-]+) km \)<\/td>/i';
        $middle = preg_replace_callback($pattern, function ($matches) use ($incm, $inck) {
            $miles = floatval($matches[1]);
            $milesChange = floatval($matches[2]);
            $km = floatval($matches[3]);
            $kmChange = floatval($matches[4]);
            return "<td class=\"content text-dark small\">" . number_format($miles + $incm, 2, '.', '') . " mi ( + " . number_format($milesChange, 2, '.', '') . " mi )</td>\n" .
                    "\t\t\t\t\t<td class=\"content text-dark small\">" . number_format($km + $inck, 2, '.', '') . " km ( + " . number_format($kmChange, 2, '.', '') . " km )</td>";
        }, $middle, -1, $count);
        $content = rtrim($before, "\n") . "\n" . $middle . "\n" . $after;
        file_put_contents($path, $content);
        echo $count . " Distances updated successfully in '$path'.\n";
    } else {
            echo "Program exited with code 3b - File '$path' does not exist.\n";
    }
} else {
    echo "Program exited with code 2a - Incorrect number of arguments. Expected 4, got " . (count($argv) - 1) . ".\n";
}