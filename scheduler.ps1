$configFile = "./config.json"
$scriptName = "index.js"


try {
    $config = Get-Content $configFile -Raw | ConvertFrom-Json
    $reservationTime = $config.date.time
    $reservationDate = $config.date.year + "-" + $config.date.month + "-" + $config.date.day

} catch {
    Write-Error "Erreur de lecture du fichier de configuration"
    exit 1
}

# 70 heures avant la réservation
$dateTime = $reservationDate + " " + $reservationTime
$reservationTimeStamp = Get-Date -Date $dateTime
$executionTimeStamp = $reservationTimeStamp.AddHours(-70)

# Vérification si l'heure d'exécution est avant l'heure de réservation
if ((Get-Date) -gt (Get-Date $executionTimeStamp)) {
    Write-Error "Erreur: l'heure d'execution du programme doit être 70 heure avant l'heure de la réservation"
    exit 1
}

$executionTimeStampStr = $executionTimeStamp.ToString()
$executionTimeStrSplit = $executionTimeStampStr.Split()[0, 1]
$executionDate = $executionTimeStrSplit[0]
$executionTime = $executionTimeStrSplit[1]

$cmdPath = (get-command cmd.exe).Path
$schtasksCommand = "schtasks /create /ru $ENV:USERNAME /sc once /sd $executionDate /st $executionTime /tr '$cmdPath /c cd $pwd && node $scriptName' /tn PepsReservationBot"
Invoke-Expression $schtasksCommand
Write-Output "Tâche planifiée pour lancer le script PepsReservationBot le $executionTimeStamp"