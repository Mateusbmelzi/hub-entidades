# 🚀 Script de Deploy e Teste das Edge Functions
# Hub de Entidades - Supabase

param(
    [string]$AnonKey = "",
    [string]$ProjectRef = "lddtackcnpzdswndqgfs"
)

Write-Host "🚀 Deploy e Teste das Edge Functions - Hub de Entidades" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Verificar se a chave anônima foi fornecida
if ([string]::IsNullOrEmpty($AnonKey)) {
    Write-Host "❌ Erro: Chave anônima não fornecida!" -ForegroundColor Red
    Write-Host "Use: .\deploy-edge-functions.ps1 -AnonKey 'sua_chave_aqui'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para obter a chave:" -ForegroundColor Cyan
    Write-Host "1. Acesse https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Selecione o projeto hub-entidades" -ForegroundColor White
    Write-Host "3. Vá para Settings > API" -ForegroundColor White
    Write-Host "4. Copie a 'anon public' key" -ForegroundColor White
    exit 1
}

Write-Host "✅ Projeto: $ProjectRef" -ForegroundColor Green
Write-Host "✅ Chave anônima configurada" -ForegroundColor Green
Write-Host ""

# Lista de edge functions para testar
$EdgeFunctions = @(
    "update-indicadores-gerais",
    "update-top-eventos", 
    "update-afinidade-curso-area",
    "update-indicadores-profiles",
    "update-taxa-conversao-entidades"
)

Write-Host "🧪 Testando Edge Functions..." -ForegroundColor Blue
Write-Host ""

$SuccessCount = 0
$TotalCount = $EdgeFunctions.Count

foreach ($Function in $EdgeFunctions) {
    Write-Host "🔍 Testando: $Function" -ForegroundColor Cyan
    
    try {
        $Url = "https://$ProjectRef.supabase.co/functions/v1/$Function"
        $Headers = @{
            "Authorization" = "Bearer $AnonKey"
            "Content-Type" = "application/json"
        }
        
        $Response = Invoke-RestMethod -Uri $Url -Method POST -Headers $Headers -Body "{}" -TimeoutSec 30
        
        if ($Response.success -eq $true) {
            Write-Host "   ✅ Sucesso: $($Response.message)" -ForegroundColor Green
            $SuccessCount++
        } else {
            Write-Host "   ⚠️  Resposta inesperada: $($Response | ConvertTo-Json)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Resumo dos resultados
Write-Host "📊 Resumo dos Testes" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "✅ Sucessos: $SuccessCount/$TotalCount" -ForegroundColor Green
Write-Host "❌ Falhas: $($TotalCount - $SuccessCount)/$TotalCount" -ForegroundColor Red

if ($SuccessCount -eq $TotalCount) {
    Write-Host ""
    Write-Host "🎉 Todas as edge functions estão funcionando!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Blue
    Write-Host "1. Execute o script SQL: setup-cron-top-eventos.sql" -ForegroundColor White
    Write-Host "2. Verifique o dashboard para confirmar dados" -ForegroundColor White
    Write-Host "3. Monitore os logs das edge functions" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  Algumas edge functions falharam. Verifique:" -ForegroundColor Yellow
    Write-Host "1. Se as funções foram deployadas corretamente" -ForegroundColor White
    Write-Host "2. Se as tabelas de destino existem" -ForegroundColor White
    Write-Host "3. Se as variáveis de ambiente estão configuradas" -ForegroundColor White
    Write-Host "4. Os logs das edge functions no dashboard" -ForegroundColor White
}

Write-Host ""
Write-Host "🔗 Dashboard do Supabase:" -ForegroundColor Cyan
Write-Host "https://supabase.com/dashboard/project/$ProjectRef" -ForegroundColor White
Write-Host ""
Write-Host "📝 Logs das Edge Functions:" -ForegroundColor Cyan
Write-Host "https://supabase.com/dashboard/project/$ProjectRef/functions" -ForegroundColor White
