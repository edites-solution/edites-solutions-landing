# Windows File Upload to Lightsail

## Your Setup
- **Local files**: `C:\Repos\edites-solutions-landing-main\`
- **Lightsail IP**: `44.204.243.42`
- **Domain**: `editessolutions.com`

---

## 🚀 Method 1: Lightsail Browser-Based File Manager (Easiest)

### Step 1: Access File Manager
1. Go to [Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click on your instance: `edites-website`
3. Click the **"Connect using SSH"** button
4. In the browser terminal, click the **"File Manager"** tab

### Step 2: Upload Files
1. **Navigate to upload directory**:
   ```bash
   cd /tmp
   ```

2. **Upload files using the file manager**:
   - Click "Upload" button in file manager
   - Select `index.html` from `C:\Repos\edites-solutions-landing-main\`
   - Upload the entire `images` folder

3. **Move files to web directory**:
   ```bash
   sudo cp /tmp/index.html /var/www/html/
   sudo cp -r /tmp/images /var/www/html/
   sudo chown -R www-data:www-data /var/www/html/
   sudo chmod -R 755 /var/www/html/
   ```

---

## 🚀 Method 2: WinSCP (Recommended for Larger Files)

### Step 1: Download WinSCP
- Download from: https://winscp.net/eng/download.php
- Install on your Windows machine

### Step 2: Download Lightsail SSH Key
1. In Lightsail Console, go to **Account** → **SSH Keys**
2. Download the default key (e.g., `LightsailDefaultKey-us-east-1.pem`)
3. Save to `C:\Users\YourName\Downloads\`

### Step 3: Connect with WinSCP
1. **Open WinSCP**
2. **Create new session**:
   - **File protocol**: SFTP
   - **Host name**: `44.204.243.42`
   - **Port**: 22
   - **User name**: `ubuntu`
   - **Private key**: Browse to your `.pem` file

3. **Convert key if needed**: WinSCP will offer to convert .pem to .ppk
4. **Connect**

### Step 4: Upload Files
1. **Navigate to `/tmp` on the server side**
2. **Drag and drop from Windows**:
   - `C:\Repos\edites-solutions-landing-main\index.html` → `/tmp/`
   - `C:\Repos\edites-solutions-landing-main\images\` → `/tmp/`

3. **Move files via SSH terminal**:
   ```bash
   sudo cp /tmp/index.html /var/www/html/
   sudo cp -r /tmp/images /var/www/html/
   sudo chown -R www-data:www-data /var/www/html/
   sudo chmod -R 755 /var/www/html/
   ```

---

## 🚀 Method 3: PowerShell with SCP

### Step 1: Install OpenSSH Client
Windows 10/11 has this built-in. Open PowerShell as Administrator:

```powershell
# Check if OpenSSH is available
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

# Install if needed
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### Step 2: Upload Files
```powershell
# Navigate to your files
cd "C:\Repos\edites-solutions-landing-main"

# Upload index.html
scp -i "C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem" index.html ubuntu@44.204.243.42:/tmp/

# Upload images folder
scp -i "C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem" -r images ubuntu@44.204.243.42:/tmp/
```

### Step 3: Move Files (SSH into server)
```bash
ssh -i "C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem" ubuntu@44.204.243.42

# Once connected, move files
sudo cp /tmp/index.html /var/www/html/
sudo cp -r /tmp/images /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

---

## 🔧 Configure Nginx for Your Domain

### Step 1: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/editessolutions
```

### Step 2: Add Configuration
```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name editessolutions.com www.editessolutions.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript text/javascript application/json;
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 3: Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/editessolutions /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 Test Your Website

### Step 1: Test with IP Address
```bash
# From your Windows machine
curl -I http://44.204.243.42
```

Or open in browser: `http://44.204.243.42`

### Step 2: Check File Structure
```bash
# SSH into server and check
ls -la /var/www/html/
```

Should show:
```
index.html
images/
```

---

## 🌐 Next Steps After Upload

### 1. Create DNS Records
Follow **DNS-SETUP.md** to create A records pointing to `44.204.243.42`

### 2. Test Domain (after DNS propagation)
- `http://editessolutions.com`
- `http://www.editessolutions.com`

### 3. Set Up SSL Certificate
```bash
sudo certbot --nginx -d editessolutions.com -d www.editessolutions.com
```

### 4. Update Contact Form API
Edit `/var/www/html/index.html` and update:
```javascript
const CONFIG = {
    CONTACT_API_URL: 'https://your-lambda-api-url/Prod/contact',
    USE_SIMULATION: false
};
```

---

## 🐛 Troubleshooting

### Permission Issues
```bash
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### Nginx Not Starting
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Files Not Found
```bash
ls -la /var/www/html/
sudo systemctl reload nginx
```

### SSH Key Issues
- Ensure key file has correct permissions: `chmod 400 keyfile.pem`
- Use full path to key file
- Make sure you're using the `ubuntu` user

---

## ✅ Upload Checklist

- [ ] Files uploaded to Lightsail
- [ ] Files moved to `/var/www/html/`
- [ ] Correct permissions set
- [ ] Nginx configured for domain
- [ ] Website loads at IP address
- [ ] DNS A records created
- [ ] Domain resolves to IP
- [ ] SSL certificate installed
- [ ] Contact form API configured

🚀 **Your website will be live once all steps are complete!**