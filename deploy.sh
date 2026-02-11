#!/bin/bash
# 🚀 Script de Deploy Simples para Kamatera

echo "🔄 Atualizando código..."
git pull

echo "🛑 Parando containers antigos..."
docker-compose down

echo "🏗️  Construindo nova versão..."
docker-compose build --no-cache

echo "🚀 Iniciando aplicação..."
docker-compose up -d

echo ""
echo "✅ Deploy completo!"
echo ""
echo "📊 Status dos containers:"
docker-compose ps
echo ""
echo "📝 Ver logs: docker-compose logs -f"
echo "🌐 Acessar: http://$(hostname -I | awk '{print $1}'):3000"
