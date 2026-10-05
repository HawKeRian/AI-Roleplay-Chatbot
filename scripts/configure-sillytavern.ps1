param(
    [string]$Model = 'gup-qwen3:4b',
    [string]$EmbeddingModel = 'qwen3-embedding:0.6b',
    [string]$OllamaUrl = 'http://127.0.0.1:11434',
    [bool]$DisableThinking = $true
)

$ErrorActionPreference = 'Stop'
$Model = $Model.Trim('"')
$EmbeddingModel = $EmbeddingModel.Trim('"')
$OllamaUrl = $OllamaUrl.Trim('"')
$projectRoot = Split-Path -Parent $PSScriptRoot
$sillyTavernDir = Join-Path $projectRoot '.local\SillyTavern'
$baseUrl = 'http://127.0.0.1:8000'

$webSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$csrf = Invoke-RestMethod -Uri "$baseUrl/csrf-token" -WebSession $webSession
$headers = @{ 'X-CSRF-Token' = $csrf.token }
$apiSettings = Invoke-RestMethod `
    -Uri "$baseUrl/api/settings/get" `
    -Method Post `
    -Headers $headers `
    -WebSession $webSession `
    -ContentType 'application/json' `
    -Body '{}'

$settings = $apiSettings.settings | ConvertFrom-Json
$settings.main_api = 'textgenerationwebui'
$settings.max_context = 8192
$settings.amount_gen = 500
$settings.textgenerationwebui_settings.type = 'ollama'
$settings.textgenerationwebui_settings.ollama_model = $Model
$settings.textgenerationwebui_settings.streaming = $true
$settings.textgenerationwebui_settings.include_reasoning = $false
$settings.textgenerationwebui_settings.temp = 0.55
$settings.textgenerationwebui_settings.top_p = 0.9
$settings.textgenerationwebui_settings.min_p = 0.05
$settings.textgenerationwebui_settings.rep_pen = 1.1

if ($settings.textgenerationwebui_settings.server_urls.PSObject.Properties['ollama']) {
    $settings.textgenerationwebui_settings.server_urls.ollama = $OllamaUrl
} else {
    $settings.textgenerationwebui_settings.server_urls |
        Add-Member -NotePropertyName 'ollama' -NotePropertyValue $OllamaUrl
}

$instruct = Get-Content -LiteralPath (Join-Path $sillyTavernDir 'data\default-user\instruct\ChatML.json') -Raw |
    ConvertFrom-Json
$instruct | Add-Member -NotePropertyName 'enabled' -NotePropertyValue $true -Force
$instruct | Add-Member -NotePropertyName 'preset' -NotePropertyValue 'ChatML' -Force
$settings.power_user.instruct = $instruct

$context = Get-Content -LiteralPath (Join-Path $sillyTavernDir 'data\default-user\context\ChatML.json') -Raw |
    ConvertFrom-Json
$context | Add-Member -NotePropertyName 'preset' -NotePropertyValue 'ChatML' -Force
$settings.power_user.context = $context

if ($DisableThinking) {
    $settings.power_user.sysprompt.enabled = $true
    $settings.power_user.sysprompt.name = 'Qwen3 Roleplay (no think)'
    $settings.power_user.sysprompt.content = "/no_think`nWrite {{char}}'s next reply in a fictional roleplay between {{char}} and {{user}}. Stay in character, advance the scene naturally, and do not narrate actions for {{user}}."
    $settings.power_user.reasoning.name = 'Think XML'
    $settings.power_user.reasoning.auto_parse = $true
    $settings.power_user.reasoning.auto_expand = $false
}

$memory = $settings.extension_settings.memory
$memory.source = 'main'
$memory.temperature = 0.3
$memory.promptWords = 150
$memory.promptInterval = 12
$memory.maxMessagesPerRequest = 24
$memory.prompt = 'Summarize only established facts, relationships, promises, locations, and important events from the story. Preserve exact names, pronouns, and relationship status. Do not invent or infer missing facts. Use the chat''s primary language. Limit the summary to {{words}} words or less and output only the summary.'

$vectors = [pscustomobject]@{
    source = 'ollama'
    ollama_model = $EmbeddingModel
    ollama_keep = $true
    enabled_chats = $true
    keep_hidden = $false
    template = "Relevant past events:`n{{text}}"
    depth = 2
    position = 0
    protect = 8
    insert = 3
    query = 2
    message_chunk_size = 350
    score_threshold = 0.3
    summarize = $false
    summarize_sent = $false
    enabled_files = $false
    enabled_world_info = $false
}
$settings.extension_settings | Add-Member -NotePropertyName 'vectors' -NotePropertyValue $vectors -Force

$payload = $settings | ConvertTo-Json -Depth 100
$result = Invoke-RestMethod `
    -Uri "$baseUrl/api/settings/save" `
    -Method Post `
    -Headers $headers `
    -WebSession $webSession `
    -ContentType 'application/json' `
    -Body $payload

if ($result.result -ne 'ok') {
    throw 'SillyTavern did not accept the settings update.'
}

Write-Host "Configured SillyTavern for Ollama model $Model and local memory model $EmbeddingModel at $OllamaUrl"
