import { Client } from '@microsoft/microsoft-graph-client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sharepoint',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('SharePoint not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSharePointClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

/**
 * Upload a file to SharePoint using the shared folder URL
 * @param fileName - Name of the file to upload
 * @param fileBuffer - File content as Buffer
 */
export async function uploadToSharePoint(
  fileName: string,
  fileBuffer: Buffer
): Promise<{ success: boolean; webUrl?: string; error?: string }> {
  try {
    const client = await getUncachableSharePointClient();
    
    // Use the specific SharePoint folder URL provided by the user
    const folderShareUrl = 'https://fgcsg.sharepoint.com/:f:/s/FGCSG-Article63/EgpfPw-lkGBLvN--GuLGbGYBITTkyaaU8jCebcc2taQuoA?e=XQtAA3';
    
    console.log('Resolving SharePoint folder from shared URL...');
    
    // Convert the share URL to a base64url-encoded share ID
    const shareId = 'u!' + Buffer.from(folderShareUrl)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    
    console.log('Share ID:', shareId);
    
    // Get the folder item from the share link
    let folderItem;
    try {
      folderItem = await client.api(`/shares/${shareId}/driveItem`).get();
      console.log('Folder resolved:', {
        id: folderItem.id,
        name: folderItem.name,
        driveId: folderItem.parentReference?.driveId
      });
    } catch (error) {
      console.error('Error resolving shared folder:', error);
      
      // Fallback: Try using the default drive approach
      console.log('Attempting fallback to default drive...');
      const hostname = 'fgcsg.sharepoint.com';
      const sitePath = '/sites/FGCSG-Article63';
      
      const site = await client.api(`/sites/${hostname}:${sitePath}`).get();
      console.log('Site found:', site.id);
      
      // Use the default document library
      const drive = await client.api(`/sites/${site.id}/drive`).get();
      console.log('Default drive found:', drive.id);
      
      // Upload to root:/DatabaseBackups/ folder
      const uploadPath = `/sites/${site.id}/drive/root:/DatabaseBackups/${fileName}:/content`;
      console.log('Uploading to:', uploadPath);
      
      const response = await client
        .api(uploadPath)
        .put(fileBuffer);
      
      console.log('File uploaded to SharePoint (fallback):', response.webUrl);
      
      return {
        success: true,
        webUrl: response.webUrl
      };
    }
    
    // Upload directly to the resolved folder
    const driveId = folderItem.parentReference?.driveId;
    const folderId = folderItem.id;
    
    if (!driveId || !folderId) {
      throw new Error('Could not determine drive or folder ID from shared link');
    }
    
    console.log(`Uploading ${fileName} to drive ${driveId}, folder ${folderId}`);
    
    const uploadPath = `/drives/${driveId}/items/${folderId}:/${fileName}:/content`;
    const response = await client
      .api(uploadPath)
      .put(fileBuffer);
    
    console.log('File uploaded to SharePoint successfully:', response.webUrl);
    
    return {
      success: true,
      webUrl: response.webUrl
    };
  } catch (error) {
    console.error('Error uploading to SharePoint:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
