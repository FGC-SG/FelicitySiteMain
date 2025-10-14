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
    
    // Try using share link approach first (for folders shared via link)
    // Share link: https://fgcsg.sharepoint.com/:f:/s/FGCSite/El1uC3iknfNDi5IltTfgjlEB6DNKbQ07azNwCV2XF3FSZw
    const shareUrl = 'https://fgcsg.sharepoint.com/:f:/s/FGCSite/El1uC3iknfNDi5IltTfgjlEB6DNKbQ07azNwCV2XF3FSZw';
    
    console.log('Attempting to access SharePoint folder via share link...');
    
    let driveId, itemId;
    
    try {
      // Encode the share URL for Graph API
      const encodedUrl = Buffer.from(shareUrl).toString('base64')
        .replace(/=/g, '')
        .replace(/\//g, '_')
        .replace(/\+/g, '-');
      
      console.log('Accessing shared folder with encoded URL...');
      
      // Access the shared item
      const sharedItem = await client.api(`/shares/u!${encodedUrl}/driveItem`).get();
      console.log('Shared item accessed:', sharedItem.id);
      
      driveId = sharedItem.parentReference?.driveId;
      itemId = sharedItem.id;
      
      console.log('Using drive from share link:', driveId);
      console.log('Using folder ID from share link:', itemId);
      
    } catch (shareError) {
      console.error('Error accessing via share link:', shareError);
      
      // Fallback to direct site access
      console.log('Falling back to direct site access...');
      
      const hostname = 'fgcsg.sharepoint.com';
      const sitePath = '/sites/FGCSite';
      
      console.log(`Accessing SharePoint site: ${hostname}${sitePath}`);
      
      let site;
      try {
        site = await client.api(`/sites/${hostname}:${sitePath}`).get();
        console.log('SharePoint site found:', site.id);
      } catch (error) {
        console.error('Error accessing SharePoint site:', error);
        throw new Error('Unable to access SharePoint site. Please check permissions.');
      }
      
      // Get the default document library (drive)
      try {
        // Try to get drives from the site
        const drives = await client.api(`/sites/${site.id}/drives`).get();
        console.log('Drives response:', JSON.stringify(drives, null, 2));
        
        if (drives.value && drives.value.length > 0) {
          driveId = drives.value[0].id;
          itemId = 'root';
          console.log('Using drive from drives list:', driveId);
        } else {
          // Try to get the default document library directly
          console.log('No drives found, trying default drive...');
          const defaultDrive = await client.api(`/sites/${site.id}/drive`).get();
          driveId = defaultDrive.id;
          itemId = 'root';
          console.log('Using default drive:', driveId);
        }
      } catch (driveError) {
        console.error('Error getting drives:', driveError);
        throw new Error(`Unable to access document library: ${driveError instanceof Error ? driveError.message : 'Unknown error'}`);
      }
    }
    
    if (!driveId) {
      throw new Error('No document library found in SharePoint site');
    }
    
    // Use itemId if available from share link, otherwise use 'root'
    let currentFolderId = itemId || 'root';
    
    // Create folder path if it doesn't exist (skip if we already have the target folder from share link)
    const folderParts = folderPath.split('/').filter(p => p);
    
    // If we got itemId from share link, we're already in the target folder, so skip folder creation
    if (!itemId && folderParts.length > 0) {
      for (const folderName of folderParts) {
        try {
          // Try to get the folder
          const folder = await client
            .api(`/drives/${driveId}/items/${currentFolderId}/children`)
            .filter(`name eq '${folderName}'`)
            .get();
          
          if (folder.value && folder.value.length > 0) {
            currentFolderId = folder.value[0].id;
            console.log(`Found existing folder: ${folderName}`);
          } else {
            // Create the folder
            const newFolder = await client
              .api(`/drives/${driveId}/items/${currentFolderId}/children`)
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
              .api(`/drives/${driveId}/items/${currentFolderId}/children`)
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
    }
    
    // Upload the file
    console.log(`Uploading file ${fileName} to folder ${currentFolderId}`);
    const response = await client
      .api(`/drives/${driveId}/items/${currentFolderId}:/${fileName}:/content`)
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
