# Google Drive Integration Setup

This guide explains how to set up Google Drive integration for the Photo Flip tool.

## Prerequisites

1. A Google Cloud Platform account
2. Python dependencies installed: `pip install -r requirements.txt`

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `anamalia-photo-flip`
   - Description: `Service account for Photo Flip Google Drive integration`
4. Click "Create and Continue"
5. Skip role assignment for now (click "Continue")
6. Click "Done"

### 3. Generate Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the JSON file
7. Rename it to `gdrive_credentials.json`
8. Place it in the project root directory

### 4. Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder called "PhotoFlip" (or any name you prefer)
3. Right-click on the folder and select "Share"
4. Add your service account email (from step 2) as a collaborator with "Editor" permissions
5. Copy the folder ID from the URL (the long string after `/folders/`)

### 5. Configure the Application

1. Edit `config/gdrive_config.json`:
   ```json
   {
     "service_account_email": "your-service-account@your-project.iam.gserviceaccount.com",
     "credentials_file": "gdrive_credentials.json",
     "target_folder_id": "your-photoflip-folder-id",
     "folder_name": "PhotoFlip",
     "max_file_size_mb": 10,
     "allowed_mime_types": [
       "image/jpeg",
       "image/png", 
       "image/gif",
       "image/webp",
       "image/bmp",
       "image/tiff"
     ]
   }
   ```

2. Replace the placeholder values:
   - `service_account_email`: From your service account JSON file
   - `target_folder_id`: The folder ID from step 4

### 6. Set Up Google Drive Picker (Optional)

For the import functionality, you may need to set up the Google Drive Picker API:

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. In `webviewer/photo_flip.html`, find the line with `this.apiKey = null;` and replace with your API key

## Testing the Integration

1. Start the Photo Flip API server:
   ```bash
   python scripts/photo_flip_api.py
   ```

2. Start the web server:
   ```bash
   python scripts/serve.py
   ```

3. Open the Photo Flip tool in your browser:
   ```
   http://localhost:8080/webviewer/photo_flip.html
   ```

4. Test the functionality:
   - Upload an image and flip it
   - Click "Export to Google Drive" to upload the flipped image
   - Click "Import from Google Drive" to browse and import images

## Troubleshooting

### Common Issues

1. **"Google Drive API not available" error**
   - Make sure you've installed the required Python packages: `pip install -r requirements.txt`

2. **"Credentials file not found" error**
   - Ensure `gdrive_credentials.json` is in the project root directory
   - Check that the filename matches what's in `gdrive_config.json`

3. **"Target folder not found" error**
   - Verify the folder ID in `gdrive_config.json`
   - Make sure the service account has access to the folder

4. **Import picker not working**
   - Check that the Google Drive Picker API is enabled in your Google Cloud project
   - Verify the API key is correctly set in the HTML file

### Security Notes

- Never commit `gdrive_credentials.json` to version control
- The service account should only have access to the specific folder needed
- Consider using environment variables for sensitive configuration in production

## File Structure

After setup, your project should have:
```
anamalia_prompt_pipeline/
├── config/
│   └── gdrive_config.json
├── gdrive_credentials.json  # (not in version control)
├── scripts/
│   └── photo_flip_api.py    # (updated with Google Drive endpoints)
└── webviewer/
    └── photo_flip.html      # (updated with Google Drive buttons)
```
