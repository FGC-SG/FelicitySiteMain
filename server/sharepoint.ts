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
 * Upload a file to SharePoint
 * @param fileName - Name of the file to upload
 * @param fileBuffer - File content as Buffer
 * @param siteId - SharePoint site ID (optional, uses default site if not provided)
 * @param folderPath - Path to folder in SharePoint (e.g., 'Shared Documents/Backups')
 */
export async function uploadToSharePoint(
  fileName: string,
  fileBuffer: Buffer,
  folderPath: string = 'Shared Documents/DatabaseBackups'
): Promise<{ success: boolean; webUrl?: string; error?: string }> {
  try {
    const client = await getUncachableSharePointClient();
    
    // Get the default site (root site)
    const sites = await client.api('/sites?search=*').get();
    
    if (!sites.value || sites.value.length === 0) {
      throw new Error('No SharePoint sites found');
    }
    
    const siteId = sites.value[0].id;
    
    // Create folder path if it doesn't exist
    const folderParts = folderPath.split('/').filter(p => p);
    let currentPath = '/drive/root';
    
    for (const folderName of folderParts) {
      try {
        // Try to get the folder
        await client.api(`${currentPath}:/${folderName}`).get();
        currentPath = `${currentPath}:/${folderName}`;
      } catch (error) {
        // Folder doesn't exist, create it
        await client.api(`${currentPath}/children`).post({
          name: folderName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        });
        currentPath = `${currentPath}:/${folderName}`;
      }
    }
    
    // Upload the file
    const uploadPath = `${currentPath}:/${fileName}:/content`;
    const response = await client
      .api(`/sites/${siteId}${uploadPath}`)
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
