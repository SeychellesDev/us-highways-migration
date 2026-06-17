<!-- did something go wrong with your distances? fear not! -->
<!-- script sponsored by mypayindia.com -->
 
<!-- php ./us-highways-migration/static/update_distances.php folder/number mile-increment kilometer-increment start-line end-line -->

<?php
$fileDir = '';
$incm = 0.0;
$inck = 0.0;

echo($argv[1] . '.php ' .  $argv[2] . 'mi ' . $argv[3] . 'km ln' . $argv[4] . ' to ln' . $argv[5] ."\n");

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
        $pattern = '/<td\s+class="content\s+text-dark\s+small">\s*([\d.]+)\s*mi\s*<br><h4\s+class="small\s+incr">\s*\+\s*([\d.-]+)\s*mi\s*<\/h4>\s*<\/td>\s*<td\s+class="content\s+text-dark\s+small">\s*([\d.]+)\s*km\s*<br><h4\s+class="small\s+incr">\s*\+\s*([\d.-]+)\s*km\s*<\/h4>\s*<\/td>/i';
        $middle = preg_replace_callback($pattern, function ($matches) use ($incm, $inck) {
            $miles = floatval($matches[1]);
            $milesChange = floatval($matches[2]);
            $km = floatval($matches[3]);
            $kmChange = floatval($matches[4]);
            return "<td class=\"content text-dark small\">" . number_format($miles + $incm, 2, '.', '') . " mi<br><h4 class=\"small incr\">+ " . number_format($milesChange, 2, '.', '') . " mi</h4></td>\n" .
                    "                    <td class=\"content text-dark small\">" . number_format($km + $inck, 2, '.', '') . " km<br><h4 class=\"small incr\">+ " . number_format($kmChange, 2, '.', '') . " km</h4></td>";
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