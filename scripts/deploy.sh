#!/bin/bash

# Meeting Auction Platform Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Check if environment variables are set
check_env_vars() {
    required_vars=(
        "DATABASE_URL"
        "REDIS_URL" 
        "ETH_WSS_ENDPOINT"
        "ZOOM_API_KEY"
        "ZOOM_API_SECRET"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            echo "❌ Error: $var environment variable is not set"
            exit 1
        fi
    done
    
    echo "✅ Environment variables validated"
}

# Build and deploy smart contracts
deploy_contracts() {
    echo "📄 Deploying smart contracts..."
    
    cd contracts
    npm install
    npx hardhat compile
    
    if [[ "$NETWORK" == "mainnet" ]]; then
        npx hardhat run scripts/deploy.js --network mainnet
    else
        npx hardhat run scripts/deploy.js --network sepolia
    fi
    
    cd ..
    echo "✅ Smart contracts deployed"
}

# Setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    # Run database migrations
    cd backend
    npm run migrate
    
    cd ..
    echo "✅ Database setup complete"
}

# Build and deploy backend
deploy_backend() {
    echo "⚙️ Building backend..."
    
    cd backend
    npm install --production
    npm run build
    
    # Start backend service
    pm2 start ecosystem.config.js --env production
    
    cd ..
    echo "✅ Backend deployed"
}

# Build and deploy frontend
deploy_frontend() {
    echo "🌐 Building frontend..."
    
    cd frontend
    npm install
    npm run build
    
    # Deploy to CDN or web server
    if [[ -n "$CDN_DEPLOY_COMMAND" ]]; then
        eval "$CDN_DEPLOY_COMMAND"
    fi
    
    cd ..
    echo "✅ Frontend deployed"
}

# Health check
health_check() {
    echo "🏥 Running health checks..."
    
    # Check backend health
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    if [[ "$response" != "200" ]]; then
        echo "❌ Backend health check failed"
        exit 1
    fi
    
    # Check database connection
    cd backend && npm run test:db && cd ..
    
    echo "✅ All health checks passed"
}

# Main deployment flow
main() {
    echo "🎯 Deploying Meeting Auction Platform"
    echo "Environment: ${NODE_ENV:-development}"
    echo "Network: ${NETWORK:-sepolia}"
    
    check_env_vars
    deploy_contracts
    setup_database
    deploy_backend
    deploy_frontend
    health_check
    
    echo "🎉 Deployment completed successfully!"
    echo "Frontend: ${FRONTEND_URL}"
    echo "Backend: ${API_URL}"
    echo "Contract: ${AUCTION_CONTRACT_ADDRESS}"
}

# Run deployment
main "$@"
