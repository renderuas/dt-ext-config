param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$File,

    [Parameter(Mandatory = $true, Position = 1)]
    [ValidateSet('add', 'remove')]
    [string]$Action,

    [string]$ApiUrl = 'https://vnk09715.live.dynatrace.com/api/v2',
    [string]$ApiToken = $env:DT_API_TOKEN,
    [string]$Tag = 'disableProblems',
    [string]$LogFile = 'dynatrace_tag_Maintenance.log'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Initialize-PowerShellCompatibility {
    if ($PSVersionTable.PSVersion.Major -lt 6) {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    }
}

function Write-LogMessage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Level,

        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss,fff'
    $entry = "$timestamp [$Level] $Message"
    Write-Output $entry
    Add-Content -Path $LogFile -Value $entry
}

function New-Headers {
    return @{ 
        Authorization = "Api-Token $ApiToken"
        Accept = 'application/json'
    }
}

function Get-PlainTextFromSecureString {
    param(
        [Parameter(Mandatory = $true)]
        [Security.SecureString]$SecureString
    )

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        if ($bstr -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
    }
}

function Resolve-ApiToken {
    param(
        [string]$ProvidedToken
    )

    if (-not [string]::IsNullOrWhiteSpace($ProvidedToken)) {
        return $ProvidedToken
    }

    $secureToken = Read-Host -Prompt 'Introduce el token de Dynatrace' -AsSecureString
    $plainToken = Get-PlainTextFromSecureString -SecureString $secureToken
    if ([string]::IsNullOrWhiteSpace($plainToken)) {
        throw 'Debes proporcionar el token mediante -ApiToken, DT_API_TOKEN o por entrada interactiva.'
    }

    return $plainToken
}

function Get-HostsByPrefix {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Prefix
    )

    $entitySelector = 'type("HOST"),entityName.startsWith("{0}")' -f $Prefix
    $selector = [uri]::EscapeDataString($entitySelector)
    $uri = "$ApiUrl/entities?entitySelector=$selector"
    return Invoke-RestMethod -Method Get -Uri $uri -Headers (New-Headers)
}

function Invoke-TagAction {
    param(
        [Parameter(Mandatory = $true)]
        [string]$EntityId,

        [Parameter(Mandatory = $true)]
        [string]$HostName,

        [Parameter(Mandatory = $true)]
        [ValidateSet('add', 'remove')]
        [string]$Operation
    )

    try {
        if ($Operation -eq 'add') {
            $entitySelector = 'entityId("{0}")' -f $EntityId
            $uri = "$ApiUrl/tags?entitySelector=$([uri]::EscapeDataString($entitySelector))"
            $payload = @{ tags = @(@{ key = $Tag }) } | ConvertTo-Json -Depth 3
            $response = Invoke-WebRequest -Method Post -Uri $uri -Headers (New-Headers) -ContentType 'application/json' -Body $payload
            Write-LogMessage -Level 'INFO' -Message "Etiqueta '$Tag' anadida a '$HostName' (ID: $EntityId). respuesta HTTP: $($response.StatusCode)."
            return
        }

        $entitySelector = 'entityId("{0}")' -f $EntityId
        $selector = [uri]::EscapeDataString($entitySelector)
        $uri = "$ApiUrl/tags?entitySelector=$selector&key=$([uri]::EscapeDataString($Tag))"
        $response = Invoke-WebRequest -Method Delete -Uri $uri -Headers (New-Headers)
        Write-LogMessage -Level 'INFO' -Message "Etiqueta '$Tag' eliminada de '$HostName' (ID: $EntityId). respuesta HTTP: $($response.StatusCode)."
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $responseBody = $null

        if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream()) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Dispose()
        }

        if ([string]::IsNullOrWhiteSpace($responseBody)) {
            $responseBody = $_.Exception.Message
        }

        Write-LogMessage -Level 'ERROR' -Message "Fallo al $Operation etiqueta en '$HostName' (ID: $EntityId). respuesta HTTP: $statusCode. Respuesta: $responseBody"
    }
}

function Process-Prefix {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Prefix,

        [Parameter(Mandatory = $true)]
        [ValidateSet('add', 'remove')]
        [string]$Operation
    )

    $normalizedPrefix = $Prefix.Trim()
    if ([string]::IsNullOrWhiteSpace($normalizedPrefix)) {
        return
    }

    try {
        $entityResponse = Get-HostsByPrefix -Prefix $normalizedPrefix
    }
    catch {
        Write-LogMessage -Level 'ERROR' -Message "La API devolvio un error para prefix '$normalizedPrefix': $($_.Exception.Message)"
        return
    }

    if (-not $entityResponse -or -not $entityResponse.entities) {
        Write-LogMessage -Level 'WARN' -Message "Ningun host encontrado con prefix '$normalizedPrefix'"
        return
    }

    foreach ($entity in $entityResponse.entities) {
        Invoke-TagAction -EntityId $entity.entityId -HostName $entity.displayName -Operation $Operation
    }
}

Initialize-PowerShellCompatibility
$ApiToken = Resolve-ApiToken -ProvidedToken $ApiToken

if (-not (Test-Path -LiteralPath $File)) {
    throw "No existe el fichero de entrada: $File"
}

Write-LogMessage -Level 'INFO' -Message '**************Inicio de proceso**************'
Get-Content -LiteralPath $File | ForEach-Object {
    Process-Prefix -Prefix $_ -Operation $Action
}
Write-LogMessage -Level 'INFO' -Message '###############Fin de proceso###############'