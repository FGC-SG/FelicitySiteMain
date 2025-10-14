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
 * @param folderPath - Path to folder in SharePoint (e.g., 'Shared Documents/DatabaseBackups')
 */
export async function uploadToSharePoint(
  fileName: string,
  fileBuffer: Buffer,
  folderPath: string = 'DatabaseBackups'
): Promise<{ success: boolean; webUrl?: string; error?: string }> {
  try {
    const client = await getUncachableSharePointClient();
    
    // Target specific SharePoint site: fgcsg.sharepoint.com/sites/FGCSite
    const hostname = 'fgcsg.sharepoint.com';
    const sitePath = '/sites/FGCSite';
    
    console.log(`Accessing SharePoint site: ${hostname}${sitePath}`);
    
    // Get the site
    let site;
    try {
      site = await client.api(`/sites/${hostname}:${sitePath}`).get();
      console.log('SharePoint site found:', site.id);
    } catch (error) {
      console.error('Error accessing SharePoint site:', error);
      throw new Error('Unable to access SharePoint site. Please check permissions.');
    }
    
    // Get the default document library (drive)
    const drives = await client.api(`/sites/${site.id}/drives`).get();
    
    if (!drives.value || drives.value.length === 0) {
      throw new Error('No document library found in SharePoint site');
    }
    
    const driveId = drives.value[0].id;
    console.log('Using drive:', driveId);
    
    // Create folder path if it doesn't exist
    const folderParts = folderPath.split('/').filter(p => p);
    let currentFolderId = 'root';
    
    for (const folderName of folderParts) {
      try {
        // Try to get the folder
        const folder = await client
          .api(`/sites/${site.id}/drives/${driveId}/items/${currentFolderId}/children`)
          .filter(`name eq '${folderName}'`)
          .get();
        
        if (folder.value && folder.value.length > 0) {
          currentFolderId = folder.value[0].id;
          console.log(`Found existing folder: ${folderName}`);
        } else {
          // Create the folder
          const newFolder = await client
            .api(`/sites/${site.id}/drives/${driveId}/items/${currentFolderId}/children`)
            .post({
              name: folderName,
              folder: {},
              '@microsoft.graph.conflictBehavior': 'rename'
            });
          currentFolderId = newFolder.id;
          console.log(`Created new folder: ${folderName}`);
        }
      } catch (error) {
        console.error(`Error with folder ${folderName}:`, error);
        // Try to create it anyway
        try {
          const newFolder = await client
            .api(`/sites/${site.id}/drives/${driveId}/items/${currentFolderId}/children`)
            .post({
              name: folderName,
              folder: {},
              '@microsoft.graph.conflictBehavior': 'rename'
            });
          currentFolderId = newFolder.id;
          console.log(`Created new folder: ${folderName}`);
        } catch (createError) {
          console.error('Failed to create folder:', createError);
          throw createError;
        }
      }
    }
    
    // Upload the file
    console.log(`Uploading file ${fileName} to folder ${currentFolderId}`);
    const response = await client
      .api(`/sites/${site.id}/drives/${driveId}/items/${currentFolderId}:/${fileName}:/content`)
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
