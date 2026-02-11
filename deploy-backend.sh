#!/bin/bash
# 🚀 Script de Deploy Simples - Backend Only

echo "🔄 Atualizando código..."
git pull

echo "🛑 Parando containers antigos..."
docker-compose -f docker-compose.backend.yml down

echo "🏗️  Construindo nova versão..."
docker-compose -f docker-compose.backend.yml build --no-cache

echo "🚀 Iniciando backend..."
docker-compose -f docker-compose.backend.yml up -d

echo ""
echo "✅ Deploy completo!"
echo ""
echo "📊 Status dos containers:"
docker-compose -f docker-compose.backend.yml ps
echo ""
echo "📝 Ver logs: docker-compose -f docker-compose.backend.yml logs -f"
echo "🌐 Backend: https://backend.prosperitylake.club"
