# 🚀 Oracle Cloud Free Tier Deployment Guide

Complete guide to deploy your DevOps Notes app on Oracle Cloud Free Tier.

## 🎯 What You Get (Free Forever)

- **2 AMD VMs** + **4 ARM VMs** (24GB RAM total)
- **200GB storage**
- **10TB bandwidth/month**
- **No credit card required** for basic tier
- **Full VM control** (like having your own server)

## 📋 Prerequisites

- Email address
- Basic terminal knowledge
- No credit card required

## 🖥️ Step 1: Create Oracle Cloud Account

1. Go to [cloud.oracle.com](https://cloud.oracle.com)
2. Click **"Start for free"**
3. Fill out the form:
   - Email address
   - Country
   - Name
   - Company (can be personal)
4. Choose your region (pick closest to you)
5. Create password
6. Verify your email

## 🖥️ Step 2: Create VM Instance

1. **Login to Oracle Cloud Console**
2. **Click "Create VM instance"**
3. **Configure your instance**:

```bash
# Instance Details
Name: devops-notes-server
Image: Canonical Ubuntu 22.04
Shape: VM.Standard.A1.Flex (ARM-based, free)
Memory: 6 GB
OCPUs: 1

# Network
VCN: Create new VCN
Subnet: Create new subnet
Public IP: Yes

# SSH Key
Generate SSH key pair (save the private key!)
```

4. **Click "Create"**

## 🔑 Step 3: Connect to Your Server

1. **Wait for instance to be running** (green status)
2. **Copy the public IP address**
3. **Connect via SSH**:

```bash
# On your local machine
ssh ubuntu@YOUR_PUBLIC_IP
```

## 🐳 Step 4: Install Docker and Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Logout and login again, or run:
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

## 📁 Step 5: Create App Directory

```bash
# Create app directory
mkdir -p ~/devops-notes
cd ~/devops-notes

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  devops-notes:
    image: ghcr.io/harrygamon/electron-devops-notes:latest
    container_name: devops-notes
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - BASIC_AUTH_USERNAME=admin
      - BASIC_AUTH_PASSWORD=your_secure_password_here
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  default:
    name: devops-notes-network
EOF

# Create data directory
mkdir -p data
```

## 🔐 Step 6: Setup Basic Auth

```bash
# Install htpasswd utility
sudo apt install apache2-utils -y

# Create .htpasswd file (replace with your desired username/password)
htpasswd -c .htpasswd admin
# Enter your password when prompted

# Set proper permissions
chmod 600 .htpasswd
```

## 🚀 Step 7: Deploy Your App

```bash
# Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull the latest image
docker pull ghcr.io/harrygamon/electron-devops-notes:latest

# Start the application
docker-compose up -d

# Check if it's running
docker-compose ps
docker-compose logs -f
```

## 🌐 Step 8: Access Your App

1. **Open your browser**
2. **Go to**: `http://YOUR_PUBLIC_IP`
3. **Login with**: 
   - Username: `admin`
   - Password: (what you set in htpasswd)

## 🔧 Step 9: Setup Automatic Updates

```bash
# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
cd ~/devops-notes
docker-compose pull
docker-compose up -d
echo "App updated at $(date)"
EOF

chmod +x update.sh

# Add to crontab for daily updates
(crontab -l 2>/dev/null; echo "0 2 * * * ~/devops-notes/update.sh") | crontab -
```

## 🛡️ Step 10: Security Setup

```bash
# Setup firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📊 Step 11: Monitoring Commands

```bash
# Check app status
docker-compose ps

# View logs
docker-compose logs -f

# Check system resources
htop
df -h
free -h

# Check Docker resources
docker system df
docker stats
```

## 🔄 Step 12: Update Process

When you push code to GitHub:

1. **GitHub Actions** builds and pushes new Docker image
2. **On your Oracle Cloud VM**:

```bash
# SSH to your server
ssh ubuntu@YOUR_PUBLIC_IP

# Update the app
cd ~/devops-notes
docker-compose pull
docker-compose up -d

# Check status
docker-compose ps
```

## 🛠️ Troubleshooting

### App Not Starting
```bash
# Check logs
docker-compose logs -f

# Check if port 80 is available
sudo netstat -tlnp | grep :80

# Restart the container
docker-compose restart
```

### Can't Access from Browser
```bash
# Check if app is running
docker-compose ps

# Check if port is open
sudo ufw status

# Check Oracle Cloud security lists
# Go to VCN → Security Lists → Ingress Rules
# Ensure port 80 is open
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Clean up logs
sudo journalctl --vacuum-time=7d
```

## 💰 Cost Management

Oracle Cloud Free Tier includes:
- **Always Free**: 2 AMD VMs + 4 ARM VMs
- **Storage**: 200GB total
- **Bandwidth**: 10TB/month
- **No time limits**

**Monitor usage** in Oracle Cloud Console → Billing → Cost Analysis

## 🎉 Success!

Your DevOps Notes app is now running on Oracle Cloud Free Tier!

- **URL**: `http://YOUR_PUBLIC_IP`
- **Username**: `admin`
- **Password**: (what you set)
- **Cost**: $0/month (forever)

## 📞 Support

- **Oracle Cloud Docs**: [docs.oracle.com](https://docs.oracle.com)
- **Oracle Cloud Support**: Available in console
- **GitHub Issues**: For app-specific issues

---

**Happy Deploying! 🚀** 